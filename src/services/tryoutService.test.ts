import { describe, it, expect } from "vitest"
import {
    finalizeTimedOutSubmission,
    isSubmissionExpired,
    submitTryout,
    type FinalizeSubmissionWrite,
    type GradableQuestion,
    type GradedAnswerRow,
    type PersistedAnswer,
    type TryoutStore,
    type TryoutSubmissionRecord,
} from "./tryoutService"

interface MockDbState {
    submission: TryoutSubmissionRecord
    questions: GradableQuestion[]
    answers: PersistedAnswer[]
    savedAnswerWrites: GradedAnswerRow[][]
    finalizeCalls: number
    recoverCalls: number
}

function createInMemoryStore(state: MockDbState): TryoutStore {
    return {
        async findProfileId(authId) {
            return authId === "auth-1" ? "user-1" : null
        },
        async findSubmission(submissionId, userId, tryoutId) {
            if (
                state.submission.id !== submissionId ||
                state.submission.user_id !== userId ||
                (tryoutId && state.submission.tryout_id !== tryoutId)
            ) {
                return null
            }
            return { ...state.submission }
        },
        async listTryoutQuestions(tryoutId) {
            return tryoutId === state.submission.tryout_id ? state.questions : []
        },
        async listAnswers() {
            return state.answers.map((row) => ({ ...row }))
        },
        async saveGradedAnswers(rows) {
            state.savedAnswerWrites.push(rows)
            state.answers = rows.map((row) => ({
                question_id: row.question_id,
                answer: row.answer,
                flagged: row.flagged,
            }))
        },
        async finalizeIfInProgress(submissionId, write: FinalizeSubmissionWrite) {
            state.finalizeCalls++
            if (state.submission.id !== submissionId || state.submission.status !== "IN_PROGRESS") {
                return false
            }
            state.submission = {
                ...state.submission,
                status: write.status,
                score: write.score,
                correct_count: write.correctCount,
                total_count: write.totalCount,
                total_weight: write.totalWeight,
                submitted_at: write.submittedAt,
            }
            return true
        },
        async recoverNullTimedOutScore(submissionId, write) {
            state.recoverCalls++
            if (
                state.submission.id !== submissionId ||
                state.submission.status !== "TIMED_OUT" ||
                state.submission.score !== null
            ) {
                return false
            }
            state.submission = {
                ...state.submission,
                score: write.score,
                correct_count: write.correctCount,
                total_count: write.totalCount,
                total_weight: write.totalWeight,
                submitted_at: write.submittedAt,
            }
            return true
        },
    }
}

const sampleQuestions: GradableQuestion[] = [
    { id: "q1", correct_answer: "A", weight: 2 },
    { id: "q2", correct_answer: "B", weight: 3 },
]

describe("tryoutService", () => {
    it("treats duration === 0 (untimed) and practice tryouts as never expired", () => {
        const startedAt = "2026-04-01T00:00:00+00:00"
        const hoursLater = Date.parse("2026-04-01T05:00:00Z")

        expect(
            isSubmissionExpired({ started_at: startedAt, duration: 0, is_practice: false }, hoursLater)
        ).toBe(false)
        expect(
            isSubmissionExpired({ started_at: startedAt, duration: 60, is_practice: true }, hoursLater)
        ).toBe(false)
        expect(
            isSubmissionExpired({ started_at: startedAt, duration: 60, is_practice: false }, hoursLater)
        ).toBe(true)
    })

    it("finalizes timed-out submission with computed score, counts, and submitted_at from persisted DB answers", async () => {
        const state: MockDbState = {
            submission: {
                id: "sub-1",
                user_id: "user-1",
                tryout_id: "tryout-1",
                status: "IN_PROGRESS",
                started_at: "2026-04-01T10:00:00+00:00",
                submitted_at: null,
                score: null,
                correct_count: null,
                total_count: null,
                total_weight: null,
                duration: 30,
                is_practice: false,
            },
            questions: sampleQuestions,
            answers: [{ question_id: "q1", answer: "A", flagged: true }],
            savedAnswerWrites: [],
            finalizeCalls: 0,
            recoverCalls: 0,
        }
        const store = createInMemoryStore(state)
        const now = new Date("2026-04-01T10:35:00Z")

        const result = await finalizeTimedOutSubmission(store, state.submission, now)

        expect(result).toEqual({
            score: 40,
            correctCount: 1,
            totalCount: 2,
            totalWeight: 5,
            status: "TIMED_OUT",
        })
        expect(state.submission.status).toBe("TIMED_OUT")
        expect(state.submission.score).toBe(40)
        expect(state.submission.submitted_at).toBe("2026-04-01T10:35:00.000Z")
        expect(state.savedAnswerWrites).toHaveLength(1)
        expect(state.savedAnswerWrites[0][0]).toMatchObject({
            question_id: "q1",
            answer: "A",
            flagged: true,
            is_correct: true,
        })
    })

    it("ignores late POST client answers when timedOut is true and grades strictly from persisted DB answers", async () => {
        const state: MockDbState = {
            submission: {
                id: "sub-2",
                user_id: "user-1",
                tryout_id: "tryout-1",
                status: "IN_PROGRESS",
                started_at: "2026-04-01T10:00:00+00:00",
                submitted_at: null,
                score: null,
                correct_count: null,
                total_count: null,
                total_weight: null,
                duration: 30,
                is_practice: false,
            },
            questions: sampleQuestions,
            answers: [{ question_id: "q1", answer: "A", flagged: false }],
            savedAnswerWrites: [],
            finalizeCalls: 0,
            recoverCalls: 0,
        }
        const store = createInMemoryStore(state)

        const result = await submitTryout(
            {
                authId: "auth-1",
                tryoutId: "tryout-1",
                submissionId: "sub-2",
                answers: [
                    { questionId: "q1", answer: "A" },
                    { questionId: "q2", answer: "B" },
                ],
            },
            store,
            new Date("2026-04-01T10:31:00Z")
        )

        expect(result.status).toBe("TIMED_OUT")
        expect(result.score).toBe(40)
        expect(result.correctCount).toBe(1)
    })

    it("returns persisted TIMED_OUT result idempotently on auto-submit after auto-save timeout", async () => {
        const state: MockDbState = {
            submission: {
                id: "sub-3",
                user_id: "user-1",
                tryout_id: "tryout-1",
                status: "TIMED_OUT",
                started_at: "2026-04-01T10:00:00Z",
                submitted_at: "2026-04-01T10:31:00Z",
                score: 40,
                correct_count: 1,
                total_count: 2,
                total_weight: 5,
                duration: 30,
                is_practice: false,
            },
            questions: sampleQuestions,
            answers: [{ question_id: "q1", answer: "A", flagged: false }],
            savedAnswerWrites: [],
            finalizeCalls: 0,
            recoverCalls: 0,
        }
        const store = createInMemoryStore(state)

        const result = await submitTryout(
            {
                authId: "auth-1",
                tryoutId: "tryout-1",
                submissionId: "sub-3",
                answers: [
                    { questionId: "q1", answer: "A" },
                    { questionId: "q2", answer: "B" },
                ],
            },
            store,
            new Date("2026-04-01T10:31:05Z")
        )

        expect(result).toEqual({
            score: 40,
            correctCount: 1,
            totalCount: 2,
            totalWeight: 5,
            status: "TIMED_OUT",
        })
        expect(state.savedAnswerWrites).toHaveLength(0)
    })

    it("recovers legacy TIMED_OUT rows with NULL score from persisted answers", async () => {
        const state: MockDbState = {
            submission: {
                id: "sub-legacy",
                user_id: "user-1",
                tryout_id: "tryout-1",
                status: "TIMED_OUT",
                started_at: "2026-04-01T10:00:00Z",
                submitted_at: null,
                score: null,
                correct_count: null,
                total_count: null,
                total_weight: null,
                duration: 30,
                is_practice: false,
            },
            questions: sampleQuestions,
            answers: [{ question_id: "q2", answer: "B", flagged: false }],
            savedAnswerWrites: [],
            finalizeCalls: 0,
            recoverCalls: 0,
        }
        const store = createInMemoryStore(state)

        const result = await submitTryout(
            {
                authId: "auth-1",
                tryoutId: "tryout-1",
                submissionId: "sub-legacy",
                answers: [{ questionId: "q1", answer: "A" }],
            },
            store,
            new Date("2026-04-01T11:00:00Z")
        )

        expect(result).toEqual({
            score: 60,
            correctCount: 1,
            totalCount: 2,
            totalWeight: 5,
            status: "TIMED_OUT",
        })
        expect(state.recoverCalls).toBe(1)
        expect(state.submission.score).toBe(60)
    })

    it("grades only once under concurrent double-submit and returns identical result to both callers", async () => {
        const state: MockDbState = {
            submission: {
                id: "sub-race",
                user_id: "user-1",
                tryout_id: "tryout-1",
                status: "IN_PROGRESS",
                started_at: "2026-04-01T10:00:00+00:00",
                submitted_at: null,
                score: null,
                correct_count: null,
                total_count: null,
                total_weight: null,
                duration: 60,
                is_practice: false,
            },
            questions: sampleQuestions,
            answers: [],
            savedAnswerWrites: [],
            finalizeCalls: 0,
            recoverCalls: 0,
        }
        const store = createInMemoryStore(state)
        const now = new Date("2026-04-01T10:15:00Z")

        const [first, second] = await Promise.all([
            submitTryout(
                {
                    authId: "auth-1",
                    tryoutId: "tryout-1",
                    submissionId: "sub-race",
                    answers: [
                        { questionId: "q1", answer: "A" },
                        { questionId: "q2", answer: "B" },
                    ],
                },
                store,
                now
            ),
            submitTryout(
                {
                    authId: "auth-1",
                    tryoutId: "tryout-1",
                    submissionId: "sub-race",
                    answers: [{ questionId: "q1", answer: "C" }],
                },
                store,
                now
            ),
        ])

        expect(first).toEqual(second)
        expect(first.score).toBe(100)
        expect(first.status).toBe("SUBMITTED")
        expect(state.savedAnswerWrites).toHaveLength(1)
    })

    it("does not time out an untimed (duration === 0) tryout submitted after 30 seconds", async () => {
        const state: MockDbState = {
            submission: {
                id: "sub-untimed",
                user_id: "user-1",
                tryout_id: "tryout-1",
                status: "IN_PROGRESS",
                started_at: "2026-04-01T10:00:00Z",
                submitted_at: null,
                score: null,
                correct_count: null,
                total_count: null,
                total_weight: null,
                duration: 0,
                is_practice: false,
            },
            questions: sampleQuestions,
            answers: [],
            savedAnswerWrites: [],
            finalizeCalls: 0,
            recoverCalls: 0,
        }
        const store = createInMemoryStore(state)

        const result = await submitTryout(
            {
                authId: "auth-1",
                tryoutId: "tryout-1",
                submissionId: "sub-untimed",
                answers: [{ questionId: "q1", answer: "A" }],
            },
            store,
            new Date("2026-04-01T12:00:00Z")
        )

        expect(result.status).toBe("SUBMITTED")
        expect(result.score).toBe(40)
    })
})

