import { NextRequest, NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { checkRateLimit } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
    // Check rate limit
    const rateLimitResponse = checkRateLimit(request)
    if (rateLimitResponse) return rateLimitResponse

    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Check admin role
        const { data: adminProfile } = await supabase
            .from("users")
            .select("role")
            .eq("auth_id", user.id)
            .single()

        if (!adminProfile || adminProfile.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const body = await request.json()
        const { paymentId, action, notes } = body

        if (!paymentId || !["APPROVED", "REJECTED"].includes(action)) {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 })
        }

        const adminClient = await createAdminClient()

        // Get payment and associated user
        const { data: payment, error: paymentError } = await adminClient
            .from("payments")
            .select("*, users(*)")
            .eq("id", paymentId)
            .single()

        if (paymentError || !payment) {
            return NextResponse.json({ error: "Payment not found" }, { status: 404 })
        }

        // Update payment status
        await adminClient
            .from("payments")
            .update({
                status: action,
                notes,
                reviewed_by: user.id,
                reviewed_at: new Date().toISOString(),
            })
            .eq("id", paymentId)

        if (action === "APPROVED") {
            // Create Supabase auth user and send invitation email
            const { data: authData, error: authError } = await adminClient.auth.admin.inviteUserByEmail(
                payment.users.email,
                {
                    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/set-password`,
                }
            )

            if (authError) {
                console.error("Auth invite error:", authError)
                return NextResponse.json(
                    { error: "Gagal mengirim email aktivasi." },
                    { status: 500 }
                )
            }

            // Update user with real auth_id and activate
            if (authData.user) {
                const { error: updateError } = await adminClient
                    .from("users")
                    .update({
                        auth_id: authData.user.id,
                        is_active: true,
                    })
                    .eq("id", payment.user_id)

                if (updateError) {
                    console.error("User activation update error:", updateError)
                    // Note: Auth account is already created/invited. 
                    // This is a partial failure state that needs attention.
                    return NextResponse.json(
                        { error: "Bukti pembayaran disetujui, tapi pendaftaran profil gagal. Mohon hubungi admin." },
                        { status: 500 }
                    )
                }
            }
        }

        return NextResponse.json({
            message: action === "APPROVED"
                ? "Pembayaran disetujui. Email aktivasi telah dikirim."
                : "Pembayaran ditolak.",
        })
    } catch (error) {
        console.error("Approval error:", error)
        return NextResponse.json({ error: "Internal error" }, { status: 500 })
    }
}
