"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CATEGORY_LABELS, QuestionCategory } from "@/types"
import { createClient } from "@/lib/supabase/client"
import { canAccessPracticePart } from "@/lib/package-features"
import { toast } from "sonner"
import { useSubject } from "@/contexts/SubjectContext"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { EmptyState } from "@/components/dashboard/EmptyState"

interface LatihanItem {
  id: string
  title: string
  description: string | null
  category: QuestionCategory | null
  status: string
  is_practice: boolean
  practice_part: number | null
  created_at: string
  tryout_questions: { count: number }[]
}

export default function LatihanPage() {
  const [latihans, setLatihans] = useState<LatihanItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")
  const { selectedSubject } = useSubject()
  const [subjectAccess, setSubjectAccess] = useState<any[]>([])

  useEffect(() => {
    fetchLatihan()
    fetchUserAccess()
  }, [selectedSubject])

  const fetchUserAccess = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from("users")
          .select("*, subject_access:user_subject_access(*)")
          .eq("auth_id", user.id)
          .single()
        if (profile?.subject_access) {
          setSubjectAccess(profile.subject_access)
        }
      }
    } catch (error) {
      console.error("Failed to fetch user profile", error)
    }
  }

  const fetchLatihan = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/tryouts?subject=${selectedSubject}`)
      const data = await res.json()
      const practiceItems = (data.tryouts || []).filter((t: any) => t.is_practice)
      setLatihans(practiceItems)
    } catch (error) {
      console.error("Failed to fetch latihan:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredLatihans = filter === "all"
    ? latihans
    : latihans.filter((t) => t.category === filter)

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header with Filter */}
      <PageHeader
        title="Latihan Soal"
        subtitle="Kumpulan soal untuk melatih pemahaman konsep Fisikamu secara mandiri."
        action={
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px] sm:w-[200px] bg-white border border-[#FFEED6] rounded-xl text-xs font-semibold text-[#827148] shadow-2xs">
              <SelectValue placeholder="Filter kategori" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-[#FFEED6] rounded-xl shadow-md text-xs font-medium text-[#827148]">
              <SelectItem value="all">Semua Kategori</SelectItem>
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      {/* Mini Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-[#FFEED6] flex items-center justify-between">
          <div>
            <p className="text-xs text-[#827148]/70 font-semibold uppercase tracking-wider">
              Total Latihan
            </p>
            <h3 className="text-2xl font-extrabold text-[#827148] mt-1">
              {latihans.length}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FFEED6] flex items-center justify-center">
            <div className="w-3.5 h-3.5 rounded-md bg-[#A5AF79]" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-xs border border-[#FFEED6] flex items-center justify-between">
          <div>
            <p className="text-xs text-[#827148]/70 font-semibold uppercase tracking-wider">
              Week 1–4
            </p>
            <h3 className="text-2xl font-extrabold text-[#827148] mt-1">
              {latihans.filter(t => t.category && ["WEEK_1", "WEEK_2", "WEEK_3", "WEEK_4"].includes(t.category)).length}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FFEED6] flex items-center justify-center">
            <div className="w-3.5 h-3.5 rounded-md bg-[#E8A07C]" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-xs border border-[#FFEED6] flex items-center justify-between">
          <div>
            <p className="text-xs text-[#827148]/70 font-semibold uppercase tracking-wider">
              Week 5–7
            </p>
            <h3 className="text-2xl font-extrabold text-[#827148] mt-1">
              {latihans.filter(t => t.category && ["WEEK_5", "WEEK_6", "WEEK_7"].includes(t.category)).length}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FFEED6] flex items-center justify-center">
            <div className="w-3.5 h-3.5 rounded-md bg-[#827148]" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-[#827148]/60">
          Memuat latihan soal...
        </div>
      ) : filteredLatihans.length === 0 ? (
        /* Empty State View */
        <EmptyState
          title="Belum Ada Latihan"
          description="Bank latihan soal sedang disusun oleh tim akademik kami. Cek kembali nanti!"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredLatihans.map((latihan) => {
            const activeAccess = subjectAccess.find(a => a.subject === selectedSubject && a.is_active)
            const totalPartsInCategory = latihan.category
              ? latihans.filter(l => l.category === latihan.category).length
              : latihans.length
            const isLocked = !canAccessPracticePart(activeAccess?.package_type, activeAccess?.role, latihan.practice_part, latihan.title, selectedSubject, totalPartsInCategory)

            return (
              <div
                key={latihan.id}
                className={`bg-white rounded-2xl p-6 shadow-xs border border-[#FFEED6] flex flex-col justify-between transition-all duration-200 ${
                  isLocked ? "opacity-60" : "hover:shadow-md hover:-translate-y-0.5"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[11px] px-2.5 py-1 font-semibold rounded-md bg-[#FFEED6] text-[#827148]">
                      {latihan.category ? CATEGORY_LABELS[latihan.category] : "Semua Materi"}
                    </span>
                    {isLocked && (
                      <span className="text-[11px] px-2.5 py-1 font-semibold rounded-md bg-[#E8A07C]/15 text-[#E8A07C]">
                        Terkunci
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-[#827148] mb-2 leading-snug">
                    {latihan.title}
                  </h3>
                  {latihan.description && (
                    <p className="text-xs text-[#827148]/75 mb-4 line-clamp-2 leading-relaxed">
                      {latihan.description}
                    </p>
                  )}
                  <div className="text-[11px] font-semibold text-[#827148]/70 mb-6">
                    {latihan.tryout_questions?.[0]?.count || 0} butir soal
                  </div>
                </div>

                <div>
                  {isLocked ? (
                    <Button
                      className="w-full bg-[#FFEED6]/50 text-[#827148]/50 rounded-xl font-semibold text-xs py-2.5 h-auto cursor-not-allowed"
                      size="sm"
                      onClick={() => toast.error("Upgrade paket Anda untuk mengakses latihan ini!")}
                    >
                      Terkunci (Perlu Upgrade)
                    </Button>
                  ) : (
                    <Button
                      asChild
                      className="w-full bg-[#A5AF79] hover:bg-[#949e6a] text-white rounded-xl font-semibold text-xs py-2.5 h-auto shadow-2xs transition-colors"
                      size="sm"
                    >
                      <Link href={`/dashboard/latihan/${latihan.id}`}>
                        Masuk Latihan
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
