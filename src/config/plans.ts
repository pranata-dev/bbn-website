export type SubscriptionPlanCode = "FREE" | "MONTHLY" | "SEMESTER"

export type CourseTrack = "PHYSICS_SEM_3" | "NON_PHYSICS" | "LEGACY" | "ALL"

export interface SubscriptionPlan {
    code: SubscriptionPlanCode
    label: string
    durationDays: number
    price: number
    originalPrice?: number
    features: string[]
    tracks: CourseTrack[]
    isPopular?: boolean
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionPlanCode, SubscriptionPlan> = {
    FREE: {
        code: "FREE",
        label: "Paket Gratis (Freemium)",
        durationDays: 0,
        price: 0,
        features: [
            "Akses modul materi bertanda Preview Gratis",
            "1x simulasi tryout/latihan diagnostik gratis",
            "Akses fitur dasar dashboard",
        ],
        tracks: ["PHYSICS_SEM_3", "NON_PHYSICS", "LEGACY", "ALL"],
    },
    MONTHLY: {
        code: "MONTHLY",
        label: "Paket Bulanan",
        durationDays: 30,
        price: 49_000,
        originalPrice: 79_000,
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
        code: "SEMESTER",
        label: "Paket Semester",
        durationDays: 180,
        price: 129_000,
        originalPrice: 199_000,
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

