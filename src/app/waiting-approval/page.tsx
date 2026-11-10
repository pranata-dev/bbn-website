"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { BUSINESS_CONFIG } from "@/config/business"
import { toast } from "sonner"

interface SubscriptionRow {
  track?: string | null
  plan_code?: string | null
}

interface DbUserWithSubs {
  name?: string | null
  email?: string | null
  is_active?: boolean | null
  subscriptions?: SubscriptionRow[] | null
}

interface UserProfile {
  name: string
  email: string
  trackLabel: string
  planLabel: string
  is_active: boolean
}

export default function WaitingApprovalPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)

  const fetchStatus = useCallback(async (showToast = false) => {
    setChecking(true)
    try {
      const supabase = createClient()
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        // User registered manually without an active Google OAuth session
        setProfile({
          name: "Mahasiswa Terdaftar",
          email: "Menunggu Verifikasi Email",
          trackLabel: "Sesuai Formulir Pendaftaran",
          planLabel: "Paket Belajar BBN",
          is_active: false,
        })
        if (showToast) {
          toast.info("Silakan masuk ke akun Anda setelah admin memverifikasi pembayaran.")
        }
        return
      }

      const { data, error } = await supabase
        .from("users")
        .select("name, email, is_active, subscriptions(*)")
        .eq("auth_id", authUser.id)
        .maybeSingle()

      if (error) {
        console.error("Fetch profile error:", error)
      }

      const typedData = data as DbUserWithSubs | null

      const name =
        typedData?.name ||
        authUser.user_metadata?.full_name ||
        authUser.user_metadata?.name ||
        authUser.email?.split("@")[0] ||
        "Pelajar"

      const isActive = typedData?.is_active ?? false

      const subs = typedData?.subscriptions || []
      const latestSub = subs[0]
      const trackLabel =
        latestSub?.track === "NON_PHYSICS" ? "Umum / Non-Fisika" : "Departemen Fisika Semester 3"
      const planLabel =
        latestSub?.plan_code === "MONTHLY"
          ? "Paket Bulanan (30 Hari)"
          : latestSub?.plan_code === "SEMESTER"
          ? "Paket Semester (180 Hari)"
          : "Paket E-Learning"

      setProfile({
        name,
        email: typedData?.email || authUser.email || "",
        trackLabel,
        planLabel,
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
  }, [router])

  useEffect(() => {
    fetchStatus(false)

    // Auto-polling every 10 seconds for real-time activation experience
    const interval = setInterval(() => {
      fetchStatus(false)
    }, 10000)

    return () => clearInterval(interval)
  }, [fetchStatus])

  return (
    <div className="min-h-screen bg-[#FFEED6]/20 flex flex-col justify-center items-center px-4 py-12 font-sans">
      <div className="w-full max-w-md bg-white border-2 border-[#FFEED6] rounded-3xl p-8 sm:p-10 shadow-md text-center space-y-6 relative overflow-hidden">
        {/* Soft Background Accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFEED6]/50 rounded-bl-full pointer-events-none" />

        {/* Brand Header */}
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-[#FFEED6] flex items-center justify-center border border-[#827148]/20 mb-4 shadow-2xs">
            <div className="w-6 h-6 rounded-md bg-[#A5AF79]" />
          </div>
          <span className="text-xs font-bold text-[#827148]/60 uppercase tracking-wider">
            Portal Pembelajaran
          </span>
          <h1 className="text-2xl font-bold text-[#827148] mt-1">
            Belajar Bareng Nata
          </h1>
        </div>

        {/* Status Graphic & Title */}
        <div className="space-y-3 pt-2">
          <div className="inline-flex items-center gap-2 bg-[#FFEED6]/60 border border-[#FFEED6] text-[#827148] text-xs font-bold px-4 py-2 rounded-full shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#E8A07C] animate-ping" />
            <span>Verifikasi Pembayaran</span>
          </div>
          <h2 className="text-xl font-bold text-[#827148]">
            Menunggu Persetujuan Admin
          </h2>
          <p className="text-xs text-[#827148]/80 leading-relaxed max-w-xs mx-auto font-medium">
            Bukti transfer kamu sudah kami terima dan sedang diverifikasi oleh admin. Halaman ini akan otomatis dialihkan begitu akun kamu aktif.
          </p>
        </div>

        {/* User Card Summary */}
        <div className="bg-[#FFEED6]/20 border border-[#FFEED6] rounded-2xl p-4 text-left space-y-2">
          {loading ? (
            <div className="space-y-2 py-2">
              <div className="h-3 bg-[#FFEED6] rounded animate-pulse" />
              <div className="h-3 bg-[#FFEED6] rounded w-3/4 animate-pulse" />
              <div className="h-3 bg-[#FFEED6] rounded w-1/2 animate-pulse" />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-xs pb-2 border-b border-[#FFEED6]/60">
                <span className="text-[#827148]/70 font-semibold">Nama:</span>
                <span className="font-bold text-[#827148] truncate max-w-[200px]">
                  {profile?.name}
                </span>
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
                  {profile?.trackLabel}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pb-2 border-b border-[#FFEED6]/60">
                <span className="text-[#827148]/70 font-semibold">Paket Belajar:</span>
                <span className="font-bold text-[#827148]">
                  {profile?.planLabel}
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

        {/* Action Controls */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            disabled={checking}
            onClick={() => fetchStatus(true)}
            className="w-full bg-[#A5AF79] hover:bg-[#949e6a] active:bg-[#838d5c] text-white py-3 rounded-xl font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {checking ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Memeriksa Status...</span>
              </>
            ) : (
              <span>Cek Status Sekarang</span>
            )}
          </button>

          <a
            href={`https://wa.me/${BUSINESS_CONFIG.contact.adminWhatsapp}?text=${encodeURIComponent(
              "Halo Admin BBN, saya sudah mendaftar dan sedang menunggu verifikasi pembayaran."
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-xs font-bold text-[#827148] hover:underline transition-colors"
          >
            Konfirmasi ke Admin via WhatsApp &rarr;
          </a>

          <Link
            href="/login"
            className="block text-[11px] font-semibold text-[#827148]/70 hover:text-[#827148] pt-1"
          >
            Kembali ke Halaman Login
          </Link>
        </div>
      </div>
    </div>
  )
}
