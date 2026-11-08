"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CATEGORY_LABELS } from "@/types"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { EmptyState } from "@/components/dashboard/EmptyState"

interface LeaderboardEntry {
  rank: number
  userId: string
  userName: string
  avatarUrl: string | null
  totalScore: number
  totalTryouts: number
  averageScore: number
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")

  useEffect(() => {
    fetchLeaderboard()
  }, [filter])

  const fetchLeaderboard = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter !== "all") params.set("category", filter)
      const res = await fetch(`/api/leaderboard?${params}`)
      const data = await res.json()
      setEntries(data.leaderboard || [])
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error)
    } finally {
      setLoading(false)
    }
  }

  const top1 = entries[0]
  const top2 = entries[1]
  const top3 = entries[2]

  return (
    <div className="space-y-8 font-sans">
      {/* Page Header with Brutalist Category Filter */}
      <PageHeader
        title="Leaderboard"
        subtitle="Peringkat kadet berdasarkan rata-rata skor tryout dan akurasi analisis fisika nasional."
        breadcrumb="~/bbn-edu/student/leaderboard/"
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

      {loading ? (
        <div className="bg-surface-white border-2 border-dashed border-[#171717] bg-grid-blueprint p-16 text-center font-mono text-xs font-bold text-ink-muted relative tick-corner">
          <div className="animate-pulse">
            &gt; STATUS: COMPILING_LEADERBOARD_METRICS... // MENGHITUNG PERINGKAT
          </div>
        </div>
      ) : entries.length === 0 ? (
        <EmptyState
          title="Belum Ada Data Peringkat"
          description="Leaderboard akan terisi otomatis setelah peserta menyelesaikan tryout pada kategori ini. Mulai kerjakan tryout untuk mencatatkan skor!"
          actionLabel="Kerjakan Tryout Sekarang"
          actionHref="/dashboard/tryouts"
        />
      ) : (
        <div className="space-y-8">
          {/* Top 3 Retro Editorial Podium (Only rendered when at least 1 entry exists) */}
          {entries.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end pt-4">
              {/* Rank 2 (Left) */}
              {top2 ? (
                <div className="bg-surface-white border-2 border-[#171717] technical-shadow p-5 flex flex-col justify-between items-center text-center relative tick-corner md:order-1 order-2">
                  <div className="w-full flex items-center justify-between border-b border-border-grid pb-2 font-mono text-[10px] font-bold text-ink-muted uppercase">
                    <span>[RANK_02]</span>
                    <span>SILVER // CADET</span>
                  </div>
                  <div className="size-14 bg-canvas-paper border-2 border-[#171717] font-mono text-xl font-black text-[#171717] flex items-center justify-center my-4 technical-shadow-sm">
                    {top2.userName.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="font-sans text-base font-extrabold text-[#171717] truncate max-w-full px-2">
                    {top2.userName}
                  </h3>
                  <p className="font-mono text-3xl font-black text-[#171717] mt-1">
                    {Math.round(top2.averageScore)}%
                  </p>
                  <p className="font-mono text-[10px] text-ink-muted uppercase font-bold tracking-wider mt-1">
                    {top2.totalTryouts} TRYOUT SELESAI
                  </p>
                </div>
              ) : (
                <div className="hidden md:flex bg-surface-white/50 border-2 border-dashed border-[#171717]/40 p-5 flex-col items-center justify-center text-center md:order-1 order-2 min-h-[160px] font-mono text-xs text-ink-muted">
                  [POSISI KOSONG]
                </div>
              )}

              {/* Rank 1 (Center - Elevated Canary) */}
              {top1 && (
                <div className="bg-accent-canary border-2 border-[#171717] technical-shadow p-6 flex flex-col justify-between items-center text-center relative tick-corner md:order-2 order-1 md:-mt-4 z-10">
                  <div className="w-full flex items-center justify-between border-b border-[#171717] pb-2 font-mono text-[11px] font-black text-[#171717] uppercase">
                    <span className="bg-[#171717] text-surface-white px-2 py-0.5">
                      ★ LEADER // RANK_01
                    </span>
                    <span>GOLD // TOP CADET</span>
                  </div>
                  <div className="size-18 bg-surface-white border-2 border-[#171717] font-mono text-2xl font-black text-[#171717] flex items-center justify-center my-4 technical-shadow-sm">
                    {top1.userName.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="font-sans text-xl font-black text-[#171717] truncate max-w-full px-2">
                    {top1.userName}
                  </h3>
                  <p className="font-mono text-4xl font-black text-[#171717] mt-1">
                    {Math.round(top1.averageScore)}%
                  </p>
                  <p className="font-mono text-xs text-[#171717] uppercase font-black tracking-wider mt-1">
                    {top1.totalTryouts} TRYOUT SELESAI
                  </p>
                </div>
              )}

              {/* Rank 3 (Right) */}
              {top3 ? (
                <div className="bg-surface-white border-2 border-[#171717] technical-shadow p-5 flex flex-col justify-between items-center text-center relative tick-corner md:order-3 order-3">
                  <div className="w-full flex items-center justify-between border-b border-border-grid pb-2 font-mono text-[10px] font-bold text-ink-muted uppercase">
                    <span>[RANK_03]</span>
                    <span>BRONZE // CADET</span>
                  </div>
                  <div className="size-14 bg-canvas-paper border-2 border-[#171717] font-mono text-xl font-black text-[#171717] flex items-center justify-center my-4 technical-shadow-sm">
                    {top3.userName.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="font-sans text-base font-extrabold text-[#171717] truncate max-w-full px-2">
                    {top3.userName}
                  </h3>
                  <p className="font-mono text-3xl font-black text-[#171717] mt-1">
                    {Math.round(top3.averageScore)}%
                  </p>
                  <p className="font-mono text-[10px] text-ink-muted uppercase font-bold tracking-wider mt-1">
                    {top3.totalTryouts} TRYOUT SELESAI
                  </p>
                </div>
              ) : (
                <div className="hidden md:flex bg-surface-white/50 border-2 border-dashed border-[#171717]/40 p-5 flex-col items-center justify-center text-center md:order-3 order-3 min-h-[160px] font-mono text-xs text-ink-muted">
                  [POSISI KOSONG]
                </div>
              )}
            </div>
          )}

          {/* Spreadsheet Technical Ranking Table */}
          <div className="space-y-0">
            {/* Table Header */}
            <div className="grid grid-cols-12 px-4 py-3 bg-canvas-paper border-2 border-[#171717] font-mono text-xs font-bold text-ink-muted uppercase tracking-wider items-center">
              <div className="col-span-2 sm:col-span-1">POS</div>
              <div className="col-span-6 sm:col-span-7">CADET_IDENTITY // NAME</div>
              <div className="col-span-2 text-center sm:text-left">TRYOUTS</div>
              <div className="col-span-2 text-right">AVG_SCORE</div>
            </div>

            {/* Table Rows Container */}
            <div className="border-2 border-[#171717] border-t-0 bg-surface-white technical-shadow divide-y-2 divide-border-grid">
              {entries.map((entry, idx) => {
                const isTop3 = entry.rank <= 3

                return (
                  <div
                    key={entry.userId || idx}
                    className={`grid grid-cols-12 px-4 py-3.5 items-center transition-colors font-mono text-xs ${
                      entry.rank === 1
                        ? "bg-accent-canary/15 hover:bg-accent-canary/25"
                        : "hover:bg-canvas-paper"
                    }`}
                  >
                    {/* Position / Rank */}
                    <div className="col-span-2 sm:col-span-1 flex items-center">
                      {entry.rank === 1 ? (
                        <span className="size-6 bg-accent-canary border border-[#171717] flex items-center justify-center font-mono text-xs font-black text-[#171717]">
                          1
                        </span>
                      ) : entry.rank === 2 ? (
                        <span className="size-6 bg-canvas-paper border border-[#171717] flex items-center justify-center font-mono text-xs font-bold text-[#171717]">
                          2
                        </span>
                      ) : entry.rank === 3 ? (
                        <span className="size-6 bg-[#FFEED6] border border-[#171717] flex items-center justify-center font-mono text-xs font-bold text-[#171717]">
                          3
                        </span>
                      ) : (
                        <span className="font-mono text-ink-muted font-bold pl-1">
                          #{entry.rank}
                        </span>
                      )}
                    </div>

                    {/* Cadet Identity / Name */}
                    <div className="col-span-6 sm:col-span-7 flex items-center gap-3 min-w-0 pr-2">
                      <div className="size-7 bg-canvas-paper border border-[#171717] shrink-0 flex items-center justify-center font-mono text-xs font-black text-[#171717]">
                        {entry.userName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-sans font-bold text-sm text-[#171717] truncate leading-tight">
                          {entry.userName}
                        </p>
                        <p className="font-mono text-[10px] text-ink-muted hidden sm:block">
                          ID: {entry.userId ? entry.userId.slice(0, 8).toUpperCase() : `CADET_${idx + 1}`}
                        </p>
                      </div>
                    </div>

                    {/* Tryouts Done */}
                    <div className="col-span-2 text-center sm:text-left font-mono text-xs font-bold text-ink-muted">
                      {entry.totalTryouts} <span className="hidden sm:inline">SESI</span>
                    </div>

                    {/* Average Score */}
                    <div className="col-span-2 text-right">
                      <span className="font-mono text-sm sm:text-base font-black text-[#171717]">
                        {Math.round(entry.averageScore)}%
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
