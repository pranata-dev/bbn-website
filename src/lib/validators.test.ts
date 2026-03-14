import { describe, it, expect } from 'vitest'
import {
    registerSchema,
    loginSchema,
    setPasswordSchema,
    questionSchema,
    tryoutSchema,
    submitAnswerSchema,
    submitTryoutSchema,
    paymentApprovalSchema
} from './validators'

describe('Validators', () => {
    describe('registerSchema', () => {
        it('should validate correct registration data', () => {
            const data = { name: 'John Doe', email: 'john@example.com' }
            expect(registerSchema.safeParse(data).success).toBe(true)
        })

        it('should fail if name is too short', () => {
            const data = { name: 'J', email: 'john@example.com' }
            const result = registerSchema.safeParse(data)
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Nama minimal 2 karakter')
            }
        })

        it('should fail if email is invalid', () => {
            const data = { name: 'John Doe', email: 'invalid-email' }
            const result = registerSchema.safeParse(data)
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Email tidak valid')
            }
        })
    })

    describe('loginSchema', () => {
        it('should validate correct login data', () => {
            const data = { email: 'john@example.com', password: 'password123' }
            expect(loginSchema.safeParse(data).success).toBe(true)
        })

        it('should fail if password is too short', () => {
            const data = { email: 'john@example.com', password: '123' }
            const result = loginSchema.safeParse(data)
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Password minimal 6 karakter')
            }
        })
    })

    describe('setPasswordSchema', () => {
        it('should validate matching passwords', () => {
            const data = { password: 'newpassword123', confirmPassword: 'newpassword123' }
            expect(setPasswordSchema.safeParse(data).success).toBe(true)
        })

        it('should fail if passwords do not match', () => {
            const data = { password: 'newpassword123', confirmPassword: 'differentpassword' }
            const result = setPasswordSchema.safeParse(data)
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Password tidak cocok')
            }
        })
    })

    describe('questionSchema', () => {
        const validQuestion = {
            text: 'What is 2+2?',
            category: 'Math',
            optionA: '3',
            optionB: '4',
            optionC: '5',
            optionD: '6',
            correctAnswer: 'B',
            weight: 1
        }

        it('should validate a correct question', () => {
            expect(questionSchema.safeParse(validQuestion).success).toBe(true)
        })

        it('should fail if text is empty', () => {
            const data = { ...validQuestion, text: '' }
            expect(questionSchema.safeParse(data).success).toBe(false)
        })

        it('should fail if correctAnswer is invalid', () => {
            const data = { ...validQuestion, correctAnswer: 'Z' }
            expect(questionSchema.safeParse(data).success).toBe(false)
        })
    })

    describe('tryoutSchema', () => {
        const validTryout = {
            title: 'Sample Tryout',
            category: 'General',
            duration: 60,
            maxAttempts: 1
        }

        it('should validate a correct tryout', () => {
            expect(tryoutSchema.safeParse(validTryout).success).toBe(true)
        })

        it('should fail if duration is less than 1', () => {
            const data = { ...validTryout, duration: 0 }
            expect(tryoutSchema.safeParse(data).success).toBe(false)
        })
    })

    describe('submitAnswerSchema', () => {
        it('should validate a correct answer submission', () => {
            const data = {
                questionId: '550e8400-e29b-41d4-a716-446655440000',
                answer: 'A'
            }
            expect(submitAnswerSchema.safeParse(data).success).toBe(true)
        })

        it('should allow null answer', () => {
            const data = {
                questionId: '550e8400-e29b-41d4-a716-446655440000',
                answer: null
            }
            expect(submitAnswerSchema.safeParse(data).success).toBe(true)
        })

        it('should fail if questionId is not a UUID', () => {
            const data = {
                questionId: 'invalid-uuid',
                answer: 'A'
            }
            expect(submitAnswerSchema.safeParse(data).success).toBe(false)
        })
    })

    describe('submitTryoutSchema', () => {
        it('should validate a correct tryout submission', () => {
            const data = {
                submissionId: '550e8400-e29b-41d4-a716-446655440000',
                answers: [
                    { questionId: '550e8400-e29b-41d4-a716-446655440000', answer: 'A' }
                ]
            }
            expect(submitTryoutSchema.safeParse(data).success).toBe(true)
        })

        it('should fail if submissionId is missing', () => {
            const data = {
                answers: []
            }
            expect(submitTryoutSchema.safeParse(data).success).toBe(false)
        })

        it('should fail if submissionId is not a UUID', () => {
            const data = {
                submissionId: 'invalid-uuid',
                answers: []
            }
            expect(submitTryoutSchema.safeParse(data).success).toBe(false)
        })
    })

    describe('paymentApprovalSchema', () => {
        it('should validate correct payment approval', () => {
            const data = {
                paymentId: '550e8400-e29b-41d4-a716-446655440000',
                action: 'APPROVED',
                notes: 'All good'
            }
            expect(paymentApprovalSchema.safeParse(data).success).toBe(true)
        })

        it('should fail if action is invalid', () => {
            const data = {
                paymentId: '550e8400-e29b-41d4-a716-446655440000',
                action: 'PENDING'
            }
            expect(paymentApprovalSchema.safeParse(data).success).toBe(false)
        })
    })
})
