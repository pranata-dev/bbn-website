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

export const UTS_PACKAGES = [
    { value: "flux-session", label: "Flux Session" },
    { value: "berotak-senku-mode", label: "Berotak Senku Mode" },
    { value: "einstein-mode", label: "Einstein Mode" },
] as const

export const WHATSAPP_REGEX = /^(\+62|62|08)\d{8,13}$/
