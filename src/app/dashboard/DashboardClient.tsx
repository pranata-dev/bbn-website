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
          "Pelajar"

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
          name: dbUser?.name || "Pelajar",
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
    <div className="font-sans space-y-8">
      {/* ======================================================== */}
      {/* MAIN CONTENT CONTAINER (12-Column Grid)                  */}
      {/* ======================================================== */}
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

              {user?.track === "PHYSICS_SEM_3" ? (
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
                        href={`/dashboard/materi?course=${course.slug}`}
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
          {/* RIGHT COLUMN / SIDEBAR INFO (lg:col-span-4)               */}
          {/* ======================================================== */}
          <aside className="lg:col-span-4 space-y-6">
            
            {/* 1. Account Summary Card */}
            <div className="bg-white border-2 border-[#FFEED6] rounded-3xl p-6 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#FFEED6]/50 rounded-bl-full pointer-events-none" />

              <div className="relative z-10">
                <div className="text-xs font-extrabold text-[#A5AF79] tracking-wider uppercase mb-1">
                  Langganan Aktif
                </div>
                <h3 className="text-xl font-bold text-[#827148] leading-tight">
                  {getPackageDisplayName()}
                </h3>

                {/* Status Indicator */}
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#A5AF79] text-white shadow-2xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span>Status: Aktif</span>
                </div>

                {/* Package Highlights */}
                <div className="mt-5 pt-4 border-t border-[#FFEED6] space-y-2 text-xs text-[#827148]/80 font-medium">
                  <div className="flex items-center justify-between">
                    <span>Akses Modul:</span>
                    <span className="font-bold text-[#827148]">
                      {isPaidUser ? "All-Access Penuh" : "Free Preview"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Durasi:</span>
                    <span className="font-bold text-[#827148]">
                      {user?.plan_code === "SEMESTER"
                        ? "6 Bulan (1 Semester)"
                        : user?.plan_code === "MONTHLY"
                        ? "30 Hari (1 Bulan)"
                        : "Freemium"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Tipe Paket:</span>
                    <span className="font-bold text-[#A5AF79] uppercase">
                      {user?.plan_code || "FREE"}
                    </span>
                  </div>
                </div>

                {!isPaidUser && (
                  <div className="mt-4 pt-3 border-t border-[#FFEED6]">
                    <Link
                      href="/dashboard/beli-paket"
                      className="block text-center bg-[#A5AF79] hover:bg-[#949e6a] text-white text-xs font-bold py-2 px-4 rounded-xl transition-colors shadow-2xs"
                    >
                      Upgrade ke Paket Penuh &rarr;
                    </Link>
                  </div>
                )}
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

              <Link
                href="/dashboard/tryouts"
                className="bg-[#827148] hover:bg-[#827148]/90 active:bg-[#6e5f3c] text-white rounded-xl py-3 w-full font-bold text-sm shadow-sm transition-colors text-center block cursor-pointer"
              >
                Mulai Tryout
              </Link>
            </div>

          </aside>

        </div>
      </div>
  )
}
