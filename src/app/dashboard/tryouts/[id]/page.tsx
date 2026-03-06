"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
    const [loading, setLoading] = useState(true)
    const [showConfirm, setShowConfirm] = useState(false)

    useEffect(() => {
        const fetchTryout = async () => {
            try {
                const res = await fetch("/api/tryouts")
                const data = await res.json()
                const found = (data.tryouts || []).find((t: any) => t.id === id)
                if (found) {
                    setTryout(found)
                }
            } catch (error) {
                console.error("Failed to fetch tryout:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchTryout()
    }, [id])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-soft-brown" />
            </div>
        )
    }

    if (!tryout) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-2">Tryout Tidak Ditemukan</h2>
                <p className="text-muted-foreground mb-6">Tryout ini tidak tersedia atau belum diaktifkan.</p>
                <Button asChild variant="outline">
                    <Link href="/dashboard/tryouts">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Kembali ke Daftar Tryout
                    </Link>
                </Button>
            </div>
        )
    }

    const questionCount = tryout.tryout_questions?.[0]?.count || 0

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <Button asChild variant="ghost" className="text-muted-foreground hover:text-foreground -ml-2">
                <Link href="/dashboard/tryouts">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Kembali
                </Link>
            </Button>

            <Card className="border-warm-gray/60">
                <CardContent className="p-6 sm:p-8 space-y-6">
                    {/* Header */}
                    <div>
                        <Badge variant="secondary" className="mb-3 bg-warm-beige text-soft-brown text-xs">
                            {tryout.category
                                ? CATEGORY_LABELS[tryout.category]
                                : "Semua Materi"}
                        </Badge>
                        <h1 className="text-2xl font-bold text-foreground">{tryout.title}</h1>
                        {tryout.description && (
                            <p className="text-muted-foreground mt-2">{tryout.description}</p>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-warm-beige/30 border border-warm-gray/30">
                            <div className="w-10 h-10 rounded-full bg-warm-beige flex items-center justify-center">
                                <Clock className="w-5 h-5 text-dark-brown" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Durasi</p>
                                <p className="text-lg font-bold text-foreground">{tryout.duration} menit</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-warm-beige/30 border border-warm-gray/30">
                            <div className="w-10 h-10 rounded-full bg-warm-beige flex items-center justify-center">
                                <FileText className="w-5 h-5 text-dark-brown" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Jumlah Soal</p>
                                <p className="text-lg font-bold text-foreground">{questionCount} soal</p>
                            </div>
                        </div>
                    </div>

                    {/* Rules */}
                    <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/60">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                            <span className="text-sm font-semibold text-amber-800">Peraturan</span>
                        </div>
                        <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
                            <li>Tryout akan dimulai segera setelah kamu menekan tombol &quot;Mulai&quot;.</li>
                            <li>Timer akan berjalan otomatis selama {tryout.duration} menit.</li>
                            <li>Jangan berpindah tab selama mengerjakan tryout.</li>
                            <li>Jawaban akan otomatis di-submit jika waktu habis.</li>
                        </ul>
                    </div>

                    {/* Start button */}
                    <Button
                        onClick={() => setShowConfirm(true)}
                        className="w-full bg-dark-brown hover:bg-soft-brown text-cream h-12 text-base"
                    >
                        <Play className="w-5 h-5 mr-2" />
                        Mulai Tryout
                    </Button>
                </CardContent>
            </Card>

            {/* Confirmation dialog */}
            <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Mulai Tryout?</DialogTitle>
                        <DialogDescription>
                            Kamu akan memulai <strong>{tryout.title}</strong>.
                            Timer {tryout.duration} menit akan langsung berjalan setelah kamu menekan &quot;Ya, Mulai&quot;.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setShowConfirm(false)}>
                            Batal
                        </Button>
                        <Button
                            onClick={() => router.push(`/dashboard/tryouts/${id}/attempt`)}
                            className="bg-dark-brown hover:bg-soft-brown text-cream"
                        >
                            Ya, Mulai
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
