"use client"

import Link from "next/link"
import { BUSINESS_CONFIG } from "@/config/business"

const PLATFORM_LINKS = [
  { label: "Katalog Silabus", href: "#program" },
  { label: "Spesifikasi Fitur", href: "#fitur" },
  { label: "Metodologi Belajar", href: "#cara-kerja" },
  { label: "Pilihan Harga", href: "#harga" },
  { label: "Tanya Jawab (FAQ)", href: "#faq" },
]

const LEGAL_LINKS = [
  { label: "Kebijakan Privasi", href: "#faq" },
  { label: "Syarat & Ketentuan", href: "#faq" },
  { label: "Pedoman Lisensi Kurikulum", href: "#program" },
]

export function Footer() {
  return (
    <footer className="w-full bg-[#171717] text-canvas-paper border-t border-[#171717] pt-16 pb-12">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Registry Area (4 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 md:gap-12 pb-12 border-b border-surface-white/15">
          {/* Column 1: Brand & Terminal Registry Info (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-start space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <span className="size-3 bg-alert-rust shrink-0 rounded-none group-hover:rotate-45 transition-transform" />
              <span className="font-sans font-extrabold text-xl tracking-tight text-surface-white">
                BBN Education
              </span>
              <span className="font-mono text-[10px] px-1.5 py-0.5 bg-surface-white/10 border border-surface-white/20 text-accent-canary font-semibold">
                SYS_V2.4.0
              </span>
            </Link>

            <p className="font-sans text-xs sm:text-sm text-canvas-paper/75 leading-relaxed max-w-sm">
              Platform bimbingan belajar dan tryout interaktif untuk mahasiswa dan pelajar. Belajar fisika lebih terarah, sistematis, dan siap ujian dari prinsip pertama.
            </p>

            {/* Direct Contact Links */}
            <div className="flex flex-col gap-2 font-mono text-xs pt-2">
              <a
                href={`mailto:${BUSINESS_CONFIG.contact.emailSenderAddress}`}
                className="flex items-center gap-2 text-canvas-paper/80 hover:text-accent-canary transition-colors hover:underline"
              >
                <span className="text-accent-canary">&gt;</span>
                <span>EMAIL: {BUSINESS_CONFIG.contact.emailSenderAddress}</span>
              </a>
              <a
                href={`https://wa.me/${BUSINESS_CONFIG.contact.adminWhatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-canvas-paper/80 hover:text-accent-canary transition-colors hover:underline"
              >
                <span className="text-accent-canary">&gt;</span>
                <span>WHATSAPP ADMIN: +{BUSINESS_CONFIG.contact.adminWhatsapp}</span>
              </a>
            </div>
          </div>

          {/* Column 2: Platform Links (3 cols) */}
          <div className="lg:col-span-3 flex flex-col space-y-3">
            <div className="font-mono text-xs uppercase tracking-widest text-surface-white font-bold pb-1 flex items-center gap-2 border-b border-surface-white/15">
              <span>{"// PLATFORM_INDEX"}</span>
            </div>
            <ul className="space-y-2 font-mono text-xs">
              {PLATFORM_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-canvas-paper/70 hover:text-surface-white hover:underline transition-colors block py-0.5"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Legal & Standards (2 cols) */}
          <div className="lg:col-span-2 flex flex-col space-y-3">
            <div className="font-mono text-xs uppercase tracking-widest text-surface-white font-bold pb-1 flex items-center gap-2 border-b border-surface-white/15">
              <span>{"// COMPLIANCE"}</span>
            </div>
            <ul className="space-y-2 font-mono text-xs">
              {LEGAL_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-canvas-paper/70 hover:text-surface-white hover:underline transition-colors block py-0.5"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: System Architecture Snapshot (2 cols) */}
          <div className="lg:col-span-2 flex flex-col space-y-3 font-mono text-[11px] text-canvas-paper/60">
            <div className="font-mono text-xs uppercase tracking-widest text-surface-white font-bold pb-1 flex items-center gap-2 border-b border-surface-white/15">
              <span>{"// REGISTRY"}</span>
            </div>
            <div className="space-y-1">
              <div>ENV: PRODUCTION</div>
              <div>LOCALE: ID_ID</div>
              <div>ENGINE: NEXT_16_REACT_19</div>
              <div>STYLING: TAILWIND_V4</div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: License, Copyright & ASCII Telemetry Status */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 font-mono text-xs text-canvas-paper/60">
          <div className="space-y-1">
            <p>© 2026 BBN EDUCATION // BELAJAR BARENG NATA.</p>
            <p className="text-[10px] text-canvas-paper/40">
              ARCHIVAL REPRODUCTION GRANTED UNDER OPEN STEM CURRICULUM LICENSE.
            </p>
          </div>

          {/* Decorative Terminal ASCII Metric */}
          <div className="flex items-center gap-3 bg-surface-white/5 border border-surface-white/15 px-3 py-1.5 self-stretch sm:self-auto justify-between sm:justify-start">
            <div className="flex items-center gap-2">
              <span className="size-2 bg-emerald-500 rounded-none animate-pulse" />
              <span className="text-[11px] text-surface-white font-semibold">STATUS: ONLINE</span>
            </div>
            <span className="text-accent-canary font-bold tracking-widest">[///]</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
