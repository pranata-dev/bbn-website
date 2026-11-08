"use client"

import type { RegistrationType } from "@/lib/validators/registration"
import { BUSINESS_CONFIG } from "@/config/business"
import { Sparkles, MessageCircle, ArrowRight, Check } from "lucide-react"

interface ProductSelectorProps {
  selected: RegistrationType | null
  onSelect: (type: RegistrationType) => void
}

export function ProductSelector({ selected, onSelect }: ProductSelectorProps) {
  const isSelected = selected === "UTS"

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto font-sans">
      {/* 1. Primary: E-Learning Platform */}
      <div
        onClick={() => onSelect("UTS")}
        className={`border-2 border-[#171717] p-6 sm:p-7 transition-all relative flex flex-col justify-between cursor-pointer ${
          isSelected
            ? "bg-accent-canary/15 shadow-[6px_6px_0px_#171717] -translate-x-0.5 -translate-y-0.5"
            : "bg-surface-white hover:bg-canvas-paper shadow-[3px_3px_0px_#171717] hover:shadow-[5px_5px_0px_#171717] hover:-translate-x-0.5 hover:-translate-y-0.5"
        }`}
      >
        <div>
          {/* Header Badge */}
          <div className="flex items-center justify-between mb-4">
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold px-2.5 py-1 bg-accent-canary text-[#171717] border border-[#171717] uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              [01] PAKET UTAMA // E-LEARNING
            </span>
            {isSelected && (
              <span className="w-6 h-6 bg-[#171717] text-accent-canary flex items-center justify-center font-bold text-xs border border-[#171717]">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </span>
            )}
          </div>

          <h3 className="font-extrabold text-[#171717] text-xl mb-1 leading-snug">
            E-Learning Platform BBN
          </h3>
          <p className="font-mono text-xs font-bold text-alert-rust uppercase tracking-wider mb-3">
            AKSES PENUH MODUL &amp; TRYOUT CBT
          </p>

          <p className="text-xs sm:text-sm text-ink-muted mb-6 leading-relaxed">
            Akses instan modul rangkuman lengkap, formula LaTeX interaktif, audio podcast, serta bank soal CBT dengan penilaian otomatis server-side.
          </p>

          <div className="flex flex-wrap gap-2">
            <span className="bg-canvas-paper text-[#171717] font-mono text-[10px] font-bold px-2.5 py-1 border border-[#171717]">
              MODUL INTERAKTIF
            </span>
            <span className="bg-canvas-paper text-[#171717] font-mono text-[10px] font-bold px-2.5 py-1 border border-[#171717]">
              SIMULASI CBT
            </span>
            <span className="bg-canvas-paper text-[#171717] font-mono text-[10px] font-bold px-2.5 py-1 border border-[#171717]">
              PEMBAHASAN SOAL
            </span>
          </div>
        </div>

        <div className="pt-5 mt-6 border-t-2 border-[#171717] flex items-center justify-between font-mono text-xs font-bold text-[#171717]">
          <span>PILIH PAKET BELAJAR MANDIRI</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>

      {/* 2. Secondary: Offline / Private Tutoring Inquiry */}
      <div className="border-2 border-[#171717] bg-canvas-paper p-6 sm:p-7 flex flex-col justify-between shadow-[3px_3px_0px_#171717]">
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold px-2.5 py-1 bg-surface-white text-[#171717] border border-[#171717] uppercase tracking-wider">
              <MessageCircle className="w-3 h-3 text-emerald-700" />
              [02] BIMBINGAN OFFLINE
            </span>
          </div>

          <h3 className="font-extrabold text-[#171717] text-xl mb-1 leading-snug">
            Bimbingan Tatap Muka &amp; Privat
          </h3>
          <p className="font-mono text-xs font-bold text-ink-muted uppercase tracking-wider mb-3">
            OFFLINE &amp; KELAS KHUSUS
          </p>

          <p className="text-xs sm:text-sm text-ink-muted mb-6 leading-relaxed">
            Ingin belajar tatap muka langsung bersama Nata atau menyusun jadwal privat kelompok kecil? Pendaftaran offline diproses langsung melalui WhatsApp admin.
          </p>

          <div className="flex flex-wrap gap-2">
            <span className="bg-surface-white text-[#171717] font-mono text-[10px] font-bold px-2.5 py-1 border border-[#171717]">
              JADWAL FLEKSIBEL
            </span>
            <span className="bg-surface-white text-[#171717] font-mono text-[10px] font-bold px-2.5 py-1 border border-[#171717]">
              PRIVAT 1-ON-1
            </span>
            <span className="bg-surface-white text-[#171717] font-mono text-[10px] font-bold px-2.5 py-1 border border-[#171717]">
              GRUP BELAJAR
            </span>
          </div>
        </div>

        <div className="pt-5 mt-6 border-t-2 border-[#171717]">
          <a
            href={`https://wa.me/${BUSINESS_CONFIG.contact.adminWhatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
              "Halo Admin Belajar Bareng Nata, saya ingin mendaftar bimbingan tatap muka / offline privat."
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 bg-surface-white hover:bg-accent-canary text-[#171717] border-2 border-[#171717] py-2.5 px-4 font-mono font-bold text-xs uppercase shadow-[2px_2px_0px_#171717] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#171717] transition-all cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
            <span>KONSULTASI VIA WHATSAPP ADMIN</span>
          </a>
        </div>
      </div>
    </div>
  )
}
