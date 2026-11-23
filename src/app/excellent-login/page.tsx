"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Eye, EyeOff, KeyRound, Lock, LogOut, User } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { SubjectProvider, useSubject } from "@/contexts/SubjectContext"
import {
    getExcellentBetaGrade,
    getExcellentCourseByGrade,
    normalizeExcellentName,
    type ExcellentGrade,
} from "@/config/excellent"

interface ActiveBetaSession {
    name: string
    grade: ExcellentGrade
    label: string
    courseSlug: string
}

function ExcellentLoginCard() {
    const router = useRouter()
    const { setSelectedCourse } = useSubject()

    const [name, setName] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isSigningOut, setIsSigningOut] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [activeSession, setActiveSession] = useState<ActiveBetaSession | null>(null)

    useEffect(() => {
        let mounted = true

        const checkSession = async () => {
            try {
                const supabase = createClient()
                const {
                    data: { user },
                } = await supabase.auth.getUser()

                if (!mounted || !user) return

                const betaGrade = getExcellentBetaGrade(user)
                if (!betaGrade) return

                const course = getExcellentCourseByGrade(betaGrade)
                if (!course) return

                const studentName =
                    (typeof user.user_metadata?.name === "string" && user.user_metadata.name) ||
                    (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name) ||
                    "Siswa Fisika"

                setActiveSession({
                    name: studentName,
                    grade: betaGrade,
                    label: course.label,
                    courseSlug: course.slug,
                })
            } catch {
                // Ignore session check failure on login screen
            }
        }

        checkSession()
        return () => {
            mounted = false
        }
    }, [])

    const handleContinueDashboard = () => {
        if (activeSession) {
            setSelectedCourse(activeSession.courseSlug)
        }
        router.push("/dashboard")
        router.refresh()
    }

    const handleSignOut = async () => {
        setIsSigningOut(true)
        setErrorMessage(null)
        try {
            const supabase = createClient()
            await supabase.auth.signOut()
            setActiveSession(null)
            router.refresh()
        } catch {
            setErrorMessage("Gagal keluar dari sesi saat ini. Coba lagi.")
        } finally {
            setIsSigningOut(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrorMessage(null)

        const { displayName: trimmedName } = normalizeExcellentName(name)
        if (trimmedName.length < 2 || trimmedName.length > 80) {
            setErrorMessage("Nama lengkap harus terdiri dari 2 sampai 80 karakter.")
            return
        }

        if (!password) {
            setErrorMessage("Password kelas wajib diisi.")
            return
        }

        setIsLoading(true)
        try {
            const res = await fetch("/api/auth/excellent-login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: trimmedName,
                    password,
                }),
            })

            const data = await res.json().catch(() => ({}))

            if (!res.ok) {
                if (res.status === 429) {
                    setErrorMessage(
                        data.error || "Terlalu banyak percobaan masuk. Tunggu satu menit lalu coba lagi."
                    )
                } else {
                    setErrorMessage(
                        data.error || "Password kelas tidak sesuai. Periksa kembali password dari pengajar."
                    )
                }
                return
            }

            if (typeof data.courseSlug === "string" && data.courseSlug) {
                setSelectedCourse(data.courseSlug)
            }

            router.push("/dashboard")
            router.refresh()
        } catch {
            setErrorMessage("Tidak dapat terhubung ke server. Periksa koneksi internet kamu.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-md w-full bg-surface-white border-2 border-[#171717] technical-shadow p-6 sm:p-8 relative">
            {/* Corner Accents */}
            <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-[#171717]" />
            <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-[#171717]" />
            <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-[#171717]" />
            <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-[#171717]" />

            {/* Top Bar */}
            <div className="flex items-center justify-between border-b-2 border-[#171717] pb-3 mb-6">
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-accent-canary inline-block border border-[#171717]" />
                    <span className="font-mono text-[10px] font-bold text-alert-rust uppercase tracking-wider">
                        SAS FISIKA // AKSES KELAS
                    </span>
                </div>
                <span className="font-mono text-[10px] font-bold bg-accent-canary text-[#171717] px-2 py-0.5 border border-[#171717]">
                    BETA
                </span>
            </div>

            {/* Heading */}
            <div className="mb-6">
                <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-6 h-6 bg-[#171717] text-accent-canary flex items-center justify-center border border-[#171717] shrink-0">
                        <Lock className="w-3.5 h-3.5" />
                    </div>
                    <h1 className="text-xl sm:text-2xl font-extrabold text-[#171717] tracking-tight leading-tight">
                        Program Persiapan SAS Fisika (Beta)
                    </h1>
                </div>
                <p className="text-xs text-ink-muted leading-relaxed">
                    Masukkan nama lengkap dan password kelas dari pengajar untuk membuka materi dan latihan soal Fisika sesuai kelas kamu.
                </p>
            </div>

            {/* Active Excellent Beta Session Status Bar */}
            {activeSession && (
                <div className="mb-6 border-2 border-[#171717] bg-canvas-paper p-3.5 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                            <span className="font-mono text-[10px] font-bold uppercase text-alert-rust block">
                                SESI AKTIF
                            </span>
                            <p className="text-xs font-bold text-[#171717] truncate">
                                {activeSession.name} ({activeSession.label})
                            </p>
                        </div>
                        <span className="font-mono text-[10px] font-bold bg-accent-canary text-[#171717] border border-[#171717] px-2 py-0.5 shrink-0">
                            {activeSession.label}
                        </span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <button
                            type="button"
                            onClick={handleContinueDashboard}
                            className="flex-1 py-2 px-3 bg-accent-canary hover:bg-[#FACC15] text-[#171717] border border-[#171717] font-mono text-[11px] font-bold uppercase flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                            <span>Lanjut ke Dashboard</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                            type="button"
                            onClick={handleSignOut}
                            disabled={isSigningOut}
                            className="py-2 px-3 bg-surface-white hover:bg-[#171717] hover:text-surface-white text-[#171717] border border-[#171717] font-mono text-[11px] font-bold uppercase flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>{isSigningOut ? "Keluar..." : "Ganti Kelas"}</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Inline Error Alert */}
            {errorMessage && (
                <div
                    role="alert"
                    className="mb-4 p-3 border-2 border-alert-rust bg-[#FFF5F0] text-[#171717] font-mono text-xs leading-relaxed"
                >
                    <span className="font-bold text-alert-rust uppercase block mb-0.5">
                        Akses Ditolak
                    </span>
                    {errorMessage}
                </div>
            )}

            {/* Password-Only Form (No Email Input) */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label
                        htmlFor="excellent-name"
                        className="font-mono text-[11px] font-bold text-[#171717] uppercase tracking-wider mb-1.5 flex items-center justify-between"
                    >
                        <span>Nama Lengkap</span>
                        <User className="w-3.5 h-3.5 text-ink-muted" />
                    </label>
                    <input
                        id="excellent-name"
                        type="text"
                        autoComplete="name"
                        minLength={2}
                        maxLength={80}
                        placeholder="Contoh: Budi Santoso"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value)
                            if (errorMessage) setErrorMessage(null)
                        }}
                        className="w-full bg-canvas-paper border-2 border-[#171717] rounded-none px-3.5 py-2.5 text-sm font-sans text-[#171717] placeholder:text-ink-muted/60 focus:outline-none focus:ring-0 focus:border-alert-rust focus:bg-surface-white transition-colors"
                        required
                    />
                </div>

                <div>
                    <label
                        htmlFor="excellent-password"
                        className="font-mono text-[11px] font-bold text-[#171717] uppercase tracking-wider mb-1.5 flex items-center justify-between"
                    >
                        <span>Password Kelas</span>
                        <KeyRound className="w-3.5 h-3.5 text-ink-muted" />
                    </label>
                    <div className="relative">
                        <input
                            id="excellent-password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="off"
                            placeholder="Masukkan password kelas"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value)
                                if (errorMessage) setErrorMessage(null)
                            }}
                            className="w-full bg-canvas-paper border-2 border-[#171717] rounded-none pl-3.5 pr-11 py-2.5 text-sm font-mono text-[#171717] placeholder:text-ink-muted/60 focus:outline-none focus:ring-0 focus:border-alert-rust focus:bg-surface-white transition-colors"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-ink-muted hover:text-[#171717] cursor-pointer"
                        >
                            {showPassword ? (
                                <EyeOff className="w-4 h-4" />
                            ) : (
                                <Eye className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 bg-accent-canary hover:bg-[#FACC15] text-[#171717] font-bold border-2 border-[#171717] shadow-[4px_4px_0px_#171717] hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#171717] active:translate-y-0 active:shadow-[2px_2px_0px_#171717] text-xs font-mono uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <span className="w-3 h-3 border-2 border-[#171717] border-t-transparent animate-spin inline-block" />
                            <span>MEMERIKSA PASSWORD...</span>
                        </>
                    ) : (
                        <>
                            <span>MASUK KE KELAS FISIKA</span>
                            <ArrowRight className="w-4 h-4" />
                        </>
                    )}
                </button>
            </form>

            {/* Info Footer */}
            <div className="pt-4 mt-6 border-t border-[#171717]/20 text-center text-xs text-ink-muted">
                <span>Kelas kamu otomatis terbuka sesuai password yang dimasukkan.</span>
            </div>
        </div>
    )
}

export default function ExcellentLoginPage() {
    return (
        <SubjectProvider>
            <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 relative bg-canvas-paper bg-grid-blueprint font-sans selection:bg-accent-canary selection:text-[#171717]">
                <div className="absolute top-4 left-4 sm:top-8 sm:left-8 z-20">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 border border-[#171717] bg-surface-white text-ink-muted hover:text-[#171717] text-[10px] font-mono uppercase tracking-wider px-3 py-1.5 technical-shadow-sm hover:bg-accent-canary transition-all"
                    >
                        <ArrowLeft className="w-3 h-3" />
                        <span>BERANDA</span>
                    </Link>
                </div>

                <ExcellentLoginCard />
            </div>
        </SubjectProvider>
    )
}

