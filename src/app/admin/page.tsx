"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { toast } from "sonner"

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

  const fetchData = async () => {
    try {
      // 1. Fetch Stats
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
        setRecentRegistrations(paymentsList.slice(0, 5))
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
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleQuickApprove = async (id: string) => {
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

      toast.success("Pendaftaran berhasil disetujui & diaktivasi!")
      fetchData()
    } catch (err: any) {
      toast.error(err?.message || "Terjadi kesalahan.")
    }
  }

  return (
    <div className="space-y-8 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border-2 border-[#FFEED6] rounded-3xl p-6 sm:p-8 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#A5AF79]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#A5AF79]">
              Portal Administrator
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#827148] tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-sm text-[#827148]/70 font-medium mt-1">
            Pantau pendaftaran, verifikasi pembayaran, dan statistik pengguna platform.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/users"
            className="px-5 py-3 rounded-xl font-bold text-xs sm:text-sm bg-[#A5AF79] hover:bg-[#949e6a] text-white transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <div className="w-2 h-2 rounded-full bg-white" />
            <span>Manajemen Pengguna</span>
          </Link>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4 KEY OVERVIEW METRICS (grid-cols-1 md:grid-cols-4)       */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1: Total Pendaftar (Pending Approval) -> Highlight with #E8A07C */}
        <div className="bg-white border-2 border-[#FFEED6] hover:border-[#E8A07C] rounded-3xl p-6 shadow-xs relative overflow-hidden transition-all group">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#E8A07C]" />
          
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-2xl bg-[#E8A07C]/20 border border-[#E8A07C]/40 flex items-center justify-center">
              <div className="w-3.5 h-3.5 rounded-xs bg-[#E8A07C]" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#E8A07C] bg-[#E8A07C]/15 px-2.5 py-1 rounded-full border border-[#E8A07C]/30">
              Perlu Verifikasi
            </span>
          </div>

          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
            Pendaftar Menunggu
          </span>
          <div className="text-3xl sm:text-4xl font-extrabold text-[#827148] mt-1 tracking-tight">
            {loading ? "..." : stats.pendingVerifications}
          </div>
          <p className="text-xs text-[#827148]/60 font-medium mt-2">
            Pendaftar menunggu konfirmasi pembayaran
          </p>
        </div>

        {/* Metric 2: Mahasiswa Fisika Aktif */}
        <div className="bg-white border-2 border-[#FFEED6] hover:border-[#A5AF79] rounded-3xl p-6 shadow-xs relative overflow-hidden transition-all group">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#A5AF79]" />

          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-2xl bg-[#A5AF79]/20 border border-[#A5AF79]/40 flex items-center justify-center">
              <div className="w-3.5 h-3.5 rounded-xs bg-[#A5AF79]" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#827148] bg-[#A5AF79]/15 px-2.5 py-1 rounded-full">
              Dept. Fisika Smt 3
            </span>
          </div>

          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
            Mahasiswa Fisika
          </span>
          <div className="text-3xl sm:text-4xl font-extrabold text-[#827148] mt-1 tracking-tight">
            {loading ? "..." : stats.physicsActiveUsers}
          </div>
          <p className="text-xs text-[#827148]/60 font-medium mt-2">
            Terdaftar di kurikulum Fisika Smt 3
          </p>
        </div>

        {/* Metric 3: Mahasiswa Non-Fisika Aktif */}
        <div className="bg-white border-2 border-[#FFEED6] hover:border-[#827148] rounded-3xl p-6 shadow-xs relative overflow-hidden transition-all group">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#827148]/40" />

          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-2xl bg-[#827148]/15 border border-[#827148]/30 flex items-center justify-center">
              <div className="w-3.5 h-3.5 rounded-xs bg-[#827148]" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#827148] bg-[#FFEED6] px-2.5 py-1 rounded-full border border-[#827148]/20">
              Umum / Non-Fisika
            </span>
          </div>

          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
            Mahasiswa Non-Fisika
          </span>
          <div className="text-3xl sm:text-4xl font-extrabold text-[#827148] mt-1 tracking-tight">
            {loading ? "..." : stats.nonPhysicsActiveUsers}
          </div>
          <p className="text-xs text-[#827148]/60 font-medium mt-2">
            Terdaftar di kurikulum Umum / Dasar
          </p>
        </div>

        {/* Metric 4: Total Akun Aktif */}
        <div className="bg-white border-2 border-[#FFEED6] hover:border-[#A5AF79] rounded-3xl p-6 shadow-xs relative overflow-hidden transition-all group">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#A5AF79]" />

          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-2xl bg-[#A5AF79]/20 border border-[#A5AF79]/40 flex items-center justify-center">
              <div className="w-3.5 h-3.5 rounded-xs bg-[#A5AF79]" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-[#A5AF79] px-2.5 py-1 rounded-full shadow-2xs">
              Status: Aktif
            </span>
          </div>

          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
            Total Akun Aktif
          </span>
          <div className="text-3xl sm:text-4xl font-extrabold text-[#827148] mt-1 tracking-tight">
            {loading ? "..." : stats.activeUsers}
          </div>
          <p className="text-xs text-[#827148]/60 font-medium mt-2">
            Total akun berizin akses aktif
          </p>
        </div>
      </div>

      {/* ======================================================== */}
      {/* QUICK VERIFICATION TABLE & SHORTCUTS                    */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left 8 Cols: Quick Verification Queue */}
        <div className="lg:col-span-8 bg-white border-2 border-[#FFEED6] rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#FFEED6]">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#827148]">
                Antrean Pendaftaran Terbaru
              </h2>
              <p className="text-xs text-[#827148]/70 font-medium">
                Pendaftar yang memerlukan persetujuan dan aktivasi akses
              </p>
            </div>
            <Link
              href="/admin/users"
              className="text-xs font-bold text-[#A5AF79] hover:underline"
            >
              Lihat Semua &rarr;
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs font-bold text-[#827148]/60 animate-pulse">
              Memuat antrean pendaftaran...
            </div>
          ) : recentRegistrations.length === 0 ? (
            <div className="p-8 text-center bg-[#FFEED6]/20 rounded-2xl border border-[#FFEED6]">
              <div className="w-8 h-8 rounded-full bg-[#A5AF79]/20 flex items-center justify-center mx-auto mb-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#A5AF79]" />
              </div>
              <p className="text-sm font-bold text-[#827148]">
                Semua pendaftaran telah diproses!
              </p>
              <p className="text-xs text-[#827148]/70 mt-1">
                Tidak ada pembayaran yang sedang menunggu verifikasi saat ini.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentRegistrations.map((reg) => (
                <div
                  key={reg.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-[#FFEED6] hover:bg-[#FFEED6]/20 transition-all bg-white"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#827148]">
                        {reg.name}
                      </span>
                      {reg.status === "PENDING" ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8A07C]/20 border border-[#E8A07C] text-[#E8A07C]">
                          Menunggu
                        </span>
                      ) : reg.status === "APPROVED" ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#A5AF79]/20 border border-[#A5AF79] text-[#827148]">
                          Disetujui
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                          {reg.status}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#827148]/70">
                      <span>{reg.email}</span>
                      <span>•</span>
                      <span className="font-semibold text-[#827148]">
                        {reg.package_type || "UTS Package"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <Link
                      href="/admin/users"
                      className="px-3 py-1.5 rounded-xl border border-[#FFEED6] hover:border-[#827148] text-xs font-bold text-[#827148] bg-white transition-colors"
                    >
                      Detail
                    </Link>
                    {reg.status === "PENDING" && (
                      <button
                        type="button"
                        onClick={() => handleQuickApprove(reg.id)}
                        className="px-3 py-1.5 rounded-xl bg-[#A5AF79] hover:bg-[#949e6a] text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                      >
                        Setujui
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 4 Cols: Quick Administrative Shortcuts */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Actions Card */}
          <div className="bg-white border-2 border-[#FFEED6] rounded-3xl p-6 shadow-xs">
            <h3 className="text-base font-extrabold text-[#827148] mb-4 pb-2 border-b border-[#FFEED6]">
              Aksi Cepat
            </h3>

            <div className="space-y-3">
              <Link
                href="/admin/users"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FFEED6]/30 hover:bg-[#FFEED6]/60 border border-[#FFEED6] transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#A5AF79]/20 flex items-center justify-center border border-[#A5AF79]/30">
                    <div className="w-2.5 h-2.5 rounded-xs bg-[#A5AF79]" />
                  </div>
                  <span className="text-xs font-bold text-[#827148]">
                    Manajemen Pengguna
                  </span>
                </div>
                <span className="text-xs font-bold text-[#A5AF79] group-hover:translate-x-0.5 transition-transform">
                  &rarr;
                </span>
              </Link>

              <Link
                href="/admin/users"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FFEED6]/30 hover:bg-[#FFEED6]/60 border border-[#FFEED6] transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#A5AF79]/20 flex items-center justify-center border border-[#A5AF79]/30">
                    <div className="w-2.5 h-2.5 rounded-xs bg-[#A5AF79]" />
                  </div>
                  <span className="text-xs font-bold text-[#827148]">
                    Manajemen Pengguna
                  </span>
                </div>
                <span className="text-xs font-bold text-[#A5AF79] group-hover:translate-x-0.5 transition-transform">
                  &rarr;
                </span>
              </Link>

              <Link
                href="/admin/questions"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FFEED6]/30 hover:bg-[#FFEED6]/60 border border-[#FFEED6] transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#827148]/20 flex items-center justify-center border border-[#827148]/30">
                    <div className="w-2.5 h-2.5 rounded-xs bg-[#827148]" />
                  </div>
                  <span className="text-xs font-bold text-[#827148]">
                    Kelola Bank Soal
                  </span>
                </div>
                <span className="text-xs font-bold text-[#A5AF79] group-hover:translate-x-0.5 transition-transform">
                  &rarr;
                </span>
              </Link>

              <Link
                href="/admin/tryouts"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FFEED6]/30 hover:bg-[#FFEED6]/60 border border-[#FFEED6] transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#E8A07C]/20 flex items-center justify-center border border-[#E8A07C]/30">
                    <div className="w-2.5 h-2.5 rounded-xs bg-[#E8A07C]" />
                  </div>
                  <span className="text-xs font-bold text-[#827148]">
                    Simulasi Tryout
                  </span>
                </div>
                <span className="text-xs font-bold text-[#A5AF79] group-hover:translate-x-0.5 transition-transform">
                  &rarr;
                </span>
              </Link>
            </div>
          </div>

          {/* System Summary Card */}
          <div className="bg-[#A5AF79]/10 border-2 border-[#A5AF79]/20 rounded-3xl p-6 shadow-2xs">
            <h3 className="text-sm font-extrabold text-[#827148] mb-3">
              Status Sistem & Konten
            </h3>
            <div className="space-y-2.5 text-xs text-[#827148]/80 font-medium">
              <div className="flex items-center justify-between">
                <span>Total Bank Soal:</span>
                <span className="font-bold text-[#827148]">{stats.totalQuestions} Soal</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Tryout Aktif:</span>
                <span className="font-bold text-[#827148]">{stats.totalTryouts} Paket</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Latihan Mandiri:</span>
                <span className="font-bold text-[#827148]">{stats.totalPractices} Modul</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
