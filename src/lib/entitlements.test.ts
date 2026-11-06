import { describe, it, expect } from "vitest"
import {
    resolveEntitlements,
    trackAllows,
    countFinishedAttempts,
    type SubscriptionLike,
} from "./entitlements-core"
import type { CourseTrack } from "@/config/plans"

describe("Entitlements & RBAC Authorization Rules", () => {
    const courseTracks = new Map<string, CourseTrack>([
        ["course-physics-1", "PHYSICS_SEM_3"],
        ["course-non-physics-1", "NON_PHYSICS"],
        ["course-general", "ALL"],
    ])

    describe("trackAllows helper", () => {
        it("allows all courses when subscription track is ALL", () => {
            expect(trackAllows("ALL", "PHYSICS_SEM_3")).toBe(true)
            expect(trackAllows("ALL", "NON_PHYSICS")).toBe(true)
            expect(trackAllows("ALL", "ALL")).toBe(true)
            expect(trackAllows("ALL", null)).toBe(true)
        })

        it("allows untracked or ALL courses regardless of user track", () => {
            expect(trackAllows("PHYSICS_SEM_3", null)).toBe(true)
            expect(trackAllows("PHYSICS_SEM_3", undefined)).toBe(true)
            expect(trackAllows("PHYSICS_SEM_3", "ALL")).toBe(true)
        })

        it("strictly enforces matching tracks for specific tracks", () => {
            expect(trackAllows("PHYSICS_SEM_3", "PHYSICS_SEM_3")).toBe(true)
            expect(trackAllows("PHYSICS_SEM_3", "NON_PHYSICS")).toBe(false)
            expect(trackAllows("NON_PHYSICS", "PHYSICS_SEM_3")).toBe(false)
            expect(trackAllows("NON_PHYSICS", "NON_PHYSICS")).toBe(true)
        })
    })

    describe("Admin Bypass", () => {
        it("grants full access to admins regardless of subscriptions", () => {
            const entitlements = resolveEntitlements({
                role: "ADMIN",
                subscriptions: [],
                courseTracks,
            })

            expect(entitlements.tier).toBe("PAID")
            expect(entitlements.isAdmin).toBe(true)
            expect(entitlements.planCode).toBe("SEMESTER")
            expect(entitlements.track).toBe("ALL")
            expect(entitlements.canAccessPractice).toBe(true)
            expect(entitlements.canAccessMaterial({ course_id: "course-non-physics-1", is_free_preview: false })).toBe(true)
            expect(entitlements.canStartTryout({ course_id: "course-non-physics-1", is_free_sample: false })).toBe(true)
            expect(entitlements.tryoutAttemptLimit({ course_id: "course-non-physics-1" })).toBe(Infinity)
        })
    })

    describe("FREE Tier (Freemium)", () => {
        const freeSubscriptions: SubscriptionLike[] = [
            {
                id: "sub-free-1",
                plan_code: "FREE",
                track: "PHYSICS_SEM_3",
                status: "ACTIVE",
                expires_at: null,
                created_at: new Date(Date.now() - 86400000).toISOString(),
            },
        ]

        it("allows reading only materials marked as is_free_preview", () => {
            const entitlements = resolveEntitlements({
                role: "STUDENT",
                subscriptions: freeSubscriptions,
                courseTracks,
            })

            expect(entitlements.tier).toBe("FREE")
            expect(entitlements.planCode).toBe("FREE")
            expect(entitlements.isExpired).toBe(false)
            expect(entitlements.canAccessPractice).toBe(false)

            // Free preview article: allowed
            expect(entitlements.canAccessMaterial({ is_free_preview: true, course_id: "course-physics-1" })).toBe(true)
            // Premium article: locked
            expect(entitlements.canAccessMaterial({ is_free_preview: false, course_id: "course-physics-1" })).toBe(false)
            expect(entitlements.canAccessMaterial({ is_free_preview: null, course_id: "course-physics-1" })).toBe(false)
        })

        it("allows starting only tryouts marked as is_free_sample with 1 attempt limit", () => {
            const entitlements = resolveEntitlements({
                role: "STUDENT",
                subscriptions: freeSubscriptions,
                courseTracks,
            })

            const sampleTryout = { id: "t-1", is_free_sample: true, is_practice: false }
            const realTryout = { id: "t-2", is_free_sample: false, is_practice: false }

            expect(entitlements.canStartTryout(sampleTryout)).toBe(true)
            expect(entitlements.tryoutAttemptLimit(sampleTryout)).toBe(1)

            expect(entitlements.canStartTryout(realTryout)).toBe(false)
            expect(entitlements.tryoutAttemptLimit(realTryout)).toBe(0)
        })
    })

    describe("Active PAID Subscriptions", () => {
        it("unlocks track-specific materials and full CBT tryouts for MONTHLY plan", () => {
            const future = new Date(Date.now() + 20 * 86400000).toISOString()
            const paidSubscriptions: SubscriptionLike[] = [
                {
                    id: "sub-paid-1",
                    plan_code: "MONTHLY",
                    track: "PHYSICS_SEM_3",
                    status: "ACTIVE",
                    expires_at: future,
                    created_at: new Date().toISOString(),
                },
            ]

            const entitlements = resolveEntitlements({
                role: "STUDENT",
                subscriptions: paidSubscriptions,
                courseTracks,
            })

            expect(entitlements.tier).toBe("PAID")
            expect(entitlements.planCode).toBe("MONTHLY")
            expect(entitlements.track).toBe("PHYSICS_SEM_3")
            expect(entitlements.canAccessPractice).toBe(true)
            expect(entitlements.isExpired).toBe(false)

            // Can access physics course materials
            expect(entitlements.canAccessMaterial({ course_id: "course-physics-1", is_free_preview: false })).toBe(true)
            // Cannot access non-physics course materials without preview
            expect(entitlements.canAccessMaterial({ course_id: "course-non-physics-1", is_free_preview: false })).toBe(false)
            // Can access free preview of any course
            expect(entitlements.canAccessMaterial({ course_id: "course-non-physics-1", is_free_preview: true })).toBe(true)

            // Tryout limits
            expect(entitlements.tryoutAttemptLimit({ course_id: "course-physics-1", is_practice: false })).toBe(3)
            expect(entitlements.tryoutAttemptLimit({ course_id: "course-physics-1", is_practice: false, max_attempts: 5 })).toBe(5)
            expect(entitlements.tryoutAttemptLimit({ course_id: "course-physics-1", is_practice: true })).toBe(Infinity)
        })

        it("unlocks all tracks when subscription has track ALL", () => {
            const future = new Date(Date.now() + 90 * 86400000).toISOString()
            const allSubscriptions: SubscriptionLike[] = [
                {
                    id: "sub-all-1",
                    plan_code: "SEMESTER",
                    track: "ALL",
                    status: "ACTIVE",
                    expires_at: future,
                    created_at: new Date().toISOString(),
                },
            ]

            const entitlements = resolveEntitlements({
                role: "STUDENT",
                subscriptions: allSubscriptions,
                courseTracks,
            })

            expect(entitlements.canAccessMaterial({ course_id: "course-physics-1" })).toBe(true)
            expect(entitlements.canAccessMaterial({ course_id: "course-non-physics-1" })).toBe(true)
        })
    })

    describe("Expired Subscriptions & Lazy Invalidation", () => {
        it("identifies lapsed active subscriptions and falls back to FREE tier with isExpired: true", () => {
            const past = new Date(Date.now() - 5 * 86400000).toISOString()
            const expiredSubscriptions: SubscriptionLike[] = [
                {
                    id: "sub-lapsed-1",
                    plan_code: "SEMESTER",
                    track: "PHYSICS_SEM_3",
                    status: "ACTIVE", // DB still has ACTIVE until lazy check
                    expires_at: past,
                    created_at: new Date(Date.now() - 185 * 86400000).toISOString(),
                },
            ]

            const entitlements = resolveEntitlements({
                role: "STUDENT",
                subscriptions: expiredSubscriptions,
                courseTracks,
            })

            expect(entitlements.tier).toBe("FREE")
            expect(entitlements.planCode).toBe("FREE")
            expect(entitlements.isExpired).toBe(true)
            expect(entitlements.expiredSubscriptionIds).toEqual(["sub-lapsed-1"])

            // Premium materials are now locked
            expect(entitlements.canAccessMaterial({ course_id: "course-physics-1", is_free_preview: false })).toBe(false)
            // But free previews still work
            expect(entitlements.canAccessMaterial({ course_id: "course-physics-1", is_free_preview: true })).toBe(true)
        })
    })

    describe("Attempt Counting (Anti-Exploit Quota)", () => {
        it("counts only finished submissions (SUBMITTED, COMPLETED, TIMED_OUT) and ignores IN_PROGRESS", () => {
            const submissions = [
                { status: "IN_PROGRESS" },
                { status: "SUBMITTED" },
                { status: "TIMED_OUT" },
                { status: "COMPLETED" },
                { status: "IN_PROGRESS" },
            ]

            expect(countFinishedAttempts(submissions)).toBe(3)
        })
    })
})

