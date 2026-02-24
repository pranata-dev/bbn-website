import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { WHATSAPP_REGEX } from "@/constants"

const ACCEPTED_TYPES = ["REGULAR", "UTS"] as const
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
const MAX_FILE_SIZE = 5 * 1024 * 1024

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()

        // Extract common fields
        const type = formData.get("type") as string
        const name = formData.get("name") as string
        const nim = formData.get("nim") as string
        const subject = formData.get("subject") as string
        const whatsapp = formData.get("whatsapp") as string
        const paymentProof = formData.get("paymentProof") as File

        // Validate type
        if (!type || !ACCEPTED_TYPES.includes(type as typeof ACCEPTED_TYPES[number])) {
            return NextResponse.json(
                { error: "Tipe registrasi tidak valid." },
                { status: 400 }
            )
        }

        // Validate required common fields
        if (!name || name.length < 3) {
            return NextResponse.json(
                { error: "Nama minimal 3 karakter." },
                { status: 400 }
            )
        }

        if (!nim || nim.length < 5) {
            return NextResponse.json(
                { error: "NIM minimal 5 karakter." },
                { status: 400 }
            )
        }

        if (!subject) {
            return NextResponse.json(
                { error: "Pilih mata kuliah." },
                { status: 400 }
            )
        }

        if (!whatsapp || !WHATSAPP_REGEX.test(whatsapp)) {
            return NextResponse.json(
                { error: "Format nomor WhatsApp tidak valid." },
                { status: 400 }
            )
        }

        // Validate file
        if (!paymentProof || !(paymentProof instanceof File)) {
            return NextResponse.json(
                { error: "Mohon unggah bukti pembayaran." },
                { status: 400 }
            )
        }

        if (!ACCEPTED_FILE_TYPES.includes(paymentProof.type)) {
            return NextResponse.json(
                { error: "Format file tidak didukung. Gunakan JPG, PNG, atau WebP." },
                { status: 400 }
            )
        }

        if (paymentProof.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: "Ukuran file maksimal 5MB." },
                { status: 400 }
            )
        }

        // Validate type-specific fields
        if (type === "REGULAR") {
            const groupSize = parseInt(formData.get("groupSize") as string)
            const sessionCount = parseInt(formData.get("sessionCount") as string)
            const scheduledDate = formData.get("scheduledDate") as string
            const scheduledTime = formData.get("scheduledTime") as string

            if (!groupSize || groupSize < 1) {
                return NextResponse.json({ error: "Jumlah orang minimal 1." }, { status: 400 })
            }
            if (!sessionCount || sessionCount < 1) {
                return NextResponse.json({ error: "Jumlah pertemuan minimal 1." }, { status: 400 })
            }
            if (!scheduledDate) {
                return NextResponse.json({ error: "Pilih tanggal kelas." }, { status: 400 })
            }
            if (!scheduledTime) {
                return NextResponse.json({ error: "Pilih waktu kelas." }, { status: 400 })
            }
        }

        if (type === "UTS") {
            const packageType = formData.get("packageType") as string
            if (!packageType) {
                return NextResponse.json({ error: "Pilih tipe paket." }, { status: 400 })
            }
        }

        const supabase = await createAdminClient()

        // Check for duplicate submission (same NIM + type within last 24h)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        const { data: existing } = await supabase
            .from("registrations")
            .select("id")
            .eq("nim", nim)
            .eq("type", type)
            .eq("status", "PENDING")
            .gte("created_at", oneDayAgo)
            .maybeSingle()

        if (existing) {
            return NextResponse.json(
                { error: "Kamu sudah memiliki pendaftaran yang sedang diproses. Mohon tunggu verifikasi admin." },
                { status: 409 }
            )
        }

        // Upload payment proof
        const fileExt = paymentProof.name.split(".").pop()
        const fileName = `registrations/${Date.now()}-${nim}.${fileExt}`
        const { error: uploadError } = await supabase.storage
            .from("payment-proofs")
            .upload(fileName, paymentProof, {
                cacheControl: "3600",
                upsert: false,
            })

        if (uploadError) {
            console.error("Upload error:", uploadError)
            return NextResponse.json(
                { error: "Gagal mengunggah bukti pembayaran." },
                { status: 500 }
            )
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from("payment-proofs")
            .getPublicUrl(fileName)

        // Insert into registrations table
        const { data: registration, error: regError } = await supabase
            .from("registrations")
            .insert({
                type,
                name,
                nim,
                subject,
                whatsapp,
                payment_proof_url: publicUrl,
                status: "PENDING",
            })
            .select()
            .single()

        if (regError) {
            console.error("Registration insert error:", regError)
            return NextResponse.json(
                { error: "Gagal menyimpan data pendaftaran." },
                { status: 500 }
            )
        }

        // Insert type-specific details
        if (type === "REGULAR") {
            const notes = (formData.get("notes") as string) || ""
            const { error: detailError } = await supabase
                .from("regular_class_details")
                .insert({
                    registration_id: registration.id,
                    group_size: parseInt(formData.get("groupSize") as string),
                    session_count: parseInt(formData.get("sessionCount") as string),
                    scheduled_date: formData.get("scheduledDate") as string,
                    scheduled_time: formData.get("scheduledTime") as string,
                    notes,
                })

            if (detailError) {
                console.error("Regular detail insert error:", detailError)
                // Clean up registration on failure
                await supabase.from("registrations").delete().eq("id", registration.id)
                return NextResponse.json(
                    { error: "Gagal menyimpan detail kelas." },
                    { status: 500 }
                )
            }
        }

        if (type === "UTS") {
            const { error: detailError } = await supabase
                .from("uts_package_details")
                .insert({
                    registration_id: registration.id,
                    package_type: formData.get("packageType") as string,
                })

            if (detailError) {
                console.error("UTS detail insert error:", detailError)
                await supabase.from("registrations").delete().eq("id", registration.id)
                return NextResponse.json(
                    { error: "Gagal menyimpan detail paket." },
                    { status: 500 }
                )
            }
        }

        return NextResponse.json(
            { message: "Pendaftaran berhasil. Menunggu verifikasi admin.", id: registration.id },
            { status: 201 }
        )
    } catch (error) {
        console.error("Registration error:", error)
        return NextResponse.json(
            { error: "Terjadi kesalahan internal." },
            { status: 500 }
        )
    }
}
