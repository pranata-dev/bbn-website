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
        <div className="rounded-xl border border-warm-gray bg-warm-beige/30 p-4 space-y-3">
            {/* Header */}
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-dark-brown/10 flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-dark-brown" />
                </div>
                <p className="text-sm font-semibold text-foreground">
                    Pembayaran via GoPay
                </p>
            </div>

            {/* Instructional Text */}
            <p className="text-xs text-muted-foreground">
                Silakan lakukan transfer GoPay ke nomor berikut sesuai dengan total tagihan. Pastikan nominal transfer sama persis.
            </p>

            {/* GoPay details */}
            <div className="bg-white/60 rounded-lg p-3 space-y-1.5">
                <p className="text-sm text-muted-foreground">
                    Nomor GoPay
                </p>
                <div className="flex items-center justify-between gap-2">
                    <p className="text-lg font-bold text-dark-brown tracking-wide">
                        {gopayNumber}
                    </p>
                    <button
                        type="button"
                        onClick={handleCopy}
                        aria-label="Salin nomor GoPay"
                        className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-warm-gray hover:bg-warm-beige/50 transition-colors text-muted-foreground hover:text-foreground"
                    >
                        {copied ? (
                            <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
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
                <p className="text-sm text-muted-foreground font-medium mt-1">
                    a.n. <span className="text-foreground">{gopayName}</span>
                </p>
            </div>
        </div>
    )
}
