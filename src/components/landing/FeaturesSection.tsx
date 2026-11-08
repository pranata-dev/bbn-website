"use client"

interface FeatureSpec {
  code: string
  metric: string
  title: string
  description: string
  tag: string
}

const FEATURES: FeatureSpec[] = [
  {
    code: "SPEC.A1",
    metric: "24/7 ASYNCHRONOUS ACCESS",
    title: "Fleksibilitas Digital",
    description: "Akses materi pelajaran, kumpulan rumus, dan ribuan latihan soal interaktif kapan saja dan di mana saja sesuai ritme belajarmu.",
    tag: "ACCESSIBILITY",
  },
  {
    code: "SPEC.B2",
    metric: "100% FIRST PRINCIPLES PROOFS",
    title: "Tutor Berpengalaman",
    description: "Belajar langsung bersama tutor yang menguasai konsep dan materi fisika secara mendalam dengan metode penyampaian yang mudah dipahami.",
    tag: "PEDAGOGY",
  },
  {
    code: "SPEC.C3",
    metric: "REAL-TIME METRIC TRACKING",
    title: "Analisis Progres",
    description: "Dapatkan laporan statistik performa berkala dan pemetaan topik yang perlu ditingkatkan untuk mengukur kesiapan ujian secara objektif.",
    tag: "TELEMETRY",
  },
  {
    code: "SPEC.D4",
    metric: "ADAPTIVE CURRICULUM",
    title: "Pendekatan Personal",
    description: "Kurikulum belajar dan sesi tanya jawab yang disesuaikan dengan tingkat pemahaman, target nilai, dan kebutuhan spesifik setiap murid.",
    tag: "PERSONALIZATION",
  },
]

export function FeaturesSection() {
  return (
    <section id="fitur" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 w-full bg-canvas-paper bg-grid-blueprint border-b border-[#171717] relative">
      <div className="max-w-[1440px] mx-auto">
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="font-mono text-xs text-alert-rust font-semibold tracking-widest uppercase mb-1.5 flex items-center gap-2">
            <span className="size-2 bg-alert-rust rounded-none" />
            <span>[SYS.03] // SPECIFICATION_MATRIX</span>
          </div>
          <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#171717] tracking-tight">
            Kenapa Belajar Bareng Nata?
          </h2>
          <p className="font-sans text-sm sm:text-base text-ink-muted mt-2.5 max-w-2xl leading-relaxed">
            Metode pembelajaran terpadu yang memadukan kenyamanan platform digital dan ketegasan analisis sains untuk menghasilkan pemahaman sejati.
          </p>
        </div>

        {/* Feature Grid: Heavy border and sharp internal divider lines */}
        <div className="border-2 border-[#171717] bg-surface-white technical-shadow">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#171717]">
            {FEATURES.map((feature, idx) => (
              <div
                key={idx}
                className="p-6 md:p-8 flex flex-col justify-between group hover:bg-canvas-paper transition-colors relative"
              >
                <div>
                  {/* Top Spec Header Bar */}
                  <div className="flex items-center justify-between border-b border-border-grid pb-2.5 mb-4">
                    <span className="font-mono text-xs font-bold text-alert-rust">
                      [{feature.code}]
                    </span>
                    <span className="font-mono text-[10px] px-1.5 py-0.2 bg-canvas-paper border border-[#171717] font-semibold text-ink-muted">
                      {feature.tag}
                    </span>
                  </div>

                  {/* Subtitle / Metric Callout in JetBrains Mono */}
                  <div className="font-mono text-xs font-bold text-[#171717] tracking-wide mb-2 uppercase">
                    {feature.metric}
                  </div>

                  {/* Feature Title in Geist */}
                  <h3 className="font-sans text-xl font-bold text-[#171717] mb-2.5 group-hover:text-alert-rust transition-colors leading-snug">
                    {feature.title}
                  </h3>

                  {/* Descriptive Body Text in Geist */}
                  <p className="font-sans text-xs sm:text-sm text-ink-muted leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Card Bottom Meta */}
                <div className="mt-6 pt-3 border-t border-border-grid flex items-center justify-between font-mono text-[10px] text-ink-muted">
                  <span>STATUS: VERIFIED</span>
                  <span className="size-1.5 bg-accent-canary border border-[#171717] inline-block" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
