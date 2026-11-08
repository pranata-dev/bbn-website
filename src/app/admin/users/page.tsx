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
import {
  Search,
  Filter,
  UserCheck,
  UserX,
  Trash2,
  Sliders,
  Eye,
  RefreshCw,
  Terminal,
  AlertTriangle,
  ExternalLink,
  ShieldAlert,
} from "lucide-react"

interface UserItem {
  id: string
  auth_id: string
  name: string
  email: string
  is_active: boolean
  role?: string
  created_at: string
  subscriptions?: any[]
  active_subscription?: any | null
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
    setLoading(true)
    try {
      const res = await fetch("/api/admin/users")
      const data = await res.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error("Failed to fetch users:", error)
      toast.error("Gagal memuat daftar pengguna platform.")
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

      const userTrack = u.active_subscription?.track || "PHYSICS_SEM_3"
      const matchesCategory =
        categoryFilter === "ALL" ||
        userTrack === categoryFilter

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

      if (!res.ok) throw new Error("Gagal memperbarui status hak akses")
      toast.success(
        currentStatus ? "Hak akses pengguna dinonaktifkan." : "Pengguna berhasil diaktifkan!"
      )
      fetchUsers()
    } catch (error) {
      toast.error("Gagal mengubah status akses akun.")
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
      toast.success(`Pengguna ${deletingUser.name} telah dihapus permanen.`)
      setDeletingUser(null)
      fetchUsers()
    } catch (error: any) {
      toast.error(error?.message || "Terjadi kesalahan saat menghapus pengguna.")
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
          track: selectedTrack,
          plan_code: selectedPlan,
        }),
      })

      if (!res.ok) throw new Error("Gagal memperbarui hak akses")
      toast.success("Hak akses dan paket kurikulum pengguna berhasil disimpan.")
      setManagingUser(null)
      fetchUsers()
    } catch (error: any) {
      toast.error(error?.message || "Gagal menyimpan perubahan hak akses.")
    } finally {
      setIsSaving(false)
    }
  }

  const resetFilters = () => {
    setSearchQuery("")
    setStatusFilter("ALL")
    setCategoryFilter("ALL")
  }

  const activeCount = users.filter((u) => u.is_active).length
  const onlineCount = users.filter(
    (u) => onlineUserIds.includes(u.id) || onlineUserIds.includes(u.auth_id)
  ).length

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Page Header Box ("System Registry") */}
      <div className="bg-surface-white border-2 border-[#171717] p-6 sm:p-8 shadow-[6px_6px_0px_#171717] relative">
        {/* Corner Accents */}
        <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-[#171717]" />
        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#171717]" />
        <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-[#171717]" />
        <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-[#171717]" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2.5 h-2.5 bg-accent-canary border border-[#171717] inline-block" />
              <span className="font-mono text-xs font-bold text-alert-rust uppercase tracking-wider">
                [SYS.ADMIN_02] // REGISTRY_DATA_SISWA
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171717] tracking-tight">
              Manajemen Pengguna
            </h1>
            <p className="text-xs sm:text-sm text-ink-muted mt-1 max-w-2xl">
              Direktori registri akun siswa: audit verifikasi berkas transfer, aktivasi lisensi pengerjaan, dan pengaturan jalur kurikulum.
            </p>
          </div>

          {/* Rigid Telemetry Stats Blocks */}
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
            <div className="bg-[#171717] text-surface-white px-3.5 py-2 border-2 border-[#171717] font-mono text-xs shadow-[2px_2px_0px_#171717]">
              <span className="text-ink-muted block text-[10px] uppercase font-bold">TOTAL REGISTRI</span>
              <span className="text-accent-canary font-extrabold text-base leading-none">
                {users.length} <span className="text-[10px] font-normal text-surface-white">AKUN</span>
              </span>
            </div>

            <div className="bg-[#171717] text-surface-white px-3.5 py-2 border-2 border-[#171717] font-mono text-xs shadow-[2px_2px_0px_#171717]">
              <span className="text-ink-muted block text-[10px] uppercase font-bold">STATUS AKTIF</span>
              <span className="text-emerald-400 font-extrabold text-base leading-none">
                {activeCount} <span className="text-[10px] font-normal text-surface-white">SISWA</span>
              </span>
            </div>

            <div className="bg-[#171717] text-surface-white px-3.5 py-2 border-2 border-[#171717] font-mono text-xs shadow-[2px_2px_0px_#171717]">
              <span className="text-ink-muted block text-[10px] uppercase font-bold">LIVE TELEMETRI</span>
              <span className="text-accent-canary font-extrabold text-base leading-none flex items-center gap-1.5">
                <span className="w-2 h-2 bg-emerald-500 border border-[#171717] inline-block animate-ping" />
                {onlineCount} <span className="text-[10px] font-normal text-surface-white">ONLINE</span>
              </span>
            </div>

            <button
              type="button"
              onClick={fetchUsers}
              disabled={loading}
              className="p-2.5 bg-surface-white hover:bg-canvas-paper border-2 border-[#171717] text-[#171717] shadow-[2px_2px_0px_#171717] hover:shadow-[1px_1px_0px_#171717] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer disabled:opacity-50"
              title="Sinkronisasi Data Pengguna"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Filter Controls (Pencarian, Status, Kurikulum) */}
      <div className="bg-surface-white border-2 border-[#171717] p-5 shadow-[4px_4px_0px_#171717] space-y-3">
        <div className="flex items-center justify-between border-b border-[#171717]/20 pb-2.5">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#171717]" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#171717]">
              KONTROL FILTER REGISTRY
            </span>
          </div>
          <span className="font-mono text-[11px] text-ink-muted">
            MENAMPILKAN {filteredUsers.length} DARI {users.length} DATA
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
          {/* Search Query Input */}
          <div className="sm:col-span-6">
            <label className="font-mono text-[10px] sm:text-xs font-bold text-[#171717] uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>[01] PENCARIAN MAHASISWA</span>
              <Search className="w-3 h-3 text-ink-muted" />
            </label>
            <input
              type="text"
              placeholder="Cari nama lengkap, alamat email, atau ID siswa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-canvas-paper border-2 border-[#171717] rounded-none px-3.5 py-2.5 text-xs font-mono text-[#171717] placeholder:text-ink-muted/50 focus:outline-none focus:ring-0 focus:border-alert-rust focus:bg-surface-white transition-colors"
            />
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-3">
            <label className="font-mono text-[10px] sm:text-xs font-bold text-[#171717] uppercase tracking-wider mb-1.5 block">
              [02] STATUS HAK AKSES
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-canvas-paper border-2 border-[#171717] rounded-none px-3 py-2.5 text-xs font-mono font-bold text-[#171717] focus:outline-none focus:ring-0 focus:border-alert-rust focus:bg-surface-white cursor-pointer transition-colors"
            >
              <option value="ALL">SEMUA STATUS</option>
              <option value="ACTIVE">AKTIF (ACTIVE)</option>
              <option value="INACTIVE">NONAKTIF (INACTIVE)</option>
            </select>
          </div>

          {/* Curriculum Category Filter */}
          <div className="sm:col-span-3">
            <label className="font-mono text-[10px] sm:text-xs font-bold text-[#171717] uppercase tracking-wider mb-1.5 block">
              [03] JALUR KURIKULUM
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-canvas-paper border-2 border-[#171717] rounded-none px-3 py-2.5 text-xs font-mono font-bold text-[#171717] focus:outline-none focus:ring-0 focus:border-alert-rust focus:bg-surface-white cursor-pointer transition-colors"
            >
              <option value="ALL">SEMUA KURIKULUM</option>
              <option value="PHYSICS_SEM_3">DEPT. FISIKA SMT 3</option>
              <option value="NON_PHYSICS">UMUM / NON-FISIKA</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Data Table (Spreadsheet Grid) */}
      <div className="bg-surface-white border-2 border-[#171717] shadow-[6px_6px_0px_#171717] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#171717] text-surface-white font-mono text-[11px] uppercase tracking-wider border-b-2 border-[#171717]">
                <th className="py-3 px-4 border-r border-surface-white/20">
                  [COL_01] MAHASISWA / AKUN
                </th>
                <th className="py-3 px-4 border-r border-surface-white/20">
                  [COL_02] KURIKULUM & PAKET
                </th>
                <th className="py-3 px-4 border-r border-surface-white/20">
                  [COL_03] STATUS AKSES
                </th>
                <th className="py-3 px-4 border-r border-surface-white/20">
                  [COL_04] BUKTI TRANSFER
                </th>
                <th className="py-3 px-4 border-r border-surface-white/20">
                  [COL_05] TELEMETRI
                </th>
                <th className="py-3 px-4 text-right">
                  [COL_06] AKSI KONTROL
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#171717] text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center bg-canvas-paper">
                    <div className="font-mono text-xs font-bold text-ink-muted animate-pulse">
                      &gt; QUERYING_DATABASE: SEDANG MEMUAT DIREKTORI DATA SISWA...
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8">
                    {/* 4. Empty State (Zero Results Terminal Block) */}
                    <div className="bg-grid-blueprint border-2 border-dashed border-[#171717] bg-surface-white p-10 text-center">
                      <div className="w-10 h-10 bg-[#171717] text-accent-canary flex items-center justify-center mx-auto mb-3 border border-[#171717]">
                        <Terminal className="w-5 h-5" />
                      </div>
                      <p className="font-mono text-xs sm:text-sm font-bold text-[#171717]">
                        &gt; QUERY_RESULT: EMPTY // TIDAK ADA PENGGUNA YANG SESUAI FILTER
                      </p>
                      <p className="font-mono text-[11px] text-ink-muted mt-1">
                        {`[PARAM_QUERY: "${searchQuery || "*"}" | STATUS: "${statusFilter}" | TRACK: "${categoryFilter}"]`}
                      </p>
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="mt-4 px-4 py-2 bg-accent-canary text-[#171717] font-mono text-xs font-bold border-2 border-[#171717] shadow-[2px_2px_0px_#171717] hover:bg-[#FACC15] cursor-pointer"
                      >
                        [RESET FILTER PARAMETERS]
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isOnline =
                    onlineUserIds.includes(u.id) || onlineUserIds.includes(u.auth_id)
                  const proofUrl =
                    u.payment_proof_url || u.registrations?.[0]?.payment_proof_url

                  return (
                    <tr
                      key={u.id}
                      className="bg-surface-white hover:bg-accent-canary/20 transition-colors"
                    >
                      {/* 1. Mahasiswa Info */}
                      <td className="py-3.5 px-4 border-r border-[#171717]/20">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 bg-[#171717] text-accent-canary flex items-center justify-center text-xs font-mono font-bold border border-[#171717] shrink-0">
                            {u.name?.charAt(0).toUpperCase() || "S"}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-[#171717] truncate leading-tight">
                              {u.name}
                            </div>
                            <div className="font-mono text-[11px] text-ink-muted truncate mt-0.5">
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Kurikulum & Paket */}
                      <td className="py-3.5 px-4 border-r border-[#171717]/20 space-y-1">
                        <div>
                          {u.active_subscription?.track === "NON_PHYSICS" ? (
                            <span className="font-mono text-[10px] font-bold px-2 py-0.5 border border-[#171717] bg-canvas-paper text-[#171717]">
                              UMUM / NON-FISIKA
                            </span>
                          ) : u.active_subscription?.track === "ALL" ? (
                            <span className="font-mono text-[10px] font-bold px-2 py-0.5 border border-[#171717] bg-purple-100 text-purple-900">
                              SEMUA JALUR (ALL)
                            </span>
                          ) : (
                            <span className="font-mono text-[10px] font-bold px-2 py-0.5 border border-[#171717] bg-accent-canary text-[#171717]">
                              DEPT. FISIKA SMT 3
                            </span>
                          )}
                        </div>
                        <div>
                          {u.active_subscription?.plan_code === "SEMESTER" ? (
                            <span className="font-mono text-[9px] font-bold px-1.5 py-0.2 border border-[#171717] bg-emerald-100 text-emerald-900">
                              PAKET SEMESTER (180D)
                            </span>
                          ) : u.active_subscription?.plan_code === "MONTHLY" ? (
                            <span className="font-mono text-[9px] font-bold px-1.5 py-0.2 border border-[#171717] bg-blue-100 text-blue-900">
                              PAKET BULANAN (30D)
                            </span>
                          ) : (
                            <span className="font-mono text-[9px] font-bold px-1.5 py-0.2 border border-[#171717] bg-canvas-paper text-ink-muted">
                              FREE TIER
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 3. Status Akses */}
                      <td className="py-3.5 px-4 border-r border-[#171717]/20">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(u.id, u.is_active)}
                          className={`font-mono text-[10px] font-bold px-2.5 py-1 border border-[#171717] shadow-[2px_2px_0px_#171717] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#171717] transition-all inline-flex items-center gap-1.5 cursor-pointer uppercase ${
                            u.is_active
                              ? "bg-emerald-700 text-surface-white hover:bg-emerald-800"
                              : "bg-canvas-paper text-ink-muted hover:bg-surface-white"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 ${
                              u.is_active ? "bg-accent-canary" : "bg-gray-400"
                            }`}
                          />
                          <span>{u.is_active ? "AKTIF" : "NONAKTIF"}</span>
                        </button>
                      </td>

                      {/* 4. Bukti Transfer */}
                      <td className="py-3.5 px-4 border-r border-[#171717]/20">
                        {proofUrl ? (
                          <button
                            type="button"
                            onClick={() => setViewingProofUser(u)}
                            className="bg-surface-white border-2 border-[#171717] text-[#171717] hover:bg-accent-canary font-mono text-[10px] font-bold px-2.5 py-1 shadow-[2px_2px_0px_#171717] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#171717] transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <Eye className="w-3 h-3" />
                            <span>LIHAT BUKTI</span>
                          </button>
                        ) : (
                          <span className="font-mono text-[11px] text-ink-muted">
                            [TIDAK ADA BERKAS]
                          </span>
                        )}
                      </td>

                      {/* 5. Online Indicator */}
                      <td className="py-3.5 px-4 border-r border-[#171717]/20">
                        <div className="flex items-center gap-1.5 font-mono text-[11px]">
                          <span
                            className={`w-2 h-2 border border-[#171717] ${
                              isOnline ? "bg-emerald-500 animate-pulse" : "bg-gray-400"
                            }`}
                          />
                          <span
                            className={`font-bold ${
                              isOnline ? "text-emerald-800" : "text-ink-muted"
                            }`}
                          >
                            {isOnline ? "ONLINE" : "OFFLINE"}
                          </span>
                        </div>
                      </td>

                      {/* 6. Aksi */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setManagingUser(u)
                              const track =
                                u.active_subscription?.track || "PHYSICS_SEM_3"
                              setSelectedCategory(track)
                              setSelectedTrack(track)
                              setSelectedPlan(
                                u.active_subscription?.plan_code || "FREE"
                              )
                            }}
                            className="px-2.5 py-1 bg-surface-white hover:bg-accent-canary border-2 border-[#171717] font-mono text-xs font-bold text-[#171717] shadow-[2px_2px_0px_#171717] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#171717] transition-all cursor-pointer flex items-center gap-1"
                          >
                            <Sliders className="w-3 h-3" />
                            <span>KELOLA AKSES</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeletingUser(u)}
                            className="px-2.5 py-1 bg-surface-white hover:bg-alert-rust hover:text-white border-2 border-[#171717] font-mono text-xs font-bold text-alert-rust shadow-[2px_2px_0px_#171717] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#171717] transition-all cursor-pointer flex items-center gap-1"
                            title="Hapus Akun Pengguna"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>HAPUS</span>
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
      {/* 5. VIEW PAYMENT PROOF MODAL                              */}
      {/* ======================================================== */}
      <Dialog
        open={!!viewingProofUser}
        onOpenChange={(open) => {
          if (!open) setViewingProofUser(null)
        }}
      >
        <DialogContent className="max-w-xl bg-surface-white border-2 border-[#171717] rounded-none p-6 sm:p-8 shadow-[8px_8px_0px_#171717] font-sans relative">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 bg-accent-canary border border-[#171717] inline-block" />
              <span className="font-mono text-xs font-bold text-alert-rust uppercase">
                [MODAL // PROOF_VERIFICATION]
              </span>
            </div>
            <DialogTitle className="text-lg sm:text-xl font-extrabold text-[#171717] tracking-tight">
              Bukti Transfer // {viewingProofUser?.name}
            </DialogTitle>
            <DialogDescription className="font-mono text-xs text-ink-muted">
              Audit bukti pembayaran pendaftaran mahasiswa: {viewingProofUser?.email}
            </DialogDescription>
          </DialogHeader>

          <div className="my-4 flex items-center justify-center bg-canvas-paper p-3 border-2 border-[#171717]">
            {viewingProofUser?.payment_proof_url ||
            viewingProofUser?.registrations?.[0]?.payment_proof_url ? (
              <img
                src={
                  viewingProofUser.payment_proof_url ||
                  viewingProofUser.registrations?.[0]?.payment_proof_url
                }
                alt={`Bukti Transfer ${viewingProofUser.name}`}
                className="max-w-full h-auto max-h-[60vh] border border-[#171717] object-contain"
              />
            ) : (
              <div className="p-10 text-center font-mono text-xs font-bold text-ink-muted">
                [TIDAK DITEMUKAN BERKAS LAMPIRAN BUKTI PEMBAYARAN]
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#171717]">
            <button
              type="button"
              onClick={() => {
                if (viewingProofUser) {
                  handleToggleActive(viewingProofUser.id, viewingProofUser.is_active)
                  setViewingProofUser(null)
                }
              }}
              className={`w-full sm:w-auto py-2.5 px-4 font-mono text-xs font-bold border-2 border-[#171717] shadow-[2px_2px_0px_#171717] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#171717] transition-all cursor-pointer uppercase ${
                viewingProofUser?.is_active
                  ? "bg-canvas-paper text-[#171717] hover:bg-surface-white"
                  : "bg-accent-canary text-[#171717] hover:bg-[#FACC15]"
              }`}
            >
              {viewingProofUser?.is_active
                ? "NONAKTIFKAN HAK AKSES"
                : "AKTIVASI HAK AKSES SEKARANG"}
            </button>

            <button
              type="button"
              onClick={() => setViewingProofUser(null)}
              className="w-full sm:w-auto py-2.5 px-5 bg-surface-white border-2 border-[#171717] font-mono text-xs font-bold text-[#171717] hover:bg-canvas-paper shadow-[2px_2px_0px_#171717] cursor-pointer"
            >
              TUTUP MODAL
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ======================================================== */}
      {/* 6. MANAGE ACCESS MODAL                                   */}
      {/* ======================================================== */}
      <Dialog
        open={!!managingUser}
        onOpenChange={(open) => {
          if (!open) setManagingUser(null)
        }}
      >
        <DialogContent className="max-w-md bg-surface-white border-2 border-[#171717] rounded-none p-6 sm:p-8 shadow-[8px_8px_0px_#171717] font-sans relative">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 bg-accent-canary border border-[#171717] inline-block" />
              <span className="font-mono text-xs font-bold text-alert-rust uppercase">
                [MODAL // ACCESS_DISPATCH]
              </span>
            </div>
            <DialogTitle className="text-lg sm:text-xl font-extrabold text-[#171717] tracking-tight">
              Kelola Hak Akses Mahasiswa
            </DialogTitle>
            <DialogDescription className="font-mono text-xs text-ink-muted">
              Konfigurasi jalur kurikulum dan masa aktif untuk: <strong>{managingUser?.name}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-4">
            <div>
              <label className="font-mono text-xs font-bold text-[#171717] uppercase tracking-wider mb-1.5 block">
                [PARAM_01] JALUR KURIKULUM (TRACK)
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value)
                  setSelectedTrack(e.target.value)
                }}
                className="w-full bg-canvas-paper border-2 border-[#171717] rounded-none p-2.5 text-xs font-mono font-bold text-[#171717] focus:bg-surface-white focus:outline-none cursor-pointer"
              >
                <option value="PHYSICS_SEM_3">
                  Departemen Fisika Semester 3 (6 Mata Kuliah)
                </option>
                <option value="NON_PHYSICS">
                  Umum / Non-Fisika (4 Kursus Dasar TPB)
                </option>
                <option value="ALL">
                  Semua Jalur (Full Access Bundle)
                </option>
              </select>
            </div>

            <div>
              <label className="font-mono text-xs font-bold text-[#171717] uppercase tracking-wider mb-1.5 block">
                [PARAM_02] PAKET LISENSI LANGGANAN
              </label>
              <select
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
                className="w-full bg-canvas-paper border-2 border-[#171717] rounded-none p-2.5 text-xs font-mono font-bold text-[#171717] focus:bg-surface-white focus:outline-none cursor-pointer"
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

          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-[#171717]">
            <button
              type="button"
              onClick={() => setManagingUser(null)}
              className="py-2.5 px-4 bg-surface-white border-2 border-[#171717] font-mono text-xs font-bold text-[#171717] hover:bg-canvas-paper cursor-pointer"
            >
              BATAL
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveAccess}
              className="py-2.5 px-4 bg-accent-canary hover:bg-[#FACC15] text-[#171717] font-mono text-xs font-bold border-2 border-[#171717] shadow-[2px_2px_0px_#171717] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#171717] transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? "MENYIMPAN PERUBAHAN..." : "SIMPAN PERUBAHAN"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ======================================================== */}
      {/* 7. DELETE CONFIRMATION MODAL                             */}
      {/* ======================================================== */}
      <Dialog
        open={!!deletingUser}
        onOpenChange={(open) => {
          if (!open) setDeletingUser(null)
        }}
      >
        <DialogContent className="max-w-md bg-surface-white border-2 border-[#171717] rounded-none p-6 sm:p-8 shadow-[8px_8px_0px_#171717] font-sans relative">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 bg-alert-rust border border-[#171717] inline-block" />
              <span className="font-mono text-xs font-bold text-alert-rust uppercase">
                [MODAL // DELETION_CONFIRMATION]
              </span>
            </div>
            <DialogTitle className="text-lg sm:text-xl font-extrabold text-[#171717] tracking-tight">
              Hapus Akun Pengguna Secara Permanen?
            </DialogTitle>
            <DialogDescription className="font-mono text-xs text-ink-muted">
              Tindakan ini akan menghapus akun <strong>{deletingUser?.name}</strong> ({deletingUser?.email}) beserta seluruh riwayat pengerjaan dari basis data platform.
            </DialogDescription>
          </DialogHeader>

          <div className="my-3 p-3 bg-alert-rust/10 border-2 border-alert-rust flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-alert-rust shrink-0 mt-0.5" />
            <p className="font-mono text-xs text-alert-rust font-bold leading-snug">
              PERINGATAN: Tindakan ini bersifat destruktif dan tidak dapat dibatalkan.
            </p>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-[#171717]">
            <button
              type="button"
              onClick={() => setDeletingUser(null)}
              className="py-2.5 px-4 bg-surface-white border-2 border-[#171717] font-mono text-xs font-bold text-[#171717] hover:bg-canvas-paper cursor-pointer"
            >
              BATALKAN
            </button>
            <button
              type="button"
              onClick={handleDeleteUser}
              className="py-2.5 px-4 bg-alert-rust text-white font-mono text-xs font-bold border-2 border-[#171717] shadow-[2px_2px_0px_#171717] hover:bg-[#993A08] transition-all cursor-pointer"
            >
              KONFIRMASI HAPUS
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
