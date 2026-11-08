"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { toast } from "sonner"
import {
  Users,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
  Plus,
  FileQuestion,
  BookOpen,
  Timer,
  ShieldCheck,
  Zap,
  CreditCard,
  Check,
} from "lucide-react"

interface DashboardStats {
  totalUsers: number
  pendingVerifications: number
  totalTryouts: number
  totalPractices: number
  totalQuestions: number
  physicsActiveUsers: number
  nonPhysicsActiveUsers: number
  activeUsers: number
}

interface RegistrationItem {
  id: string
  name: string
  email: string
  whatsapp?: string
  phone?: string
  student_category?: string
  package_type?: string
  billing_cycle?: string
  status: string
  created_at: string
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    pendingVerifications: 0,
    totalTryouts: 0,
    totalPractices: 0,
    totalQuestions: 0,
    physicsActiveUsers: 0,
    nonPhysicsActiveUsers: 0,
    activeUsers: 0,
  })
  const [recentRegistrations, setRecentRegistrations] = useState<RegistrationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [lastSyncTime, setLastSyncTime] = useState<string>("14:30:00 WIB")

  const fetchData = async () => {
    setLoading(true)
    try {
      const now = new Date()
      setLastSyncTime(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }) + " WIB"
      )

      const [statsRes, usersRes, paymentsRes] = await Promise.all([
        fetch("/api/admin/stats").catch(() => null),
        fetch("/api/admin/users").catch(() => null),
        fetch("/api/admin/payments").catch(() => null),
      ])

      let usersList: any[] = []
      if (usersRes && usersRes.ok) {
        const uData = await usersRes.json()
        usersList = uData.users || []
      }

      let paymentsList: any[] = []
      if (paymentsRes && paymentsRes.ok) {
        const pData = await paymentsRes.json()
        paymentsList = pData.payments || []
        setRecentRegistrations(paymentsList.slice(0, 6))
      }

      const rawStats = statsRes && statsRes.ok ? (await statsRes.json()).stats : {}

      const physicsActive = usersList.filter(
        (u) => (u.active_subscription?.track === "PHYSICS_SEM_3" || !u.active_subscription) && u.is_active
      ).length

      const nonPhysicsActive = usersList.filter(
        (u) => u.active_subscription?.track === "NON_PHYSICS" && u.is_active
      ).length

      const totalActive = usersList.filter((u) => u.is_active).length
      const pendingCount = paymentsList.filter((p) => p.status === "PENDING").length

      setStats({
        totalUsers: rawStats.totalUsers || usersList.length || 0,
        pendingVerifications: pendingCount || rawStats.pendingVerifications || 0,
        totalTryouts: rawStats.totalTryouts || 0,
        totalPractices: rawStats.totalPractices || 0,
        totalQuestions: rawStats.totalQuestions || 0,
        physicsActiveUsers: physicsActive,
        nonPhysicsActiveUsers: nonPhysicsActive,
        activeUsers: totalActive || usersList.length || 0,
      })
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
      toast.error("Gagal memuat telemetri dashboard.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleQuickApprove = async (id: string) => {
    setApprovingId(id)
    try {
      const res = await fetch("/api/auth/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId: id,
          action: "APPROVED",
          notes: "Disetujui melalui Quick Action Dashboard",
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Gagal menyetujui pendaftaran")

      toast.success("Pendaftaran berhasil disetujui & hak akses diaktifkan!")
      fetchData()
    } catch (err: any) {
      toast.error(err?.message || "Terjadi kesalahan saat memproses persetujuan.")
    } finally {
      setApprovingId(null)
    }
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header Info Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b-2 border-[#171717] gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 bg-accent-canary border border-[#171717] inline-block" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-ink-muted font-bold">
              OPERATIONAL DISPATCH // MONITOR
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171717] tracking-tight">
            Dashboard Utama Administrator
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-1">
            Pantau status pendaftaran siswa, verifikasi transfer kas, aktivitas tryout, dan modul materi.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <span className="font-mono text-[11px] text-ink-muted bg-surface-white border border-[#171717] px-2.5 py-1">
            LAST SYNC: {lastSyncTime}
          </span>
          <button
            type="button"
            onClick={fetchData}
            disabled={loading}
            className="px-3 py-1 bg-surface-white hover:bg-canvas-paper border border-[#171717] font-mono text-xs font-bold text-[#171717] shadow-[2px_2px_0px_#171717] hover:shadow-[1px_1px_0px_#171717] hover:translate-x-[1px] hover:translate-y-[1px] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>REFRESH</span>
          </button>
        </div>
      </div>

      {/* 4 Bento Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Pendaftar Menunggu */}
        <div className="bg-surface-white border-2 border-[#171717] p-5 shadow-[4px_4px_0px_#171717] relative">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-ink-muted uppercase tracking-wider font-bold">
              METRIC // 01
            </span>
            {stats.pendingVerifications > 0 ? (
              <span className="font-mono text-[10px] font-bold bg-alert-rust text-white px-2 py-0.5 border border-[#171717] animate-pulse">
                PERLU VERIFIKASI
              </span>
            ) : (
              <span className="font-mono text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 border border-emerald-700">
                CLEAR
              </span>
            )}
          </div>
          <div className="mt-3">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-[#171717] leading-none">
              {loading ? "..." : stats.pendingVerifications}
            </div>
            <p className="text-xs font-bold text-[#171717] mt-1.5">
              Pendaftar Menunggu
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#171717]/20 flex justify-between font-mono text-[10px] text-ink-muted">
            <span>STATUS: REKONSILIASI</span>
            <Link
              href="/admin/users"
              className="text-[#171717] font-bold underline hover:text-alert-rust"
            >
              PROSES →
            </Link>
          </div>
        </div>

        {/* Metric 2: Mahasiswa Fisika Aktif */}
        <div className="bg-surface-white border-2 border-[#171717] p-5 shadow-[4px_4px_0px_#171717] relative">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-ink-muted uppercase tracking-wider font-bold">
              METRIC // 02
            </span>
            <span className="font-mono text-[10px] font-bold bg-canvas-paper px-2 py-0.5 border border-[#171717] text-[#171717]">
              DEPT. FISIKA
            </span>
          </div>
          <div className="mt-3">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-[#171717] leading-none">
              {loading ? "..." : stats.physicsActiveUsers}
            </div>
            <p className="text-xs font-bold text-[#171717] mt-1.5">
              Mahasiswa Fisika Smt 3
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#171717]/20">
            <div className="w-full bg-canvas-paper h-2 border border-[#171717] overflow-hidden flex">
              <div
                className="bg-[#171717] h-full transition-all duration-500"
                style={{
                  width: `${
                    stats.activeUsers > 0
                      ? Math.round((stats.physicsActiveUsers / stats.activeUsers) * 100)
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Metric 3: Mahasiswa Non-Fisika Aktif */}
        <div className="bg-surface-white border-2 border-[#171717] p-5 shadow-[4px_4px_0px_#171717] relative">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-ink-muted uppercase tracking-wider font-bold">
              METRIC // 03
            </span>
            <span className="font-mono text-[10px] font-bold bg-accent-canary px-2 py-0.5 border border-[#171717] text-[#171717]">
              UMUM / DASAR
            </span>
          </div>
          <div className="mt-3">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-[#171717] leading-none">
              {loading ? "..." : stats.nonPhysicsActiveUsers}
            </div>
            <p className="text-xs font-bold text-[#171717] mt-1.5">
              Mahasiswa Non-Fisika
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#171717]/20 flex justify-between font-mono text-[10px] text-ink-muted">
            <span>KURIKULUM UMUM TPB</span>
            <span className="font-bold text-[#171717]">AKTIF</span>
          </div>
        </div>

        {/* Metric 4: Total Akun Aktif */}
        <div className="bg-surface-white border-2 border-[#171717] p-5 shadow-[4px_4px_0px_#171717] relative">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-ink-muted uppercase tracking-wider font-bold">
              METRIC // 04
            </span>
            <span className="font-mono text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 border border-emerald-700">
              OPTIMAL
            </span>
          </div>
          <div className="mt-3">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-[#171717] leading-none">
              {loading ? "..." : stats.activeUsers}
            </div>
            <p className="text-xs font-bold text-[#171717] mt-1.5">
              Total Akun Berizin Aktif
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#171717]/20 flex justify-between font-mono text-[10px] text-ink-muted">
            <span>TOTAL TERDAFTAR:</span>
            <span className="font-bold text-[#171717]">{stats.totalUsers} SISWA</span>
          </div>
        </div>
      </div>

      {/* Quick Action Command Strip */}
      <div className="bg-canvas-paper border-2 border-[#171717] p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-[2px_2px_0px_#171717]">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#171717]" />
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#171717]">
            AKSI CEPAT OPERASIONAL:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/users"
            className="px-3 py-1.5 bg-accent-canary text-[#171717] border border-[#171717] font-mono text-xs font-bold shadow-[2px_2px_0px_#171717] hover:shadow-[1px_1px_0px_#171717] hover:translate-x-[1px] hover:translate-y-[1px] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Users className="w-3.5 h-3.5" />
            <span>+ Manajemen Siswa</span>
          </Link>

          <Link
            href="/admin/materials"
            className="px-3 py-1.5 bg-surface-white text-[#171717] border border-[#171717] font-mono text-xs font-bold shadow-[2px_2px_0px_#171717] hover:shadow-[1px_1px_0px_#171717] hover:translate-x-[1px] hover:translate-y-[1px] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>+ Buat Modul Baru</span>
          </Link>

          <Link
            href="/admin/questions"
            className="px-3 py-1.5 bg-surface-white text-[#171717] border border-[#171717] font-mono text-xs font-bold shadow-[2px_2px_0px_#171717] hover:shadow-[1px_1px_0px_#171717] hover:translate-x-[1px] hover:translate-y-[1px] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <FileQuestion className="w-3.5 h-3.5" />
            <span>+ Input Bank Soal</span>
          </Link>

          <Link
            href="/admin/tryouts"
            className="px-3 py-1.5 bg-surface-white text-[#171717] border border-[#171717] font-mono text-xs font-bold shadow-[2px_2px_0px_#171717] hover:shadow-[1px_1px_0px_#171717] hover:translate-x-[1px] hover:translate-y-[1px] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Timer className="w-3.5 h-3.5" />
            <span>+ Jadwalkan Tryout</span>
          </Link>
        </div>
      </div>

      {/* Two-Column Operational Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Antrean Verifikasi Pendaftaran Terbaru */}
        <div className="lg:col-span-7 bg-surface-white border-2 border-[#171717] p-5 sm:p-6 shadow-[4px_4px_0px_#171717]">
          <div className="flex items-center justify-between pb-3.5 border-b-2 border-[#171717] mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-accent-canary border border-[#171717]" />
                <h2 className="text-base sm:text-lg font-extrabold text-[#171717]">
                  Antrean Pendaftaran & Verifikasi Pembayaran
                </h2>
              </div>
              <p className="font-mono text-xs text-ink-muted mt-0.5">
                Pendaftar yang memerlukan persetujuan aktivasi akses platform
              </p>
            </div>

            <Link
              href="/admin/users"
              className="font-mono text-xs font-bold text-[#171717] hover:text-alert-rust flex items-center gap-1"
            >
              <span>LIHAT SEMUA</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center font-mono text-xs text-ink-muted animate-pulse">
              [MEMUAT DAFTAR PENDAFTARAN TERBARU...]
            </div>
          ) : recentRegistrations.length === 0 ? (
            <div className="p-8 text-center bg-canvas-paper border border-[#171717]">
              <div className="w-8 h-8 bg-accent-canary border border-[#171717] flex items-center justify-center mx-auto mb-2">
                <Check className="w-4 h-4 text-[#171717]" />
              </div>
              <p className="font-bold text-sm text-[#171717]">
                Semua Antrean Telah Diproses!
              </p>
              <p className="font-mono text-xs text-ink-muted mt-1">
                Tidak ada pembayaran yang sedang menunggu verifikasi manual saat ini.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentRegistrations.map((reg) => (
                <div
                  key={reg.id}
                  className="p-3.5 border border-[#171717] bg-canvas-paper hover:bg-surface-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-[#171717]">
                        {reg.name}
                      </span>
                      {reg.status === "PENDING" ? (
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-alert-rust text-white border border-[#171717]">
                          PENDING VERIFIKASI
                        </span>
                      ) : reg.status === "APPROVED" ? (
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-700">
                          DISETUJUI
                        </span>
                      ) : (
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-surface-white text-ink-muted border border-[#171717]">
                          {reg.status}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono text-ink-muted flex-wrap">
                      <span>{reg.email}</span>
                      <span>•</span>
                      <span className="font-bold text-[#171717]">
                        {reg.package_type || "Paket Ujian"}
                      </span>
                      {reg.billing_cycle && (
                        <>
                          <span>•</span>
                          <span>{reg.billing_cycle}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <Link
                      href="/admin/users"
                      className="px-2.5 py-1.5 bg-surface-white hover:bg-canvas-paper border border-[#171717] font-mono text-xs font-bold text-[#171717] transition-colors"
                    >
                      DETAIL
                    </Link>

                    {reg.status === "PENDING" && (
                      <button
                        type="button"
                        onClick={() => handleQuickApprove(reg.id)}
                        disabled={approvingId === reg.id}
                        className="px-3 py-1.5 bg-accent-canary hover:bg-[#FACC15] text-[#171717] font-mono text-xs font-bold border border-[#171717] shadow-[2px_2px_0px_#171717] hover:shadow-[1px_1px_0px_#171717] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1"
                      >
                        {approvingId === reg.id ? (
                          <span className="animate-spin">⌛</span>
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        <span>SETUJUI</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column (5 cols): Audit Log Sistem & Status Layanan */}
        <div className="lg:col-span-5 space-y-6">
          {/* Status Sistem & Bank Soal */}
          <div className="bg-surface-white border-2 border-[#171717] p-5 shadow-[4px_4px_0px_#171717]">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#171717] mb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-emerald-600 border border-[#171717]" />
                <h3 className="font-bold text-sm text-[#171717]">
                  Status Telemetri Platform
                </h3>
              </div>
              <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 border border-emerald-700">
                NORMAL
              </span>
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              <div className="flex items-center justify-between p-2 bg-canvas-paper border border-[#171717]/30">
                <span className="text-ink-muted">TOTAL BANK SOAL:</span>
                <span className="font-bold text-[#171717]">{stats.totalQuestions} Butir</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-canvas-paper border border-[#171717]/30">
                <span className="text-ink-muted">SIMULASI TRYOUT AKTIF:</span>
                <span className="font-bold text-[#171717]">{stats.totalTryouts} Paket</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-canvas-paper border border-[#171717]/30">
                <span className="text-ink-muted">MODUL LATIHAN MANDIRI:</span>
                <span className="font-bold text-[#171717]">{stats.totalPractices} Modul</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-canvas-paper border border-[#171717]/30">
                <span className="text-ink-muted">DATABASE LATENCY:</span>
                <span className="font-bold text-emerald-700">42 ms</span>
              </div>
            </div>
          </div>

          {/* Audit Ledger Events */}
          <div className="bg-surface-white border-2 border-[#171717] p-5 shadow-[4px_4px_0px_#171717]">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#171717] mb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-accent-canary border border-[#171717]" />
                <h3 className="font-bold text-sm text-[#171717]">
                  Audit Log Sistem
                </h3>
              </div>
              <span className="font-mono text-[10px] text-ink-muted font-bold">
                [REALTIME]
              </span>
            </div>

            <div className="space-y-2.5 font-mono text-[11px]">
              <div className="p-2 bg-canvas-paper border border-[#171717]/20 flex gap-2 items-start">
                <span className="text-ink-muted font-bold whitespace-nowrap">14:22</span>
                <div>
                  <span className="font-bold text-[#171717]">[ADMIN // MODUL]</span>
                  <p className="text-ink-muted mt-0.5">Silabus materi Mekanika Klasik diperbarui.</p>
                </div>
              </div>

              <div className="p-2 bg-canvas-paper border border-[#171717]/20 flex gap-2 items-start">
                <span className="text-ink-muted font-bold whitespace-nowrap">13:05</span>
                <div>
                  <span className="font-bold text-alert-rust">[SECURITY // AUTH]</span>
                  <p className="text-ink-muted mt-0.5">Sesi login administrator terverifikasi aman.</p>
                </div>
              </div>

              <div className="p-2 bg-canvas-paper border border-[#171717]/20 flex gap-2 items-start">
                <span className="text-ink-muted font-bold whitespace-nowrap">12:40</span>
                <div>
                  <span className="font-bold text-emerald-800">[PAYMENT // SETTLED]</span>
                  <p className="text-ink-muted mt-0.5">Verifikasi pembayaran pendaftaran paket berhasil.</p>
                </div>
              </div>

              <div className="p-2 bg-canvas-paper border border-[#171717]/20 flex gap-2 items-start">
                <span className="text-ink-muted font-bold whitespace-nowrap">11:15</span>
                <div>
                  <span className="font-bold text-[#171717]">[SYS // BACKUP]</span>
                  <p className="text-ink-muted mt-0.5">Snapshot data Supabase berkala tersinkronisasi.</p>
                </div>
              </div>
            </div>

            <Link
              href="/admin/statistics"
              className="mt-4 w-full py-2 bg-surface-white border border-[#171717] font-mono text-xs font-bold hover:bg-canvas-paper text-center block transition-colors"
            >
              LIHAT PENGATURAN & AUDIT SISTEM →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
