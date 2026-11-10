export type SubscriptionPlanCode = "FREE" | "MONTHLY" | "SEMESTER"
export type PlanCode = SubscriptionPlanCode

export type CourseTrack = "PHYSICS_SEM_3" | "NON_PHYSICS" | "LEGACY" | "ALL"

export interface SubscriptionPlan {
    id: string
    code: SubscriptionPlanCode
    label: string
    name: string
    subtitle: string
    badge: string
    durationDays: number
    durationLabel: string
    price: number
    priceFormatted: string
    originalPrice?: number
    originalPriceFormatted?: string
    features: string[]
    tracks: CourseTrack[]
    isPopular?: boolean
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionPlanCode, SubscriptionPlan> = {
    FREE: {
        id: "free",
        code: "FREE",
        label: "Paket Gratis (Freemium)",
        name: "Paket Gratis (Freemium)",
        subtitle: "Eksplorasi Modul & Simulasi Diagnostik",
        badge: "GRATIS",
        durationDays: 0,
        durationLabel: "Selamanya",
        price: 0,
        priceFormatted: "Gratis",
        features: [
            "Akses modul materi bertanda Preview Gratis",
            "1x simulasi tryout/latihan diagnostik gratis",
            "Akses fitur dasar dashboard",
        ],
        tracks: ["PHYSICS_SEM_3", "NON_PHYSICS", "LEGACY", "ALL"],
    },
    MONTHLY: {
        id: "monthly",
        code: "MONTHLY",
        label: "Paket Bulanan",
        name: "Paket Bulanan All-Access",
        subtitle: "Akses Penuh Seluruh Mata Kuliah Jalur Terpilih",
        badge: "30 HARI",
        durationDays: 30,
        durationLabel: "30 Hari",
        price: 35_000,
        priceFormatted: "Rp 35.000",
        originalPrice: 50_000,
        originalPriceFormatted: "Rp 50.000",
        features: [
            "Akses penuh ke semua modul materi & rumus",
            "Akses bank soal dan latihan berkala tanpa batas",
            "Simulasi CBT Tryout dengan timer & pembahasan detail",
            "Statistik performa & leaderboard",
        ],
        tracks: ["PHYSICS_SEM_3", "NON_PHYSICS"],
        isPopular: false,
    },
    SEMESTER: {
        id: "semester",
        code: "SEMESTER",
        label: "Paket Semester",
        name: "Paket Semester All-Access",
        subtitle: "Persiapan Penuh UTS & UAS 1 Semester",
        badge: "HEMAT 40%",
        durationDays: 180,
        durationLabel: "180 Hari (1 Semester)",
        price: 90_000,
        priceFormatted: "Rp 90.000",
        originalPrice: 150_000,
        originalPriceFormatted: "Rp 150.000",
        features: [
            "Semua fitur Paket Bulanan selama 1 semester penuh",
            "Akses seluruh materi persiapan UTS & UAS",
            "Prioritas pembaruan bank soal terbaru",
            "Konsultasi grup komunitas belajar",
        ],
        tracks: ["PHYSICS_SEM_3", "NON_PHYSICS"],
        isPopular: true,
    },
}

export const SUBSCRIPTION_PLAN_LIST: SubscriptionPlan[] = Object.values(SUBSCRIPTION_PLANS)

export function getPlanByCode(code: string | null | undefined): SubscriptionPlan | undefined {
    if (!code) return undefined
    const upper = code.trim().toUpperCase()
    if (upper in SUBSCRIPTION_PLANS) {
        return SUBSCRIPTION_PLANS[upper as SubscriptionPlanCode]
    }
    return SUBSCRIPTION_PLAN_LIST.find((p) => p.id === code.trim().toLowerCase())
}

export interface OfflineTutoringPlan {
    name: string
    price: string
    period: string
    features: string[]
    isPopular?: boolean
    waMessage: string
}

export const OFFLINE_TUTORING_PLANS: OfflineTutoringPlan[] = [
    {
        name: "1 Pertemuan",
        price: "Rp 55.000",
        period: "/ sesi (1.5 jam)",
        isPopular: false,
        features: [
            "1 sesi bimbingan tatap muka / privat",
            "Fokus pada 1 bab materi spesifik",
            "Bedah soal & latihan intensif",
            "Modul rangkuman materi",
        ],
        waMessage: "Halo Admin BBN, saya tertarik untuk daftar Paket Tutoring 1 Pertemuan.",
    },
    {
        name: "4 Pertemuan",
        price: "Rp 205.000",
        period: "/ 4 sesi bimbingan",
        isPopular: true,
        features: [
            "4 sesi bimbingan tatap muka / privat",
            "Pendampingan persiapan UTS/UAS",
            "Latihan soal berbobot tinggi",
            "Konsultasi tanya soal via WhatsApp",
        ],
        waMessage: "Halo Admin BBN, saya tertarik untuk daftar Paket Tutoring 4 Pertemuan.",
    },
    {
        name: "8 Pertemuan",
        price: "Rp 380.000",
        period: "/ paket intensif",
        isPopular: false,
        features: [
            "8 sesi bimbingan tatap muka / privat",
            "Kurikulum lengkap dari awal bab",
            "Simulasi ujian privat 1-on-1",
            "Evaluasi & target nilai personal",
        ],
        waMessage: "Halo Admin BBN, saya tertarik untuk daftar Paket Tutoring 8 Pertemuan.",
    },
]

