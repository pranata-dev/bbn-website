"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { MAX_FILE_SIZE, ACCEPTED_IMAGE_TYPES } from "@/constants"
import { createClient } from "@/lib/supabase/client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export type StudentCategory = "PHYSICS_SEM_3" | "NON_PHYSICS"
export type BillingCycle = "MONTHLY" | "SEMESTER"

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

export interface UTSPackageFormProps {
  paymentFile?: File | null
  paymentPreview?: string | null
  onPaymentChange?: (file: File | null, preview: string | null) => void
  onSubmit?: (e: React.FormEvent, payload?: ELearningRegistrationPayload) => void
  isLoading?: boolean
  // Backwards compatibility props
  formData?: any
  onChange?: (data: any) => void
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

interface PackageOption {
  id: string
  name: string
  cycle: BillingCycle
  price: number
  originalPrice?: number
  discountBadge?: string
  headline: string
  features: string[]
  isPopular?: boolean
}

const BULANAN_PACKAGES: PackageOption[] = [
  {
    id: "flux_monthly",
    name: "Flux Session",
    cycle: "MONTHLY",
    price: 35000,
    headline: "Rangkuman Materi & Latihan Mandiri",
    features: [
      "Akses Rangkuman Materi Lengkap",
      "Bank Soal Latihan Mandiri",
      "Sistem Auto-Save Jawaban",
      "Akses Penuh 30 Hari",
    ],
    isPopular: false,
  },
  {
    id: "senku_monthly",
    name: "Berotak Senku Mode",
    cycle: "MONTHLY",
    price: 50000,
    headline: "Materi + 2x Simulasi Tryout Eksklusif",
    features: [
      "Semua Fitur Flux Session",
      "2x Simulasi Tryout Eksklusif",
      "Pembahasan Soal Interaktif",
      "Akses Penuh 30 Hari",
    ],
    isPopular: false,
  },
  {
    id: "einstein_monthly",
    name: "Einstein Mode",
    cycle: "MONTHLY",
    price: 60000,
    headline: "Akses Penuh Modul & Unlimited Tryout",
    features: [
      "Akses Penuh Semua Modul & Bank Soal",
      "Unlimited Tryout & Pembahasan Lengkap",
      "Leaderboard Ranking Nasional",
      "Akses Grup Diskusi Komunitas",
    ],
    isPopular: true,
  },
]

const SEMESTER_PACKAGES: PackageOption[] = [
  {
    id: "senku_semester",
    name: "Berotak Senku Semester",
    cycle: "SEMESTER",
    price: 149000,
    originalPrice: 300000,
    discountBadge: "Hemat Diskon",
    headline: "Persiapan Lengkap Selama 1 Semester",
    features: [
      "Rangkuman Materi 1 Semester Penuh",
      "Tryout Berkala & Pembahasan Lengkap",
      "Leaderboard Ranking Semester",
      "Akses Penuh 6 Bulan",
    ],
    isPopular: false,
  },
  {
    id: "einstein_semester",
    name: "Einstein Semester Pass",
    cycle: "SEMESTER",
    price: 199000,
    originalPrice: 360000,
    discountBadge: "Hemat Diskon",
    headline: "All-Access Pass Terbaik untuk IPK 4.0",
    features: [
      "All-Access Pass Semua Materi & Soal",
      "Unlimited Tryout & Pembahasan Intensif",
      "Ranking Leaderboard Semester",
      "Akses Grup Komunitas 6 Bulan",
    ],
    isPopular: true,
  },
]

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

export function UTSPackageForm({
  paymentFile: propPaymentFile,
  paymentPreview: propPaymentPreview,
  onPaymentChange: propOnPaymentChange,
  onSubmit,
  isLoading: propIsLoading = false,
}: UTSPackageFormProps) {
  const router = useRouter()

  // Auth State
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Duplicate Account Modal State
  const [showDuplicateModal, setShowDuplicateModal] = useState(false)
  const [duplicateEmail, setDuplicateEmail] = useState("")

  // Personal Data State
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [whatsapp, setWhatsapp] = useState("")

  // Curriculum & Package Selection States
  const [studentCategory, setStudentCategory] = useState<StudentCategory>("PHYSICS_SEM_3")
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("MONTHLY")
  const [selectedPackageId, setSelectedPackageId] = useState<string>("einstein_monthly")

  // Payment / File Upload State
  const [localPaymentFile, setLocalPaymentFile] = useState<File | null>(null)
  const [localPaymentPreview, setLocalPaymentPreview] = useState<string | null>(null)
  const [copiedBank, setCopiedBank] = useState(false)

  const activeFile = propPaymentFile !== undefined ? propPaymentFile : localPaymentFile
  const activePreview = propPaymentPreview !== undefined ? propPaymentPreview : localPaymentPreview

  // Check existing Supabase auth session on mount & verify duplicate
  useEffect(() => {
    const checkAuthAndDuplicate = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          setCurrentUser(user)
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
    if (billingCycle === "MONTHLY") {
      setSelectedPackageId("einstein_monthly")
    } else {
      setSelectedPackageId("einstein_semester")
    }
  }, [billingCycle])

  const activePackageList =
    billingCycle === "MONTHLY" ? BULANAN_PACKAGES : SEMESTER_PACKAGES

  const selectedPackage = useMemo(() => {
    const all = [...BULANAN_PACKAGES, ...SEMESTER_PACKAGES]
    return all.find((p) => p.id === selectedPackageId) || BULANAN_PACKAGES[2]
  }, [selectedPackageId])

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
    } catch (error: any) {
      console.error("Google sign-in error:", error)
      toast.error(error?.message || "Gagal masuk dengan Google. Silakan coba lagi.")
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

  // File Upload Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Format file tidak didukung. Gunakan JPG, PNG, atau WebP.")
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("Ukuran file maksimal 5MB.")
      return
    }

    const preview = URL.createObjectURL(file)
    if (propOnPaymentChange) {
      propOnPaymentChange(file, preview)
    } else {
      setLocalPaymentFile(file)
      setLocalPaymentPreview(preview)
    }
  }

  const handleClearFile = () => {
    if (activePreview) URL.revokeObjectURL(activePreview)
    if (propOnPaymentChange) {
      propOnPaymentChange(null, null)
    } else {
      setLocalPaymentFile(null)
      setLocalPaymentPreview(null)
    }
  }

  const handleCopySeaBank = async () => {
    const accountNumber = "901790900641"
    try {
      await navigator.clipboard.writeText(accountNumber)
      setCopiedBank(true)
      toast.success("Nomor rekening SeaBank berhasil disalin!")
      setTimeout(() => setCopiedBank(false), 2500)
    } catch {
      toast.error("Gagal menyalin nomor rekening.")
    }
  }

  const formatRupiah = (val: number) => `Rp ${val.toLocaleString("id-ID")}`

  // Form Submission & Database Sync
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

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
    if (!activeFile) {
      toast.error("Mohon unggah bukti pembayaran transfer SeaBank.")
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
      const { data: { session } } = await supabase.auth.getSession()
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
      formPayload.append("billingCycle", billingCycle)
      formPayload.append("billing_cycle", billingCycle)
      formPayload.append("selectedPackageId", selectedPackage.id)
      formPayload.append("selectedPackageName", selectedPackage.name)
      formPayload.append("packageType", selectedPackage.id)
      formPayload.append("price", String(selectedPackage.price))
      formPayload.append("paymentProof", activeFile)
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

      toast.success("Pendaftaran berhasil! Mengalihkan ke halaman verifikasi...")
      router.push("/waiting-approval")
    } catch (error: any) {
      console.error("Submission error:", error)
      toast.error(error?.message || "Terjadi kesalahan saat mendaftar.")
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
        {/* 2-Column Grid Layout for Desktop (1-Column on Mobile) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* ======================================================== */}
          {/* LEFT COLUMN (Auth, Form, Curriculum & Packages)          */}
          {/* ======================================================== */}
          <div className="lg:col-span-7 space-y-6">

            {/* 1. Google Sign-In & Personal Data Container */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-[#FFEED6] mb-6">
              
              {/* Authenticated State vs Google Sign-In Button */}
              {currentUser ? (
                /* Authenticated User Badge */
                <div className="bg-[#A5AF79]/15 border border-[#A5AF79] rounded-2xl p-4 flex items-center justify-between shadow-2xs mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#A5AF79] text-white flex items-center justify-center font-bold text-sm shadow-2xs">
                      ✓
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#827148]">
                        Masuk sebagai {fullName || currentUser.email}
                      </p>
                      <p className="text-[11px] text-[#827148]/70 font-medium">
                        {email || currentUser.email} • Akun Google Terhubung
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSignOutGoogle}
                    className="text-xs font-bold text-[#827148] hover:text-[#E8A07C] underline cursor-pointer"
                  >
                    Ganti Akun
                  </button>
                </div>
              ) : (
                /* Google Sign-In Button */
                <div className="mb-6">
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleLoading}
                    className="w-full bg-white border-2 border-[#FFEED6] text-[#827148] font-bold rounded-xl py-3.5 px-4 flex justify-center items-center gap-3 transition-colors hover:bg-gray-50 cursor-pointer shadow-2xs disabled:opacity-60 text-sm"
                  >
                    <div className="w-5 h-5 rounded-md bg-[#FFEED6] flex items-center justify-center p-1 border border-[#827148]/15">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#A5AF79]" />
                    </div>
                    <span>
                      {isGoogleLoading
                        ? "Menghubungkan ke Google..."
                        : "Daftar Cepat dengan Google"}
                    </span>
                  </button>

                  <div className="flex items-center my-5 gap-3 text-xs text-gray-400 font-semibold uppercase tracking-wider">
                    <span className="flex-1 border-t border-[#FFEED6]" />
                    <span>ATAU ISI MANUAL</span>
                    <span className="flex-1 border-t border-[#FFEED6]" />
                  </div>
                </div>
              )}

              {/* Data Diri Form */}
              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="text-xs font-bold text-[#827148] mb-1.5 block">
                    Nama Lengkap <span className="text-[#E8A07C]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Najwa Aaliyah Priyatna"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-white border-2 border-[#FFEED6] focus:border-[#A5AF79] focus:outline-none text-xs font-medium text-[#827148] placeholder:text-[#827148]/40 px-3.5 py-3 rounded-xl shadow-2xs transition-colors"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="text-xs font-bold text-[#827148] mb-1.5 block">
                    Alamat Email <span className="text-[#E8A07C]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border-2 border-[#FFEED6] focus:border-[#A5AF79] focus:outline-none text-xs font-medium text-[#827148] placeholder:text-[#827148]/40 px-3.5 py-3 rounded-xl shadow-2xs transition-colors"
                  />
                </div>

                {/* WhatsApp Number */}
                <div>
                  <label className="text-xs font-bold text-[#827148] mb-1.5 block">
                    Nomor WhatsApp <span className="text-[#E8A07C]">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="08xxxxxxxxxx"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full bg-white border-2 border-[#FFEED6] focus:border-[#A5AF79] focus:outline-none text-xs font-medium text-[#827148] placeholder:text-[#827148]/40 px-3.5 py-3 rounded-xl shadow-2xs transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* 2. Curriculum Category Selection */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-[#FFEED6]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#A5AF79]" />
                <h3 className="text-base font-extrabold text-[#827148]">
                  Pilih Kategori Kurikulum
                </h3>
              </div>
              <p className="text-xs text-[#827148]/70 font-medium mb-4">
                Pilih jalur kurikulum mata kuliah yang sedang kamu tempuh di semester ini.
              </p>

              {/* Radio Group / Toggle Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                <button
                  type="button"
                  onClick={() => setStudentCategory("PHYSICS_SEM_3")}
                  className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer shadow-2xs ${
                    studentCategory === "PHYSICS_SEM_3"
                      ? "border-[#A5AF79] bg-[#A5AF79]/10"
                      : "border-[#FFEED6] bg-white hover:border-[#A5AF79]/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-[#827148]">
                      Dept. Fisika Smt 3
                    </span>
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        studentCategory === "PHYSICS_SEM_3"
                          ? "border-[#A5AF79] bg-[#A5AF79]"
                          : "border-[#827148]/30"
                      }`}
                    >
                      {studentCategory === "PHYSICS_SEM_3" && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>
                  </div>
                  <p className="text-[11px] text-[#827148]/70">
                    6 Mata Kuliah Lengkap Fisika Murni Semester 3
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setStudentCategory("NON_PHYSICS")}
                  className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer shadow-2xs ${
                    studentCategory === "NON_PHYSICS"
                      ? "border-[#A5AF79] bg-[#A5AF79]/10"
                      : "border-[#FFEED6] bg-white hover:border-[#A5AF79]/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-[#827148]">
                      Umum / Non-Fisika
                    </span>
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        studentCategory === "NON_PHYSICS"
                          ? "border-[#A5AF79] bg-[#A5AF79]"
                          : "border-[#827148]/30"
                      }`}
                    >
                      {studentCategory === "NON_PHYSICS" && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>
                  </div>
                  <p className="text-[11px] text-[#827148]/70">
                    4 Mata Kuliah Fisika Dasar, Kalkulus & Statistika
                  </p>
                </button>
              </div>

              {/* All-Access Material Pill Badges Container */}
              <div className="bg-[#FFEED6]/30 border border-[#FFEED6] rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-[#827148]">
                    Akses Materi Termasuk:
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#A5AF79] bg-white px-2 py-0.5 rounded-md border border-[#FFEED6]">
                    All-Access
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {activeAllAccessCourses.map((c) => (
                    <span
                      key={c}
                      className="bg-white border border-[#FFEED6] text-[#827148] text-xs font-semibold px-3 py-1.5 rounded-xl shadow-2xs"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Package Selection Section */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-[#FFEED6]">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div>
                  <h3 className="text-base font-extrabold text-[#827148]">
                    Pilih Paket Belajar
                  </h3>
                  <p className="text-xs text-[#827148]/70 font-medium mt-0.5">
                    Pilih durasi dan fasilitas belajar yang kamu inginkan.
                  </p>
                </div>

                {/* Billing Cycle Toggle */}
                <div className="flex items-center bg-[#FFEED6]/50 p-1 rounded-2xl border border-[#FFEED6]">
                  <button
                    type="button"
                    onClick={() => setBillingCycle("MONTHLY")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      billingCycle === "MONTHLY"
                        ? "bg-[#A5AF79] text-white shadow-2xs"
                        : "text-[#827148] hover:bg-[#FFEED6]"
                    }`}
                  >
                    Bulanan
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingCycle("SEMESTER")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      billingCycle === "SEMESTER"
                        ? "bg-[#A5AF79] text-white shadow-2xs"
                        : "text-[#827148] hover:bg-[#FFEED6]"
                    }`}
                  >
                    <span>Semester Pass</span>
                    <span className="text-[9px] bg-[#E8A07C] text-white font-black px-1.5 py-0.5 rounded-md">
                      HEMAT
                    </span>
                  </button>
                </div>
              </div>

              {/* Package Options Cards */}
              <div className="space-y-4">
                {activePackageList.map((pkg) => {
                  const isSelected = selectedPackageId === pkg.id

                  return (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPackageId(pkg.id)}
                      className={`rounded-2xl border-2 p-5 transition-all cursor-pointer relative shadow-2xs ${
                        isSelected
                          ? "border-[#A5AF79] bg-[#A5AF79]/10"
                          : "border-[#FFEED6] bg-white hover:border-[#A5AF79]/40"
                      }`}
                    >
                      {pkg.isPopular && (
                        <span className="absolute -top-3 right-4 bg-[#E8A07C] text-white text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-2xs">
                          Paling Populer
                        </span>
                      )}

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-sm text-[#827148]">
                              {pkg.name}
                            </h4>
                            {pkg.discountBadge && (
                              <span className="text-[10px] font-bold text-[#E8A07C] bg-[#E8A07C]/15 px-2 py-0.5 rounded-md">
                                {pkg.discountBadge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#827148]/70 mt-1">
                            {pkg.headline}
                          </p>

                          <div className="flex flex-wrap gap-2 mt-3">
                            {pkg.features.map((feat, i) => (
                              <span
                                key={i}
                                className="text-[11px] font-medium text-[#827148]/80 bg-white/80 border border-[#FFEED6] px-2.5 py-0.5 rounded-lg"
                              >
                                ✓ {feat}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#FFEED6]">
                          {pkg.originalPrice && (
                            <span className="text-xs text-gray-400 line-through block">
                              {formatRupiah(pkg.originalPrice)}
                            </span>
                          )}
                          <span className="text-lg font-black text-[#827148]">
                            {formatRupiah(pkg.price)}
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
          {/* RIGHT COLUMN (Order Summary, Payment, Upload & Checkout) */}
          {/* ======================================================== */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            
            {/* Order Summary Card */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-[#FFEED6]">
              <h3 className="text-base font-extrabold text-[#827148] mb-4 pb-2 border-b border-[#FFEED6]">
                Ringkasan Pendaftaran
              </h3>

              <div className="space-y-3 text-xs text-[#827148]">
                <div className="flex items-center justify-between">
                  <span className="text-[#827148]/70">Paket Terpilih:</span>
                  <span className="font-bold text-[#827148]">
                    {selectedPackage.name}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#827148]/70">Durasi:</span>
                  <span className="font-bold text-[#827148]">
                    {billingCycle === "SEMESTER" ? "6 Bulan (1 Semester)" : "30 Hari"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#827148]/70">Kategori:</span>
                  <span className="font-bold text-[#827148]">
                    {studentCategory === "PHYSICS_SEM_3"
                      ? "Fisika Semester 3"
                      : "Umum / Non-Fisika"}
                  </span>
                </div>

                <div className="pt-3 border-t border-[#FFEED6] flex items-center justify-between text-sm">
                  <span className="font-bold text-[#827148]">Total Pembayaran:</span>
                  <span className="text-xl font-black text-[#827148]">
                    {formatRupiah(selectedPackage.price)}
                  </span>
                </div>
              </div>

              {/* SeaBank Transfer Details */}
              <div className="bg-[#FFEED6]/40 border border-[#FFEED6] rounded-2xl p-4 mt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#827148]">
                    Transfer Bank (SeaBank)
                  </span>
                  <span className="text-[10px] font-bold uppercase text-[#A5AF79] bg-white px-2 py-0.5 rounded-md border border-[#FFEED6]">
                    Manual
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-[#FFEED6]">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-bold block">
                        No. Rekening
                      </span>
                      <span className="font-mono font-bold text-xs sm:text-sm text-[#827148]">
                        901790900641
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopySeaBank}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[#FFEED6]/50 hover:bg-[#FFEED6] text-[#827148] transition-colors cursor-pointer"
                    >
                      {copiedBank ? "Tersalin ✓" : "Salin"}
                    </button>
                  </div>
                  <span className="text-[11px] text-[#827148]/70 mt-1.5 block font-medium">
                    a.n. Najwa Aaliyah Priyatna
                  </span>
                </div>
              </div>

              {/* File Upload Box */}
              <div className="mt-6">
                <label className="text-xs font-bold text-[#827148] mb-2 block">
                  Unggah Bukti Transfer <span className="text-[#E8A07C]">*</span>
                </label>

                {activePreview ? (
                  <div className="relative border-2 border-[#A5AF79] rounded-2xl p-3 bg-[#A5AF79]/10 flex items-center justify-between">
                    <div className="flex items-center gap-3 truncate">
                      <div className="w-8 h-8 rounded-lg bg-[#A5AF79] text-white flex items-center justify-center font-bold text-xs shrink-0">
                        ✓
                      </div>
                      <span className="text-xs font-bold text-[#827148] truncate">
                        {activeFile?.name || "Bukti Transfer Terunggah"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearFile}
                      className="text-xs font-bold text-[#E8A07C] hover:underline shrink-0 ml-2 cursor-pointer"
                    >
                      Hapus
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-[#A5AF79] hover:border-[#827148] bg-[#FFEED6]/20 hover:bg-[#FFEED6]/40 rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-colors block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="w-10 h-10 rounded-2xl bg-[#FFEED6] flex items-center justify-center border border-[#827148]/15 mb-2 shadow-2xs">
                      <div className="w-3.5 h-3.5 rounded-xs bg-[#A5AF79]" />
                    </div>
                    <span className="text-xs font-bold text-[#827148]">
                      Klik untuk unggah bukti transfer SeaBank
                    </span>
                    <span className="text-[10px] text-[#827148]/60 mt-1">
                      JPG, PNG, atau WebP (Maksimal 5MB)
                    </span>
                  </label>
                )}
              </div>

              {/* Submit Checkout Button */}
              <button
                type="submit"
                disabled={isFormBusy}
                className="w-full bg-[#A5AF79] hover:bg-[#949e6a] active:bg-[#8f9864] text-white font-bold rounded-xl py-4 px-4 mt-6 text-sm sm:text-base shadow-sm transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isFormBusy ? (
                  <>
                    <div className="w-2 h-2 rounded-full bg-white animate-ping" />
                    <span>Memproses Pendaftaran...</span>
                  </>
                ) : (
                  <span>Daftar & Konfirmasi Pembayaran</span>
                )}
              </button>
            </div>

          </div>

        </div>
      </form>

      {/* ======================================================== */}
      {/* TASK 1: DUPLICATE GOOGLE ACCOUNT PREVENTION MODAL         */}
      {/* ======================================================== */}
      <Dialog
        open={showDuplicateModal}
        onOpenChange={(open) => setShowDuplicateModal(open)}
      >
        <DialogContent className="max-w-md bg-white border-2 border-[#FFEED6] rounded-3xl p-6 sm:p-8 shadow-lg font-sans">
          <DialogHeader>
            <div className="w-12 h-12 rounded-2xl bg-[#E8A07C]/20 border border-[#E8A07C]/40 flex items-center justify-center mx-auto mb-3 shadow-2xs">
              <div className="w-4 h-4 rounded-xs bg-[#E8A07C]" />
            </div>
            <DialogTitle className="text-lg sm:text-xl font-bold text-[#827148] text-center">
              Akun Sudah Terdaftar
            </DialogTitle>
            <DialogDescription className="text-sm text-[#827148]/80 text-center leading-relaxed mt-2">
              Akun Google dengan email <strong>{duplicateEmail}</strong> ini sudah pernah digunakan di Belajar Bareng Nata. Silakan langsung masuk melalui halaman Login.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4">
            <Link
              href="/login"
              className="w-full bg-[#A5AF79] hover:bg-[#949e6a] text-white font-bold rounded-xl py-3 px-4 text-center text-sm sm:text-base shadow-2xs transition-colors block cursor-pointer"
            >
              Menuju Halaman Login
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
