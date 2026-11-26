import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { checkRateLimit } from "@/lib/rate-limit"
import { requireAdmin } from "@/lib/admin-auth"
import { BrevoClient } from "@getbrevo/brevo"
import { BUSINESS_CONFIG } from "@/config/business"
import { escapeLikePattern } from "@/lib/postgrest-safe"
import {
    buildApprovalEmail,
    hasLiveSubscription,
    resolveApprovalProvisioning,
    resolveMasterclassSchedule,
    type ApprovalRegistrationType,
} from "@/lib/billing-approval"

const brevoClient = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY || "",
})

export async function POST(request: NextRequest) {
    const guard = await requireAdmin()
    if (!guard.ok) return guard.response

    const rateLimitResponse = checkRateLimit(request)
    if (rateLimitResponse) return rateLimitResponse

    try {
        const body = (await request.json()) as {
            registrationId?: unknown
            action?: unknown
            notes?: unknown
        }
        const registrationId = typeof body.registrationId === "string" ? body.registrationId.trim() : ""
        const action = typeof body.action === "string" ? body.action.trim().toUpperCase() : ""
        const notes = typeof body.notes === "string" ? body.notes.trim() : ""

        if (!registrationId || (action !== "APPROVED" && action !== "REJECTED")) {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 })
        }

        const adminClient = createServiceClient()

        const { data: registration, error: regError } = await adminClient
            .from("registrations")
            .select("*")
            .eq("id", registrationId)
            .single()

        if (regError || !registration) {
            return NextResponse.json({ error: "Registration not found" }, { status: 404 })
        }

        if (registration.status === "APPROVED" && action === "APPROVED") {
            return NextResponse.json(
                { error: "Pendaftaran ini sudah disetujui sebelumnya." },
                { status: 400 }
            )
        }

        const now = new Date()
        const nowIso = now.toISOString()
        const reviewerEmail = guard.user.email || "ADMIN_SYSTEM"

        if (action === "REJECTED") {
            const { error: rejectError } = await adminClient
                .from("registrations")
                .update({
                    status: "REJECTED",
                    reviewed_by: reviewerEmail,
                    reviewed_at: nowIso,
                    updated_at: nowIso,
                })
                .eq("id", registrationId)

            if (rejectError) {
                console.error("Registration rejection error:", rejectError)
                return NextResponse.json(
                    { error: "Gagal memperbarui status pendaftaran." },
                    { status: 500 }
                )
            }

            return NextResponse.json({ message: "Pendaftaran ditolak." })
        }

        // Resolve owning user BEFORE mutating registration status
        let existingUser: { id: string; email: string; auth_id: string } | null = null
        if (registration.user_id) {
            const { data: byId } = await adminClient
                .from("users")
                .select("id, email, auth_id")
                .eq("id", registration.user_id)
                .maybeSingle()
            existingUser = byId
        }
        if (!existingUser && registration.email) {
            const { data: byEmail } = await adminClient
                .from("users")
                .select("id, email, auth_id")
                .ilike("email", escapeLikePattern(registration.email.trim().toLowerCase()))
                .maybeSingle()
            existingUser = byEmail
        }

        if (!existingUser) {
            return NextResponse.json(
                { error: "Akun pengguna untuk email pendaftaran ini tidak ditemukan." },
                { status: 404 }
            )
        }

        const { data: currentSubs, error: subsFetchError } = await adminClient
            .from("subscriptions")
            .select("status, expires_at")
            .eq("user_id", existingUser.id)

        if (subsFetchError) {
            console.error("Subscription lookup error:", subsFetchError)
            return NextResponse.json(
                { error: "Gagal memeriksa status langganan pengguna." },
                { status: 500 }
            )
        }

        const provisioning = resolveApprovalProvisioning({
            type: registration.type,
            planCode: registration.plan_code,
            track: registration.track,
            hasLiveSubscription: hasLiveSubscription(currentSubs || [], now),
            now,
        })

        if (!provisioning.ok) {
            return NextResponse.json({ error: provisioning.error }, { status: provisioning.status })
        }

        // 1. Activate user account FIRST and fail fast on any DB error
        const { error: userUpdateError } = await adminClient
            .from("users")
            .update({
                is_active: true,
                updated_at: nowIso,
            })
            .eq("id", existingUser.id)

        if (userUpdateError) {
            console.error("User activation update error:", userUpdateError)
            return NextResponse.json(
                { error: "Gagal mengaktifkan akun pengguna." },
                { status: 500 }
            )
        }

        // 2. Provision subscription BEFORE marking registration APPROVED
        if (provisioning.kind === "PAID") {
            const { error: cancelTrackError } = await adminClient
                .from("subscriptions")
                .update({ status: "CANCELLED" })
                .eq("user_id", existingUser.id)
                .eq("status", "ACTIVE")
                .in("track", provisioning.cancelTracks)

            if (cancelTrackError) {
                console.error("Scoped track cancellation error:", cancelTrackError)
                return NextResponse.json(
                    { error: "Gagal memperbarui langganan sebelumnya." },
                    { status: 500 }
                )
            }

            const { error: cancelFreeError } = await adminClient
                .from("subscriptions")
                .update({ status: "CANCELLED" })
                .eq("user_id", existingUser.id)
                .eq("status", "ACTIVE")
                .eq("plan_code", "FREE")

            if (cancelFreeError) {
                console.error("Free baseline cancellation error:", cancelFreeError)
                return NextResponse.json(
                    { error: "Gagal memperbarui paket gratis sebelumnya." },
                    { status: 500 }
                )
            }

            const { error: subError } = await adminClient.from("subscriptions").insert({
                user_id: existingUser.id,
                plan_code: provisioning.planCode,
                track: provisioning.track,
                status: "ACTIVE",
                starts_at: provisioning.startsAt,
                expires_at: provisioning.expiresAt,
                registration_id: registration.id,
                granted_by: guard.user.email || "ADMIN_APPROVAL",
                notes: notes || `Approved registration (${registration.id})`,
            })

            if (subError) {
                console.error("Subscription provisioning error:", subError)
                if (subError.code === "23505") {
                    return NextResponse.json(
                        { error: "Pendaftaran ini sedang atau sudah diproses." },
                        { status: 409 }
                    )
                }
                return NextResponse.json(
                    { error: "Gagal mengaktifkan langganan pengguna." },
                    { status: 500 }
                )
            }
        } else if (provisioning.kind === "FREE_BASELINE") {
            const { error: freeSubError } = await adminClient.from("subscriptions").insert({
                user_id: existingUser.id,
                plan_code: "FREE",
                track: provisioning.track,
                status: "ACTIVE",
                starts_at: provisioning.startsAt,
                expires_at: null,
                registration_id: registration.id,
                granted_by: guard.user.email || "ADMIN_APPROVAL",
                notes: notes || `Baseline access for approved ${registration.type} (${registration.id})`,
            })

            if (freeSubError) {
                console.error("Free baseline provisioning error:", freeSubError)
                if (freeSubError.code === "23505") {
                    return NextResponse.json(
                        { error: "Pendaftaran ini sedang atau sudah diproses." },
                        { status: 409 }
                    )
                }
                return NextResponse.json(
                    { error: "Gagal mengaktifkan akses dasar pengguna." },
                    { status: 500 }
                )
            }
        }

        // 3. Mark registration APPROVED only after account activation and subscription provisioning succeed
        const { data: updatedRegs, error: regUpdateError } = await adminClient
            .from("registrations")
            .update({
                status: "APPROVED",
                reviewed_by: reviewerEmail,
                reviewed_at: nowIso,
                updated_at: nowIso,
            })
            .eq("id", registrationId)
            .neq("status", "APPROVED")
            .select("id")

        if (regUpdateError) {
            console.error("Registration approval finalize error:", regUpdateError)
            return NextResponse.json(
                { error: "Gagal memperbarui status pendaftaran." },
                { status: 500 }
            )
        }

        if (!updatedRegs || updatedRegs.length === 0) {
            return NextResponse.json(
                { error: "Pendaftaran ini sudah disetujui sebelumnya." },
                { status: 409 }
            )
        }

        // 4. Send HTML-escaped activation email via Brevo
        try {
            const subjectCode = (registration.subject || "").trim().toUpperCase()
            const zoomLink =
                registration.type === "KELAS_BESAR"
                    ? BUSINESS_CONFIG.zoom.getLink(subjectCode) ||
                      (subjectCode === "FISMAT"
                          ? process.env.ZOOM_LINK_FISMAT || ""
                          : process.env.ZOOM_LINK_FISDAS2 || "")
                    : null
            const schedule =
                registration.type === "KELAS_BESAR"
                    ? resolveMasterclassSchedule(
                          BUSINESS_CONFIG.zoom.getSchedule(subjectCode),
                          registration
                      )
                    : null

            const emailContent = buildApprovalEmail({
                type: registration.type as ApprovalRegistrationType,
                name: registration.name,
                subject: registration.subject,
                planCode: provisioning.kind === "PAID" ? provisioning.planCode : null,
                zoomLink,
                schedule,
                appUrl: process.env.NEXT_PUBLIC_APP_URL || "https://belajarbarengnata.com",
            })

            await brevoClient.transactionalEmails.sendTransacEmail({
                subject: emailContent.subject,
                htmlContent: emailContent.html,
                sender: {
                    name: BUSINESS_CONFIG.contact.emailSenderName,
                    email: BUSINESS_CONFIG.contact.emailSenderAddress,
                },
                to: [{ email: registration.email, name: registration.name }],
            })
        } catch (emailError) {
            console.error("Failed to send activation email via Brevo:", emailError)
        }

        return NextResponse.json({
            message:
                provisioning.kind === "PAID"
                    ? "Pendaftaran disetujui. Akun berhasil diaktifkan dan langganan telah aktif."
                    : "Pendaftaran disetujui. Akun pengguna berhasil diaktifkan.",
        })
    } catch (error) {
        console.error("Approval error:", error)
        return NextResponse.json({ error: "Internal error" }, { status: 500 })
    }
}
