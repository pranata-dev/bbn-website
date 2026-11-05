"use client"

import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

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
        throw new Error("Email atau password salah.")
      }

      // Verify ADMIN role server-side (users.role = 'ADMIN')
      const res = await fetch("/api/admin/auth/me", { cache: "no-store" })
      if (!res.ok) {
        await supabase.auth.signOut()
        throw new Error("Akun ini tidak memiliki akses administrator.")
      }

      toast.success("Login berhasil!", {
        description: "Selamat datang di Admin Panel Belajar Bareng Nata.",
      })

      // Hard refresh to clear cached layout sessions
      window.location.href = "/admin"
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan saat masuk.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FFEED6]/20 flex items-center justify-center p-4 sm:p-8 font-sans relative">
      {/* Top-Left Back Button */}
      <div className="absolute top-6 left-6 sm:top-8 sm:left-8 z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#827148] hover:text-[#A5AF79] transition-colors py-2 px-3.5 rounded-xl bg-white border border-[#FFEED6] shadow-2xs"
        >
          <span>&larr;</span>
          <span>Kembali ke beranda</span>
        </Link>
      </div>

      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-sm border-2 border-[#FFEED6] relative">
        {/* Header Section */}
        <div className="text-center">
          <div className="w-12 h-12 bg-[#FFEED6] rounded-2xl mx-auto mb-4 flex items-center justify-center border border-[#827148]/15 shadow-2xs">
            <div className="w-4 h-4 rounded-md bg-[#A5AF79]" />
          </div>

          <h1 className="text-2xl font-bold text-[#827148] tracking-tight mb-2">
            Admin Access
          </h1>
          <p className="text-sm text-[#827148]/70 mb-8">
            Masuk dengan kredensial administrator Belajar Bareng Nata.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="admin-email"
              className="text-xs font-bold text-[#827148] mb-1.5 block"
            >
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              autoComplete="username"
              placeholder="Masukkan email admin"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              className="w-full py-3 px-4 rounded-xl border-2 border-[#FFEED6] bg-white text-sm text-[#827148] placeholder:text-[#827148]/40 focus:outline-none focus:border-[#A5AF79] transition-all shadow-2xs font-medium"
            />
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="text-xs font-bold text-[#827148] mb-1.5 block"
            >
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              placeholder="Masukkan password admin"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
              className="w-full py-3 px-4 rounded-xl border-2 border-[#FFEED6] bg-white text-sm text-[#827148] placeholder:text-[#827148]/40 focus:outline-none focus:border-[#A5AF79] transition-all shadow-2xs font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-[#827148] hover:bg-[#827148]/90 text-white font-bold rounded-xl text-sm transition-all shadow-xs cursor-pointer disabled:opacity-50 mt-6"
          >
            {loading ? "Memverifikasi..." : "Masuk Panel Admin"}
          </button>
        </form>
      </div>
    </div>
  )
}
