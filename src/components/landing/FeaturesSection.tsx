"use client"

const FEATURES = [
  {
    title: "Fleksibilitas Digital",
    description: "Akses materi pelajaran, kumpulan rumus, dan ribuan latihan soal interaktif kapan saja dan di mana saja sesuai ritme belajarmu.",
    placeholderColor: "bg-[#A5AF79]/20",
  },
  {
    title: "Tutor Berpengalaman",
    description: "Belajar langsung bersama tutor yang menguasai konsep dan materi fisika secara mendalam dengan metode penyampaian yang mudah dipahami.",
    placeholderColor: "bg-[#E8A07C]/20",
  },
  {
    title: "Analisis Progres",
    description: "Dapatkan laporan statistik performa berkala dan pemetaan topik yang perlu ditingkatkan untuk mengukur kesiapan ujian secara objektif.",
    placeholderColor: "bg-[#A5AF79]/20",
  },
  {
    title: "Pendekatan Personal",
    description: "Kurikulum belajar dan sesi tanya jawab yang disesuaikan dengan tingkat pemahaman, target nilai, dan kebutuhan spesifik setiap murid.",
    placeholderColor: "bg-[#E8A07C]/20",
  },
]

export function FeaturesSection() {
  return (
    <section id="fitur" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 w-full bg-[#FFEED6]/40">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <p className="text-xs sm:text-sm font-bold tracking-widest uppercase text-[#827148]/80 mb-2">
            Fitur Unggulan
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#827148] tracking-tight">
            Kenapa Belajar Bareng Nata?
          </h2>
          <p className="text-sm sm:text-base text-[#827148]/80 mt-3 max-w-xl mx-auto leading-relaxed">
            Metode pembelajaran terpadu yang memadukan kenyamanan digital dan pendampingan personal berkualitas.
          </p>
        </div>

        {/* 4-Column Grid on Desktop, 2-Column on Tablet, 1-Column on Mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {FEATURES.map((feature, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl p-6 shadow-xs border border-[#FFEED6] flex flex-col justify-between transition-all duration-200 hover:shadow-md hover:-translate-y-1"
            >
              <div>
                {/* Top-left placeholder circular div for future icon */}
                <div 
                  className={`w-12 h-12 rounded-full ${feature.placeholderColor} flex items-center justify-center mb-5 border border-[#827148]/10`}
                  aria-label="Icon placeholder"
                >
                  <div className="w-5 h-5 rounded-full bg-[#827148]/30" />
                </div>

                {/* Feature Title */}
                <h3 className="text-lg font-bold text-[#827148] mb-2 leading-snug">
                  {feature.title}
                </h3>

                {/* Feature Description */}
                <p className="text-xs sm:text-sm text-[#827148]/80 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
