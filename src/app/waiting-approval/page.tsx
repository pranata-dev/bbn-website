"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface UserProfile {
  name: string
  email: string
  student_category?: string
  package_type?: string
  billing_cycle?: string
  is_active: boolean
}

export default function WaitingApprovalPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)

  const fetchStatus = async (showToast = false) => {
    setChecking(true)
    try {
      const supabase = createClient()
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        router.push("/login")
        return
      }

      const { data, error } = await supabase
        .from("users")
        .select("name, full_name, email, student_category, package_type, billing_cycle, is_active")
        .eq("auth_id", authUser.id)
        .maybeSingle()

      if (error) {
        console.error("Fetch profile error:", error)
      }

      const name =
        data?.name ||
        data?.full_name ||
        authUser.user_metadata?.full_name ||
        authUser.user_metadata?.name ||
        authUser.email?.split("@")[0] ||
        "Pelajar"

      const isActive = data?.is_active ?? false

      setProfile({
        name,
        email: data?.email || authUser.email || "",
        student_category: data?.student_category || "PHYSICS_SEM_3",
        package_type: data?.package_type || "EINSTEIN",
        billing_cycle: data?.billing_cycle || "SEMESTER",
        is_active: isActive,
      })

      if (isActive) {
        toast.success("Akun kamu sudah aktif! Mengalihkan ke dashboard...")
        router.push("/dashboard")
        router.refresh()
        return
      }

      if (showToast) {
        toast.info("Status akun kamu masih dalam antrean verifikasi admin.")
      }
    } catch (err) {
      console.error("Status check error:", err)
      if (showToast) {
        toast.error("Gagal memeriksa status. Silakan coba beberapa saat lagi.")
      }
    } finally {
      setLoading(false)
      setChecking(false)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      toast.success("Berhasil keluar.")
      router.push("/login")
      router.refresh()
    } catch (err) {
      console.error("Logout error:", err)
    }
  }

  const formatPackageName = (pkg?: string, cycle?: string) => {
    if (!pkg) return "Einstein Mode - Semester Pass"
    const pkgUpper = pkg.toUpperCase()
    let name = pkg
    if (pkgUpper.includes("EINSTEIN")) name = "Einstein Mode"
    else if (pkgUpper.includes("SENKU")) name = "Berotak Senku"
    else if (pkgUpper.includes("FLUX")) name = "Flux Session"
    else if (pkgUpper.includes("REGULER")) name = "Kelas Reguler"

    const cycleText = cycle?.toUpperCase().includes("SEMESTER")
      ? "Semester Pass"
      : "Bulanan"

    return `${name} (${cycleText})`
  }

  return (
    <div className="min-h-screen bg-[#FFEED6]/20 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="max-w-lg w-full bg-white border-2 border-[#FFEED6] rounded-3xl p-6 sm:p-8 text-center shadow-sm relative">
        {/* Top Visual: Pulse Animated Circle Div */}
        <div className="w-16 h-16 rounded-full bg-[#E8A07C]/20 border-2 border-[#E8A07C] flex items-center justify-center mx-auto mb-5 shadow-2xs relative">
          <div className="w-6 h-6 rounded-full bg-[#E8A07C] animate-ping absolute opacity-75" />
          <div className="w-5 h-5 rounded-full bg-[#E8A07C] relative z-10" />
        </div>

        {/* Title & Description */}
        <h1 className="text-2xl sm:text-3xl font-bold text-[#827148] mb-3 tracking-tight">
          Pembayaran Sedang Diverifikasi
        </h1>
        <p className="text-xs sm:text-sm text-[#827148]/75 font-medium leading-relaxed mb-6">
          Terima kasih! Bukti transfer kamu sedang dalam proses pengecekan oleh tim admin kami (Maksimal 1x24 jam).
        </p>

        {/* Order Summary Box */}
        <div className="bg-[#FFEED6]/30 border border-[#FFEED6] rounded-2xl p-5 mb-6 text-left space-y-3">
          {loading ? (
            <div className="space-y-2 py-4 text-center">
              <div className="w-4 h-4 rounded-full bg-[#E8A07C] animate-pulse mx-auto mb-2" />
              <p className="text-xs font-bold text-[#827148]/60">
                Memuat data pendaftaran...
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-xs pb-2 border-b border-[#FFEED6]/60">
                <span className="text-[#827148]/70 font-semibold">Nama:</span>
                <span className="font-bold text-[#827148]">{profile?.name}</span>
              </div>

              <div className="flex items-center justify-between text-xs pb-2 border-b border-[#FFEED6]/60">
                <span className="text-[#827148]/70 font-semibold">Email:</span>
                <span className="font-bold text-[#827148] truncate max-w-[200px]">
                  {profile?.email}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pb-2 border-b border-[#FFEED6]/60">
                <span className="text-[#827148]/70 font-semibold">Kurikulum:</span>
                <span className="font-bold text-[#827148]">
                  {profile?.student_category === "PHYSICS_SEM_3"
                    ? "Departemen Fisika Semester 3"
                    : "Umum / Non-Fisika"}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pb-2 border-b border-[#FFEED6]/60">
                <span className="text-[#827148]/70 font-semibold">Paket Belajar:</span>
                <span className="font-bold text-[#827148]">
                  {formatPackageName(profile?.package_type, profile?.billing_cycle)}
                </span>
              </div>

              {/* Status Row */}
              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-[#827148]/70 font-semibold">Status Akun:</span>
                <span className="text-[#E8A07C] font-extrabold uppercase tracking-wide flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#E8A07C] animate-pulse" />
                  <span>MENUNGGU PERSETUJUAN</span>
                </span>
              </div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Cek Status Ulang */}
          <button
            type="button"
            disabled={checking}
            onClick={() => fetchStatus(true)}
            className="w-full bg-[#A5AF79] hover:bg-[#949e6a] text-white font-bold rounded-xl py-3.5 px-4 text-sm sm:text-base shadow-2xs transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {checking ? (
              <>
                <div className="w-2 h-2 rounded-full bg-white animate-ping" />
                <span>Memeriksa Status...</span>
              </>
            ) : (
              "Cek Status Ulang"
            )}
          </button>

          {/* Hubungi Admin via WhatsApp */}
          <a
            href={`https://wa.me/6281318464972?text=${encodeURIComponent(
              `Halo Admin Belajar Bareng Nata, saya ingin menanyakan status verifikasi pendaftaran untuk akun ${profile?.email || ""}.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-white hover:bg-gray-50 border-2 border-[#FFEED6] text-[#827148] font-bold rounded-xl py-3.5 px-4 text-sm sm:text-base shadow-2xs transition-all block text-center cursor-pointer"
          >
            Hubungi Admin via WhatsApp
          </a>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="text-xs font-semibold text-[#827148]/70 hover:text-[#827148] hover:underline cursor-pointer pt-2 inline-block"
          >
            Keluar / Logout
          </button>
        </div>
      </div>
    </div>
  )
}
