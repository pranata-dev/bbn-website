/**
 * Pure (I/O-free) entitlement rules. Kept separate from `entitlements.ts` so the
 * access-control logic is unit-testable without a database.
 *
 * Single source of truth for access: the `subscriptions` table.
 * (Legacy `users.student_category / package_type / billing_cycle` and
 * `user_subject_access` are NOT consulted anywhere.)
 */
import type { CourseTrack, SubscriptionPlanCode } from "@/config/plans"

export interface SubscriptionLike {
    id: string
    plan_code: SubscriptionPlanCode
    track: CourseTrack
    status: "PENDING" | "ACTIVE" | "EXPIRED" | "CANCELLED"
    starts_at?: string | null
    expires_at: string | null
    created_at: string
}

export interface GateableContent {
    course_id?: string | null
    is_free_preview?: boolean | null
}

export interface GateableTryout {
    course_id?: string | null
    is_practice?: boolean | null
    is_free_sample?: boolean | null
    max_attempts?: number | null
}

export interface UserEntitlements {
    tier: "FREE" | "PAID"
    isAdmin: boolean
    planCode: SubscriptionPlanCode
    track: CourseTrack
    expiresAt: string | null
    /** True when the user's most recent paid subscription has lapsed. */
    isExpired: boolean
    /** IDs of ACTIVE rows whose `expires_at` has passed (to be lazily flipped to EXPIRED). */
    expiredSubscriptionIds: string[]
    canAccessMaterial: (material: GateableContent) => boolean
    canStartTryout: (tryout: GateableTryout) => boolean
    canAccessPractice: boolean
    /** Max finished attempts for a tryout; `Infinity` = unlimited. 0 = not allowed. */
    tryoutAttemptLimit: (tryout: GateableTryout) => number
}

/** Submission statuses that consume an attempt quota. */
export const FINISHED_SUBMISSION_STATUSES = ["SUBMITTED", "COMPLETED", "TIMED_OUT"] as const

/** Attempts allowed for a FREE-tier user on an `is_free_sample` tryout/latihan. */
export const FREE_SAMPLE_ATTEMPT_LIMIT = 1

/** Default attempt cap for paid users on a real (non-practice) tryout with no `max_attempts`. */
export const DEFAULT_PAID_TRYOUT_ATTEMPTS = 3

/**
 * Whether a subscription track grants access to content in a course track.
 * - `ALL` subscriptions unlock everything.
 * - Content without a course (or a course on the `ALL` track) is visible to every paid track.
 * - Otherwise the tracks must match exactly.
 */
export function trackAllows(subscriptionTrack: CourseTrack, courseTrack: CourseTrack | null | undefined): boolean {
    if (subscriptionTrack === "ALL") return true
    if (!courseTrack || courseTrack === "ALL") return true
    return subscriptionTrack === courseTrack
}

export function countFinishedAttempts(submissions: { status: string }[]): number {
    const finished = FINISHED_SUBMISSION_STATUSES as readonly string[]
    return submissions.filter((s) => finished.includes(s.status)).length
}

export interface ResolveEntitlementsInput {
    role: string | null | undefined
    subscriptions: SubscriptionLike[]
    /** Map of `courses.id` -> `courses.track`. Missing ids are treated as un-tracked content. */
    courseTracks?: Map<string, CourseTrack>
    now?: Date
}

export function resolveEntitlements({
    role,
    subscriptions,
    courseTracks = new Map(),
    now = new Date(),
}: ResolveEntitlementsInput): UserEntitlements {
    if (role === "ADMIN") {
        return {
            tier: "PAID",
            isAdmin: true,
            planCode: "SEMESTER",
            track: "ALL",
            expiresAt: null,
            isExpired: false,
            expiredSubscriptionIds: [],
            canAccessMaterial: () => true,
            canStartTryout: () => true,
            canAccessPractice: true,
            tryoutAttemptLimit: () => Infinity,
        }
    }

    const isLapsed = (s: SubscriptionLike) => !!s.expires_at && new Date(s.expires_at).getTime() < now.getTime()
    const isStarted = (s: SubscriptionLike) => !s.starts_at || new Date(s.starts_at).getTime() <= now.getTime()

    const active = subscriptions.filter((s) => s.status === "ACTIVE")
    const expiredSubscriptionIds = active.filter(isLapsed).map((s) => s.id)

    const newestFirst = (a: SubscriptionLike, b: SubscriptionLike) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()

    const livePaid = active
        .filter((s) => s.plan_code !== "FREE" && !isLapsed(s) && isStarted(s))
        .sort(newestFirst)

    const courseTrackOf = (courseId: string | null | undefined) =>
        courseId ? courseTracks.get(courseId) ?? null : null

    if (livePaid.length > 0) {
        const paidTracks = new Set(livePaid.map((s) => s.track))
        const allows = (courseId: string | null | undefined) =>
            [...paidTracks].some((t) => trackAllows(t, courseTrackOf(courseId)))
        const primary = livePaid[0]
        // Latest expiry across concurrent paid subscriptions (null = open-ended).
        const expiries = livePaid.map((s) => s.expires_at as string).sort()
        const expiresAt = livePaid.some((s) => !s.expires_at) ? null : expiries[expiries.length - 1] ?? null

        return {
            tier: "PAID",
            isAdmin: false,
            planCode: primary.plan_code,
            track: paidTracks.size > 1 ? "ALL" : primary.track,
            expiresAt,
            isExpired: false,
            expiredSubscriptionIds,
            canAccessMaterial: (m) => !!m.is_free_preview || allows(m.course_id),
            canStartTryout: (t) => !!t.is_free_sample || allows(t.course_id),
            canAccessPractice: true,
            tryoutAttemptLimit: (t) => {
                if (!t.is_free_sample && !allows(t.course_id)) return 0
                if (t.is_practice) return Infinity
                return t.max_attempts && t.max_attempts > 0 ? t.max_attempts : DEFAULT_PAID_TRYOUT_ATTEMPTS
            },
        }
    }

    // FREE tier — track comes from the FREE baseline subscription, if any.
    const freeRow = active.filter((s) => s.plan_code === "FREE").sort(newestFirst)[0]
    const hadPaid = subscriptions.some((s) => s.plan_code !== "FREE" && (s.status === "EXPIRED" || isLapsed(s)))

    return {
        tier: "FREE",
        isAdmin: false,
        planCode: "FREE",
        track: freeRow?.track ?? "ALL",
        expiresAt: null,
        isExpired: hadPaid,
        expiredSubscriptionIds,
        canAccessMaterial: (m) => !!m.is_free_preview,
        canStartTryout: (t) => !!t.is_free_sample,
        canAccessPractice: false,
        tryoutAttemptLimit: (t) => (t.is_free_sample ? FREE_SAMPLE_ATTEMPT_LIMIT : 0),
    }
}
