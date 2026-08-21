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
    <div className="bg-white border border-[#FFEED6] rounded-2xl p-5 space-y-4 shadow-xs font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-[#827148] flex items-center gap-2">
          <span className="w-1.5 h-4 bg-[#E8A07C] rounded-full" />
          Rincian Biaya
        </h4>
        <span className="inline-flex items-center text-xs font-bold bg-[#FFEED6] text-[#827148] px-2.5 py-1 rounded-lg">
          {pricing.tierLabel}
        </span>
      </div>

      {/* Breakdown lines */}
      <div className="space-y-2 text-xs sm:text-sm text-[#827148]/80 font-medium">
        <div className="flex justify-between items-center">
          <span>Harga 1 minggu (dasar)</span>
          <span className="font-bold text-[#827148]">
            {formatRupiah(pricing.pricePerPerson)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Jumlah orang</span>
          <span className="font-bold text-[#827148]">{pricing.groupSize}</span>
        </div>
        <div className="flex justify-between">
          <span>Jumlah minggu</span>
          <span className="font-bold text-[#827148]">{pricing.sessionCount} minggu</span>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[#FFEED6]" />

      {/* Total */}
      <div className="flex justify-between items-end">
        <span className="text-sm font-bold text-[#827148] mb-1">
          Total yang harus dibayarkan
        </span>
        <div className="flex flex-col items-end">
          {(() => {
            const basePrice = pricing.pricePerPerson
            const originalTotalPrice = basePrice * pricing.sessionCount
            const finalPrice = pricing.subtotal

            if (finalPrice < originalTotalPrice) {
              const discountPercentage = Math.round(
                ((originalTotalPrice - finalPrice) / originalTotalPrice) * 100
              )
              return (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center text-[10px] font-bold bg-[#E8A07C] text-white px-2 py-0.5 rounded-md">
                      Hemat {discountPercentage}%
                    </span>
                    <span className="line-through text-[#827148]/50 text-xs">
                      {formatRupiah(originalTotalPrice)}
                    </span>
                  </div>
                  <span className="text-xl font-extrabold text-[#827148]">
                    {formatRupiah(finalPrice)}
                  </span>
                </>
              )
            } else {
              return (
                <span className="text-xl font-extrabold text-[#827148]">
                  {formatRupiah(finalPrice)}
                </span>
              )
            }
          })()}
        </div>
      </div>

      {/* Tariff note */}
      <p className="text-xs text-[#827148]/70 leading-relaxed font-medium pt-2 border-t border-[#FFEED6]/60">
        Harga di atas adalah harga total untuk 1 orang. Tarif sudah termasuk konsultasi tugas dan bebas bertanya selama 1 pekan. Maksimal {MAX_WEEKS} minggu.
      </p>
    </div>
  )
}
