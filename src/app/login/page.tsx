"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BookOpen, Loader2, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { useTheme } from "@/contexts/ThemeContext"

function LoginContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const redirect = searchParams.get("redirect") || "/dashboard"
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const supabase = createClient()
            const { error } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password,
            })

            if (error) {
                throw new Error(error.message === "Invalid login credentials"
                    ? "Email atau password salah."
                    : error.message)
            }

            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const res = await fetch(`/api/auth/session`, { method: "POST" })
                const data = await res.json()

                if (!res.ok) {
                    await supabase.auth.signOut()
                    throw new Error(data.error || "Gagal mengambil sesi.")
                }

                if (data.role === "ADMIN") {
                    router.push("/admin")
                } else {
                    router.push(redirect)
                }
                router.refresh()
            }

            toast.success("Login berhasil!")
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Terjadi kesalahan.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="bg-[#FEFCF3] border-4 border-[#2b1b11] rounded-2xl shadow-[8px_8px_0px_#2b1b11] overflow-hidden">
            {/* Header */}
            <div className="text-center pt-8 pb-4 px-6 border-b-4 border-[#2b1b11] bg-[#bed3c6]">
                <div className="mx-auto w-12 h-12 bg-[#FEFCF3] border-2 border-[#2b1b11] flex items-center justify-center shadow-[2px_2px_0px_#2b1b11] mb-4">
                    <BookOpen className="w-6 h-6 text-[#2b1b11] stroke-[2]" />
                </div>
                <h1
                    className="text-xl md:text-2xl font-extrabold text-[#2b1b11] mb-2"
                    style={{ fontFamily: "var(--font-press-start)", lineHeight: 1.4 }}
                >
                    Masuk
                </h1>
                <p className="text-xs md:text-sm text-[#3c5443] font-bold font-mono">
                    Masuk ke akunmu untuk mulai belajar.
                </p>
            </div>

            {/* Content */}
            <div className="p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-5 font-mono" aria-label="Formulir login">
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-bold text-[#2b1b11]">Email</label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="nama@email.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="bg-[#bed3c6]/30 border-2 border-[#2b1b11] rounded-none shadow-[2px_2px_0px_#2b1b11] font-mono text-sm text-[#2b1b11] placeholder:text-[#3c5443]/50 focus:ring-[#e87a5d] focus:border-[#e87a5d] h-11"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-bold text-[#2b1b11]">Password</label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="Masukkan password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="bg-[#bed3c6]/30 border-2 border-[#2b1b11] rounded-none shadow-[2px_2px_0px_#2b1b11] font-mono text-sm text-[#2b1b11] placeholder:text-[#3c5443]/50 focus:ring-[#e87a5d] focus:border-[#e87a5d] h-11"
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-[#e87a5d] hover:bg-[#d95a4f] text-[#FEFCF3] h-12 rounded-none border-2 border-[#2b1b11] shadow-[4px_4px_0px_#2b1b11] hover:shadow-[6px_6px_0px_#2b1b11] hover:-translate-y-1 transition-all font-bold font-mono text-base"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Memproses...
                            </>
                        ) : (
                            "Masuk"
                        )}
                    </Button>

                    <p className="text-center text-xs font-bold text-[#3c5443] font-mono">
                        Belum punya akun?{" "}
                        <Link href="/register" className="text-[#e87a5d] hover:underline">
                            Daftar Sekarang
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    )
}

export default function LoginPage() {
    const { isDark } = useTheme()

    return (
        <div className={`relative min-h-screen flex items-center justify-center p-4 ${isDark ? "bg-[#0f1b2e]" : "bg-[#bed3c6]"}`}>
            {/* Pixel Art Background */}
            <div
                className="fixed inset-0 z-0 opacity-80 [image-rendering:pixelated] [image-rendering:-moz-crisp-edges] [image-rendering:-webkit-optimize-contrast] [image-rendering:crisp-edges] [-ms-interpolation-mode:nearest-neighbor]"
                style={{
                    backgroundImage: isDark ? "url('/assets/background-only-malam.png')" : "url('/assets/background-only-2.png')",
                    backgroundSize: "cover",
                    backgroundPosition: "center center",
                    backgroundRepeat: "no-repeat"
                }}
            />

            <div className="w-full max-w-md z-10 relative">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm font-bold text-[#2b1b11] font-mono hover:text-[#e87a5d] transition-colors mb-8 bg-[#FEFCF3] border-2 border-[#2b1b11] px-4 py-2 shadow-[2px_2px_0px_#2b1b11] hover:shadow-[3px_3px_0px_#2b1b11] hover:-translate-y-0.5 transition-all"
                >
                    <ArrowLeft className="w-4 h-4 stroke-[3]" />
                    Kembali ke beranda
                </Link>

                <Suspense fallback={
                    <div className="bg-[#FEFCF3] border-4 border-[#2b1b11] rounded-2xl shadow-[8px_8px_0px_#2b1b11] flex items-center justify-center p-20">
                        <Loader2 className="w-8 h-8 text-[#2b1b11] animate-spin" />
                    </div>
                }>
                    <LoginContent />
                </Suspense>
            </div>
        </div>
    )
}
