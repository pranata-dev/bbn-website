"use client"

import { useState } from "react"
import Link from "next/link"
import { Copy, Check, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const STATS_DATA = [
  {
    title: "4 Skills",
    subtitle: "Core Curriculum",
  },
  {
    title: "350K+",
    subtitle: "Active Community",
  },
  {
    title: "1200+",
    subtitle: "Tryouts & Mentoring",
  },
]

export function HeroSection() {
  const [copied, setCopied] = useState(false)
  const commandText = "initialize_physics_engine --module=kinematics"

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(commandText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
    }
  }

  return (
    <div id="home" className="relative w-full border-b border-[#171717] bg-canvas-paper">
      {/* Drafting Board Top Ruler Ticks */}
      <div className="w-full ruler-tick-h opacity-70" />

      {/* HERO SECTION */}
      <section className="w-full py-12 md:py-20 bg-grid-blueprint relative overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Dual-Column Grid for Desktop (12 Columns) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* LEFT COLUMN: Typography & Action (7 cols) */}
            <div className="lg:col-span-7 flex flex-col items-start text-left space-y-6">
              {/* Monospace Specification Badge */}
              <div className="inline-flex items-center gap-2 bg-surface-white border border-[#171717] px-3 py-1 technical-shadow-sm font-mono text-[11px] uppercase tracking-wider text-[#171717]">
                <span className="size-2 bg-alert-rust rounded-none" />
                <span className="font-bold">SPECIFICATION :: V2.4.0</span>
                <span className="text-border-grid">|</span>
                <span className="text-ink-muted">FIRST PRINCIPLES STEM ARCHIVE</span>
              </div>

              {/* Main Headline */}
              <h1 className="font-sans text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#171717] leading-[1.08]">
                <span className="text-alert-rust underline decoration-4 underline-offset-6">Pahami</span> Fisika & Sains, bukan sekadar menghafal rumus.
              </h1>

              {/* Description Paragraph */}
              <p className="font-sans text-base sm:text-lg text-ink-muted max-w-2xl leading-relaxed">
                Platform bimbingan belajar dan tryout interaktif yang dirancang dengan pendekatan first principles, intuisi kalkulus terstruktur, dan simulasi visual untuk pemahaman fisika yang komprehensif.
              </p>

              {/* Terminal Snippet Box */}
              <div className="w-full max-w-xl bg-[#171717] border border-[#171717] technical-shadow p-3 flex items-center justify-between gap-3 text-surface-white font-mono text-xs">
                <div className="flex items-center gap-2.5 truncate">
                  <span className="text-accent-canary font-bold select-none">&gt;</span>
                  <span className="text-surface-white/90 truncate font-medium">
                    {commandText}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="shrink-0 p-1.5 bg-surface-white/10 hover:bg-accent-canary hover:text-[#171717] text-surface-white border border-surface-white/20 transition-colors cursor-pointer"
                  title="Salin perintah"
                  aria-label="Salin perintah terminal"
                >
                  {copied ? (
                    <Check className="size-3.5 text-accent-canary" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                </button>
              </div>

              {/* Call to Action (CTA) Row */}
              <div className="flex flex-wrap items-center gap-4 pt-2 w-full sm:w-auto">
                {/* Primary Button */}
                <Button
                  size="lg"
                  className="h-12 px-6 bg-accent-canary hover:bg-accent-canary/90 text-[#171717] font-mono font-bold text-sm uppercase border border-[#171717] technical-shadow rounded-none cursor-pointer inline-flex items-center gap-2"
                  asChild
                >
                  <Link href="/register">
                    <span>Join Community</span>
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>

                {/* Secondary Outline Button */}
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="h-12 px-6 bg-surface-white hover:bg-canvas-paper text-[#171717] font-mono font-semibold text-sm uppercase border border-[#171717] technical-shadow-sm rounded-none cursor-pointer" 
                  asChild
                >
                  <a href="#program">
                    View Programs
                  </a>
                </Button>
              </div>

              {/* Blueprint Metatags */}
              <div className="pt-4 flex flex-wrap gap-4 border-t border-border-grid font-mono text-[11px] text-ink-muted">
                <div className="flex items-center gap-1.5">
                  <span className="size-1.5 bg-alert-rust rounded-none" />
                  <span>ZERO MEMORIZATION</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="size-1.5 bg-[#171717] rounded-none" />
                  <span>GEOMETRIC VECTOR PROOFS</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="size-1.5 bg-accent-canary rounded-none border border-[#171717]" />
                  <span>INTERACTIVE SIMULATIONS</span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: CAD-like Software Simulation Window (5 cols) */}
            <div className="lg:col-span-5 w-full">
              <div className="bg-surface-white border border-[#171717] technical-shadow relative p-3">
                {/* Window Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-border-grid font-mono text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="size-2 bg-alert-rust rounded-none" />
                    <span className="font-bold tracking-wider text-[#171717]">
                      SIMULATION_VIEWER // V.1.0
                    </span>
                  </div>
                  <div className="flex items-center gap-1 select-none font-mono">
                    <span className="size-4 border border-[#171717] bg-canvas-paper flex items-center justify-center text-[10px] text-[#171717] font-bold">-</span>
                    <span className="size-4 border border-[#171717] bg-canvas-paper flex items-center justify-center text-[8px] text-[#171717]">□</span>
                    <span className="size-4 border border-[#171717] bg-canvas-paper flex items-center justify-center text-[10px] text-alert-rust font-bold">✕</span>
                  </div>
                </div>

                {/* SVG Scientific Blueprint Simulation Graphic */}
                <div className="w-full bg-canvas-paper border border-border-grid p-2 relative flex items-center justify-center overflow-hidden">
                  <svg
                    className="w-full h-auto text-[#171717]"
                    fill="none"
                    viewBox="0 0 460 300"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Technical Sub-Grid Pattern */}
                    <defs>
                      <pattern id="cad-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#D4D2C9" strokeWidth="0.75" />
                      </pattern>
                      <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 1 L 10 5 L 0 9 z" fill="#171717" />
                      </marker>
                    </defs>
                    <rect width="460" height="300" fill="url(#cad-grid)" />

                    {/* Coordinate Axes */}
                    <line x1="30" y1="260" x2="430" y2="260" stroke="#171717" strokeWidth="1.2" />
                    <line x1="50" y1="20" x2="50" y2="280" stroke="#171717" strokeWidth="1.2" />

                    {/* Ticks on X and Y */}
                    <path d="M 110 256 v 8 M 170 256 v 8 M 230 256 v 8 M 290 256 v 8 M 350 256 v 8 M 410 256 v 8" stroke="#171717" strokeWidth="1" />
                    <path d="M 46 60 h 8 M 46 120 h 8 M 46 180 h 8 M 46 240 h 8" stroke="#171717" strokeWidth="1" />

                    {/* Phase Trajectory Ellipse */}
                    <ellipse cx="230" cy="140" rx="130" ry="70" stroke="#171717" strokeWidth="1.2" strokeDasharray="4 3" />

                    {/* Wave Packet Curve */}
                    <path
                      d="M 50 160 C 90 80, 130 220, 170 130 C 210 40, 250 210, 290 140 C 330 90, 370 170, 420 150"
                      stroke="#B85014"
                      strokeWidth="2"
                    />

                    {/* Tangent Vectors */}
                    <circle cx="170" cy="130" r="3.5" fill="#171717" />
                    <line x1="170" y1="130" x2="220" y2="80" stroke="#171717" strokeWidth="1.5" markerEnd="url(#arrow)" />
                    <text x="175" y="75" fill="#171717" fontFamily="JetBrains Mono" fontSize="9" fontWeight="600">
                      v_tan = dr/dt
                    </text>

                    {/* Normal Flux Vector */}
                    <line x1="170" y1="130" x2="130" y2="90" stroke="#52525B" strokeWidth="1" strokeDasharray="2 2" />
                    <text x="90" y="88" fill="#52525B" fontFamily="JetBrains Mono" fontSize="8">
                      ∇·F (normal)
                    </text>

                    {/* Center Point */}
                    <circle cx="230" cy="140" r="4.5" fill="#FDE047" stroke="#171717" strokeWidth="1.5" />
                    <text x="110" y="215" fill="#171717" fontFamily="JetBrains Mono" fontSize="9">
                      r(t) = (x·î + y·ĵ)
                    </text>

                    {/* Formula Annotation Box */}
                    <rect x="280" y="25" width="145" height="52" fill="#FFFFFF" stroke="#171717" strokeWidth="1" />
                    <text x="290" y="42" fill="#B85014" fontFamily="JetBrains Mono" fontSize="9" fontWeight="bold">
                      λ = h/p = h/(m·v)
                    </text>
                    <text x="290" y="56" fill="#171717" fontFamily="JetBrains Mono" fontSize="8">
                      ∇ × E = -∂B/∂t
                    </text>
                    <text x="290" y="68" fill="#52525B" fontFamily="JetBrains Mono" fontSize="7.5">
                      DE BROGLIE DUALITY
                    </text>
                  </svg>
                </div>

                {/* Window Footer Telemetry */}
                <div className="mt-2.5 pt-2 border-t border-border-grid flex items-center justify-between font-mono text-[10px] text-ink-muted">
                  <div className="flex items-center gap-1.5">
                    <span className="size-1.5 bg-accent-canary border border-[#171717] inline-block" />
                    <span>COORD: [X:34.2, Y:91.8]</span>
                  </div>
                  <span>TOLERANCE ±0.0001%</span>
                </div>
              </div>
            </div>
          </div>

          {/* FLOATING STATS BANNER / METRIC STRIP */}
          <div className="mt-12 md:mt-16 bg-surface-white border border-[#171717] technical-shadow">
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#171717]">
              {STATS_DATA.map((stat, idx) => (
                <div
                  key={idx}
                  className="p-6 flex items-center gap-4 bg-surface-white hover:bg-canvas-paper transition-colors"
                >
                  {/* Monospace Index Box */}
                  <div className="size-10 bg-canvas-paper border border-[#171717] shrink-0 flex items-center justify-center font-mono font-bold text-xs text-alert-rust">
                    0{idx + 1}
                  </div>

                  {/* Bold Stat Title and Muted Subtitle */}
                  <div className="flex flex-col">
                    <span className="font-sans text-2xl sm:text-3xl font-extrabold text-[#171717] tracking-tight">
                      {stat.title}
                    </span>
                    <span className="font-mono text-xs text-ink-muted tracking-wide uppercase mt-0.5">
                      {stat.subtitle}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
