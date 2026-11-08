"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import UserPresenceTracker from "@/components/UserPresenceTracker"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { SubjectProvider, useSubject } from "@/contexts/SubjectContext"
import { useTheme } from "@/contexts/ThemeContext"
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
} from "lucide-react"

import { PHYSICS_COURSES, GENERAL_COURSES } from "./DashboardClient"

const NAV_ITEMS = [
  { id: "dashboard", href: "/dashboard", label: "[01] Dashboard", icon: LayoutDashboard },
  { id: "materi", href: "/dashboard/materi", label: "[02] Materi Modul", icon: BookOpen },
  { id: "latihan", href: "/dashboard/latihan", label: "[03] Latihan Soal", icon: HelpCircle },
  { id: "tryouts", href: "/dashboard/tryouts", label: "[04] Tryout Ujian", icon: FileCheck },
  { id: "leaderboard", href: "/dashboard/leaderboard", label: "[05] Leaderboard", icon: Trophy },
  { id: "history", href: "/dashboard/history", label: "[06] Riwayat & Skor", icon: History },
  { id: "profile", href: "/dashboard/profile", label: "[07] Profil Siswa", icon: User },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SubjectProvider>
      <DashboardLayoutInner>
        {children}
      </DashboardLayoutInner>
    </SubjectProvider>
  )
}

function SubjectSwitcher({
  studentCategory = "PHYSICS_SEM_3",
}: {
  studentCategory?: "PHYSICS_SEM_3" | "NON_PHYSICS"
}) {
  const { selectedSubject, setSelectedSubject } = useSubject()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

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
              className="w-full flex items-center justify-between bg-canvas-paper hover:bg-surface-white border border-[#171717] h-9 px-3 text-left text-xs font-semibold text-[#171717] technical-shadow-sm transition-colors cursor-pointer rounded-none"
            >
              <div className="flex items-center gap-2 truncate">
                <span className="size-2 bg-alert-rust rounded-none shrink-0" />
                <span className="truncate">{currentCourseName}</span>
              </div>
              <ChevronDown className="size-3.5 text-[#171717] shrink-0 ml-1" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-60 bg-surface-white border border-[#171717] rounded-none shadow-[2px_2px_0px_#171717] p-1 max-h-64 overflow-y-auto font-mono text-xs"
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
                      : "text-[#171717] hover:bg-canvas-paper"
                  }`}
                  onClick={() => {
                    setSelectedSubject(course.slug as any)
                  }}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className={`size-1.5 rounded-none shrink-0 ${
                        isSelected ? "bg-alert-rust" : "bg-[#171717]/40"
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
        <div className="w-full bg-canvas-paper border border-[#171717] h-9 px-3 flex items-center justify-between text-xs font-semibold text-ink-muted">
          <span>Memuat...</span>
        </div>
      )}
    </div>
  )
}

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [studentCategory, setStudentCategory] = useState<"PHYSICS_SEM_3" | "NON_PHYSICS">("PHYSICS_SEM_3")
  const { isDark, toggleTheme } = useTheme()

  useEffect(() => {
    const fetchUserPackage = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        try {
          const userEmail = (user.email || "").toLowerCase().trim()
          const { data: profile } = await supabase
            .from("users")
            .select("*, subscriptions(*)")
            .or(`auth_id.eq.${user.id},email.ilike.${userEmail}`)
            .maybeSingle()

          if (profile) {
            setUserProfile(profile)
            const subs = (profile as any).subscriptions || []
            const activeSub = subs.find((s: any) => s.status === "ACTIVE" && (!s.expires_at || new Date(s.expires_at) > new Date()))
            if (activeSub?.track === "NON_PHYSICS") {
              setStudentCategory("NON_PHYSICS")
            } else {
              setStudentCategory("PHYSICS_SEM_3")
            }
          }
        } catch (error) {
          console.error("Failed to fetch user profile", error)
        }
      }
    }

    fetchUserPackage()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-surface-white font-sans border-r border-[#171717]">
      {/* Brand Area */}
      <div className="p-5 border-b border-[#171717] bg-canvas-paper">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <span className="size-3 bg-alert-rust shrink-0 rounded-none group-hover:rotate-45 transition-transform" />
          <div>
            <span className="font-sans font-extrabold text-base tracking-tight text-[#171717] block leading-none">
              BBN Education
            </span>
            <span className="font-mono text-[10px] font-semibold text-ink-muted block mt-1 tracking-wider uppercase">
              STUDENT LMS // V2.4
            </span>
          </div>
        </Link>
      </div>

      {/* Course Registry Selector */}
      <div className="p-4 border-b border-[#171717] bg-surface-white">
        <SubjectSwitcher studentCategory={studentCategory} />
      </div>

      {/* Navigation Register */}
      <ScrollArea className="flex-1 min-h-0 p-3">
        <div className="font-mono text-[10px] text-ink-muted uppercase tracking-wider px-2 pb-2">
          INDEX DIREKTORI
        </div>
        <nav className="flex flex-col gap-1.5 font-mono text-xs">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link key={item.id} href={item.href} className="w-full block">
                <div
                  className={`flex items-center justify-between px-3 py-2 transition-all border ${
                    isActive
                      ? "bg-accent-canary text-[#171717] border-[#171717] font-bold technical-shadow-sm"
                      : "border-transparent text-[#171717] hover:bg-canvas-paper hover:border-[#171717] hover:border-r-4 hover:border-r-alert-rust"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className="size-4 shrink-0 text-[#171717]" />
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
      <div className="p-3 border-t border-[#171717] space-y-1.5 bg-canvas-paper font-mono text-xs">
        <button
          type="button"
          onClick={toggleTheme}
          className="w-full py-2 px-3 border border-[#171717] bg-surface-white hover:bg-accent-canary transition-colors flex items-center justify-between cursor-pointer"
        >
          <span className="flex items-center gap-2">
            {isDark ? <Moon className="size-3.5" /> : <Sun className="size-3.5" />}
            <span>{isDark ? "MODE MALAM" : "MODE TERANG"}</span>
          </span>
          <span className="size-1.5 bg-[#171717]" />
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full py-2 px-3 border border-[#171717] bg-surface-white hover:bg-alert-rust hover:text-surface-white transition-colors flex items-center justify-between cursor-pointer group"
        >
          <span className="flex items-center gap-2 text-alert-rust group-hover:text-surface-white font-bold">
            <LogOut className="size-3.5" />
            <span>KELUAR SESI</span>
          </span>
          <span className="size-1.5 bg-alert-rust group-hover:bg-surface-white" />
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-canvas-paper text-[#171717] font-sans antialiased">
      <UserPresenceTracker />

      {/* 1. TOP TELEMETRY UTILITY BAR (24px Fixed) */}
      <div className="h-6 w-full bg-[#171717] text-surface-white font-mono text-[10px] sm:text-[11px] px-4 flex items-center justify-between border-b border-[#171717] sticky top-0 z-50 select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="size-1.5 bg-accent-canary rounded-none" />
            <span className="font-semibold tracking-wider">SYS_LMS // BBN_EDUCATION</span>
          </div>
          <span className="text-surface-white/40">|</span>
          <span className="text-surface-white/70 hidden sm:inline">LATENCY: 24ms</span>
          <span className="text-surface-white/40 hidden sm:inline">|</span>
          <span className="text-emerald-400 font-semibold hidden md:inline">SYS_STATUS: NOMINAL</span>
        </div>

        <div className="flex items-center gap-3">
          {userProfile?.email && (
            <span className="text-surface-white/75 hidden md:inline truncate max-w-xs">
              USER: {userProfile.email}
            </span>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="text-surface-white/80 hover:text-accent-canary underline transition-colors cursor-pointer"
          >
            [LOGOUT]
          </button>
        </div>
      </div>

      {/* 2. MOBILE HEADER BAR */}
      <div className="lg:hidden flex items-center justify-between p-3.5 bg-surface-white border-b border-[#171717] sticky top-6 z-40">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="size-2.5 bg-alert-rust rounded-none" />
          <span className="font-sans font-extrabold text-sm text-[#171717]">
            BBN Education
          </span>
          <span className="font-mono text-[9px] px-1 bg-canvas-paper border border-[#171717] text-ink-muted">
            LMS
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 border border-[#171717] bg-canvas-paper text-[#171717] technical-shadow-sm cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          {sidebarOpen ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </div>

      {/* 3. WORKSPACE CONTAINER (SIDEBAR + MAIN CANVAS) */}
      <div className="flex min-h-[calc(100vh-24px)]">
        {/* Fixed Desktop Sidebar (260px) */}
        <aside className="hidden lg:block w-[260px] h-[calc(100vh-24px)] sticky top-6 z-30 shrink-0">
          <SidebarContent />
        </aside>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-[#171717]/60 backdrop-blur-xs"
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="relative w-64 h-full bg-surface-white z-10 technical-shadow">
              <SidebarContent />
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
