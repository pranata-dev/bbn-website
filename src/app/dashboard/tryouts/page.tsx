"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CATEGORY_LABELS } from "@/types"
import type { QuestionCategory } from "@/types"
import { useSubject } from "@/contexts/SubjectContext"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { EmptyState } from "@/components/dashboard/EmptyState"

interface TryoutItem {
  id: string
  title: string
  description: string | null
  category: QuestionCategory | null
  duration: number
  status: string
  is_practice: boolean
  created_at: string
  tryout_questions: { count: number }[]
}

export default function TryoutsPage() {
  const [tryouts, setTryouts] = useState<TryoutItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")
  const { selectedSubject } = useSubject()

  useEffect(() => {
    fetchTryouts()
  }, [selectedSubject])

  const fetchTryouts = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/tryouts?subject=${selectedSubject}`)
      const data = await res.json()
      const properTryouts = (data.tryouts || []).filter((t: any) => !t.is_practice)
      setTryouts(properTryouts)
    } catch (error) {
      console.error("Failed to fetch tryouts:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTryouts = filter === "all"
    ? tryouts
    : tryouts.filter((t) => t.category === filter)

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header with Filter */}
      <PageHeader
        title="Tryout"
        subtitle="Pilih dan kerjakan simulasi tryout berkala untuk mengukur kesiapan ujianmu."
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
              Total Tryout
            </p>
            <h3 className="text-2xl font-extrabold text-[#827148] mt-1">
              {tryouts.length}
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
              {tryouts.filter(t => t.category && ["WEEK_1", "WEEK_2", "WEEK_3", "WEEK_4"].includes(t.category)).length}
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
              {tryouts.filter(t => t.category && ["WEEK_5", "WEEK_6", "WEEK_7"].includes(t.category)).length}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FFEED6] flex items-center justify-center">
            <div className="w-3.5 h-3.5 rounded-md bg-[#827148]" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-[#827148]/60">
          Memuat tryout...
        </div>
      ) : filteredTryouts.length === 0 ? (
        /* Empty State View */
        <EmptyState
          title="Belum Ada Tryout"
          description="Belum ada tryout aktif saat ini. Cek kembali nanti!"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredTryouts.map((tryout) => (
            <div
              key={tryout.id}
              className="bg-white rounded-2xl p-6 shadow-xs border border-[#FFEED6] flex flex-col justify-between transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
            >
              <div>
                <span className="text-[11px] px-2.5 py-1 font-semibold rounded-md bg-[#FFEED6] text-[#827148] mb-3 inline-block">
                  {tryout.category ? CATEGORY_LABELS[tryout.category] : "Semua Materi"}
                </span>
                <h3 className="text-base font-bold text-[#827148] mb-2 leading-snug">
                  {tryout.title}
                </h3>
                {tryout.description && (
                  <p className="text-xs text-[#827148]/75 mb-4 line-clamp-2 leading-relaxed">
                    {tryout.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-[11px] font-semibold text-[#827148]/70 mb-6">
                  <span>⏱ {tryout.duration} menit</span>
                  <span>·</span>
                  <span>📝 {tryout.tryout_questions?.[0]?.count || 0} soal</span>
                </div>
              </div>

              <div>
                <Button
                  asChild
                  className="w-full bg-[#E8A07C] hover:bg-[#d8916e] text-white rounded-xl font-semibold text-xs py-2.5 h-auto shadow-2xs transition-colors"
                  size="sm"
                >
                  <Link href={`/dashboard/tryouts/${tryout.id}`}>
                    Mulai Tryout
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
