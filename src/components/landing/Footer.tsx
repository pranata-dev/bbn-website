"use client"

import Link from "next/link"
import { BUSINESS_CONFIG } from "@/config/business"

const PLATFORM_LINKS = [
  { label: "Fitur", href: "#fitur" },
  { label: "Cara Kerja", href: "#cara-kerja" },
  { label: "Harga", href: "#harga" },
  { label: "FAQ", href: "#faq" },
]

const LEGAL_LINKS = [
  { label: "Kebijakan Privasi", href: "#" },
  { label: "Syarat & Ketentuan", href: "#" },
]

export function Footer() {
  return (
    <footer className="bg-[#827148] text-[#FFEED6] w-full pt-16 md:pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Grid Area (3 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-10 md:gap-12 pb-12">
          {/* Column 1: Brand & Contact Info */}
          <div className="lg:col-span-2 flex flex-col items-start">
            {/* Logo Placeholder Pill */}
            <div className="bg-[#FFEED6] text-[#827148] font-bold text-sm sm:text-base px-4 py-1.5 rounded-full tracking-tight mb-5 inline-block">
              BELAJAR BARENG NATA
            </div>

            {/* Short Description */}
            <p className="text-sm text-[#FFEED6]/80 leading-relaxed mb-6 max-w-sm">
              Platform bimbingan belajar dan tryout interaktif untuk mahasiswa dan pelajar. Belajar fisika lebih terarah, santai, dan siap ujian!
            </p>

            {/* Contact Items with Small Circular Placeholders (NO external icons) */}
            <div className="flex flex-col gap-3 text-sm">
              <a
                href={`mailto:${BUSINESS_CONFIG.contact.emailSenderAddress}`}
                className="flex items-center gap-3 text-[#FFEED6]/90 hover:text-white transition-colors group"
              >
                <div className="w-5 h-5 bg-[#A5AF79] rounded-full shrink-0 flex items-center justify-center" />
                <span className="group-hover:underline">{BUSINESS_CONFIG.contact.emailSenderAddress}</span>
              </a>
              <a
                href={`https://wa.me/${BUSINESS_CONFIG.contact.adminWhatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-[#FFEED6]/90 hover:text-white transition-colors group"
              >
                <div className="w-5 h-5 bg-[#A5AF79] rounded-full shrink-0 flex items-center justify-center" />
                <span className="group-hover:underline">WhatsApp Admin</span>
              </a>
            </div>
          </div>

          {/* Column 2: Platform Links */}
          <div className="flex flex-col">
            <h4 className="font-bold text-xs uppercase tracking-widest text-[#FFEED6] mb-5">
              PLATFORM
            </h4>
            <ul className="space-y-3">
              {PLATFORM_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-[#FFEED6]/80 hover:text-white transition-colors block py-0.5"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Legal Links */}
          <div className="flex flex-col">
            <h4 className="font-bold text-xs uppercase tracking-widest text-[#FFEED6] mb-5">
              LEGAL
            </h4>
            <ul className="space-y-3">
              {LEGAL_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-[#FFEED6]/80 hover:text-white transition-colors block py-0.5"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar Divider & Copyright */}
        <div className="border-t border-[#FFEED6]/20 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-medium text-[#FFEED6]/70">
          <p>© 2026 BELAJAR BARENG NATA</p>
          <p className="tracking-wider uppercase">MADE WITH LOVE BY LUMORALABS</p>
        </div>
      </div>
    </footer>
  )
}
