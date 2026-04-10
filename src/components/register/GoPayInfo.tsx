"use client"

import { useState } from "react"
import { Copy, Check, Wallet } from "lucide-react"
import { toast } from "sonner"

export function GoPayInfo() {
    const [copied, setCopied] = useState(false)

    const gopayNumber = process.env.NEXT_PUBLIC_GOPAY_NUMBER || "Nomor GoPay belum diatur"
    const gopayName = process.env.NEXT_PUBLIC_GOPAY_NAME || "Nama belum diatur"

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
        <div className="bg-[#FEFCF3] border-4 border-[#2b1b11] rounded-xl p-5 space-y-3 shadow-[4px_4px_0px_#2b1b11] font-mono">
            {/* Header */}
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#bed3c6] border-2 border-[#2b1b11] flex items-center justify-center shadow-[1px_1px_0px_#2b1b11]">
                    <Wallet className="w-4 h-4 text-[#2b1b11] stroke-[2]" />
                </div>
                <p className="text-sm font-bold text-[#2b1b11]">
                    Pembayaran via GoPay
                </p>
            </div>

            {/* Instructional Text */}
            <p className="text-xs text-[#3c5443] font-semibold">
                Silakan lakukan transfer GoPay ke nomor berikut sesuai dengan total tagihan. Pastikan nominal transfer sama persis.
            </p>

            {/* GoPay details */}
            <div className="bg-[#bed3c6]/30 border-2 border-[#2b1b11] p-3 space-y-1.5">
                <p className="text-xs text-[#3c5443] font-semibold">
                    Nomor GoPay
                </p>
                <div className="flex items-center justify-between gap-2">
                    <p className="text-lg font-bold text-[#2b1b11] tracking-wide">
                        {gopayNumber}
                    </p>
                    <button
                        type="button"
                        onClick={handleCopy}
                        aria-label="Salin nomor GoPay"
                        className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 border-2 border-[#2b1b11] shadow-[1px_1px_0px_#2b1b11] bg-[#FEFCF3] hover:bg-[#bed3c6] transition-colors text-[#2b1b11]"
                    >
                        {copied ? (
                            <>
                                <Check className="w-3.5 h-3.5 text-[#3c7a56]" />
                                Tersalin
                            </>
                        ) : (
                            <>
                                <Copy className="w-3.5 h-3.5" />
                                Salin
                            </>
                        )}
                    </button>
                </div>
                <p className="text-sm text-[#3c5443] font-semibold mt-1">
                    a.n. <span className="text-[#2b1b11] font-bold">{gopayName}</span>
                </p>
            </div>
        </div>
    )
}
