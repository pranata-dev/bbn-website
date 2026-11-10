"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Trophy, Loader2, Search, RefreshCw } from "lucide-react"
import { ADMIN_COURSES } from "@/types"

interface LeaderboardRow {
    rank: number
    userId: string
    userName: string
    avatarUrl: string | null
    totalScore: number
    totalTryouts: number
    averageScore: number
}

export default function AdminLeaderboardPage() {
    const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([])
    const [loading, setLoading] = useState(true)
    const [subjectFilter, setSubjectFilter] = useState<string>("all")
    const [searchQuery, setSearchQuery] = useState<string>("")

    const fetchLeaderboard = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (subjectFilter !== "all") params.set("subject", subjectFilter)
            const res = await fetch(`/api/leaderboard?${params.toString()}`)
            const data = await res.json()
            if (res.ok) {
                setLeaderboard(data.leaderboard || [])
            }
        } catch (error) {
            console.error("Failed to fetch leaderboard:", error)
        } finally {
            setLoading(false)
        }
    }, [subjectFilter])

    useEffect(() => {
        fetchLeaderboard()
    }, [fetchLeaderboard])

    const filteredRows = leaderboard.filter((row) =>
        row.userName.toLowerCase().includes(searchQuery.trim().toLowerCase())
    )

    return (
        <div className="space-y-6 font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b-2 border-[#171717] pb-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="w-2.5 h-2.5 bg-accent-canary border border-[#171717] inline-block" />
                        <span className="font-mono text-[10px] uppercase tracking-wider text-ink-muted font-bold">
                            ACADEMIC RANKING // LEADERBOARD
                        </span>
                    </div>
                    <h1 className="text-2xl font-extrabold text-[#171717]">Leaderboard Peserta</h1>
                    <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
                        Peringkat akumulasi dan rata-rata skor tryout seluruh mahasiswa aktif.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                    <div className="relative w-56">
                        <Search className="w-3.5 h-3.5 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari nama peserta..."
                            className="pl-8 h-9 bg-surface-white border-[#171717] font-mono text-xs rounded-none"
                        />
                    </div>
                    <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                        <SelectTrigger className="w-[210px] h-9 bg-surface-white border-[#171717] font-mono text-xs rounded-none">
                            <SelectValue placeholder="Semua Mata Kuliah" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Mata Kuliah</SelectItem>
                            {ADMIN_COURSES.map((course) => (
                                <SelectItem key={course.code} value={course.code}>
                                    {course.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <button
                        type="button"
                        onClick={fetchLeaderboard}
                        disabled={loading}
                        className="h-9 px-3 bg-surface-white hover:bg-canvas-paper border border-[#171717] font-mono text-xs font-bold text-[#171717] shadow-[2px_2px_0px_#171717] flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                        <span>REFRESH</span>
                    </button>
                </div>
            </div>

            <Card className="border-2 border-[#171717] rounded-none shadow-[4px_4px_0px_#171717] bg-surface-white">
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-6 h-6 animate-spin text-[#171717]" />
                        </div>
                    ) : filteredRows.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                            <Trophy className="w-8 h-8 text-ink-muted mb-3" />
                            <p className="text-sm font-bold text-[#171717]">
                                Belum Ada Data Peringkat
                            </p>
                            <p className="text-xs font-mono text-ink-muted mt-1">
                                Data leaderboard akan muncul setelah peserta menyelesaikan tryout pada mata kuliah terpilih.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b-2 border-[#171717] bg-canvas-paper font-mono text-[11px] uppercase text-ink-muted">
                                        <th className="py-3 px-4 font-bold">Rank</th>
                                        <th className="py-3 px-4 font-bold">Nama Peserta</th>
                                        <th className="py-3 px-4 font-bold text-center">Tryout Selesai</th>
                                        <th className="py-3 px-4 font-bold text-right">Total Skor</th>
                                        <th className="py-3 px-4 font-bold text-right">Rata-rata Skor</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#171717]/15 text-sm">
                                    {filteredRows.map((entry) => (
                                        <tr key={entry.userId} className="hover:bg-canvas-paper/60 transition-colors">
                                            <td className="py-3 px-4 font-mono font-bold">
                                                <span
                                                    className={`inline-flex items-center justify-center w-7 h-7 border border-[#171717] text-xs ${
                                                        entry.rank === 1
                                                            ? "bg-accent-canary text-[#171717] shadow-[2px_2px_0px_#171717]"
                                                            : entry.rank === 2
                                                            ? "bg-zinc-200 text-[#171717]"
                                                            : entry.rank === 3
                                                            ? "bg-amber-200 text-[#171717]"
                                                            : "bg-surface-white text-ink-muted"
                                                    }`}
                                                >
                                                    #{entry.rank}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 font-bold text-[#171717]">
                                                {entry.userName}
                                            </td>
                                            <td className="py-3 px-4 font-mono text-xs text-center text-ink-muted">
                                                {entry.totalTryouts} Paket
                                            </td>
                                            <td className="py-3 px-4 font-mono text-xs text-right font-semibold text-[#171717]">
                                                {entry.totalScore} Poin
                                            </td>
                                            <td className="py-3 px-4 font-mono text-sm text-right font-extrabold text-[#171717]">
                                                {entry.averageScore}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
