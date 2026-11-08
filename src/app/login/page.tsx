"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeft, Lock, Mail, KeyRound, Sparkles } from "lucide-react"

function LoginCard() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  // 1. Google OAuth Sign-In
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback?next=/dashboard`,
        },
      })
      if (error) throw error
    } catch (error: any) {
      console.error("Google sign-in error:", error)
      toast.error(error?.message || "Gagal masuk dengan Google. Silakan coba lagi.")
      setIsGoogleLoading(false)
    }
  }

  // 2. Email & Password Manual Sign-In
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error("Mohon isi email dan password.")
      return
    }

    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })

      if (error) {
        throw new Error(
          error.message === "Invalid login credentials"
            ? "Email atau password salah."
            : error.message
        )
      }

      toast.success("Login berhasil! Mengalihkan ke dashboard...")
      router.push("/dashboard")
      router.refresh()
    } catch (error: any) {
      toast.error(error?.message || "Terjadi kesalahan saat masuk.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md w-full bg-surface-white border-2 border-[#171717] technical-shadow p-6 sm:p-8 relative">
      {/* Corner Calibration Accents */}
      <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-[#171717]" />
      <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-[#171717]" />
      <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-[#171717]" />
      <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-[#171717]" />

      {/* Header Prompt Telemetry */}
      <div className="flex items-center justify-between border-b-2 border-[#171717] pb-3 mb-6">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-accent-canary inline-block border border-[#171717]" />
          <span className="font-mono text-[10px] font-bold text-alert-rust uppercase tracking-wider">
            [SYS.AUTH] // CREDENTIAL_INPUT
          </span>
        </div>
        <span className="font-mono text-[10px] font-bold bg-[#171717] text-surface-white px-2 py-0.5 border border-[#171717]">
          CLIENT v2.4
        </span>
      </div>

      {/* Title Section */}
      <div className="mb-6">
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="w-6 h-6 bg-[#171717] text-accent-canary flex items-center justify-center font-bold text-xs border border-[#171717]">
            <Lock className="w-3.5 h-3.5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#171717] tracking-tight">
            Login Sistem
          </h1>
        </div>
        <p className="font-mono text-xs text-ink-muted leading-relaxed">
          Masuk ke akun BBN Education untuk melanjutkan modul materi dan simulasi tryout.
        </p>
      </div>

      {/* Google Sign-In Button */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading}
        className="w-full bg-canvas-paper border-2 border-[#171717] text-[#171717] hover:bg-surface-white font-mono text-xs font-bold uppercase py-3 px-4 flex justify-center items-center gap-3 transition-all cursor-pointer shadow-[2px_2px_0px_#171717] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#171717] disabled:opacity-60"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>
          {isGoogleLoading ? "Menghubungkan ke Google..." : "Masuk dengan Akun Google"}
        </span>
      </button>

      {/* Mechanical "ATAU" Divider */}
      <div className="flex items-center my-5 gap-3">
        <span className="flex-1 border-t-2 border-[#171717]" />
        <span className="font-mono text-[10px] font-bold text-ink-muted uppercase tracking-wider px-1">
          ATAU AKSES MANUAL
        </span>
        <span className="flex-1 border-t-2 border-[#171717]" />
      </div>

      {/* Manual Email Login Form */}
      <form onSubmit={handleEmailSignIn} className="space-y-4">
        <div>
          <label
            htmlFor="login-email"
            className="font-mono text-[10px] sm:text-xs font-bold text-[#171717] uppercase tracking-wider mb-1 flex items-center justify-between"
          >
            <span>[PARAM // 01] ALAMAT EMAIL</span>
            <Mail className="w-3 h-3 text-ink-muted" />
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="username"
            placeholder="nama@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-canvas-paper border-2 border-[#171717] rounded-none px-3.5 py-2.5 text-xs font-mono text-[#171717] placeholder:text-ink-muted/50 focus:outline-none focus:ring-0 focus:border-alert-rust focus:bg-surface-white transition-colors"
            required
          />
        </div>

        <div>
          <label
            htmlFor="login-password"
            className="font-mono text-[10px] sm:text-xs font-bold text-[#171717] uppercase tracking-wider mb-1 flex items-center justify-between"
          >
            <span>[PARAM // 02] KATA SANDI</span>
            <KeyRound className="w-3 h-3 text-ink-muted" />
          </label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-canvas-paper border-2 border-[#171717] rounded-none px-3.5 py-2.5 text-xs font-mono text-[#171717] placeholder:text-ink-muted/50 focus:outline-none focus:ring-0 focus:border-alert-rust focus:bg-surface-white transition-colors"
            required
          />
        </div>

        {/* Massive High-Contrast Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 bg-accent-canary hover:bg-[#FACC15] text-[#171717] font-bold border-2 border-[#171717] shadow-[4px_4px_0px_#171717] hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#171717] active:translate-y-0 active:shadow-[2px_2px_0px_#171717] text-xs font-mono uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <span className="w-3 h-3 border-2 border-[#171717] border-t-transparent animate-spin inline-block" />
              <span>MEMVERIFIKASI KREDENSIAL...</span>
            </>
          ) : (
            <>
              <span>MASUK DASHBOARD SISWA</span>
              <span className="text-sm leading-none">→</span>
            </>
          )}
        </button>

        {/* Footer Link */}
        <div className="pt-4 mt-6 border-t border-[#171717]/20 text-center font-mono text-xs text-ink-muted">
          <span>Belum memiliki akun siswa? </span>
          <Link
            href="/register"
            className="font-bold text-[#171717] underline hover:text-alert-rust transition-colors"
          >
            DAFTAR SEKARANG →
          </Link>
        </div>
      </form>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 relative bg-canvas-paper bg-grid-blueprint font-sans selection:bg-accent-canary selection:text-[#171717]">
      {/* Top-Left Back Button as Mechanical Breadcrumb */}
      <div className="absolute top-6 left-6 sm:top-8 sm:left-8 z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 border border-[#171717] bg-surface-white text-ink-muted hover:text-[#171717] text-[10px] font-mono uppercase tracking-wider px-3 py-1.5 technical-shadow-sm hover:bg-accent-canary transition-all"
        >
          <ArrowLeft className="w-3 h-3" />
          <span>KEMBALI KE BERANDA</span>
        </Link>
      </div>

      <Suspense
        fallback={
          <div className="max-w-md w-full bg-surface-white border-2 border-[#171717] technical-shadow p-12 text-center font-mono text-xs text-ink-muted">
            &gt; MEMUAT MODUL AUTENTIKASI...
          </div>
        }
      >
        <LoginCard />
      </Suspense>
    </div>
  )
}
