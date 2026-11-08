"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { 
  BookOpen, 
  ArrowRight, 
  Activity, 
  Award, 
  TrendingUp, 
  Calendar, 
  PlayCircle, 
  Lock, 
  CheckCircle2, 
  History, 
  ExternalLink,
  Cpu,
  Layers,
  Sparkles,
  ShieldCheck
} from "lucide-react"

export interface CourseItem {
  name: string
  slug: string
}

// -------------------------------------------------------------
// COURSE CONSTANTS (With Slugs for Routing)
// -------------------------------------------------------------
export const PHYSICS_COURSES: CourseItem[] = [
  { name: "Mekanika Newton", slug: "mekanika-newton" },
  { name: "Fisika-Matematika Lanjut", slug: "fisika-matematika-lanjut" },
  { name: "Gelombang", slug: "gelombang" },
  { name: "Elektrostatika", slug: "elektrostatika" },
  { name: "Termodinamika", slug: "termodinamika" },
  { name: "Fisika Komputasi", slug: "fisika-komputasi" },
]

export const GENERAL_COURSES: CourseItem[] = [
  { name: "Fisika Dasar 1", slug: "fisika-dasar-1" },
  { name: "Fisika Dasar 2", slug: "fisika-dasar-2" },
  { name: "Statistika dan Analisis Data", slug: "statistika-dan-analisis-data" },
  { name: "Matematika 1", slug: "matematika-1" },
]

export interface UserDashboardState {
  name: string
  email?: string
  track: "PHYSICS_SEM_3" | "NON_PHYSICS"
  plan_code: "FREE" | "MONTHLY" | "SEMESTER"
  is_active: boolean
}

interface DashboardClientProps {
  dbUser?: any
}

export default function DashboardClient({ dbUser }: DashboardClientProps) {
  const router = useRouter()
  const [user, setUser] = useState<UserDashboardState | null>(null)
  const [loading, setLoading] = useState(true)

  // 1. Supabase Session & User Profile Fetching
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()

        if (!authUser && !dbUser) {
          router.push("/login")
          return
        }

        let profile = dbUser
        if (!profile && authUser) {
          const { data } = await supabase
            .from("users")
            .select("id, name, email, is_active, subscriptions(*)")
            .eq("auth_id", authUser.id)
            .maybeSingle()
          profile = data
        }

        const name =
          profile?.name ||
          authUser?.user_metadata?.full_name ||
          authUser?.user_metadata?.name ||
          authUser?.email?.split("@")[0] ||
          "Rian Daniswara"

        const subs = profile?.subscriptions || []
        const activeSub = subs.find(
          (s: any) => s.status === "ACTIVE" && (!s.expires_at || new Date(s.expires_at) > new Date())
        )

        const track: "PHYSICS_SEM_3" | "NON_PHYSICS" =
          activeSub?.track === "NON_PHYSICS" ? "NON_PHYSICS" : "PHYSICS_SEM_3"

        const planCode: "FREE" | "MONTHLY" | "SEMESTER" =
          activeSub?.plan_code || "FREE"

        setUser({
          name,
          email: profile?.email || authUser?.email,
          track,
          plan_code: planCode,
          is_active: profile?.is_active ?? true,
        })
      } catch (error) {
        console.error("Failed to load user profile:", error)
        setUser({
          name: dbUser?.name || "Rian Daniswara",
          track: "PHYSICS_SEM_3",
          plan_code: "FREE",
          is_active: true,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [dbUser, router])

  // 2. Derived Active Courses list based on track
  const activeCourses =
    user?.track === "PHYSICS_SEM_3"
      ? PHYSICS_COURSES
      : GENERAL_COURSES

  // Package display helper
  const getPackageDisplayName = () => {
    if (!user) return "Paket Gratis (Freemium)"
    switch (user.plan_code) {
      case "SEMESTER":
        return "Paket Semester (180 Hari)"
      case "MONTHLY":
        return "Paket Bulanan (30 Hari)"
      default:
        return "Paket Gratis (Freemium)"
    }
  }

  const isPaidUser = user?.plan_code === "MONTHLY" || user?.plan_code === "SEMESTER"

  // Loading State Skeleton
  if (loading) {
    return (
      <div className="min-h-[50vh] bg-canvas-paper flex flex-col items-center justify-center p-8">
        <div className="bg-surface-white border-2 border-[#171717] p-8 technical-shadow max-w-sm w-full text-center space-y-4">
          <div className="size-10 border-2 border-[#171717] bg-accent-canary flex items-center justify-center mx-auto animate-pulse">
            <Cpu className="size-5 text-[#171717]" />
          </div>
          <div className="space-y-1">
            <div className="font-mono text-xs font-bold text-[#171717] uppercase tracking-wider">
              [SYSTEM.INITIALIZING]
            </div>
            <p className="text-xs font-mono text-ink-muted">
              Sinkronisasi BBN_EDU // CORE...
            </p>
          </div>
          <div className="w-full bg-[#171717]/10 h-2 border border-[#171717] overflow-hidden">
            <div className="h-full bg-accent-canary w-2/3 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 font-sans">
      {/* ======================================================== */}
      {/* 1. GREETING BLUEPRINT BANNER (TAB [01] DASHBOARD)       */}
      {/* ======================================================== */}
      <section className="bg-surface-white border border-[#171717] p-5 technical-shadow tick-corner">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-alert-rust text-white font-mono text-[10px] sm:text-xs px-2 py-0.5 font-bold uppercase tracking-wider">
                TARGET HARIAN // BLOK_04
              </span>
              <span className="font-mono text-xs text-ink-muted">
                EXPIRATION: 23:59 WIB
              </span>
              <span className="font-mono text-xs text-ink-muted hidden sm:inline">
                |
              </span>
              <span className="font-mono text-xs font-bold text-[#171717] bg-canvas-paper border border-[#171717] px-2 py-0.5">
                BBN_EDU // CORE
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171717] tracking-tight">
              Halo, {user?.name || "Rian Daniswara"}
            </h1>
            <p className="text-sm text-ink-muted max-w-2xl leading-relaxed">
              Target hari ini: 3 modul evaluasi selesai sebelum tengah malam. Progres modul mingguan Anda saat ini berada pada <strong className="text-[#171717]">66.7%</strong> kapasitas nominal.
            </p>
          </div>

          {/* CTA Quick Action & Progress Strip */}
          <div className="shrink-0 flex flex-col space-y-2.5 min-w-[320px]">
            <Link
              href="/dashboard/materi/hukum-coulomb-medan-listrik"
              className="px-4 py-3 bg-accent-canary text-[#171717] border border-[#171717] font-mono text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 hover:-translate-x-0.5 hover:-translate-y-0.5 technical-shadow transition-transform"
            >
              <span>Lanjutkan: Dinamika Rotasi (Modul 04)</span>
              <ArrowRight className="size-4 shrink-0" />
            </Link>
            <div className="space-y-1">
              <div className="flex justify-between font-mono text-[10px] text-ink-muted font-bold">
                <span>PROGRES HARIAN</span>
                <span className="text-alert-rust">2 / 3 SELESAI (66.7%)</span>
              </div>
              <div className="w-full bg-canvas-paper h-2 border border-[#171717] p-0.5">
                <div 
                  className="bg-alert-rust h-full transition-all duration-300" 
                  style={{ width: "66.7%" }} 
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. 4 KEY DIAGNOSTIC METRICS (4-Column Grid)              */}
      {/* ======================================================== */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 01: Materi Selesai */}
        <div className="bg-surface-white border border-[#171717] p-4 technical-shadow flex flex-col justify-between">
          <div className="flex justify-between items-start border-b border-[#D4D2C9] pb-2 mb-2">
            <span className="font-mono text-xs text-ink-muted uppercase font-bold tracking-wider">
              [METRIK 01]
            </span>
            <BookOpen className="size-4 text-[#171717]" />
          </div>
          <div className="my-2">
            <div className="font-mono text-xs text-ink-muted font-bold uppercase mb-1">
              Materi Selesai
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#171717] tracking-tight">
              18 <span className="text-xl sm:text-2xl font-normal text-ink-muted">/ 24</span>
            </div>
            <div className="font-mono text-[11px] text-ink-muted mt-1">
              75% kurikulum tuntas
            </div>
          </div>
          <div className="w-full bg-canvas-paper h-1.5 border border-[#171717] mt-2">
            <div className="bg-[#171717] h-full" style={{ width: "75%" }} />
          </div>
        </div>

        {/* Metric 02: Akurasi Latihan */}
        <div className="bg-surface-white border border-[#171717] p-4 technical-shadow flex flex-col justify-between">
          <div className="flex justify-between items-start border-b border-[#D4D2C9] pb-2 mb-2">
            <span className="font-mono text-xs text-ink-muted uppercase font-bold tracking-wider">
              [METRIK 02]
            </span>
            <Activity className="size-4 text-alert-rust" />
          </div>
          <div className="my-2">
            <div className="font-mono text-xs text-ink-muted font-bold uppercase mb-1">
              Akurasi Latihan
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#171717] tracking-tight">
              84.5%
            </div>
            <div className="font-mono text-[11px] text-green-700 font-bold mt-1">
              +2.4% dari bulan lalu
            </div>
          </div>
          <div className="w-full bg-canvas-paper h-1.5 border border-[#171717] mt-2">
            <div className="bg-green-700 h-full" style={{ width: "84.5%" }} />
          </div>
        </div>

        {/* Metric 03: Peringkat Kelas */}
        <div className="bg-surface-white border border-[#171717] p-4 technical-shadow flex flex-col justify-between">
          <div className="flex justify-between items-start border-b border-[#D4D2C9] pb-2 mb-2">
            <span className="font-mono text-xs text-ink-muted uppercase font-bold tracking-wider">
              [METRIK 03]
            </span>
            <Award className="size-4 text-[#171717]" />
          </div>
          <div className="my-2">
            <div className="font-mono text-xs text-ink-muted font-bold uppercase mb-1">
              Peringkat Kelas
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-alert-rust tracking-tight">
              #04 <span className="text-xl sm:text-2xl font-normal text-ink-muted">/ 148</span>
            </div>
            <div className="font-mono text-[11px] text-ink-muted mt-1">
              Top 3% Divisi Gold
            </div>
          </div>
          <div className="w-full bg-canvas-paper h-1.5 border border-[#171717] mt-2">
            <div className="bg-accent-canary h-full" style={{ width: "96%" }} />
          </div>
        </div>

        {/* Metric 04: Tryout Terakhir */}
        <div className="bg-surface-white border border-[#171717] p-4 technical-shadow flex flex-col justify-between">
          <div className="flex justify-between items-start border-b border-[#D4D2C9] pb-2 mb-2">
            <span className="font-mono text-xs text-ink-muted uppercase font-bold tracking-wider">
              [METRIK 04]
            </span>
            <TrendingUp className="size-4 text-[#171717]" />
          </div>
          <div className="my-2">
            <div className="font-mono text-xs text-ink-muted font-bold uppercase mb-1">
              Tryout Terakhir
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#171717] tracking-tight">
              780 <span className="text-sm font-normal text-ink-muted font-mono">/ 1000</span>
            </div>
            <div className="font-mono text-[11px] text-[#171717] font-bold mt-1">
              Prediksi PTN: 94% Lolos Tinggi
            </div>
          </div>
          <div className="w-full bg-canvas-paper h-1.5 border border-[#171717] mt-2">
            <div className="bg-alert-rust h-full" style={{ width: "78%" }} />
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. BENTO GRID (7-Col / 5-Col Split)                      */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ======================================================== */}
        {/* LEFT COLUMN (7 COLS): Agenda Box & Roadmap               */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. Agenda Box: Jadwal & Evaluasi Mendatang */}
          <div className="bg-surface-white border border-[#171717] p-5 technical-shadow space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[#171717]">
              <div className="flex items-center space-x-2">
                <Calendar className="size-4 text-[#171717]" />
                <h2 className="font-bold text-lg text-[#171717] tracking-tight">
                  Jadwal & Evaluasi Mendatang
                </h2>
              </div>
              <span className="font-mono text-[11px] font-bold text-ink-muted bg-canvas-paper px-2 py-0.5 border border-[#171717]/30">
                GMT+7 SYNCED
              </span>
            </div>

            <div className="space-y-3">
              {/* Task 1: DEADLINE */}
              <div className="p-3.5 border border-[#171717] bg-canvas-paper flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start space-x-3">
                  <span className="px-2 py-0.5 bg-alert-rust text-white font-mono text-[10px] font-bold mt-0.5 shrink-0">
                    DEADLINE
                  </span>
                  <div>
                    <h3 className="font-mono text-xs sm:text-sm font-bold text-[#171717]">
                      Kuis Modul 05: Teorema Sumbu Sejajar & Perpendikular
                    </h3>
                    <p className="text-xs text-ink-muted mt-0.5">
                      Batas waktu pengerjaan: Hari ini, 23:59 WIB — 15 Butir Analitis
                    </p>
                  </div>
                </div>
                <Link
                  href="/dashboard/tryouts"
                  className="px-3 py-1 bg-accent-canary hover:bg-[#fde667] text-[#171717] border border-[#171717] font-mono text-xs font-bold text-center self-start sm:self-center shrink-0 technical-shadow-sm transition-transform active:translate-x-0.5"
                >
                  BUKA
                </Link>
              </div>

              {/* Task 2: LIVE LAB */}
              <div className="p-3.5 border border-[#D4D2C9] bg-surface-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start space-x-3">
                  <span className="px-2 py-0.5 bg-canvas-paper border border-[#D4D2C9] font-mono text-[10px] font-bold text-[#171717] mt-0.5 shrink-0">
                    LIVE LAB
                  </span>
                  <div>
                    <h3 className="font-mono text-xs sm:text-sm font-bold text-[#171717]">
                      Bedah Soal Live: Dinamika Lagrange & Osilasi Terkopel
                    </h3>
                    <p className="text-xs text-ink-muted mt-0.5">
                      Besok, 16:00 WIB via Tele-Portal // Instruktur: Tim Akademik BBN
                    </p>
                  </div>
                </div>
                <span className="font-mono text-[11px] font-bold text-ink-muted bg-canvas-paper px-2 py-1 border border-[#D4D2C9] self-start sm:self-center shrink-0">
                  TERDAFTAR
                </span>
              </div>

              {/* Task 3: SIMULASI */}
              <div className="p-3.5 border border-[#D4D2C9] bg-surface-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start space-x-3">
                  <span className="px-2 py-0.5 bg-canvas-paper border border-[#D4D2C9] font-mono text-[10px] font-bold text-[#171717] mt-0.5 shrink-0">
                    SIMULASI
                  </span>
                  <div>
                    <h3 className="font-mono text-xs sm:text-sm font-bold text-[#171717]">
                      Eksperimen Digital: Bandul Foucault & Efek Coriolis
                    </h3>
                    <p className="text-xs text-ink-muted mt-0.5">
                      Modul Interaktif 2D Laboratorium Komputasi Sains
                    </p>
                  </div>
                </div>
                <Link
                  href="/dashboard/materi"
                  className="px-3 py-1 bg-surface-white hover:bg-canvas-paper text-[#171717] border border-[#171717] font-mono text-xs font-bold text-center self-start sm:self-center shrink-0"
                >
                  LAUNCH
                </Link>
              </div>
            </div>
          </div>

          {/* 2. Roadmap: Peta Jalur Belajar (Phase 01 - 04) */}
          <div className="bg-surface-white border border-[#171717] p-5 technical-shadow space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#171717]">
              <div>
                <span className="font-mono text-[10px] font-bold text-alert-rust uppercase tracking-wider block">
                  BBN_EDU // SYLLABUS_ROADMAP
                </span>
                <h2 className="font-bold text-lg text-[#171717] tracking-tight mt-0.5">
                  Roadmap Kurikulum Fisika Lanjutan
                </h2>
              </div>
              <span className="font-mono text-xs font-bold bg-accent-canary px-2.5 py-0.5 border border-[#171717] self-start sm:self-auto">
                TAHUN AJARAN 2025/2026
              </span>
            </div>

            {/* 4-Column Internal Grid for Phase 01 to 04 */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
              {/* Phase 01: Complete */}
              <div className="border border-[#171717] p-3 bg-canvas-paper flex flex-col justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-green-700 block mb-1">
                    FASE 01 ✓
                  </span>
                  <div className="font-mono text-xs font-bold text-[#171717]">
                    Kinematika & Vektor
                  </div>
                </div>
                <div className="font-mono text-[10px] text-ink-muted mt-3 pt-2 border-t border-[#D4D2C9]">
                  4 Modul • 100%
                </div>
              </div>

              {/* Phase 02: Complete */}
              <div className="border border-[#171717] p-3 bg-canvas-paper flex flex-col justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-green-700 block mb-1">
                    FASE 02 ✓
                  </span>
                  <div className="font-mono text-xs font-bold text-[#171717]">
                    Hukum Newton & Usaha
                  </div>
                </div>
                <div className="font-mono text-[10px] text-ink-muted mt-3 pt-2 border-t border-[#D4D2C9]">
                  6 Modul • 100%
                </div>
              </div>

              {/* Phase 03: Active Inverted Canary Yellow */}
              <div className="border-2 border-[#171717] p-3 bg-accent-canary shadow-[2px_2px_0px_#171717] flex flex-col justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-alert-rust block mb-1">
                    FASE 03 (AKTIF)
                  </span>
                  <div className="font-mono text-xs font-black text-[#171717]">
                    Dinamika Rotasi
                  </div>
                </div>
                <div className="font-mono text-[10px] text-[#171717] font-bold mt-3 pt-2 border-t border-[#171717]">
                  6 Modul • 68%
                </div>
              </div>

              {/* Phase 04: Locked */}
              <div className="border border-[#D4D2C9] p-3 bg-surface-white opacity-60 flex flex-col justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-ink-muted block mb-1">
                    FASE 04 🔒
                  </span>
                  <div className="font-mono text-xs font-bold text-ink-muted">
                    Termodinamika & Gas
                  </div>
                </div>
                <div className="font-mono text-[10px] text-ink-muted mt-3 pt-2 border-t border-[#D4D2C9]">
                  8 Modul • Terkunci
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#D4D2C9] flex flex-wrap items-center justify-between text-ink-muted font-mono text-xs gap-2">
              <div className="flex items-center gap-3">
                <span>TOTAL: 24 MODUL</span>
                <span>•</span>
                <span>SELESAI: 18</span>
                <span>•</span>
                <span>EVALUASI: 12/16</span>
              </div>
              <Link
                href="/dashboard/materi"
                className="text-[#171717] font-bold hover:underline flex items-center gap-1"
              >
                <span>Buka Silabus Lengkap</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>

          {/* 3. Course Catalog Cards (Active Courses List) */}
          <div className="bg-surface-white border border-[#171717] p-5 technical-shadow space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#171717]">
              <div>
                <span className="font-mono text-[10px] font-bold text-alert-rust uppercase tracking-wider block">
                  [SYS.04] // COURSE_CATALOG
                </span>
                <h2 className="font-bold text-lg text-[#171717] tracking-tight">
                  Katalog Mata Kuliah Kamu
                </h2>
              </div>
              <span className="font-mono text-xs font-bold text-[#171717] bg-canvas-paper border border-[#171717] px-2.5 py-0.5">
                {activeCourses.length} MATA KULIAH
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeCourses.map((course, idx) => (
                <div
                  key={course.slug}
                  className="bg-canvas-paper border border-[#171717] p-4 flex flex-col justify-between hover:bg-surface-white hover:border-alert-rust transition-all group"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between font-mono text-[10px] text-ink-muted">
                      <span className="font-bold text-[#171717]">MOD-{String(idx + 1).padStart(2, "0")}</span>
                      <span>KURIKULUM UTAMA</span>
                    </div>
                    <h3 className="font-bold text-base text-[#171717] group-hover:text-alert-rust transition-colors leading-snug">
                      {course.name}
                    </h3>
                  </div>
                  <div className="pt-3 mt-3 border-t border-[#D4D2C9] flex items-center justify-between">
                    <Link
                      href={`/dashboard/materi?course=${course.slug}`}
                      className="font-mono text-xs font-bold text-[#171717] hover:underline flex items-center gap-1"
                    >
                      <span>Mulai Belajar</span>
                      <ArrowRight className="size-3" />
                    </Link>
                    <span className="size-1.5 bg-alert-rust" />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN (5 COLS): Daily Challenge & Telemetry       */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* 1. Daily Challenge: Tantangan Harian (+50 XP) */}
          <div className="bg-surface-white border border-[#171717] p-5 technical-shadow relative space-y-3">
            <div className="flex justify-between items-start">
              <span className="font-mono text-[10px] font-bold bg-alert-rust text-white px-2 py-0.5 uppercase tracking-wider">
                TANTANGAN HARIAN (+50 XP)
              </span>
              <span className="font-mono text-xs text-ink-muted">
                ID: #CHL-092
              </span>
            </div>

            <div>
              <h3 className="font-bold text-lg text-[#171717] tracking-tight">
                Persamaan Gerak Double Pendulum
              </h3>
              <p className="text-xs text-ink-muted leading-relaxed mt-1">
                Tentukan Lagrangian <span className="font-mono font-bold text-[#171717]">L = T - V</span> pada sistem pendulum ganda bermassa m₁, m₂ dengan panjang batang kaku l₁, l₂.
              </p>
            </div>

            {/* FORMULA // SCHEMA Container */}
            <div className="bg-canvas-paper border border-[#171717] p-3 space-y-2">
              <div className="bg-[#171717] text-white px-2 py-0.5 text-[10px] font-bold font-mono inline-block">
                FORMULA // LAGRANGE
              </div>
              <div className="font-mono text-xs font-bold text-[#171717] leading-relaxed break-all bg-surface-white p-2.5 border border-[#D4D2C9]">
                L = ½(m₁+m₂)l₁²θ̇₁² + ½m₂l₂²θ̇₂² + m₂l₁l₂θ̇₁θ̇₂cos(θ₁-θ₂) + (m₁+m₂)gl₁cosθ₁ + m₂gl₂cosθ₂
              </div>
            </div>

            <Link
              href="/dashboard/tryouts"
              className="w-full py-2.5 bg-accent-canary text-[#171717] border border-[#171717] font-mono text-xs font-bold hover:bg-yellow-400 flex items-center justify-center space-x-2 technical-shadow-sm transition-transform active:translate-x-0.5 block text-center"
            >
              <span>Pecahkan Soal (+50 XP)</span>
              <ArrowRight className="size-3.5 inline ml-1" />
            </Link>
          </div>

          {/* 2. Telemetry Stream: Telemetri Belajar Terakhir */}
          <div className="bg-surface-white border border-[#171717] p-5 technical-shadow space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-[#D4D2C9]">
              <span className="font-mono text-xs font-bold uppercase text-[#171717] tracking-wider">
                TELEMETRI BELAJAR TERAKHIR
              </span>
              <History className="size-4 text-ink-muted" />
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-canvas-paper">
                <span className="text-ink-muted">14:22 WIB</span>
                <span className="text-[#171717] font-medium text-left flex-1 px-2.5 truncate">
                  Selesai: Kuis Rotasi #02
                </span>
                <span className="text-green-700 font-bold shrink-0">
                  +40 XP
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-canvas-paper">
                <span className="text-ink-muted">11:05 WIB</span>
                <span className="text-[#171717] font-medium text-left flex-1 px-2.5 truncate">
                  Unduh: Diktat Momen Inersia
                </span>
                <span className="text-ink-muted font-bold shrink-0">
                  PDF
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-canvas-paper">
                <span className="text-ink-muted">Kemarin</span>
                <span className="text-[#171717] font-medium text-left flex-1 px-2.5 truncate">
                  Simulasi Lab: Osilasi Pegas
                </span>
                <span className="text-green-700 font-bold shrink-0">
                  +25 XP
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-ink-muted">2 Hari lalu</span>
                <span className="text-[#171717] font-medium text-left flex-1 px-2.5 truncate">
                  Tryout #02 Selesai
                </span>
                <span className="text-alert-rust font-bold shrink-0">
                  780 PTS
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#D4D2C9] text-center">
              <Link
                href="/dashboard/tryouts"
                className="font-mono text-[11px] text-ink-muted hover:text-[#171717] font-bold underline"
              >
                Lihat Catatan Telemetri Lengkap →
              </Link>
            </div>
          </div>

          {/* 3. Account Status / Credentials Widget */}
          <div className="bg-surface-white border border-[#171717] p-5 technical-shadow space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#D4D2C9]">
              <span className="font-mono text-xs font-bold text-alert-rust uppercase">
                [CREDENTIAL // STATUS]
              </span>
              <ShieldCheck className="size-4 text-[#171717]" />
            </div>

            <div className="space-y-1">
              <div className="font-mono text-[10px] text-ink-muted uppercase">
                Langganan Aktif Siswa
              </div>
              <h4 className="font-black text-lg text-[#171717]">
                {getPackageDisplayName()}
              </h4>
            </div>

            <div className="p-2.5 bg-canvas-paper border border-[#171717] font-mono text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-ink-muted">KODE AKSES:</span>
                <span className="font-bold text-[#171717]">{user?.plan_code || "FREE"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">STATUS:</span>
                <span className="font-bold text-green-700">VERIFIED ACTIVE</span>
              </div>
            </div>

            {!isPaidUser && (
              <Link
                href="/dashboard/beli-paket"
                className="w-full py-2.5 bg-accent-canary hover:bg-[#fde667] text-[#171717] font-mono text-xs font-bold border border-[#171717] text-center block technical-shadow-sm transition-all"
              >
                UPGRADE KE PAKET LENGKAP &rarr;
              </Link>
            )}
          </div>

        </div>

      </div>
    </div>
  )
}
