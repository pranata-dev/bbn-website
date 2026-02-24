import { z } from "zod"

export const registerSchema = z.object({
    name: z.string().min(2, "Nama minimal 2 karakter").max(100),
    email: z.string().email("Email tidak valid"),
})

export const loginSchema = z.object({
    email: z.string().email("Email tidak valid"),
    password: z.string().min(6, "Password minimal 6 karakter"),
})

export const setPasswordSchema = z.object({
    password: z.string().min(6, "Password minimal 6 karakter"),
    confirmPassword: z.string().min(6, "Password minimal 6 karakter"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
})

export const questionSchema = z.object({
    text: z.string().min(1, "Soal wajib diisi"),
    category: z.string().min(1, "Kategori wajib dipilih"),
    optionA: z.string().min(1, "Opsi A wajib diisi"),
    optionB: z.string().min(1, "Opsi B wajib diisi"),
    optionC: z.string().min(1, "Opsi C wajib diisi"),
    optionD: z.string().min(1, "Opsi D wajib diisi"),
    optionE: z.string().optional(),
    correctAnswer: z.enum(["A", "B", "C", "D", "E"]),
    explanation: z.string().optional(),
    weight: z.number().min(0.1).max(10).default(1),
})

export const tryoutSchema = z.object({
    title: z.string().min(1, "Judul wajib diisi"),
    description: z.string().optional(),
    category: z.string().min(1, "Kategori wajib dipilih"),
    duration: z.number().min(1, "Durasi minimal 1 menit").max(300),
    maxAttempts: z.number().min(1).default(1),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
})

export const submitAnswerSchema = z.object({
    questionId: z.string().uuid(),
    answer: z.enum(["A", "B", "C", "D", "E"]).nullable(),
})

export const submitTryoutSchema = z.object({
    answers: z.array(submitAnswerSchema),
})

export const paymentApprovalSchema = z.object({
    paymentId: z.string().uuid(),
    action: z.enum(["APPROVED", "REJECTED"]),
    notes: z.string().optional(),
})
