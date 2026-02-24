export type Role = "ADMIN" | "STUDENT_BASIC" | "STUDENT_PREMIUM"
export type PaymentStatus = "PENDING" | "APPROVED" | "REJECTED"
export type TryoutStatus = "DRAFT" | "ACTIVE" | "ARCHIVED"
export type SubmissionStatus = "IN_PROGRESS" | "SUBMITTED" | "TIMED_OUT"

export type QuestionCategory =
    | "ELECTRICITY"
    | "MAGNETISM"
    | "GAUSS_LAW"
    | "CAPACITANCE"
    | "ELECTROMAGNETIC_INDUCTION"
    | "AC_CIRCUITS"
    | "ELECTROMAGNETIC_WAVES"
    | "OPTICS"

export const CATEGORY_LABELS: Record<QuestionCategory, string> = {
    ELECTRICITY: "Listrik",
    MAGNETISM: "Magnetisme",
    GAUSS_LAW: "Hukum Gauss",
    CAPACITANCE: "Kapasitansi",
    ELECTROMAGNETIC_INDUCTION: "Induksi Elektromagnetik",
    AC_CIRCUITS: "Rangkaian AC",
    ELECTROMAGNETIC_WAVES: "Gelombang Elektromagnetik",
    OPTICS: "Optika",
}

export interface UserProfile {
    id: string
    authId: string
    email: string
    name: string
    role: Role
    isActive: boolean
    avatarUrl: string | null
    createdAt: string
}

export interface Payment {
    id: string
    userId: string
    proofUrl: string
    amount: number | null
    status: PaymentStatus
    notes: string | null
    reviewedBy: string | null
    reviewedAt: string | null
    createdAt: string
    user?: UserProfile
}

export interface Tryout {
    id: string
    title: string
    description: string | null
    category: QuestionCategory
    duration: number
    status: TryoutStatus
    maxAttempts: number
    startDate: string | null
    endDate: string | null
    createdAt: string
    _count?: {
        questions: number
        submissions: number
    }
}

export interface Question {
    id: string
    text: string
    category: QuestionCategory
    optionA: string
    optionB: string
    optionC: string
    optionD: string
    optionE: string | null
    correctAnswer: string
    explanation: string | null
    weight: number
    imageUrl: string | null
}

export interface Submission {
    id: string
    userId: string
    tryoutId: string
    status: SubmissionStatus
    score: number | null
    totalWeight: number | null
    correctCount: number | null
    totalCount: number | null
    startedAt: string
    submittedAt: string | null
    questionOrder: string[]
    tryout?: Tryout
    user?: UserProfile
}

export interface Answer {
    id: string
    submissionId: string
    questionId: string
    answer: string | null
    isCorrect: boolean | null
}

export interface LeaderboardEntry {
    rank: number
    userId: string
    userName: string
    avatarUrl: string | null
    totalScore: number
    totalTryouts: number
    averageScore: number
}

export interface DashboardStats {
    totalTryouts: number
    completedTryouts: number
    averageScore: number
    bestScore: number
    categoryScores: {
        category: QuestionCategory
        averageScore: number
        totalAttempts: number
    }[]
}
