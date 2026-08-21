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

  const getRankBadgeStyle = (rank: number) => {
    if (rank === 1) return "bg-[#E8A07C] text-white"
    if (rank === 2) return "bg-[#A5AF79] text-white"
    if (rank === 3) return "bg-[#FFEED6] text-[#827148]"
    return "bg-gray-100 text-[#827148]/70"
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header with Filter */}
      <PageHeader
        title="Leaderboard"
        subtitle="Peringkat peserta berdasarkan rata-rata skor tryout yang telah diselesaikan."
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

      {loading ? (
        <div className="py-20 text-center text-xs text-[#827148]/60">
          Memuat leaderboard...
        </div>
      ) : entries.length === 0 ? (
        /* Empty State View */
        <EmptyState
          title="Belum Ada Data"
          description="Leaderboard akan terisi setelah ada peserta yang menyelesaikan tryout."
        />
      ) : (
        <div className="bg-white rounded-2xl shadow-xs border border-[#FFEED6] overflow-hidden">
          <div className="divide-y divide-[#FFEED6]/60">
            {entries.map((entry, idx) => (
              <div
                key={entry.userId || idx}
                className="flex items-center justify-between p-4 sm:p-5 hover:bg-[#FFEED6]/20 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  {/* Rank Badge */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-extrabold shrink-0 shadow-2xs ${getRankBadgeStyle(
                      entry.rank
                    )}`}
                  >
                    #{entry.rank}
                  </div>

                  {/* User info */}
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#827148] truncate">
                      {entry.userName}
                    </p>
                    <p className="text-[11px] text-[#827148]/70 font-medium">
                      {entry.totalTryouts} tryout selesai
                    </p>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right shrink-0 ml-4">
                  <p className="text-lg font-extrabold text-[#827148]">
                    {Math.round(entry.averageScore)}%
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-[#827148]/60 font-semibold">
                    Rata-rata
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
