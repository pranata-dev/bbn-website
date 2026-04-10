"use client"

import { useMemo } from "react"
import { calculatePrice, formatRupiah, MAX_WEEKS } from "@/lib/pricing"

interface PricingBreakdownProps {
    groupSize: number
    sessionCount: number
}

export function PricingBreakdown({ groupSize, sessionCount }: PricingBreakdownProps) {
    const pricing = useMemo(() => calculatePrice(groupSize, sessionCount), [groupSize, sessionCount])

    return (
        <div className="bg-[#FEFCF3] border-4 border-[#2b1b11] rounded-xl p-5 space-y-3 shadow-[4px_4px_0px_#2b1b11] font-mono">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-[#2b1b11] flex items-center gap-2">
                    <span className="w-2 h-5 bg-[#e87a5d]"></span>
                    Rincian Biaya
                </h4>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#bed3c6] text-[#2b1b11] px-2.5 py-1 border border-[#2b1b11] shadow-[1px_1px_0px_#2b1b11]">
                    {pricing.tierLabel}
                </span>
            </div>

            {/* Breakdown lines */}
            <div className="space-y-2 text-sm text-[#3c5443] font-semibold">
                <div className="flex justify-between items-center">
                    <span>Harga 1 minggu (dasar)</span>
                    <span className="font-bold text-[#2b1b11]">
                        {formatRupiah(pricing.pricePerPerson)}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span>Jumlah orang</span>
                    <span className="font-bold text-[#2b1b11]">{pricing.groupSize}</span>
                </div>
                <div className="flex justify-between">
                    <span>Jumlah minggu</span>
                    <span className="font-bold text-[#2b1b11]">{pricing.sessionCount} minggu</span>
                </div>
            </div>

            {/* Divider */}
            <div className="border-t-2 border-[#2b1b11]/20" />

            {/* Total */}
            <div className="flex justify-between items-baseline">
                <span className="text-sm font-bold text-[#2b1b11]">
                    Total yang harus dibayarkan
                </span>
                <span className="text-lg font-bold text-[#e87a5d]">
                    {formatRupiah(pricing.subtotal)}
                </span>
            </div>

            {/* Tariff note */}
            <p className="text-xs text-[#3c5443] font-semibold leading-relaxed">
                Harga di atas adalah harga total untuk 1 orang.
                Tarif sudah termasuk konsultasi tugas dan bebas bertanya selama 1 pekan.
                Maksimal {MAX_WEEKS} minggu.
            </p>
        </div>
    )
}
