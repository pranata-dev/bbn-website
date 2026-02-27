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
                reviewed_by: user.id,
                reviewed_at: new Date().toISOString(),
                // If there's a custom DB column for notes in registrations, you can add it to the schema, 
                // but currently schema.prisma doesn't have it for `registrations`. 
                // Proceeding without notes column logic for Registration unless added later.
            })
            .eq("id", registrationId)

        if (action === "APPROVED") {
            // Check if user account already exists (edge case fallback)
            const { data: existingUser } = await adminClient
                .from("users")
                .select("id")
                .eq("email", registration.email)
                .maybeSingle()

            if (existingUser) {
                return NextResponse.json(
                    { error: "Pendaftaran disetujui, namun akun pengguna sudah ada. Lanjutkan secara manual." },
                    { status: 500 }
                )
            }

            // Create Supabase auth user identity & send invitation email
            const { data: authData, error: authError } = await adminClient.auth.admin.inviteUserByEmail(
                registration.email,
                {
                    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/set-password`,
                }
            )

            if (authError) {
                console.error("Auth invite error:", authError)
                return NextResponse.json(
                    { error: "Pendaftaran disetujui, namun gagal mengirim email profil aktivasi." },
                    { status: 500 }
                )
            }

            // Insert new user record locally 
            if (authData.user) {
                const { error: insertError } = await adminClient
                    .from("users")
                    .insert({
                        email: registration.email,
                        name: registration.name,
                        role: "STUDENT_BASIC",
                        is_active: true,
                        auth_id: authData.user.id,
                    })

                if (insertError) {
                    console.error("User synthesis insert error:", insertError)
                    return NextResponse.json(
                        { error: "Pendaftaran disetujui, tapi sinkronisasi profil gagal. Mohon hubungi admin teknis." },
                        { status: 500 }
                    )
                }
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
