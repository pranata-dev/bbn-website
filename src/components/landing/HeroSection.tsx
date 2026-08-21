"use client"

import Link from "next/link"
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
  return (
    <div id="home" className="relative w-full bg-gradient-to-b from-[#FFEED6]/50 via-white to-[#FFEED6]/20">
      {/* HERO SECTION */}
      <section className="w-full pt-12 pb-20 md:pt-20 md:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 2-Column Grid for Desktop (1-Column for Mobile) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* LEFT COLUMN: Content */}
            <div className="flex flex-col items-start text-left">
              {/* Sub-headline */}
              <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#A5AF79] mb-3">
                ONLINE LEARNING & TRYOUT PLATFORM
              </p>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#827148] leading-[1.15] mb-6">
                BELAJAR BARENG NATA
              </h1>

              {/* Description Paragraph */}
              <p className="text-base sm:text-lg text-[#827148]/80 max-w-xl mb-8 leading-relaxed">
                Platform bimbingan belajar dan tryout interaktif yang dirancang untuk membantumu memahami konsep secara mendalam, mengukur kemampuan, dan siap menghadapi ujian.
              </p>

              {/* Call to Action (CTA) Row */}
              <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
                {/* Primary Solid Button */}
                <Button size="lg" className="h-12 px-6 rounded-xl font-semibold shadow-sm bg-[#A5AF79] hover:bg-[#949e6a] text-white transition-colors" asChild>
                  <Link href="/register">
                    Join Community
                  </Link>
                </Button>

                {/* Secondary Outline/Ghost Button */}
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="h-12 px-6 rounded-xl font-semibold border-[#FFEED6] text-[#827148] hover:bg-[#FFEED6]/60 transition-colors" 
                  asChild
                >
                  <a href="#program">
                    View Programs
                  </a>
                </Button>
              </div>
            </div>

            {/* RIGHT COLUMN: Image Placeholder */}
            <div className="flex items-center justify-center w-full">
              {/* Large, empty generic <div> placeholder for future character illustration */}
              <div 
                className="w-full h-96 rounded-2xl border-2 border-dashed border-[#827148]/30 bg-[#FFEED6]/30 flex flex-col items-center justify-center text-center p-6 transition-all hover:border-[#827148]/50"
                aria-label="Character illustration placeholder"
              >
                <div className="w-16 h-16 rounded-full bg-[#FFEED6] border border-[#827148]/20 mb-3 flex items-center justify-center" />
                <span className="text-sm font-semibold text-[#827148]/70">
                  Character Illustration Placeholder
                </span>
                <span className="text-xs text-[#827148]/50 mt-1">
                  (Visual Asset Area)
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FLOATING STATS BANNER */}
      <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 md:-mt-14 mb-16">
        <div className="bg-white rounded-2xl shadow-md border border-[#FFEED6] p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#FFEED6] gap-6 md:gap-0">
            {STATS_DATA.map((stat, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-4 ${
                  idx === 0
                    ? "md:pr-6"
                    : idx === STATS_DATA.length - 1
                    ? "pt-6 md:pt-0 md:pl-6"
                    : "pt-6 md:pt-0 md:px-6"
                }`}
              >
                {/* Left side: Small placeholder circle for future icons */}
                <div className="w-12 h-12 bg-[#FFEED6] rounded-full shrink-0 flex items-center justify-center border border-[#827148]/15">
                  <div className="w-5 h-5 rounded-full bg-[#A5AF79]/40" />
                </div>

                {/* Right side: Bold large stat number/title and smaller muted subtitle */}
                <div className="flex flex-col">
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#827148] tracking-tight">
                    {stat.title}
                  </span>
                  <span className="text-xs sm:text-sm text-[#827148]/70 font-medium mt-0.5">
                    {stat.subtitle}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
