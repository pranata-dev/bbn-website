"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useParams } from "next/navigation"
import Link from "next/link"
import { Trophy, Target, CheckCircle, Home, Clock, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SubmissionData {
    id: string
    score: number | null
    correct_count: number | null
    total_count: number | null
    status: string
    started_at: string
    submitted_at: string | null
    tryouts: {
        id: string
        title: string
        subject: string
        is_practice: boolean
        duration: number
    } | null
}

export default function TryoutResultPage() {
    const searchParams = useSearchParams()
    const params = useParams()
    const id = params.id as string
    const submissionId = searchParams.get("submissionId")

    const fallbackScore = parseFloat(searchParams.get("score") || "0")
    const fallbackCorrect = parseInt(searchParams.get("correct") || "0")
    const fallbackTotal = parseInt(searchParams.get("total") || "0")

    const [submission, setSubmission] = useState<SubmissionData | null>(null)
    const [loading, setLoading] = useState(Boolean(submissionId))

    useEffect(() => {
        if (!submissionId) return

        const fetchSubmission = async () => {
            try {
                const res = await fetch(`/api/submissions/${submissionId}`)
                if (res.ok) {
                    const data = await res.json()
                    if (data.submission) {
                        setSubmission(data.submission)
                    }
                }
            } catch (err) {
                console.error("Failed to load submission data", err)
            } finally {
                setLoading(false)
            }
        }

        fetchSubmission()
    }, [submissionId])

    const score = submission?.score !== null && submission?.score !== undefined 
        ? submission.score 
        : fallbackScore
    const correct = submission?.correct_count !== null && submission?.correct_count !== undefined 
        ? submission.correct_count 
        : fallbackCorrect
    const total = submission?.total_count !== null && submission?.total_count !== undefined 
        ? submission.total_count 
        : fallbackTotal
    const isTimedOut = submission?.status === "TIMED_OUT"

    const getScoreColor = (s: number) => {
        if (s >= 80) return "text-emerald-700 dark:text-emerald-400"
        if (s >= 60) return "text-amber-700 dark:text-amber-400"
        if (s >= 40) return "text-orange-700 dark:text-orange-400"
        return "text-rose-700 dark:text-rose-400"
    }

    const getScoreMessage = (s: number) => {
        if (s >= 80) return "Pemahaman materi luar biasa! Pertahankan konsistensi ini."
        if (s >= 60) return "Hasil yang baik! Tinjau beberapa soal yang keliru untuk memperkuat konsep."
        if (s >= 40) return "Cukup baik, mari perbanyak latihan modul ini untuk hasil maksimal."
        return "Tetap semangat! Buka menu pembahasan untuk memahami langkah-langkah solusi."
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center space-y-3">
                    <Loader2 className="w-8 h-8 animate-spin text-olive mx-auto" />
                    <p className="text-sm font-medium text-foreground/70">Memuat hasil evaluasi...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-xl mx-auto space-y-6 py-4">
            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                {/* Header Card */}
                <div className="bg-olive/10 border-b border-border p-8 text-center">
                    <div className="w-16 h-16 bg-olive/20 text-olive rounded-2xl flex items-center justify-center mx-auto mb-4 border border-olive/30 shadow-inner">
                        <Trophy className="w-8 h-8" />
                    </div>
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <h1 className="text-xl font-bold tracking-tight text-foreground">
                            Tryout Selesai
                        </h1>
                        {isTimedOut && (
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-300">
                                <Clock className="w-3 h-3" /> Waktu Habis
                            </span>
                        )}
                    </div>
                    {submission?.tryouts?.title && (
                        <p className="text-xs font-medium text-muted-foreground mb-2">
                            {submission.tryouts.title}
                        </p>
                    )}
                    <p className="text-sm text-foreground/80 max-w-md mx-auto">
                        {getScoreMessage(score)}
                    </p>
                </div>

                {/* Score & Breakdown */}
                <div className="p-6 md:p-8 space-y-6">
                    <div className="text-center py-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                            Skor Akhir
                        </p>
                        <p className={`text-6xl font-black tracking-tight ${getScoreColor(score)}`}>
                            {score}
                            <span className="text-2xl font-bold text-muted-foreground/70 ml-1">%</span>
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-muted/40 border border-border rounded-xl p-4 text-center">
                            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                                <CheckCircle className="w-4 h-4 text-emerald-600" />
                                <span>Benar</span>
                            </div>
                            <p className="text-2xl font-bold text-foreground">
                                {correct} <span className="text-sm font-normal text-muted-foreground">/ {total}</span>
                            </p>
                        </div>
                        <div className="bg-muted/40 border border-border rounded-xl p-4 text-center">
                            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                                <Target className="w-4 h-4 text-olive" />
                                <span>Akurasi</span>
                            </div>
                            <p className="text-2xl font-bold text-foreground">
                                {total > 0 ? Math.round((correct / total) * 100) : 0}%
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2.5 pt-2">
                        <Button asChild className="w-full bg-olive hover:bg-olive/90 text-white font-semibold h-11">
                            <Link href={`/dashboard/tryouts/${id}/discussion`}>
                                <Target className="w-4 h-4 mr-2" />
                                Buka Pembahasan Soal
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full h-11">
                            <Link href="/dashboard/history">
                                <Clock className="w-4 h-4 mr-2" />
                                Lihat Riwayat Pengerjaan
                            </Link>
                        </Button>
                        <Button asChild variant="ghost" className="w-full h-10 text-muted-foreground">
                            <Link href="/dashboard">
                                <Home className="w-4 h-4 mr-2" />
                                Kembali ke Dashboard
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
