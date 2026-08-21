"use client"

import Link from "next/link"

export function CTASection() {
  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 w-full bg-[#FFEED6]/40">
      <div className="max-w-6xl mx-auto">
        {/* Large Sage Green Container */}
        <div className="bg-[#A5AF79] rounded-3xl py-16 md:py-20 px-6 sm:px-12 text-center shadow-lg shadow-[#A5AF79]/15 flex flex-col items-center">
          {/* Main Title */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4 max-w-2xl leading-tight">
            Siap Tingkatkan Nilai Fisikamu?
          </h2>

          {/* Description Paragraph */}
          <p className="text-base sm:text-lg text-white/90 font-medium max-w-xl mx-auto mb-10 leading-relaxed">
            Bergabung sekarang dan mulai latihan soal Fisika dengan cara yang lebih terstruktur, santai, dan menyenangkan bersama Belajar Bareng Nata.
          </p>

          {/* Centered Buttons Row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            {/* Button 1: Mulai Petualangan */}
            <Link
              href="/register"
              className="w-full sm:w-auto bg-[#E8A07C] hover:bg-[#E8A07C]/90 text-white rounded-xl px-8 py-3.5 font-semibold text-base shadow-sm transition-all duration-200 text-center cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Mulai Petualangan
            </Link>

            {/* Button 2: Pelajari Buku Panduan */}
            <a
              href="#cara-kerja"
              className="w-full sm:w-auto bg-[#FFEED6] hover:bg-white text-[#827148] rounded-xl px-8 py-3.5 font-semibold text-base shadow-sm transition-all duration-200 text-center cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Pelajari Buku Panduan
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
