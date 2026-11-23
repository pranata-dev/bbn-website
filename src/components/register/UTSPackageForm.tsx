"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { SUBSCRIPTION_PLAN_LIST, type PlanCode } from "@/config/plans"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Check,
  ArrowRight,
} from "lucide-react"

export type StudentCategory = "PHYSICS_SEM_3" | "NON_PHYSICS"
export type BillingCycle = "FREE" | "MONTHLY" | "SEMESTER"

export interface ELearningRegistrationPayload {
  fullName: string
  email: string
  whatsapp: string
  studentCategory: StudentCategory
  billingCycle: BillingCycle
  selectedPackageId: string
  selectedPackageName: string
  price: number
  paymentProof: File | null
  authId?: string
}

export interface UTSPackageFormState {
  name: string
  email: string
  password?: string
  nim?: string
  subject: string
  packageType: string
  price: number
  whatsapp: string
}

export interface UTSPackageFormProps {
  paymentFile?: File | null
  paymentPreview?: string | null
  onPaymentChange?: (file: File | null, preview: string | null) => void
  onSubmit?: (e: React.FormEvent, payload?: ELearningRegistrationPayload) => void
  isLoading?: boolean
  initialPlan?: string | null
  formData?: Partial<UTSPackageFormState>
  onChange?: (data: Partial<UTSPackageFormState>) => void
}

interface PackageOption {
  id: string
  planCode: PlanCode
  name: string
  cycle: BillingCycle
  price: number
  originalPrice?: number
  discountBadge?: string
  headline: string
  features: string[]
  isPopular?: boolean
}

const UNIFIED_PACKAGES: PackageOption[] = SUBSCRIPTION_PLAN_LIST.map((plan) => ({
  id: plan.id,
  planCode: plan.code,
  name: plan.name,
  cycle: plan.code,
  price: plan.price,
  originalPrice: plan.originalPrice,
  discountBadge: plan.badge,
  headline: `${plan.subtitle} (${plan.durationLabel})`,
  features: plan.features,
  isPopular: plan.isPopular,
}))

const PHYSICS_SEM_3_COURSES = [
  "Mekanika Newton",
  "Fisika-Matematika Lanjut",
  "Gelombang",
  "Elektrostatika",
  "Termodinamika",
  "Fisika Komputasi",
]

const NON_PHYSICS_COURSES = [
  "Fisika Dasar 1",
  "Fisika Dasar 2",
  "Statistika dan Analisis Data",
  "Matematika 1",
]

interface AuthUserSummary {
  id: string
  email?: string
  user_metadata?: {
    full_name?: string
    name?: string
    user_name?: string
  }
}

export function UTSPackageForm({
  isLoading: propIsLoading = false,
  initialPlan,
}: UTSPackageFormProps) {
  const router = useRouter()

  // Auth State
  const [currentUser, setCurrentUser] = useState<AuthUserSummary | null>(null)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Duplicate Account Modal State
  const [showDuplicateModal, setShowDuplicateModal] = useState(false)
  const [duplicateEmail, setDuplicateEmail] = useState("")

  // Personal Data State
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [whatsapp, setWhatsapp] = useState("")

  // Determine initial plan from query param (`free`, `monthly`, `semester`)
  const normalizedInitPlan = (initialPlan || "").trim().toUpperCase()
  const defaultCycle: BillingCycle =
    normalizedInitPlan === "MONTHLY"
      ? "MONTHLY"
      : normalizedInitPlan === "SEMESTER"
      ? "SEMESTER"
      : "FREE"

  // Curriculum & Package Selection States
  const [studentCategory, setStudentCategory] = useState<StudentCategory>("PHYSICS_SEM_3")
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(defaultCycle)
  const [selectedPackageId, setSelectedPackageId] = useState<string>(defaultCycle.toLowerCase())

  // Check existing Supabase auth session on mount & verify duplicate
  useEffect(() => {
    const checkAuthAndDuplicate = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          setCurrentUser(user as AuthUserSummary)
          const metaName =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.user_metadata?.user_name ||
            ""
          if (metaName) setFullName(metaName)
          if (user.email) setEmail(user.email)

          // Check if this email already exists in users database
          if (user.email) {
            const checkRes = await fetch("/api/auth/check-email", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: user.email }),
            })
            const checkData = await checkRes.json()

            if (checkData.exists) {
              setDuplicateEmail(user.email)
              setShowDuplicateModal(true)
            }
          }
        }
      } catch (err) {
        console.error("Auth check error:", err)
      }
    }

    checkAuthAndDuplicate()
  }, [])

  // Sync package selection when billing cycle toggle changes
  useEffect(() => {
    setSelectedPackageId(billingCycle.toLowerCase())
  }, [billingCycle])

  const activePackageList = UNIFIED_PACKAGES

  const selectedPackage = useMemo(() => {
    return (
      UNIFIED_PACKAGES.find((p) => p.id === selectedPackageId || p.cycle === billingCycle) ||
      UNIFIED_PACKAGES[2]
    )
  }, [selectedPackageId, billingCycle])

  const isFreePlan = selectedPackage.planCode === "FREE"

  // Google OAuth Sign-In Handler
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback?next=/register?step=details`,
        },
      })
      if (error) {
        throw error
      }
    } catch (error) {
      console.error("Google sign-in error:", error)
      const message = error instanceof Error ? error.message : "Gagal masuk dengan Google. Silakan coba lagi."
      toast.error(message)
      setIsGoogleLoading(false)
    }
  }

  const handleSignOutGoogle = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      setCurrentUser(null)
      setFullName("")
      setEmail("")
      toast.info("Anda telah keluar dari akun Google.")
    } catch (err) {
      console.error("Sign out error:", err)
    }
  }

  // Form Submission & Database Sync
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isFreePlan) {
      toast.info("Paket berbayar belum dibuka (Coming Soon). Silakan pilih Paket Gratis terlebih dahulu.")
      return
    }

    if (!fullName || fullName.length < 3) {
      toast.error("Nama lengkap minimal 3 karakter.")
      return
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Alamat email tidak valid.")
      return
    }
    if (!whatsapp) {
      toast.error("Masukkan nomor WhatsApp yang valid.")
      return
    }

    // Check duplicate account before submission
    try {
      const checkRes = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const checkData = await checkRes.json()
      if (checkData.exists) {
        setDuplicateEmail(email)
        setShowDuplicateModal(true)
        return
      }
    } catch (err) {
      console.warn("Pre-check error:", err)
    }

    setIsSubmitting(true)

    try {
      // Ensure auth session is resolved if already logged in via Google
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const resolvedAuthId = session?.user?.id || currentUser?.id

      const formPayload = new FormData()
      formPayload.append("type", "UTS")
      formPayload.append("fullName", fullName)
      formPayload.append("name", fullName)
      formPayload.append("email", email)
      formPayload.append("whatsapp", whatsapp)
      formPayload.append("phone", whatsapp)
      formPayload.append("studentCategory", studentCategory)
      formPayload.append("student_category", studentCategory)
      formPayload.append("billingCycle", selectedPackage.planCode)
      formPayload.append("billing_cycle", selectedPackage.planCode)
      formPayload.append("plan_code", selectedPackage.planCode)
      formPayload.append("selectedPackageId", selectedPackage.id)
      formPayload.append("selectedPackageName", selectedPackage.name)
      formPayload.append("packageType", selectedPackage.id)
      formPayload.append("price", String(selectedPackage.price))
      if (resolvedAuthId) {
        formPayload.append("authId", resolvedAuthId)
      }

      const res = await fetch("/api/register", {
        method: "POST",
        body: formPayload,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Gagal memproses pendaftaran.")
      }

      toast.success("Akun Paket Gratis aktif! Mengalihkan...")
      router.push(resolvedAuthId ? "/dashboard" : "/login")
    } catch (error) {
      console.error("Submission error:", error)
      const message = error instanceof Error ? error.message : "Terjadi kesalahan saat mendaftar."
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const activeAllAccessCourses =
    studentCategory === "PHYSICS_SEM_3"
      ? PHYSICS_SEM_3_COURSES
      : NON_PHYSICS_COURSES

  const isFormBusy = propIsLoading || isSubmitting

  return (
    <div className="w-full font-sans max-w-full">
      <form onSubmit={handleFormSubmit}>
        {/* 2-Column Grid Layout for Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* ======================================================== */}
          {/* LEFT COLUMN: Data Siswa, Kurikulum & Paket Pilihan       */}
          {/* ======================================================== */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Google Sign-In & Personal Data Container */}
            <div className="bg-surface-white border-2 border-[#171717] p-6 sm:p-8 shadow-[4px_4px_0px_#171717] relative">
              <div className="flex items-center justify-between border-b-2 border-[#171717] pb-3 mb-6">
                <span className="font-mono text-[10px] font-bold text-alert-rust uppercase tracking-wider">
                  [STEP 02.1] // DATA_IDENTITAS_SISWA
                </span>
                <span className="font-mono text-[10px] font-bold bg-canvas-paper px-2 py-0.5 border border-[#171717]">
                  WAJIB DIISI
                </span>
              </div>

              {currentUser ? (
                /* Authenticated User Badge */
                <div className="bg-accent-canary/15 border-2 border-[#171717] p-3.5 flex items-center justify-between shadow-[2px_2px_0px_#171717] mb-6">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-[#171717] text-accent-canary flex items-center justify-center font-mono font-bold text-xs border border-[#171717]">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                    <div>
                      <p className="font-mono text-xs font-bold text-[#171717]">
                        {fullName || currentUser.email}
                      </p>
                      <p className="font-mono text-[10px] text-ink-muted">
                        {email || currentUser.email} • [GOOGLE_LINKED]
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSignOutGoogle}
                    className="font-mono text-[11px] font-bold text-alert-rust underline hover:text-[#171717] cursor-pointer"
                  >
                    [GANTI AKUN]
                  </button>
                </div>
              ) : (
                /* Google Sign-In Button */
                <div className="mb-6">
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
                      {isGoogleLoading
                        ? "Menghubungkan ke Google..."
                        : "DAFTAR CEPAT DENGAN GOOGLE"}
                    </span>
                  </button>

                  <div className="flex items-center my-4 gap-3">
                    <span className="flex-1 border-t-2 border-[#171717]" />
                    <span className="font-mono text-[10px] font-bold text-ink-muted uppercase tracking-wider px-1">
                      ATAU ISI DATA MANUAL
                    </span>
                    <span className="flex-1 border-t-2 border-[#171717]" />
                  </div>
                </div>
              )}

              {/* Data Diri Form */}
              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="font-mono text-[10px] sm:text-xs font-bold text-[#171717] uppercase tracking-wider mb-1 block">
                    [01] NAMA LENGKAP MAHASISWA *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Najwa Aaliyah Priyatna"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-canvas-paper border-2 border-[#171717] rounded-none px-3.5 py-2.5 text-xs font-mono text-[#171717] placeholder:text-ink-muted/50 focus:outline-none focus:ring-0 focus:border-alert-rust focus:bg-surface-white transition-colors"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="font-mono text-[10px] sm:text-xs font-bold text-[#171717] uppercase tracking-wider mb-1 block">
                    [02] ALAMAT EMAIL AKTIF *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-canvas-paper border-2 border-[#171717] rounded-none px-3.5 py-2.5 text-xs font-mono text-[#171717] placeholder:text-ink-muted/50 focus:outline-none focus:ring-0 focus:border-alert-rust focus:bg-surface-white transition-colors"
                  />
                </div>

                {/* WhatsApp Number */}
                <div>
                  <label className="font-mono text-[10px] sm:text-xs font-bold text-[#171717] uppercase tracking-wider mb-1 block">
                    [03] NOMOR WHATSAPP AKTIF *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="08xxxxxxxxxx"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full bg-canvas-paper border-2 border-[#171717] rounded-none px-3.5 py-2.5 text-xs font-mono text-[#171717] placeholder:text-ink-muted/50 focus:outline-none focus:ring-0 focus:border-alert-rust focus:bg-surface-white transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* 2. Curriculum Category Selection */}
            <div className="bg-surface-white border-2 border-[#171717] p-6 sm:p-8 shadow-[4px_4px_0px_#171717]">
              <div className="flex items-center justify-between border-b-2 border-[#171717] pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-accent-canary border border-[#171717] inline-block" />
                  <h3 className="font-extrabold text-base text-[#171717]">
                    Kategori Jalur Kurikulum
                  </h3>
                </div>
                <span className="font-mono text-[10px] font-bold text-ink-muted">
                  [PARAM_02]
                </span>
              </div>

              <p className="font-mono text-xs text-ink-muted mb-4">
                Pilih jalur kurikulum mata kuliah yang sedang kamu tempuh di semester ini:
              </p>

              {/* Radio Group / Toggle Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5 font-mono">
                <button
                  type="button"
                  onClick={() => setStudentCategory("PHYSICS_SEM_3")}
                  className={`p-4 border-2 text-left transition-all cursor-pointer ${
                    studentCategory === "PHYSICS_SEM_3"
                      ? "border-[#171717] bg-accent-canary text-[#171717] shadow-[3px_3px_0px_#171717]"
                      : "border-[#171717] bg-canvas-paper hover:bg-surface-white text-[#171717]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs">
                      [A] DEPT. FISIKA SMT 3
                    </span>
                    <div className="w-4 h-4 border-2 border-[#171717] flex items-center justify-center bg-surface-white">
                      {studentCategory === "PHYSICS_SEM_3" && (
                        <div className="w-2 h-2 bg-[#171717]" />
                      )}
                    </div>
                  </div>
                  <p className="text-[11px] text-ink-muted">
                    6 Mata Kuliah Lengkap Fisika Murni Semester 3
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setStudentCategory("NON_PHYSICS")}
                  className={`p-4 border-2 text-left transition-all cursor-pointer ${
                    studentCategory === "NON_PHYSICS"
                      ? "border-[#171717] bg-accent-canary text-[#171717] shadow-[3px_3px_0px_#171717]"
                      : "border-[#171717] bg-canvas-paper hover:bg-surface-white text-[#171717]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs">
                      [B] UMUM / NON-FISIKA
                    </span>
                    <div className="w-4 h-4 border-2 border-[#171717] flex items-center justify-center bg-surface-white">
                      {studentCategory === "NON_PHYSICS" && (
                        <div className="w-2 h-2 bg-[#171717]" />
                      )}
                    </div>
                  </div>
                  <p className="text-[11px] text-ink-muted">
                    4 Mata Kuliah Fisika Dasar, Kalkulus &amp; Statistika
                  </p>
                </button>
              </div>

              {/* All-Access Material Pill Badges Container */}
              <div className="bg-canvas-paper border-2 border-[#171717] p-4">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="font-mono text-xs font-bold text-[#171717]">
                    AKSES MODUL MATERI TERMASUK:
                  </span>
                  <span className="font-mono text-[9px] font-bold bg-[#171717] text-accent-canary px-2 py-0.5 border border-[#171717]">
                    ALL-ACCESS
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {activeAllAccessCourses.map((c) => (
                    <span
                      key={c}
                      className="bg-surface-white border border-[#171717] text-[#171717] font-mono text-[10px] font-bold px-2 py-1 shadow-[1px_1px_0px_#171717]"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Package Selection Section */}
            <div className="bg-surface-white border-2 border-[#171717] p-6 sm:p-8 shadow-[4px_4px_0px_#171717]">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3 border-b-2 border-[#171717] pb-3">
                <div>
                  <h3 className="font-extrabold text-base text-[#171717]">
                    Pilih Paket Belajar
                  </h3>
                  <p className="font-mono text-xs text-ink-muted mt-0.5">
                    [PARAM_03] Konfigurasi durasi dan lisensi akun
                  </p>
                </div>

                {/* Billing Cycle Toggle */}
                <div className="flex items-center bg-canvas-paper p-1 border-2 border-[#171717]">
                  <button
                    type="button"
                    onClick={() => {
                      setBillingCycle("FREE")
                      setSelectedPackageId("free")
                    }}
                    className={`px-2.5 py-1.5 font-mono text-xs font-bold transition-all cursor-pointer ${
                      billingCycle === "FREE"
                        ? "bg-[#171717] text-accent-canary shadow-[2px_2px_0px_#171717]"
                        : "text-ink-muted hover:text-[#171717]"
                    }`}
                  >
                    GRATIS
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBillingCycle("MONTHLY")
                      setSelectedPackageId("monthly")
                    }}
                    className={`px-2.5 py-1.5 font-mono text-xs font-bold transition-all cursor-pointer ${
                      billingCycle === "MONTHLY"
                        ? "bg-[#171717] text-accent-canary shadow-[2px_2px_0px_#171717]"
                        : "text-ink-muted hover:text-[#171717]"
                    }`}
                  >
                    BULANAN
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBillingCycle("SEMESTER")
                      setSelectedPackageId("semester")
                    }}
                    className={`px-2.5 py-1.5 font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      billingCycle === "SEMESTER"
                        ? "bg-[#171717] text-accent-canary shadow-[2px_2px_0px_#171717]"
                        : "text-ink-muted hover:text-[#171717]"
                    }`}
                  >
                    <span>SEMESTER</span>
                  </button>
                </div>
              </div>

              {/* Package Options Cards */}
              <div className="space-y-3.5">
                {activePackageList.map((pkg) => {
                  const isSelected = selectedPackage.id === pkg.id
                  const isPkgFree = pkg.planCode === "FREE"

                  return (
                    <div
                      key={pkg.id}
                      onClick={() => {
                        setBillingCycle(pkg.cycle)
                        setSelectedPackageId(pkg.id)
                      }}
                      className={`border-2 border-[#171717] p-5 transition-all cursor-pointer relative ${
                        isSelected
                          ? "bg-accent-canary/15 shadow-[5px_5px_0px_#171717] -translate-x-0.5 -translate-y-0.5"
                          : "bg-surface-white hover:bg-canvas-paper shadow-[2px_2px_0px_#171717]"
                      }`}
                    >
                      {pkg.isPopular && (
                        <span className="absolute -top-3 right-4 bg-[#171717] text-accent-canary border border-[#171717] font-mono text-[9px] font-bold uppercase tracking-wider px-2 py-0.5">
                          [PALING POPULER]
                        </span>
                      )}

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-sm text-[#171717]">
                              {pkg.name}
                            </h4>
                            <span className="font-mono text-[9px] font-bold text-[#171717] bg-accent-canary px-1.5 py-0.5 border border-[#171717] uppercase">
                              {isPkgFree ? "GRATIS" : "COMING SOON"}
                            </span>
                          </div>
                          <p className="font-mono text-xs text-ink-muted mt-1">
                            {pkg.headline}
                          </p>

                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {pkg.features.map((feat, i) => (
                              <span
                                key={i}
                                className="font-mono text-[10px] text-[#171717] bg-canvas-paper border border-[#171717] px-2 py-0.5"
                              >
                                {feat}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#171717]/20">
                          <span className="font-mono text-xl font-extrabold text-[#171717]">
                            {isPkgFree ? "Gratis" : "Coming Soon"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: Invoice Ticket & CTA                       */}
          {/* ======================================================== */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            {/* Purchase Order / Invoice Ticket */}
            <div className="bg-surface-white border-2 border-[#171717] technical-shadow p-6 relative font-mono">
              {/* Ticket Top Banner */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-[#171717]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-accent-canary border border-[#171717]" />
                  <span className="font-mono text-xs font-bold text-[#171717]">
                    RINGKASAN PAKET
                  </span>
                </div>
                <span className="text-[10px] bg-[#171717] text-surface-white px-2 py-0.5">
                  BBN_EDU
                </span>
              </div>

              {/* Itemized Breakdown */}
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-ink-muted">PAKET TERPILIH:</span>
                  <span className="font-bold text-[#171717]">{selectedPackage.name}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-ink-muted">MASA AKTIF:</span>
                  <span className="font-bold text-[#171717]">
                    {selectedPackage.planCode === "SEMESTER"
                      ? "180 HARI (SEMESTER)"
                      : selectedPackage.planCode === "MONTHLY"
                      ? "30 HARI (BULANAN)"
                      : "SELAMANYA (FREEMIUM)"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-ink-muted">JALUR KURIKULUM:</span>
                  <span className="font-bold text-[#171717]">
                    {studentCategory === "PHYSICS_SEM_3"
                      ? "FISIKA SMT 3"
                      : "UMUM / NON-FISIKA"}
                  </span>
                </div>

                {/* Dashed Price Breakdown Divider */}
                <div className="pt-3 border-t-2 border-dashed border-[#171717] flex items-center justify-between">
                  <span className="font-bold text-xs text-[#171717]">TOTAL BIAYA:</span>
                  <span className="text-2xl font-black text-[#171717]">
                    {isFreePlan ? "Gratis" : "Coming Soon"}
                  </span>
                </div>
              </div>

              {isFreePlan ? (
                <div className="border-2 border-[#171717] bg-accent-canary/20 p-4 mt-6 space-y-1.5 text-xs">
                  <div className="font-bold text-[#171717]">
                    AKTIVASI INSTAN TANPA PEMBAYARAN
                  </div>
                  <p className="text-[11px] text-ink-muted leading-relaxed">
                    Paket Gratis membuka akses pratinjau Bab 1 pada setiap mata kuliah dan 1x kuota simulasi latihan/tryout.
                  </p>
                </div>
              ) : (
                <div className="border-2 border-[#171717] bg-canvas-paper p-4 mt-6 space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-[#171717] uppercase">
                      Paket Berbayar Belum Dibuka
                    </span>
                    <span className="text-[10px] bg-accent-canary text-[#171717] px-2 py-0.5 border border-[#171717] font-bold uppercase">
                      Coming Soon
                    </span>
                  </div>
                  <p className="text-[11px] text-ink-muted leading-relaxed font-sans">
                    Informasi harga dan pembayaran untuk paket berbayar akan segera tersedia. Kamu dapat mendaftar menggunakan Paket Gratis terlebih dahulu.
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isFormBusy || !isFreePlan}
                className={`w-full py-4 font-bold font-mono text-xs uppercase tracking-wider border-2 border-[#171717] transition-all mt-6 flex items-center justify-center gap-2 ${
                  isFreePlan
                    ? "bg-accent-canary hover:bg-[#FACC15] text-[#171717] shadow-[4px_4px_0px_#171717] hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#171717] active:translate-y-0 active:shadow-[2px_2px_0px_#171717] cursor-pointer disabled:opacity-50"
                    : "bg-canvas-paper text-ink-muted cursor-not-allowed opacity-80"
                }`}
              >
                {!isFreePlan ? (
                  <span>Coming Soon</span>
                ) : isFormBusy ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-[#171717] border-t-transparent animate-spin inline-block" />
                    <span>MEMPROSES PENDAFTARAN...</span>
                  </>
                ) : (
                  <>
                    <span>DAFTAR PAKET GRATIS</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Duplicate Google Account Prevention Modal */}
      <Dialog
        open={showDuplicateModal}
        onOpenChange={(open) => setShowDuplicateModal(open)}
      >
        <DialogContent className="max-w-md bg-surface-white border-2 border-[#171717] rounded-none p-6 sm:p-8 shadow-[8px_8px_0px_#171717] font-sans relative">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 bg-alert-rust border border-[#171717] inline-block" />
              <span className="font-mono text-xs font-bold text-alert-rust uppercase">
                [ALERT // DUPLICATE_ACCOUNT]
              </span>
            </div>
            <DialogTitle className="text-lg sm:text-xl font-extrabold text-[#171717] tracking-tight">
              Akun Sudah Pernah Terdaftar
            </DialogTitle>
            <DialogDescription className="font-mono text-xs text-ink-muted mt-2 leading-relaxed">
              Alamat email <strong>{duplicateEmail}</strong> telah terdaftar di database BBN Education. Silakan langsung masuk melalui portal login siswa.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4 pt-3 border-t border-[#171717]">
            <Link
              href="/login"
              className="w-full bg-accent-canary hover:bg-[#FACC15] text-[#171717] font-mono text-xs font-bold uppercase py-3 px-4 text-center border-2 border-[#171717] shadow-[3px_3px_0px_#171717] block transition-all"
            >
              MENUJU HALAMAN LOGIN SISWA →
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
