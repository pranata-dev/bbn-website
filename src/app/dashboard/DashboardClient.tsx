"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

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
  student_category: "PHYSICS_SEM_3" | "NON_PHYSICS"
  package_type: string
  billing_cycle: string
}

interface DashboardClientProps {
  dbUser?: any
  subjectAccess?: any[]
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
            .select("name, full_name, email, student_category, package_type, billing_cycle")
            .eq("auth_id", authUser.id)
            .single()
          profile = data
        }

        const name =
          profile?.name ||
          profile?.full_name ||
          authUser?.user_metadata?.full_name ||
          authUser?.user_metadata?.name ||
          authUser?.email?.split("@")[0] ||
          "Pelajar"

        const studentCategory =
          (profile?.student_category as "PHYSICS_SEM_3" | "NON_PHYSICS") ||
          "PHYSICS_SEM_3"

        const packageType = profile?.package_type || "EINSTEIN"
        const billingCycle = profile?.billing_cycle || "SEMESTER"

        setUser({
          name,
          email: profile?.email || authUser?.email,
          student_category: studentCategory,
          package_type: packageType,
          billing_cycle: billingCycle,
        })
      } catch (error) {
        console.error("Failed to load user profile:", error)
        // Fallback user state
        setUser({
          name: dbUser?.name || "Pelajar",
          student_category: "PHYSICS_SEM_3",
          package_type: "EINSTEIN",
          billing_cycle: "SEMESTER",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [dbUser, router])

  // 2. Derived Active Courses list based on student_category
  const activeCourses =
    user?.student_category === "PHYSICS_SEM_3"
      ? PHYSICS_COURSES
      : GENERAL_COURSES

  // Package display helper
  const getPackageDisplayName = () => {
    if (!user) return "Einstein Mode - Semester Pass"
    const pkgMap: Record<string, string> = {
      FLUX: "Flux Session",
      flux_monthly: "Flux Session",
      SENKU: "Berotak Senku Mode",
      senku_monthly: "Berotak Senku Mode",
      senku_semester: "Berotak Senku Semester",
      EINSTEIN: "Einstein Mode",
      einstein_monthly: "Einstein Mode",
      einstein_semester: "Einstein Semester Pass",
    }
    const cycleMap: Record<string, string> = {
      MONTHLY: "Bulanan",
      bulanan: "Bulanan",
      SEMESTER: "Semester Pass",
      semester: "Semester Pass",
    }

    const pkgName = pkgMap[user.package_type] || "Einstein Mode"
    const cycleName = cycleMap[user.billing_cycle] || "Semester Pass"
    return `${pkgName} - ${cycleName}`
  }

  const canAccessTryout =
    !user ||
    user.package_type.toUpperCase().includes("SENKU") ||
    user.package_type.toUpperCase().includes("EINSTEIN")

  // Loading State Skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFEED6]/20 font-sans -m-4 sm:-m-6 lg:-m-8 p-6 sm:p-10 flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-2xl bg-[#FFEED6] flex items-center justify-center border border-[#827148]/15 mb-4 animate-pulse">
          <div className="w-4 h-4 rounded-md bg-[#A5AF79]" />
        </div>
        <p className="text-sm font-bold text-[#827148] animate-pulse">
          Memuat data dashboard...
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFEED6]/20 font-sans -m-4 sm:-m-6 lg:-m-8">
      {/* ======================================================== */}
      {/* 1. TOP NAVIGATION BAR                                    */}
      {/* ======================================================== */}
      <header className="bg-white shadow-xs border-b border-[#FFEED6] px-6 sm:px-8 py-4 flex justify-between items-center sticky top-0 z-30">
        {/* Left: Logo placeholder */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-[#FFEED6] flex items-center justify-center border border-[#827148]/15 group-hover:bg-[#A5AF79]/20 transition-colors">
            <div className="w-3 h-3 rounded-xs bg-[#A5AF79]" />
          </div>
          <span className="text-[#827148] font-bold text-lg sm:text-xl tracking-tight">
            Belajar Bareng Nata
          </span>
        </Link>

        {/* Right: Dynamic User Profile Snippet */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#A5AF79] flex items-center justify-center text-white text-xs font-bold shadow-2xs">
            {user?.name?.charAt(0).toUpperCase() || "P"}
          </div>
          <span className="text-sm font-semibold text-[#827148]">
            {user?.name || "Pelajar"}
          </span>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. MAIN CONTENT CONTAINER (12-Column Grid)               */}
      {/* ======================================================== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ======================================================== */}
          {/* LEFT COLUMN / MAIN AREA (lg:col-span-8)                  */}
          {/* ======================================================== */}
          <section className="lg:col-span-8 space-y-6">
            
            {/* Dynamic Greeting Header */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#827148] mb-2 tracking-tight">
                Halo, {user?.name || "Pelajar"}! 👋
              </h1>
              <p className="text-sm text-[#827148]/70 font-medium">
                Lanjutkan progres belajarmu hari ini.
              </p>
            </div>

            {/* Lock Curriculum Indicator (Static Badge based on DB) */}
            <div className="bg-white border border-[#FFEED6] rounded-2xl p-4 shadow-2xs flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#A5AF79]" />
                <span className="text-xs sm:text-sm font-bold text-[#827148]">
                  Kategori Kurikulum Terpilih:
                </span>
              </div>

              {user?.student_category === "PHYSICS_SEM_3" ? (
                <span className="bg-[#A5AF79] text-white text-xs px-3.5 py-1.5 rounded-full font-bold shadow-2xs tracking-wide">
                  Departemen Fisika Semester 3
                </span>
              ) : (
                <span className="bg-[#A5AF79] text-white text-xs px-3.5 py-1.5 rounded-full font-bold shadow-2xs tracking-wide">
                  Umum / Non-Fisika
                </span>
              )}
            </div>

            {/* Course Grid Section */}
            <div>
              <div className="flex items-center justify-between mt-8 mb-4">
                <h2 className="text-xl font-bold text-[#827148] flex items-center gap-2">
                  <span>📚</span>
                  <span>Katalog Materi Kamu</span>
                </h2>
                <span className="text-xs text-[#827148]/70 font-semibold bg-white border border-[#FFEED6] px-3 py-1 rounded-full">
                  {activeCourses.length} Mata Kuliah
                </span>
              </div>

              {/* Grid: 2 Columns on Desktop */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeCourses.map((course, idx) => (
                  <div
                    key={course.slug}
                    className="bg-white border-2 border-[#FFEED6] rounded-2xl p-6 hover:border-[#A5AF79] hover:-translate-y-0.5 transition-all shadow-xs flex flex-col justify-between min-h-[140px] group"
                  >
                    <div>
                      {/* Top Row: Pseudo-Icon + Tag */}
                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded-lg bg-[#FFEED6] flex items-center justify-center border border-[#827148]/10 group-hover:bg-[#A5AF79]/20 transition-colors">
                          <div className="w-2.5 h-2.5 rounded-xs bg-[#A5AF79]" />
                        </div>
                        <span className="text-[10px] font-bold text-[#827148]/60 uppercase tracking-wider bg-[#FFEED6]/40 px-2 py-0.5 rounded-md">
                          Modul {idx + 1}
                        </span>
                      </div>

                      {/* Course Name */}
                      <h3 className="font-bold text-[#827148] text-lg mt-3 group-hover:text-[#A5AF79] transition-colors leading-snug">
                        {course.name}
                      </h3>
                    </div>

                    {/* Bottom: Dynamic Link with Course Slug */}
                    <div className="pt-4 mt-2 border-t border-[#FFEED6]/60 flex items-center justify-between">
                      <Link
                        href={`/materi?course=${course.slug}`}
                        className="text-xs font-bold text-[#A5AF79] group-hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Mulai Belajar</span>
                        <span>&rarr;</span>
                      </Link>
                      <div className="w-1.5 h-1.5 rounded-full bg-[#A5AF79]/40 group-hover:bg-[#A5AF79] transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </section>

          {/* ======================================================== */}
          {/* RIGHT COLUMN / SIDEBAR (lg:col-span-4)                   */}
          {/* ======================================================== */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            {/* 1. Active Package Card */}
            <div className="bg-white border-2 border-[#FFEED6] rounded-3xl p-6 relative shadow-xs overflow-hidden">
              {/* Highlight Top Accent Bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#E8A07C]" />

              <div className="pt-1">
                <span className="text-sm text-gray-500 font-semibold block">
                  Paket Aktif
                </span>

                <h3 className="text-xl font-extrabold text-[#827148] mt-1 leading-tight tracking-tight">
                  {getPackageDisplayName()}
                </h3>

                {/* Status Badge with Pseudo-Icon */}
                <div className="bg-[#A5AF79] text-white text-xs px-2.5 py-1 rounded-full font-bold w-max mt-2 flex items-center gap-1.5 shadow-2xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span>Status: Aktif</span>
                </div>

                {/* Package Highlights */}
                <div className="mt-5 pt-4 border-t border-[#FFEED6] space-y-2 text-xs text-[#827148]/80 font-medium">
                  <div className="flex items-center justify-between">
                    <span>Akses Modul:</span>
                    <span className="font-bold text-[#827148]">All-Access Penuh</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Durasi:</span>
                    <span className="font-bold text-[#827148]">
                      {user?.billing_cycle?.toUpperCase().includes("SEMESTER")
                        ? "6 Bulan (1 Semester)"
                        : "30 Hari (1 Bulan)"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Tipe Akses:</span>
                    <span className="font-bold text-[#A5AF79] uppercase">
                      {user?.package_type || "EINSTEIN"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Tryout & Simulation Card */}
            <div className="bg-[#A5AF79]/10 border-2 border-[#A5AF79]/20 rounded-3xl p-6 shadow-2xs">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">🎯</span>
                <h3 className="text-base font-bold text-[#827148]">
                  Simulasi Tryout
                </h3>
              </div>

              <p className="text-xs text-[#827148]/80 font-medium mb-5 leading-relaxed">
                Uji pemahamanmu dengan simulasi ujian riil dan pembahasan soal interaktif.
              </p>

              {/* Conditional Action Button based on package_type */}
              {canAccessTryout ? (
                <Link
                  href="/dashboard/tryouts"
                  className="bg-[#827148] hover:bg-[#827148]/90 active:bg-[#6e5f3c] text-white rounded-xl py-3 w-full font-bold text-sm shadow-sm transition-colors text-center block cursor-pointer"
                >
                  Mulai Tryout
                </Link>
              ) : (
                <div className="space-y-2">
                  <button
                    type="button"
                    disabled
                    className="bg-[#827148]/20 text-[#827148]/60 rounded-xl py-3 w-full font-bold text-xs text-center block cursor-not-allowed"
                  >
                    Upgrade ke Senku/Einstein untuk akses Tryout
                  </button>
                  <Link
                    href="/dashboard/beli-paket"
                    className="text-xs font-bold text-[#E8A07C] hover:underline text-center block"
                  >
                    Lihat Pilihan Upgrade &rarr;
                  </Link>
                </div>
              )}
            </div>

          </aside>

        </div>
      </main>
    </div>
  )
}
