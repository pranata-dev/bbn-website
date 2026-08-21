"use client"

import { Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { APP_NAME } from "@/constants"

function SuccessContent() {
  const searchParams = useSearchParams()
  const type = searchParams.get("type")

  const isRegular = type === "REGULAR"
  const isKelasBesar = type === "KELAS_BESAR"
  const typeLabel = isKelasBesar
    ? "Kelas Tutor Besar"
    : isRegular
    ? "Kelas Reguler"
    : "E-Learning Mandiri"

  return (
    <div className="bg-white max-w-md w-full rounded-3xl shadow-lg border border-[#FFEED6] p-8 sm:p-10 text-center">
      {/* Success Badge / Icon Placeholder */}
      <div 
        className="w-16 h-16 rounded-2xl bg-[#FFEED6] mx-auto mb-6 flex items-center justify-center border border-[#827148]/10"
        aria-label="Success checkmark"
      >
        <div className="w-8 h-8 rounded-xl bg-[#A5AF79] flex items-center justify-center text-white font-bold text-lg shadow-2xs">
          ✓
        </div>
      </div>

      {/* Title & Subtitle */}
      <h1 className="text-2xl sm:text-3xl font-bold text-[#827148] mb-2 tracking-tight">
        Pendaftaran Berhasil!
      </h1>
      <p className="text-sm text-[#827148]/70 mb-6">
        Terima kasih telah mendaftar di {APP_NAME}.
      </p>

      {/* Product Type Pill */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#FFEED6] text-[#827148] rounded-full text-xs font-bold mb-6">
        <div className="w-2 h-2 rounded-full bg-[#A5AF79]" />
        <span>{typeLabel}</span>
      </div>

      {/* Verification Info Box */}
      <div className="bg-[#FFEED6]/30 border border-[#FFEED6] rounded-2xl p-5 text-left mb-8 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#E8A07C]" />
          <h2 className="text-sm font-bold text-[#827148]">
            Menunggu Verifikasi Pembayaran
          </h2>
        </div>
        <p className="text-xs text-[#827148]/75 leading-relaxed font-medium">
          Admin kami akan memverifikasi bukti pembayaran dalam 1x24 jam.
          {isKelasBesar
            ? " Link Zoom masterclass akan dikirimkan via email/WhatsApp setelah disetujui."
            : isRegular
            ? " Kamu akan dihubungi via WhatsApp untuk konfirmasi jadwal kelas."
            : " Akun dan akses paket belajarmu akan aktif otomatis setelah disetujui."}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        <a
          href="https://chat.whatsapp.com/Jw6ZTlTcKkw71epdsigMSz"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3.5 px-4 rounded-xl font-bold text-white text-xs sm:text-sm bg-[#A5AF79] hover:bg-[#949e6a] shadow-xs transition-colors block text-center"
        >
          Gabung Grup WhatsApp Komunitas
        </a>

        <Link
          href="/"
          className="w-full py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm text-[#827148] bg-[#FFEED6]/40 hover:bg-[#FFEED6] transition-colors block text-center"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  )
}

export default function RegisterSuccessPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 relative bg-gradient-to-b from-[#FFEED6]/60 via-[#FFEED6]/30 to-[#FFEED6]/50 font-sans">
      <Suspense fallback={
        <div className="bg-white max-w-md w-full rounded-3xl shadow-lg border border-[#FFEED6] p-12 text-center text-sm text-[#827148]/70">
          Memuat konfirmasi pendaftaran...
        </div>
      }>
        <SuccessContent />
      </Suspense>
    </div>
  )
}
