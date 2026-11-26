import { createServiceClient } from "@/lib/supabase/server"
import { parseUtcTimestamp } from "@/lib/timestamp"
import { SubmissionStatus } from "@/types"

export const SUBMISSION_GRACE_PERIOD_MS = 30_000

export type FinalSubmissionStatus = Exclude<SubmissionStatus, "IN_PROGRESS">

export interface SubmitTryoutParams {
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

export class TryoutSubmitError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "TryoutSubmitError"
    this.status = status
  }
}

export interface TryoutSubmissionRecord {
  id: string
  user_id: string
  tryout_id: string
  status: SubmissionStatus
  started_at: string
  submitted_at: string | null
  score: number | null
  correct_count: number | null
  total_count: number | null
  total_weight: number | null
  duration: number
  is_practice: boolean
}

export interface GradableQuestion {
  id: string
  correct_answer: string
  weight: number | null
}

export interface PersistedAnswer {
  question_id: string
  answer: string | null
  flagged: boolean
}

export interface GradedAnswerRow {
  submission_id: string
  question_id: string
  answer: string | null
  flagged: boolean
  is_correct: boolean
}

export interface GradeResult {
  score: number
  correctCount: number
  totalCount: number
  totalWeight: number
  rows: GradedAnswerRow[]
}

export interface FinalizeSubmissionWrite {
  status: FinalSubmissionStatus
  score: number
  correctCount: number
  totalCount: number
  totalWeight: number
  submittedAt: string
}

export interface TryoutStore {
  findProfileId(authId: string): Promise<string | null>
  findSubmission(submissionId: string, userId: string, tryoutId?: string): Promise<TryoutSubmissionRecord | null>
  listTryoutQuestions(tryoutId: string): Promise<GradableQuestion[]>
  listAnswers(submissionId: string): Promise<PersistedAnswer[]>
  saveGradedAnswers(rows: GradedAnswerRow[]): Promise<void>
  /** Atomic conditional update guarded by `status = 'IN_PROGRESS'`. */
  finalizeIfInProgress(submissionId: string, write: FinalizeSubmissionWrite): Promise<boolean>
  /** Atomic recovery update guarded by `status = 'TIMED_OUT' AND score IS NULL`. */
  recoverNullTimedOutScore(submissionId: string, write: Omit<FinalizeSubmissionWrite, "status">): Promise<boolean>
}

export function isSubmissionExpired(
  submission: Pick<TryoutSubmissionRecord, "started_at" | "duration" | "is_practice">,
  nowMs: number
): boolean {
  if (submission.is_practice) return false
  const durationMinutes = Number(submission.duration) || 0
  if (durationMinutes <= 0) return false
  const startedAtMs = parseUtcTimestamp(submission.started_at)
  if (startedAtMs === null) return false
  return nowMs > startedAtMs + durationMinutes * 60_000 + SUBMISSION_GRACE_PERIOD_MS
}

export function gradeAnswers(
  submissionId: string,
  questions: GradableQuestion[],
  answerFor: (questionId: string) => string | null,
  flaggedFor: (questionId: string) => boolean
): GradeResult {
  let totalWeight = 0
  let correctWeight = 0
  let correctCount = 0
  const rows: GradedAnswerRow[] = []

  for (const question of questions) {
    const weight = question.weight || 1
    totalWeight += weight
    const answer = answerFor(question.id)
    const isCorrect = answer !== null && answer === question.correct_answer
    if (isCorrect) {
      correctWeight += weight
      correctCount++
    }
    rows.push({
      submission_id: submissionId,
      question_id: question.id,
      answer,
      flagged: flaggedFor(question.id),
      is_correct: isCorrect,
    })
  }

  const score = totalWeight > 0 ? Math.round((correctWeight / totalWeight) * 10000) / 100 : 0
  return { score, correctCount, totalCount: questions.length, totalWeight, rows }
}

function toPersistedResponse(submission: TryoutSubmissionRecord): SubmitTryoutResponse {
  return {
    score: submission.score ?? 0,
    correctCount: submission.correct_count ?? 0,
    totalCount: submission.total_count ?? 0,
    totalWeight: submission.total_weight ?? 0,
    status: submission.status,
  }
}

async function loadQuestionsOrThrow(store: TryoutStore, tryoutId: string): Promise<GradableQuestion[]> {
  const questions = await store.listTryoutQuestions(tryoutId)
  if (questions.length === 0) {
    throw new TryoutSubmitError("Daftar soal tryout tidak ditemukan.", 400)
  }
  return questions
}

/**
 * Atomically finalizes an expired IN_PROGRESS submission as TIMED_OUT using only
 * persisted DB answers, or recovers a legacy TIMED_OUT submission with a NULL score.
 */
export async function finalizeTimedOutSubmission(
  store: TryoutStore,
  submission: TryoutSubmissionRecord,
  now: Date = new Date()
): Promise<SubmitTryoutResponse> {
  if (submission.status === "TIMED_OUT" && submission.score !== null) {
    return toPersistedResponse(submission)
  }

  const questions = await loadQuestionsOrThrow(store, submission.tryout_id)
  const persisted = await store.listAnswers(submission.id)
  const persistedMap = new Map(persisted.map((row) => [row.question_id, row]))

  const grade = gradeAnswers(
    submission.id,
    questions,
    (questionId) => persistedMap.get(questionId)?.answer ?? null,
    (questionId) => persistedMap.get(questionId)?.flagged ?? false
  )

  const submittedAt = submission.submitted_at ?? now.toISOString()

  if (submission.status === "IN_PROGRESS") {
    const finalized = await store.finalizeIfInProgress(submission.id, {
      status: "TIMED_OUT",
      score: grade.score,
      correctCount: grade.correctCount,
      totalCount: grade.totalCount,
      totalWeight: grade.totalWeight,
      submittedAt,
    })

    if (finalized) {
      await store.saveGradedAnswers(grade.rows)
      return {
        score: grade.score,
        correctCount: grade.correctCount,
        totalCount: grade.totalCount,
        totalWeight: grade.totalWeight,
        status: "TIMED_OUT",
      }
    }

    const current = await store.findSubmission(submission.id, submission.user_id, submission.tryout_id)
    if (!current) {
      throw new TryoutSubmitError("Submission tidak ditemukan.", 404)
    }
    if (current.score !== null) {
      return toPersistedResponse(current)
    }
    if (current.status === "TIMED_OUT") {
      return finalizeTimedOutSubmission(store, current, now)
    }
    throw new TryoutSubmitError("Tryout sedang diproses. Silakan muat ulang beberapa saat lagi.", 409)
  }

  if (submission.status === "TIMED_OUT" && submission.score === null) {
    const recovered = await store.recoverNullTimedOutScore(submission.id, {
      score: grade.score,
      correctCount: grade.correctCount,
      totalCount: grade.totalCount,
      totalWeight: grade.totalWeight,
      submittedAt,
    })

    if (recovered) {
      await store.saveGradedAnswers(grade.rows)
      return {
        score: grade.score,
        correctCount: grade.correctCount,
        totalCount: grade.totalCount,
        totalWeight: grade.totalWeight,
        status: "TIMED_OUT",
      }
    }

    const current = await store.findSubmission(submission.id, submission.user_id, submission.tryout_id)
    if (current && current.score !== null) {
      return toPersistedResponse(current)
    }
    throw new TryoutSubmitError("Gagal memulihkan skor submission.", 500)
  }

  return toPersistedResponse(submission)
}

export async function submitTryout(
  { authId, tryoutId, submissionId, answers }: SubmitTryoutParams,
  store: TryoutStore = createSupabaseTryoutStore(),
  now: Date = new Date()
): Promise<SubmitTryoutResponse> {
  const profileId = await store.findProfileId(authId)
  if (!profileId) {
    throw new TryoutSubmitError("Profile not found", 404)
  }

  const submission = await store.findSubmission(submissionId, profileId, tryoutId)
  if (!submission) {
    throw new TryoutSubmitError("Submission tidak ditemukan.", 404)
  }

  // Idempotent return for already finalized submissions; recover legacy NULL-scored TIMED_OUT rows.
  if (submission.status !== "IN_PROGRESS") {
    if (submission.status === "TIMED_OUT" && submission.score === null) {
      return finalizeTimedOutSubmission(store, submission, now)
    }
    if (submission.score !== null) {
      return toPersistedResponse(submission)
    }
    throw new TryoutSubmitError("Tryout sudah di-submit.", 400)
  }

  // Expired attempts ignore client POST answers and grade strictly from persisted DB answers.
  if (isSubmissionExpired(submission, now.getTime())) {
    return finalizeTimedOutSubmission(store, submission, now)
  }

  const questions = await loadQuestionsOrThrow(store, tryoutId)
  const persisted = await store.listAnswers(submissionId)
  const persistedMap = new Map(persisted.map((row) => [row.question_id, row]))
  const clientMap = new Map(answers.map((entry) => [entry.questionId, entry.answer]))

  const grade = gradeAnswers(
    submissionId,
    questions,
    (questionId) =>
      clientMap.has(questionId)
        ? clientMap.get(questionId) ?? null
        : persistedMap.get(questionId)?.answer ?? null,
    (questionId) => persistedMap.get(questionId)?.flagged ?? false
  )

  const submittedAt = now.toISOString()
  const finalized = await store.finalizeIfInProgress(submissionId, {
    status: "SUBMITTED",
    score: grade.score,
    correctCount: grade.correctCount,
    totalCount: grade.totalCount,
    totalWeight: grade.totalWeight,
    submittedAt,
  })

  if (!finalized) {
    const current = await store.findSubmission(submissionId, profileId, tryoutId)
    if (!current) {
      throw new TryoutSubmitError("Submission tidak ditemukan.", 404)
    }
    if (current.status === "TIMED_OUT" && current.score === null) {
      return finalizeTimedOutSubmission(store, current, now)
    }
    if (current.score !== null) {
      return toPersistedResponse(current)
    }
    throw new TryoutSubmitError("Tryout sudah di-submit.", 400)
  }

  await store.saveGradedAnswers(grade.rows)

  return {
    score: grade.score,
    correctCount: grade.correctCount,
    totalCount: grade.totalCount,
    totalWeight: grade.totalWeight,
    status: "SUBMITTED",
  }
}

type ServiceClient = ReturnType<typeof createServiceClient>

interface TryoutMetaRow {
  duration: number | null
  is_practice: boolean | null
}

interface SubmissionRow {
  id: string
  user_id: string
  tryout_id: string
  status: SubmissionStatus
  started_at: string
  submitted_at: string | null
  score: number | null
  correct_count: number | null
  total_count: number | null
  total_weight: number | null
  tryouts: TryoutMetaRow | TryoutMetaRow[] | null
}

interface TryoutQuestionRow {
  questions: GradableQuestion | GradableQuestion[] | null
}

function firstOf<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}

export function createSupabaseTryoutStore(client: ServiceClient = createServiceClient()): TryoutStore {
  return {
    async findProfileId(authId) {
      const { data } = await client.from("users").select("id").eq("auth_id", authId).maybeSingle()
      return data?.id ?? null
    },

    async findSubmission(submissionId, userId, tryoutId) {
      let query = client
        .from("submissions")
        .select(
          "id, user_id, tryout_id, status, started_at, submitted_at, score, correct_count, total_count, total_weight, tryouts(duration, is_practice)"
        )
        .eq("id", submissionId)
        .eq("user_id", userId)
      if (tryoutId) query = query.eq("tryout_id", tryoutId)
      const { data, error } = await query.maybeSingle()
      if (error) {
        console.error("Submission fetch error:", error)
        return null
      }
      if (!data) return null
      const row = data as unknown as SubmissionRow
      const tryout = firstOf(row.tryouts)
      return {
        id: row.id,
        user_id: row.user_id,
        tryout_id: row.tryout_id,
        status: row.status,
        started_at: row.started_at,
        submitted_at: row.submitted_at,
        score: row.score,
        correct_count: row.correct_count,
        total_count: row.total_count,
        total_weight: row.total_weight,
        duration: Number(tryout?.duration) || 0,
        is_practice: Boolean(tryout?.is_practice),
      }
    },

    async listTryoutQuestions(tryoutId) {
      const { data, error } = await client
        .from("tryout_questions")
        .select("question_id, questions(id, correct_answer, weight)")
        .eq("tryout_id", tryoutId)
      if (error || !data) return []
      return (data as unknown as TryoutQuestionRow[])
        .map((row) => firstOf(row.questions))
        .filter((question): question is GradableQuestion => Boolean(question))
    },

    async listAnswers(submissionId) {
      const { data, error } = await client
        .from("answers")
        .select("question_id, answer, flagged")
        .eq("submission_id", submissionId)
      if (error) {
        console.error("Failed to load persisted answers:", error)
        throw new TryoutSubmitError("Gagal memuat jawaban tersimpan.", 500)
      }
      return (data || []).map((row) => ({
        question_id: row.question_id,
        answer: row.answer,
        flagged: Boolean(row.flagged),
      }))
    },

    async saveGradedAnswers(rows) {
      if (rows.length === 0) return
      const { error } = await client
        .from("answers")
        .upsert(rows, { onConflict: "submission_id,question_id" })
      if (error) {
        console.error("Failed to save graded answers:", error)
        throw new TryoutSubmitError("Gagal menyimpan jawaban akhir.", 500)
      }
    },

    async finalizeIfInProgress(submissionId, write) {
      const { data, error } = await client
        .from("submissions")
        .update({
          status: write.status,
          score: write.score,
          correct_count: write.correctCount,
          total_count: write.totalCount,
          total_weight: write.totalWeight,
          submitted_at: write.submittedAt,
        })
        .eq("id", submissionId)
        .eq("status", "IN_PROGRESS")
        .select("id")
      if (error) {
        console.error("Failed to finalize submission:", error)
        throw new TryoutSubmitError("Gagal mengupdate status submission.", 500)
      }
      return (data || []).length > 0
    },

    async recoverNullTimedOutScore(submissionId, write) {
      const { data, error } = await client
        .from("submissions")
        .update({
          score: write.score,
          correct_count: write.correctCount,
          total_count: write.totalCount,
          total_weight: write.totalWeight,
          submitted_at: write.submittedAt,
        })
        .eq("id", submissionId)
        .eq("status", "TIMED_OUT")
        .is("score", null)
        .select("id")
      if (error) {
        console.error("Failed to recover timed out submission:", error)
        throw new TryoutSubmitError("Gagal mengupdate status submission.", 500)
      }
      return (data || []).length > 0
    },
  }
}
