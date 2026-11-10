"use client"

import { useState, useEffect, useCallback } from "react"
import { BarChart3, Users, CreditCard, FileText, Trophy, RefreshCw, Loader2 } from "lucide-react"

interface DashboardAnalytics {
    kpi: {
        totalUsers: number
        activeUsers: number
        pendingPaymentsCount: number
        activeTryoutsCount: number
        totalRevenue: number
        avgScore: number
        totalCompletions: number
    }
    trends: {
        userGrowth: { name: string; total: number }[]
        completions: { name: string; total: number }[]
    }
    topPerformers: { name: string; email: string; score: number }[]
    auditLogs: { time: string; tag: string; message: string; timestamp: string }[]
}

export default function AdminStatisticsPage() {
    const [data, setData] = useState<DashboardAnalytics | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchAnalytics = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/admin/dashboard")
            if (res.ok) {
                const json = await res.json()
                setData(json)
            }
        } catch (error) {
            console.error("Failed to fetch admin analytics:", error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchAnalytics()
    }, [fetchAnalytics])

    const maxUserGrowth = Math.max(1, ...(data?.trends.userGrowth.map((d) => d.total) || [1]))
    const maxCompletions = Math.max(1, ...(data?.trends.completions.map((d) => d.total) || [1]))

    return (
        <div className="space-y-6 font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b-2 border-[#171717] pb-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="w-2.5 h-2.5 bg-accent-canary border border-[#171717] inline-block" />
                        <span className="font-mono text-[10px] uppercase tracking-wider text-ink-muted font-bold">
                            PLATFORM TELEMETRY // ANALYTICS
                        </span>
                    </div>
                    <h1 className="text-2xl font-extrabold text-[#171717]">Statistik & Analitik Platform</h1>
                    <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
                        Metrik pertumbuhan pendaftar, penyelesaian tryout, pendapatan terverifikasi, dan log audit sistem.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={fetchAnalytics}
                    disabled={loading}
                    className="h-9 px-3 bg-surface-white hover:bg-canvas-paper border border-[#171717] font-mono text-xs font-bold text-[#171717] shadow-[2px_2px_0px_#171717] flex items-center gap-1.5 self-start sm:self-auto cursor-pointer disabled:opacity-50"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                    <span>REFRESH DATA</span>
                </button>
            </div>

            {loading || !data ? (
                <div className="flex items-center justify-center py-24 bg-surface-white border-2 border-[#171717] shadow-[4px_4px_0px_#171717]">
                    <Loader2 className="w-6 h-6 animate-spin text-[#171717]" />
                </div>
            ) : (
                <>
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-surface-white border-2 border-[#171717] p-5 shadow-[4px_4px_0px_#171717]">
                            <div className="flex items-center justify-between text-ink-muted font-mono text-[10px] font-bold uppercase">
                                <span>PENDAPATAN TERVERIFIKASI</span>
                                <CreditCard className="w-4 h-4 text-[#171717]" />
                            </div>
                            <div className="text-2xl font-extrabold font-mono text-[#171717] mt-3">
                                Rp {data.kpi.totalRevenue.toLocaleString("id-ID")}
                            </div>
                            <p className="font-mono text-[11px] text-ink-muted mt-1">
                                Antrean: {data.kpi.pendingPaymentsCount} menunggu
                            </p>
                        </div>

                        <div className="bg-surface-white border-2 border-[#171717] p-5 shadow-[4px_4px_0px_#171717]">
                            <div className="flex items-center justify-between text-ink-muted font-mono text-[10px] font-bold uppercase">
                                <span>PENGGUNA AKTIF / TOTAL</span>
                                <Users className="w-4 h-4 text-[#171717]" />
                            </div>
                            <div className="text-2xl font-extrabold font-mono text-[#171717] mt-3">
                                {data.kpi.activeUsers} / {data.kpi.totalUsers}
                            </div>
                            <p className="font-mono text-[11px] text-ink-muted mt-1">
                                Rasio aktivasi:{" "}
                                {data.kpi.totalUsers > 0
                                    ? Math.round((data.kpi.activeUsers / data.kpi.totalUsers) * 100)
                                    : 0}
                                %
                            </p>
                        </div>

                        <div className="bg-surface-white border-2 border-[#171717] p-5 shadow-[4px_4px_0px_#171717]">
                            <div className="flex items-center justify-between text-ink-muted font-mono text-[10px] font-bold uppercase">
                                <span>PENYELESAIAN TRYOUT</span>
                                <FileText className="w-4 h-4 text-[#171717]" />
                            </div>
                            <div className="text-2xl font-extrabold font-mono text-[#171717] mt-3">
                                {data.kpi.totalCompletions} Sesi
                            </div>
                            <p className="font-mono text-[11px] text-ink-muted mt-1">
                                {data.kpi.activeTryoutsCount} paket tryout aktif
                            </p>
                        </div>

                        <div className="bg-surface-white border-2 border-[#171717] p-5 shadow-[4px_4px_0px_#171717]">
                            <div className="flex items-center justify-between text-ink-muted font-mono text-[10px] font-bold uppercase">
                                <span>RATA-RATA SKOR GLOBAL</span>
                                <Trophy className="w-4 h-4 text-[#171717]" />
                            </div>
                            <div className="text-2xl font-extrabold font-mono text-[#171717] mt-3">
                                {data.kpi.avgScore} Poin
                            </div>
                            <p className="font-mono text-[11px] text-ink-muted mt-1">
                                Dari seluruh pengerjaan selesai
                            </p>
                        </div>
                    </div>

                    {/* 6-Month Trends */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-surface-white border-2 border-[#171717] p-5 shadow-[4px_4px_0px_#171717]">
                            <div className="flex items-center gap-2 pb-3 border-b-2 border-[#171717] mb-4">
                                <BarChart3 className="w-4 h-4 text-[#171717]" />
                                <h2 className="font-extrabold text-sm text-[#171717]">
                                    Tren Pertumbuhan Pendaftar (6 Bulan Terakhir)
                                </h2>
                            </div>
                            <div className="space-y-3">
                                {data.trends.userGrowth.map((item) => (
                                    <div key={item.name} className="space-y-1">
                                        <div className="flex justify-between font-mono text-xs">
                                            <span className="font-bold text-[#171717]">{item.name}</span>
                                            <span className="text-ink-muted">{item.total} Mahasiswa</span>
                                        </div>
                                        <div className="w-full h-3 bg-canvas-paper border border-[#171717]">
                                            <div
                                                className="h-full bg-accent-canary border-r border-[#171717]"
                                                style={{ width: `${Math.max(4, Math.round((item.total / maxUserGrowth) * 100))}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-surface-white border-2 border-[#171717] p-5 shadow-[4px_4px_0px_#171717]">
                            <div className="flex items-center gap-2 pb-3 border-b-2 border-[#171717] mb-4">
                                <BarChart3 className="w-4 h-4 text-[#171717]" />
                                <h2 className="font-extrabold text-sm text-[#171717]">
                                    Tren Penyelesaian Tryout (6 Bulan Terakhir)
                                </h2>
                            </div>
                            <div className="space-y-3">
                                {data.trends.completions.map((item) => (
                                    <div key={item.name} className="space-y-1">
                                        <div className="flex justify-between font-mono text-xs">
                                            <span className="font-bold text-[#171717]">{item.name}</span>
                                            <span className="text-ink-muted">{item.total} Sesi</span>
                                        </div>
                                        <div className="w-full h-3 bg-canvas-paper border border-[#171717]">
                                            <div
                                                className="h-full bg-[#171717]"
                                                style={{ width: `${Math.max(4, Math.round((item.total / maxCompletions) * 100))}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Top Performers & Audit Logs */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-surface-white border-2 border-[#171717] p-5 shadow-[4px_4px_0px_#171717]">
                            <h2 className="font-extrabold text-sm text-[#171717] pb-3 border-b-2 border-[#171717] mb-4">
                                5 Skor Tryout Tertinggi
                            </h2>
                            {data.topPerformers.length === 0 ? (
                                <p className="font-mono text-xs text-ink-muted py-6 text-center">
                                    Belum ada riwayat skor tryout.
                                </p>
                            ) : (
                                <div className="space-y-2.5">
                                    {data.topPerformers.map((perf, idx) => (
                                        <div
                                            key={`${perf.email}-${idx}`}
                                            className="p-3 bg-canvas-paper border border-[#171717] flex items-center justify-between"
                                        >
                                            <div>
                                                <p className="font-bold text-sm text-[#171717]">{perf.name}</p>
                                                <p className="font-mono text-[11px] text-ink-muted">{perf.email}</p>
                                            </div>
                                            <span className="font-mono text-sm font-extrabold bg-accent-canary px-2.5 py-1 border border-[#171717]">
                                                {perf.score} Poin
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="bg-surface-white border-2 border-[#171717] p-5 shadow-[4px_4px_0px_#171717]">
                            <h2 className="font-extrabold text-sm text-[#171717] pb-3 border-b-2 border-[#171717] mb-4">
                                Log Aktivitas & Audit Sistem Terbaru
                            </h2>
                            {data.auditLogs.length === 0 ? (
                                <p className="font-mono text-xs text-ink-muted py-6 text-center">
                                    Belum ada aktivitas tercatat.
                                </p>
                            ) : (
                                <div className="space-y-2.5 font-mono text-xs">
                                    {data.auditLogs.map((log, idx) => (
                                        <div
                                            key={`${log.timestamp}-${idx}`}
                                            className="p-2.5 bg-canvas-paper border border-[#171717]/30 flex gap-3 items-start"
                                        >
                                            <span className="font-bold text-ink-muted shrink-0">{log.time}</span>
                                            <div>
                                                <span className="font-bold text-[#171717]">[{log.tag}]</span>
                                                <p className="text-ink-muted mt-0.5">{log.message}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
