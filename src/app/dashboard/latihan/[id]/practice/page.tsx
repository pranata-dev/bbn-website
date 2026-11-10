"use client"

import { useState, useEffect } from "react"
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

interface SavedAnswerRow {
  question_id: string
  answer: string | null
  flagged?: boolean | null
}

export default function LatihanPracticePage() {
  const { id: tryoutId } = useParams<{ id: string }>()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submissionId, setSubmissionId] = useState<string | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({})
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [showWarning, setShowWarning] = useState(false)

  // Start practice session
  useEffect(() => {
    const startPractice = async () => {
      try {
        const res = await fetch(`/api/tryouts/${tryoutId}/start`, { method: "POST" })
        const data = await res.json()

        if (!res.ok) {
          toast.error(data.error || "Gagal memulai latihan.")
          router.push(`/dashboard/latihan`)
          return
        }

        setSubmissionId(data.submission.id)
        setQuestions(data.questions)

        // Initialize answers
        const initialAnswers: Record<string, AnswerState> = {}
        data.questions.forEach((q: Question) => {
          initialAnswers[q.id] = { answer: null, isDoubtful: false }
        })

        // Overwrite with DB auto-saved answers & flagged state
        if (data.answers && data.answers.length > 0) {
          ;(data.answers as SavedAnswerRow[]).forEach((ans) => {
            if (initialAnswers[ans.question_id]) {
              initialAnswers[ans.question_id].answer = ans.answer
              initialAnswers[ans.question_id].isDoubtful = Boolean(ans.flagged)
            }
          })
        }

        // Restore doubtful state from localStorage if available
        const savedState = localStorage.getItem(`practice_attempt_${tryoutId}`)
        if (savedState) {
          try {
            const parsed = JSON.parse(savedState) as Record<string, AnswerState>
            Object.keys(parsed).forEach((qid) => {
              if (initialAnswers[qid]) {
                if (!initialAnswers[qid].isDoubtful && parsed[qid]?.isDoubtful) {
                  initialAnswers[qid].isDoubtful = parsed[qid].isDoubtful
                }
                if (!initialAnswers[qid].answer && parsed[qid]?.answer) {
                  initialAnswers[qid].answer = parsed[qid].answer
                }
              }
            })
          } catch (e) {
            console.error("Failed to parse saved practice answers", e)
          }
        }

        setAnswers(initialAnswers)
        setLoading(false)
      } catch {
        toast.error("Gagal memulai latihan.")
        router.push(`/dashboard/latihan`)
      }
    }

    startPractice()
  }, [tryoutId, router])

  // Anti-cheating: detect tab switching
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setShowWarning(true)
        toast.warning("Peringatan: Kamu terdeteksi berpindah tab!")
        if (submissionId) {
          fetch(`/api/submissions/${submissionId}/answers`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ incrementTabSwitch: true }),
          }).catch(() => {})
        }
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [submissionId])

  // Auto-save to localStorage
  useEffect(() => {
    if (!loading && Object.keys(answers).length > 0) {
      localStorage.setItem(`practice_attempt_${tryoutId}`, JSON.stringify(answers))
    }
  }, [answers, tryoutId, loading])

  const handleAnswer = async (questionId: string, answer: string) => {
    const currentFlagged = answers[questionId]?.isDoubtful || false
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
          body: JSON.stringify({ questionId, answer, flagged: currentFlagged }),
        })
      } catch (error) {
        console.error("Failed to auto-save practice answer", error)
      }
    }
  }

  const toggleDoubtful = async (questionId: string) => {
    const nextDoubtful = !answers[questionId]?.isDoubtful
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        isDoubtful: nextDoubtful,
      },
    }))

    if (submissionId) {
      try {
        await fetch(`/api/submissions/${submissionId}/answers`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionId, flagged: nextDoubtful }),
        })
      } catch (error) {
        console.error("Failed to persist practice doubtful flag", error)
      }
    }
  }

  const handleSubmit = async () => {
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

      // Clear local storage on successful submit
      localStorage.removeItem(`practice_attempt_${tryoutId}`)

      toast.success("Latihan berhasil diselesaikan!")

      // Redirect to result page
      router.push(
        `/dashboard/latihan/${tryoutId}/result?submissionId=${submissionId}&score=${data.score}&correct=${data.correctCount}&total=${data.totalCount}`
      )
    } catch {
      toast.error("Gagal submit latihan.")
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] font-mono">
        <div className="bg-surface-white border-2 border-dashed border-[#171717] bg-grid-blueprint p-12 text-center relative tick-corner">
          <div className="size-3 bg-accent-canary border border-[#171717] mx-auto mb-3 animate-spin" />
          <p className="font-mono text-xs font-bold text-[#171717]">
            &gt; STATUS: INITIALIZING_PRACTICE_MODULE...
          </p>
          <p className="font-mono text-[10px] text-ink-muted mt-1">
            MENYIAPKAN LEMBAR LATIHAN MANDIRI
          </p>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]
  const answeredCount = Object.values(answers).filter((a) => a?.answer !== null).length
  const doubtfulCount = Object.values(answers).filter((a) => a?.isDoubtful).length

  // Construct options array
  const isShortAnswer = currentQuestion?.option_a === "-"
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
        timeLeft={0}
        currentIndex={currentIndex}
        totalQuestions={questions.length}
        answeredCount={answeredCount}
        tokenId={tryoutId.slice(0, 8)}
        subject={currentQuestion?.category || "LATIHAN_MANDIRI"}
        isPractice={true}
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
          isShortAnswer={isShortAnswer}
          shortAnswerValue={answers[currentQuestion.id]?.answer || ""}
          onShortAnswerChange={(val) => handleAnswer(currentQuestion.id, val)}
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
          handleSubmit()
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
