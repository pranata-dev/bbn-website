"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
        if (rank === 1) return "bg-yellow-100 text-yellow-700 border-yellow-300"
        if (rank === 2) return "bg-gray-100 text-gray-600 border-gray-300"
        if (rank === 3) return "bg-orange-50 text-orange-600 border-orange-200"
        return "bg-warm-beige text-muted-foreground border-warm-gray"
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Leaderboard</h1>
                    <p className="text-muted-foreground">Peringkat berdasarkan rata-rata skor tryout.</p>
                </div>
                <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-[200px] bg-white border-warm-gray">
                        <SelectValue placeholder="Filter kategori" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua Kategori</SelectItem>
                        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Card className="border-warm-gray/60">
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : entries.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-16 h-16 rounded-full bg-warm-beige flex items-center justify-center mb-4">
                                <Trophy className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">Belum Ada Data</h3>
                            <p className="text-sm text-muted-foreground">
                                Leaderboard akan terisi setelah ada peserta yang menyelesaikan tryout.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-warm-gray/40">
                            {entries.map((entry) => (
                                <div
                                    key={entry.userId}
                                    className="flex items-center gap-4 p-4 hover:bg-warm-beige/30 transition-colors"
                                >
                                    {/* Rank */}
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border ${getRankDecor(entry.rank)}`}>
                                        {entry.rank <= 3 ? (
                                            <Medal className="w-5 h-5" />
                                        ) : (
                                            entry.rank
                                        )}
                                    </div>

                                    {/* User info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-foreground truncate">{entry.userName}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {entry.totalTryouts} tryout selesai
                                        </p>
                                    </div>

                                    {/* Score */}
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-dark-brown">{entry.averageScore}%</p>
                                        <p className="text-xs text-muted-foreground">rata-rata</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
