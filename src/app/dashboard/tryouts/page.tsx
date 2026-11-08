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

  const countW1W4 = tryouts.filter(t => t.category && ["WEEK_1", "WEEK_2", "WEEK_3", "WEEK_4"].includes(t.category)).length
  const countW5W7 = tryouts.filter(t => t.category && ["WEEK_5", "WEEK_6", "WEEK_7"].includes(t.category)).length

  return (
    <div className="space-y-8 font-sans">
      {/* Page Header with Brutalist Category Filter */}
      <PageHeader
        title="Tryout CBT"
        subtitle="Simulasi ujian berkala dengan batasan waktu nyata untuk menguji ketahanan mental dan akurasi komputasi fisika."
        breadcrumb="~/bbn-edu/student/tryouts/"
        action={
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-ink-muted uppercase hidden sm:inline">
              FILTER:
            </span>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[190px] sm:w-[210px] bg-surface-white border-2 border-[#171717] rounded-none font-mono text-xs font-bold text-[#171717] technical-shadow-sm focus:ring-0 focus:border-[#171717] h-10 px-3">
                <SelectValue placeholder="SEMUA KATEGORI" />
              </SelectTrigger>
              <SelectContent className="bg-surface-white border-2 border-[#171717] rounded-none shadow-none font-mono text-xs font-semibold text-[#171717]">
                <SelectItem value="all" className="rounded-none cursor-pointer hover:bg-accent-canary focus:bg-accent-canary focus:text-[#171717]">
                  [ALL] SEMUA KATEGORI
                </SelectItem>
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key} className="rounded-none cursor-pointer hover:bg-accent-canary focus:bg-accent-canary focus:text-[#171717]">
                    [{key}] {label.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />

      {/* Mini Stats Summary Strip (Bento Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Metric 01 */}
        <div className="bg-surface-white border-2 border-[#171717] technical-shadow p-5 relative tick-corner flex flex-col justify-between">
          <div className="flex items-center justify-between font-mono text-xs font-bold uppercase tracking-wider text-ink-muted">
            <span>TOTAL_TRYOUT // CBT</span>
            <div className="size-3 bg-accent-canary border border-[#171717]" />
          </div>
          <div className="mt-4">
            <p className="font-mono text-3xl font-black text-[#171717]">
              {String(tryouts.length).padStart(2, "0")}
            </p>
            <p className="font-mono text-[10px] uppercase tracking-wider text-ink-muted mt-1">
              STATUS: TERSEDIA DI SISTEM
            </p>
          </div>
          <div className="w-full h-1 bg-border-grid mt-4 overflow-hidden">
            <div className="h-full bg-accent-canary w-full" />
          </div>
        </div>

        {/* Metric 02 */}
        <div className="bg-surface-white border-2 border-[#171717] technical-shadow p-5 relative tick-corner flex flex-col justify-between">
          <div className="flex items-center justify-between font-mono text-xs font-bold uppercase tracking-wider text-ink-muted">
            <span>TRYOUT // FASE 01</span>
            <div className="size-3 bg-alert-rust border border-[#171717]" />
          </div>
          <div className="mt-4">
            <p className="font-mono text-3xl font-black text-[#171717]">
              {String(countW1W4).padStart(2, "0")}
            </p>
            <p className="font-mono text-[10px] uppercase tracking-wider text-ink-muted mt-1">
              WEEK 1 - WEEK 4 (DASAR)
            </p>
          </div>
          <div className="w-full h-1 bg-border-grid mt-4 overflow-hidden">
            <div className="h-full bg-alert-rust w-2/3" />
          </div>
        </div>

        {/* Metric 03 */}
        <div className="bg-surface-white border-2 border-[#171717] technical-shadow p-5 relative tick-corner flex flex-col justify-between">
          <div className="flex items-center justify-between font-mono text-xs font-bold uppercase tracking-wider text-ink-muted">
            <span>TRYOUT // FASE 02</span>
            <div className="size-3 bg-[#171717] border border-[#171717]" />
          </div>
          <div className="mt-4">
            <p className="font-mono text-3xl font-black text-[#171717]">
              {String(countW5W7).padStart(2, "0")}
            </p>
            <p className="font-mono text-[10px] uppercase tracking-wider text-ink-muted mt-1">
              WEEK 5 - WEEK 7 (LANJUTAN)
            </p>
          </div>
          <div className="w-full h-1 bg-border-grid mt-4 overflow-hidden">
            <div className="h-full bg-[#171717] w-1/3" />
          </div>
        </div>
      </div>

      {/* Main Catalog View */}
      <div className="space-y-4">
        {/* Catalog Subheader Strip */}
        <div className="flex items-center justify-between border-b-2 border-[#171717] pb-2 font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#171717]">&gt; SIMULASI_UJIAN_CBT</span>
            <span className="text-ink-muted hidden sm:inline">// SUBJECT: {selectedSubject.toUpperCase()}</span>
          </div>
          <div className="text-ink-muted font-bold">
            [{filteredTryouts.length} SIMULASI TERSEDIA]
          </div>
        </div>

        {loading ? (
          <div className="bg-surface-white border-2 border-dashed border-[#171717] bg-grid-blueprint p-16 text-center font-mono text-xs font-bold text-ink-muted relative tick-corner">
            <div className="animate-pulse">
              &gt; STATUS: FETCHING_CBT_SCHEDULE... // SINKRONISASI SERVER
            </div>
          </div>
        ) : filteredTryouts.length === 0 ? (
          <EmptyState
            title="Belum Ada Tryout Aktif"
            description="Belum ada simulasi tryout aktif untuk kategori ini. Pantau jadwal rilis tryout berkala dari akademik BBN Education!"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTryouts.map((tryout, idx) => {
              const categoryLabel = tryout.category ? CATEGORY_LABELS[tryout.category] : "Semua Materi"

              return (
                <div
                  key={tryout.id}
                  className="bg-surface-white border-2 border-[#171717] technical-shadow p-6 flex flex-col justify-between relative tick-corner transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5"
                >
                  <div>
                    {/* Top Tag Strip */}
                    <div className="flex items-center justify-between gap-2 mb-3.5 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 uppercase bg-canvas-paper border border-[#171717] text-[#171717]">
                          {categoryLabel}
                        </span>
                        <span className="font-mono text-[10px] font-bold text-ink-muted">
                          EXAM_{String(idx + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] font-black px-2 py-0.5 uppercase bg-accent-canary text-[#171717] border border-[#171717]">
                        CBT TIMED
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-sans text-lg font-black text-[#171717] mb-2 leading-tight tracking-tight">
                      {tryout.title}
                    </h3>

                    {/* Description */}
                    {tryout.description && (
                      <p className="font-sans text-xs text-ink-muted mb-4 line-clamp-2 leading-relaxed">
                        {tryout.description}
                      </p>
                    )}

                    {/* Specs / Meta Strip */}
                    <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#171717] mb-6 flex-wrap">
                      <div className="px-2.5 py-1 bg-canvas-paper border border-[#171717] flex items-center gap-1.5">
                        <span className="text-alert-rust font-black">⏱</span>
                        <span>{tryout.duration} MENIT</span>
                      </div>
                      <div className="px-2.5 py-1 bg-canvas-paper border border-[#171717] flex items-center gap-1.5">
                        <span className="text-alert-rust font-black">📝</span>
                        <span>{tryout.tryout_questions?.[0]?.count || 0} BUTIR SOAL</span>
                      </div>
                      <div className="px-2.5 py-1 bg-canvas-paper border border-[#171717] text-ink-muted">
                        SKOR NASIONAL
                      </div>
                    </div>
                  </div>

                  {/* Action Section */}
                  <div className="pt-2">
                    <Button
                      asChild
                      className="w-full bg-[#171717] hover:bg-accent-canary hover:text-[#171717] text-surface-white border-2 border-[#171717] technical-shadow rounded-none font-mono text-xs font-black py-3 uppercase tracking-wider transition-all"
                      size="sm"
                    >
                      <Link href={`/dashboard/tryouts/${tryout.id}`} className="flex items-center justify-center gap-2">
                        <span>MULAI SIMULASI TRYOUT</span>
                        <span>&rarr;</span>
                      </Link>
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
