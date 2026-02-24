"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Clock, ChevronLeft, ChevronRight, AlertTriangle, Loader2, Send } from "lucide-react"
import { formatTimer } from "@/lib/utils"
import { toast } from "sonner"

interface Question {
    id: string
    text: string
    category: string
    option_a: string
    option_b: string
    option_c: string
    option_d: string
    option_e: string | null
    weight: number
    image_url: string | null
}

export default function TryoutAttemptPage() {
    const { id: tryoutId } = useParams<{ id: string }>()
    const router = useRouter()

    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [submissionId, setSubmissionId] = useState<string | null>(null)
    const [questions, setQuestions] = useState<Question[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [answers, setAnswers] = useState<Record<string, string | null>>({})
    const [timeLeft, setTimeLeft] = useState(0)
    const [showSubmitDialog, setShowSubmitDialog] = useState(false)
    const [showWarning, setShowWarning] = useState(false)
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const endTimeRef = useRef<number>(0)

    // Start tryout
    useEffect(() => {
        const startTryout = async () => {
            try {
                const res = await fetch(`/api/tryouts/${tryoutId}/start`, { method: "POST" })
                const data = await res.json()

                if (!res.ok) {
                    toast.error(data.error || "Gagal memulai tryout.")
                    router.push(`/dashboard/tryouts`)
                    return
                }

                setSubmissionId(data.submission.id)
                setQuestions(data.questions)

                // Calculate end time
                const startTime = new Date(data.submission.startedAt).getTime()
                const duration = data.submission.duration * 60 * 1000
                endTimeRef.current = startTime + duration

                // Initialize answers
                const initialAnswers: Record<string, string | null> = {}
                data.questions.forEach((q: Question) => {
                    initialAnswers[q.id] = null
                })
                setAnswers(initialAnswers)
                setLoading(false)
            } catch (error) {
                toast.error("Gagal memulai tryout.")
                router.push(`/dashboard/tryouts`)
            }
        }

        startTryout()
    }, [tryoutId, router])

    // Timer
    useEffect(() => {
        if (loading || !endTimeRef.current) return

        const updateTimer = () => {
            const remaining = Math.max(0, Math.floor((endTimeRef.current - Date.now()) / 1000))
            setTimeLeft(remaining)

            if (remaining <= 0) {
                // Auto-submit
                handleSubmit(true)
            }
        }

        updateTimer()
        timerRef.current = setInterval(updateTimer, 1000)

        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [loading])

    // Anti-cheating: detect tab switching
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                setShowWarning(true)
                toast.warning("Peringatan: Jangan berpindah tab saat mengerjakan tryout!")
            }
        }

        document.addEventListener("visibilitychange", handleVisibilityChange)
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
    }, [])

    // Prevent page refresh
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault()
        }

        window.addEventListener("beforeunload", handleBeforeUnload)
        return () => window.removeEventListener("beforeunload", handleBeforeUnload)
    }, [])

    const handleAnswer = (questionId: string, answer: string) => {
        setAnswers((prev) => ({ ...prev, [questionId]: answer }))
    }

    const handleSubmit = async (autoSubmit = false) => {
        if (submitting || !submissionId) return
        setSubmitting(true)

        try {
            const answerPayload = Object.entries(answers).map(([questionId, answer]) => ({
                questionId,
                answer,
            }))

            const res = await fetch(`/api/tryouts/${tryoutId}/submit`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    submissionId,
                    answers: answerPayload,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error)
            }

            if (timerRef.current) clearInterval(timerRef.current)

            toast.success(autoSubmit ? "Waktu habis! Jawaban telah di-submit otomatis." : "Tryout berhasil di-submit!")

            // Redirect to result page
            router.push(`/dashboard/tryouts/${tryoutId}/result?score=${data.score}&correct=${data.correctCount}&total=${data.totalCount}`)
        } catch (error) {
            toast.error("Gagal submit tryout.")
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-soft-brown mx-auto" />
                    <p className="text-muted-foreground">Memulai tryout...</p>
                </div>
            </div>
        )
    }

    const currentQuestion = questions[currentIndex]
    const answeredCount = Object.values(answers).filter(Boolean).length
    const progress = (answeredCount / questions.length) * 100

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Timer & progress bar */}
            <div className="sticky top-0 z-40 bg-cream/95 backdrop-blur-sm pb-4 pt-2">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-warm-gray">
                            Soal {currentIndex + 1}/{questions.length}
                        </Badge>
                        <Badge variant="secondary" className="bg-warm-beige text-soft-brown">
                            {answeredCount}/{questions.length} dijawab
                        </Badge>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-sm font-bold ${timeLeft <= 60
                            ? "bg-red-50 text-red-600 animate-pulse"
                            : timeLeft <= 300
                                ? "bg-amber-50 text-amber-600"
                                : "bg-warm-beige text-dark-brown"
                        }`}>
                        <Clock className="w-4 h-4" />
                        {formatTimer(timeLeft)}
                    </div>
                </div>
                <Progress value={progress} className="h-2" />
            </div>

            {/* Question card */}
            <Card className="border-warm-gray/60 shadow-sm">
                <CardContent className="p-6 sm:p-8">
                    <div className="mb-6">
                        <p className="text-base font-medium text-foreground leading-relaxed">
                            {currentQuestion.text}
                        </p>
                        {currentQuestion.image_url && (
                            <img
                                src={currentQuestion.image_url}
                                alt="Question image"
                                className="mt-4 rounded-lg max-h-64 object-contain"
                            />
                        )}
                    </div>

                    {/* Options */}
                    <div className="space-y-3">
                        {["A", "B", "C", "D", "E"].map((opt) => {
                            const optKey = `option_${opt.toLowerCase()}` as keyof Question
                            const optionText = currentQuestion[optKey] as string | null
                            if (!optionText) return null

                            const isSelected = answers[currentQuestion.id] === opt

                            return (
                                <button
                                    key={opt}
                                    onClick={() => handleAnswer(currentQuestion.id, opt)}
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all text-sm ${isSelected
                                            ? "border-dark-brown bg-dark-brown/5 text-foreground"
                                            : "border-warm-gray/60 hover:border-soft-brown/40 text-foreground/80 hover:bg-warm-beige/50"
                                        }`}
                                >
                                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold mr-3 ${isSelected
                                            ? "bg-dark-brown text-cream"
                                            : "bg-warm-beige text-soft-brown"
                                        }`}>
                                        {opt}
                                    </span>
                                    {optionText}
                                </button>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between">
                <Button
                    variant="outline"
                    onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                    disabled={currentIndex === 0}
                    className="border-warm-gray"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Sebelumnya
                </Button>

                {currentIndex === questions.length - 1 ? (
                    <Button
                        onClick={() => setShowSubmitDialog(true)}
                        className="bg-dark-brown hover:bg-soft-brown text-cream"
                        disabled={submitting}
                    >
                        <Send className="w-4 h-4 mr-2" />
                        Submit Jawaban
                    </Button>
                ) : (
                    <Button
                        onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}
                        className="bg-dark-brown hover:bg-soft-brown text-cream"
                    >
                        Selanjutnya
                        <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                )}
            </div>

            {/* Question navigator */}
            <Card className="border-warm-gray/60">
                <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground mb-3 font-medium">Navigasi Soal</p>
                    <div className="flex flex-wrap gap-2">
                        {questions.map((q, i) => (
                            <button
                                key={q.id}
                                onClick={() => setCurrentIndex(i)}
                                className={`w-9 h-9 rounded-lg text-xs font-medium transition-all ${i === currentIndex
                                        ? "bg-dark-brown text-cream"
                                        : answers[q.id]
                                            ? "bg-earthy-green/15 text-earthy-green border border-earthy-green/30"
                                            : "bg-warm-beige text-muted-foreground hover:bg-warm-gray"
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Submit confirmation dialog */}
            <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Submit Jawaban?</DialogTitle>
                        <DialogDescription>
                            Kamu telah menjawab {answeredCount} dari {questions.length} soal.
                            {answeredCount < questions.length && (
                                <span className="block mt-2 text-amber-600 font-medium">
                                    ⚠️ Masih ada {questions.length - answeredCount} soal yang belum dijawab.
                                </span>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
                            Kembali
                        </Button>
                        <Button
                            onClick={() => handleSubmit(false)}
                            disabled={submitting}
                            className="bg-dark-brown hover:bg-soft-brown text-cream"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                                    Mengirim...
                                </>
                            ) : (
                                "Ya, Submit"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Tab switch warning dialog */}
            <Dialog open={showWarning} onOpenChange={setShowWarning}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-amber-600">
                            <AlertTriangle className="w-5 h-5" />
                            Peringatan!
                        </DialogTitle>
                        <DialogDescription>
                            Kamu terdeteksi berpindah tab. Aktivitas ini akan dicatat.
                            Mohon tetap di halaman tryout sampai selesai.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={() => setShowWarning(false)} className="bg-dark-brown hover:bg-soft-brown text-cream">
                            Mengerti
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
