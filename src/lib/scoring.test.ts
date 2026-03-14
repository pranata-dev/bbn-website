import { describe, it, expect } from 'vitest'
import { calculateTryoutScore } from './utils'

describe('calculateTryoutScore', () => {
    it('should calculate score correctly for all correct answers', () => {
        const answers = [
            { isCorrect: true, isAnswered: true },
            { isCorrect: true, isAnswered: true },
            { isCorrect: true, isAnswered: true },
        ]
        const result = calculateTryoutScore(answers)
        expect(result.score).toBe(12) // 3 * 4
        expect(result.correctCount).toBe(3)
        expect(result.wrongCount).toBe(0)
        expect(result.unansweredCount).toBe(0)
    })

    it('should calculate score correctly for a mix of correct, wrong, and unanswered', () => {
        const answers = [
            { isCorrect: true, isAnswered: true },    // +4
            { isCorrect: false, isAnswered: true },   // -1
            { isCorrect: false, isAnswered: false },  // 0
        ]
        const result = calculateTryoutScore(answers)
        expect(result.score).toBe(3) // 4 - 1 + 0
        expect(result.correctCount).toBe(1)
        expect(result.wrongCount).toBe(1)
        expect(result.unansweredCount).toBe(1)
    })

    it('should calculate score correctly for only wrong answers', () => {
        const answers = [
            { isCorrect: false, isAnswered: true },
            { isCorrect: false, isAnswered: true },
        ]
        const result = calculateTryoutScore(answers)
        expect(result.score).toBe(-2) // 2 * -1
        expect(result.wrongCount).toBe(2)
    })

    it('should return 0 for no answers', () => {
        const result = calculateTryoutScore([])
        expect(result.score).toBe(0)
        expect(result.correctCount).toBe(0)
        expect(result.wrongCount).toBe(0)
        expect(result.unansweredCount).toBe(0)
    })

    it('should handle all unanswered questions', () => {
        const answers = [
            { isCorrect: false, isAnswered: false },
            { isCorrect: false, isAnswered: false },
        ]
        const result = calculateTryoutScore(answers)
        expect(result.score).toBe(0)
        expect(result.unansweredCount).toBe(2)
    })
})
