import { v4 as uuidv4 } from "uuid"
import { createServiceClient } from "@/lib/supabase/server"
import { SubmissionStatus } from "@/types"

interface SubmitTryoutParams {
  authId: string
  tryoutId: string
  submissionId: string
  answers: { questionId: string; answer: string | null }[]
}

export interface SubmitTryoutResponse {
  score: number
  correctCount: number
  totalCount: number
  totalWeight: number
  status: SubmissionStatus
}

interface UserProfileResult {
  id: string
}

interface SubmissionWithTryout {
  id: string
  user_id: string
  tryout_id: string
  status: SubmissionStatus
  started_at: string
  tryouts: {
    duration: number
    is_practice: boolean
  }
}

interface QuestionResult {
  id: string
  correct_answer: string
  weight: number
}

interface AnswerResult {
  id: string
  question_id: string
}

export async function submitTryout({
  authId,
  tryoutId,
  submissionId,
  answers,
}: SubmitTryoutParams): Promise<SubmitTryoutResponse> {
  const supabase = createServiceClient()

  // 1. Get user profile
  const { data: profile } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", authId)
    .single() as { data: UserProfileResult | null }

  if (!profile) {
    throw new Error("Profile not found")
  }

  // 2. Validate submission exists and belongs to user
  const { data: submission, error: submissionError } = await supabase
    .from("submissions")
    .select("id, user_id, tryout_id, status, started_at, tryouts(duration, is_practice)")
    .eq("id", submissionId)
    .eq("user_id", profile.id)
    .eq("tryout_id", tryoutId)
    .single() as { data: SubmissionWithTryout | null, error: any }

  if (!submission || submissionError) {
    console.error("Submission fetch error:", submissionError)
    throw new Error("Submission tidak ditemukan.")
  }

  if (submission.status !== "IN_PROGRESS") {
    throw new Error("Tryout sudah di-submit.")
  }

  // 3. Server-side time validation
  const startStr = submission.started_at
  const utcStartStr = startStr.endsWith("Z") ? startStr : startStr + "Z"
  const startTime = new Date(utcStartStr).getTime()
  const duration = (submission.tryouts?.duration || 0) * 60 * 1000
  const now = Date.now()
  const gracePeriod = 30000

  const timedOut = now > startTime + duration + gracePeriod
  const status: SubmissionStatus = timedOut ? "TIMED_OUT" : "SUBMITTED"

  // 4. Get all questions for this tryout to compute authoritative totalWeight
  const { data: tryoutQuestionsData, error: tqError } = await supabase
    .from("tryout_questions")
    .select("question_id, questions(id, correct_answer, weight)")
    .eq("tryout_id", tryoutId)

  if (tqError || !tryoutQuestionsData || tryoutQuestionsData.length === 0) {
    throw new Error("Daftar soal tryout tidak ditemukan.")
  }

  const allQuestions: QuestionResult[] = tryoutQuestionsData
    .map((tq: any) => tq.questions)
    .filter(Boolean)

  let totalWeight = 0
  for (const q of allQuestions) {
    totalWeight += q.weight || 1
  }

  // 5. Score the answers against the full question set
  const answerMap = new Map(answers.map((a) => [a.questionId, a.answer]))

  let correctCount = 0
  let correctWeight = 0

  const { data: existingAnswers } = await supabase
    .from("answers")
    .select("id, question_id")
    .eq("submission_id", submissionId) as { data: AnswerResult[] | null }

  const existingMap = new Map((existingAnswers || []).map((a) => [a.question_id, a.id]))

  const inserts = []
  const updates = []

  for (const q of allQuestions) {
    const studentAnswer = answerMap.get(q.id) ?? null
    const isCorrect = studentAnswer !== null && studentAnswer === q.correct_answer
    const weight = q.weight || 1

    if (isCorrect) {
      correctWeight += weight
      correctCount++
    }

    const existingId = existingMap.get(q.id)
    if (existingId) {
      updates.push({
        id: existingId,
        submission_id: submissionId,
        question_id: q.id,
        answer: studentAnswer,
        is_correct: isCorrect,
      })
    } else {
      inserts.push({
        id: uuidv4(),
        submission_id: submissionId,
        question_id: q.id,
        answer: studentAnswer,
        is_correct: isCorrect,
        created_at: new Date().toISOString(),
      })
    }
  }

  const score = totalWeight > 0 ? Math.round((correctWeight / totalWeight) * 10000) / 100 : 0

  // 6. Execute bulk insert/update
  if (inserts.length > 0) {
    const { error: insertError } = await supabase.from("answers").insert(inserts)
    if (insertError) {
      console.error("Failed to insert new answers:", insertError)
      throw new Error("Gagal menyimpan jawaban.")
    }
  }

  if (updates.length > 0) {
    const { error: updateError } = await supabase.from("answers").upsert(updates)
    if (updateError) {
      console.error("Failed to update existing answers:", updateError)
      throw new Error("Gagal menyimpan jawaban akhir.")
    }
  }

  // 7. Update submission
  const { error: updateError } = await supabase
    .from("submissions")
    .update({
      status,
      score,
      total_weight: totalWeight,
      correct_count: correctCount,
      total_count: allQuestions.length,
      submitted_at: new Date().toISOString(),
    })
    .eq("id", submissionId)

  if (updateError) {
    console.error("Failed to update submission:", updateError)
    throw new Error("Gagal mengupdate status submission.")
  }

  return {
    score,
    correctCount,
    totalCount: allQuestions.length,
    totalWeight,
    status,
  }
}
