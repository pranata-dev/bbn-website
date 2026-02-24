"use client"

import { useMemo } from "react"
import { calculatePrice, formatRupiah, DISCOUNT_SESSION_THRESHOLD, PRICING_TIERS } from "@/lib/pricing"

interface PricingBreakdownProps {
    groupSize: number
    sessionCount: number
}

export function PricingBreakdown({ groupSize, sessionCount }: PricingBreakdownProps) {
    const pricing = useMemo(() => calculatePrice(groupSize, sessionCount), [groupSize, sessionCount])

    // Get the normal price for strikethrough when discount is active
    const normalPricePerPerson = useMemo(() => {
        if (!pricing.isDiscounted) return null
        const tier = PRICING_TIERS.find(
            (t) => pricing.groupSize >= t.minGroupSize && pricing.groupSize <= t.maxGroupSize
        )
        return tier?.normalPrice ?? null
    }, [pricing])

    return (
        <div className="rounded-xl border border-warm-gray bg-warm-beige/20 p-4 space-y-3 transition-all duration-300">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-foreground">
                    Rincian Biaya
                </h4>
                {pricing.isDiscounted && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full animate-fade-up">
                        ✨ Paket Hemat {DISCOUNT_SESSION_THRESHOLD}+ Pertemuan
                    </span>
                )}
            </div>

            {/* Breakdown lines */}
            <div className="space-y-1.5 text-sm text-muted-foreground">
                <div className="flex justify-between items-center">
                    <span>Harga per orang / pertemuan</span>
                    <span className="font-medium text-foreground flex items-center gap-2">
                        {normalPricePerPerson && (
                            <span className="text-xs line-through text-muted-foreground">
                                {formatRupiah(normalPricePerPerson)}
                            </span>
                        )}
                        {formatRupiah(pricing.pricePerPerson)}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span>Jumlah orang</span>
                    <span>{pricing.groupSize}</span>
                </div>
                <div className="flex justify-between">
                    <span>Jumlah pertemuan</span>
                    <span>{pricing.sessionCount}</span>
                </div>
            </div>

            {/* Divider */}
            <div className="border-t border-warm-gray" />

            {/* Total */}
            <div className="flex justify-between items-baseline">
                <span className="text-sm font-medium text-foreground">
                    Total yang harus dibayarkan
                </span>
                <span className="text-lg font-bold text-dark-brown">
                    {formatRupiah(pricing.subtotal)}
                </span>
            </div>

            {/* Tariff note */}
            <p className="text-xs text-muted-foreground leading-relaxed">
                Tarif untuk 1 orang dan 1 pertemuan.
                Tarif sudah termasuk konsultasi tugas dan bebas bertanya selama 1 pekan.
            </p>
        </div>
    )
}
