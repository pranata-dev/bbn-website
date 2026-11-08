"use client"

import { useState, useRef, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import {
  ProductSelector,
  RegularClassForm,
  UTSPackageForm,
  KelasBesarForm,
} from "@/components/register"
import type { KelasBesarFormState } from "@/components/register"
import type { RegistrationType } from "@/lib/validators/registration"
import { WHATSAPP_REGEX } from "@/constants"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ArrowLeft, ArrowRight, UserPlus, ShieldAlert } from "lucide-react"

const initialKelasBesarData: KelasBesarFormState = {
  name: "",
  email: "",
  password: "",
  nim: "",
  subject: "",
  whatsapp: "",
}

function RegisterContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState<1 | 2>(1)
  const [isLoading, setIsLoading] = useState(false)
  const isSubmittingRef = useRef(false)
  const [selectedType, setSelectedType] = useState<RegistrationType | null>("UTS")

  // Duplicate Account Modal State
  const [showDuplicateModal, setShowDuplicateModal] = useState(false)
  const [duplicateEmail, setDuplicateEmail] = useState("")

  // Auto-switch to step 2 if returning from Google OAuth (?step=details)
  useEffect(() => {
    const stepParam = searchParams.get("step")
    if (stepParam === "details" || stepParam === "2") {
      setCurrentStep(2)
    }
  }, [searchParams])

  // Form states
  const [kelasBesarData, setKelasBesarData] = useState<KelasBesarFormState>(initialKelasBesarData)

  // Payment file states
  const [paymentFile, setPaymentFile] = useState<File | null>(null)
  const [paymentPreview, setPaymentPreview] = useState<string | null>(null)

  const handlePaymentChange = (file: File | null, preview: string | null) => {
    setPaymentFile(file)
    setPaymentPreview(preview)
  }

  const handleProductSelect = (type: RegistrationType) => {
    setSelectedType(type)
    if (paymentPreview) URL.revokeObjectURL(paymentPreview)
    setPaymentFile(null)
    setPaymentPreview(null)
  }

  const handleProceedToStep2 = () => {
    if (!selectedType) {
      toast.error("Pilih jenis layanan terlebih dahulu.")
      return
    }
    setCurrentStep(2)
  }

  const validateKelasBesar = (): boolean => {
    if (!kelasBesarData.name || kelasBesarData.name.length < 3) {
      toast.error("Nama minimal 3 karakter.")
      return false
    }
    if (!kelasBesarData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(kelasBesarData.email)) {
      toast.error("Email tidak valid.")
      return false
    }
    if (!kelasBesarData.password || kelasBesarData.password.length < 6) {
      toast.error("Password minimal 6 karakter.")
      return false
    }
    if (!kelasBesarData.nim || kelasBesarData.nim.length < 5) {
      toast.error("NIM minimal 5 karakter.")
      return false
    }
    if (!kelasBesarData.subject) {
      toast.error("Pilih mata kuliah dan jadwal.")
      return false
    }
    if (!WHATSAPP_REGEX.test(kelasBesarData.whatsapp)) {
      toast.error("Format nomor WhatsApp tidak valid.")
      return false
    }
    if (!paymentFile) {
      toast.error("Mohon unggah bukti pembayaran.")
      return false
    }
    return true
  }

  const handleKelasBesarSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isSubmittingRef.current) return
    isSubmittingRef.current = true

    if (!validateKelasBesar()) {
      isSubmittingRef.current = false
      return
    }

    // Check duplicate account
    try {
      const checkRes = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: kelasBesarData.email }),
      })
      const checkData = await checkRes.json()
      if (checkData.exists) {
        setDuplicateEmail(kelasBesarData.email)
        setShowDuplicateModal(true)
        isSubmittingRef.current = false
        return
      }
    } catch (err) {
      console.warn("Pre-check error:", err)
    }

    setIsLoading(true)

    try {
      const formPayload = new FormData()
      formPayload.append("type", "KELAS_BESAR")
      formPayload.append("paymentProof", paymentFile!)
      formPayload.append("name", kelasBesarData.name)
      formPayload.append("fullName", kelasBesarData.name)
      formPayload.append("email", kelasBesarData.email)
      formPayload.append("password", kelasBesarData.password)
      formPayload.append("nim", kelasBesarData.nim)
      formPayload.append("subject", kelasBesarData.subject)
      formPayload.append("whatsapp", kelasBesarData.whatsapp)
      formPayload.append("phone", kelasBesarData.whatsapp)

      const response = await fetch("/api/register", {
        method: "POST",
        body: formPayload,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Terjadi kesalahan saat mendaftar.")
      }

      toast.success("Pendaftaran berhasil! Mengalihkan ke halaman verifikasi...")
      router.push(`/waiting-approval`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan.")
    } finally {
      setIsLoading(false)
      isSubmittingRef.current = false
    }
  }

  const handleRegularSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      toast.success("Pendaftaran Kelas Reguler berhasil! Silakan menunggu verifikasi admin.")
      router.push(`/waiting-approval`)
    }, 1000)
  }

  const handleUTSSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      toast.success("Pendaftaran E-Learning Mandiri berhasil! Silakan menunggu verifikasi admin.")
      router.push(`/waiting-approval`)
    }, 1000)
  }

  const containerMaxWidth = currentStep === 2 ? "max-w-7xl" : "max-w-5xl"

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 md:p-12 relative bg-canvas-paper bg-grid-blueprint font-sans selection:bg-accent-canary selection:text-[#171717]">
      {/* 1. TOP NAVIGATION: MECHANICAL BREADCRUMB */}
      <div className="absolute top-6 left-6 sm:top-8 sm:left-8 z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 border border-[#171717] bg-surface-white text-ink-muted hover:text-[#171717] text-[10px] font-mono uppercase tracking-wider px-3 py-1.5 technical-shadow-sm hover:bg-accent-canary transition-all"
        >
          <ArrowLeft className="w-3 h-3" />
          <span>KEMBALI KE BERANDA</span>
        </Link>
      </div>

      {/* 2. MAIN REGISTRATION CARD CONTAINER */}
      <div
        className={`bg-surface-white ${containerMaxWidth} w-full border-2 border-[#171717] technical-shadow p-6 sm:p-10 md:p-12 z-10 relative transition-all duration-300`}
      >
        {/* Corner Accents */}
        <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-[#171717]" />
        <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-[#171717]" />
        <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-[#171717]" />
        <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-[#171717]" />

        {/* Header Prompt Area */}
        <div className="text-center mb-8 pb-6 border-b-2 border-[#171717]">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 bg-accent-canary border border-[#171717] inline-block" />
            <span className="font-mono text-xs font-bold text-alert-rust uppercase tracking-wider">
              [SYS.REGISTRATION] // USER_ENROLLMENT
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#171717] tracking-tight">
            Registrasi Pengguna
          </h1>
          <p className="font-mono text-xs sm:text-sm text-ink-muted mt-2 max-w-xl mx-auto">
            {currentStep === 1
              ? "Pilih jenis layanan platform belajar yang sesuai dengan kebutuhan akademikmu."
              : "Lengkapi data diri mahasiswa dan selesaikan verifikasi bukti pembayaran transfer."}
          </p>
        </div>

        {/* STEP 1: SERVICE SELECTION */}
        {currentStep === 1 && (
          <div>
            {/* Step Indicator */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="bg-[#171717] text-accent-canary font-mono text-xs font-bold px-3 py-1 border border-[#171717]">
                  [STEP 01/02: PILIH LAYANAN]
                </span>
                <span className="font-mono text-xs font-bold text-[#171717] hidden sm:inline">
                  PILIH PAKET BELAJAR
                </span>
              </div>
              <span className="font-mono text-[11px] text-ink-muted">
                SELEKSI MODUL
              </span>
            </div>

            {/* Service Selection Grid */}
            <ProductSelector
              selected={selectedType}
              onSelect={handleProductSelect}
            />

            {/* Action Area */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t-2 border-[#171717]">
              <p className="font-mono text-xs text-ink-muted">
                Sudah memiliki akun terdaftar?{" "}
                <Link
                  href="/login"
                  className="font-bold text-[#171717] underline hover:text-alert-rust"
                >
                  MASUK DI SINI →
                </Link>
              </p>

              <button
                type="button"
                onClick={handleProceedToStep2}
                disabled={!selectedType || selectedType === "KELAS_BESAR"}
                className="w-full sm:w-auto bg-accent-canary hover:bg-[#FACC15] text-[#171717] font-mono text-xs font-bold uppercase py-3.5 px-8 border-2 border-[#171717] shadow-[4px_4px_0px_#171717] hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#171717] active:translate-y-0 active:shadow-[2px_2px_0px_#171717] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span>LANJUT KE PENGISIAN DATA</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: FILL DETAILS & CHECKOUT */}
        {currentStep === 2 && (
          <div>
            {/* Step 2 Header & Switch Service Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b-2 border-[#171717]">
              <div className="flex items-center gap-3">
                <span className="bg-[#171717] text-accent-canary font-mono text-xs font-bold px-3 py-1 border border-[#171717]">
                  [STEP 02/02]
                </span>
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-[#171717]">
                    {selectedType === "REGULAR"
                      ? "Formulir Pendaftaran & Checkout Kelas Reguler"
                      : selectedType === "UTS"
                      ? "Formulir Pendaftaran E-Learning Mandiri"
                      : "Isi Detail Pendaftaran"}
                  </h2>
                  <p className="font-mono text-xs text-ink-muted mt-0.5">
                    Layanan Terpilih:{" "}
                    <span className="font-bold text-[#171717]">
                      {selectedType === "REGULAR"
                        ? "KELAS REGULER"
                        : selectedType === "UTS"
                        ? "E-LEARNING MANDIRI"
                        : "KELAS TUTOR BESAR"}
                    </span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="font-mono text-xs font-bold text-[#171717] hover:bg-canvas-paper px-3.5 py-2 border-2 border-[#171717] bg-surface-white shadow-[2px_2px_0px_#171717] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer self-start sm:self-auto"
              >
                ← UBAH LAYANAN
              </button>
            </div>

            {/* DYNAMIC FORM VIEWS */}
            {selectedType === "REGULAR" ? (
              <RegularClassForm
                paymentFile={paymentFile}
                paymentPreview={paymentPreview}
                onPaymentChange={handlePaymentChange}
                onSubmit={handleRegularSubmit}
                isLoading={isLoading}
              />
            ) : selectedType === "UTS" ? (
              <UTSPackageForm
                paymentFile={paymentFile}
                paymentPreview={paymentPreview}
                onPaymentChange={handlePaymentChange}
                onSubmit={handleUTSSubmit}
                isLoading={isLoading}
              />
            ) : (
              <form onSubmit={handleKelasBesarSubmit} aria-label="Formulir pendaftaran">
                <div className="space-y-6 max-w-2xl mx-auto">
                  <KelasBesarForm
                    formData={kelasBesarData}
                    onChange={setKelasBesarData}
                    paymentFile={paymentFile}
                    paymentPreview={paymentPreview}
                    onPaymentChange={handlePaymentChange}
                  />

                  <div className="mt-8 pt-6 border-t-2 border-[#171717] space-y-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-4 bg-accent-canary hover:bg-[#FACC15] text-[#171717] font-bold font-mono text-xs uppercase tracking-wider border-2 border-[#171717] shadow-[4px_4px_0px_#171717] hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#171717] transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isLoading ? "MEMPROSES PENDAFTARAN..." : "DAFTAR SEKARANG →"}
                    </button>

                    <p className="text-center font-mono text-xs text-ink-muted">
                      Sudah memiliki akun?{" "}
                      <Link
                        href="/login"
                        className="font-bold text-[#171717] underline hover:text-alert-rust"
                      >
                        MASUK DI SINI
                      </Link>
                    </p>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Duplicate Account Modal Dialog */}
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
              Alamat email <strong>{duplicateEmail}</strong> sudah terdaftar di sistem BBN Education. Silakan langsung menuju portal login siswa.
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

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-canvas-paper bg-grid-blueprint flex items-center justify-center font-mono text-xs text-ink-muted">
          &gt; MEMUAT MODUL REGISTRASI...
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  )
}
