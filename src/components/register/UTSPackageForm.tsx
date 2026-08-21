"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { MAX_FILE_SIZE, ACCEPTED_IMAGE_TYPES } from "@/constants"
import { createClient } from "@/lib/supabase/client"

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

// All-access curriculum lists as per prompt
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
  isLoading = false,
}: UTSPackageFormProps) {
  // Auth State
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  // Personal Data State (NO NIM)
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

  // Check existing Supabase auth session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setCurrentUser(user)
          const metaName = user.user_metadata?.full_name || user.user_metadata?.name || user.user_metadata?.user_name || ""
          if (metaName) setFullName(metaName)
          if (user.email) setEmail(user.email)
        }
      } catch (err) {
        console.error("Auth check error:", err)
      }
    }
    checkAuth()
  }, [])

  // Sync package selection when billing cycle toggle changes
  useEffect(() => {
    if (billingCycle === "MONTHLY") {
      setSelectedPackageId("einstein_monthly")
    } else {
      setSelectedPackageId("einstein_semester")
    }
  }, [billingCycle])

  // Active package cards list based on duration toggle
  const activePackageList = billingCycle === "MONTHLY" ? BULANAN_PACKAGES : SEMESTER_PACKAGES

  // Currently selected package object
  const selectedPackage = useMemo(() => {
    const all = [...BULANAN_PACKAGES, ...SEMESTER_PACKAGES]
    return all.find((p) => p.id === selectedPackageId) || BULANAN_PACKAGES[2]
  }, [selectedPackageId])

  // Google OAuth Sign-In Handler
  const handleGoogleSignIn = async () => {
    console.log("Google Sign-In initiated...")
    setIsGoogleLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/register`,
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

  // Form Submission & Payload Preparation
  const handleFormSubmit = (e: React.FormEvent) => {
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
      toast.error("Mohon unggah bukti pembayaran SeaBank.")
      return
    }

    const payload: ELearningRegistrationPayload = {
      fullName,
      email,
      whatsapp,
      studentCategory,
      billingCycle,
      selectedPackageId: selectedPackage.id,
      selectedPackageName: selectedPackage.name,
      price: selectedPackage.price,
      paymentProof: activeFile,
    }

    console.log("Submitting E-Learning Registration Payload:", payload)

    if (onSubmit) {
      onSubmit(e, payload)
    } else {
      toast.success("Pendaftaran E-Learning Mandiri berhasil diproses!")
    }
  }

  const activeAllAccessCourses =
    studentCategory === "PHYSICS_SEM_3" ? PHYSICS_SEM_3_COURSES : NON_PHYSICS_COURSES

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
                    className="text-xs text-[#827148]/80 hover:text-[#827148] underline font-semibold px-2 py-1 cursor-pointer transition-colors"
                  >
                    Ganti Akun
                  </button>
                </div>
              ) : (
                /* Google Sign-In Button & Divider */
                <>
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleLoading}
                    className="w-full bg-white hover:bg-[#FFEED6]/20 border-2 border-[#FFEED6] text-[#827148] font-bold rounded-xl py-3 px-4 flex justify-center items-center gap-3 transition-colors shadow-2xs cursor-pointer text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {/* Google Logo Placeholder (Generic Colored Square Dot) */}
                    <div className="w-5 h-5 rounded-md bg-[#FFEED6] flex items-center justify-center p-1 border border-[#827148]/15">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#A5AF79]" />
                    </div>
                    <span>{isGoogleLoading ? "Menghubungkan ke Google..." : "Daftar dengan Google"}</span>
                  </button>

                  {/* Visual Divider */}
                  <div className="flex items-center my-6 gap-3 text-xs text-[#827148]/60 font-semibold uppercase tracking-wider">
                    <span className="flex-1 border-t border-[#FFEED6]" />
                    <span>Atau isi formulir di bawah</span>
                    <span className="flex-1 border-t border-[#FFEED6]" />
                  </div>
                </>
              )}

              {/* Personal Data Fields (NO NIM) */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="el-fullname" className="text-sm font-semibold text-[#827148] mb-1.5 block">
                    Nama Lengkap
                  </label>
                  <input
                    id="el-fullname"
                    type="text"
                    placeholder="Masukkan nama lengkap"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full py-3 px-4 rounded-xl border border-[#FFEED6] bg-white text-sm text-[#827148] placeholder:text-[#827148]/40 focus:outline-none focus:ring-2 focus:ring-[#A5AF79] focus:border-transparent transition-all shadow-2xs"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="el-email" className="text-sm font-semibold text-[#827148] mb-1.5 block">
                    Email
                  </label>
                  <input
                    id="el-email"
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full py-3 px-4 rounded-xl border border-[#FFEED6] bg-white text-sm text-[#827148] placeholder:text-[#827148]/40 focus:outline-none focus:ring-2 focus:ring-[#A5AF79] focus:border-transparent transition-all shadow-2xs"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="el-whatsapp" className="text-sm font-semibold text-[#827148] mb-1.5 block">
                    Nomor WhatsApp
                  </label>
                  <input
                    id="el-whatsapp"
                    type="tel"
                    placeholder="08xxxxxxxxxx"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full py-3 px-4 rounded-xl border border-[#FFEED6] bg-white text-sm text-[#827148] placeholder:text-[#827148]/40 focus:outline-none focus:ring-2 focus:ring-[#A5AF79] focus:border-transparent transition-all shadow-2xs"
                    required
                  />
                  <p className="text-[11px] text-[#827148]/70 mt-1 font-medium">
                    Format: 08xx, 62xx, atau +62xx
                  </p>
                </div>
              </div>

              {/* 3. Curriculum Category & Access List (CRITICAL UPDATE) */}
              <div className="pt-6 mt-6 border-t border-[#FFEED6] space-y-4">
                <div>
                  <label className="text-sm font-semibold text-[#827148] mb-2 block">
                    Apakah kamu mahasiswa Departemen Fisika Semester 3?
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setStudentCategory("PHYSICS_SEM_3")}
                      className={`py-3 px-4 rounded-xl text-sm font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 ${studentCategory === "PHYSICS_SEM_3"
                          ? "bg-[#A5AF79] text-white border-[#A5AF79] shadow-xs"
                          : "bg-white text-[#827148] border-[#FFEED6] hover:border-[#A5AF79] hover:bg-[#FFEED6]/20"
                        }`}
                    >
                      <div className={`w-2.5 h-2.5 rounded-full ${studentCategory === "PHYSICS_SEM_3" ? "bg-white" : "bg-[#827148]/30"}`} />
                      <span>Iya</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStudentCategory("NON_PHYSICS")}
                      className={`py-3 px-4 rounded-xl text-sm font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 ${studentCategory === "NON_PHYSICS"
                          ? "bg-[#A5AF79] text-white border-[#A5AF79] shadow-xs"
                          : "bg-white text-[#827148] border-[#FFEED6] hover:border-[#A5AF79] hover:bg-[#FFEED6]/20"
                        }`}
                    >
                      <div className={`w-2.5 h-2.5 rounded-full ${studentCategory === "NON_PHYSICS" ? "bg-white" : "bg-[#827148]/30"}`} />
                      <span>Bukan</span>
                    </button>
                  </div>
                </div>

                {/* All-Access Materials Box with Pill Badges */}
                <div className="bg-[#FFEED6]/30 border border-[#FFEED6] rounded-2xl p-5 mt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1.5 h-4 bg-[#A5AF79] rounded-full" />
                    <h4 className="text-sm font-bold text-[#827148]">
                      Materi All-Access yang akan kamu dapatkan:
                    </h4>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {activeAllAccessCourses.map((course) => (
                      <span
                        key={course}
                        className="bg-white border border-[#A5AF79] text-[#827148] text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-2xs"
                      >
                        {course}
                      </span>
                    ))}
                  </div>

                  <p className="text-[11px] text-[#827148]/70 mt-3 font-medium">
                    {studentCategory === "PHYSICS_SEM_3"
                      ? "*Mencakup seluruh kurikulum semester 3 Departemen Fisika IPB."
                      : "*Mencakup seluruh modul Fisika Dasar, Matematika, dan Statistika."}
                  </p>
                </div>
              </div>

            </div>

            {/* 4. Package Selection Area (Horizontal Cards) */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-[#FFEED6] space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-[#827148] tracking-tight">
                    Pilih Tipe Paket
                  </h3>
                  <p className="text-xs sm:text-sm text-[#827148]/70 mt-0.5 font-medium">
                    Pilih durasi akses dan fitur belajar mandiri yang kamu inginkan.
                  </p>
                </div>

                {/* Duration Pill-shaped Toggle */}
                <div className="bg-[#FFEED6]/50 p-1.5 rounded-full flex border border-[#FFEED6] shrink-0 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setBillingCycle("MONTHLY")}
                    className={`py-2 px-4 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${billingCycle === "MONTHLY"
                        ? "bg-[#A5AF79] text-white shadow-xs"
                        : "text-[#827148] hover:bg-[#FFEED6]"
                      }`}
                  >
                    Bulanan
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingCycle("SEMESTER")}
                    className={`py-2 px-4 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${billingCycle === "SEMESTER"
                        ? "bg-[#A5AF79] text-white shadow-xs"
                        : "text-[#827148] hover:bg-[#FFEED6]"
                      }`}
                  >
                    <span>Semester Pass</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#E8A07C] text-white font-bold">
                      Hemat
                    </span>
                  </button>
                </div>
              </div>

              {/* HORIZONTAL CARDS CONTAINER - NO overflow-hidden, spacing on top for badges */}
              <div className="space-y-6 pt-3 mt-6">
                {activePackageList.map((pkg) => {
                  const isSelected = selectedPackageId === pkg.id

                  return (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPackageId(pkg.id)}
                      className={`relative bg-white rounded-2xl border-2 p-6 transition-all duration-200 cursor-pointer flex flex-col md:flex-row items-stretch justify-between ${isSelected
                          ? "border-[#A5AF79] bg-[#A5AF79]/5 shadow-md -translate-y-0.5"
                          : "border-[#FFEED6] hover:border-[#A5AF79] hover:-translate-y-0.5 shadow-2xs"
                        }`}
                    >
                      {/* CRITICAL: Absolute Top Badges (No overflow-hidden on parent so fully visible) */}
                      {pkg.isPopular && (
                        <div className="absolute -top-4 left-6 bg-[#E8A07C] text-white text-[10px] uppercase tracking-wider font-bold py-1 px-3.5 rounded-full shadow-xs z-10">
                          PALING POPULER
                        </div>
                      )}

                      {pkg.discountBadge && (
                        <div className={`absolute -top-4 ${pkg.isPopular ? "left-38" : "left-6"} bg-[#A5AF79] text-white text-[10px] font-bold py-1 px-3 rounded-full shadow-xs z-10`}>
                          {pkg.discountBadge}
                        </div>
                      )}

                      {/* LEFT SIDE OF HORIZONTAL CARD: Name, Description & Price */}
                      <div className="md:w-1/3 md:border-r border-dashed border-gray-200 pr-4 pb-4 md:pb-0 border-b md:border-b-0 flex flex-col justify-between">
                        <div>
                          <h4 className="text-lg font-bold text-[#827148] leading-tight">
                            {pkg.name}
                          </h4>
                          <p className="text-xs font-semibold text-[#827148]/70 mt-1 leading-snug">
                            {pkg.headline}
                          </p>
                        </div>

                        <div className="mt-4">
                          {pkg.originalPrice && (
                            <p className="text-xs text-[#827148]/50 line-through font-semibold mb-0.5">
                              {formatRupiah(pkg.originalPrice)}
                            </p>
                          )}
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-extrabold text-[#827148] tracking-tight">
                              {formatRupiah(pkg.price)}
                            </span>
                            <span className="text-xs text-[#827148]/65 font-medium">
                              {pkg.cycle === "MONTHLY" ? "/ bulan" : "/ semester"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* RIGHT SIDE OF HORIZONTAL CARD: Features list & Selection button */}
                      <div className="md:w-2/3 pl-0 md:pl-4 mt-4 md:mt-0 flex flex-col justify-between">
                        <div className="space-y-2 mb-5">
                          {pkg.features.map((feature, i) => (
                            <div key={i} className="flex items-start gap-2.5 text-xs text-[#827148] font-medium leading-snug">
                              <div className="w-3.5 h-3.5 rounded-full bg-[#A5AF79]/20 flex items-center justify-center shrink-0 mt-0.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#A5AF79]" />
                              </div>
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>

                        <button
                          type="button"
                          className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-colors cursor-pointer text-center ${isSelected
                              ? "bg-[#A5AF79] text-white shadow-2xs"
                              : "bg-[#FFEED6]/40 text-[#827148] hover:bg-[#FFEED6]"
                            }`}
                        >
                          {isSelected ? "Paket Terpilih ✓" : "Pilih Paket Ini"}
                        </button>
                      </div>

                    </div>
                  )
                })}
              </div>
            </div>

          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN (Summary & Payment - Sticky on Desktop)     */}
          {/* ======================================================== */}
          <div className="lg:col-span-5 lg:sticky lg:top-8 flex flex-col space-y-6">

            {/* 1. Order Summary Card (Ringkasan Tagihan) */}
            <div className="bg-white border-2 border-[#FFEED6] rounded-3xl p-6 shadow-sm">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <div className="w-5 h-5 rounded-md bg-[#A5AF79] mr-2.5 flex items-center justify-center shadow-2xs">
                    <div className="w-2 h-2 rounded-xs bg-white" />
                  </div>
                  <h3 className="text-base font-bold text-[#827148]">
                    Ringkasan Tagihan
                  </h3>
                </div>
                <span className="bg-[#FFEED6] text-[#827148] px-3 py-1 rounded-full text-xs font-bold">
                  {billingCycle === "MONTHLY" ? "Bulanan" : "Semester Pass"}
                </span>
              </div>

              {/* Dynamic Content */}
              <div className="space-y-3 text-sm text-[#827148]/80 font-medium">
                <div className="flex justify-between items-center">
                  <span>Paket Aktif</span>
                  <span className="font-bold text-[#827148]">
                    {selectedPackage.name}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Kategori Kurikulum</span>
                  <span className="font-bold text-[#827148] truncate max-w-[200px] text-right">
                    {studentCategory === "PHYSICS_SEM_3" ? "Dept. Fisika Smt 3" : "Umum / Non-Fisika"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Periode Akses</span>
                  <span className="font-bold text-[#827148]">
                    {selectedPackage.cycle === "MONTHLY" ? "30 Hari (1 Bulan)" : "6 Bulan (1 Semester)"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Biaya Layanan</span>
                  <span className="font-bold text-[#A5AF79]">
                    Gratis
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="border-b-2 border-dashed border-[#FFEED6] my-4" />

              {/* Grand Total Row */}
              <div className="flex justify-between items-end mb-2">
                <div>
                  <p className="text-xs text-[#827148]/70 uppercase tracking-wider font-semibold">
                    Total Pembayaran
                  </p>
                  <p className="text-xs text-[#827148]/60 mt-0.5">
                    (Akses semua materi kategori)
                  </p>
                </div>

                <div className="text-right">
                  {selectedPackage.originalPrice && (
                    <p className="text-xs text-[#827148]/50 line-through font-semibold mb-0.5">
                      {formatRupiah(selectedPackage.originalPrice)}
                    </p>
                  )}
                  <span className="text-2xl font-extrabold text-[#827148] tracking-tight">
                    {formatRupiah(selectedPackage.price)}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Payment Instructions Card (SeaBank) */}
            <div className="bg-[#FFEED6]/30 border border-[#FFEED6] rounded-3xl p-6 shadow-2xs">
              {/* Title */}
              <div className="flex items-center mb-2">
                <div className="w-5 h-5 bg-[#A5AF79] rounded-md mr-3 flex items-center justify-center shadow-2xs">
                  <div className="w-2 h-2 rounded-xs bg-white" />
                </div>
                <h4 className="font-bold text-sm text-[#827148]">
                  Pembayaran via SeaBank
                </h4>
              </div>

              {/* Instruction */}
              <p className="text-xs text-[#827148]/80 mb-4 font-medium leading-relaxed">
                Silakan lakukan transfer ke nomor berikut sesuai dengan total tagihan.
              </p>

              {/* Details Box */}
              <div className="bg-white border border-[#FFEED6] rounded-2xl p-4 flex justify-between items-center shadow-2xs">
                <div>
                  <span className="text-[10px] font-bold text-[#827148]/60 uppercase tracking-wider block mb-0.5">
                    NOMOR SEABANK
                  </span>
                  <span className="text-lg font-extrabold text-[#827148] tracking-wider block">
                    901790900641
                  </span>
                  <span className="text-xs text-[#827148]/80 font-medium block mt-0.5">
                    a.n. Najwa Aaliyah Priyatna
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCopySeaBank}
                  className="bg-[#A5AF79] hover:bg-[#949e6a] text-white text-xs px-4 py-2 rounded-xl font-bold transition-colors cursor-pointer shadow-2xs shrink-0"
                >
                  {copiedBank ? "Tersalin ✓" : "Salin"}
                </button>
              </div>
            </div>

            {/* 3. File Upload Box */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#827148] block">
                Bukti Pembayaran
              </label>

              <div className="relative">
                <input
                  id="el-payment-proof"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <label
                  htmlFor="el-payment-proof"
                  className="border-2 border-dashed border-[#A5AF79] bg-white rounded-2xl p-8 text-center flex flex-col items-center justify-center cursor-pointer hover:bg-[#FFEED6]/10 transition-colors shadow-2xs"
                >
                  {activePreview ? (
                    <div className="relative w-full flex items-center justify-center">
                      <img
                        src={activePreview}
                        alt="Bukti Transfer"
                        className="max-h-32 object-contain rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-[#827148]">
                      <div className="w-10 h-10 rounded-xl bg-[#FFEED6] flex items-center justify-center border border-[#827148]/10">
                        <div className="w-3.5 h-3.5 rounded-sm bg-[#A5AF79]" />
                      </div>
                      <span className="text-sm font-bold text-[#827148]">
                        Klik untuk unggah bukti transfer SeaBank
                      </span>
                      <span className="text-xs text-[#827148]/70 font-medium">
                        JPG, PNG, WebP (maks. 5MB)
                      </span>
                    </div>
                  )}
                </label>

                {activeFile && (
                  <button
                    type="button"
                    onClick={handleClearFile}
                    aria-label="Hapus bukti pembayaran"
                    className="absolute top-3 right-3 w-7 h-7 bg-[#E8A07C] hover:bg-[#d8916e] text-white rounded-full flex items-center justify-center font-bold text-xs shadow-sm transition-colors cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              {activeFile && (
                <p className="text-xs text-[#827148]/80 font-medium">
                  {activeFile.name} ({(activeFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            {/* 4. Submit Button & Footer Link */}
            <div className="space-y-4 pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#E8A07C] hover:bg-[#E8A07C]/90 active:bg-[#d8916e] text-white font-bold rounded-xl py-4 transition-colors shadow-sm cursor-pointer text-center text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Memproses pendaftaran..." : "Daftar & Aktivasi Akun"}
              </button>

              <p className="text-center text-xs sm:text-sm text-[#827148]/80">
                Sudah punya akun?{" "}
                <Link
                  href="/login"
                  className="font-bold text-[#A5AF79] hover:underline"
                >
                  Masuk
                </Link>
              </p>
            </div>

          </div>

        </div>
      </form>
    </div>
  )
}
