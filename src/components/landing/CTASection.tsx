"use client"

import Link from "next/link"
import { ArrowRight, BookOpen } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 w-full bg-canvas-paper border-b border-[#171717]">
      <div className="max-w-[1440px] mx-auto">
        {/* Massive High-Contrast Canary Block with 4px Border & Technical Shadow */}
        <div className="bg-accent-canary border-4 border-[#171717] technical-shadow p-8 sm:p-12 md:p-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          {/* Left Text Column */}
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-surface-white border border-[#171717] px-2.5 py-0.5 font-mono text-[10px] font-bold text-[#171717] uppercase tracking-wider shadow-[1px_1px_0px_#171717]">
              <span className="size-2 bg-alert-rust rounded-none" />
              <span>PENDAFTARAN SEMESTER BARU</span>
            </div>

            <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#171717] tracking-tight leading-[1.1]">
              Mulai Konstruksi Logika Fisikamu Hari Ini.
            </h2>

            <p className="font-sans text-sm sm:text-base text-[#171717]/85 font-medium leading-relaxed">
              Bergabung sekarang dan bangun pemahaman fisika dengan cara yang lebih terstruktur, logis, dan mendalam bersama BBN Education.
            </p>
          </div>

          {/* Right Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full md:w-auto shrink-0">
            {/* Primary Action Button (Contrasting Inverted Brutalist Block) */}
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-[#171717] hover:bg-[#171717]/90 text-surface-white font-mono font-bold text-xs uppercase px-7 py-4 border border-[#171717] shadow-[2px_2px_0px_#FFFFFF] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer text-center"
            >
              <span>Mulai Petualangan</span>
              <ArrowRight className="size-4 text-accent-canary" />
            </Link>

            {/* Secondary Button */}
            <a
              href="#cara-kerja"
              className="inline-flex items-center justify-center gap-2 bg-surface-white hover:bg-canvas-paper text-[#171717] font-mono font-semibold text-xs uppercase px-6 py-4 border border-[#171717] technical-shadow-sm transition-colors text-center cursor-pointer"
            >
              <BookOpen className="size-4" />
              <span>Pelajari Panduan</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
