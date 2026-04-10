"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trophy, Medal, Loader2 } from "lucide-react"
import { CATEGORY_LABELS } from "@/types"

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

    const getRankDecor = (rank: number) => {
        if (rank === 1) return "bg-[#e87a5d] text-[#FEFCF3] border-[#2b1b11]"
        if (rank === 2) return "bg-[#bed3c6] text-[#2b1b11] border-[#2b1b11]"
        if (rank === 3) return "bg-[#FEFCF3] text-[#e87a5d] border-[#2b1b11]"
        return "bg-[#FEFCF3] text-[#2b1b11] border-[#2b1b11]/40"
    }

    return (
        <div className="space-y-6 font-mono">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="bg-[#FEFCF3] border-4 border-[#2b1b11] rounded-2xl p-5 shadow-[6px_6px_0px_#2b1b11] flex-1">
                    <h1
                        className="text-lg md:text-xl font-extrabold text-[#2b1b11] mb-1 flex items-center gap-3"
                        style={{ fontFamily: "var(--font-press-start)", lineHeight: 1.4 }}
                    >
                        <Trophy className="w-6 h-6 text-[#e87a5d] stroke-[2]" />
                        Leaderboard
                    </h1>
                    <p className="text-sm text-[#3c5443] font-bold">Peringkat berdasarkan rata-rata skor tryout.</p>
                </div>
                <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-[200px] bg-[#FEFCF3] border-2 border-[#2b1b11] rounded-none shadow-[2px_2px_0px_#2b1b11] font-mono font-bold text-[#2b1b11]">
                        <SelectValue placeholder="Filter kategori" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#FEFCF3] border-2 border-[#2b1b11] rounded-none shadow-[4px_4px_0px_#2b1b11] font-mono">
                        <SelectItem value="all">Semua Kategori</SelectItem>
                        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="bg-[#FEFCF3] border-4 border-[#2b1b11] shadow-[4px_4px_0px_#2b1b11] overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-6 h-6 animate-spin text-[#2b1b11]" />
                    </div>
                ) : entries.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-14 h-14 bg-[#bed3c6] border-2 border-[#2b1b11] flex items-center justify-center shadow-[2px_2px_0px_#2b1b11] mb-4">
                            <Trophy className="w-7 h-7 text-[#2b1b11] stroke-[2]" />
                        </div>
                        <h3 className="text-sm font-extrabold text-[#2b1b11] mb-1" style={{ fontFamily: "var(--font-press-start)" }}>Belum Ada Data</h3>
                        <p className="text-xs text-[#3c5443] font-bold">
                            Leaderboard akan terisi setelah ada peserta yang menyelesaikan tryout.
                        </p>
                    </div>
                ) : (
                    <div>
                        {entries.map((entry, idx) => (
                            <div
                                key={entry.userId}
                                className={`flex items-center gap-4 p-4 border-b-2 border-[#2b1b11]/10 last:border-b-0 hover:bg-[#bed3c6]/20 transition-colors ${
                                    idx < 3 ? "bg-[#bed3c6]/10" : ""
                                }`}
                            >
                                {/* Rank */}
                                <div className={`w-10 h-10 flex items-center justify-center text-sm font-extrabold border-2 shadow-[2px_2px_0px_#2b1b11] shrink-0 ${getRankDecor(entry.rank)}`}>
                                    {entry.rank <= 3 ? (
                                        <Medal className="w-5 h-5 stroke-[2]" />
                                    ) : (
                                        entry.rank
                                    )}
                                </div>

                                {/* User info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-extrabold text-[#2b1b11] truncate">{entry.userName}</p>
                                    <p className="text-[10px] text-[#3c5443] font-bold">
                                        {entry.totalTryouts} tryout selesai
                                    </p>
                                </div>

                                {/* Score */}
                                <div className="text-right">
                                    <p className="text-lg font-extrabold text-[#2b1b11]">{entry.averageScore}%</p>
                                    <p className="text-[10px] text-[#3c5443] font-bold">rata-rata</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
