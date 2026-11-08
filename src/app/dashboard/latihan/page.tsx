"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CATEGORY_LABELS, QuestionCategory } from "@/types"
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
  is_locked?: boolean
  created_at: string
  tryout_questions: { count: number }[]
}

export default function LatihanPage() {
  const [latihans, setLatihans] = useState<LatihanItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")
  const { selectedSubject } = useSubject()

  useEffect(() => {
    fetchLatihan()
  }, [selectedSubject])

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

  const countW1W4 = latihans.filter(t => t.category && ["WEEK_1", "WEEK_2", "WEEK_3", "WEEK_4"].includes(t.category)).length
  const countW5W7 = latihans.filter(t => t.category && ["WEEK_5", "WEEK_6", "WEEK_7"].includes(t.category)).length

  return (
    <div className="space-y-8 font-sans">
      {/* Page Header with Brutalist Category Filter */}
      <PageHeader
        title="Latihan Soal"
        subtitle="Bank soal kurasi topik fisika dan sains lanjutan untuk mengasah ketajaman analisis matematis secara mandiri."
        breadcrumb="~/bbn-edu/student/latihan-soal/"
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
            <span>TOTAL_LATIHAN // REGISTRY</span>
            <div className="size-3 bg-accent-canary border border-[#171717]" />
          </div>
          <div className="mt-4">
            <p className="font-mono text-3xl font-black text-[#171717]">
              {String(latihans.length).padStart(2, "0")}
            </p>
            <p className="font-mono text-[10px] uppercase tracking-wider text-ink-muted mt-1">
              STATUS: MODUL TERSEDIA
            </p>
          </div>
          <div className="w-full h-1 bg-border-grid mt-4 overflow-hidden">
            <div className="h-full bg-accent-canary w-full" />
          </div>
        </div>

        {/* Metric 02 */}
        <div className="bg-surface-white border-2 border-[#171717] technical-shadow p-5 relative tick-corner flex flex-col justify-between">
          <div className="flex items-center justify-between font-mono text-xs font-bold uppercase tracking-wider text-ink-muted">
            <span>FASE_01 // WEEK 1-4</span>
            <div className="size-3 bg-alert-rust border border-[#171717]" />
          </div>
          <div className="mt-4">
            <p className="font-mono text-3xl font-black text-[#171717]">
              {String(countW1W4).padStart(2, "0")}
            </p>
            <p className="font-mono text-[10px] uppercase tracking-wider text-ink-muted mt-1">
              MEKANIKA & KALKULUS
            </p>
          </div>
          <div className="w-full h-1 bg-border-grid mt-4 overflow-hidden">
            <div className="h-full bg-alert-rust w-2/3" />
          </div>
        </div>

        {/* Metric 03 */}
        <div className="bg-surface-white border-2 border-[#171717] technical-shadow p-5 relative tick-corner flex flex-col justify-between">
          <div className="flex items-center justify-between font-mono text-xs font-bold uppercase tracking-wider text-ink-muted">
            <span>FASE_02 // WEEK 5-7</span>
            <div className="size-3 bg-[#171717] border border-[#171717]" />
          </div>
          <div className="mt-4">
            <p className="font-mono text-3xl font-black text-[#171717]">
              {String(countW5W7).padStart(2, "0")}
            </p>
            <p className="font-mono text-[10px] uppercase tracking-wider text-ink-muted mt-1">
              TERMODINAMIKA & GELOMBANG
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
            <span className="font-bold text-[#171717]">&gt; MODUL_LATIHAN</span>
            <span className="text-ink-muted hidden sm:inline">// SUBJECT: {selectedSubject.toUpperCase()}</span>
          </div>
          <div className="text-ink-muted font-bold">
            [{filteredLatihans.length} ITEM DITEMUKAN]
          </div>
        </div>

        {loading ? (
          <div className="bg-surface-white border-2 border-dashed border-[#171717] bg-grid-blueprint p-16 text-center font-mono text-xs font-bold text-ink-muted relative tick-corner">
            <div className="animate-pulse">
              &gt; STATUS: FETCHING_PRACTICE_MODULES... // MENGHUBUNGKAN TELEMETRI
            </div>
          </div>
        ) : filteredLatihans.length === 0 ? (
          <EmptyState
            title="Belum Ada Latihan Soal"
            description="Bank latihan soal untuk kategori ini sedang disusun oleh tim akademik BBN Education. Cek kembali nanti!"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredLatihans.map((latihan, idx) => {
              const isLocked = Boolean(latihan.is_locked)
              const categoryLabel = latihan.category ? CATEGORY_LABELS[latihan.category] : "Semua Materi"

              return (
                <div
                  key={latihan.id}
                  className={`bg-surface-white border-2 border-[#171717] technical-shadow p-6 flex flex-col justify-between relative tick-corner transition-all duration-150 ${
                    isLocked ? "opacity-75" : "hover:-translate-x-0.5 hover:-translate-y-0.5"
                  }`}
                >
                  <div>
                    {/* Top Tag Strip */}
                    <div className="flex items-center justify-between gap-2 mb-3.5 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 uppercase bg-canvas-paper border border-[#171717] text-[#171717]">
                          {categoryLabel}
                        </span>
                        <span className="font-mono text-[10px] font-bold text-ink-muted">
                          PRAC_{String(idx + 1).padStart(2, "0")}
                        </span>
                      </div>
                      {isLocked && (
                        <span className="font-mono text-[10px] font-black px-2 py-0.5 uppercase bg-alert-rust text-surface-white border border-[#171717]">
                          LOCKED [PRO]
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-sans text-lg font-black text-[#171717] mb-2 leading-tight tracking-tight">
                      {latihan.title}
                    </h3>

                    {/* Description */}
                    {latihan.description && (
                      <p className="font-sans text-xs text-ink-muted mb-4 line-clamp-2 leading-relaxed">
                        {latihan.description}
                      </p>
                    )}

                    {/* Specs / Meta Strip */}
                    <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#171717] mb-6 flex-wrap">
                      <div className="px-2.5 py-1 bg-canvas-paper border border-[#171717] flex items-center gap-1.5">
                        <span className="text-alert-rust font-black">#</span>
                        <span>{latihan.tryout_questions?.[0]?.count || 0} BUTIR SOAL</span>
                      </div>
                      <div className="px-2.5 py-1 bg-canvas-paper border border-[#171717] text-ink-muted">
                        MODE: MANDIRI
                      </div>
                    </div>
                  </div>

                  {/* Action Section */}
                  <div className="pt-2">
                    {isLocked ? (
                      <Button
                        className="w-full bg-canvas-paper text-ink-muted border-2 border-[#171717] rounded-none font-mono text-xs font-bold py-3 uppercase tracking-wider cursor-not-allowed hover:bg-canvas-paper"
                        size="sm"
                        onClick={() => toast.error("Upgrade paket Anda untuk mengakses modul latihan ini!")}
                      >
                        TERKUNCI // PERLU UPGRADE TIER
                      </Button>
                    ) : (
                      <Button
                        asChild
                        className="w-full bg-accent-canary hover:bg-[#FDE047]/90 text-[#171717] border-2 border-[#171717] technical-shadow rounded-none font-mono text-xs font-black py-3 uppercase tracking-wider transition-all"
                        size="sm"
                      >
                        <Link href={`/dashboard/latihan/${latihan.id}`} className="flex items-center justify-center gap-2">
                          <span>KERJAKAN LATIHAN</span>
                          <span>&rarr;</span>
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
    </div>
  )
}
