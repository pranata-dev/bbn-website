"use client"

import Link from "next/link"

export function ProgramsSection() {
  return (
    <section id="program" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 w-full bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <p className="text-xs sm:text-sm font-bold tracking-widest uppercase text-[#827148]/80 mb-2">
            Pilihan Program Kami
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#827148] tracking-tight">
            Pilih Cara Belajarmu
          </h2>
          <p className="text-sm sm:text-base text-[#827148]/80 mt-3 max-w-xl mx-auto leading-relaxed">
            Dapatkan fleksibilitas belajar mandiri atau pendampingan intensif bersama tutor yang berfokus pada pemahaman konsepmu.
          </p>
        </div>

        {/* 2-Column Grid on Desktop, 1-Column on Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
          {/* Card 1: E-Learning */}
          <div className="bg-white rounded-2xl shadow-md border border-[#FFEED6] flex flex-col overflow-hidden transition-all duration-200 hover:shadow-lg">
            {/* Top visual placeholder div */}
            <div className="h-40 bg-[#FFEED6] rounded-t-2xl w-full flex flex-col items-center justify-center p-4">
              <div className="w-12 h-12 rounded-xl bg-white/70 border border-[#827148]/20 mb-2 flex items-center justify-center" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#827148]/60">
                Visual Placeholder
              </span>
            </div>

            {/* Content Body */}
            <div className="p-6 sm:p-8 flex flex-col flex-grow justify-between">
              <div>
                <h3 className="text-2xl font-bold text-[#827148] mb-3">
                  E-Learning Mandiri
                </h3>
                <p className="text-sm sm:text-base text-[#827148]/80 leading-relaxed mb-8">
                  Akses ribuan bank soal latihan lengkap dengan pembahasan interaktif, simulasi tryout berbasis timer, dan evaluasi hasil belajar secara mandiri kapan pun kamu butuhkan.
                </p>
              </div>

              {/* Action Button */}
              <Link
                href="/register"
                className="w-full py-3.5 px-6 rounded-xl font-semibold text-white bg-[#A5AF79] hover:bg-[#949e6a] transition-colors text-center block shadow-sm"
              >
                Pilih E-Learning
              </Link>
            </div>
          </div>

          {/* Card 2: Offline Tutoring */}
          <div className="bg-white rounded-2xl shadow-md border border-[#FFEED6] flex flex-col overflow-hidden transition-all duration-200 hover:shadow-lg">
            {/* Top visual placeholder div */}
            <div className="h-40 bg-[#FFEED6] rounded-t-2xl w-full flex flex-col items-center justify-center p-4">
              <div className="w-12 h-12 rounded-xl bg-white/70 border border-[#827148]/20 mb-2 flex items-center justify-center" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#827148]/60">
                Visual Placeholder
              </span>
            </div>

            {/* Content Body */}
            <div className="p-6 sm:p-8 flex flex-col flex-grow justify-between">
              <div>
                <h3 className="text-2xl font-bold text-[#827148] mb-3">
                  Tutoring Offline
                </h3>
                <p className="text-sm sm:text-base text-[#827148]/80 leading-relaxed mb-8">
                  Bimbingan tatap muka langsung (face-to-face) dengan pendampingan intensif, bedah soal rumit, sesi tanya jawab mendalam, dan pendekatan personal yang disesuaikan dengan kebutuhanmu.
                </p>
              </div>

              {/* Action Button */}
              <a
                href="#harga"
                className="w-full py-3.5 px-6 rounded-xl font-semibold text-white bg-[#E8A07C] hover:bg-[#d8916e] transition-colors text-center block shadow-sm"
              >
                Pilih Tutoring Offline
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
