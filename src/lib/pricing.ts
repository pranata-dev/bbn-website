// Pricing tiers for Kelas Reguler
// Price is per person per meeting (in IDR)

export interface PricingTier {
    minGroupSize: number
    maxGroupSize: number
    normalPrice: number    // sessions < 3
    discountPrice: number  // sessions >= 3
}

export const PRICING_TIERS: PricingTier[] = [
    { minGroupSize: 1, maxGroupSize: 2, normalPrice: 60_000, discountPrice: 55_000 },
    { minGroupSize: 3, maxGroupSize: 5, normalPrice: 50_000, discountPrice: 45_000 },
    { minGroupSize: 6, maxGroupSize: Infinity, normalPrice: 45_000, discountPrice: 40_000 },
]

export const DISCOUNT_SESSION_THRESHOLD = 3

export type PricingTierLabel = "NORMAL" | "DISCOUNT"

export interface PricingResult {
    pricePerPerson: number
    groupSize: number
    sessionCount: number
    subtotal: number
    tier: PricingTierLabel
    isDiscounted: boolean
}

/**
 * Calculate pricing for Kelas Reguler.
 * Used by both client (live preview) and server (validation).
 */
export function calculatePrice(groupSize: number, sessionCount: number): PricingResult {
    const clampedGroup = Math.max(1, Math.floor(groupSize))
    const clampedSessions = Math.max(1, Math.floor(sessionCount))

    // Find matching tier
    const tier = PRICING_TIERS.find(
        (t) => clampedGroup >= t.minGroupSize && clampedGroup <= t.maxGroupSize
    ) ?? PRICING_TIERS[PRICING_TIERS.length - 1]

    const isDiscounted = clampedSessions >= DISCOUNT_SESSION_THRESHOLD
    const pricePerPerson = isDiscounted ? tier.discountPrice : tier.normalPrice
    const subtotal = pricePerPerson * clampedGroup * clampedSessions

    return {
        pricePerPerson,
        groupSize: clampedGroup,
        sessionCount: clampedSessions,
        subtotal,
        tier: isDiscounted ? "DISCOUNT" : "NORMAL",
        isDiscounted,
    }
}
