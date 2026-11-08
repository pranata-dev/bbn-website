"use client"

import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeft, Lock, Mail, ShieldAlert, KeyRound } from "lucide-react"

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      })

      if (signInError) {
        throw new Error("Email atau kata sandi tidak valid.")
      }

      // Verify ADMIN role server-side (users.role = 'ADMIN')
      const res = await fetch("/api/admin/auth/me", { cache: "no-store" })
      if (!res.ok) {
        await supabase.auth.signOut()
        throw new Error("Akun ini tidak memiliki hak akses administrator platform.")
      }

      toast.success("Autentikasi Berhasil!", {
        description: "Memuat Operational Dispatch BBN Education...",
      })

      // Hard refresh to clear cached layout sessions
      window.location.href = "/admin"
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Terjadi kegagalan autentikasi.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-canvas-paper bg-grid-blueprint flex items-center justify-center p-4 sm:p-8 font-sans relative selection:bg-accent-canary selection:text-[#171717]">
      {/* Top-Left Navigation Link */}
      <div className="absolute top-6 left-6 sm:top-8 sm:left-8 z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#171717] py-2 px-3.5 bg-surface-white border-2 border-[#171717] shadow-[3px_3px_0px_#171717] hover:bg-accent-canary transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>KEMBALI KE BERANDA</span>
        </Link>
      </div>

      {/* Main Admin Auth Container */}
      <div className="max-w-md w-full bg-surface-white border-2 border-[#171717] p-6 sm:p-8 shadow-[8px_8px_0px_#171717] relative">
        {/* Corner Calibration Accents */}
        <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-[#171717]" />
        <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-[#171717]" />
        <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-[#171717]" />
        <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-[#171717]" />

        {/* Header Telemetry Badge */}
        <div className="flex items-center justify-between border-b-2 border-[#171717] pb-3 mb-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-emerald-600 inline-block border border-[#171717] animate-pulse" />
            <span className="font-mono text-[10px] font-bold text-ink-muted uppercase tracking-wider">
              SYS_AUTH // PROTOCOL_01
            </span>
          </div>
          <span className="font-mono text-[10px] font-bold bg-accent-canary px-2 py-0.5 border border-[#171717] text-[#171717]">
            [ADMIN v2.4]
          </span>
        </div>

        {/* Title Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-7 h-7 bg-[#171717] text-accent-canary flex items-center justify-center font-bold text-xs border border-[#171717]">
              <Lock className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#171717] tracking-tight">
              BBN Education
            </h1>
          </div>
          <p className="font-mono text-xs text-ink-muted uppercase tracking-wide">
            Backoffice Management Console // Otorisasi
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="admin-email"
              className="font-mono text-xs font-bold text-[#171717] mb-1.5 flex items-center justify-between"
            >
              <span>[PARAM // 01] EMAIL ADMINISTRATOR</span>
              <Mail className="w-3.5 h-3.5 text-ink-muted" />
            </label>
            <input
              id="admin-email"
              type="email"
              autoComplete="username"
              placeholder="admin@bbn.education"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              className="w-full py-2.5 px-3 border-2 border-[#171717] bg-canvas-paper text-sm text-[#171717] placeholder:text-ink-muted/50 focus:outline-none focus:bg-surface-white font-mono transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="font-mono text-xs font-bold text-[#171717] mb-1.5 flex items-center justify-between"
            >
              <span>[PARAM // 02] KATA SANDI AKSES</span>
              <KeyRound className="w-3.5 h-3.5 text-ink-muted" />
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••••••"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
              className="w-full py-2.5 px-3 border-2 border-[#171717] bg-canvas-paper text-sm text-[#171717] placeholder:text-ink-muted/50 focus:outline-none focus:bg-surface-white font-mono transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-accent-canary hover:bg-[#FACC15] text-[#171717] font-bold border-2 border-[#171717] shadow-[4px_4px_0px_#171717] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#171717] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-xs font-mono uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 mt-6 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-3 h-3 border-2 border-[#171717] border-t-transparent animate-spin inline-block" />
                <span>MEMVERIFIKASI OTORISASI...</span>
              </>
            ) : (
              <>
                <span>VERIFIKASI & MASUK PANEL ADMIN</span>
                <span className="text-base leading-none">→</span>
              </>
            )}
          </button>
        </form>

        {/* Security & Audit Notice */}
        <div className="mt-6 pt-4 border-t border-[#171717]/20 flex items-start gap-2 text-[11px] font-mono text-ink-muted leading-tight">
          <ShieldAlert className="w-4 h-4 text-alert-rust shrink-0 mt-0.5" />
          <span>
            Setiap percobaan akses masuk dicatat dalam Audit Trail Keamanan Sistem. Akses terbatas khusus staf & pengajar BBN Education.
          </span>
        </div>
      </div>
    </div>
  )
}
