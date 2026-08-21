"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

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
          redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/dashboard`,
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
        email,
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
    <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#FFEED6] relative">
      {/* Header Section */}
      <div className="text-center">
        {/* Pseudo-Icon Logo */}
        <div
          className="w-12 h-12 bg-[#FFEED6] rounded-2xl mx-auto mb-4 flex items-center justify-center border border-[#827148]/10 shadow-2xs"
          aria-label="Logo placeholder"
        >
          <div className="w-4 h-4 rounded-md bg-[#A5AF79]" />
        </div>

        <h1 className="text-2xl font-bold text-[#827148] text-center mb-2 tracking-tight">
          Selamat Datang Kembali!
        </h1>
        <p className="text-sm text-gray-500 text-center mb-8">
          Masuk ke Belajar Bareng Nata untuk melanjutkan progresmu.
        </p>
      </div>

      {/* Google Sign-In Button (Primary Focus) */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading}
        className="w-full bg-white border-2 border-[#FFEED6] text-[#827148] font-bold rounded-xl py-4 px-4 flex justify-center items-center gap-3 transition-colors hover:bg-gray-50 cursor-pointer shadow-2xs disabled:opacity-60 disabled:cursor-not-allowed text-sm sm:text-base"
      >
        {/* Google Logo Placeholder (Colored Dot in Box) */}
        <div className="w-5 h-5 rounded-md bg-[#FFEED6] flex items-center justify-center p-1 border border-[#827148]/15">
          <div className="w-2.5 h-2.5 rounded-full bg-[#A5AF79]" />
        </div>
        <span>{isGoogleLoading ? "Menghubungkan ke Google..." : "Masuk dengan Google"}</span>
      </button>

      {/* Subtle "ATAU" Visual Divider */}
      <div className="flex items-center my-6 gap-3 text-xs text-gray-400 font-semibold uppercase tracking-wider">
        <span className="flex-1 border-t border-[#FFEED6]" />
        <span>ATAU</span>
        <span className="flex-1 border-t border-[#FFEED6]" />
      </div>

      {/* Manual Login Form */}
      <form onSubmit={handleEmailSignIn} aria-label="Formulir masuk">
        {/* Email Input */}
        <div className="mb-4">
          <label
            htmlFor="login-email"
            className="text-sm font-semibold text-[#827148] mb-1.5 block"
          >
            Email
          </label>
          <input
            id="login-email"
            type="email"
            placeholder="nama@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full py-3 px-4 rounded-xl border border-[#FFEED6] bg-white text-sm text-[#827148] placeholder:text-[#827148]/40 focus:outline-none focus:ring-2 focus:ring-[#A5AF79] focus:border-transparent transition-all shadow-2xs font-medium"
            required
          />
        </div>

        {/* Password Input */}
        <div className="mb-6">
          <label
            htmlFor="login-password"
            className="text-sm font-semibold text-[#827148] mb-1.5 block"
          >
            Password
          </label>
          <input
            id="login-password"
            type="password"
            placeholder="Masukkan password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full py-3 px-4 rounded-xl border border-[#FFEED6] bg-white text-sm text-[#827148] placeholder:text-[#827148]/40 focus:outline-none focus:ring-2 focus:ring-[#A5AF79] focus:border-transparent transition-all shadow-2xs font-medium"
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#A5AF79] hover:bg-[#A5AF79]/90 active:bg-[#949e6a] text-white font-bold rounded-xl py-4 mt-2 transition-colors cursor-pointer text-sm sm:text-base shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Memproses..." : "Masuk"}
        </button>

        {/* Footer Link */}
        <p className="text-center text-sm text-[#827148] mt-6 font-medium">
          Belum punya akun?{" "}
          <Link
            href="/register"
            className="font-bold text-[#827148] hover:underline cursor-pointer"
          >
            Daftar sekarang
          </Link>
        </p>
      </form>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 relative bg-[#FFEED6]/20 font-sans">
      {/* Top-Left Back to Home Button */}
      <div className="absolute top-6 left-6 sm:top-8 sm:left-8 z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#827148] hover:text-[#A5AF79] transition-colors py-2 px-3.5 rounded-xl bg-white border border-[#FFEED6] shadow-2xs"
        >
          <span>&larr;</span>
          <span>Kembali ke beranda</span>
        </Link>
      </div>

      {/* Suspense Wrapper for Client Login Card */}
      <Suspense
        fallback={
          <div className="max-w-md w-full bg-white rounded-3xl p-12 text-center text-[#827148]/60 text-sm border border-[#FFEED6]">
            Memuat halaman masuk...
          </div>
        }
      >
        <LoginCard />
      </Suspense>
    </div>
  )
}
