"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle, RotateCcw, Shield } from "lucide-react"

export default function AdminError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error("Admin route error:", error)
    }, [error])

    return (
        <div className="py-16 flex items-center justify-center px-4 font-sans">
            <div className="max-w-md w-full bg-surface-white border-2 border-[#171717] shadow-[4px_4px_0px_0px_#171717] p-6 text-center space-y-4">
                <div className="w-10 h-10 bg-accent-canary border-2 border-[#171717] flex items-center justify-center mx-auto">
                    <AlertTriangle className="w-5 h-5 text-[#171717]" />
                </div>
                <div className="space-y-1">
                    <h2 className="text-lg font-extrabold text-[#171717]">
                        Gagal Memuat Modul Admin
                    </h2>
                    <p className="text-xs text-ink-muted">
                        Terjadi kendala saat mengambil data operasional administrator.
                    </p>
                </div>
                <div className="flex gap-2.5 pt-2">
                    <button
                        type="button"
                        onClick={() => reset()}
                        className="flex-1 py-2 px-3 bg-accent-canary text-[#171717] border-2 border-[#171717] font-mono text-xs font-bold shadow-[2px_2px_0px_0px_#171717] flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        COBA LAGI
                    </button>
                    <Link
                        href="/admin"
                        className="flex-1 py-2 px-3 bg-surface-white text-[#171717] border-2 border-[#171717] font-mono text-xs font-bold shadow-[2px_2px_0px_0px_#171717] flex items-center justify-center gap-1.5"
                    >
                        <Shield className="w-3.5 h-3.5" />
                        DASHBOARD
                    </Link>
                </div>
            </div>
        </div>
    )
}

