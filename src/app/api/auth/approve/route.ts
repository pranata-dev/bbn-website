import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { checkRateLimit } from "@/lib/rate-limit"
import { requireAdmin } from "@/lib/admin-auth"
import { BrevoClient } from "@getbrevo/brevo"
import { BUSINESS_CONFIG } from "@/config/business"

const brevoClient = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY || ""
})

export async function POST(request: NextRequest) {
    const guard = await requireAdmin()
    if (!guard.ok) return guard.response

    // Check rate limit
    const rateLimitResponse = checkRateLimit(request)
    if (rateLimitResponse) return rateLimitResponse

    try {
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
        const { error: regUpdateError } = await adminClient
            .from("registrations")
            .update({
                status: action,
                reviewed_by: guard.user.email || "ADMIN_SYSTEM",
                reviewed_at: new Date().toISOString(),
            })
            .eq("id", registrationId)

        if (regUpdateError) {
            console.error("Registration update error:", regUpdateError)
            return NextResponse.json({ error: "Gagal memperbarui status pendaftaran." }, { status: 500 })
        }

        // Get existing user to sync payment status and provision access
        const { data: existingUser } = await adminClient
            .from("users")
            .select("id, email, auth_id")
            .ilike("email", registration.email)
            .maybeSingle()

        if (action === "APPROVED" && existingUser) {
            // 1. Update user status to active
            const { error: userUpdateError } = await adminClient
                .from("users")
                .update({
                    is_active: true,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", existingUser.id)

            if (userUpdateError) {
                console.error("User activation update error:", userUpdateError)
            }

            // 2. Provision subscription
            const rawCycle = (registration.billing_cycle || "").toUpperCase()
            const rawPkg = (registration.package_type || "").toUpperCase()
            const planCode: "FREE" | "MONTHLY" | "SEMESTER" =
                registration.plan_code === "MONTHLY" || rawCycle.includes("MONTH") || rawPkg.includes("MONTH")
                    ? "MONTHLY"
                    : "SEMESTER"

            const rawTrack = (registration.track || registration.student_category || "").toUpperCase()
            const track: "PHYSICS_SEM_3" | "NON_PHYSICS" | "LEGACY" | "ALL" =
                rawTrack === "NON_PHYSICS" ? "NON_PHYSICS" : "PHYSICS_SEM_3"

            const durationDays = planCode === "MONTHLY" ? 30 : 180
            const expiresAt = new Date(Date.now() + durationDays * 86400000).toISOString()

            // Supersede previous active subscriptions
            await adminClient
                .from("subscriptions")
                .update({ status: "CANCELLED" })
                .eq("user_id", existingUser.id)
                .eq("status", "ACTIVE")

            const { error: subError } = await adminClient
                .from("subscriptions")
                .insert({
                    user_id: existingUser.id,
                    plan_code: planCode,
                    track,
                    status: "ACTIVE",
                    starts_at: new Date().toISOString(),
                    expires_at: expiresAt,
                    registration_id: registration.id,
                    granted_by: guard.user.email || "ADMIN_APPROVAL",
                    notes: notes || `Approved registration (${registration.id})`,
                })

            if (subError) {
                console.error("Subscription provisioning error:", subError)
            }

            // Send activation email via Brevo
            try {
                const isKelasBesar = registration.type === "KELAS_BESAR"
                const subject = (registration.subject || "").toUpperCase()
                
                let emailHtml = ""
                let emailSubject = "Akun Belajar Bareng Nata Telah Aktif!"

                if (isKelasBesar) {
                    emailSubject = "Link Zoom Masterclass Belajar Bareng Nata"
                    const zoomLink = BUSINESS_CONFIG.zoom.getLink(subject) ||
                        (subject === "FISMAT"
                            ? (process.env.ZOOM_LINK_FISMAT || "")
                            : (process.env.ZOOM_LINK_FISDAS2 || ""))
                    
                    const schedule = subject === "FISMAT"
                        ? "Minggu, 5 April 2026 pukul 19:00"
                        : "Senin, 6 April 2026 pukul 19:00"

                    emailHtml = `
                        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                            <h2 style="color: #4A3C31;">Halo, ${registration.name}!</h2>
                            <p>Pembayaran kamu untuk <strong>Kelas Tutor Besar (Masterclass)</strong> telah berhasil diverifikasi.</p>
                            <p>Berikut adalah detail pendaftaran dan link Zoom untuk sesi masterclass kamu:</p>
                            <div style="background-color: #FDFBF7; border: 1px solid #EFE8DF; padding: 25px; border-radius: 16px; margin: 25px 0;">
                                <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Mata Kuliah:</strong> ${subject === "FISMAT" ? "Fisika-Matematika" : "Fisika Dasar 2"}</p>
                                <p style="margin: 0 0 25px 0; font-size: 14px;"><strong>Jadwal:</strong> ${schedule}</p>
                                <a href="${zoomLink}" style="background-color: #4A3C31; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">Klik untuk Bergabung ke Zoom</a>
                            </div>
                            <p style="font-size: 12px; color: #666; line-height: 1.5;">Jika tombol di atas tidak berfungsi, kamu juga bisa menyalin link berikut ke browsermu:<br/>
                            <span style="color: #4A3C31; word-break: break-all;">${zoomLink}</span></p>
                            <br/>
                            <p>Selamat belajar dan semoga sukses!<br/><strong>Tim Belajar Bareng Nata</strong></p>
                        </div>
                    `
                } else {
                    emailHtml = `
                        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #4A3C31;">Halo, ${registration.name}!</h2>
                            <p>Pembayaran kamu untuk paket <strong>${planCode === "MONTHLY" ? "Bulanan" : "Semester"}</strong> telah berhasil diverifikasi oleh Admin.</p>
                            <p>Akun kamu kini sudah <strong>AKTIF</strong> dan kamu dapat langsung masuk ke dashboard belajar.</p>
                            <br/>
                            <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://belajarbarengnata.com"}/login" style="background-color: #4A3C31; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Login ke Dashboard</a>
                            <br/><br/>
                            <p>Selamat belajar dan semoga sukses!<br/>Tim Belajar Bareng Nata</p>
                        </div>
                    `
                }

                await brevoClient.transactionalEmails.sendTransacEmail({
                    subject: emailSubject,
                    htmlContent: emailHtml,
                    sender: {
                        name: BUSINESS_CONFIG.contact.emailSenderName,
                        email: BUSINESS_CONFIG.contact.emailSenderAddress,
                    },
                    to: [{ email: registration.email, name: registration.name }]
                })
            } catch (emailError) {
                console.error("Failed to send activation email via Brevo:", emailError)
            }
        }

        return NextResponse.json({
            message: action === "APPROVED"
                ? "Pendaftaran disetujui. Akun berhasil diaktifkan dan langganan telah aktif."
                : "Pendaftaran ditolak.",
        })
    } catch (error) {
        console.error("Approval error:", error)
        return NextResponse.json({ error: "Internal error" }, { status: 500 })
    }
}
