"use client"

import { useState, useEffect, useMemo } from "react"
import { useOnlineUsers } from "@/hooks/useOnlineUsers"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface UserItem {
  id: string
  auth_id: string
  name: string
  email: string
  student_category?: string
  package_type?: string
  billing_cycle?: string
  is_active: boolean
  created_at: string
  subject_access?: any[]
  registrations?: any[]
  payment_proof_url?: string | null
  registration_status?: string | null
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [categoryFilter, setCategoryFilter] = useState("ALL")

  // Modal States
  const [managingUser, setManagingUser] = useState<UserItem | null>(null)
  const [deletingUser, setDeletingUser] = useState<UserItem | null>(null)
  const [viewingProofUser, setViewingProofUser] = useState<UserItem | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("PHYSICS_SEM_3")
  const [selectedTrack, setSelectedTrack] = useState<string>("PHYSICS_SEM_3")
  const [selectedPlan, setSelectedPlan] = useState<string>("SEMESTER")
  const [isSaving, setIsSaving] = useState(false)

  const onlineUserIds = useOnlineUsers()

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users")
      const data = await res.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error("Failed to fetch users:", error)
      toast.error("Gagal memuat daftar pengguna.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const searchLower = searchQuery.toLowerCase()
      const matchesSearch =
        !searchQuery ||
        u.name?.toLowerCase().includes(searchLower) ||
        u.email?.toLowerCase().includes(searchLower)

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && u.is_active) ||
        (statusFilter === "INACTIVE" && !u.is_active)

      const matchesCategory =
        categoryFilter === "ALL" ||
        u.student_category === categoryFilter ||
        (!u.student_category && categoryFilter === "PHYSICS_SEM_3")

      return matchesSearch && matchesStatus && matchesCategory
    })
  }, [users, searchQuery, statusFilter, categoryFilter])

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isActive: !currentStatus }),
      })

      if (!res.ok) throw new Error("Gagal memperbarui status")
      toast.success(
        currentStatus ? "Pengguna dinonaktifkan." : "Pengguna berhasil diaktifkan!"
      )
      fetchUsers()
    } catch (error) {
      toast.error("Gagal mengubah status akses.")
    }
  }

  const handleDeleteUser = async () => {
    if (!deletingUser) return
    try {
      const res = await fetch(`/api/admin/users/${deletingUser.id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Gagal menghapus pengguna")
      }
      toast.success(`Pengguna ${deletingUser.name} telah dihapus.`)
      setDeletingUser(null)
      fetchUsers()
    } catch (error: any) {
      toast.error(error?.message || "Terjadi kesalahan saat menghapus.")
    }
  }

  const handleSaveAccess = async () => {
    if (!managingUser) return
    setIsSaving(true)
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: managingUser.id,
          student_category: selectedCategory,
          track: selectedTrack,
          plan_code: selectedPlan,
        }),
      })

      if (!res.ok) throw new Error("Gagal memperbarui hak akses")
      toast.success("Hak akses dan paket langganan pengguna berhasil diperbarui.")
      setManagingUser(null)
      fetchUsers()
    } catch (error: any) {
      toast.error(error?.message || "Gagal menyimpan perubahan.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-8 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border-2 border-[#FFEED6] rounded-3xl p-6 sm:p-8 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#827148]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#827148]">
              Manajemen Hak Akses, Profil & Pembayaran
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#827148] tracking-tight">
            Manajemen Pengguna
          </h1>
          <p className="text-sm text-[#827148]/70 font-medium mt-1">
            Pantau mahasiswa, verifikasi bukti transfer pembayaran, dan atur izin akses akun.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#FFEED6]/30 border border-[#FFEED6] px-4 py-2 rounded-2xl">
          <span className="text-xs font-bold text-[#827148]">
            Total Pengguna: {users.length}
          </span>
          <span className="text-xs text-[#827148]/40">•</span>
          <span className="text-xs font-bold text-[#A5AF79]">
            Aktif: {users.filter((u) => u.is_active).length}
          </span>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white border-2 border-[#FFEED6] rounded-3xl p-6 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-[#827148] mb-1.5 block">
              Pencarian Mahasiswa
            </label>
            <input
              type="text"
              placeholder="Nama atau email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border-2 border-[#FFEED6] focus:border-[#A5AF79] focus:outline-none text-xs font-medium text-[#827148] placeholder:text-[#827148]/40 px-3.5 py-2.5 rounded-xl shadow-2xs transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#827148] mb-1.5 block">
              Status Akun
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-white border-2 border-[#FFEED6] focus:border-[#A5AF79] focus:outline-none text-xs font-bold text-[#827148] px-3.5 py-2.5 rounded-xl shadow-2xs cursor-pointer transition-colors"
            >
              <option value="ALL">Semua Status</option>
              <option value="ACTIVE">Aktif (Active)</option>
              <option value="INACTIVE">Nonaktif (Inactive)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-[#827148] mb-1.5 block">
              Kategori Kurikulum
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-white border-2 border-[#FFEED6] focus:border-[#A5AF79] focus:outline-none text-xs font-bold text-[#827148] px-3.5 py-2.5 rounded-xl shadow-2xs cursor-pointer transition-colors"
            >
              <option value="ALL">Semua Kurikulum</option>
              <option value="PHYSICS_SEM_3">Dept. Fisika Smt 3</option>
              <option value="NON_PHYSICS">Umum / Non-Fisika</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border-2 border-[#FFEED6] rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FFEED6]/40 text-[#827148] font-bold text-xs uppercase tracking-wider border-b border-[#FFEED6]">
                <th className="py-4 px-5">Mahasiswa</th>
                <th className="py-4 px-5">Kurikulum</th>
                <th className="py-4 px-5">Status Akses</th>
                <th className="py-4 px-5">Bukti Transfer</th>
                <th className="py-4 px-5">Online</th>
                <th className="py-4 px-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FFEED6]/50 text-sm text-[#827148]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs font-bold text-[#827148]/60 animate-pulse">
                    Memuat daftar pengguna...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="w-8 h-8 rounded-full bg-[#FFEED6] flex items-center justify-center mx-auto mb-2 border border-[#827148]/15">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#827148]" />
                    </div>
                    <p className="text-xs font-bold text-[#827148]">
                      Tidak ada pengguna yang sesuai dengan filter.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isOnline = onlineUserIds.includes(u.id) || onlineUserIds.includes(u.auth_id)
                  const proofUrl = u.payment_proof_url || u.registrations?.[0]?.payment_proof_url

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-[#FFEED6]/15 transition-colors"
                    >
                      {/* 1. Mahasiswa Info */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#A5AF79] text-white flex items-center justify-center text-xs font-bold shadow-2xs shrink-0">
                            {u.name?.charAt(0).toUpperCase() || "P"}
                          </div>
                          <div>
                            <div className="font-extrabold text-[#827148] leading-snug">
                              {u.name}
                            </div>
                            <div className="text-xs text-[#827148]/70 mt-0.5">
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Kurikulum & Paket */}
                      <td className="py-4 px-5 space-y-1">
                        <div>
                          {u.student_category === "PHYSICS_SEM_3" || !u.student_category ? (
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#A5AF79]/15 text-[#827148] border border-[#A5AF79]/30">
                              Dept. Fisika Smt 3
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#FFEED6] text-[#827148] border border-[#827148]/20">
                              Umum / Non-Fisika
                            </span>
                          )}
                        </div>
                        <div>
                          {(u as any).active_subscription?.plan_code === "SEMESTER" ? (
                            <span className="text-[9px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                              SEMESTER
                            </span>
                          ) : (u as any).active_subscription?.plan_code === "MONTHLY" ? (
                            <span className="text-[9px] font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-300">
                              BULANAN
                            </span>
                          ) : (
                            <span className="text-[9px] font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">
                              FREE TIER
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 3. Status Akses */}
                      <td className="py-4 px-5">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(u.id, u.is_active)}
                          className={`text-xs px-3 py-1 rounded-full font-bold transition-all shadow-2xs inline-flex items-center gap-1.5 cursor-pointer ${
                            u.is_active
                              ? "bg-[#A5AF79]/20 border border-[#A5AF79] text-[#827148] hover:bg-[#A5AF79]/30"
                              : "bg-gray-100 border border-gray-300 text-gray-500 hover:bg-gray-200"
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              u.is_active ? "bg-[#A5AF79]" : "bg-gray-400"
                            }`}
                          />
                          <span>{u.is_active ? "Aktif" : "Nonaktif"}</span>
                        </button>
                      </td>

                      {/* 4. Bukti Transfer */}
                      <td className="py-4 px-5">
                        {proofUrl ? (
                          <button
                            type="button"
                            onClick={() => setViewingProofUser(u)}
                            className="bg-white border border-[#A5AF79] text-[#A5AF79] hover:bg-[#A5AF79]/10 text-xs px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer shadow-2xs"
                          >
                            Lihat Bukti
                          </button>
                        ) : (
                          <span className="text-xs text-[#827148]/50 font-medium">
                            Tidak ada bukti
                          </span>
                        )}
                      </td>

                      {/* 5. Online Indicator */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              isOnline ? "bg-emerald-500 animate-pulse" : "bg-gray-300"
                            }`}
                          />
                          <span className="text-xs font-semibold text-[#827148]/80">
                            {isOnline ? "Online" : "Offline"}
                          </span>
                        </div>
                      </td>

                      {/* 6. Aksi */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setManagingUser(u)
                              const cat = u.student_category || "PHYSICS_SEM_3"
                              setSelectedCategory(cat)
                              setSelectedTrack(cat)
                              setSelectedPlan((u as any).active_subscription?.plan_code || "FREE")
                            }}
                            className="px-3 py-1.5 rounded-xl border border-[#FFEED6] hover:border-[#827148] text-xs font-bold text-[#827148] bg-white transition-colors cursor-pointer"
                          >
                            Kelola Akses
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingUser(u)}
                            className="px-3 py-1.5 rounded-xl border border-[#E8A07C] text-[#E8A07C] hover:bg-[#E8A07C]/10 text-xs font-bold transition-colors cursor-pointer"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* VIEW PAYMENT PROOF MODAL                                 */}
      {/* ======================================================== */}
      <Dialog
        open={!!viewingProofUser}
        onOpenChange={(open) => {
          if (!open) setViewingProofUser(null)
        }}
      >
        <DialogContent className="max-w-lg bg-white border-2 border-[#FFEED6] rounded-3xl p-6 sm:p-8 shadow-lg font-sans">
          <DialogHeader>
            <div className="w-10 h-10 rounded-2xl bg-[#A5AF79]/20 flex items-center justify-center border border-[#A5AF79]/30 mb-2">
              <div className="w-3.5 h-3.5 rounded-xs bg-[#A5AF79]" />
            </div>
            <DialogTitle className="text-xl font-bold text-[#827148]">
              Bukti Transfer - {viewingProofUser?.name}
            </DialogTitle>
            <DialogDescription className="text-xs text-[#827148]/70">
              Bukti transfer pembayaran atas nama {viewingProofUser?.name} ({viewingProofUser?.email}).
            </DialogDescription>
          </DialogHeader>

          <div className="my-4 flex items-center justify-center bg-[#FFEED6]/20 p-2 rounded-2xl border border-[#FFEED6]">
            {viewingProofUser?.payment_proof_url || viewingProofUser?.registrations?.[0]?.payment_proof_url ? (
              <img
                src={viewingProofUser.payment_proof_url || viewingProofUser.registrations?.[0]?.payment_proof_url}
                alt={`Bukti Transfer ${viewingProofUser.name}`}
                className="max-w-full h-auto max-h-[65vh] rounded-xl border-2 border-[#FFEED6] object-contain shadow-xs"
              />
            ) : (
              <div className="p-8 text-center text-xs font-bold text-[#827148]/60">
                Tidak ada berkas bukti pembayaran.
              </div>
            )}
          </div>

          <DialogFooter className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                if (viewingProofUser) {
                  handleToggleActive(viewingProofUser.id, viewingProofUser.is_active)
                  setViewingProofUser(null)
                }
              }}
              className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs ${
                viewingProofUser?.is_active
                  ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  : "bg-[#A5AF79] hover:bg-[#949e6a] text-white"
              }`}
            >
              {viewingProofUser?.is_active ? "Nonaktifkan Akun" : "Aktivasi Akun Sekarang"}
            </button>
            <button
              type="button"
              onClick={() => setViewingProofUser(null)}
              className="py-2.5 px-5 rounded-xl border border-[#FFEED6] bg-[#FFEED6]/30 text-xs font-bold text-[#827148] hover:bg-[#FFEED6]/60 cursor-pointer"
            >
              Tutup
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ======================================================== */}
      {/* MANAGE ACCESS MODAL                                      */}
      {/* ======================================================== */}
      <Dialog
        open={!!managingUser}
        onOpenChange={(open) => {
          if (!open) setManagingUser(null)
        }}
      >
        <DialogContent className="max-w-md bg-white border-2 border-[#FFEED6] rounded-3xl p-6 sm:p-8 shadow-lg font-sans">
          <DialogHeader>
            <div className="w-10 h-10 rounded-2xl bg-[#827148]/20 flex items-center justify-center border border-[#827148]/30 mb-2">
              <div className="w-3.5 h-3.5 rounded-xs bg-[#827148]" />
            </div>
            <DialogTitle className="text-xl font-bold text-[#827148]">
              Kelola Hak Akses Pengguna
            </DialogTitle>
            <DialogDescription className="text-xs text-[#827148]/70">
              Atur kurikulum dan izin untuk <strong>{managingUser?.name}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2">
            <div>
              <label className="text-xs font-bold text-[#827148] mb-1.5 block">
                Jalur Kurikulum (Track)
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value)
                  setSelectedTrack(e.target.value)
                }}
                className="w-full bg-white border-2 border-[#FFEED6] focus:border-[#A5AF79] focus:outline-none text-xs font-bold text-[#827148] p-3 rounded-xl shadow-2xs cursor-pointer"
              >
                <option value="PHYSICS_SEM_3">
                  Departemen Fisika Semester 3 (All 6 Courses)
                </option>
                <option value="NON_PHYSICS">
                  Umum / Non-Fisika (4 General Courses)
                </option>
                <option value="ALL">
                  Semua Jalur (Full Access Bundle)
                </option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#827148] mb-1.5 block">
                Paket Langganan (Subscriptions)
              </label>
              <select
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
                className="w-full bg-white border-2 border-[#FFEED6] focus:border-[#A5AF79] focus:outline-none text-xs font-bold text-[#827148] p-3 rounded-xl shadow-2xs cursor-pointer"
              >
                <option value="FREE">
                  Paket Gratis (Free Preview Only)
                </option>
                <option value="MONTHLY">
                  Paket Bulanan (30 Hari Akses Penuh)
                </option>
                <option value="SEMESTER">
                  Paket Semester (180 Hari Akses Penuh)
                </option>
              </select>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={() => setManagingUser(null)}
              className="py-2.5 px-4 rounded-xl border border-[#FFEED6] text-xs font-bold text-[#827148] hover:bg-[#FFEED6]/40 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveAccess}
              className="py-2.5 px-4 rounded-xl bg-[#A5AF79] hover:bg-[#949e6a] text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
            >
              {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ======================================================== */}
      {/* DELETE CONFIRMATION MODAL                                */}
      {/* ======================================================== */}
      <Dialog
        open={!!deletingUser}
        onOpenChange={(open) => {
          if (!open) setDeletingUser(null)
        }}
      >
        <DialogContent className="max-w-md bg-white border-2 border-[#FFEED6] rounded-3xl p-6 sm:p-8 shadow-lg font-sans">
          <DialogHeader>
            <div className="w-10 h-10 rounded-2xl bg-[#E8A07C]/20 flex items-center justify-center border border-[#E8A07C]/30 mb-2">
              <div className="w-3.5 h-3.5 rounded-xs bg-[#E8A07C]" />
            </div>
            <DialogTitle className="text-xl font-bold text-[#827148]">
              Hapus Pengguna?
            </DialogTitle>
            <DialogDescription className="text-xs text-[#827148]/70">
              Tindakan ini akan menghapus akun <strong>{deletingUser?.name}</strong> secara permanen dari basis data.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={() => setDeletingUser(null)}
              className="py-2.5 px-4 rounded-xl border border-[#FFEED6] text-xs font-bold text-[#827148] hover:bg-[#FFEED6]/40 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleDeleteUser}
              className="py-2.5 px-4 rounded-xl bg-white border border-[#E8A07C] text-[#E8A07C] hover:bg-[#E8A07C]/10 text-xs font-bold transition-colors cursor-pointer"
            >
              Ya, Hapus Pengguna
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
