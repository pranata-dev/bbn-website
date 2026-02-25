"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Users, CreditCard, FileText, HelpCircle, TrendingUp, Trophy, Loader2 } from "lucide-react"

interface DashboardStats {
    totalUsers: number
    pendingVerifications: number
    totalTryouts: number
    totalQuestions: number
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [loading, setLoading] = useState(true)

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
        fetchStats()
    }, [])

    const statCards = [
        { label: "Total Pengguna", value: stats?.totalUsers ?? "0", icon: Users },
        { label: "Menunggu Verifikasi", value: stats?.pendingVerifications ?? "0", icon: CreditCard },
        { label: "Total Tryout", value: stats?.totalTryouts ?? "0", icon: FileText },
        { label: "Total Soal", value: stats?.totalQuestions ?? "0", icon: HelpCircle },
    ]

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-muted-foreground">Kelola platform Belajar Bareng Nata.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                <Card className="border-warm-gray/60">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <TrendingUp className="w-8 h-8 text-muted-foreground mb-3" />
                        <p className="text-sm text-muted-foreground">
                            Grafik statistik akan muncul setelah ada data aktivitas.
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-warm-gray/60">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <Trophy className="w-8 h-8 text-muted-foreground mb-3" />
                        <p className="text-sm text-muted-foreground">
                            Top performers akan tampil di sini.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
