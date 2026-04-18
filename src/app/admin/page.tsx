"use client"

import { useState, useEffect } from "react"
import { Users, CreditCard, FileText, HelpCircle, TrendingUp, Trophy, Loader2, BookOpen } from "lucide-react"

interface DashboardStats {
    totalUsers: number
    pendingVerifications: number
    totalTryouts: number
    totalPractices: number
    totalQuestions: number
}

interface ChartDataPoint {
    month: string
    tryout: number
    latihan: number
}

interface TopPerformer {
    rank: number
    userId: string
    userName: string
    avatarUrl: string | null
    highestScore: number
    tryoutTitle: string
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [chartData, setChartData] = useState<ChartDataPoint[]>([])
    const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([])
    const [loading, setLoading] = useState(true)
    const [dashLoading, setDashLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch("/api/admin/stats")
                if (!res.ok) throw new Error("Failed to fetch stats")
                const data = await res.json()
                setStats(data.stats)
            } catch (error) {
                console.error("Failed to load dashboard stats:", error)
            } finally {
                setLoading(false)
            }
        }

        const fetchDashboard = async () => {
            try {
                const res = await fetch("/api/admin/dashboard")
                if (!res.ok) throw new Error("Failed to fetch dashboard")
                const data = await res.json()
                setChartData(data.chartData || [])
                setTopPerformers(data.topPerformers || [])
            } catch (error) {
                console.error("Failed to load dashboard data:", error)
            } finally {
                setDashLoading(false)
            }
        }

        fetchStats()
        fetchDashboard()
    }, [])

    const statCards = [
        { label: "Total Pengguna", value: stats?.totalUsers ?? "0", icon: Users, color: "bg-[#bed3c6]" },
        { label: "Pending Verif", value: stats?.pendingVerifications ?? "0", icon: CreditCard, color: "bg-[#e87a5d]" },
        { label: "Total Tryout", value: stats?.totalTryouts ?? "0", icon: FileText, color: "bg-earthy-gold" },
        { label: "Total Latihan", value: stats?.totalPractices ?? "0", icon: BookOpen, color: "bg-[#FEFCF3]" },
        { label: "Total Soal", value: stats?.totalQuestions ?? "0", icon: HelpCircle, color: "bg-[#FEFCF3]" },
    ]

    const chartMax = Math.max(1, ...chartData.map((d) => Math.max(d.tryout, d.latihan)))

    return (
        <div className="space-y-10 selection:bg-[#e87a5d] selection:text-[#FEFCF3]">
            <div className="bg-[#FEFCF3] border-4 border-[#2b1b11] p-6 shadow-[8px_8px_0px_#2b1b11] inline-block">
                <h1 className="text-xl md:text-2xl font-extrabold text-[#2b1b11] mb-3" style={{ fontFamily: "var(--font-press-start)", lineHeight: 1.4 }}>
                    Admin Dashboard
                </h1>
                <p className="text-sm font-bold text-[#3c5443] font-mono">
                    Kelola platform Belajar Bareng Nata.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6">
                {statCards.map((stat, i) => (
                    <div key={stat.label} className={`border-4 border-[#2b1b11] bg-[#FEFCF3] shadow-[6px_6px_0px_#2b1b11] hover:shadow-[8px_8px_0px_#2b1b11] hover:-translate-y-1 transition-all p-5`}>
                        <div className="flex flex-col gap-4">
                            <div className={`w-12 h-12 border-2 border-[#2b1b11] shadow-[2px_2px_0px_#2b1b11] flex items-center justify-center ${stat.color} shrink-0`}>
                                <stat.icon className={`w-6 h-6 stroke-[2.5] ${stat.color === 'bg-[#e87a5d]' ? 'text-[#FEFCF3]' : 'text-[#2b1b11]'}`} />
                            </div>
                            <div>
                                <p className="text-[11px] uppercase tracking-tighter font-extrabold text-[#3c5443] font-mono mb-1">{stat.label}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin text-[#2b1b11]" />
                                    ) : (
                                        <p className="text-2xl font-extrabold text-[#2b1b11]" style={{ fontFamily: "var(--font-press-start)" }}>{stat.value}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Statistics Chart */}
                <div className="bg-[#FEFCF3] border-4 border-[#2b1b11] shadow-[8px_8px_0px_#2b1b11] overflow-hidden flex flex-col">
                    <div className="p-4 md:p-6 border-b-4 border-[#2b1b11] bg-[#bed3c6]">
                        <h2 className="text-sm md:text-base font-extrabold flex items-center gap-3 text-[#2b1b11]" style={{ fontFamily: "var(--font-press-start)", lineHeight: 1.4 }}>
                            <TrendingUp className="w-6 h-6 stroke-[3]" />
                            Aktivitas 6 Bulan Tersimpan
                        </h2>
                        <div className="flex flex-wrap items-center gap-4 mt-4 font-mono font-bold">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-[#2b1b11] bg-earthy-gold shadow-[2px_2px_0px_#2b1b11]" />
                                <span className="text-xs text-[#2b1b11]">Tryout</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-[#2b1b11] bg-[#e87a5d] shadow-[2px_2px_0px_#2b1b11]" />
                                <span className="text-xs text-[#2b1b11]">Latihan</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-4 md:p-6 font-mono flex-1">
                        {dashLoading ? (
                            <div className="flex items-center justify-center py-12 h-full">
                                <Loader2 className="w-8 h-8 animate-spin text-[#2b1b11]" />
                            </div>
                        ) : chartData.length > 0 ? (
                            <div className="space-y-6">
                                {chartData.map((point) => (
                                    <div key={point.month} className="space-y-2">
                                        <div className="flex items-center justify-between font-bold">
                                            <span className="text-xs text-[#2b1b11] uppercase tracking-wider">{point.month}</span>
                                            <div className="flex items-center gap-2 text-xs text-[#2b1b11]">
                                                <span className="bg-earthy-gold px-1.5 py-0.5 border-2 border-[#2b1b11] shadow-[2px_2px_0px_#2b1b11]">{point.tryout}</span>
                                                <span className="bg-[#e87a5d] text-white px-1.5 py-0.5 border-2 border-[#2b1b11] shadow-[2px_2px_0px_#2b1b11]">{point.latihan}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 h-6 mt-1">
                                            <div className="flex-1 border-2 border-[#2b1b11] bg-[#F2EFE4] relative overflow-hidden shadow-[2px_2px_0px_#2b1b11]">
                                                <div
                                                    className="absolute top-0 left-0 h-full bg-earthy-gold border-r-2 border-[#2b1b11] transition-all duration-500"
                                                    style={{ width: `${(point.tryout / chartMax) * 100}%` }}
                                                />
                                            </div>
                                            <div className="flex-1 border-2 border-[#2b1b11] bg-[#F2EFE4] relative overflow-hidden shadow-[2px_2px_0px_#2b1b11]">
                                                <div
                                                    className="absolute top-0 left-0 h-full bg-[#e87a5d] border-r-2 border-[#2b1b11] transition-all duration-500"
                                                    style={{ width: `${(point.latihan / chartMax) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-center h-full">
                                <TrendingUp className="w-10 h-10 text-[#3c5443] mb-4 stroke-[2]" />
                                <p className="text-sm font-bold text-[#2b1b11]">
                                    Belum ada data aktivitas
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Top Performers */}
                <div className="bg-[#FEFCF3] border-4 border-[#2b1b11] shadow-[8px_8px_0px_#2b1b11] overflow-hidden flex flex-col">
                    <div className="p-4 md:p-6 border-b-4 border-[#2b1b11] bg-earthy-gold">
                        <div className="flex flex-col gap-3">
                            <h2 className="text-sm md:text-base font-extrabold flex items-center gap-3 text-[#2b1b11]" style={{ fontFamily: "var(--font-press-start)", lineHeight: 1.4 }}>
                                <Trophy className="w-6 h-6 stroke-[3]" />
                                Top Performers
                            </h2>
                            <div className="inline-flex w-fit px-3 py-1 bg-[#FEFCF3] border-2 border-[#2b1b11] shadow-[2px_2px_0px_#2b1b11]">
                                <span className="text-[10px] uppercase font-bold font-mono text-[#2b1b11]">Tryout Only</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-4 md:p-6 font-mono flex-1">
                        {dashLoading ? (
                            <div className="flex items-center justify-center py-12 h-full">
                                <Loader2 className="w-8 h-8 animate-spin text-[#2b1b11]" />
                            </div>
                        ) : topPerformers.length > 0 ? (
                            <div className="space-y-4">
                                {topPerformers.map((performer) => (
                                    <div
                                        key={performer.userId}
                                        className="flex items-center gap-4 p-4 border-2 border-[#2b1b11] bg-[#FEFCF3] hover:bg-[#bed3c6] transition-colors shadow-[4px_4px_0px_#2b1b11]"
                                    >
                                        <div className={`w-10 h-10 border-2 border-[#2b1b11] flex items-center justify-center shrink-0 font-extrabold shadow-[2px_2px_0px_#2b1b11] ${
                                            performer.rank === 1
                                                ? "bg-[#e87a5d] text-[#FEFCF3]"
                                                : performer.rank === 2
                                                    ? "bg-[#bed3c6] text-[#2b1b11]"
                                                    : performer.rank === 3
                                                        ? "bg-earthy-gold text-[#2b1b11]"
                                                        : "bg-[#F2EFE4] text-[#2b1b11]"
                                        }`} style={{ fontFamily: "var(--font-press-start)" }}>
                                            <span className="text-[10px]">{performer.rank}</span>
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                                            <p className="text-sm font-bold text-[#2b1b11] truncate">
                                                {performer.userName}
                                            </p>
                                            <p className="text-[10px] text-[#3c5443] font-bold truncate">
                                                {performer.tryoutTitle}
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0 flex items-center">
                                            <p className="text-sm font-extrabold text-[#e87a5d]" style={{ fontFamily: "var(--font-press-start)" }}>
                                                {Math.round(performer.highestScore)}%
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-center h-full">
                                <Trophy className="w-10 h-10 text-[#3c5443] mb-4 stroke-[2]" />
                                <p className="text-sm font-bold text-[#2b1b11]">
                                    Belum ada top performer
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
