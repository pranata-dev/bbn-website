"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import UserPresenceTracker from "@/components/UserPresenceTracker"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { APP_NAME } from "@/constants"
import { getPackageFeatures, PackageFeatures } from "@/lib/package-features"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { SubjectProvider, useSubject } from "@/contexts/SubjectContext"
import { useTheme } from "@/contexts/ThemeContext"
import { Subject } from "@/types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { PHYSICS_COURSES, GENERAL_COURSES } from "./DashboardClient"

const NAV_ITEMS = [
  { id: "dashboard", href: "/dashboard", label: "Dashboard", requiredFeature: null },
  { id: "materi", href: "/dashboard/materi", label: "Materi", requiredFeature: null },
  { id: "latihan", href: "/dashboard/latihan", label: "Latihan Soal", requiredFeature: "canAccessLatihan" as keyof PackageFeatures },
  { id: "tryouts", href: "/dashboard/tryouts", label: "Tryout", requiredFeature: "canAccessTryout" as keyof PackageFeatures },
  { id: "leaderboard", href: "/dashboard/leaderboard", label: "Leaderboard", requiredFeature: null },
  { id: "history", href: "/dashboard/history", label: "Riwayat", requiredFeature: null },
  { id: "profile", href: "/dashboard/profile", label: "Profil", requiredFeature: null },
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
  subjectAccess,
  studentCategory = "PHYSICS_SEM_3",
}: {
  subjectAccess: any[]
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
    <div className="space-y-1.5">
      <label className="text-[11px] font-semibold text-[#827148]/70 uppercase tracking-wider block">
        Mata Kuliah
      </label>
      {isMounted ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="w-full flex items-center justify-between bg-[#FFEED6]/30 hover:bg-[#FFEED6]/60 border border-[#FFEED6] h-10 px-3.5 rounded-xl transition-colors text-left text-xs font-semibold text-[#827148] shadow-2xs cursor-pointer"
            >
              <div className="flex items-center gap-2 truncate">
                <div className="w-2.5 h-2.5 rounded-full bg-[#A5AF79] shrink-0" />
                <span className="truncate">{currentCourseName}</span>
              </div>
              <div className="w-4 h-4 flex items-center justify-center shrink-0">
                <div className="w-1.5 h-1.5 border-r-2 border-b-2 border-[#827148] rotate-45 mb-0.5" />
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-60 bg-white border border-[#FFEED6] rounded-xl shadow-md p-1 max-h-64 overflow-y-auto"
            align="start"
          >
            {allowedCourses.map((course) => {
              const isSelected =
                selectedSubject === course.slug || selectedSubject === course.name

              return (
                <DropdownMenuItem
                  key={course.slug}
                  className={`flex items-center justify-between cursor-pointer font-semibold text-xs px-3 py-2 rounded-lg transition-colors ${
                    isSelected
                      ? "bg-[#A5AF79]/15 text-[#827148]"
                      : "text-[#827148] hover:bg-[#FFEED6]/50"
                  }`}
                  onClick={() => {
                    setSelectedSubject(course.slug as any)
                  }}
                >
                  <div className="flex items-center gap-2 truncate">
                    <div
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        isSelected ? "bg-[#A5AF79]" : "bg-[#827148]/30"
                      }`}
                    />
                    <span className="truncate">{course.name}</span>
                  </div>
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-[#E8A07C] shrink-0" />
                  )}
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="w-full bg-[#FFEED6]/30 border border-[#FFEED6] h-10 px-3.5 rounded-xl flex items-center justify-between text-xs font-semibold text-[#827148]/60">
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
  const [subjectAccess, setSubjectAccess] = useState<any[]>([])
  const [userProfile, setUserProfile] = useState<any>(null)
  const [studentCategory, setStudentCategory] = useState<"PHYSICS_SEM_3" | "NON_PHYSICS">("PHYSICS_SEM_3")
  const { selectedSubject } = useSubject()
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
            .select("*, subject_access:user_subject_access(*)")
            .or(`auth_id.eq.${user.id},email.ilike.${userEmail}`)
            .maybeSingle()

          if (profile) {
            setUserProfile(profile)
            if (profile.subject_access) {
              setSubjectAccess(profile.subject_access)
            }
            if (profile.student_category) {
              setStudentCategory(profile.student_category)
            }
          }
        } catch (error) {
          console.error("Failed to fetch user profile", error)
        }
      }
    }

    fetchUserPackage()
  }, [])

  const activeAccess = subjectAccess.find(a => (a.subject === selectedSubject || a.subject === "ALL") && a.is_active)
  const effectivePackage = activeAccess?.package_type || userProfile?.package_type || "EINSTEIN"
  const effectiveRole = activeAccess?.role || userProfile?.role || "STUDENT_BASIC"

  const features = getPackageFeatures(effectivePackage, effectiveRole)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white font-sans">
      {/* Brand Area */}
      <div className="p-6 border-b border-[#FFEED6]">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFEED6] flex items-center justify-center border border-[#827148]/15 shrink-0">
            <div className="w-4 h-4 rounded-md bg-[#A5AF79]" />
          </div>
          <div>
            <span className="font-extrabold text-[#827148] text-sm tracking-tight block">
              {APP_NAME}
            </span>
            <span className="text-[11px] font-semibold text-[#827148]/60 block">
              Student Portal
            </span>
          </div>
        </Link>
      </div>

      {/* Course Selector */}
      <div className="px-4 py-4 border-b border-[#FFEED6]">
        <SubjectSwitcher
          subjectAccess={subjectAccess}
          studentCategory={studentCategory}
        />
      </div>

      {/* Navigation Menu */}
      <ScrollArea className="flex-1 min-h-0 p-4">
        <TooltipProvider>
          <nav className="flex flex-col gap-1.5">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href
              let isLocked = false
              if (item.requiredFeature && !features[item.requiredFeature]) {
                isLocked = true
              }

              const navContent = (
                <div
                  className={`flex items-center justify-between px-4 py-2.5 text-xs sm:text-sm font-medium transition-all ${
                    isActive && !isLocked
                      ? "bg-[#A5AF79] text-white rounded-xl shadow-2xs font-semibold"
                      : isLocked
                      ? "text-[#827148]/40 bg-[#FFEED6]/20 rounded-xl cursor-not-allowed"
                      : "text-[#827148] hover:bg-[#FFEED6]/50 rounded-xl"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${isActive && !isLocked ? "bg-white" : "bg-[#827148]/30"}`} />
                    <span>{item.label}</span>
                  </div>
                  {isLocked && (
                    <span className="bg-[#FFEED6] text-[#827148] text-[10px] font-bold px-2 py-0.5 rounded-md">
                      LOCK
                    </span>
                  )}
                </div>
              )

              if (isLocked) {
                let lockdownMessage = "Fitur ini tidak tersedia di paket Anda."
                if (item.id === "tryouts" && !features.canAccessTryout) {
                  lockdownMessage = "Upgrade ke Senku/Einstein untuk membuka Tryout"
                } else if (item.id === "latihan" && !features.canAccessLatihan) {
                  lockdownMessage = "Upgrade paket Anda untuk membuka Latihan Soal"
                }
                return (
                  <Tooltip key={item.id}>
                    <TooltipTrigger asChild>
                      <div className="w-full block">{navContent}</div>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="bg-[#827148] text-white border border-[#FFEED6] text-xs">
                      <p>{lockdownMessage}</p>
                    </TooltipContent>
                  </Tooltip>
                )
              }

              return (
                <Link key={item.id} href={item.href} className="w-full block">
                  {navContent}
                </Link>
              )
            })}
          </nav>
        </TooltipProvider>
      </ScrollArea>

      {/* Footer Menu */}
      <div className="p-4 border-t border-[#FFEED6] space-y-2">
        <button
          type="button"
          onClick={toggleTheme}
          className="w-full py-2.5 px-4 rounded-xl text-left text-xs font-semibold text-[#827148] hover:bg-[#FFEED6]/40 transition-colors flex items-center justify-between"
        >
          <span>{isDark ? "Mode Terang" : "Mode Malam"}</span>
          <div className="w-4 h-4 rounded-full bg-[#FFEED6] flex items-center justify-center border border-[#827148]/20">
            <div className="w-2 h-2 rounded-full bg-[#A5AF79]" />
          </div>
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full py-2.5 px-4 rounded-xl text-left text-xs font-semibold text-[#E8A07C] hover:bg-[#E8A07C]/10 transition-colors flex items-center justify-between"
        >
          <span>Keluar</span>
          <div className="w-2 h-2 rounded-full bg-[#E8A07C]" />
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FFEED6]/20 text-[#827148] font-sans">
      <UserPresenceTracker />

      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-[#FFEED6] sticky top-0 z-40">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#FFEED6] flex items-center justify-center border border-[#827148]/20">
            <div className="w-3.5 h-3.5 rounded-md bg-[#A5AF79]" />
          </div>
          <span className="font-extrabold text-sm text-[#827148]">
            {APP_NAME}
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg border border-[#FFEED6] bg-[#FFEED6]/30 text-[#827148]"
          aria-label="Toggle navigation menu"
        >
          <div className="w-5 h-4 flex flex-col justify-between">
            <span className="w-full h-0.5 bg-[#827148] rounded-full" />
            <span className="w-full h-0.5 bg-[#827148] rounded-full" />
            <span className="w-full h-0.5 bg-[#827148] rounded-full" />
          </div>
        </button>
      </div>

      <div className="flex">
        {/* Fixed Desktop Sidebar */}
        <aside className="hidden lg:block w-64 h-screen sticky top-0 border-r border-[#FFEED6] bg-white z-20">
          <SidebarContent />
        </aside>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-[#827148]/30 backdrop-blur-xs"
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="relative w-64 h-full bg-white z-10 shadow-xl">
              <SidebarContent />
            </aside>
          </div>
        )}

        {/* Scrollable Main Content Area */}
        <main className="flex-1 min-h-screen p-6 sm:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  )
}
