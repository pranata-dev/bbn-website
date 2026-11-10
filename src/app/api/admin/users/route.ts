import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { createAdminClient } from "@/lib/supabase/server"
import { checkRateLimit } from "@/lib/rate-limit"
import { resolvePaymentProofSignedUrl } from "@/lib/storage"

export const dynamic = "force-dynamic"

interface SubscriptionRow {
    id: string
    status: string
    plan_code: string
    track: string
    starts_at: string | null
    expires_at: string | null
    created_at: string
}

interface UserWithSubscriptions {
    id: string
    email: string
    name: string
    role: string
    is_active: boolean
    created_at: string
    subscriptions?: SubscriptionRow[]
}

export async function GET(request: NextRequest) {
    const guard = await requireAdmin()
    if (!guard.ok) return guard.response

    const rateLimitResponse = checkRateLimit(request)
    if (rateLimitResponse) return rateLimitResponse

    try {
        const adminSupabase = await createAdminClient()

        // 1. Fetch users with subscriptions
        const { data: users, error: usersError } = await adminSupabase
            .from("users")
            .select(`
                *,
                subscriptions(*)
            `)
            .order("created_at", { ascending: false })

        if (usersError) {
            console.error("Users fetch error:", usersError)
            return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
        }

        // 2. Fetch registrations to join payment proofs
        const { data: registrations } = await adminSupabase
            .from("registrations")
            .select("id, email, name, payment_proof_url, status, plan_code, track, type, created_at")
            .order("created_at", { ascending: false })

        // 3. Map registrations, active subscription, and resolve signed URLs for private payment proofs
        const typedUsers = (users || []) as unknown as UserWithSubscriptions[]
        const enrichedUsers = await Promise.all(
            typedUsers.map(async (u) => {
                const userRegs = (registrations || []).filter(
                    (r) =>
                        (r.email && u.email && r.email.toLowerCase().trim() === u.email.toLowerCase().trim()) ||
                        (r.name && u.name && r.name.toLowerCase().trim() === u.name.toLowerCase().trim())
                )

                const regsWithSignedUrls = await Promise.all(
                    userRegs.map(async (r) => ({
                        ...r,
                        payment_proof_url: await resolvePaymentProofSignedUrl(adminSupabase, r.payment_proof_url),
                    }))
                )

                // Find active subscription
                const subs = u.subscriptions || []
                const activeSub = subs.find(
                    (s) => s.status === "ACTIVE" && (!s.expires_at || new Date(s.expires_at) > new Date())
                )

                return {
                    ...u,
                    registrations: regsWithSignedUrls,
                    active_subscription: activeSub || null,
                    payment_proof_url: regsWithSignedUrls[0]?.payment_proof_url || null,
                    registration_status: regsWithSignedUrls[0]?.status || null,
                }
            })
        )

        return NextResponse.json({ users: enrichedUsers })
    } catch (error: unknown) {
        console.error("Internal error in /api/admin/users:", error)
        return NextResponse.json({ error: "Internal error" }, { status: 500 })
    }
}

// PATCH - Update user status, role, or subscription
export async function PATCH(request: NextRequest) {
    const guard = await requireAdmin()
    if (!guard.ok) return guard.response

    const rateLimitResponse = checkRateLimit(request)
    if (rateLimitResponse) return rateLimitResponse

    try {
        const body = await request.json()
        const { userId, role, isActive, plan_code, track, durationDays } = body

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 })
        }

        const adminSupabase = await createAdminClient()

        // 1. Update user active status / role if provided
        const userUpdates: { is_active?: boolean; role?: string; updated_at?: string } = {}
        if (typeof isActive === "boolean") userUpdates.is_active = isActive
        if (role && (role === "STUDENT" || role === "ADMIN")) userUpdates.role = role

        if (Object.keys(userUpdates).length > 0) {
            userUpdates.updated_at = new Date().toISOString()
            const { error: userError } = await adminSupabase
                .from("users")
                .update(userUpdates)
                .eq("id", userId)

            if (userError) throw userError

            if (typeof isActive === "boolean") {
                const { data: targetUser } = await adminSupabase
                    .from("users")
                    .select("email")
                    .eq("id", userId)
                    .maybeSingle()

                if (targetUser?.email) {
                    await adminSupabase
                        .from("registrations")
                        .update({
                            status: isActive ? "APPROVED" : "PENDING",
                            updated_at: new Date().toISOString(),
                        })
                        .ilike("email", targetUser.email)
                }
            }
        }

        // 2. Update track & plan_code in subscriptions table
        if (plan_code || track) {
            const targetTrack = (track || "PHYSICS_SEM_3") as "PHYSICS_SEM_3" | "NON_PHYSICS" | "LEGACY" | "ALL"
            const targetPlan = (plan_code || "SEMESTER") as "FREE" | "MONTHLY" | "SEMESTER"
            const days = durationDays || (targetPlan === "MONTHLY" ? 30 : targetPlan === "FREE" ? 365 : 180)
            const expiresAt = targetPlan === "FREE" ? null : new Date(Date.now() + days * 86400000).toISOString()

            // Supersede any existing ACTIVE subscriptions
            await adminSupabase
                .from("subscriptions")
                .update({ status: "CANCELLED" })
                .eq("user_id", userId)
                .eq("status", "ACTIVE")

            // Insert new active subscription record
            const { error: subError } = await adminSupabase
                .from("subscriptions")
                .insert({
                    user_id: userId,
                    plan_code: targetPlan,
                    track: targetTrack,
                    status: "ACTIVE",
                    starts_at: new Date().toISOString(),
                    expires_at: expiresAt,
                    notes: `Updated by admin (${guard.user.email})`,
                })

            if (subError) {
                console.error("Subscription insert error:", subError)
                throw subError
            }
        }

        return NextResponse.json({ message: "User updated successfully" })
    } catch (error: unknown) {
        console.error("PATCH user error:", error)
        const message = error instanceof Error ? error.message : "Internal error"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
