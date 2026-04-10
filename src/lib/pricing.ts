// Pricing for Kelas Reguler — lookup table approach
// Total price by group size tier × number of weeks (sessions)

export interface PricingTier {
    minGroupSize: number
    maxGroupSize: number
    label: string
    // Index 0 = 1 minggu, index 1 = 2 minggu, ... index 13 = 14 minggu
    prices: number[]
}

export const PRICING_TIERS: PricingTier[] = [
    {
        minGroupSize: 1, maxGroupSize: 1,
        label: "1 Orang",
        prices: [55_000, 105_000, 155_000, 205_000, 255_000, 305_000, 350_000, 400_000, 450_000, 500_000, 550_000, 600_000, 650_000, 700_000],
    },
    {
        minGroupSize: 2, maxGroupSize: 4,
        label: "2–4 Orang",
        prices: [40_000, 75_000, 110_000, 145_000, 180_000, 215_000, 245_000, 280_000, 315_000, 350_000, 385_000, 420_000, 455_000, 490_000],
    },
    {
        minGroupSize: 5, maxGroupSize: 6,
        label: "5–6 Orang",
        prices: [35_000, 65_000, 95_000, 125_000, 155_000, 185_000, 210_000, 240_000, 270_000, 300_000, 330_000, 360_000, 390_000, 420_000],
    },
    {
        minGroupSize: 7, maxGroupSize: 9,
        label: "7–9 Orang",
        prices: [30_000, 55_000, 80_000, 105_000, 130_000, 155_000, 160_000, 185_000, 210_000, 235_000, 260_000, 285_000, 310_000, 335_000],
    },
    {
        minGroupSize: 10, maxGroupSize: Infinity,
        label: "> 10 Orang",
        prices: [25_000, 45_000, 65_000, 85_000, 105_000, 125_000, 140_000, 160_000, 180_000, 200_000, 220_000, 240_000, 260_000, 280_000],
    },
]

export const MAX_WEEKS = 7

export const DISCOUNT_SESSION_THRESHOLD = 3 // kept for compatibility

export type PricingTierLabel = "NORMAL" | "DISCOUNT"

export interface PricingResult {
    pricePerPerson: number
    groupSize: number
    sessionCount: number
    subtotal: number
    tier: PricingTierLabel
    isDiscounted: boolean
    tierLabel: string
}

/**
 * Calculate pricing for Kelas Reguler using the lookup table.
 * sessionCount = number of weeks (minggu), capped at 14.
 */
export function calculatePrice(groupSize: number, sessionCount: number): PricingResult {
    const clampedGroup = Math.max(1, Math.floor(groupSize))
    const clampedSessions = Math.min(MAX_WEEKS, Math.max(1, Math.floor(sessionCount)))

    // Find matching tier
    const tier = PRICING_TIERS.find(
        (t) => clampedGroup >= t.minGroupSize && clampedGroup <= t.maxGroupSize
    ) ?? PRICING_TIERS[PRICING_TIERS.length - 1]

    const subtotal = tier.prices[clampedSessions - 1] ?? tier.prices[tier.prices.length - 1]
    const pricePerPerson = tier.prices[0] // first-week price used as "base" display
    const isDiscounted = clampedSessions >= DISCOUNT_SESSION_THRESHOLD

    return {
        pricePerPerson,
        groupSize: clampedGroup,
        sessionCount: clampedSessions,
        subtotal,
        tier: isDiscounted ? "DISCOUNT" : "NORMAL",
        isDiscounted,
        tierLabel: tier.label,
    }
}

/**
 * Format a number as Indonesian Rupiah string.
 * Example: 60000 -> "Rp 60.000"
 */
export function formatRupiah(amount: number): string {
    return `Rp ${amount.toLocaleString("id-ID")}`
}
