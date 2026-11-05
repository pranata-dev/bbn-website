"use client"

import { useState } from "react"
import { toast } from "sonner"
import { BUSINESS_CONFIG } from "@/config/business"

export function GoPayInfo() {
  const [copied, setCopied] = useState(false)

  const gopayNumber = BUSINESS_CONFIG.payment.gopayNumber
  const gopayName = BUSINESS_CONFIG.payment.gopayHolder

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(gopayNumber)
      setCopied(true)
      toast.success("Nomor GoPay berhasil disalin!")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Gagal menyalin nomor GoPay.")
    }
  }

  return (
    <div className="bg-white border border-[#FFEED6] rounded-2xl p-5 space-y-3 shadow-xs font-sans">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-[#FFEED6] flex items-center justify-center border border-[#827148]/10">
          <div className="w-3 h-3 rounded-xs bg-[#A5AF79]" />
        </div>
        <p className="text-sm font-bold text-[#827148]">
          Pembayaran via GoPay
        </p>
      </div>

      {/* Instructional Text */}
      <p className="text-xs text-[#827148]/75 leading-relaxed font-medium">
        Silakan lakukan transfer GoPay ke nomor berikut sesuai dengan total tagihan. Pastikan nominal transfer sama persis.
      </p>

      {/* GoPay details box */}
      <div className="bg-[#FFEED6]/30 border border-[#FFEED6] rounded-xl p-3.5 space-y-2">
        <p className="text-[11px] font-semibold text-[#827148]/70 uppercase tracking-wider">
          Nomor GoPay
        </p>
        <div className="flex items-center justify-between gap-2">
          <p className="text-lg font-bold text-[#827148] tracking-wide">
            {gopayNumber}
          </p>
          <button
            type="button"
            onClick={handleCopy}
            aria-label="Salin nomor GoPay"
            className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-[#A5AF79] hover:bg-[#949e6a] text-white shadow-2xs transition-colors cursor-pointer"
          >
            {copied ? "Tersalin ✓" : "Salin"}
          </button>
        </div>
        <p className="text-xs text-[#827148]/80 font-medium">
          a.n. <span className="text-[#827148] font-bold">{gopayName}</span>
        </p>
      </div>
    </div>
  )
}
