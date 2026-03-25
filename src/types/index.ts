export type Role = "ADMIN" | "STUDENT_BASIC" | "UTS_FLUX" | "UTS_SENKU" | "UTS_EINSTEIN"
export type Subject = "FISDAS2" | "FISMAT"
export type PaymentStatus = "PENDING" | "APPROVED" | "REJECTED"
export type TryoutStatus = "DRAFT" | "ACTIVE" | "ARCHIVED"
export type SubmissionStatus = "IN_PROGRESS" | "SUBMITTED" | "TIMED_OUT"

export type QuestionCategory =
    | "WEEK_1"
    | "WEEK_2"
    | "WEEK_3"
    | "WEEK_4"
    | "WEEK_5"
    | "WEEK_6"
    | "WEEK_7"
    | "SERIES_POWER"
    | "COMPLEX_NUMBERS"

export const CATEGORY_LABELS: Record<QuestionCategory, string> = {
    WEEK_1: "Week 1 (Coulomb's Law & Electric Fields)",
    WEEK_2: "Week 2 (Gauss's Law)",
    WEEK_3: "Week 3 (Electric Potential & Capacitance)",
    WEEK_4: "Week 4 (Current and Resistance, Circuits)",
    WEEK_5: "Week 5 (Magnetic Fields & Magnetic Fields Due to Current)",
    WEEK_6: "Week 6 (Induction and Inductance)",
    WEEK_7: "Week 7 (Electromagnetic Oscillations and Alternating Current)",
    SERIES_POWER: "Infinite Series and Power Series",
    COMPLEX_NUMBERS: "Complex Numbers",
}

export interface UserSubjectAccess {
    id: string
    userId: string
    subject: Subject
    role: Role
    packageType: PackageType | null
    tryoutAttemptsUsed: number
    isActive: boolean
    createdAt: string
    updatedAt: string
}

export type QuestionType = "MULTIPLE_CHOICE" | "ESSAY"

export type PackageType = "REGULER" | "FLUX" | "SENKU" | "EINSTEIN"

export interface UserProfile {
    id: string
    authId: string
    email: string
    name: string
    isActive: boolean
    avatarUrl: string | null
    createdAt: string
    subjectAccess?: UserSubjectAccess[]
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
    category: QuestionCategory | null
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
    subject: Subject
    type: QuestionType
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
