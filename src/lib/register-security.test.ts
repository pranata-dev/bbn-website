import { describe, it, expect } from "vitest"
import {
    evaluateRegistrationIdentity,
    resolveRegistrationPricing,
    resolveSafeInternalRedirect,
    KELAS_BESAR_PRICE,
    type ExistingUserSnapshot,
} from "./register-security"
import { SUBSCRIPTION_PLANS } from "@/config/plans"
import { calculatePrice } from "@/lib/pricing"

describe("register-security: identity ownership, takeover prevention, and is_active rules", () => {
    const adminUser: ExistingUserSnapshot = {
        id: "user-admin-1",
        auth_id: "auth-admin-1",
        email: "admin@example.com",
        is_active: true,
        role: "ADMIN",
    }

    const triggerCreatedStudent: ExistingUserSnapshot = {
        id: "user-new-1",
        auth_id: "auth-new-1",
        email: "student@example.com",
        is_active: true,
        role: "STUDENT",
    }

    it("blocks account takeover / admin escalation with 409 when email belongs to another auth_id", () => {
        const decision = evaluateRegistrationIdentity({
            sessionAuthId: "auth-attacker-999",
            sessionEmail: "admin@example.com",
            submittedEmail: "admin@example.com",
            existingUserByAuthId: null,
            existingUserByEmail: adminUser,
            existingSubscriptionCount: 0,
            existingRegistrationCount: 0,
            isFreeRegistration: true,
        })

        expect(decision.ok).toBe(false)
        if (!decision.ok) {
            expect(decision.status).toBe(409)
        }
    })

    it("blocks mismatched form email against verified session email with 403", () => {
        const decision = evaluateRegistrationIdentity({
            sessionAuthId: "auth-attacker-999",
            sessionEmail: "attacker@example.com",
            submittedEmail: "admin@example.com",
            existingUserByAuthId: null,
            existingUserByEmail: null,
            existingSubscriptionCount: 0,
            existingRegistrationCount: 0,
            isFreeRegistration: true,
        })

        expect(decision.ok).toBe(false)
        if (!decision.ok) {
            expect(decision.status).toBe(403)
        }
    })

    it("allows brand-new trigger-created user with zero subscriptions/registrations to complete FREE signup", () => {
        const decision = evaluateRegistrationIdentity({
            sessionAuthId: "auth-new-1",
            sessionEmail: "student@example.com",
            submittedEmail: "student@example.com",
            existingUserByAuthId: triggerCreatedStudent,
            existingUserByEmail: triggerCreatedStudent,
            existingSubscriptionCount: 0,
            existingRegistrationCount: 0,
            isFreeRegistration: true,
        })

        expect(decision.ok).toBe(true)
        if (decision.ok) {
            expect(decision.mode).toBe("update")
            expect(decision.userId).toBe("user-new-1")
            expect(decision.isBrandNewOnboarding).toBe(true)
            expect(decision.nextIsActive).toBe(true)
        }
    })

    it("sets is_active = false for brand-new trigger-created user submitting a paid pending registration", () => {
        const decision = evaluateRegistrationIdentity({
            sessionAuthId: "auth-new-1",
            sessionEmail: "student@example.com",
            submittedEmail: "student@example.com",
            existingUserByAuthId: triggerCreatedStudent,
            existingUserByEmail: triggerCreatedStudent,
            existingSubscriptionCount: 0,
            existingRegistrationCount: 0,
            isFreeRegistration: false,
        })

        expect(decision.ok).toBe(true)
        if (decision.ok) {
            expect(decision.isBrandNewOnboarding).toBe(true)
            expect(decision.nextIsActive).toBe(false)
        }
    })

    it("prevents admin-deactivated account from self-activating via FREE registration", () => {
        const deactivatedUser: ExistingUserSnapshot = {
            id: "user-banned-1",
            auth_id: "auth-banned-1",
            email: "banned@example.com",
            is_active: false,
            role: "STUDENT",
        }

        const decision = evaluateRegistrationIdentity({
            sessionAuthId: "auth-banned-1",
            sessionEmail: "banned@example.com",
            submittedEmail: "banned@example.com",
            existingUserByAuthId: deactivatedUser,
            existingUserByEmail: deactivatedUser,
            existingSubscriptionCount: 0,
            existingRegistrationCount: 0,
            isFreeRegistration: true,
        })

        expect(decision.ok).toBe(false)
        if (!decision.ok) {
            expect(decision.status).toBe(403)
        }
    })

    it("blocks duplicate FREE onboarding with 409 when user already has subscriptions or registrations", () => {
        const decision = evaluateRegistrationIdentity({
            sessionAuthId: "auth-new-1",
            sessionEmail: "student@example.com",
            submittedEmail: "student@example.com",
            existingUserByAuthId: triggerCreatedStudent,
            existingUserByEmail: triggerCreatedStudent,
            existingSubscriptionCount: 1,
            existingRegistrationCount: 0,
            isFreeRegistration: true,
        })

        expect(decision.ok).toBe(false)
        if (!decision.ok) {
            expect(decision.status).toBe(409)
        }
    })

    it("preserves is_active = true for an existing onboarded active user purchasing another paid registration", () => {
        const decision = evaluateRegistrationIdentity({
            sessionAuthId: "auth-new-1",
            sessionEmail: "student@example.com",
            submittedEmail: "student@example.com",
            existingUserByAuthId: triggerCreatedStudent,
            existingUserByEmail: triggerCreatedStudent,
            existingSubscriptionCount: 1,
            existingRegistrationCount: 0,
            isFreeRegistration: false,
        })

        expect(decision.ok).toBe(true)
        if (decision.ok) {
            expect(decision.isBrandNewOnboarding).toBe(false)
            expect(decision.nextIsActive).toBe(true)
        }
    })
})

describe("register-security: authoritative server-side pricing", () => {
    it("computes UTS plan prices strictly from SUBSCRIPTION_PLANS", () => {
        const freeRes = resolveRegistrationPricing({ type: "UTS", planCodeRaw: "FREE" })
        expect(freeRes).toEqual({
            ok: true,
            calculatedPrice: SUBSCRIPTION_PLANS.FREE.price,
            pricingTier: "FREE",
            planCode: "FREE",
        })

        const monthlyRes = resolveRegistrationPricing({ type: "UTS", planCodeRaw: "MONTHLY" })
        expect(monthlyRes).toEqual({
            ok: true,
            calculatedPrice: SUBSCRIPTION_PLANS.MONTHLY.price,
            pricingTier: "MONTHLY",
            planCode: "MONTHLY",
        })

        const semesterRes = resolveRegistrationPricing({ type: "UTS", planCodeRaw: "SEMESTER" })
        expect(semesterRes).toEqual({
            ok: true,
            calculatedPrice: SUBSCRIPTION_PLANS.SEMESTER.price,
            pricingTier: "SEMESTER",
            planCode: "SEMESTER",
        })

        const invalidRes = resolveRegistrationPricing({ type: "UTS", planCodeRaw: "CUSTOM_1_RUPIAH" })
        expect(invalidRes.ok).toBe(false)
    })

    it("computes REGULAR pricing strictly from calculatePrice and rejects invalid group/session bounds", () => {
        const valid = resolveRegistrationPricing({
            type: "REGULAR",
            groupSize: 3,
            sessionCount: 4,
        })
        const expected = calculatePrice(3, 4)
        expect(valid).toEqual({
            ok: true,
            calculatedPrice: expected.subtotal,
            pricingTier: expected.tier,
            planCode: null,
        })

        expect(resolveRegistrationPricing({ type: "REGULAR", groupSize: 0, sessionCount: 1 }).ok).toBe(false)
        expect(resolveRegistrationPricing({ type: "REGULAR", groupSize: 21, sessionCount: 1 }).ok).toBe(false)
        expect(resolveRegistrationPricing({ type: "REGULAR", groupSize: 2, sessionCount: 31 }).ok).toBe(false)
    })

    it("computes KELAS_BESAR price strictly from server constant with null planCode", () => {
        const res = resolveRegistrationPricing({ type: "KELAS_BESAR" })
        expect(res).toEqual({
            ok: true,
            calculatedPrice: KELAS_BESAR_PRICE,
            pricingTier: "MASTERCLASS",
            planCode: null,
        })
    })
})

describe("register-security: safe internal redirect validation", () => {
    it("allows safe internal relative paths and blocks protocol-relative or external redirects", () => {
        expect(resolveSafeInternalRedirect("/register?step=details")).toBe("/register?step=details")
        expect(resolveSafeInternalRedirect("/dashboard")).toBe("/dashboard")
        expect(resolveSafeInternalRedirect("//evil.com/phish")).toBeNull()
        expect(resolveSafeInternalRedirect("https://evil.com")).toBeNull()
        expect(resolveSafeInternalRedirect("/\\evil.com")).toBeNull()
        expect(resolveSafeInternalRedirect(null)).toBeNull()
    })
})

