"use client"

import { CheckCircle2, Cpu, Sparkles } from "lucide-react"

const STEPS = [
  {
    step: "01",
    phase: "PHASE 01: FASE INTUITIF",
    title: "Visualisasi & Intuisi Konsep",
    description: "Sebelum menyentuh aljabar atau kalkulus rumit, siswa mengeksplorasi visualisasi simulasi interaktif: medan vektor gerak, grafik diferensial, dan diagram fasa agar intuisi fisik terbentuk solid di kepala.",
    metric: "Interaktif Canvas 60 FPS",
    icon: Sparkles,
  },
  {
    step: "02",
    phase: "PHASE 02: FASE FORMALISME",
    title: "Pembuktian Matematis Murni",
    description: "Menurunkan rumus dari prinsip pertama (first principles) menggunakan kalkulus dasar hingga lanjut. Menyingkap bagaimana hukum kekekalan alam lahir dari simetri ruang dan waktu secara elegan.",
    metric: "Turunan Kalkulus Langkah demi Langkah",
    icon: Cpu,
  },
  {
    step: "03",
    phase: "PHASE 03: FASE APLIKASI",
    title: "Latihan Problem-Solving Terarah",
    description: "Membedah studi kasus fisika dunia nyata, pemodelan analitik, dan problem set berstandar kompetisi sains maupun ujian universitas teknik tanpa jalan pintas atau rumus cepat.",
    metric: "Bank Soal Terbimbing & Analisis Mendalam",
    icon: CheckCircle2,
  },
]

export function HowItWorksSection() {
  return (
    <section id="cara-kerja" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 w-full bg-canvas-paper border-b border-[#171717] relative">
      <div className="max-w-[1440px] mx-auto">
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="font-mono text-xs text-alert-rust font-semibold tracking-widest uppercase mb-1.5 flex items-center gap-2">
            <span className="size-2 bg-alert-rust rounded-none" />
            <span>[SYS.04] // PEDAGOGY_PIPELINE</span>
          </div>
          <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#171717] tracking-tight">
            Tiga Langkah Penetrasi Konsep
          </h2>
          <p className="font-sans text-sm sm:text-base text-ink-muted mt-2.5 max-w-2xl leading-relaxed">
            Metodologi teruji untuk mengonstruksi kerangka berpikir ilmiah sejati tanpa trik hafalan instan yang mudah terlupakan.
          </p>
        </div>

        {/* 3-Step Blueprint Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {STEPS.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.step}
                className="bg-surface-white border border-[#171717] p-6 technical-shadow flex flex-col justify-between relative group hover:-translate-y-1 transition-transform duration-150"
              >
                <div>
                  {/* Top Spec Bar */}
                  <div className="flex items-center justify-between border-b border-border-grid pb-3 mb-4">
                    <span className="font-mono text-xl font-bold text-alert-rust">
                      {item.step}.
                    </span>
                    <span className="font-mono text-[10px] px-2 py-0.5 bg-canvas-paper border border-[#171717] font-semibold text-ink-muted uppercase">
                      {item.phase}
                    </span>
                  </div>

                  {/* Step Title */}
                  <h3 className="font-sans text-xl font-bold text-[#171717] mb-2.5 leading-snug group-hover:text-alert-rust transition-colors">
                    {item.title}
                  </h3>

                  {/* Step Description */}
                  <p className="font-sans text-xs sm:text-sm text-ink-muted leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Step Sub-metric Footer */}
                <div className="mt-6 pt-3.5 border-t border-border-grid flex items-center gap-2 font-mono text-[11px] text-[#171717]">
                  <Icon className="size-4 text-alert-rust shrink-0" />
                  <span className="font-medium">{item.metric}</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Inverted Feynman Quotation Banner */}
        <div className="mt-10 bg-[#171717] text-surface-white border border-[#171717] technical-shadow p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="font-mono text-xs text-accent-canary tracking-widest uppercase flex items-center gap-2">
              <span className="size-2 bg-accent-canary rounded-none" />
              <span>PRINSIP PEDAGOGIS FUNDAMENTAL</span>
            </div>
            <blockquote className="font-sans text-lg sm:text-xl font-bold text-surface-white leading-snug">
              &ldquo;What I cannot create, I do not understand.&rdquo;
            </blockquote>
            <p className="font-sans text-xs sm:text-sm text-surface-white/70 italic">
              Apa yang tidak dapat saya turunkan dari prinsip pertama, tidak benar-benar saya pahami.
            </p>
          </div>
          <div className="font-mono text-xs text-surface-white/60 text-right md:border-l md:border-surface-white/20 md:pl-6 shrink-0">
            <span className="text-accent-canary font-semibold block">Richard P. Feynman</span>
            <span>Catatan Papan Tulis Caltech // 1988</span>
          </div>
        </div>
      </div>
    </section>
  )
}
