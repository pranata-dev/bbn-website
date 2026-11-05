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
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 md:p-12 relative bg-gradient-to-b from-[#FFEED6]/60 via-[#FFEED6]/30 to-[#FFEED6]/50 font-sans">
      {/* 1. TOP NAVIGATION: BACK BUTTON */}
      <div className="absolute top-6 left-6 sm:top-8 sm:left-8 z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#827148] hover:text-[#A5AF79] transition-colors py-2 px-3 rounded-xl bg-white/80 hover:bg-white border border-[#FFEED6] shadow-2xs backdrop-blur-xs"
        >
          <span>&larr;</span>
          <span>Kembali ke beranda</span>
        </Link>
      </div>

      {/* 2. MAIN REGISTRATION CARD CONTAINER */}
      <div className={`bg-white ${containerMaxWidth} w-full rounded-3xl shadow-lg border border-[#FFEED6] p-6 sm:p-10 md:p-12 z-10 relative transition-all duration-300`}>
        {/* Header Area */}
        <div className="text-center">
          {/* Top Center Placeholder */}
          <div
            className="w-12 h-12 bg-[#FFEED6] rounded-xl mx-auto mb-4 flex items-center justify-center border border-[#827148]/10"
            aria-label="Logo placeholder"
          >
            <div className="w-4 h-4 rounded-md bg-[#A5AF79]" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-[#827148] mb-2 tracking-tight">
            Daftar Sekarang
          </h1>

          {/* Subtitle */}
          <p className="text-sm text-[#827148]/70 mb-10">
            {currentStep === 1
              ? "Pilih layanan yang sesuai dengan kebutuhanmu."
              : "Lengkapi data dan selesaikan pendaftaran paket belajarmu."}
          </p>
        </div>

        {/* STEP 1: SERVICE SELECTION */}
        {currentStep === 1 && (
          <div>
            {/* 3. STEP INDICATOR */}
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 rounded-lg bg-[#E8A07C] text-white flex items-center justify-center font-bold mr-3 text-sm shadow-2xs">
                1
              </div>
              <h2 className="text-lg font-bold text-[#827148]">
                Pilih Layanan
              </h2>
            </div>

            {/* 4. SERVICE SELECTION GRID (3 Columns) */}
            <ProductSelector
              selected={selectedType}
              onSelect={handleProductSelect}
            />

            {/* 5. ACTION AREA */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#FFEED6]">
              <p className="text-xs sm:text-sm text-[#827148]/80">
                Sudah punya akun?{" "}
                <Link
                  href="/login"
                  className="font-bold text-[#A5AF79] hover:underline"
                >
                  Masuk di sini
                </Link>
              </p>

              <button
                type="button"
                onClick={handleProceedToStep2}
                disabled={!selectedType || selectedType === "KELAS_BESAR"}
                className="w-full sm:w-auto bg-[#E8A07C] hover:bg-[#E8A07C]/90 active:bg-[#d8916e] text-white font-bold py-3 px-8 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span>Lanjut Isi Data</span>
                <span>&rarr;</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: FILL DETAILS & CHECKOUT */}
        {currentStep === 2 && (
          <div>
            {/* Step 2 Header & Switch Service Button */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#FFEED6]">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-lg bg-[#E8A07C] text-white flex items-center justify-center font-bold mr-3 text-sm shadow-2xs">
                  2
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#827148]">
                    {selectedType === "REGULAR"
                      ? "Formulir Pendaftaran & Checkout Kelas Reguler"
                      : selectedType === "UTS"
                      ? "Formulir Pendaftaran E-Learning Mandiri"
                      : "Isi Detail Pendaftaran"}
                  </h2>
                  <p className="text-xs text-[#827148]/70 font-medium">
                    Layanan terpilih:{" "}
                    <span className="font-bold text-[#827148]">
                      {selectedType === "REGULAR"
                        ? "Kelas Reguler"
                        : selectedType === "UTS"
                        ? "E-Learning Mandiri"
                        : "Kelas Tutor Besar"}
                    </span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="text-xs font-semibold text-[#827148] hover:text-[#A5AF79] px-3.5 py-2 rounded-xl border border-[#FFEED6] bg-[#FFEED6]/20 hover:bg-[#FFEED6]/40 transition-colors cursor-pointer"
              >
                &larr; Ubah Layanan
              </button>
            </div>

            {/* DYNAMIC FORM VIEWS */}
            {selectedType === "REGULAR" ? (
              /* Dedicated 2-column layout for Kelas Reguler */
              <RegularClassForm
                paymentFile={paymentFile}
                paymentPreview={paymentPreview}
                onPaymentChange={handlePaymentChange}
                onSubmit={handleRegularSubmit}
                isLoading={isLoading}
              />
            ) : selectedType === "UTS" ? (
              /* Dedicated 2-column layout for E-Learning Mandiri */
              <UTSPackageForm
                paymentFile={paymentFile}
                paymentPreview={paymentPreview}
                onPaymentChange={handlePaymentChange}
                onSubmit={handleUTSSubmit}
                isLoading={isLoading}
              />
            ) : (
              /* Standard form for Kelas Besar */
              <form onSubmit={handleKelasBesarSubmit} aria-label="Formulir pendaftaran">
                <div className="space-y-6 max-w-2xl mx-auto">
                  <KelasBesarForm
                    formData={kelasBesarData}
                    onChange={setKelasBesarData}
                    paymentFile={paymentFile}
                    paymentPreview={paymentPreview}
                    onPaymentChange={handlePaymentChange}
                  />

                  <div className="mt-8 pt-6 border-t border-[#FFEED6] space-y-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-[#E8A07C] hover:bg-[#E8A07C]/90 active:bg-[#d8916e] text-white font-bold py-3.5 px-8 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    >
                      {isLoading ? "Memproses pendaftaran..." : "Daftar Sekarang"}
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
              </form>
            )}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* DUPLICATE ACCOUNT MODAL DIALOG                            */}
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
              Akun Google/Email <strong>{duplicateEmail}</strong> ini sudah pernah digunakan di Belajar Bareng Nata. Silakan langsung menuju halaman Login.
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

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FFEED6]/30 flex items-center justify-center">Memuat...</div>}>
      <RegisterContent />
    </Suspense>
  )
}
