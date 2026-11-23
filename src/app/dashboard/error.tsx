"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle, RotateCcw, LayoutDashboard } from "lucide-react"

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error("Dashboard route error:", error)
    }, [error])

    return (
        <div className="py-16 flex items-center justify-center px-4 font-sans">
            <div className="max-w-md w-full bg-surface-white border-2 border-[#171717] dark:border-[#3F3F46] technical-shadow p-6 text-center space-y-4">
                <div className="w-10 h-10 bg-accent-canary border-2 border-[#171717] flex items-center justify-center mx-auto">
                    <AlertTriangle className="w-5 h-5 text-[#171717]" />
                </div>
                <div className="space-y-1">
                    <h2 className="text-lg font-black text-[#171717] dark:text-[#F5F4EE]">
                        Gagal Memuat Halaman Dashboard
                    </h2>
                    <p className="text-xs text-ink-muted">
                        Terjadi kesalahan saat memproses data belajar Anda.
                    </p>
                </div>
                <div className="flex gap-2.5 pt-2">
                    <button
                        type="button"
                        onClick={() => reset()}
                        className="flex-1 py-2 px-3 bg-accent-canary text-[#171717] border-2 border-[#171717] dark:border-[#FDE047] font-mono text-xs font-bold technical-shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        MUAT ULANG
                    </button>
                    <Link
                        href="/dashboard"
                        className="flex-1 py-2 px-3 bg-surface-white text-[#171717] dark:text-[#F5F4EE] border-2 border-[#171717] dark:border-[#3F3F46] font-mono text-xs font-bold technical-shadow-sm flex items-center justify-center gap-1.5 hover:bg-canvas-paper"
                    >
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        RINGKASAN
                    </Link>
                </div>
            </div>
        </div>
    )
}

