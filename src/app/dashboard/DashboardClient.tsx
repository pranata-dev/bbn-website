"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
    FileText,
    Trophy,
    Target,
    TrendingUp,
    ArrowRight,
    Clock,
    Lock,
    Unlock,
    Loader2,
    BookOpen,
    BarChart3,
} from "lucide-react"
import { getPackageFeatures } from "@/lib/package-features"
import { PackageType } from "@prisma/client"

interface DashboardData {
    recentActivity: {
        id: string
        tryoutId: string
        title: string
        type: "Tryout" | "Latihan"
        score: number | null
        correctCount: number | null
        totalCount: number | null
        createdAt: string
    }[]
    tryoutStats: { completed: number; avgScore: number; highestScore: number }
    latihanStats: { completed: number; avgScore: number; highestScore: number }
    performancePerMateri: { category: string; avgScore: number; totalAttempts: number }[]
}

interface DashboardClientProps {
    dbUser: any
    usedQuota: number
}

export default function DashboardClient({ dbUser, usedQuota }: DashboardClientProps) {
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadStats = async () => {
            try {
                const res = await fetch("/api/dashboard/stats")
                if (res.ok) {
                    const data = await res.json()
                    setDashboardData(data)
                }
            } catch (error) {
                console.error("Failed to load dashboard stats:", error)
            } finally {
                setLoading(false)
            }
        }
        loadStats()
    }, [])

    const packageType = (dbUser?.package_type as PackageType) || null
    const features = getPackageFeatures(packageType, dbUser?.role)
    const remainingTryouts = Math.max(0, features.tryoutLimit - usedQuota)

    const tryoutStats = [
        { label: "Tryout Selesai", value: dashboardData?.tryoutStats.completed ?? 0, icon: FileText, color: "text-dark-brown" },
        { label: "Rata-rata Skor", value: `${dashboardData?.tryoutStats.avgScore ?? 0}%`, icon: Target, color: "text-earthy-green" },
        { label: "Skor Tertinggi", value: `${dashboardData?.tryoutStats.highestScore ?? 0}%`, icon: TrendingUp, color: "text-earthy-gold" },
        { label: "Peringkat", value: "-", icon: Trophy, color: "text-soft-brown" },
    ]

    const latihanStats = [
        { label: "Latihan Selesai", value: dashboardData?.latihanStats.completed ?? 0, icon: BookOpen, color: "text-dark-brown" },
        { label: "Rata-rata Skor", value: `${dashboardData?.latihanStats.avgScore ?? 0}%`, icon: Target, color: "text-earthy-green" },
        { label: "Skor Tertinggi", value: `${dashboardData?.latihanStats.highestScore ?? 0}%`, icon: TrendingUp, color: "text-earthy-gold" },
    ]

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
    }

    return (
        <div className="space-y-8">
            {/* Tryout Stats grid */}
            <div>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Statistik Tryout
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {tryoutStats.map((stat) => (
                        <Card key={stat.label} className="border-warm-gray/60 hover:shadow-md transition-shadow">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                                        {loading ? (
                                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground mt-2" />
                                        ) : (
                                            <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                                        )}
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-warm-beige flex items-center justify-center">
                                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Latihan Stats grid */}
            <div>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" /> Statistik Latihan Soal
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {latihanStats.map((stat) => (
                        <Card key={stat.label} className="border-warm-gray/60 hover:shadow-md transition-shadow">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                                        {loading ? (
                                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground mt-2" />
                                        ) : (
                                            <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                                        )}
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-earthy-green/10 flex items-center justify-center">
                                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Quick actions & Package specifics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Dynamically Replaced Available Tryouts based on Package */}
                {!features.canAccessTryout ? (
                    <Card className="border-warm-gray/60 bg-warm-gray/10">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg text-muted-foreground flex items-center gap-2">
                                <Lock className="w-4 h-4" /> Tryout Terkunci
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center justify-center py-6 text-center">
                                <div className="w-12 h-12 rounded-full bg-warm-gray/20 flex items-center justify-center mb-3">
                                    <FileText className="w-6 h-6 text-muted-foreground/50" />
                                </div>
                                <p className="text-sm font-medium text-foreground mb-1">
                                    Fitur TryOut tidak tersedia di paket ini.
                                </p>
                                <p className="text-xs text-muted-foreground mb-4">
                                    Upgrade ke Berotak Senku Mode untuk membuka akses TryOut.
                                </p>
                                <Button variant="outline" className="w-full text-xs" asChild>
                                    <a href="https://wa.me/6281234567890?text=Halo%20Admin%2C%20saya%20ingin%20upgrade%20paket%20ke%20Senku%20Mode" target="_blank" rel="noopener noreferrer">
                                        Upgrade Sekarang
                                    </a>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : packageType === "SENKU" || packageType === "EINSTEIN" ? (
                    <Card className="border-earthy-gold/50 shadow-sm shadow-earthy-gold/10">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Unlock className="w-4 h-4 text-earthy-gold" /> Kuota Tryout
                            </CardTitle>
                            <Badge variant={remainingTryouts > 0 ? "default" : "destructive"}>
                                {remainingTryouts} Tersisa
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center justify-center py-6 text-center">
                                <div className="w-12 h-12 rounded-full bg-earthy-gold/20 flex items-center justify-center mb-3">
                                    <FileText className="w-6 h-6 text-earthy-gold" />
                                </div>
                                {remainingTryouts === 0 ? (
                                    <>
                                        <p className="text-sm font-medium text-destructive mb-1">
                                            Kuota TryOut telah habis.
                                        </p>
                                        <p className="text-xs text-muted-foreground mb-4">
                                            {packageType === "SENKU" ? "Upgrade ke Einstein Mode untuk tambahan kuota!" : "Hubungi admin untuk menambah kuota Tryout kamu."}
                                        </p>
                                        <Button variant="outline" className="w-full text-xs" asChild>
                                            <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer">
                                                {packageType === "SENKU" ? "Upgrade Sekarang" : "Hubungi Admin"}
                                            </a>
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-sm font-medium text-foreground mb-1">
                                            Kamu memiliki {remainingTryouts} kuota tryout.
                                        </p>
                                        <p className="text-xs text-muted-foreground mb-4">
                                            Persiapkan dirimu dan mulai ujian simulasi sekarang.
                                        </p>
                                        <Button className="w-full text-xs bg-dark-brown text-cream hover:bg-soft-brown" asChild>
                                            <Link href="/dashboard/tryouts">Mulai Tryout</Link>
                                        </Button>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="border-warm-gray/60">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg">Tryout Tersedia</CardTitle>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/dashboard/tryouts">
                                    Lihat Semua
                                    <ArrowRight className="ml-1 w-4 h-4" />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <div className="w-12 h-12 rounded-full bg-warm-beige flex items-center justify-center mb-3">
                                    <FileText className="w-6 h-6 text-muted-foreground" />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Belum ada tryout aktif. Cek kembali nanti!
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Recent activity */}
                <Card className="border-warm-gray/60">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">Aktivitas Terakhir</CardTitle>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/dashboard/history">
                                Lihat Semua
                                <ArrowRight className="ml-1 w-4 h-4" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : dashboardData && dashboardData.recentActivity.length > 0 ? (
                            <div className="space-y-3">
                                {dashboardData.recentActivity.map((activity) => (
                                    <Link
                                        key={activity.id}
                                        href={activity.type === "Tryout"
                                            ? `/dashboard/tryouts/${activity.tryoutId}/result`
                                            : `/dashboard/latihan/${activity.tryoutId}/result`}
                                        className="flex items-center justify-between p-3 rounded-lg border border-warm-gray/40 hover:bg-warm-beige/30 transition-colors"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                                activity.type === "Tryout" ? "bg-earthy-gold/15" : "bg-earthy-green/15"
                                            }`}>
                                                {activity.type === "Tryout" ? (
                                                    <FileText className="w-4 h-4 text-earthy-gold" />
                                                ) : (
                                                    <BookOpen className="w-4 h-4 text-earthy-green" />
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-foreground truncate">{activity.title}</p>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${
                                                        activity.type === "Tryout"
                                                            ? "bg-earthy-gold/10 text-earthy-gold"
                                                            : "bg-earthy-green/10 text-earthy-green"
                                                    }`}>
                                                        {activity.type}
                                                    </Badge>
                                                    <span className="text-[11px] text-muted-foreground">
                                                        {formatDate(activity.createdAt)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0 ml-2">
                                            <p className="text-sm font-bold text-foreground">
                                                {activity.score !== null ? `${Math.round(activity.score)}%` : "-"}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground">
                                                {activity.correctCount ?? 0}/{activity.totalCount ?? 0}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <div className="w-12 h-12 rounded-full bg-warm-beige flex items-center justify-center mb-3">
                                    <Clock className="w-6 h-6 text-muted-foreground" />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Belum ada aktivitas. Mulai tryout pertamamu!
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Performance overview (Tryout Only) */}
            <Card className="border-warm-gray/60">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-dark-brown" />
                        Analisis Performa Per Materi
                        <Badge variant="secondary" className="bg-warm-beige text-soft-brown text-[10px] ml-1">Tryout Only</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : dashboardData && dashboardData.performancePerMateri.length > 0 ? (
                        <div className="space-y-4">
                            {dashboardData.performancePerMateri.map((materi) => {
                                const label = materi.category.replace("_", " ")
                                const barWidth = Math.max(5, materi.avgScore)
                                return (
                                    <div key={materi.category} className="space-y-1.5">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-medium text-foreground">{label}</span>
                                            <span className="text-muted-foreground text-xs">
                                                {materi.avgScore}% avg · {materi.totalAttempts} attempt{materi.totalAttempts > 1 ? "s" : ""}
                                            </span>
                                        </div>
                                        <div className="w-full h-3 bg-warm-beige rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${
                                                    materi.avgScore >= 80
                                                        ? "bg-earthy-green"
                                                        : materi.avgScore >= 60
                                                            ? "bg-earthy-gold"
                                                            : "bg-soft-brown"
                                                }`}
                                                style={{ width: `${barWidth}%` }}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-16 h-16 rounded-full bg-warm-beige flex items-center justify-center mb-4">
                                <TrendingUp className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <p className="text-muted-foreground">
                                Data analisis akan muncul setelah kamu menyelesaikan tryout.
                            </p>
                            <Button asChild className="mt-4 bg-dark-brown hover:bg-soft-brown text-cream">
                                <Link href="/dashboard/tryouts">Mulai Tryout</Link>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
