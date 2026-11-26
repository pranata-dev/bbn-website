import { getPlanByCode, type SubscriptionPlanCode } from "@/config/plans"
import { calculatePrice } from "@/lib/pricing"

export type RegistrationType = "REGULAR" | "UTS" | "KELAS_BESAR"
export type RegistrationTrack = "PHYSICS_SEM_3" | "NON_PHYSICS" | "ALL"

export const KELAS_BESAR_PRICE = 30_000

export interface ExistingUserSnapshot {
    id: string
    auth_id: string | null
    email: string
    is_active: boolean
    role: string | null
}

export interface EvaluateRegistrationIdentityInput {
    sessionAuthId: string
    sessionEmail: string
    submittedEmail: string | null
    existingUserByAuthId: ExistingUserSnapshot | null
    existingUserByEmail: ExistingUserSnapshot | null
    existingSubscriptionCount: number
    existingRegistrationCount: number
    isFreeRegistration: boolean
}

export type RegistrationIdentityDecision =
    | {
          ok: true
          mode: "insert" | "update"
          userId: string | null
          authId: string
          email: string
          isBrandNewOnboarding: boolean
          nextIsActive: boolean
      }
    | {
          ok: false
          status: 403 | 409
          error: string
      }

export interface ResolveRegistrationPricingInput {
    type: RegistrationType
    planCodeRaw?: string | null
    groupSize?: number
    sessionCount?: number
}

export type RegistrationPricingResult =
    | {
          ok: true
          calculatedPrice: number
          pricingTier: string
          planCode: SubscriptionPlanCode | null
      }
    | {
          ok: false
          status: 400
          error: string
      }

/**
 * Resolves authoritative server-side pricing from config/plans.ts and lib/pricing.ts.
 * Never accepts or reads client-supplied price values.
 */
export function resolveRegistrationPricing(
    input: ResolveRegistrationPricingInput
): RegistrationPricingResult {
    if (input.type === "REGULAR") {
        const groupSize = input.groupSize ?? NaN
        const sessionCount = input.sessionCount ?? NaN
        if (!Number.isInteger(groupSize) || groupSize < 1 || groupSize > 20) {
            return {
                ok: false,
                status: 400,
                error: "Jumlah orang harus bilangan bulat antara 1-20.",
            }
        }
        if (!Number.isInteger(sessionCount) || sessionCount < 1 || sessionCount > 30) {
            return {
                ok: false,
                status: 400,
                error: "Jumlah pertemuan harus bilangan bulat antara 1-30.",
            }
        }
        const pricing = calculatePrice(groupSize, sessionCount)
        return {
            ok: true,
            calculatedPrice: pricing.subtotal,
            pricingTier: pricing.tier,
            planCode: null,
        }
    }

    if (input.type === "UTS") {
        const normalized = (input.planCodeRaw || "").trim().toUpperCase()
        const resolvedCode: SubscriptionPlanCode | null =
            normalized === "FREE"
                ? "FREE"
                : normalized === "MONTHLY"
                ? "MONTHLY"
                : normalized === "SEMESTER"
                ? "SEMESTER"
                : null

        const unifiedPlan = resolvedCode ? getPlanByCode(resolvedCode) : undefined
        if (!unifiedPlan) {
            return {
                ok: false,
                status: 400,
                error: "Kode paket pendaftaran tidak valid.",
            }
        }

        return {
            ok: true,
            calculatedPrice: unifiedPlan.price,
            pricingTier: unifiedPlan.code,
            planCode: unifiedPlan.code,
        }
    }

    if (input.type === "KELAS_BESAR") {
        return {
            ok: true,
            calculatedPrice: KELAS_BESAR_PRICE,
            pricingTier: "MASTERCLASS",
            planCode: null,
        }
    }

    return {
        ok: false,
        status: 400,
        error: "Tipe registrasi tidak valid.",
    }
}

/**
 * Enforces identity ownership, collision rejection (409), and is_active state rules
 * for POST /api/register.
 *
 * Brand-new onboarding is determined strictly by zero existing subscriptions AND
 * zero existing registrations (never from existingUser.is_active, since the
 * handle_new_user() auth trigger initializes new rows with is_active = true).
 */
export function evaluateRegistrationIdentity(
    input: EvaluateRegistrationIdentityInput
): RegistrationIdentityDecision {
    const normalizedSessionEmail = input.sessionEmail.trim().toLowerCase()
    const normalizedSubmittedEmail = input.submittedEmail?.trim().toLowerCase() || ""

    if (normalizedSubmittedEmail && normalizedSubmittedEmail !== normalizedSessionEmail) {
        return {
            ok: false,
            status: 403,
            error: "Email pendaftaran harus sesuai dengan akun yang sedang login.",
        }
    }

    // Reject if the email belongs to a different auth_id (prevents account takeover / admin escalation)
    if (
        input.existingUserByEmail &&
        input.existingUserByEmail.auth_id !== input.sessionAuthId
    ) {
        return {
            ok: false,
            status: 409,
            error: "Alamat email sudah terdaftar pada akun lain. Silakan masuk melalui halaman login.",
        }
    }

    // Reject if auth_id and email point to two distinct rows
    if (
        input.existingUserByAuthId &&
        input.existingUserByEmail &&
        input.existingUserByAuthId.id !== input.existingUserByEmail.id
    ) {
        return {
            ok: false,
            status: 409,
            error: "Terjadi konflik identitas akun. Silakan hubungi admin.",
        }
    }

    const targetUser = input.existingUserByAuthId ?? input.existingUserByEmail
    const isBrandNewOnboarding =
        input.existingSubscriptionCount === 0 && input.existingRegistrationCount === 0

    if (input.isFreeRegistration) {
        if (!isBrandNewOnboarding) {
            return {
                ok: false,
                status: 409,
                error: "Akun ini sudah pernah terdaftar. Silakan langsung masuk ke dashboard.",
            }
        }

        // Never flip an admin-deactivated account back to active via FREE registration
        if (targetUser && targetUser.is_active === false) {
            return {
                ok: false,
                status: 403,
                error: "Akun kamu sedang dinonaktifkan. Silakan hubungi admin.",
            }
        }

        return {
            ok: true,
            mode: targetUser ? "update" : "insert",
            userId: targetUser?.id ?? null,
            authId: input.sessionAuthId,
            email: normalizedSessionEmail,
            isBrandNewOnboarding: true,
            nextIsActive: true,
        }
    }

    // Paid registration (UTS paid / KELAS_BESAR / REGULAR)
    let nextIsActive: boolean
    if (isBrandNewOnboarding) {
        // Never lock out an ADMIN testing registration; all brand-new students wait for approval
        nextIsActive = targetUser?.role === "ADMIN" ? targetUser.is_active : false
    } else {
        // Existing onboarded user: never downgrade active status and never reactivate a deactivated account
        nextIsActive = targetUser ? targetUser.is_active : false
    }

    return {
        ok: true,
        mode: targetUser ? "update" : "insert",
        userId: targetUser?.id ?? null,
        authId: input.sessionAuthId,
        email: normalizedSessionEmail,
        isBrandNewOnboarding,
        nextIsActive,
    }
}

export function normalizeRegistrationTrack(rawTrack: string | null | undefined): RegistrationTrack {
    const upper = (rawTrack || "").trim().toUpperCase()
    if (upper === "NON_PHYSICS") return "NON_PHYSICS"
    if (upper === "ALL") return "ALL"
    return "PHYSICS_SEM_3"
}

/**
 * Validates that a callback `next` redirect parameter is a safe internal relative path
 * (blocks open redirects such as `//evil.com` or `https://evil.com`).
 */
export function resolveSafeInternalRedirect(rawNext: string | null | undefined): string | null {
    if (!rawNext) return null
    const trimmed = rawNext.trim()
    if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.includes("\\")) {
        return null
    }
    return trimmed
}

