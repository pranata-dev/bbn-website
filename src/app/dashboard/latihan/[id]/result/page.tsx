"use client"

import { useSearchParams, useParams } from "next/navigation"
import Link from "next/link"
import { Trophy, Target, CheckCircle, Home } from "lucide-react"

export default function LatihanResultPage() {
    const searchParams = useSearchParams()
    const params = useParams()
    const id = params.id as string

    const score = parseFloat(searchParams.get("score") || "0")
    const correct = parseInt(searchParams.get("correct") || "0")
    const total = parseInt(searchParams.get("total") || "0")

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-[#3c5443]"
        if (score >= 60) return "text-[#b8860b]"
        if (score >= 40) return "text-[#e87a5d]"
        return "text-red-500"
    }

    const getScoreMessage = (score: number) => {
        if (score >= 80) return "Luar biasa! 🎉"
        if (score >= 60) return "Bagus, terus tingkatkan! 👍"
        if (score >= 40) return "Cukup, perlu latihan lagi. 💪"
        return "Jangan menyerah, terus belajar! 📚"
    }

    return (
        <div className="max-w-lg mx-auto space-y-6 font-mono">
            <div className="bg-[#FEFCF3] border-4 border-[#2b1b11] shadow-[6px_6px_0px_#2b1b11] text-center overflow-hidden">
                {/* Score header */}
                <div className="bg-[#2b1b11] p-8 border-b-4 border-[#2b1b11]">
                    <div className="w-16 h-16 bg-[#e87a5d] border-4 border-[#FEFCF3] flex items-center justify-center mx-auto mb-4 shadow-[3px_3px_0px_rgba(0,0,0,0.3)]">
                        <Trophy className="w-8 h-8 text-[#FEFCF3] stroke-[2]" />
                    </div>
                    <h2 className="text-lg font-bold text-[#FEFCF3] mb-2" style={{ fontFamily: "var(--font-press-start)", fontSize: "0.9rem" }}>
                        Latihan Selesai!
                    </h2>
                    <p className="text-[#FEFCF3]/70 text-sm font-bold">{getScoreMessage(score)}</p>
                </div>

                <div className="p-8 space-y-6">
                    {/* Score display */}
                    <div>
                        <p className="text-[10px] text-[#3c5443] font-bold uppercase tracking-wider mb-1">Skor Kamu</p>
                        <p className={`text-5xl font-extrabold ${getScoreColor(score)}`} style={{ fontFamily: "var(--font-press-start)" }}>
                            {score}%
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#bed3c6] border-4 border-[#2b1b11] p-4 shadow-[2px_2px_0px_#2b1b11]">
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <CheckCircle className="w-4 h-4 text-[#3c5443] stroke-[2]" />
                                <span className="text-[10px] text-[#3c5443] font-bold uppercase tracking-wider">Benar</span>
                            </div>
                            <p className="text-xl font-extrabold text-[#2b1b11]">
                                {correct}/{total}
                            </p>
                        </div>
                        <div className="bg-[#bed3c6] border-4 border-[#2b1b11] p-4 shadow-[2px_2px_0px_#2b1b11]">
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <Target className="w-4 h-4 text-[#2b1b11] stroke-[2]" />
                                <span className="text-[10px] text-[#3c5443] font-bold uppercase tracking-wider">Akurasi</span>
                            </div>
                            <p className="text-xl font-extrabold text-[#2b1b11]">
                                {total > 0 ? Math.round((correct / total) * 100) : 0}%
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3 pt-2">
                        <Link
                            href={`/dashboard/latihan/${id}/discussion`}
                            className="w-full inline-flex items-center justify-center gap-2 bg-[#e87a5d] text-[#FEFCF3] font-bold text-sm px-6 py-3 border-2 border-[#2b1b11] shadow-[3px_3px_0px_#2b1b11] hover:shadow-[4px_4px_0px_#2b1b11] hover:-translate-y-0.5 transition-all"
                        >
                            <Target className="w-4 h-4 stroke-[2]" />
                            Lihat Pembahasan
                        </Link>
                        <Link
                            href="/dashboard/leaderboard"
                            className="w-full inline-flex items-center justify-center gap-2 bg-[#FEFCF3] text-[#2b1b11] font-bold text-sm px-6 py-3 border-2 border-[#2b1b11] shadow-[3px_3px_0px_#2b1b11] hover:shadow-[4px_4px_0px_#2b1b11] hover:-translate-y-0.5 transition-all"
                        >
                            <Trophy className="w-4 h-4 stroke-[2]" />
                            Lihat Leaderboard
                        </Link>
                        <Link
                            href="/dashboard"
                            className="w-full inline-flex items-center justify-center gap-2 bg-[#bed3c6] text-[#2b1b11] font-bold text-sm px-6 py-3 border-2 border-[#2b1b11] shadow-[3px_3px_0px_#2b1b11] hover:shadow-[4px_4px_0px_#2b1b11] hover:-translate-y-0.5 transition-all"
                        >
                            <Home className="w-4 h-4 stroke-[2]" />
                            Kembali ke Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
