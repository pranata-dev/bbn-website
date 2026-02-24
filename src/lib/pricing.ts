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
