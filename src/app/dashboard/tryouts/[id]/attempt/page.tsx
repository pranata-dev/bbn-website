"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { ExamTimer } from "@/components/assessment/ExamTimer"
import { QuestionViewer, QuestionOption } from "@/components/assessment/QuestionViewer"
import { QuestionNavigator } from "@/components/assessment/QuestionNavigator"
import { SubmitConfirmDialog } from "@/components/assessment/SubmitConfirmDialog"
import { TabSwitchWarningDialog } from "@/components/assessment/TabSwitchWarningDialog"

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
  const answersRef = useRef<Record<string, AnswerState>>({})
  const submittingRef = useRef(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const endTimeRef = useRef<number>(0)

  // Keep answersRef up-to-date to prevent stale closures in timer callback
  useEffect(() => {
    answersRef.current = answers
  }, [answers])

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
            Object.keys(parsed).forEach((qid) => {
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
        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }
        // Auto-submit with fresh answers from ref
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
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionId, answer }),
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
    if (submittingRef.current || !submissionId) return
    submittingRef.current = true
    setSubmitting(true)

    try {
      // Always read from answersRef.current to avoid stale-closure timer bugs
      const currentAnswers = answersRef.current || answers
      const answerPayload = Object.entries(currentAnswers).map(([questionId, state]) => ({
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

      toast.success(autoSubmit ? "Waktu habis! Lembar jawaban di-submit otomatis." : "Tryout berhasil dikumpulkan!")

      // Redirect to result page with submissionId
      router.push(
        `/dashboard/tryouts/${tryoutId}/result?submissionId=${submissionId}&score=${data.score}&correct=${data.correctCount}&total=${data.totalCount}`
      )
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal submit tryout.")
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] font-mono">
        <div className="bg-surface-white border-2 border-dashed border-[#171717] bg-grid-blueprint p-12 text-center relative tick-corner">
          <div className="size-3 bg-accent-canary border border-[#171717] mx-auto mb-3 animate-spin" />
          <p className="font-mono text-xs font-bold text-[#171717]">
            &gt; STATUS: INITIALIZING_LOCKDOWN_ENVIRONMENT...
          </p>
          <p className="font-mono text-[10px] text-ink-muted mt-1">
            MEMUAT BANK SOAL &amp; MENYIAPKAN TELEMETRI
          </p>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]
  const answeredCount = Object.values(answers).filter((a) => a?.answer !== null).length
  const doubtfulCount = Object.values(answers).filter((a) => a?.isDoubtful).length

  // Construct options array
  const options: QuestionOption[] = ["A", "B", "C", "D", "E"]
    .map((key) => {
      const optKey = `option_${key.toLowerCase()}` as keyof Question
      const text = currentQuestion[optKey] as string | null
      return text && text !== "-" ? { key, text } : null
    })
    .filter((opt): opt is QuestionOption => opt !== null)

  const isCurrentDoubtful = Boolean(answers[currentQuestion?.id]?.isDoubtful)
  const currentSelectedAnswer = answers[currentQuestion?.id]?.answer ?? null

  return (
    <div className="min-h-screen bg-canvas-paper flex flex-col justify-between select-none">
      {/* 1. TOP DOCKED TELEMETRY & TIMER BAR */}
      <ExamTimer
        timeLeft={timeLeft}
        currentIndex={currentIndex}
        totalQuestions={questions.length}
        answeredCount={answeredCount}
        tokenId={tryoutId.slice(0, 8)}
        subject={currentQuestion?.category || "FISIKA"}
      />

      {/* 2. MAIN PROBLEM SOLVING WORKSPACE */}
      <main className="flex-1 w-full max-w-[1720px] mx-auto p-4 md:p-6">
        <QuestionViewer
          questionNumber={currentIndex + 1}
          questionText={currentQuestion.text}
          imageUrl={currentQuestion.image_url}
          category={currentQuestion.category}
          weight={currentQuestion.weight}
          options={options}
          selectedAnswer={currentSelectedAnswer}
          onSelectAnswer={(key) => handleAnswer(currentQuestion.id, key)}
        />
      </main>

      {/* 3. DOCKED BOTTOM NAVIGATION & SYSTEM MATRIX */}
      <QuestionNavigator
        totalQuestions={questions.length}
        currentIndex={currentIndex}
        answers={answers}
        questions={questions}
        onSelectQuestion={(idx) => setCurrentIndex(idx)}
        isDoubtful={isCurrentDoubtful}
        onToggleDoubtful={() => toggleDoubtful(currentQuestion.id)}
        onPrev={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
        onNext={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
        onSubmit={() => setShowSubmitDialog(true)}
        isFirst={currentIndex === 0}
        isLast={currentIndex === questions.length - 1}
        submitting={submitting}
      />

      {/* 4. CONFIRMATION DIALOG */}
      <SubmitConfirmDialog
        isOpen={showSubmitDialog}
        onClose={() => setShowSubmitDialog(false)}
        onConfirm={() => {
          setShowSubmitDialog(false)
          handleSubmit(false)
        }}
        totalQuestions={questions.length}
        answeredCount={answeredCount}
        doubtfulCount={doubtfulCount}
        submitting={submitting}
      />

      {/* 5. TAB SWITCH INTEGRITY WARNING */}
      <TabSwitchWarningDialog
        isOpen={showWarning}
        onClose={() => setShowWarning(false)}
      />
    </div>
  )
}
