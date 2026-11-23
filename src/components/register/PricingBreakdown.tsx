"use client"

import { useMemo } from "react"
import { calculatePrice, MAX_WEEKS } from "@/lib/pricing"

interface PricingBreakdownProps {
  groupSize: number
  sessionCount: number
}

export function PricingBreakdown({ groupSize, sessionCount }: PricingBreakdownProps) {
  const pricing = useMemo(() => calculatePrice(groupSize, sessionCount), [groupSize, sessionCount])

  return (
    <div className="bg-surface-white border-2 border-[#171717] dark:border-[#3F3F46] p-5 space-y-4 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-[#171717] dark:text-[#F5F4EE]">
          Rincian Biaya
        </h4>
        <span className="inline-flex items-center text-xs font-mono font-bold bg-accent-canary text-[#171717] border border-[#171717] px-2.5 py-0.5">
          {pricing.tierLabel}
        </span>
      </div>

      {/* Breakdown lines */}
      <div className="space-y-2 text-xs sm:text-sm text-ink-muted font-medium">
        <div className="flex justify-between items-center">
          <span>Biaya per minggu</span>
          <span className="font-mono font-bold text-[#171717] dark:text-[#F5F4EE]">
            Coming Soon
          </span>
        </div>
        <div className="flex justify-between">
          <span>Jumlah orang</span>
          <span className="font-bold text-[#171717] dark:text-[#F5F4EE]">{pricing.groupSize}</span>
        </div>
        <div className="flex justify-between">
          <span>Jumlah minggu</span>
          <span className="font-bold text-[#171717] dark:text-[#F5F4EE]">{pricing.sessionCount} minggu</span>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-border-grid" />

      {/* Total */}
      <div className="flex justify-between items-center">
        <span className="text-sm font-bold text-[#171717] dark:text-[#F5F4EE]">
          Total Biaya
        </span>
        <span className="font-mono text-lg font-extrabold text-[#171717] dark:text-[#F5F4EE]">
          Coming Soon
        </span>
      </div>

      {/* Note */}
      <p className="text-xs text-ink-muted leading-relaxed pt-2 border-t border-border-grid">
        Rincian tarif kelas reguler (maksimal {MAX_WEEKS} minggu) akan segera diumumkan.
      </p>
    </div>
  )
}
