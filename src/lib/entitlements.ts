import { createServiceClient } from "@/lib/supabase/server"
import type { Tables } from "@/types/database.types"
import type { CourseTrack, SubscriptionPlanCode } from "@/config/plans"

export interface UserEntitlements {
    tier: "FREE" | "PAID"
    planCode: SubscriptionPlanCode
    track: CourseTrack
    expiresAt: string | null
    isExpired: boolean
    canAccessMaterial: (material: { is_free_preview?: boolean | null; course_id?: string | null }) => boolean
    canStartTryout: (tryout: { is_practice?: boolean | null; is_free_sample?: boolean | null; course_id?: string | null }) => boolean
    canAccessPractice: boolean
}

/**
 * Server-side entitlement resolver.
 * Evaluates active subscription and handles lazy expiration on read.
 */
export async function getEntitlements(userId: string): Promise<UserEntitlements> {
    const supabase = createServiceClient()

    // 1. Fetch user role to grant unconditional admin bypass
    const { data: user } = await supabase
        .from("users")
        .select("id, role, student_category")
        .eq("id", userId)
        .maybeSingle()

    if (user?.role === "ADMIN") {
        return {
            tier: "PAID",
            planCode: "SEMESTER",
            track: "ALL",
            expiresAt: null,
            isExpired: false,
            canAccessMaterial: () => true,
            canStartTryout: () => true,
            canAccessPractice: true,
        }
    }

    // 2. Fetch latest active or pending subscription
    const { data: activeSub } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "ACTIVE")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()

    const now = new Date()

    // Lazy expiration check
    if (activeSub && activeSub.expires_at) {
        const expiry = new Date(activeSub.expires_at)
        if (now > expiry) {
            // Lazily mark as EXPIRED in DB in background without blocking
            void supabase
                .from("subscriptions")
                .update({ status: "EXPIRED" })
                .eq("id", activeSub.id)

            return createFreeEntitlements((user?.student_category as CourseTrack) || "ALL", true)
        }
    }

    if (activeSub && activeSub.plan_code !== "FREE") {
        return {
            tier: "PAID",
            planCode: activeSub.plan_code as SubscriptionPlanCode,
            track: activeSub.track as CourseTrack,
            expiresAt: activeSub.expires_at,
            isExpired: false,
            canAccessMaterial: () => true,
            canStartTryout: () => true,
            canAccessPractice: true,
        }
    }

    return createFreeEntitlements((user?.student_category as CourseTrack) || "ALL", false)
}

function createFreeEntitlements(track: CourseTrack, wasExpired: boolean): UserEntitlements {
    return {
        tier: "FREE",
        planCode: "FREE",
        track,
        expiresAt: null,
        isExpired: wasExpired,
        canAccessMaterial: (m) => !!m.is_free_preview,
        canStartTryout: (t) => !!t.is_free_sample,
        canAccessPractice: false,
    }
}

