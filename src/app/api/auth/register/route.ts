import { NextRequest, NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const name = formData.get("name") as string
        const email = formData.get("email") as string
        const paymentProof = formData.get("paymentProof") as File

        if (!name || !email || !paymentProof) {
            return NextResponse.json(
                { error: "Semua field wajib diisi." },
                { status: 400 }
            )
        }

        // Validate file
        if (paymentProof.size > 5 * 1024 * 1024) {
            return NextResponse.json(
                { error: "Ukuran file maksimal 5MB." },
                { status: 400 }
            )
        }

        const supabase = await createAdminClient()

        // Check if email already exists
        const { data: existingUser } = await supabase
            .from("users")
            .select("id")
            .eq("email", email)
            .single()

        if (existingUser) {
            return NextResponse.json(
                { error: "Email sudah terdaftar." },
                { status: 400 }
            )
        }

        // Upload payment proof to Supabase Storage
        const fileName = `${Date.now()}-${paymentProof.name}`
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from("payment-proofs")
            .upload(fileName, paymentProof, {
                cacheControl: "3600",
                upsert: false,
            })

        if (uploadError) {
            return NextResponse.json(
                { error: "Gagal mengunggah bukti pembayaran." },
                { status: 500 }
            )
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from("payment-proofs")
            .getPublicUrl(fileName)

        // Create user record (without auth - will be created on approval)
        const { data: user, error: userError } = await supabase
            .from("users")
            .insert({
                email,
                name,
                role: "STUDENT_BASIC",
                is_active: false,
                auth_id: `pending-${Date.now()}`,
            })
            .select()
            .single()

        if (userError) {
            return NextResponse.json(
                { error: "Gagal membuat akun." },
                { status: 500 }
            )
        }

        // Create payment record
        const { error: paymentError } = await supabase
            .from("payments")
            .insert({
                user_id: user.id,
                proof_url: publicUrl,
                status: "PENDING",
            })

        if (paymentError) {
            return NextResponse.json(
                { error: "Gagal menyimpan data pembayaran." },
                { status: 500 }
            )
        }

        return NextResponse.json(
            { message: "Pendaftaran berhasil. Menunggu verifikasi admin." },
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
