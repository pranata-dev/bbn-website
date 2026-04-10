"use client"

import MarkdownLatex from "@/components/ui/markdown-latex"
import { useState, useEffect, useCallback, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Clock, ChevronLeft, ChevronRight, AlertTriangle, Loader2, Send, Flag } from "lucide-react"
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

interface AnswerState {
    answer: string | null
    isDoubtful: boolean
}

export default function TryoutAttemptPage() {
    const { id: tryoutId } = useParams<{ id: string }>()
    const router = useRouter()

    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [submissionId, setSubmissionId] = useState<string | null>(null)
    const [questions, setQuestions] = useState<Question[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [answers, setAnswers] = useState<Record<string, AnswerState>>({})
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

                // Calculate end time (ensure UTC parsing)
                const startStr = data.submission.startedAt
                const utcStartStr = startStr.endsWith("Z") ? startStr : startStr + "Z"
                const startTime = new Date(utcStartStr).getTime()
                const duration = data.submission.duration * 60 * 1000
                endTimeRef.current = startTime + duration

                // Initialize answers
                const initialAnswers: Record<string, AnswerState> = {}
                data.questions.forEach((q: Question) => {
                    initialAnswers[q.id] = { answer: null, isDoubtful: false }
                })

                // Overwrite with DB auto-saved answers
                if (data.answers && data.answers.length > 0) {
                    data.answers.forEach((ans: any) => {
                        if (initialAnswers[ans.question_id]) {
                            initialAnswers[ans.question_id].answer = ans.answer
                        }
                    })
                }

                // Restore doubtful state from localStorage if available
                const savedState = localStorage.getItem(`tryout_attempt_${tryoutId}`)
                if (savedState) {
                    try {
                        const parsed = JSON.parse(savedState)
                        Object.keys(parsed).forEach(qid => {
                            if (initialAnswers[qid]) {
                                initialAnswers[qid].isDoubtful = parsed[qid]?.isDoubtful || false
                                // Fallback to localStorage answer if DB auto-save failed/lagged
                                if (!initialAnswers[qid].answer && parsed[qid]?.answer) {
                                    initialAnswers[qid].answer = parsed[qid].answer
                                }
                            }
                        })
                    } catch (e) {
                        console.error("Failed to parse saved answers", e)
                    }
                }

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

    // Auto-save to localStorage
    useEffect(() => {
        if (!loading && Object.keys(answers).length > 0) {
            localStorage.setItem(`tryout_attempt_${tryoutId}`, JSON.stringify(answers))
        }
    }, [answers, tryoutId, loading])

    const handleAnswer = async (questionId: string, answer: string) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: { ...prev[questionId], answer },
        }))

        // Auto-save to DB
        if (submissionId) {
            try {
                await fetch(`/api/submissions/${submissionId}/answers`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ questionId, answer })
                })
            } catch (error) {
                console.error("Failed to auto-save answer", error)
            }
        }
    }

    const toggleDoubtful = (questionId: string) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: {
                ...prev[questionId],
                isDoubtful: !prev[questionId]?.isDoubtful,
            },
        }))
    }

    const handleSubmit = async (autoSubmit = false) => {
        if (submitting || !submissionId) return
        setSubmitting(true)

        try {
            const answerPayload = Object.entries(answers).map(([questionId, state]) => ({
                questionId,
                answer: state.answer,
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
            
            // Clear local storage on successful submit
            localStorage.removeItem(`tryout_attempt_${tryoutId}`)

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
            <div className="flex items-center justify-center min-h-[60vh] font-mono">
                <div className="text-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-[#e87a5d] mx-auto" />
                    <p className="text-[#2b1b11] font-bold text-sm">Memulai tryout...</p>
                </div>
            </div>
        )
    }

    const currentQuestion = questions[currentIndex]
    const answeredCount = Object.values(answers).filter(a => a?.answer !== null).length
    const progress = (answeredCount / questions.length) * 100

    // Timer color states
    const timerCritical = timeLeft <= 60
    const timerWarning = timeLeft <= 300

    return (
        <div className="max-w-3xl mx-auto space-y-6 font-mono">
            {/* Timer & progress bar */}
            <div className="sticky top-0 z-40 pb-4 pt-2">
                <div className="bg-[#FEFCF3] border-4 border-[#2b1b11] shadow-[4px_4px_0px_#2b1b11] p-3">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-[#2b1b11] bg-[#bed3c6] border-2 border-[#2b1b11] px-2 py-0.5">
                                Soal {currentIndex + 1}/{questions.length}
                            </span>
                            <span className="text-[10px] font-bold text-[#FEFCF3] bg-[#e87a5d] border-2 border-[#2b1b11] px-2 py-0.5">
                                {answeredCount}/{questions.length} dijawab
                            </span>
                        </div>
                        {/* Timer */}
                        <div className={`flex items-center gap-2 px-3 py-1 border-2 font-extrabold text-sm ${
                            timerCritical
                                ? "bg-red-100 text-red-600 border-red-500 animate-pulse shadow-[2px_2px_0px_#dc2626]"
                                : timerWarning
                                    ? "bg-amber-100 text-amber-700 border-amber-500 shadow-[2px_2px_0px_#b45309]"
                                    : "bg-[#bed3c6] text-[#2b1b11] border-[#2b1b11] shadow-[2px_2px_0px_#2b1b11]"
                        }`}>
                            <Clock className="w-4 h-4 stroke-[2]" />
                            {formatTimer(timeLeft)}
                        </div>
                    </div>
                    {/* Pixel progress bar */}
                    <div className="w-full h-3 bg-[#bed3c6] border-2 border-[#2b1b11]">
                        <div 
                            className="h-full bg-[#e87a5d] transition-all duration-300" 
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Question card */}
            <div className="bg-[#FEFCF3] border-4 border-[#2b1b11] shadow-[4px_4px_0px_#2b1b11] select-none" onContextMenu={(e) => e.preventDefault()}>
                <div className="border-b-4 border-[#2b1b11] bg-[#bed3c6] px-4 py-2">
                    <span className="text-xs font-bold text-[#2b1b11] uppercase tracking-wider">Pertanyaan</span>
                </div>
                <div className="p-6">
                    <div className="mb-6">
                        <div className="text-sm font-bold text-[#2b1b11] leading-relaxed prose prose-sm max-w-none">
                            <MarkdownLatex>{currentQuestion.text}</MarkdownLatex>
                        </div>
                        {currentQuestion.image_url && (
                            <img
                                src={currentQuestion.image_url}
                                alt="Question image"
                                className="mt-4 max-h-64 object-contain border-2 border-[#2b1b11]"
                            />
                        )}
                    </div>

                    {/* Options */}
                    {questions[currentIndex].option_a !== "-" && (
                        <div className="space-y-3">
                            {["A", "B", "C", "D", "E"].map((opt) => {
                                const optKey = `option_${opt.toLowerCase()}` as keyof Question
                                const optionText = currentQuestion[optKey] as string | null
                                if (!optionText || optionText === "-") return null

                                const isSelected = answers[currentQuestion.id]?.answer === opt

                                return (
                                    <button
                                        key={opt}
                                        onClick={() => handleAnswer(currentQuestion.id, opt)}
                                        className={`w-full text-left p-3 border-4 transition-all text-sm flex items-center font-bold ${isSelected
                                            ? "border-[#e87a5d] bg-[#e87a5d]/10 text-[#2b1b11] shadow-[3px_3px_0px_#e87a5d]"
                                            : "border-[#2b1b11]/30 hover:border-[#2b1b11] text-[#2b1b11]/80 hover:bg-[#bed3c6]/30 shadow-[2px_2px_0px_#2b1b11]/20"
                                            }`}
                                    >
                                        <span className={`inline-flex items-center justify-center w-8 h-8 text-xs font-extrabold mr-3 border-2 ${isSelected
                                            ? "bg-[#e87a5d] text-[#FEFCF3] border-[#2b1b11]"
                                            : "bg-[#bed3c6] text-[#2b1b11] border-[#2b1b11]"
                                            }`}>
                                            {opt}
                                        </span>
                                        <div className="prose prose-sm max-w-none">
                                            <MarkdownLatex>{optionText}</MarkdownLatex>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                    disabled={currentIndex === 0}
                    className="inline-flex items-center gap-1 bg-[#FEFCF3] text-[#2b1b11] font-bold text-xs px-4 py-2 border-2 border-[#2b1b11] shadow-[2px_2px_0px_#2b1b11] hover:shadow-[3px_3px_0px_#2b1b11] hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:pointer-events-none"
                >
                    <ChevronLeft className="w-4 h-4 stroke-[3]" />
                    Sebelumnya
                </button>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => toggleDoubtful(currentQuestion.id)}
                        className={`inline-flex items-center gap-1 font-bold text-xs px-3 py-2 border-2 transition-all ${answers[currentQuestion.id]?.isDoubtful 
                            ? "bg-amber-100 text-amber-700 border-amber-500 shadow-[2px_2px_0px_#b45309]" 
                            : "bg-[#FEFCF3] text-[#2b1b11] border-[#2b1b11] shadow-[2px_2px_0px_#2b1b11] hover:shadow-[3px_3px_0px_#2b1b11] hover:-translate-y-0.5"}`}
                    >
                        <Flag className={`w-3 h-3 ${answers[currentQuestion.id]?.isDoubtful ? "fill-amber-500 text-amber-500" : ""}`} />
                        Ragu
                    </button>

                    {currentIndex === questions.length - 1 ? (
                        <button
                            onClick={() => setShowSubmitDialog(true)}
                            disabled={submitting}
                            className="inline-flex items-center gap-1 bg-[#e87a5d] text-[#FEFCF3] font-bold text-xs px-4 py-2 border-2 border-[#2b1b11] shadow-[2px_2px_0px_#2b1b11] hover:shadow-[3px_3px_0px_#2b1b11] hover:-translate-y-0.5 transition-all disabled:opacity-50"
                        >
                            <Send className="w-3 h-3 stroke-[3]" />
                            Submit Jawaban
                        </button>
                    ) : (
                        <button
                            onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}
                            className="inline-flex items-center gap-1 bg-[#e87a5d] text-[#FEFCF3] font-bold text-xs px-4 py-2 border-2 border-[#2b1b11] shadow-[2px_2px_0px_#2b1b11] hover:shadow-[3px_3px_0px_#2b1b11] hover:-translate-y-0.5 transition-all"
                        >
                            Selanjutnya
                            <ChevronRight className="w-4 h-4 stroke-[3]" />
                        </button>
                    )}
                </div>
            </div>

            {/* Question navigator */}
            <div className="bg-[#FEFCF3] border-4 border-[#2b1b11] shadow-[4px_4px_0px_#2b1b11]">
                <div className="border-b-4 border-[#2b1b11] bg-[#bed3c6] px-4 py-2">
                    <span className="text-xs font-bold text-[#2b1b11] uppercase tracking-wider">Navigasi Soal</span>
                </div>
                <div className="p-4">
                    <div className="flex flex-wrap gap-2">
                        {questions.map((q, i) => (
                            <button
                                key={q.id}
                                onClick={() => setCurrentIndex(i)}
                                className={`w-9 h-9 text-xs font-extrabold transition-all border-2 ${i === currentIndex
                                    ? "bg-[#e87a5d] text-[#FEFCF3] border-[#2b1b11] shadow-[2px_2px_0px_#2b1b11]"
                                    : answers[q.id]?.isDoubtful
                                        ? "bg-amber-100 text-amber-700 border-amber-500"
                                        : answers[q.id]?.answer
                                            ? "bg-[#bed3c6] text-[#2b1b11] border-[#2b1b11]"
                                            : "bg-[#FEFCF3] text-[#2b1b11]/50 border-[#2b1b11]/30 hover:border-[#2b1b11]"
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Submit confirmation dialog */}
            <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
                <DialogContent className="border-4 border-[#2b1b11] shadow-[6px_6px_0px_#2b1b11] bg-[#FEFCF3] rounded-none font-mono">
                    <DialogHeader>
                        <DialogTitle className="text-[#2b1b11] font-bold" style={{ fontFamily: "var(--font-press-start)", fontSize: "0.8rem" }}>Submit Jawaban?</DialogTitle>
                        <DialogDescription className="text-[#3c5443] font-bold text-sm">
                            Kamu telah menjawab {answeredCount} dari {questions.length} soal.
                            {answeredCount < questions.length && (
                                <span className="block mt-2 text-[#e87a5d] font-bold">
                                    ⚠️ Masih ada {questions.length - answeredCount} soal yang belum dijawab.
                                </span>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <button 
                            onClick={() => setShowSubmitDialog(false)} 
                            className="bg-[#FEFCF3] text-[#2b1b11] font-bold text-xs px-4 py-2 border-2 border-[#2b1b11] shadow-[2px_2px_0px_#2b1b11] hover:shadow-[3px_3px_0px_#2b1b11] hover:-translate-y-0.5 transition-all"
                        >
                            Kembali
                        </button>
                        <button
                            onClick={() => handleSubmit(false)}
                            disabled={submitting}
                            className="bg-[#e87a5d] text-[#FEFCF3] font-bold text-xs px-4 py-2 border-2 border-[#2b1b11] shadow-[2px_2px_0px_#2b1b11] hover:shadow-[3px_3px_0px_#2b1b11] hover:-translate-y-0.5 transition-all disabled:opacity-50"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="mr-2 w-4 h-4 animate-spin inline" />
                                    Mengirim...
                                </>
                            ) : (
                                "Ya, Submit"
                            )}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Tab switch warning dialog */}
            <Dialog open={showWarning} onOpenChange={setShowWarning}>
                <DialogContent className="border-4 border-[#e87a5d] shadow-[6px_6px_0px_#2b1b11] bg-[#FEFCF3] rounded-none font-mono">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-[#e87a5d] font-bold" style={{ fontFamily: "var(--font-press-start)", fontSize: "0.7rem" }}>
                            <AlertTriangle className="w-5 h-5" />
                            Peringatan!
                        </DialogTitle>
                        <DialogDescription className="text-[#3c5443] font-bold text-sm">
                            Kamu terdeteksi berpindah tab. Aktivitas ini akan dicatat.
                            Mohon tetap di halaman tryout sampai selesai.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <button 
                            onClick={() => setShowWarning(false)} 
                            className="bg-[#e87a5d] text-[#FEFCF3] font-bold text-xs px-4 py-2 border-2 border-[#2b1b11] shadow-[2px_2px_0px_#2b1b11] hover:shadow-[3px_3px_0px_#2b1b11] hover:-translate-y-0.5 transition-all"
                        >
                            Mengerti
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
