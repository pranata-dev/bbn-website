"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useSubject } from "@/contexts/SubjectContext"
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
import { useTheme } from "@/contexts/ThemeContext"
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
    subjectAccess: any[]
}

export default function DashboardClient({ dbUser, subjectAccess }: DashboardClientProps) {
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)
    const { selectedSubject } = useSubject()

    useEffect(() => {
        const loadStats = async () => {
            setLoading(true)
            try {
                const res = await fetch(`/api/dashboard/stats?subject=${selectedSubject}`)
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
    }, [selectedSubject])


    // Aggregate features or use a specific one? For now, we'll map per subject.
    // The previous logic used a single 'packageType' and 'usedQuota'.

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

    const { isDark } = useTheme()

    return (
        <div className="space-y-8 font-mono">
            {/* Tryout Stats grid */}
            <div>
                <h2 className={`text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2 ${isDark ? "text-[#FEFCF3]" : "text-[#2b1b11]"}`}>
                    <span className="w-1.5 h-4 bg-[#e87a5d]"></span>
                    Statistik Tryout
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {tryoutStats.map((stat) => (
                        <div key={stat.label} className="bg-[#FEFCF3] border-4 border-[#2b1b11] p-4 shadow-[4px_4px_0px_#2b1b11] hover:-translate-y-1 hover:shadow-[6px_6px_0px_#2b1b11] transition-all">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-[#3c5443] font-bold">{stat.label}</p>
                                    {loading ? (
                                        <Loader2 className="w-4 h-4 animate-spin text-[#2b1b11] mt-2" />
                                    ) : (
                                        <p className="text-2xl font-extrabold text-[#2b1b11] mt-1">{stat.value}</p>
                                    )}
                                </div>
                                <div className="w-10 h-10 bg-[#bed3c6] border-2 border-[#2b1b11] flex items-center justify-center shadow-[2px_2px_0px_#2b1b11]">
                                    <stat.icon className="w-5 h-5 text-[#2b1b11] stroke-[2]" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Latihan Stats grid */}
            <div>
                <h2 className={`text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2 ${isDark ? "text-[#FEFCF3]" : "text-[#2b1b11]"}`}>
                    <span className="w-1.5 h-4 bg-[#e87a5d]"></span>
                    Statistik Latihan Soal
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {latihanStats.map((stat) => (
                        <div key={stat.label} className="bg-[#FEFCF3] border-4 border-[#2b1b11] p-4 shadow-[4px_4px_0px_#2b1b11] hover:-translate-y-1 hover:shadow-[6px_6px_0px_#2b1b11] transition-all">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-[#3c5443] font-bold">{stat.label}</p>
                                    {loading ? (
                                        <Loader2 className="w-4 h-4 animate-spin text-[#2b1b11] mt-2" />
                                    ) : (
                                        <p className="text-2xl font-extrabold text-[#2b1b11] mt-1">{stat.value}</p>
                                    )}
                                </div>
                                <div className="w-10 h-10 bg-[#bed3c6] border-2 border-[#2b1b11] flex items-center justify-center shadow-[2px_2px_0px_#2b1b11]">
                                    <stat.icon className="w-5 h-5 text-[#2b1b11] stroke-[2]" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick actions & Package specifics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h2 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${isDark ? "text-[#FEFCF3]" : "text-[#2b1b11]"}`}>
                        <span className="w-1.5 h-4 bg-[#e87a5d]"></span>
                        Akses Mata Kuliah
                    </h2>
                    {subjectAccess.length === 0 ? (
                        <div className="bg-[#FEFCF3] border-4 border-[#2b1b11] p-6 shadow-[4px_4px_0px_#2b1b11]">
                            <p className="text-center text-[#3c5443] text-sm font-bold">
                                Kamu belum memiliki akses aktif ke mata kuliah apapun.
                            </p>
                        </div>
                    ) : (
                        subjectAccess.map((access) => {
                            const features = getPackageFeatures(access.package_type, access.role, access.subject)
                            const remainingTryouts = Math.max(0, features.tryoutLimit - access.tryout_attempts_used)
                            const subjectLabel = access.subject === "FISDAS2" ? "Fisika Dasar 2" : "Fisika Matematika"

                            return (
                                <div key={access.id} className="bg-[#FEFCF3] border-4 border-[#2b1b11] shadow-[4px_4px_0px_#2b1b11] overflow-hidden">
                                    <div className="bg-[#bed3c6] px-4 py-2 border-b-2 border-[#2b1b11] flex justify-between items-center">
                                        <span className="text-xs font-bold text-[#2b1b11]">{subjectLabel}</span>
                                        <span className="text-[10px] font-bold text-[#2b1b11] bg-[#FEFCF3] px-2 py-0.5 border border-[#2b1b11]">
                                            {access.role.replace("UTS_", "")}
                                        </span>
                                    </div>
                                    <div className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-[#bed3c6] border-2 border-[#2b1b11] flex items-center justify-center shadow-[1px_1px_0px_#2b1b11]">
                                                    <FileText className="w-4 h-4 text-[#2b1b11] stroke-[2]" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-[#3c5443] font-bold">Kuota Tryout</p>
                                                    <p className="text-sm font-extrabold text-[#2b1b11]">
                                                        {features.canAccessTryout ? `${remainingTryouts} Tersisa` : "Tidak Ada"}
                                                    </p>
                                                </div>
                                            </div>
                                            {features.canAccessTryout && remainingTryouts > 0 ? (
                                                <Button size="sm" asChild className="text-[10px] h-7 px-3 bg-[#e87a5d] hover:bg-[#d95a4f] text-[#FEFCF3] border-2 border-[#2b1b11] shadow-[2px_2px_0px_#2b1b11] rounded-none font-bold">
                                                    <Link href="/dashboard/tryouts">Mulai</Link>
                                                </Button>
                                            ) : (
                                                <span className="text-[10px] font-bold text-[#2b1b11]/40 flex items-center gap-1">
                                                    <Lock className="w-3 h-3" /> Habis
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>

                {/* Recent activity */}
                <div className="bg-[#FEFCF3] border-4 border-[#2b1b11] shadow-[4px_4px_0px_#2b1b11] overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b-2 border-[#2b1b11]/20">
                        <h3 className="text-sm font-extrabold text-[#2b1b11] flex items-center gap-2">
                            <span className="w-1.5 h-4 bg-[#e87a5d]"></span>
                            Aktivitas Terakhir
                        </h3>
                        <Link href="/dashboard/history" className="text-[10px] font-bold text-[#e87a5d] hover:underline flex items-center gap-1">
                            Lihat Semua
                            <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="p-4">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-[#2b1b11]" />
                            </div>
                        ) : dashboardData && dashboardData.recentActivity.length > 0 ? (
                            <div className="space-y-3">
                                {dashboardData.recentActivity.map((activity) => (
                                    <Link
                                        key={activity.id}
                                        href={activity.type === "Tryout"
                                            ? `/dashboard/tryouts/${activity.tryoutId}/result`
                                            : `/dashboard/latihan/${activity.tryoutId}/result`}
                                        className="flex items-center justify-between p-3 border-2 border-[#2b1b11]/20 hover:border-[#2b1b11] hover:bg-[#bed3c6]/20 transition-all"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className={`w-8 h-8 flex items-center justify-center shrink-0 border-2 border-[#2b1b11] shadow-[1px_1px_0px_#2b1b11] ${
                                                activity.type === "Tryout" ? "bg-[#e87a5d]/20" : "bg-[#bed3c6]"
                                            }`}>
                                                {activity.type === "Tryout" ? (
                                                    <FileText className="w-4 h-4 text-[#e87a5d] stroke-[2]" />
                                                ) : (
                                                    <BookOpen className="w-4 h-4 text-[#2b1b11] stroke-[2]" />
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-[#2b1b11] truncate">{activity.title}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[10px] px-1.5 py-0 font-bold border border-[#2b1b11] ${
                                                        activity.type === "Tryout"
                                                            ? "bg-[#e87a5d]/10 text-[#e87a5d]"
                                                            : "bg-[#bed3c6] text-[#2b1b11]"
                                                    }`}>
                                                        {activity.type}
                                                    </span>
                                                    <span className="text-[10px] text-[#3c5443] font-bold">
                                                        {formatDate(activity.createdAt)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0 ml-2">
                                            <p className="text-sm font-extrabold text-[#2b1b11]">
                                                {activity.score !== null ? `${Math.round(activity.score)}%` : "-"}
                                            </p>
                                            <p className="text-[10px] text-[#3c5443] font-bold">
                                                {activity.correctCount ?? 0}/{activity.totalCount ?? 0}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <div className="w-12 h-12 bg-[#bed3c6] border-2 border-[#2b1b11] flex items-center justify-center shadow-[2px_2px_0px_#2b1b11] mb-3">
                                    <Clock className="w-6 h-6 text-[#2b1b11] stroke-[2]" />
                                </div>
                                <p className="text-xs text-[#3c5443] font-bold">
                                    Belum ada aktivitas. Mulai tryout pertamamu!
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Performance overview */}
            <div className="bg-[#FEFCF3] border-4 border-[#2b1b11] shadow-[4px_4px_0px_#2b1b11] overflow-hidden">
                <div className="px-5 py-4 border-b-2 border-[#2b1b11]/20">
                    <h3 className="text-sm font-extrabold text-[#2b1b11] flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-[#e87a5d] stroke-[2]" />
                        Analisis Performa Per Materi
                        <span className="text-[10px] font-bold bg-[#bed3c6] text-[#2b1b11] px-2 py-0.5 border border-[#2b1b11] ml-1">Tryout Only</span>
                    </h3>
                </div>
                <div className="p-5">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-6 h-6 animate-spin text-[#2b1b11]" />
                        </div>
                    ) : dashboardData && dashboardData.performancePerMateri.length > 0 ? (
                        <div className="space-y-4">
                            {dashboardData.performancePerMateri.map((materi) => {
                                const label = materi.category.replace("_", " ")
                                const barWidth = Math.max(5, materi.avgScore)
                                return (
                                    <div key={materi.category} className="space-y-1.5">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-bold text-[#2b1b11]">{label}</span>
                                            <span className="text-[#3c5443] font-bold">
                                                {materi.avgScore}% avg · {materi.totalAttempts} attempt{materi.totalAttempts > 1 ? "s" : ""}
                                            </span>
                                        </div>
                                        <div className="w-full h-4 bg-[#bed3c6]/40 border-2 border-[#2b1b11] overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-500 ${
                                                    materi.avgScore >= 80
                                                        ? "bg-[#3c7a56]"
                                                        : materi.avgScore >= 60
                                                            ? "bg-[#e87a5d]"
                                                            : "bg-[#d95a4f]"
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
                            <div className="w-14 h-14 bg-[#bed3c6] border-2 border-[#2b1b11] flex items-center justify-center shadow-[2px_2px_0px_#2b1b11] mb-4">
                                <TrendingUp className="w-7 h-7 text-[#2b1b11] stroke-[2]" />
                            </div>
                            <p className="text-xs text-[#3c5443] font-bold mb-4">
                                Data analisis akan muncul setelah kamu menyelesaikan tryout.
                            </p>
                            <Button asChild className="bg-[#e87a5d] hover:bg-[#d95a4f] text-[#FEFCF3] border-2 border-[#2b1b11] shadow-[3px_3px_0px_#2b1b11] rounded-none font-bold">
                                <Link href="/dashboard/tryouts">Mulai Tryout</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
