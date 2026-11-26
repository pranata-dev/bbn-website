import { z } from "zod"

const QUESTION_CATEGORIES = [
    "WEEK_1",
    "WEEK_2",
    "WEEK_3",
    "WEEK_4",
    "WEEK_5",
    "WEEK_6",
    "WEEK_7",
    "SERIES_POWER",
    "COMPLEX_NUMBERS",
    "LINEAR_ALGEBRA",
] as const

const TRYOUT_STATUSES = ["DRAFT", "ACTIVE", "ARCHIVED"] as const
const USER_ROLES = ["STUDENT", "ADMIN"] as const
const SUBSCRIPTION_PLANS = ["FREE", "MONTHLY", "SEMESTER"] as const
const COURSE_TRACKS = ["PHYSICS_SEM_3", "NON_PHYSICS", "LEGACY", "ALL"] as const

const optionalNullableInt = z.preprocess((value) => {
    if (value === undefined) return undefined
    if (value === null || value === "") return null
    return value
}, z.coerce.number().int().nullable().optional())

const optionalNullableString = z.preprocess((value) => {
    if (value === undefined) return undefined
    if (value === null) return null
    return typeof value === "string" ? value.trim() : value
}, z.string().nullable().optional())

export const checkEmailSchema = z.object({
    email: z
        .string()
        .trim()
        .email("Format email tidak valid.")
        .max(255)
        .transform((value) => value.toLowerCase()),
})

export const approveRegistrationSchema = z.object({
    registrationId: z.string().trim().min(1, "Registration ID wajib diisi.").max(128),
    action: z.enum(["APPROVED", "REJECTED"]),
    notes: z.string().trim().max(1000).optional(),
})

export const patchSubmissionAnswerSchema = z
    .object({
        questionId: z.string().trim().min(1).max(128).optional(),
        answer: z.string().trim().max(16).nullable().optional(),
        flagged: z.boolean().optional(),
        incrementTabSwitch: z.boolean().optional(),
    })
    .refine((data) => Boolean(data.questionId || data.incrementTabSwitch), {
        message: "questionId or incrementTabSwitch required",
    })

export const adminCreateMaterialSchema = z.object({
    title: z.string().trim().min(1, "Title is required.").max(300),
    slug: optionalNullableString,
    summary: optionalNullableString,
    contentMd: optionalNullableString,
    driveUrl: optionalNullableString,
    podcastUrl: optionalNullableString,
    pdfUrl: optionalNullableString,
    moduleNumber: optionalNullableInt,
    sortOrder: optionalNullableInt,
    isFreePreview: z.boolean().optional(),
    isPublished: z.boolean().optional(),
    readingTimeMinutes: optionalNullableInt,
    subject: optionalNullableString,
    course_id: optionalNullableString,
})

export const adminUpdateMaterialSchema = adminCreateMaterialSchema

export const adminQuestionPatchSchema = z.object({
    text: z.string().trim().min(1, "Teks soal wajib diisi."),
    category: z.enum(QUESTION_CATEGORIES),
    subject: z.string().trim().max(100).optional().nullable(),
    course_id: z.string().trim().max(128).optional().nullable(),
    optionA: z.string().trim().min(1, "Pilihan A wajib diisi."),
    optionB: z.string().trim().min(1, "Pilihan B wajib diisi."),
    optionC: z.string().trim().min(1, "Pilihan C wajib diisi."),
    optionD: z.string().trim().min(1, "Pilihan D wajib diisi."),
    optionE: z.string().trim().nullable().optional(),
    correctAnswer: z.enum(["A", "B", "C", "D", "E"]),
    explanation: z.string().nullable().optional(),
    weight: z.coerce.number().min(0.1).max(100).default(1),
    removeImage: z.boolean().default(false),
})

export const adminBulkIdsSchema = z.object({
    ids: z.array(z.string().trim().min(1).max(128)).min(1, "Minimal satu ID harus dipilih.").max(500),
})

export const adminCreateTryoutSchema = z.object({
    title: z.string().trim().min(1, "Judul tryout wajib diisi.").max(300),
    description: optionalNullableString,
    category: z
        .preprocess((value) => (value === "" ? null : value), z.enum(QUESTION_CATEGORIES).nullable().optional()),
    duration: z.coerce.number().int().min(0).max(600),
    isPractice: z.boolean().optional(),
    questionIds: z
        .array(z.string().trim().min(1).max(128))
        .min(1, "Minimal satu soal harus dipilih.")
        .max(500),
    subject: optionalNullableString,
    course_id: optionalNullableString,
})

export const adminUpdateTryoutSchema = z.object({
    status: z.enum(TRYOUT_STATUSES).optional(),
    title: z.string().trim().min(1).max(300).optional(),
    description: optionalNullableString,
    duration: z.coerce.number().int().min(0).max(600).optional(),
    questionIds: z.array(z.string().trim().min(1).max(128)).max(500).optional(),
    subject: optionalNullableString,
    course_id: optionalNullableString,
})

export const adminBulkUpdateTryoutsSchema = z.object({
    ids: z.array(z.string().trim().min(1).max(128)).min(1, "No tryout IDs provided.").max(500),
    status: z.enum(TRYOUT_STATUSES),
})

export const adminPatchUserSchema = z.object({
    userId: z.string().trim().min(1, "User ID is required").max(128),
    role: z.enum(USER_ROLES).optional(),
    isActive: z.boolean().optional(),
    plan_code: z.enum(SUBSCRIPTION_PLANS).optional(),
    track: z.enum(COURSE_TRACKS).optional(),
    durationDays: z.coerce.number().int().min(1).max(730).optional(),
})

