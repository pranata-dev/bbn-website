import { createServiceClient } from "@/lib/supabase/server"
import type { CourseTrack } from "@/config/plans"
import {
    countFinishedAttempts,
    resolveEntitlements,
    type GateableTryout,
    type SubscriptionLike,
    type UserEntitlements,
} from "@/lib/entitlements-core"

export type { UserEntitlements } from "@/lib/entitlements-core"
export { FINISHED_SUBMISSION_STATUSES, countFinishedAttempts } from "@/lib/entitlements-core"

type ServiceClient = ReturnType<typeof createServiceClient>

/**
 * Server-side entitlement resolver.
 * Reads ONLY `users.role` (admin bypass) and the `subscriptions` table, and lazily
 * flips lapsed ACTIVE subscriptions to EXPIRED on read.
 */
export async function getEntitlements(userId: string, client?: ServiceClient): Promise<UserEntitlements> {
    const supabase = client ?? createServiceClient()

    const [{ data: user }, { data: subscriptions }, { data: courses }] = await Promise.all([
        supabase.from("users").select("id, role").eq("id", userId).maybeSingle(),
        supabase
            .from("subscriptions")
            .select("id, plan_code, track, status, starts_at, expires_at, created_at")
            .eq("user_id", userId),
        supabase.from("courses").select("id, track"),
    ])

    const courseTracks = new Map<string, CourseTrack>(
        (courses || []).map((c) => [c.id, c.track as CourseTrack])
    )

    const entitlements = resolveEntitlements({
        role: user?.role,
        subscriptions: (subscriptions || []) as SubscriptionLike[],
        courseTracks,
    })

    if (entitlements.expiredSubscriptionIds.length > 0) {
        // Lazy expiry: fire-and-forget, never blocks the request.
        void supabase
            .from("subscriptions")
            .update({ status: "EXPIRED" })
            .in("id", entitlements.expiredSubscriptionIds)
            .then(({ error }) => {
                if (error) console.error("Lazy subscription expiry failed:", error)
            })
    }

    return entitlements
}

export interface TryoutQuota {
    allowed: boolean
    used: number
    limit: number
    remaining: number
}

/**
 * Attempt quota for a single tryout, derived purely from the `submissions` table
 * (finished = SUBMITTED / COMPLETED / TIMED_OUT). Replaces the legacy
 * `user_subject_access.tryout_attempts_used` counter.
 */
export async function getTryoutQuota(
    userId: string,
    tryout: GateableTryout & { id: string },
    entitlements: UserEntitlements,
    client?: ServiceClient
): Promise<TryoutQuota> {
    const supabase = client ?? createServiceClient()
    const limit = entitlements.tryoutAttemptLimit(tryout)

    // Status filtering happens in JS so this works whether `submissions.status`
    // is still the legacy enum or the new TEXT column.
    const { data: rows } = await supabase
        .from("submissions")
        .select("status")
        .eq("user_id", userId)
        .eq("tryout_id", tryout.id)

    const used = countFinishedAttempts(rows || [])
    const remaining = limit === Infinity ? Infinity : Math.max(0, limit - used)
    return { allowed: remaining > 0, used, limit, remaining }
}
