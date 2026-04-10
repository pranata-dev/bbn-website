"use client"

import { History } from "lucide-react"

export default function HistoryPage() {
    return (
        <div className="space-y-6 font-mono">
            <div className="bg-[#FEFCF3] border-4 border-[#2b1b11] rounded-2xl p-5 shadow-[6px_6px_0px_#2b1b11]">
                <h1
                    className="text-lg md:text-xl font-extrabold text-[#2b1b11] mb-1 flex items-center gap-3"
                    style={{ fontFamily: "var(--font-press-start)", lineHeight: 1.4 }}
                >
                    <History className="w-6 h-6 text-[#e87a5d] stroke-[2]" />
                    Riwayat Tryout
                </h1>
                <p className="text-sm text-[#3c5443] font-bold">Lihat semua tryout yang pernah kamu kerjakan.</p>
            </div>

            <div className="bg-[#FEFCF3] border-4 border-[#2b1b11] shadow-[4px_4px_0px_#2b1b11]">
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-14 h-14 bg-[#bed3c6] border-2 border-[#2b1b11] flex items-center justify-center shadow-[2px_2px_0px_#2b1b11] mb-4">
                        <History className="w-7 h-7 text-[#2b1b11] stroke-[2]" />
                    </div>
                    <h3 className="text-sm font-extrabold text-[#2b1b11] mb-1" style={{ fontFamily: "var(--font-press-start)" }}>
                        Belum Ada Riwayat
                    </h3>
                    <p className="text-xs text-[#3c5443] font-bold max-w-sm">
                        Riwayat tryout akan muncul di sini setelah kamu menyelesaikan tryout pertama.
                    </p>
                </div>
            </div>
        </div>
    )
}
