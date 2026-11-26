import { describe, it, expect } from "vitest"
import {
    adminBulkIdsSchema,
    adminBulkUpdateTryoutsSchema,
    adminCreateMaterialSchema,
    adminCreateTryoutSchema,
    adminPatchUserSchema,
    adminQuestionPatchSchema,
    adminUpdateMaterialSchema,
    adminUpdateTryoutSchema,
    approveRegistrationSchema,
    checkEmailSchema,
    patchSubmissionAnswerSchema,
} from "./api"

describe("API Zod validation schemas", () => {
    it("validates checkEmailSchema and normalizes email", () => {
        const valid = checkEmailSchema.safeParse({ email: "  Student@Example.COM  " })
        expect(valid.success).toBe(true)
        if (valid.success) {
            expect(valid.data.email).toBe("student@example.com")
        }
        expect(checkEmailSchema.safeParse({ email: "not-an-email" }).success).toBe(false)
    })

    it("validates approveRegistrationSchema", () => {
        expect(
            approveRegistrationSchema.safeParse({
                registrationId: "reg-123",
                action: "APPROVED",
                notes: "Verified transfer",
            }).success
        ).toBe(true)
        expect(
            approveRegistrationSchema.safeParse({
                registrationId: "",
                action: "APPROVED",
            }).success
        ).toBe(false)
        expect(
            approveRegistrationSchema.safeParse({
                registrationId: "reg-123",
                action: "PENDING",
            }).success
        ).toBe(false)
    })

    it("validates patchSubmissionAnswerSchema requiring questionId or incrementTabSwitch", () => {
        expect(
            patchSubmissionAnswerSchema.safeParse({ questionId: "q-1", answer: "A" }).success
        ).toBe(true)
        expect(
            patchSubmissionAnswerSchema.safeParse({ questionId: "q-1", flagged: true }).success
        ).toBe(true)
        expect(
            patchSubmissionAnswerSchema.safeParse({ incrementTabSwitch: true }).success
        ).toBe(true)
        expect(patchSubmissionAnswerSchema.safeParse({}).success).toBe(false)
    })

    it("validates adminCreateMaterialSchema and adminUpdateMaterialSchema", () => {
        const created = adminCreateMaterialSchema.safeParse({
            title: "Bab 1 Vektor",
            moduleNumber: "1",
            sortOrder: "",
            isFreePreview: true,
            isPublished: false,
            subject: "FISDAS2",
        })
        expect(created.success).toBe(true)
        if (created.success) {
            expect(created.data.moduleNumber).toBe(1)
            expect(created.data.sortOrder).toBeNull()
        }

        expect(adminUpdateMaterialSchema.safeParse({ title: "" }).success).toBe(false)
    })

    it("validates adminQuestionPatchSchema", () => {
        const ok = adminQuestionPatchSchema.safeParse({
            text: "Berapa gaya total?",
            category: "WEEK_1",
            optionA: "10 N",
            optionB: "20 N",
            optionC: "30 N",
            optionD: "40 N",
            correctAnswer: "B",
            weight: "2",
        })
        expect(ok.success).toBe(true)
        if (ok.success) {
            expect(ok.data.weight).toBe(2)
        }

        expect(
            adminQuestionPatchSchema.safeParse({
                text: "Soal",
                category: "INVALID_CAT",
                optionA: "A",
                optionB: "B",
                optionC: "C",
                optionD: "D",
                correctAnswer: "Z",
            }).success
        ).toBe(false)
    })

    it("validates admin tryout and bulk schemas", () => {
        expect(
            adminCreateTryoutSchema.safeParse({
                title: "Tryout UTS 1",
                duration: "90",
                isPractice: false,
                questionIds: ["q-1", "q-2"],
                subject: "FISMAT",
            }).success
        ).toBe(true)
        expect(
            adminCreateTryoutSchema.safeParse({
                title: "Tryout Kosong",
                duration: 60,
                questionIds: [],
            }).success
        ).toBe(false)

        expect(
            adminUpdateTryoutSchema.safeParse({ status: "ACTIVE", duration: 0 }).success
        ).toBe(true)
        expect(
            adminUpdateTryoutSchema.safeParse({ status: "PUBLISHED" }).success
        ).toBe(false)

        expect(adminBulkIdsSchema.safeParse({ ids: ["id-1"] }).success).toBe(true)
        expect(adminBulkIdsSchema.safeParse({ ids: [] }).success).toBe(false)

        expect(
            adminBulkUpdateTryoutsSchema.safeParse({ ids: ["t-1"], status: "ARCHIVED" }).success
        ).toBe(true)
        expect(
            adminBulkUpdateTryoutsSchema.safeParse({ ids: ["t-1"], status: "INVALID" }).success
        ).toBe(false)
    })

    it("validates adminPatchUserSchema", () => {
        expect(
            adminPatchUserSchema.safeParse({
                userId: "user-1",
                role: "STUDENT",
                isActive: true,
                plan_code: "SEMESTER",
                track: "ALL",
                durationDays: "180",
            }).success
        ).toBe(true)
        expect(
            adminPatchUserSchema.safeParse({
                userId: "user-1",
                role: "SUPERADMIN",
            }).success
        ).toBe(false)
        expect(adminPatchUserSchema.safeParse({ userId: "" }).success).toBe(false)
    })
})

