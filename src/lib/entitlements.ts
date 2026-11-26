import { createServiceClient } from "@/lib/supabase/server"
import type { CourseTrack } from "@/config/plans"
import {
    getExcellentBetaGrade,
    getExcellentCourseByCodeOrSlug,
    getExcellentCourseByGrade,
    type AuthUserMetadataLike,
    type ExcellentGrade,
} from "@/config/excellent"
import {
    countFinishedAttempts,
    resolveEntitlements,
    type GateableTryout,
    type SubscriptionLike,
    type UserEntitlements,
} from "@/lib/entitlements-core"

export type { UserEntitlements } from "@/lib/entitlements-core"
export {
    FINISHED_SUBMISSION_STATUSES,
    canBetaAccessCourse,
    countFinishedAttempts,
} from "@/lib/entitlements-core"
export { getExcellentBetaGrade } from "@/config/excellent"

type ServiceClient = ReturnType<typeof createServiceClient>

export interface ExcellentCourseRow {
    id: string
    code: string
    slug: string
    title: string
}

/**
 * Resolves the single `public.courses` row for an Excellent Beta grade.
 * Returns null if the course has not been seeded yet.
 */
export async function getExcellentCourseRow(
    grade: ExcellentGrade,
    client?: ServiceClient
): Promise<ExcellentCourseRow | null> {
    const config = getExcellentCourseByGrade(grade)
    if (!config) return null

    const supabase = client ?? createServiceClient()
    const { data: byCode } = await supabase
        .from("courses")
        .select("id, code, slug, title")
        .eq("code", config.code)
        .maybeSingle()

    if (byCode) {
        return byCode as ExcellentCourseRow
    }

    const { data: bySlug } = await supabase
        .from("courses")
        .select("id, code, slug, title")
        .eq("slug", config.slug)
        .maybeSingle()

    return (bySlug as ExcellentCourseRow | null) ?? null
}

function matchesExcellentSyntheticEmail(email: string | null | undefined, grade: ExcellentGrade): boolean {
    if (!email) return false
    const normalized = email.trim().toLowerCase()
    return (
        normalized.startsWith(`excellent.${grade.toLowerCase()}.`) &&
        normalized.endsWith("@beta.bbn.local")
    )
}

export interface GetEntitlementsOptions {
    authUser?: AuthUserMetadataLike | null
}

/**
 * Server-side entitlement resolver.
 * Reads `users.role` (admin bypass), verified Excellent Beta identity, and the `subscriptions` table,
 * and lazily flips lapsed ACTIVE subscriptions to EXPIRED on read.
 */
export async function getEntitlements(
    userId: string,
    client?: ServiceClient,
    options?: GetEntitlementsOptions
): Promise<UserEntitlements> {
    const supabase = client ?? createServiceClient()

    const [{ data: user }, { data: subscriptions }, { data: courses }] = await Promise.all([
        supabase.from("users").select("id, role, email").eq("id", userId).maybeSingle(),
        supabase
            .from("subscriptions")
            .select("id, plan_code, track, status, starts_at, expires_at, created_at")
            .eq("user_id", userId),
        supabase.from("courses").select("id, track, code, slug"),
    ])

    const courseTracks = new Map<string, CourseTrack>(
        (courses || []).map((c) => [c.id, c.track as CourseTrack])
    )

    const excellentCourseIds = new Set<string>(
        (courses || [])
            .filter((c) => Boolean(getExcellentCourseByCodeOrSlug(c.code) || getExcellentCourseByCodeOrSlug(c.slug)))
            .map((c) => c.id)
    )

    const rawExcellentGrade = getExcellentBetaGrade(options?.authUser)
    const excellentGrade =
        rawExcellentGrade && matchesExcellentSyntheticEmail(user?.email, rawExcellentGrade)
            ? rawExcellentGrade
            : null
    const excellentConfig = excellentGrade ? getExcellentCourseByGrade(excellentGrade) : undefined
    const excellentCourseRow = excellentConfig
        ? (courses || []).find(
              (c) =>
                  c.code.toUpperCase() === excellentConfig.code ||
                  c.slug.toLowerCase() === excellentConfig.slug
          )
        : undefined

    const entitlements = resolveEntitlements({
        role: user?.role,
        subscriptions: (subscriptions || []) as SubscriptionLike[],
        courseTracks,
        excellentCourseIds,
        isExcellentBeta: Boolean(excellentGrade),
        excellentGrade,
        excellentCourseId: excellentGrade ? excellentCourseRow?.id ?? null : undefined,
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
