"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Clock, FileText, ArrowLeft, Play, AlertTriangle, Loader2, CheckCircle2 } from "lucide-react"
import { QuestionCategory } from "@/types"

interface TryoutDetail {
    id: string
    title: string
    description: string | null
    category: QuestionCategory | null
    duration: number
    status: string
    max_attempts: number
    tryout_questions: { id: string }[] | { count: number }[]
    subject?: string
}

const CATEGORY_LABELS: Record<string, string> = {
    WEEK_1: "Minggu 1: Medan Listrik",
    WEEK_2: "Minggu 2: Hukum Gauss",
    WEEK_3: "Minggu 3: Potensial Listrik",
    WEEK_4: "Minggu 4: Kapasitansi & Dielektrik",
    WEEK_5: "Minggu 5: Arus & Resistansi",
    WEEK_6: "Minggu 6: Rangkaian DC",
    WEEK_7: "Minggu 7: Medan Magnet",
    SERIES_POWER: "Deret Kuasa & Taylor",
    COMPLEX_NUMBERS: "Bilangan Kompleks",
    LINEAR_ALGEBRA: "Aljabar Linear",
}

export default function TryoutDetailPage() {
    const { id } = useParams<{ id: string }>()
    const router = useRouter()
    const [tryout, setTryout] = useState<TryoutDetail | null>(null)
    const [submission, setSubmission] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [showConfirm, setShowConfirm] = useState(false)
    const [userQuota, setUserQuota] = useState<{ used: number; max: number }>({ used: 0, max: 0 })

    useEffect(() => {
        const loadPageData = async () => {
            setLoading(true)
            try {
                // Fetch tryout details
                const resTryout = await fetch("/api/tryouts")
                const dataTryout = await resTryout.json()
                const found = (dataTryout.tryouts || []).find((t: any) => t.id === id)
                
                if (found) {
                    setTryout(found)
                    
                    // Fetch submission status
                    const resSub = await fetch(`/api/tryouts/${id}/submission`)
                    if (resSub.ok) {
                        const dataSub = await resSub.json()
                        setSubmission(dataSub.submission)
                    }

                    // Fetch user stats for global quota
                    const resStats = await fetch(`/api/dashboard/stats?subject=${found.subject || "FISDAS2"}`)
                    if (resStats.ok) {
                        const statsData = await resStats.json()
                        setUserQuota({
                            used: statsData.tryoutStats?.completed || 0,
                            max: statsData.tryoutStats?.maxQuota || 0
                        })
                    }
                }
            } catch (error) {
                console.error("Failed to load tryout data:", error)
            } finally {
                setLoading(false)
            }
        }

        loadPageData()
    }, [id])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center space-y-3">
                    <Loader2 className="w-8 h-8 animate-spin text-olive mx-auto" />
                    <p className="text-sm font-medium text-foreground/70">Memuat detail tryout...</p>
                </div>
            </div>
        )
    }

    if (!tryout) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center max-w-md mx-auto p-6">
                <div className="w-14 h-14 bg-muted text-muted-foreground rounded-2xl flex items-center justify-center mb-4 border border-border">
                    <FileText className="w-7 h-7" />
                </div>
                <h2 className="text-lg font-bold text-foreground mb-2">Tryout Tidak Ditemukan</h2>
                <p className="text-sm text-muted-foreground mb-6">Tryout ini tidak tersedia atau belum diaktifkan oleh pengajar.</p>
                <Button asChild variant="outline">
                    <Link href="/dashboard/tryouts">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Kembali ke Daftar Tryout
                    </Link>
                </Button>
            </div>
        )
    }

    const questionCount = Array.isArray(tryout.tryout_questions)
        ? tryout.tryout_questions.length
        : 0
    const remainingQuota = Math.max(0, userQuota.max - userQuota.used)
    const isCompleted = submission && (submission.status === "SUBMITTED" || submission.status === "COMPLETED" || submission.status === "TIMED_OUT")

    return (
        <div className="max-w-2xl mx-auto space-y-6 py-2">
            <div>
                <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2 text-muted-foreground">
                    <Link href="/dashboard/tryouts">
                        <ArrowLeft className="w-4 h-4 mr-1.5" />
                        Kembali ke Daftar Tryout
                    </Link>
                </Button>
            </div>

            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                {/* Header */}
                <div className="border-b border-border bg-muted/30 p-6 md:p-8">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-olive/15 text-olive">
                            {tryout.category ? (CATEGORY_LABELS[tryout.category] || tryout.category) : "Semua Materi"}
                        </span>
                        <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                            {tryout.subject || "FISDAS2"}
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        {tryout.title}
                    </h1>
                    {tryout.description && (
                        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                            {tryout.description}
                        </p>
                    )}
                </div>

                <div className="p-6 md:p-8 space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3.5 bg-muted/40 border border-border rounded-xl p-4">
                            <div className="w-10 h-10 rounded-lg bg-olive/15 text-olive flex items-center justify-center shrink-0">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Durasi</p>
                                <p className="text-base font-bold text-foreground">{tryout.duration} Menit</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3.5 bg-muted/40 border border-border rounded-xl p-4">
                            <div className="w-10 h-10 rounded-lg bg-olive/15 text-olive flex items-center justify-center shrink-0">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Jumlah Soal</p>
                                <p className="text-base font-bold text-foreground">{questionCount > 0 ? `${questionCount} Soal` : "Tersedia"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Rules */}
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 space-y-2">
                        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-semibold text-xs tracking-wide uppercase">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            <span>Ketentuan Pengerjaan</span>
                        </div>
                        <ul className="text-xs text-foreground/80 space-y-1 list-disc list-inside leading-relaxed pl-1">
                            <li>Tryout dimulai seketika setelah menekan tombol konfirmasi.</li>
                            <li>Timer akan berjalan mundur selama {tryout.duration} menit secara server-side.</li>
                            <li>Hindari berpindah tab untuk menjaga konsentrasi dan integritas ujian.</li>
                            <li>Jika waktu habis, lembar jawaban otomatis terkirim dan dinilai.</li>
                        </ul>
                    </div>

                    {/* Action buttons */}
                    {submission && submission.status === "IN_PROGRESS" ? (
                        <div className="space-y-3">
                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 text-center">
                                <p className="text-xs font-medium text-blue-800 dark:text-blue-300">
                                    Kamu memiliki sesi aktif yang sedang berjalan.
                                </p>
                            </div>
                            <Button asChild className="w-full bg-olive hover:bg-olive/90 text-white font-semibold h-11">
                                <Link href={`/dashboard/tryouts/${id}/attempt`}>
                                    <Play className="w-4 h-4 mr-2" />
                                    Lanjutkan Tryout
                                </Link>
                            </Button>
                        </div>
                    ) : isCompleted ? (
                        <div className="space-y-4">
                            <div className="bg-muted/40 border border-border rounded-xl p-4 text-center space-y-1">
                                <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>
                                        {submission.status === "TIMED_OUT" ? "Sesi Berakhir (Waktu Habis)" : "Tryout Selesai Dikerjakan"}
                                    </span>
                                </div>
                                <p className="text-sm font-bold text-foreground">
                                    Skor Kamu: {submission.score ?? 0}%
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button asChild variant="outline" className="flex-1 h-11 font-semibold">
                                    <Link href={`/dashboard/tryouts/${id}/discussion`}>
                                        <FileText className="w-4 h-4 mr-2" />
                                        Buka Pembahasan
                                    </Link>
                                </Button>
                                {remainingQuota > 0 && (
                                    <Button
                                        onClick={() => setShowConfirm(true)}
                                        className="flex-1 bg-olive hover:bg-olive/90 text-white font-semibold h-11"
                                    >
                                        <Play className="w-4 h-4 mr-2" />
                                        Kerjakan Ulang
                                    </Button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {userQuota.max > 0 && remainingQuota <= 0 ? (
                                <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3 text-center">
                                    <p className="text-xs font-medium text-destructive">
                                        Batas kuota tryout untuk mata kuliah ini sudah habis.
                                    </p>
                                </div>
                            ) : (
                                <Button
                                    onClick={() => setShowConfirm(true)}
                                    className="w-full bg-olive hover:bg-olive/90 text-white font-semibold h-11"
                                >
                                    <Play className="w-4 h-4 mr-2" />
                                    Mulai Tryout Sekarang
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Confirmation dialog */}
            <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
                <DialogContent className="max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>Mulai Pengerjaan Tryout?</DialogTitle>
                        <DialogDescription className="pt-2 leading-relaxed">
                            Kamu akan memulai tryout <strong className="text-foreground">{tryout.title}</strong>. 
                            Timer {tryout.duration} menit akan langsung dihitung mundur dan tidak dapat dijeda.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0 pt-4">
                        <Button variant="outline" onClick={() => setShowConfirm(false)}>
                            Batal
                        </Button>
                        <Button
                            className="bg-olive hover:bg-olive/90 text-white font-semibold"
                            onClick={() => router.push(`/dashboard/tryouts/${id}/attempt`)}
                        >
                            Ya, Mulai
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
