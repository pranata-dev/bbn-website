"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useParams } from "next/navigation"
import Link from "next/link"
import { Trophy, Target, CheckCircle, Home } from "lucide-react"

interface VerifiedSubmission {
    score: number | null
    correct_count: number | null
    total_count: number | null
}

export default function LatihanResultPage() {
    const searchParams = useSearchParams()
    const params = useParams()
    const id = params.id as string

    const fallbackScore = parseFloat(searchParams.get("score") || "0")
    const fallbackCorrect = parseInt(searchParams.get("correct") || "0", 10)
    const fallbackTotal = parseInt(searchParams.get("total") || "0", 10)

    const [verified, setVerified] = useState<VerifiedSubmission | null>(null)

    useEffect(() => {
        if (!id) return
        fetch(`/api/tryouts/${id}/submission`)
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (data?.submission) {
                    setVerified(data.submission as VerifiedSubmission)
                }
            })
            .catch(() => {})
    }, [id])

    const score =
        verified?.score !== null && verified?.score !== undefined
            ? verified.score
            : fallbackScore
    const correct =
        verified?.correct_count !== null && verified?.correct_count !== undefined
            ? verified.correct_count
            : fallbackCorrect
    const total =
        verified?.total_count !== null && verified?.total_count !== undefined
            ? verified.total_count
            : fallbackTotal

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-emerald-700 dark:text-emerald-400"
        if (score >= 60) return "text-amber-700 dark:text-amber-400"
        if (score >= 40) return "text-alert-rust"
        return "text-rose-700 dark:text-rose-400"
    }

    const getScoreMessage = (score: number) => {
        if (score >= 80) return "Hasil sangat baik. Pertahankan konsistensi belajarmu."
        if (score >= 60) return "Hasil cukup baik. Tinjau kembali beberapa soal untuk memperkuat konsep."
        if (score >= 40) return "Terus berlatih. Pelajari pembahasan agar pemahaman makin matang."
        return "Jangan menyerah. Buka pembahasan soal untuk memahami langkah penyelesaian."
    }

    return (
        <div className="max-w-xl mx-auto space-y-6 font-sans py-4">
            <div className="bg-surface-white border-2 border-[#171717] dark:border-[#3F3F46] technical-shadow text-center overflow-hidden relative tick-corner">
                {/* Score header */}
                <div className="bg-canvas-paper p-8 border-b-2 border-[#171717] dark:border-[#3F3F46]">
                    <div className="w-16 h-16 bg-accent-canary border-2 border-[#171717] flex items-center justify-center mx-auto mb-4 technical-shadow-sm">
                        <Trophy className="w-8 h-8 text-[#171717] stroke-[2]" />
                    </div>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 bg-alert-rust text-white inline-block mb-2">
                        EVALUASI LATIHAN SELESAI
                    </span>
                    <h1 className="text-2xl font-black text-[#171717] dark:text-[#F5F4EE] tracking-tight mb-1.5">
                        Latihan Selesai
                    </h1>
                    <p className="text-ink-muted text-sm max-w-md mx-auto leading-relaxed">
                        {getScoreMessage(score)}
                    </p>
                </div>

                <div className="p-6 sm:p-8 space-y-6">
                    {/* Score display */}
                    <div>
                        <p className="font-mono text-[10px] text-ink-muted font-bold uppercase tracking-wider mb-1">
                            SKOR KAMU
                        </p>
                        <p className={`font-mono text-5xl sm:text-6xl font-black tracking-tight ${getScoreColor(score)}`}>
                            {score}
                            <span className="text-2xl font-bold text-ink-muted ml-1">%</span>
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-canvas-paper border-2 border-[#171717] dark:border-[#3F3F46] p-4 technical-shadow-sm">
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <CheckCircle className="w-4 h-4 text-emerald-700 dark:text-emerald-400 stroke-[2]" />
                                <span className="font-mono text-[10px] text-ink-muted font-bold uppercase tracking-wider">Benar</span>
                            </div>
                            <p className="font-mono text-2xl font-black text-[#171717] dark:text-[#F5F4EE]">
                                {correct} <span className="text-sm font-bold text-ink-muted">/ {total}</span>
                            </p>
                        </div>
                        <div className="bg-canvas-paper border-2 border-[#171717] dark:border-[#3F3F46] p-4 technical-shadow-sm">
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <Target className="w-4 h-4 text-alert-rust stroke-[2]" />
                                <span className="font-mono text-[10px] text-ink-muted font-bold uppercase tracking-wider">Akurasi</span>
                            </div>
                            <p className="font-mono text-2xl font-black text-[#171717] dark:text-[#F5F4EE]">
                                {total > 0 ? Math.round((correct / total) * 100) : 0}%
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3 pt-2">
                        <Link
                            href={`/dashboard/latihan/${id}/discussion`}
                            className="w-full inline-flex items-center justify-center gap-2 bg-accent-canary hover:bg-[#fde667] text-[#171717] font-mono font-black text-xs uppercase tracking-wider px-6 py-3.5 border-2 border-[#171717] dark:border-[#FDE047] technical-shadow transition-all"
                        >
                            <Target className="w-4 h-4 stroke-[2]" />
                            Lihat Pembahasan
                        </Link>
                        <Link
                            href="/dashboard/leaderboard"
                            className="w-full inline-flex items-center justify-center gap-2 bg-surface-white hover:bg-canvas-paper dark:hover:bg-[#22252E] text-[#171717] dark:text-[#F5F4EE] font-mono font-bold text-xs uppercase tracking-wider px-6 py-3 border-2 border-[#171717] dark:border-[#3F3F46] technical-shadow-sm transition-all"
                        >
                            <Trophy className="w-4 h-4 stroke-[2]" />
                            Lihat Leaderboard
                        </Link>
                        <Link
                            href="/dashboard"
                            className="w-full inline-flex items-center justify-center gap-2 bg-canvas-paper hover:bg-surface-white dark:hover:bg-[#22252E] text-[#171717] dark:text-[#F5F4EE] font-mono font-bold text-xs uppercase tracking-wider px-6 py-3 border-2 border-[#171717] dark:border-[#3F3F46] transition-all"
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
