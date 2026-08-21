"use client"

const STEPS = [
  {
    step: "01",
    title: "Daftar & Pilih Program",
    description: "Tentukan pilihan antara E-Learning Mandiri atau Tutoring Offline sesuai dengan target akademismu.",
  },
  {
    step: "02",
    title: "Konsultasi & Penjadwalan",
    description: "Lakukan konsultasi topik materi yang ingin dipelajari dan tentukan jadwal bimbingan yang fleksibel.",
  },
  {
    step: "03",
    title: "Mulai Belajar",
    description: "Akses materi terstruktur, pelajari konsep fisika bersama tutor, dan kerjakan latihan soal terarah.",
  },
  {
    step: "04",
    title: "Pantau Evaluasi",
    description: "Dapatkan analisis performa hasil latihan dan feedback berkala untuk memastikan kesiapan ujianmu.",
  },
]

export function HowItWorksSection() {
  return (
    <section id="cara-kerja" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 w-full bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <p className="text-xs sm:text-sm font-bold tracking-widest uppercase text-[#827148]/80 mb-2">
            Alur Pembelajaran
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#827148] tracking-tight">
            4 Langkah Mudah Memulai
          </h2>
          <p className="text-sm sm:text-base text-[#827148]/80 mt-3 max-w-xl mx-auto leading-relaxed">
            Proses simpel dan terarah untuk memulai perjalanan belajarmu tanpa prosedur rumit.
          </p>
        </div>

        {/* 4-Column Layout on Desktop, 2-Col Tablet, 1-Col Mobile (No connecting thick lines) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 items-start">
          {STEPS.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center text-center p-4 rounded-xl transition-all duration-200"
            >
              {/* Circular badge placeholder at top */}
              <div 
                className="w-10 h-10 rounded-full bg-[#827148] text-white flex items-center justify-center font-bold text-sm mb-5 shadow-xs shrink-0"
                aria-label={`Langkah ${item.step}`}
              >
                {item.step}
              </div>

              {/* Step Title */}
              <h3 className="text-base sm:text-lg font-bold text-[#827148] mb-2 leading-snug">
                {item.title}
              </h3>

              {/* Step Description */}
              <p className="text-xs sm:text-sm text-[#827148]/80 leading-relaxed max-w-xs">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
