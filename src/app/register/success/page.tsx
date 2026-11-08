"use client"

import { Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { APP_NAME } from "@/constants"
import { Check, MessageCircle, ArrowRight, ShieldCheck } from "lucide-react"

function SuccessContent() {
  const searchParams = useSearchParams()
  const type = searchParams.get("type")

  const isRegular = type === "REGULAR"
  const isKelasBesar = type === "KELAS_BESAR"
  const typeLabel = isKelasBesar
    ? "KELAS TUTOR BESAR"
    : isRegular
    ? "KELAS REGULER"
    : "E-LEARNING MANDIRI"

  return (
    <div className="bg-surface-white max-w-lg w-full border-2 border-[#171717] technical-shadow p-8 sm:p-10 relative font-sans">
      {/* Corner Accents */}
      <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-[#171717]" />
      <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-[#171717]" />
      <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-[#171717]" />
      <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-[#171717]" />

      {/* Header Telemetry */}
      <div className="flex items-center justify-between border-b-2 border-[#171717] pb-3 mb-6">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-emerald-600 border border-[#171717] inline-block animate-pulse" />
          <span className="font-mono text-[10px] font-bold text-alert-rust uppercase tracking-wider">
            [STATUS // REGISTRATION_SUBMITTED]
          </span>
        </div>
        <span className="font-mono text-[10px] font-bold bg-accent-canary px-2 py-0.5 border border-[#171717] text-[#171717]">
          VERIFIKASI PENDING
        </span>
      </div>

      {/* Success Badge */}
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-[#171717] text-accent-canary flex items-center justify-center font-bold text-lg border border-[#171717] mx-auto mb-3 shadow-[2px_2px_0px_#171717]">
          <Check className="w-6 h-6 stroke-[3]" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171717] tracking-tight">
          Pendaftaran Berhasil!
        </h1>
        <p className="font-mono text-xs text-ink-muted mt-1">
          Terima kasih telah mendaftar di platform BBN Education.
        </p>

        {/* Product Type Pill */}
        <div className="mt-3 inline-block font-mono text-[11px] font-bold px-3 py-1 bg-accent-canary text-[#171717] border border-[#171717]">
          LAYANAN: {typeLabel}
        </div>
      </div>

      {/* Verification Info Box */}
      <div className="bg-canvas-paper border-2 border-[#171717] p-4 text-left mb-6 space-y-2 font-mono text-xs">
        <div className="flex items-center gap-2 border-b border-[#171717]/20 pb-2">
          <span className="w-2 h-2 bg-alert-rust border border-[#171717]" />
          <h2 className="font-bold text-[#171717]">
            PROSES VERIFIKASI PEMBAYARAN (1X24 JAM)
          </h2>
        </div>
        <p className="text-ink-muted text-[11px] leading-relaxed">
          Tim administrator kami akan memverifikasi bukti transfer pembayaran Anda dalam kurun waktu 1x24 jam.
          {isKelasBesar
            ? " Tautan masterclass akan dikirimkan via email atau WhatsApp setelah aktivasi."
            : isRegular
            ? " Admin akan menghubungi Anda via WhatsApp untuk penjadwalan sesi tatap muka."
            : " Akun dan akses penuh modul/tryout Anda akan diaktifkan secara otomatis setelah disetujui."}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 font-mono text-xs">
        <a
          href="https://chat.whatsapp.com/Jw6ZTlTcKkw71epdsigMSz"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3.5 px-4 font-bold text-[#171717] bg-accent-canary hover:bg-[#FACC15] border-2 border-[#171717] shadow-[3px_3px_0px_#171717] hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#171717] transition-all block text-center uppercase cursor-pointer"
        >
          <div className="flex items-center justify-center gap-2">
            <MessageCircle className="w-4 h-4 text-emerald-800" />
            <span>GABUNG GRUP WHATSAPP KOMUNITAS</span>
          </div>
        </a>

        <Link
          href="/"
          className="w-full py-3 px-4 font-bold text-[#171717] bg-surface-white hover:bg-canvas-paper border-2 border-[#171717] shadow-[2px_2px_0px_#171717] hover:translate-x-[1px] hover:translate-y-[1px] transition-all block text-center uppercase"
        >
          KEMBALI KE BERANDA
        </Link>
      </div>
    </div>
  )
}

export default function RegisterSuccessPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 relative bg-canvas-paper bg-grid-blueprint font-sans selection:bg-accent-canary selection:text-[#171717]">
      <Suspense
        fallback={
          <div className="bg-surface-white max-w-md w-full border-2 border-[#171717] technical-shadow p-12 text-center font-mono text-xs text-ink-muted">
            &gt; MEMUAT KONFIRMASI PENDAFTARAN...
          </div>
        }
      >
        <SuccessContent />
      </Suspense>
    </div>
  )
}
