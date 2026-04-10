"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Clock, FileText, ArrowLeft, Loader2, Play, AlertTriangle } from "lucide-react"
import { CATEGORY_LABELS } from "@/types"
import type { QuestionCategory } from "@/types"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

interface TryoutDetail {
    id: string
    title: string
    description: string | null
    category: QuestionCategory | null
    duration: number
    status: string
    max_attempts: number
    tryout_questions: { count: number }[]
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
                            used: statsData.tryoutStats.completed,
                            max: statsData.tryoutStats.maxQuota || 0
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
            <div className="flex items-center justify-center min-h-[60vh] font-mono">
                <div className="text-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-[#e87a5d] mx-auto" />
                    <p className="text-[#2b1b11] font-bold text-sm">Memuat tryout...</p>
                </div>
            </div>
        )
    }

    if (!tryout) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center font-mono">
                <div className="w-16 h-16 bg-[#e87a5d]/20 border-4 border-[#e87a5d] flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-[#e87a5d] stroke-[2]" />
                </div>
                <h2 className="text-lg font-bold text-[#2b1b11] mb-2" style={{ fontFamily: "var(--font-press-start)", fontSize: "0.9rem" }}>Tryout Tidak Ditemukan</h2>
                <p className="text-sm text-[#3c5443] font-bold mb-6">Tryout ini tidak tersedia atau belum diaktifkan.</p>
                <Link
                    href="/dashboard/tryouts"
                    className="inline-flex items-center gap-2 bg-[#FEFCF3] text-[#2b1b11] font-bold text-sm px-4 py-2 border-2 border-[#2b1b11] shadow-[2px_2px_0px_#2b1b11] hover:shadow-[3px_3px_0px_#2b1b11] hover:-translate-y-0.5 transition-all"
                >
                    <ArrowLeft className="w-4 h-4 stroke-[3]" />
                    Kembali ke Daftar Tryout
                </Link>
            </div>
        )
    }

    const questionCount = tryout.tryout_questions?.[0]?.count || 0
    const remainingQuota = Math.max(0, userQuota.max - userQuota.used)

    return (
        <div className="max-w-2xl mx-auto space-y-6 font-mono">
            <Link
                href="/dashboard/tryouts"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#2b1b11] bg-[#FEFCF3] border-2 border-[#2b1b11] px-4 py-2 shadow-[2px_2px_0px_#2b1b11] hover:shadow-[3px_3px_0px_#2b1b11] hover:-translate-y-0.5 transition-all"
            >
                <ArrowLeft className="w-4 h-4 stroke-[3]" />
                Kembali
            </Link>

            <div className="bg-[#FEFCF3] border-4 border-[#2b1b11] shadow-[4px_4px_0px_#2b1b11]">
                {/* Header */}
                <div className="border-b-4 border-[#2b1b11] bg-[#bed3c6] px-6 py-4">
                    <span className="inline-block text-[10px] font-bold text-[#2b1b11] bg-[#FEFCF3] border-2 border-[#2b1b11] px-2 py-0.5 mb-2 uppercase tracking-wider">
                        {tryout.category
                            ? CATEGORY_LABELS[tryout.category]
                            : "Semua Materi"}
                    </span>
                    <h1 className="text-xl font-bold text-[#2b1b11]" style={{ fontFamily: "var(--font-press-start)", fontSize: "1rem", lineHeight: 1.5 }}>
                        {tryout.title}
                    </h1>
                    {tryout.description && (
                        <p className="text-sm text-[#3c5443] font-bold mt-2">{tryout.description}</p>
                    )}
                </div>

                <div className="p-6 space-y-6">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 bg-[#bed3c6] border-4 border-[#2b1b11] p-3 shadow-[2px_2px_0px_#2b1b11]">
                            <div className="w-10 h-10 bg-[#FEFCF3] border-2 border-[#2b1b11] flex items-center justify-center shadow-[1px_1px_0px_#2b1b11]">
                                <Clock className="w-5 h-5 text-[#2b1b11] stroke-[2]" />
                            </div>
                            <div>
                                <p className="text-[10px] text-[#3c5443] font-bold uppercase tracking-wider">Durasi</p>
                                <p className="text-lg font-extrabold text-[#2b1b11]">{tryout.duration} menit</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-[#bed3c6] border-4 border-[#2b1b11] p-3 shadow-[2px_2px_0px_#2b1b11]">
                            <div className="w-10 h-10 bg-[#FEFCF3] border-2 border-[#2b1b11] flex items-center justify-center shadow-[1px_1px_0px_#2b1b11]">
                                <FileText className="w-5 h-5 text-[#2b1b11] stroke-[2]" />
                            </div>
                            <div>
                                <p className="text-[10px] text-[#3c5443] font-bold uppercase tracking-wider">Jumlah Soal</p>
                                <p className="text-lg font-extrabold text-[#2b1b11]">{questionCount} soal</p>
                            </div>
                        </div>
                    </div>

                    {/* Rules */}
                    <div className="bg-[#FEFCF3] border-4 border-[#e87a5d] p-4 shadow-[2px_2px_0px_#2b1b11]">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-4 h-4 text-[#e87a5d] stroke-[2]" />
                            <span className="text-xs font-bold text-[#e87a5d] uppercase tracking-wider">Peraturan</span>
                        </div>
                        <ul className="text-xs text-[#3c5443] font-bold space-y-1 list-disc list-inside">
                            <li>Tryout akan dimulai segera setelah kamu menekan tombol &quot;Mulai&quot;.</li>
                            <li>Timer akan berjalan otomatis selama {tryout.duration} menit.</li>
                            <li>Jangan berpindah tab selama mengerjakan tryout.</li>
                            <li>Jawaban akan otomatis di-submit jika waktu habis.</li>
                        </ul>
                    </div>

                    {/* Action button */}
                    {submission && submission.status === "IN_PROGRESS" ? (
                        <div className="space-y-3">
                            <div className="bg-amber-50 border-4 border-amber-500 p-3 shadow-[2px_2px_0px_#2b1b11]">
                                <p className="text-xs font-bold text-amber-700 text-center">
                                    Kamu memiliki sesi yang sedang berjalan.
                                </p>
                            </div>
                            <Link
                                href={`/dashboard/tryouts/${id}/attempt`}
                                className="w-full inline-flex items-center justify-center gap-2 bg-[#e87a5d] text-[#FEFCF3] font-bold text-sm px-6 py-3 border-2 border-[#2b1b11] shadow-[3px_3px_0px_#2b1b11] hover:shadow-[4px_4px_0px_#2b1b11] hover:-translate-y-0.5 transition-all"
                            >
                                <Play className="w-5 h-5 stroke-[2]" />
                                Lanjutkan Tryout
                            </Link>
                        </div>
                    ) : submission && submission.status === "SUBMITTED" ? (
                        <div className="space-y-3">
                            <div className="bg-[#bed3c6] border-4 border-[#2b1b11] p-3 shadow-[2px_2px_0px_#2b1b11]">
                                <p className="text-xs font-bold text-[#2b1b11] text-center">
                                    ✅ Kamu sudah menyelesaikan tryout ini dengan skor {submission.score}%.
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Link
                                    href={`/dashboard/tryouts/${id}/discussion`}
                                    className="flex-1 inline-flex items-center justify-center gap-2 bg-[#FEFCF3] text-[#2b1b11] font-bold text-sm px-4 py-3 border-2 border-[#2b1b11] shadow-[2px_2px_0px_#2b1b11] hover:shadow-[3px_3px_0px_#2b1b11] hover:-translate-y-0.5 transition-all"
                                >
                                    <FileText className="w-4 h-4 stroke-[2]" />
                                    Lihat Pembahasan
                                </Link>
                                
                                {remainingQuota > 0 && (
                                    <button
                                        onClick={() => setShowConfirm(true)}
                                        className="flex-1 inline-flex items-center justify-center gap-2 bg-[#e87a5d] text-[#FEFCF3] font-bold text-sm px-4 py-3 border-2 border-[#2b1b11] shadow-[2px_2px_0px_#2b1b11] hover:shadow-[3px_3px_0px_#2b1b11] hover:-translate-y-0.5 transition-all"
                                    >
                                        <Play className="w-4 h-4 stroke-[2]" />
                                        Kerjakan Ulang
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {remainingQuota <= 0 ? (
                                <div className="bg-[#FEFCF3] border-4 border-[#e87a5d] p-3 shadow-[2px_2px_0px_#2b1b11]">
                                    <p className="text-xs font-bold text-[#e87a5d] text-center">
                                        ❌ Kuota tryout kamu telah habis.
                                    </p>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowConfirm(true)}
                                    className="w-full inline-flex items-center justify-center gap-2 bg-[#e87a5d] text-[#FEFCF3] font-bold text-sm px-6 py-3 border-2 border-[#2b1b11] shadow-[3px_3px_0px_#2b1b11] hover:shadow-[4px_4px_0px_#2b1b11] hover:-translate-y-0.5 transition-all"
                                >
                                    <Play className="w-5 h-5 stroke-[2]" />
                                    Mulai Tryout
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Confirmation dialog */}
            <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
                <DialogContent className="border-4 border-[#2b1b11] shadow-[6px_6px_0px_#2b1b11] bg-[#FEFCF3] rounded-none font-mono">
                    <DialogHeader>
                        <DialogTitle className="text-[#2b1b11] font-bold" style={{ fontFamily: "var(--font-press-start)", fontSize: "0.8rem" }}>Mulai Tryout?</DialogTitle>
                        <DialogDescription className="text-[#3c5443] font-bold text-sm">
                            Kamu akan memulai <strong className="text-[#2b1b11]">{tryout.title}</strong>.
                            Timer {tryout.duration} menit akan langsung berjalan setelah kamu menekan &quot;Ya, Mulai&quot;.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <button 
                            onClick={() => setShowConfirm(false)} 
                            className="bg-[#FEFCF3] text-[#2b1b11] font-bold text-xs px-4 py-2 border-2 border-[#2b1b11] shadow-[2px_2px_0px_#2b1b11] hover:shadow-[3px_3px_0px_#2b1b11] hover:-translate-y-0.5 transition-all"
                        >
                            Batal
                        </button>
                        <button
                            onClick={() => router.push(`/dashboard/tryouts/${id}/attempt`)}
                            className="bg-[#e87a5d] text-[#FEFCF3] font-bold text-xs px-4 py-2 border-2 border-[#2b1b11] shadow-[2px_2px_0px_#2b1b11] hover:shadow-[3px_3px_0px_#2b1b11] hover:-translate-y-0.5 transition-all"
                        >
                            Ya, Mulai
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
