"use client"

import type { RegistrationType } from "@/lib/validators/registration"
import { BUSINESS_CONFIG } from "@/config/business"
import { Sparkles, MessageCircle, CheckCircle, ArrowRight } from "lucide-react"

interface ProductSelectorProps {
  selected: RegistrationType | null
  onSelect: (type: RegistrationType) => void
}

export function ProductSelector({ selected, onSelect }: ProductSelectorProps) {
  const isSelected = selected === "UTS"

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      {/* 1. Primary: E-Learning Platform */}
      <div
        onClick={() => onSelect("UTS")}
        className={`rounded-3xl border-2 p-6 sm:p-7 transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer ${
          isSelected
            ? "border-olive bg-olive/5 shadow-md -translate-y-0.5"
            : "border-border hover:border-olive/50 bg-card hover:-translate-y-0.5"
        }`}
      >
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-olive/15 text-olive">
              <Sparkles className="w-3.5 h-3.5" /> Paket Utama
            </span>
            {isSelected && (
              <span className="w-6 h-6 rounded-full bg-olive text-white flex items-center justify-center text-xs font-bold shadow-xs">
                ✓
              </span>
            )}
          </div>

          <h3 className="font-bold text-foreground text-xl mb-1.5 leading-snug">
            E-Learning Platform BBN
          </h3>
          <p className="text-xs font-bold text-olive uppercase tracking-wider mb-3">
            Akses Penuh Modul & Tryout CBT
          </p>

          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            Akses instan modul rangkuman lengkap, formula LaTeX interaktif, audio podcast, serta bank soal CBT dengan penilaian otomatis server-side.
          </p>

          <div className="flex flex-wrap gap-2">
            <span className="bg-muted text-foreground text-xs px-3 py-1 rounded-lg font-medium">
              Modul Interaktif
            </span>
            <span className="bg-muted text-foreground text-xs px-3 py-1 rounded-lg font-medium">
              Simulasi CBT
            </span>
            <span className="bg-muted text-foreground text-xs px-3 py-1 rounded-lg font-medium">
              Pembahasan Soal
            </span>
          </div>
        </div>

        <div className="pt-6 mt-6 border-t border-border flex items-center justify-between text-xs font-semibold text-olive">
          <span>Daftar paket belajar mandiri</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>

      {/* 2. Secondary: Offline / Private Tutoring Inquiry */}
      <div className="rounded-3xl border-2 border-border/80 bg-muted/20 p-6 sm:p-7 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300">
              <MessageCircle className="w-3.5 h-3.5" /> Bimbingan Offline
            </span>
          </div>

          <h3 className="font-bold text-foreground text-xl mb-1.5 leading-snug">
            Bimbingan Tatap Muka & Privat
          </h3>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
            Offline & Kelas Khusus
          </p>

          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            Ingin belajar tatap muka langsung bersama Nata atau menyusun jadwal privat kelompok kecil? Pendaftaran offline diproses langsung melalui WhatsApp admin.
          </p>

          <div className="flex flex-wrap gap-2">
            <span className="bg-muted text-muted-foreground text-xs px-3 py-1 rounded-lg font-medium">
              Jadwal Fleksibel
            </span>
            <span className="bg-muted text-muted-foreground text-xs px-3 py-1 rounded-lg font-medium">
              Privat 1-on-1
            </span>
            <span className="bg-muted text-muted-foreground text-xs px-3 py-1 rounded-lg font-medium">
              Grup Belajar
            </span>
          </div>
        </div>

        <div className="pt-6 mt-6 border-t border-border">
          <a
            href={`https://wa.me/${BUSINESS_CONFIG.contact.adminWhatsapp.replace(/\D/g, "")}?text=${encodeURIComponent("Halo Admin Belajar Bareng Nata, saya ingin mendaftar bimbingan tatap muka / offline privat.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 bg-card hover:bg-muted text-foreground border border-border rounded-xl py-2.5 px-4 font-semibold text-xs transition-colors cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            Konsultasi via WhatsApp Admin
          </a>
        </div>
      </div>
    </div>
  )
}
