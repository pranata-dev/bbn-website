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
            <div className="max-w-md w-full bg-white border-2 border-[#18181B] shadow-[4px_4px_0px_0px_#18181B] p-6 text-center space-y-4">
                <div className="w-10 h-10 bg-[#FFD02F] border-2 border-[#18181B] flex items-center justify-center mx-auto">
                    <AlertTriangle className="w-5 h-5 text-[#18181B]" />
                </div>
                <div className="space-y-1">
                    <h2 className="text-lg font-black text-[#18181B]">
                        Gagal Memuat Halaman Dashboard
                    </h2>
                    <p className="text-xs text-[#52525B]">
                        Terjadi kesalahan saat memproses data belajar Anda.
                    </p>
                </div>
                <div className="flex gap-2.5 pt-2">
                    <button
                        type="button"
                        onClick={() => reset()}
                        className="flex-1 py-2 px-3 bg-[#FFD02F] text-[#18181B] border-2 border-[#18181B] font-mono text-xs font-bold shadow-[2px_2px_0px_0px_#18181B] flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        MUAT ULANG
                    </button>
                    <Link
                        href="/dashboard"
                        className="flex-1 py-2 px-3 bg-white text-[#18181B] border-2 border-[#18181B] font-mono text-xs font-bold shadow-[2px_2px_0px_0px_#18181B] flex items-center justify-center gap-1.5"
                    >
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        RINGKASAN
                    </Link>
                </div>
            </div>
        </div>
    )
}

