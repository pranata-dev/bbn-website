import { v4 as uuidv4 } from "uuid"
import { createServiceClient } from "@/lib/supabase/server"
import { SubmissionStatus, Subject, UserSubjectAccess, Role, PackageType } from "@/types"
import { getPackageFeatures } from "@/lib/package-features"

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
    subject: Subject
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
    .select("*, tryouts(*)")
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

  // NEW: Validate Subject Access
  const subject = submission.tryouts.subject
  const { data: access } = await supabase
    .from("user_subject_access")
    .select("*")
    .eq("user_id", profile.id)
    .eq("subject", subject)
    .eq("is_active", true)
    .single() as { data: UserSubjectAccess | null }

  if (!access) {
    throw new Error(`Anda tidak memiliki akses aktif untuk mata kuliah ${subject}.`)
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

  // 4. Get correct answers
  const questionIds = answers.map((a) => a.questionId)
  const { data: correctAnswers } = await supabase
    .from("questions")
    .select("id, correct_answer, weight")
    .in("id", questionIds) as { data: QuestionResult[] | null }

  // 5. Score the answers
  let correctCount = 0
  let totalWeight = 0
  let correctWeight = 0

  const { data: existingAnswers } = await supabase
    .from("answers")
    .select("id, question_id")
    .eq("submission_id", submissionId) as { data: AnswerResult[] | null }

  const existingMap = new Map((existingAnswers || []).map((a) => [a.question_id, a.id]))

  const inserts = []
  const updates = []

  for (const a of answers) {
    const question = correctAnswers?.find((q) => q.id === a.questionId)
    const isCorrect = question ? a.answer === question.correct_answer : false
    const weight = question?.weight || 1

    totalWeight += weight
    if (isCorrect) {
      correctWeight += weight
      correctCount++
    }

    const existingId = existingMap.get(a.questionId)
    if (existingId) {
      updates.push({
        id: existingId,
        submission_id: submissionId,
        question_id: a.questionId,
        answer: a.answer,
        is_correct: isCorrect,
      })
    } else {
      inserts.push({
        id: uuidv4(),
        submission_id: submissionId,
        question_id: a.questionId,
        answer: a.answer,
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
      submitted_at: new Date().toISOString(),
    })
    .eq("id", submissionId)

  if (updateError) {
    console.error("Failed to update submission:", updateError)
    throw new Error("Gagal mengupdate status submission.")
  }

  // New: Increment attempts used for real tryouts
  if (!submission.tryouts.is_practice) {
    const features = getPackageFeatures(access.packageType as any, access.role, subject)
    const maxQuota = features.tryoutLimit

    if (access.role !== 'ADMIN' && access.tryoutAttemptsUsed >= maxQuota) {
        // This is a safety check, normally checked at start
        throw new Error("Kuota tryout Anda untuk mata kuliah ini sudah habis.")
    }

    const { error: quotaError } = await supabase
      .from("user_subject_access")
      .update({
        tryout_attempts_used: access.tryoutAttemptsUsed + 1
      })
      .eq("id", access.id)

    if (quotaError) {
      console.error("Failed to increment tryout attempts:", quotaError)
      // We don't throw here to avoid failing the whole submission if just the quota update fails?
      // Actually, it's better to be consistent. 
    }
  }

  return {
    score,
    correctCount,
    totalCount: answers.length,
    totalWeight,
    status,
  }
}
