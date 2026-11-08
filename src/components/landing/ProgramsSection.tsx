"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ProgramModule {
  id: string
  title: string
  badge: string
  level: string
  modulesCount: string
  duration: string
  description: string
  equation: string
  equationTag: string
  indicatorColor: string
  price: string
  ctaText: string
  href: string
}

const PROGRAMS: ProgramModule[] = [
  {
    id: "SILABUS // MOD-01",
    title: "Mekanika Klasik & Vektor",
    badge: "E-Learning Mandiri",
    level: "SMA / TPB PTN",
    modulesCount: "12 Modul",
    duration: "48 Jam Video Lab",
    description: "Kinematika 2D/3D, hukum Newton dari diferensial, momentum kekal, dan osilasi harmonik teredam. Dikerjakan dengan penurunan vektor komprehensif.",
    equation: "d²x/dt² + 2γ(dx/dt) + ω₀²x = 0",
    equationTag: "DAMPED OSC.",
    indicatorColor: "bg-alert-rust",
    price: "Akses Penuh Mandiri",
    ctaText: "Pilih E-Learning",
    href: "/register",
  },
  {
    id: "SILABUS // MOD-02",
    title: "Kalkulus untuk Sains Dasar",
    badge: "Matematika Penunjang",
    level: "Persiapan Ujian / Kuliah",
    modulesCount: "16 Modul",
    duration: "60 Jam Handout",
    description: "Turunan parsial, integral lipat, gradien medan skalar, dan visualisasi teorema divergensi Gauss. Menjembatani intuisi matematika dengan tuntutan fisika modern.",
    equation: "∬_S (F · n) dS = ∭_V (∇ · F) dV",
    equationTag: "GAUSS THEOREM",
    indicatorColor: "bg-accent-canary",
    price: "Kurikulum Terstruktur",
    ctaText: "Buka Silabus",
    href: "/register",
  },
  {
    id: "SILABUS // MOD-03",
    title: "Gelombang, Termal & Tutoring",
    badge: "Pendampingan Intensif",
    level: "Olimpiade & UTBK SNBT",
    modulesCount: "10 Modul + Offline",
    duration: "Sesi Tatap Muka",
    description: "Superposisi gelombang mekanik, efek Doppler relativistik, siklus Carnot, dan hukum entropi dipadu bimbingan tatap muka langsung bersama tutor berpengalaman.",
    equation: "S = k_B · ln(Ω)  |  η = 1 - T_C/T_H",
    equationTag: "CARNOT / ENTROPY",
    indicatorColor: "bg-[#171717]",
    price: "Mentoring Tatap Muka",
    ctaText: "Pilih Tutoring",
    href: "#harga",
  },
]

export function ProgramsSection() {
  return (
    <section id="program" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 w-full bg-canvas-paper border-b border-[#171717]">
      <div className="max-w-[1440px] mx-auto">
        {/* Section Header: Sharp, left-aligned layout */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-5 border-b border-[#171717] gap-4">
          <div>
            <div className="font-mono text-xs text-alert-rust font-semibold tracking-widest uppercase mb-1.5 flex items-center gap-2">
              <span className="size-2 bg-alert-rust rounded-none" />
              <span>[SYS.02] // MODULE_REGISTRY</span>
            </div>
            <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#171717] tracking-tight">
              Katalog Silabus & Pilihan Belajar
            </h2>
            <p className="font-sans text-sm sm:text-base text-ink-muted mt-2.5 max-w-2xl leading-relaxed">
              Kurikulum teknis terstandarisasi untuk membangun pemahaman fisika mendalam dari prinsip pertama, baik melalui e-learning asinkron maupun tutoring personal.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs px-3 py-1.5 bg-surface-white border border-[#171717] text-[#171717] font-medium shadow-[1px_1px_0px_#171717]">
              ARSIP AKTIF: [01 — 03] DARI 14
            </span>
          </div>
        </div>

        {/* 3-Card Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROGRAMS.map((item) => (
            <article
              key={item.id}
              className="bg-surface-white border border-[#171717] flex flex-col justify-between technical-shadow hover:-translate-y-1 transition-all duration-150 group"
            >
              <div>
                {/* Mechanical Header Bar */}
                <div className="p-3.5 border-b border-border-grid bg-canvas-paper flex items-center justify-between font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`size-2 rounded-none ${item.indicatorColor}`} />
                    <span className="font-bold text-[#171717]">{item.id}</span>
                  </div>
                  <span className="px-2 py-0.5 bg-surface-white border border-[#171717] text-[10px] font-semibold text-ink-muted uppercase">
                    {item.badge}
                  </span>
                </div>

                {/* Card Content Body */}
                <div className="p-6 pb-4">
                  {/* Metadata Chips */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="font-mono text-[10px] px-2 py-0.5 border border-[#171717] bg-canvas-paper text-[#171717]">
                      {item.level}
                    </span>
                    <span className="font-mono text-[10px] px-2 py-0.5 border border-[#171717] bg-canvas-paper text-[#171717]">
                      {item.modulesCount}
                    </span>
                    <span className="font-mono text-[10px] px-2 py-0.5 border border-border-grid text-ink-muted">
                      {item.duration}
                    </span>
                  </div>

                  {/* Main Title */}
                  <h3 className="font-sans text-xl font-bold text-[#171717] group-hover:text-alert-rust transition-colors leading-snug">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="font-sans text-sm text-ink-muted mt-2.5 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Technical Callout Equation (Visual Area) */}
                  <div className="mt-5 p-3 bg-canvas-paper border border-border-grid font-mono text-[11px] text-[#171717] flex items-center justify-between">
                    <span className="font-semibold truncate pr-2">{item.equation}</span>
                    <span className="text-[10px] text-ink-muted uppercase tracking-wider shrink-0">{item.equationTag}</span>
                  </div>
                </div>
              </div>

              {/* Card Bottom Bar */}
              <div className="p-5 pt-4 border-t border-[#171717] bg-surface-white flex items-center justify-between gap-3">
                <div>
                  <span className="font-mono text-[10px] text-ink-muted block uppercase tracking-wider">INVESTASI PROGRAM</span>
                  <span className="font-mono text-xs font-bold text-[#171717]">{item.price}</span>
                </div>

                <Button
                  asChild
                  className="bg-accent-canary hover:bg-accent-canary/90 text-[#171717] font-mono font-bold text-xs uppercase px-3.5 py-2 border border-[#171717] technical-shadow-sm rounded-none cursor-pointer"
                >
                  <Link href={item.href}>
                    <span>{item.ctaText}</span>
                    <ArrowRight className="size-3.5 ml-1" />
                  </Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
