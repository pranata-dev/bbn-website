export const APP_NAME = "Belajar Bareng Nata"
export const APP_DESCRIPTION = "Platform tutor fisika personal untuk mahasiswa Fisika semester 2"

export const NAV_LINKS = [
    { href: "#fitur", label: "Fitur" },
    { href: "#cara-kerja", label: "Cara Kerja" },
    { href: "#testimoni", label: "Testimoni" },
    { href: "#harga", label: "Harga" },
    { href: "#faq", label: "FAQ" },
]

export const DASHBOARD_NAV = [
    { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
    { href: "/dashboard/tryouts", label: "Tryout", icon: "FileText" },
    { href: "/dashboard/leaderboard", label: "Leaderboard", icon: "Trophy" },
    { href: "/dashboard/history", label: "Riwayat", icon: "History" },
    { href: "/dashboard/profile", label: "Profil", icon: "User" },
]

export const ADMIN_NAV = [
    { href: "/admin", label: "Dashboard", icon: "LayoutDashboard" },
    { href: "/admin/payments", label: "Pembayaran", icon: "CreditCard" },
    { href: "/admin/users", label: "Pengguna", icon: "Users" },
    { href: "/admin/questions", label: "Soal", icon: "HelpCircle" },
    { href: "/admin/tryouts", label: "Tryout", icon: "FileText" },
    { href: "/admin/leaderboard", label: "Leaderboard", icon: "Trophy" },
    { href: "/admin/statistics", label: "Statistik", icon: "BarChart3" },
]

export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

// Registration constants
export const SUBJECTS = [
    { value: "fisika-dasar-2", label: "Fisika Dasar 2" },
    { value: "fisika-matematika", label: "Fisika-Matematika" },
] as const

export interface UTSPackageConfig {
    value: string
    label: string
    headline: string
    description: string
    features: string[]
    price: number
    isPopular?: boolean
}

export const UTS_PACKAGES: readonly UTSPackageConfig[] = [
    {
        value: "flux-session",
        label: "Flux Session",
        headline: "Bangun Fondasi Kuat Sebelum UTS",
        description:
            "Mulai dari dasar yang benar. Flux Session dirancang untuk kamu yang ingin memahami konsep secara bertahap melalui latihan intensif dan pembahasan lengkap. Cocok untuk memperkuat materi sebelum naik level ke simulasi ujian.",
        features: [
            "Latihan soal pekan 1–7 (20–30 soal setiap pekan)",
            "Pembahasan lengkap dan terstruktur",
            "Auto-save jawaban",
            "Akses fleksibel 24/7 selama 30 hari",
        ],
        price: 50_000,
    },
    {
        value: "senku-mode",
        label: "Berotak Senku Mode",
        headline: "Latihan + Simulasi Realistis Selevel UTS Asli",
        description:
            "Naik satu level. Selain latihan lengkap, kamu akan menghadapi simulasi Try Out 120 menit dengan sistem soal variatif yang benar-benar menguji logika dan pemahaman konsep secara mendalam.",
        features: [
            "Semua benefit Flux Session",
            "Try Out UTS 120 menit (50 soal)",
            "Format: sebab-akibat, benar-salah, kombinasi 1-2-3-4 benar, dan lainnya",
            "Pembahasan detail",
            "Analisis skor performa",
            "Analisis per materi",
            "Ranking (Mode Kompe)",
        ],
        price: 50_000,
    },
    {
        value: "einstein-mode",
        label: "Einstein Mode",
        headline: "Strategi Lengkap untuk Target Aman UTS (Dan Siap Balas di UAS)",
        description:
            "Ini bukan sekadar paket latihan. Ini paket pengamanan nilai. Dirancang untuk kamu yang serius ingin hasil maksimal, dengan try out tambahan, video pembahasan soal sulit, dan analisis performa mendalam.\n\nPilihan paling lengkap. Paling strategis. Paling worth it.",
        features: [
            "Semua benefit Flux Session & Berotak Senku Mode",
            "Tambahan hingga 2× Try Out (soal berbeda)",
            "Video pembahasan soal-soal sulit",
            "Analisis performa lanjutan dan evaluasi kelemahan",
        ],
        price: 50_000,
        isPopular: true,
    },
] as const

export const WHATSAPP_REGEX = /^(\+62|62|08)\d{8,13}$/
