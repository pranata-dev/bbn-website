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
        const { error: regUpdateError } = await adminClient
            .from("registrations")
            .update({
                status: action,
                reviewed_by: "ADMIN_SYSTEM",
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
            .select("id")
            .eq("email", registration.email)
            .maybeSingle()

        // Sync with payments table if user exists
        if (existingUser) {
            await adminClient
                .from("payments")
                .update({
                    status: action,
                    reviewed_by: "ADMIN_SYSTEM",
                    reviewed_at: new Date().toISOString(),
                    notes: notes || undefined
                })
                .eq("user_id", existingUser.id)
                .eq("status", "PENDING")
        }

        if (action === "APPROVED") {
            if (!existingUser) {
                return NextResponse.json(
                    { error: "Akun pengguna tidak ditemukan. Tidak dapat mengaktifkan akun." },
                    { status: 500 }
                )
            }

            // Determine correct role and package_type based on registration type
            let userRole = "STUDENT_BASIC"
            let packageType = "REGULER"

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
                            packageType = "FLUX"
                            break
                        case "senku_mode":
                            userRole = "UTS_SENKU"
                            packageType = "SENKU"
                            break
                        case "einstein_mode":
                            userRole = "UTS_EINSTEIN"
                            packageType = "EINSTEIN"
                            break
                    }
                }
            } else if (registration.type === "REGULAR") {
                userRole = "STUDENT_BASIC"
                packageType = "REGULER"
            }

            // Update user status to active
            const { error: userUpdateError } = await adminClient
                .from("users")
                .update({
                    is_active: true,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", existingUser.id)

            if (userUpdateError) {
                console.error("User activation update error:", userUpdateError)
                return NextResponse.json(
                    { error: "Pendaftaran disetujui, tapi gagal mengaktifkan akun. Mohon hubungi admin teknis." },
                    { status: 500 }
                )
            }

            // Provision User Subject Access
            const subjectMap: Record<string, string> = {
                "fisika-dasar-2": "FISDAS2",
                "fisika-matematika": "FISMAT",
            }
            
            const normalizedSubject = (registration.subject || "").toLowerCase().trim()
            const mappedSubject = subjectMap[normalizedSubject] || "FISDAS2"

            const { error: accessError } = await adminClient
                .from("user_subject_access")
                .upsert({
                    user_id: existingUser.id,
                    subject: mappedSubject,
                    role: userRole,
                    package_type: packageType,
                    is_active: true,
                    updated_at: new Date().toISOString(),
                }, { onConflict: 'user_id,subject' })

            if (accessError) {
                console.error("Subject access provisioning error:", accessError)
                return NextResponse.json(
                    { error: "Pendaftaran disetujui, tapi gagal memberikan akses mata kuliah. Mohon hubungi admin teknis." },
                    { status: 500 }
                )
            }

            // Send activation email via Brevo
            try {
                const isKelasBesar = registration.type === "KELAS_BESAR"
                const subject = (registration.subject || "").toUpperCase()
                
                let emailHtml = ""
                let emailSubject = "Akun Belajar Bareng Nata Telah Aktif!"

                if (isKelasBesar) {
                    emailSubject = "Link Zoom Masterclass Belajar Bareng Nata"
                    const zoomLink = subject === "FISMAT" 
                        ? "https://www.google.com/url?q=https://ipb-university.zoom.us/j/94221411163?pwd%3DYhuEGMcjGTjNH37JQ4M6ap3vae43Fm.1&sa=D&source=calendar&ust=1775348655083593&usg=AOvVaw0jOzzPSYljZgXYgeiPvtCA"
                        : "https://ipb-university.zoom.us/j/92555635040?pwd=HrkdcawyIXV9avQkuDZa2ZFbycA3oq.1"
                    
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
                            <p>Pembayaran kamu untuk pendaftaran <strong>${registration.type === "REGULAR" ? "Kelas Reguler" : "Persiapan UTS"}</strong> telah berhasil diverifikasi oleh Admin.</p>
                            <p>Akun kamu kini sudah <strong>AKTIF</strong> dan kamu dapat langsung masuk ke dashboard belajar.</p>
                            <br/>
                            <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" style="background-color: #4A3C31; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Login ke Dashboard</a>
                            <br/><br/>
                            <p>Selamat belajar dan semoga sukses!<br/>Tim Belajar Bareng Nata</p>
                        </div>
                    `
                }

                await brevoClient.transactionalEmails.sendTransacEmail({
                    subject: emailSubject,
                    htmlContent: emailHtml,
                    sender: { name: "Belajar Bareng Nata", email: "dzulfikaryudha@gmail.com" },
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
