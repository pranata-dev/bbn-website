import { NextRequest, NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { checkRateLimit } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
    // Check rate limit
    const rateLimitResponse = checkRateLimit(request)
    if (rateLimitResponse) return rateLimitResponse

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

        // 1. Upload payment proof to Supabase Storage
        const fileName = `${Date.now()}-${paymentProof.name}`
        const { data: uploadData, error: uploadError } = await supabase.storage
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

        // 2. Create user and payment records with rollback logic
        try {
            // Create user record (without auth - will be created on approval)
            const userId = crypto.randomUUID()
            const { data: user, error: userError } = await supabase
                .from("users")
                .insert({
                    id: userId,
                    email,
                    name,
                    role: "STUDENT_BASIC",
                    is_active: false,
                    auth_id: `pending-${Date.now()}`,
                })
                .select()
                .single()

            if (userError) throw userError

            // Create payment record
            const { error: paymentError } = await supabase
                .from("payments")
                .insert({
                    id: crypto.randomUUID(),
                    user_id: user.id,
                    proof_url: publicUrl,
                    status: "PENDING",
                })

            if (paymentError) {
                // Secondary check: remove partially created user
                await supabase.from("users").delete().eq("id", user.id)
                throw paymentError
            }

            return NextResponse.json(
                { message: "Pendaftaran berhasil. Menunggu verifikasi admin." },
                { status: 201 }
            )
        } catch (dbError) {
            console.error("Registration DB error:", dbError)

            // ROLLBACK: Remove uploaded file
            await supabase.storage.from("payment-proofs").remove([fileName])

            return NextResponse.json(
                { error: "Gagal memproses pendaftaran. Silakan coba lagi." },
                { status: 500 }
            )
        }
    } catch (error) {
        console.error("Registration error:", error)
        return NextResponse.json(
            { error: "Terjadi kesalahan internal." },
            { status: 500 }
        )
    }
}
