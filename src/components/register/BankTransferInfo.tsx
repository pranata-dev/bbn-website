"use client"

import { useState } from "react"
import { Copy, Check, Landmark } from "lucide-react"
import { toast } from "sonner"

export function BankTransferInfo() {
    const [copied, setCopied] = useState(false)

    const bankName = process.env.NEXT_PUBLIC_BANK_NAME || "—"
    const accountNumber = process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER || "—"
    const accountHolder = process.env.NEXT_PUBLIC_BANK_ACCOUNT_HOLDER || "—"

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(accountNumber)
            setCopied(true)
            toast.success("Nomor rekening berhasil disalin!")
            setTimeout(() => setCopied(false), 2000)
        } catch {
            toast.error("Gagal menyalin nomor rekening.")
        }
    }

    return (
        <div className="rounded-xl border border-warm-gray bg-warm-beige/30 p-4 space-y-3">
            {/* Header */}
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-dark-brown/10 flex items-center justify-center">
                    <Landmark className="w-4 h-4 text-dark-brown" />
                </div>
                <p className="text-sm font-semibold text-foreground">
                    Silakan transfer ke:
                </p>
            </div>

            {/* Bank details */}
            <div className="bg-white/60 rounded-lg p-3 space-y-1.5">
                <p className="text-sm text-muted-foreground">
                    Bank <span className="font-semibold text-foreground">{bankName}</span>
                </p>
                <div className="flex items-center justify-between gap-2">
                    <p className="text-lg font-bold text-dark-brown tracking-wide">
                        {accountNumber}
                    </p>
                    <button
                        type="button"
                        onClick={handleCopy}
                        aria-label="Salin nomor rekening"
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
                <p className="text-sm text-muted-foreground">
                    A/n: <span className="font-medium text-foreground">{accountHolder}</span>
                </p>
            </div>
        </div>
    )
}
