import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { WHATSAPP_REGEX, UTS_PACKAGES } from "@/constants"
import { checkRateLimit } from "@/lib/rate-limit"
import { calculatePrice } from "@/lib/pricing"

const ACCEPTED_TYPES = ["REGULAR", "UTS"] as const
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
const MAX_FILE_SIZE = 5 * 1024 * 1024

export async function POST(request: NextRequest) {
    // Check rate limit
    const rateLimitResponse = checkRateLimit(request)
    if (rateLimitResponse) return rateLimitResponse

    try {
        const formData = await request.formData()

        // Extract common fields
        const type = (formData.get("type") as string || "").trim()
        const name = (formData.get("name") as string || "").trim()
        const email = (formData.get("email") as string || "").trim()
        const password = (formData.get("password") as string || "").trim()
        const nim = (formData.get("nim") as string || "").trim()
        const subject = (formData.get("subject") as string || "").trim()
        const whatsapp = (formData.get("whatsapp") as string || "").trim()
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

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json(
                { error: "Email tidak valid." },
                { status: 400 }
            )
        }

        if (!password || password.length < 6) {
            return NextResponse.json(
                { error: "Password minimal 6 karakter." },
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
            if (groupSize > 20) {
                return NextResponse.json({ error: "Jumlah orang maksimal 20." }, { status: 400 })
            }
            if (!sessionCount || sessionCount < 1) {
                return NextResponse.json({ error: "Jumlah pertemuan minimal 1." }, { status: 400 })
            }
            if (sessionCount > 30) {
                return NextResponse.json({ error: "Jumlah pertemuan maksimal 30." }, { status: 400 })
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

        const supabase = createServiceClient()

        // Check for duplicate submission (same email or NIM + type within last 24h)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        const { data: existingReg } = await supabase
            .from("registrations")
            .select("id")
            .or(`email.eq.${email},and(nim.eq.${nim},type.eq.${type},status.eq.PENDING,created_at.gte.${oneDayAgo})`)
            .maybeSingle()

        if (existingReg) {
            return NextResponse.json(
                { error: "Email sudah digunakan atau kamu sudah memiliki pendaftaran yang sedang diproses." },
                { status: 409 }
            )
        }

        // Check if user account already exists for this email
        const { data: existingUser } = await supabase
            .from("users")
            .select("id")
            .eq("email", email)
            .maybeSingle()

        if (existingUser) {
            return NextResponse.json(
                { error: "Email ini sudah memiliki akun di sistem. Harap gunakan email lain atau hubungi Admin." },
                { status: 409 }
            )
        }

        // 1. Create Supabase Auth User with password
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto-confirm for now until we implement email verification
        })

        if (authError) {
            console.error("Auth creation error:", authError)
            return NextResponse.json(
                {
                    error: authError.message.includes("already registered")
                        ? "Email sudah terdaftar di sistem otentikasi. Silakan gunakan email lain."
                        : "Gagal membuat identitas pengguna."
                },
                { status: 400 }
            )
        }

        // Keep the auth ID for rollback if necessary
        const newAuthId = authData.user.id

        // 2. Insert into local users table
        const localUserId = crypto.randomUUID()
        const { error: userInsertError } = await supabase
            .from("users")
            .insert({
                id: localUserId,
                email,
                name,
                role: "STUDENT_BASIC",
                is_active: type === "REGULAR",
                auth_id: newAuthId,
                updated_at: new Date().toISOString(),
            })

        if (userInsertError) {
            console.error("Local user insert error:", userInsertError)
            // ROLLBACK: Delete auth user
            await supabase.auth.admin.deleteUser(newAuthId)

            return NextResponse.json(
                { error: "Gagal membuat profil pengguna." },
                { status: 500 }
            )
        }

        // 3. Upload payment proof
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

        // 2. Server-side price calculation
        let calculatedPrice: number | null = null
        let pricingTier: string | null = null

        if (type === "REGULAR") {
            const groupSize = parseInt(formData.get("groupSize") as string)
            const sessionCount = parseInt(formData.get("sessionCount") as string)
            const pricing = calculatePrice(groupSize, sessionCount)
            calculatedPrice = pricing.subtotal
            pricingTier = pricing.tier
        } else if (type === "UTS") {
            const packageType = formData.get("packageType") as string
            const pkg = UTS_PACKAGES.find(p => p.value === packageType)
            if (pkg) {
                calculatedPrice = pkg.price
                pricingTier = pkg.value.toUpperCase()
            }
        }

        // 3. Create Registration Record
        const registrationId = crypto.randomUUID()
        const { data: registration, error: regError } = await supabase
            .from("registrations")
            .insert({
                id: registrationId,
                type,
                name,
                email,
                nim,
                subject,
                whatsapp,
                payment_proof_url: publicUrl,
                calculated_price: calculatedPrice,
                pricing_tier: pricingTier,
                status: type === "REGULAR" ? "APPROVED" : "PENDING",
            })
            .select()
            .single()

        if (regError) {
            console.error("Registration insert error:", regError)
            // ROLLBACK: Delete uploaded file, auth user, and local user
            await supabase.storage.from("payment-proofs").remove([fileName])
            await supabase.auth.admin.deleteUser(newAuthId)
            await supabase.from("users").delete().eq("id", localUserId)

            return NextResponse.json(
                { error: "Gagal menyimpan data pendaftaran." },
                { status: 500 }
            )
        }

        // 4. Create Details Record
        try {
            if (type === "REGULAR") {
                const notes = (formData.get("notes") as string) || ""
                const { error: detailError } = await supabase
                    .from("regular_class_details")
                    .insert({
                        id: crypto.randomUUID(),
                        registration_id: registration.id,
                        group_size: parseInt(formData.get("groupSize") as string),
                        session_count: parseInt(formData.get("sessionCount") as string),
                        scheduled_date: formData.get("scheduledDate") as string,
                        scheduled_time: formData.get("scheduledTime") as string,
                        notes,
                    })

                if (detailError) throw detailError
            } else if (type === "UTS") {
                const { error: detailError } = await supabase
                    .from("uts_package_details")
                    .insert({
                        id: crypto.randomUUID(),
                        registration_id: registration.id,
                        package_type: formData.get("packageType") as string,
                    })

                if (detailError) throw detailError
            }
        } catch (detailError) {
            console.error("Detail insert error:", detailError)

            // ROLLBACK: Delete registration record, storage file, auth user, and local user
            await supabase.from("registrations").delete().eq("id", registration.id)
            await supabase.storage.from("payment-proofs").remove([fileName])
            await supabase.auth.admin.deleteUser(newAuthId)
            await supabase.from("users").delete().eq("id", localUserId)

            return NextResponse.json(
                { error: "Gagal menyimpan detail pendaftaran." },
                { status: 500 }
            )
        }

        return NextResponse.json(
            {
                message: type === "REGULAR"
                    ? "Pendaftaran berhasil! Akun kamu sudah aktif dan dapat digunakan untuk login."
                    : "Pendaftaran berhasil. Menunggu verifikasi admin.",
                id: registration.id,
                ...(calculatedPrice !== null && {
                    pricing: { total: calculatedPrice, tier: pricingTier },
                }),
            },
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
