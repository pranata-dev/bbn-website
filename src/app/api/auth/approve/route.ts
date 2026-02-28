import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { checkRateLimit } from "@/lib/rate-limit"
import { verifyAdminToken } from "@/lib/admin-auth"
import { BrevoClient } from "@getbrevo/brevo"

const brevoClient = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY || ""
})

export async function POST(request: NextRequest) {
    // Check rate limit
    const rateLimitResponse = checkRateLimit(request)
    if (rateLimitResponse) return rateLimitResponse

    try {
        const adminSessionCookie = request.cookies.get("admin_session")?.value
        if (!adminSessionCookie) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        try {
            const payload = await verifyAdminToken(adminSessionCookie)
            if (payload.role !== "ADMIN") {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 })
            }
        } catch (err) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { registrationId, action, notes } = body

        if (!registrationId || !["APPROVED", "REJECTED"].includes(action)) {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 })
        }

        const adminClient = await createAdminClient()

        // Get registration data
        const { data: registration, error: regError } = await adminClient
            .from("registrations")
            .select("*")
            .eq("id", registrationId)
            .single()

        if (regError || !registration) {
            return NextResponse.json({ error: "Registration not found" }, { status: 404 })
        }

        // Prevent re-approval (especially important to avoid duplicate account provisioning)
        if (registration.status === "APPROVED" && action === "APPROVED") {
            return NextResponse.json({ error: "Pendaftaran ini sudah disetujui sebelumnya." }, { status: 400 })
        }

        // Update registration status
        await adminClient
            .from("registrations")
            .update({
                status: action,
                reviewed_by: "ADMIN_SYSTEM", // Admin is purely static based on env via custom JWT
                reviewed_at: new Date().toISOString(),
                // If there's a custom DB column for notes in registrations, you can add it to the schema, 
                // but currently schema.prisma doesn't have it for `registrations`. 
                // Proceeding without notes column logic for Registration unless added later.
            })
            .eq("id", registrationId)

        if (action === "APPROVED") {
            // Check if user account already exists (it should, from registration)
            const { data: existingUser } = await adminClient
                .from("users")
                .select("id")
                .eq("email", registration.email)
                .maybeSingle()

            if (!existingUser) {
                return NextResponse.json(
                    { error: "Akun pengguna tidak ditemukan. Tidak dapat mengaktifkan akun." },
                    { status: 500 }
                )
            }

            // Determine correct role based on registration type and details
            let userRole = "STUDENT_BASIC"

            if (registration.type === "UTS") {
                const { data: utsDetail } = await adminClient
                    .from("uts_package_details")
                    .select("package_type")
                    .eq("registration_id", registration.id)
                    .maybeSingle()

                if (utsDetail) {
                    switch (utsDetail.package_type) {
                        case "flux_session":
                            userRole = "UTS_FLUX"
                            break
                        case "senku_mode":
                            userRole = "UTS_SENKU"
                            break
                        case "einstein_mode":
                            userRole = "UTS_EINSTEIN"
                            break
                    }
                }
            }

            // Update user status to active and sync role
            const { error: updateError } = await adminClient
                .from("users")
                .update({
                    is_active: true,
                    role: userRole
                })
                .eq("id", existingUser.id)

            if (updateError) {
                console.error("User activation update error:", updateError)
                return NextResponse.json(
                    { error: "Pendaftaran disetujui, tapi gagal mengaktifkan akun. Mohon hubungi admin teknis." },
                    { status: 500 }
                )
            }

            // Send activation email via Brevo
            try {
                await brevoClient.transactionalEmails.sendTransacEmail({
                    subject: "Akun Belajar Bareng Nata Telah Aktif!",
                    htmlContent: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #4A3C31;">Halo, ${registration.name}!</h2>
                            <p>Pembayaran kamu untuk pendaftaran <strong>${registration.type === "REGULAR" ? "Kelas Reguler" : "Persiapan UTS"}</strong> telah berhasil diverifikasi oleh Admin.</p>
                            <p>Akun kamu kini sudah <strong>AKTIF</strong> dan kamu dapat langsung masuk ke dashboard belajar.</p>
                            <br/>
                            <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" style="background-color: #4A3C31; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Login ke Dashboard</a>
                            <br/><br/>
                            <p>Selamat belajar dan semoga sukses!<br/>Tim Belajar Bareng Nata</p>
                        </div>
                    `,
                    sender: { name: "Belajar Bareng Nata", email: "noreply@belajarbarengnata.com" },
                    to: [{ email: registration.email, name: registration.name }]
                })
            } catch (emailError) {
                console.error("Failed to send activation email via Brevo:", emailError)
                // We choose not to fail the whole approval process if just the email fails
            }
        }

        return NextResponse.json({
            message: action === "APPROVED"
                ? "Pendaftaran disetujui. Akun berhasil dibuat dan email aktivasi telah dikirim."
                : "Pendaftaran ditolak.",
        })
    } catch (error) {
        console.error("Approval error:", error)
        return NextResponse.json({ error: "Internal error" }, { status: 500 })
    }
}
