"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
        { label: "Total Pengguna", value: stats?.totalUsers ?? "0", icon: Users },
        { label: "Pending Verifikasi", value: stats?.pendingVerifications ?? "0", icon: CreditCard },
        { label: "Total Tryout", value: stats?.totalTryouts ?? "0", icon: FileText },
        { label: "Total Latihan", value: stats?.totalPractices ?? "0", icon: BookOpen },
        { label: "Total Soal", value: stats?.totalQuestions ?? "0", icon: HelpCircle },
    ]

    // Calculate max for chart scaling
    const chartMax = Math.max(1, ...chartData.map((d) => Math.max(d.tryout, d.latihan)))

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-muted-foreground">Kelola platform Belajar Bareng Nata.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {statCards.map((stat) => (
                    <Card key={stat.label} className="border-warm-gray/60 hover:shadow-md transition-shadow">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        {loading ? (
                                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                                        ) : (
                                            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-warm-beige flex items-center justify-center">
                                    <stat.icon className="w-5 h-5 text-dark-brown" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Statistics Chart */}
                <Card className="border-warm-gray/60">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-dark-brown" />
                            Aktivitas 6 Bulan Terakhir
                        </CardTitle>
                        <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded-sm bg-earthy-gold" />
                                <span className="text-xs text-muted-foreground">Tryout</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded-sm bg-earthy-green" />
                                <span className="text-xs text-muted-foreground">Latihan</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {dashLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : chartData.length > 0 ? (
                            <div className="space-y-3">
                                {chartData.map((point) => (
                                    <div key={point.month} className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-muted-foreground w-20 shrink-0">{point.month}</span>
                                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                                <span className="text-earthy-gold font-medium">{point.tryout}</span>
                                                <span>/</span>
                                                <span className="text-earthy-green font-medium">{point.latihan}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <div className="flex-1 h-4 bg-warm-beige/50 rounded overflow-hidden">
                                                <div
                                                    className="h-full bg-earthy-gold rounded transition-all duration-500"
                                                    style={{ width: `${(point.tryout / chartMax) * 100}%` }}
                                                />
                                            </div>
                                            <div className="flex-1 h-4 bg-warm-beige/50 rounded overflow-hidden">
                                                <div
                                                    className="h-full bg-earthy-green rounded transition-all duration-500"
                                                    style={{ width: `${(point.latihan / chartMax) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <TrendingUp className="w-8 h-8 text-muted-foreground mb-3" />
                                <p className="text-sm text-muted-foreground">
                                    Grafik statistik akan muncul setelah ada data aktivitas.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Top Performers (Tryout Only) */}
                <Card className="border-warm-gray/60">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-earthy-gold" />
                            Top Performers
                            <Badge variant="secondary" className="bg-warm-beige text-soft-brown text-[10px] ml-1">Tryout Only</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {dashLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : topPerformers.length > 0 ? (
                            <div className="space-y-3">
                                {topPerformers.map((performer) => (
                                    <div
                                        key={performer.userId}
                                        className="flex items-center gap-3 p-3 rounded-lg border border-warm-gray/40 hover:bg-warm-beige/20 transition-colors"
                                    >
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                                            performer.rank === 1
                                                ? "bg-earthy-gold/20 text-earthy-gold"
                                                : performer.rank === 2
                                                    ? "bg-warm-gray/30 text-soft-brown"
                                                    : performer.rank === 3
                                                        ? "bg-amber-100 text-amber-700"
                                                        : "bg-warm-beige text-muted-foreground"
                                        }`}>
                                            #{performer.rank}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground truncate">
                                                {performer.userName}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground truncate">
                                                {performer.tryoutTitle}
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-sm font-bold text-earthy-gold">
                                                {Math.round(performer.highestScore)}%
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Trophy className="w-8 h-8 text-muted-foreground mb-3" />
                                <p className="text-sm text-muted-foreground">
                                    Top performers akan tampil di sini.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
