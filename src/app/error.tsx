"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle, RotateCcw, Home } from "lucide-react"

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error("Global route error:", error)
    }, [error])

    return (
        <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-6 font-sans">
            <div className="max-w-md w-full bg-white border-2 border-[#18181B] shadow-[6px_6px_0px_0px_#18181B] p-8 text-center space-y-5">
                <div className="w-12 h-12 bg-[#FFD02F] border-2 border-[#18181B] flex items-center justify-center mx-auto shadow-[2px_2px_0px_0px_#18181B]">
                    <AlertTriangle className="w-6 h-6 text-[#18181B]" />
                </div>
                <div className="space-y-1.5">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#71717A]">
                        SYSTEM EXCEPTION // 500
                    </span>
                    <h1 className="text-xl font-black text-[#18181B]">
                        Terjadi Kendala Teknis
                    </h1>
                    <p className="text-xs text-[#52525B] leading-relaxed">
                        Halaman gagal dimuat karena gangguan sementara. Silakan muat ulang halaman atau kembali ke beranda.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                        type="button"
                        onClick={() => reset()}
                        className="flex-1 py-2.5 px-4 bg-[#FFD02F] text-[#18181B] border-2 border-[#18181B] font-mono text-xs font-bold shadow-[2px_2px_0px_0px_#18181B] hover:translate-y-0.5 hover:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        COBA LAGI
                    </button>
                    <Link
                        href="/"
                        className="flex-1 py-2.5 px-4 bg-white text-[#18181B] border-2 border-[#18181B] font-mono text-xs font-bold shadow-[2px_2px_0px_0px_#18181B] hover:translate-y-0.5 hover:shadow-none transition-all flex items-center justify-center gap-1.5"
                    >
                        <Home className="w-3.5 h-3.5" />
                        BERANDA
                    </Link>
                </div>
            </div>
        </div>
    )
}

