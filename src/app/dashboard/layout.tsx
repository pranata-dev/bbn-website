"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import UserPresenceTracker from "@/components/UserPresenceTracker"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BetaFeedbackDialog } from "@/components/dashboard/BetaFeedbackDialog"
import { useState, useEffect, useSyncExternalStore } from "react"
import { createClient } from "@/lib/supabase/client"
import { SubjectProvider, useSubject } from "@/contexts/SubjectContext"
import {
  EXCELLENT_COURSES,
  getExcellentBetaGrade,
  getExcellentCourseByGrade,
  type ExcellentGrade,
} from "@/config/excellent"
import type { Subject } from "@/types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ChevronDown,
  LayoutDashboard,
  BookOpen,
  HelpCircle,
  FileCheck,
  Trophy,
  History,
  User,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
  Lock,
  Check,
} from "lucide-react"

import { PHYSICS_COURSES, GENERAL_COURSES } from "./DashboardClient"

const THEME_STORAGE_KEY = "bbn-dashboard-theme"

const themeListeners = new Set<() => void>()

function subscribeTheme(callback: () => void) {
  themeListeners.add(callback)
  const onStorage = (e: StorageEvent) => {
    if (e.key === THEME_STORAGE_KEY) callback()
  }
  if (typeof window !== "undefined") {
    window.addEventListener("storage", onStorage)
  }
  return () => {
    themeListeners.delete(callback)
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", onStorage)
    }
  }
}

function getThemeSnapshot(): boolean {
  if (typeof window === "undefined") return false
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === "dark"
  } catch {
    return false
  }
}

function getServerThemeSnapshot(): boolean {
  return false
}

function setPersistedTheme(isDark: boolean) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, isDark ? "dark" : "light")
  } catch {
    // ignore storage errors
  }
  if (typeof document !== "undefined") {
    document.documentElement.classList.toggle("dark", isDark)
  }
  themeListeners.forEach((listener) => listener())
}

const NAV_ITEMS = [
  { id: "dashboard", href: "/dashboard", label: "[01] Dashboard", icon: LayoutDashboard },
  { id: "materi", href: "/dashboard/materi", label: "[02] Materi Modul", icon: BookOpen },
  { id: "latihan", href: "/dashboard/latihan", label: "[03] Latihan Soal", icon: HelpCircle },
  { id: "tryouts", href: "/dashboard/tryouts", label: "[04] Tryout Ujian", icon: FileCheck },
  { id: "leaderboard", href: "/dashboard/leaderboard", label: "[05] Leaderboard", icon: Trophy },
  { id: "history", href: "/dashboard/history", label: "[06] Riwayat & Skor", icon: History },
  { id: "profile", href: "/dashboard/profile", label: "[07] Profil Siswa", icon: User },
]

const emptySubscribe = () => () => {}

interface UserProfileRow {
  name?: string | null
  email?: string
  subscriptions?: {
    status: string
    track?: string
    expires_at?: string | null
  }[]
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [userProfile, setUserProfile] = useState<UserProfileRow | null>(null)
  const [studentName, setStudentName] = useState<string>("")
  const [studentCategory, setStudentCategory] = useState<"PHYSICS_SEM_3" | "NON_PHYSICS">("PHYSICS_SEM_3")
  const [excellentGrade, setExcellentGrade] = useState<ExcellentGrade | null>(null)

  useEffect(() => {
    const fetchUserPackage = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const betaGrade = getExcellentBetaGrade(user)
        setExcellentGrade(betaGrade)

        const fallbackName =
          (typeof user.user_metadata?.name === "string" && user.user_metadata.name) ||
          (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name) ||
          ""

        try {
          const userEmail = (user.email || "").toLowerCase().trim()
          const { data: profile } = await supabase
            .from("users")
            .select("*, subscriptions(*)")
            .or(`auth_id.eq.${user.id},email.ilike.${userEmail}`)
            .maybeSingle()

          if (profile) {
            const typedProfile = profile as UserProfileRow
            setUserProfile(typedProfile)
            setStudentName(typedProfile.name || fallbackName)
            const subs = typedProfile.subscriptions || []
            const activeSub = subs.find(
              (s) => s.status === "ACTIVE" && (!s.expires_at || new Date(s.expires_at) > new Date())
            )
            if (activeSub?.track === "NON_PHYSICS") {
              setStudentCategory("NON_PHYSICS")
            } else {
              setStudentCategory("PHYSICS_SEM_3")
            }
          } else {
            setStudentName(fallbackName)
          }
        } catch (error) {
          console.error("Failed to fetch user profile", error)
          setStudentName(fallbackName)
        }
      }
    }

    fetchUserPackage()
  }, [])

  return (
    <SubjectProvider excellentGrade={excellentGrade}>
      <DashboardLayoutInner
        userProfile={userProfile}
        studentName={studentName}
        studentCategory={studentCategory}
        excellentGrade={excellentGrade}
      >
        {children}
      </DashboardLayoutInner>
    </SubjectProvider>
  )
}

function ExcellentGradeSidebarPanel({ grade }: { grade: ExcellentGrade }) {
  return (
    <div className="space-y-2 font-mono">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">
          Mata Pelajaran: Fisika
        </span>
      </div>
      <div className="space-y-1.5">
        {EXCELLENT_COURSES.map((course) => {
          const isUnlocked = course.grade === grade
          return (
            <div
              key={course.code}
              aria-disabled={!isUnlocked}
              className={`w-full flex items-center justify-between border px-2.5 py-2 text-xs transition-colors ${
                isUnlocked
                  ? "bg-accent-canary border-[#171717] dark:border-[#FDE047] text-[#171717] font-bold technical-shadow-sm"
                  : "bg-canvas-paper dark:bg-[#22252E] border-[#171717]/35 dark:border-[#3F3F46] text-ink-muted opacity-65 cursor-not-allowed select-none"
              }`}
            >
              <span className="flex items-center gap-2 truncate">
                {isUnlocked ? (
                  <Check className="size-3.5 shrink-0 text-[#171717]" />
                ) : (
                  <Lock className="size-3 shrink-0 text-ink-muted" />
                )}
                <span className="truncate">{course.label}</span>
              </span>
              <span
                className={`text-[9px] uppercase px-1.5 py-0.5 border ${
                  isUnlocked
                    ? "bg-white border-[#171717] text-[#171717] font-bold"
                    : "bg-transparent border-[#171717]/30 dark:border-[#3F3F46] text-ink-muted"
                }`}
              >
                {isUnlocked ? "Aktif" : "Terkunci"}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function SubjectSwitcher({
  studentCategory = "PHYSICS_SEM_3",
}: {
  studentCategory?: "PHYSICS_SEM_3" | "NON_PHYSICS"
}) {
  const { selectedSubject, setSelectedSubject } = useSubject()
  const isMounted = useSyncExternalStore(emptySubscribe, () => true, () => false)

  const allowedCourses =
    studentCategory === "PHYSICS_SEM_3" ? PHYSICS_COURSES : GENERAL_COURSES

  const currentCourseName =
    allowedCourses.find((c) => c.slug === selectedSubject || c.name === selectedSubject)?.name ||
    allowedCourses[0]?.name ||
    "Pilih Mata Kuliah"

  return (
    <div className="space-y-1.5 font-mono">
      <label className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block">
        REGISTRI // MATA KULIAH
      </label>
      {isMounted ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="w-full flex items-center justify-between bg-canvas-paper hover:bg-surface-white dark:bg-[#22252E] dark:hover:bg-[#2A2E39] border border-[#171717] dark:border-[#3F3F46] h-9 px-3 text-left text-xs font-semibold text-[#171717] dark:text-[#F5F4EE] technical-shadow-sm transition-colors cursor-pointer rounded-none"
            >
              <div className="flex items-center gap-2 truncate">
                <span className="size-2 bg-alert-rust rounded-none shrink-0" />
                <span className="truncate">{currentCourseName}</span>
              </div>
              <ChevronDown className="size-3.5 text-[#171717] dark:text-[#F5F4EE] shrink-0 ml-1" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-60 bg-surface-white border border-[#171717] dark:border-[#3F3F46] rounded-none shadow-[2px_2px_0px_#171717] dark:shadow-[2px_2px_0px_#3F3F46] p-1 max-h-64 overflow-y-auto font-mono text-xs"
            align="start"
          >
            {allowedCourses.map((course) => {
              const isSelected =
                selectedSubject === course.slug || selectedSubject === course.name

              return (
                <DropdownMenuItem
                  key={course.slug}
                  className={`flex items-center justify-between cursor-pointer font-semibold text-xs px-2.5 py-2 rounded-none transition-colors ${
                    isSelected
                      ? "bg-accent-canary text-[#171717]"
                      : "text-[#171717] dark:text-[#F5F4EE] hover:bg-canvas-paper dark:hover:bg-[#22252E]"
                  }`}
                  onClick={() => {
                    setSelectedSubject(course.slug as Subject)
                  }}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className={`size-1.5 rounded-none shrink-0 ${
                        isSelected ? "bg-alert-rust" : "bg-[#171717]/40 dark:bg-[#A1A1AA]"
                      }`}
                    />
                    <span className="truncate">{course.name}</span>
                  </div>
                  {isSelected && (
                    <span className="size-1.5 bg-[#171717] rounded-none shrink-0" />
                  )}
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="w-full bg-canvas-paper border border-[#171717] dark:border-[#3F3F46] h-9 px-3 flex items-center justify-between text-xs font-semibold text-ink-muted">
          <span>Memuat...</span>
        </div>
      )}
    </div>
  )
}

interface DashboardSidebarProps {
  pathname: string
  studentCategory: "PHYSICS_SEM_3" | "NON_PHYSICS"
  excellentGrade: ExcellentGrade | null
  isDark: boolean
  onToggleTheme: () => void
  onLogout: () => void
  onNavigate?: () => void
}

function DashboardSidebarContent({
  pathname,
  studentCategory,
  excellentGrade,
  isDark,
  onToggleTheme,
  onLogout,
  onNavigate,
}: DashboardSidebarProps) {
  const isExcellentBeta = Boolean(excellentGrade)
  const visibleNavItems = isExcellentBeta
    ? NAV_ITEMS.filter((item) => item.id !== "beli-paket" && !item.href.includes("beli-paket"))
    : NAV_ITEMS

  return (
    <div className="flex flex-col h-full bg-surface-white font-sans border-r border-[#171717] dark:border-[#3F3F46]">
      {/* Brand Area */}
      <div className="p-5 border-b border-[#171717] dark:border-[#3F3F46] bg-canvas-paper">
        <Link href="/dashboard" onClick={onNavigate} className="flex items-center gap-2.5 group">
          <span className="size-3 bg-alert-rust shrink-0 rounded-none group-hover:rotate-45 transition-transform" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-sans font-extrabold text-base tracking-tight text-[#171717] dark:text-[#F5F4EE] leading-none">
                BBN Education
              </span>
              {isExcellentBeta && (
                <span className="font-mono text-[9px] font-bold uppercase px-1.5 py-0.5 bg-accent-canary text-[#171717] border border-[#171717] dark:border-[#FDE047]">
                  BETA
                </span>
              )}
            </div>
            <span className="font-mono text-[10px] font-semibold text-ink-muted block mt-1 tracking-wider uppercase">
              {isExcellentBeta ? "SAS FISIKA // BETA" : "STUDENT LMS // V2.4"}
            </span>
          </div>
        </Link>
      </div>

      {/* Course / Grade Registry Selector */}
      <div className="p-4 border-b border-[#171717] dark:border-[#3F3F46] bg-surface-white">
        {excellentGrade ? (
          <ExcellentGradeSidebarPanel grade={excellentGrade} />
        ) : (
          <SubjectSwitcher studentCategory={studentCategory} />
        )}
      </div>

      {/* Navigation Register */}
      <ScrollArea className="flex-1 min-h-0 p-3">
        <div className="font-mono text-[10px] text-ink-muted uppercase tracking-wider px-2 pb-2">
          {isExcellentBeta ? "MENU BELAJAR" : "INDEX DIREKTORI"}
        </div>
        <nav className="flex flex-col gap-1.5 font-mono text-xs">
          {visibleNavItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={onNavigate}
                className="w-full block"
              >
                <div
                  className={`flex items-center justify-between px-3 py-2 transition-all border ${
                    isActive
                      ? "bg-accent-canary text-[#171717] border-[#171717] dark:border-[#FDE047] font-bold technical-shadow-sm"
                      : "border-transparent text-[#171717] dark:text-[#F5F4EE] hover:bg-canvas-paper dark:hover:bg-[#22252E] hover:border-[#171717] dark:hover:border-[#3F3F46] hover:border-r-4 hover:border-r-alert-rust"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon
                      className={`size-4 shrink-0 ${
                        isActive ? "text-[#171717]" : "text-[#171717] dark:text-[#F5F4EE]"
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {isActive && <span className="size-1.5 bg-[#171717] shrink-0" />}
                </div>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Footer Controls */}
      <div className="p-3 border-t border-[#171717] dark:border-[#3F3F46] space-y-1.5 bg-canvas-paper font-mono text-xs">
        {isExcellentBeta && <BetaFeedbackDialog />}

        <button
          type="button"
          onClick={onToggleTheme}
          aria-pressed={isDark}
          className="w-full py-2 px-3 border border-[#171717] dark:border-[#3F3F46] bg-surface-white text-[#171717] dark:text-[#F5F4EE] hover:bg-accent-canary hover:text-[#171717] transition-colors flex items-center justify-between cursor-pointer group"
        >
          <span className="flex items-center gap-2 font-bold">
            {isDark ? <Sun className="size-3.5 text-accent-canary group-hover:text-[#171717]" /> : <Moon className="size-3.5" />}
            <span>{isDark ? "MODE TERANG" : "MODE MALAM"}</span>
          </span>
          <span
            className={`size-1.5 ${
              isDark ? "bg-accent-canary group-hover:bg-[#171717]" : "bg-[#171717]"
            }`}
          />
        </button>

        <button
          type="button"
          onClick={onLogout}
          className="w-full py-2 px-3 border border-[#171717] dark:border-[#3F3F46] bg-surface-white hover:bg-alert-rust hover:text-white transition-colors flex items-center justify-between cursor-pointer group"
        >
          <span className="flex items-center gap-2 text-alert-rust group-hover:text-white font-bold">
            <LogOut className="size-3.5" />
            <span>KELUAR SESI</span>
          </span>
          <span className="size-1.5 bg-alert-rust group-hover:bg-white" />
        </button>
      </div>
    </div>
  )
}

function DashboardLayoutInner({
  children,
  userProfile,
  studentName,
  studentCategory,
  excellentGrade,
}: {
  children: React.ReactNode
  userProfile: UserProfileRow | null
  studentName: string
  studentCategory: "PHYSICS_SEM_3" | "NON_PHYSICS"
  excellentGrade: ExcellentGrade | null
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isDark = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getServerThemeSnapshot)

  const isExcellentBeta = Boolean(excellentGrade)
  const excellentCourse = excellentGrade ? getExcellentCourseByGrade(excellentGrade) : null

  // Sync `.dark` class while inside `/dashboard/**` and strip it on unmount to isolate other routes
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark)
  }, [isDark])

  useEffect(() => {
    return () => {
      document.documentElement.classList.remove("dark")
    }
  }, [])

  const toggleTheme = () => {
    setPersistedTheme(!isDark)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    document.documentElement.classList.remove("dark")
    router.push(isExcellentBeta ? "/excellent-login" : "/login")
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-canvas-paper text-[#171717] dark:text-[#F5F4EE] font-sans antialiased">
      <UserPresenceTracker />

      {/* 1. TOP TELEMETRY UTILITY BAR (24px Fixed) */}
      <div className="h-6 w-full bg-[#171717] dark:bg-[#090B0E] text-white font-mono text-[10px] sm:text-[11px] px-4 flex items-center justify-between border-b border-[#171717] dark:border-[#3F3F46] sticky top-0 z-50 select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="size-1.5 bg-accent-canary rounded-none" />
            <span className="font-semibold tracking-wider">
              {isExcellentBeta ? "SAS FISIKA // BETA" : "SYS_LMS // BBN_EDUCATION"}
            </span>
          </div>
          {!isExcellentBeta && (
            <>
              <span className="text-white/40">|</span>
              <span className="text-white/70 hidden sm:inline">LATENCY: 24ms</span>
              <span className="text-white/40 hidden sm:inline">|</span>
              <span className="text-emerald-400 font-semibold hidden md:inline">SYS_STATUS: NOMINAL</span>
            </>
          )}
          {isExcellentBeta && excellentCourse && (
            <>
              <span className="text-white/40">|</span>
              <span className="text-accent-canary font-semibold hidden sm:inline">
                {excellentCourse.title.toUpperCase()}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isExcellentBeta ? (
            studentName && (
              <span className="text-white/80 hidden md:inline truncate max-w-xs">
                SISWA: {studentName}
              </span>
            )
          ) : (
            userProfile?.email && (
              <span className="text-white/75 hidden md:inline truncate max-w-xs">
                USER: {userProfile.email}
              </span>
            )
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="text-white/80 hover:text-accent-canary underline transition-colors cursor-pointer"
          >
            [LOGOUT]
          </button>
        </div>
      </div>

      {/* 2. MOBILE HEADER BAR */}
      <div className="lg:hidden flex items-center justify-between p-3.5 bg-surface-white border-b border-[#171717] dark:border-[#3F3F46] sticky top-6 z-40">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="size-2.5 bg-alert-rust rounded-none" />
          <span className="font-sans font-extrabold text-sm text-[#171717] dark:text-[#F5F4EE]">
            BBN Education
          </span>
          <span
            className={`font-mono text-[9px] px-1.5 py-0.5 border border-[#171717] dark:border-[#3F3F46] font-bold ${
              isExcellentBeta
                ? "bg-accent-canary text-[#171717] dark:border-[#FDE047]"
                : "bg-canvas-paper text-ink-muted"
            }`}
          >
            {isExcellentBeta ? "BETA" : "LMS"}
          </span>
        </Link>
        <div className="flex items-center gap-2">
          {isExcellentBeta && <BetaFeedbackDialog compact />}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-1.5 border border-[#171717] dark:border-[#3F3F46] bg-canvas-paper text-[#171717] dark:text-[#F5F4EE] technical-shadow-sm cursor-pointer"
            aria-label={isDark ? "Ubah ke Mode Terang" : "Ubah ke Mode Malam"}
          >
            {isDark ? <Sun className="size-4 text-accent-canary" /> : <Moon className="size-4" />}
          </button>
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 border border-[#171717] dark:border-[#3F3F46] bg-canvas-paper text-[#171717] dark:text-[#F5F4EE] technical-shadow-sm cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {sidebarOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {/* 3. WORKSPACE CONTAINER (SIDEBAR + MAIN CANVAS) */}
      <div className="flex min-h-[calc(100vh-24px)]">
        {/* Fixed Desktop Sidebar (260px) */}
        <aside className="hidden lg:block w-[260px] h-[calc(100vh-24px)] sticky top-6 z-30 shrink-0">
          <DashboardSidebarContent
            pathname={pathname}
            studentCategory={studentCategory}
            excellentGrade={excellentGrade}
            isDark={isDark}
            onToggleTheme={toggleTheme}
            onLogout={handleLogout}
          />
        </aside>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-[#0F1115]/75 backdrop-blur-xs"
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="relative w-64 h-full bg-surface-white z-10 technical-shadow">
              <DashboardSidebarContent
                pathname={pathname}
                studentCategory={studentCategory}
                excellentGrade={excellentGrade}
                isDark={isDark}
                onToggleTheme={toggleTheme}
                onLogout={handleLogout}
                onNavigate={() => setSidebarOpen(false)}
              />
            </aside>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 min-h-[calc(100vh-24px)] bg-canvas-paper p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto w-full overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
