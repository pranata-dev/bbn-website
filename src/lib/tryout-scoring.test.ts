import { describe, it, expect } from "vitest"

describe("CBT Weighted Scoring & Anti-Exploit Formula", () => {
    it("should score correctly when student answers all questions", () => {
        const totalQuestions = [
            { id: "q1", weight: 2, correct_answer: "A" },
            { id: "q2", weight: 3, correct_answer: "B" },
            { id: "q3", weight: 5, correct_answer: "C" },
        ]
        const totalWeight = totalQuestions.reduce((sum, q) => sum + q.weight, 0) // 10

        const studentAnswers = [
            { questionId: "q1", answer: "A" }, // +2
            { questionId: "q2", answer: "B" }, // +3
            { questionId: "q3", answer: "C" }, // +5
        ]

        let correctWeight = 0
        const answerMap = new Map(studentAnswers.map(a => [a.questionId, a.answer]))
        for (const q of totalQuestions) {
            if (answerMap.get(q.id) === q.correct_answer) {
                correctWeight += q.weight
            }
        }

        const score = totalWeight > 0 ? Math.round((correctWeight / totalWeight) * 10000) / 100 : 0
        expect(score).toBe(100)
    })

    it("prevents the 1-answer = 100% exploit by evaluating against the full question set", () => {
        const totalQuestions = [
            { id: "q1", weight: 1, correct_answer: "A" },
            { id: "q2", weight: 1, correct_answer: "B" },
            { id: "q3", weight: 1, correct_answer: "C" },
            { id: "q4", weight: 1, correct_answer: "D" },
            { id: "q5", weight: 1, correct_answer: "E" },
        ]
        const totalWeight = totalQuestions.reduce((sum, q) => sum + q.weight, 0) // 5

        // Exploiter only submits 1 correct answer and leaves 4 blank
        const studentAnswers = [
            { questionId: "q1", answer: "A" },
        ]

        let correctWeight = 0
        const answerMap = new Map(studentAnswers.map(a => [a.questionId, a.answer]))
        for (const q of totalQuestions) {
            if (answerMap.get(q.id) === q.correct_answer) {
                correctWeight += q.weight
            }
        }

        const score = totalWeight > 0 ? Math.round((correctWeight / totalWeight) * 10000) / 100 : 0
        // Correct weight is 1 / 5 = 20%, NOT 1/1 = 100%
        expect(score).toBe(20)
    })

    it("evaluates 0% if all submitted answers are wrong or empty", () => {
        const totalQuestions = [
            { id: "q1", weight: 2, correct_answer: "A" },
            { id: "q2", weight: 2, correct_answer: "B" },
        ]
        const totalWeight = totalQuestions.reduce((sum, q) => sum + q.weight, 0) // 4

        const studentAnswers = [
            { questionId: "q1", answer: "C" }, // Wrong
            { questionId: "q2", answer: null }, // Unanswered
        ]

        let correctWeight = 0
        const answerMap = new Map(studentAnswers.map(a => [a.questionId, a.answer]))
        for (const q of totalQuestions) {
            const ans = answerMap.get(q.id)
            if (ans && ans === q.correct_answer) {
                correctWeight += q.weight
            }
        }

        const score = totalWeight > 0 ? Math.round((correctWeight / totalWeight) * 10000) / 100 : 0
        expect(score).toBe(0)
    })
})
