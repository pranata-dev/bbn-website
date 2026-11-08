"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const FAQS_DATA = [
  {
    code: "Q1",
    question: "Apa itu BBN Education (Belajar Bareng Nata)?",
    answer:
      "BBN Education adalah platform bimbingan belajar dan tryout interaktif yang dirancang khusus untuk membantu mahasiswa dan pelajar memahami konsep Fisika secara mendalam dari first principles, mengukur kemampuan secara objektif, dan siap menghadapi ujian.",
  },
  {
    code: "Q2",
    question: "Bagaimana alur dan sistem pembelajarannya?",
    answer:
      "Seluruh modul e-learning bersifat asinkron mandiri dengan modul latihan dan simulasi interaktif yang aktif 24/7. Anda bisa mengakses rekaman pembahasan, buku pegangan formula, dan problem set kapan saja tanpa terikat jam tertentu.",
  },
  {
    code: "Q3",
    question: "Mata kuliah dan topik fisika apa saja yang tersedia?",
    answer:
      "Saat ini materi utama mencakup Fisika Dasar 1, Fisika Dasar 2, Mekanika Klasik, Gelombang, Termodinamika, serta topik Fisika-Matematika pendukung lengkap dari konsep dasar hingga pembahasan soal ujian.",
  },
  {
    code: "Q4",
    question: "Apakah soal-soal tryout diacak?",
    answer:
      "Ya. Setiap kali Anda mengerjakan simulasi tryout, butir soal dan pilihan jawaban diacak secara sistematis untuk melatih pemahaman konsep murni dan mencegah penghafalan pola kunci jawaban.",
  },
  {
    code: "Q5",
    question: "Bagaimana sistem penilaian dan evaluasinya?",
    answer:
      "Kami menerapkan sistem scoring terbobot dan analisis komprehensif. Setelah menyelesaikan latihan, Anda akan menerima laporan statistik yang memetakan topik kuat dan topik yang masih perlu ditingkatkan.",
  },
  {
    code: "Q6",
    question: "Apakah ada batas waktu saat mengerjakan tryout?",
    answer:
      "Ya, setiap paket tryout dilengkapi simulasi timer real-time untuk melatih manajemen waktu dan ketahanan fokus seperti kondisi ujian kampus maupun olimpiade sesungguhnya.",
  },
  {
    code: "Q7",
    question: "Apa perbedaan program E-Learning dan Tutoring Offline?",
    answer:
      "E-Learning dirancang untuk belajar mandiri dengan akses bank soal interaktif dan tryout timer 24/7. Sedangkan Tutoring Offline memberikan sesi bimbingan tatap muka langsung bersama tutor untuk pendampingan intensif.",
  },
  {
    code: "Q8",
    question: "Metode pembayaran apa saja yang didukung?",
    answer:
      "Kami mendukung transfer bank, virtual account, dan QRIS agar proses aktivasi langganan akun Anda dapat dilakukan secara mudah, terverifikasi otomatis, dan cepat.",
  },
]

export function FAQSection() {
  return (
    <section id="faq" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 w-full bg-canvas-paper border-b border-[#171717]">
      <div className="max-w-[1440px] mx-auto">
        {/* Two-Column Grid Layout on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left Column: Context & Metadata (5 cols) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            <div>
              <div className="font-mono text-xs text-alert-rust font-semibold tracking-widest uppercase mb-1.5 flex items-center gap-2">
                <span className="size-2 bg-alert-rust rounded-none" />
                <span>[SYS.05] // OPERATIONAL_SPEC</span>
              </div>
              <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#171717] tracking-tight">
                Pertanyaan yang Sering Diajukan
              </h2>
              <p className="font-sans text-sm sm:text-base text-ink-muted mt-3 leading-relaxed">
                Spesifikasi operasional, panduan pendaftaran, serta ketentuan akses platform pembelajaran dan modul tryout BBN Education.
              </p>
            </div>

            {/* Support SLA Box */}
            <div className="bg-surface-white border border-[#171717] technical-shadow p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-border-grid pb-2">
                <span className="font-mono text-xs font-bold text-[#171717]">HELPDESK // SLA</span>
                <span className="font-mono text-[10px] bg-accent-canary px-2 py-0.5 border border-[#171717] font-bold">
                  AKTIF 24/7
                </span>
              </div>
              <p className="font-sans text-xs text-ink-muted leading-relaxed">
                Punya pertanyaan teknis silabus yang belum terjawab di sini? Tim tutor dan admin kami siap membantu melalui saluran konsultasi.
              </p>
              <div className="font-mono text-[11px] text-[#171717] pt-1">
                RESPONS MAKSIMAL: <span className="font-bold text-alert-rust">&lt; 1x24 JAM KERJA</span>
              </div>
            </div>
          </div>

          {/* Right Column: Technical Accordion (7 cols) */}
          <div className="lg:col-span-7">
            <Accordion type="single" collapsible className="w-full space-y-3">
              {FAQS_DATA.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border border-[#171717] bg-surface-white data-[state=open]:bg-canvas-paper technical-shadow-sm transition-colors rounded-none overflow-hidden"
                >
                  <AccordionTrigger className="p-4 md:p-5 text-left font-sans font-bold text-[#171717] text-sm sm:text-base hover:no-underline hover:bg-canvas-paper transition-colors group cursor-pointer [&[data-state=open]]:border-b [&[data-state=open]]:border-border-grid">
                    <span className="flex items-start gap-3 pr-2">
                      <span className="font-mono text-xs text-alert-rust font-bold shrink-0 pt-0.5">
                        [{faq.code}]
                      </span>
                      <span className="leading-snug group-hover:text-alert-rust transition-colors">
                        {faq.question}
                      </span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="p-4 md:p-5 pt-3 md:pt-4 font-sans text-xs sm:text-sm text-ink-muted leading-relaxed bg-canvas-paper">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  )
}
