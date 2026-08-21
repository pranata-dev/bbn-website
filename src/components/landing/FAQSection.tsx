"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const FAQS_DATA = [
  {
    question: "Apa itu Belajar Bareng Nata?",
    answer:
      "Belajar Bareng Nata adalah platform bimbingan belajar dan tryout interaktif yang dirancang khusus untuk membantu mahasiswa dan pelajar memahami konsep Fisika secara mendalam, mengukur kemampuan secara objektif, dan siap menghadapi ujian.",
  },
  {
    question: "Bagaimana cara mendaftar?",
    answer:
      "Kamu bisa mendaftar dengan memilih paket program yang diinginkan, mengisi form registrasi singkat, dan menyelesaikan aktivasi akun. Setelah akun aktif, kamu bisa langsung mengakses latihan soal atau mengatur jadwal tutoring.",
  },
  {
    question: "Mata kuliah dan materi apa saja yang tersedia?",
    answer:
      "Saat ini materi utama mencakup Fisika Dasar 1, Fisika Dasar 2, serta topik Fisika-Matematika pendukung lengkap dari konsep dasar hingga pembahasan soal ujian.",
  },
  {
    question: "Apakah soal-soal tryout diacak?",
    answer:
      "Ya! Setiap kali kamu mengerjakan simulasi tryout, butir soal dan pilihan jawaban diacak secara sistematis untuk melatih pemahaman konsep murni dan mencegah penghafalan pola jawaban.",
  },
  {
    question: "Bagaimana sistem penilaian dan evaluasinya?",
    answer:
      "Kami menerapkan sistem scoring terbobot dan analisis komprehensif. Setelah menyelesaikan latihan, kamu akan menerima laporan statistik yang memetakan topik kuat dan topik yang masih perlu ditingkatkan.",
  },
  {
    question: "Apakah ada batas waktu saat mengerjakan tryout?",
    answer:
      "Ya, setiap paket tryout dilengkapi simulasi timer real-time untuk melatih manajemen waktu dan ketahanan fokus seperti kondisi ujian sesungguhnya.",
  },
  {
    question: "Apa perbedaan program E-Learning dan Tutoring Offline?",
    answer:
      "E-Learning dirancang untuk belajar mandiri dengan akses bank soal interaktif dan tryout timer 24/7. Sedangkan Tutoring Offline memberikan sesi bimbingan tatap muka langsung bersama tutor untuk pendampingan intensif.",
  },
  {
    question: "Metode pembayaran apa saja yang didukung?",
    answer:
      "Kami mendukung transfer bank, virtual account, dan QRIS agar proses aktivasi langgananmu dapat dilakukan secara mudah dan cepat.",
  },
]

export function FAQSection() {
  return (
    <section id="faq" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 w-full bg-white">
      <div className="max-w-4xl mx-auto">
        {/* Title Area */}
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-xs sm:text-sm font-bold tracking-[0.25em] uppercase text-[#A5AF79] mb-2">
            F A Q
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#827148] tracking-tight">
            Pertanyaan Umum
          </h2>
          <p className="text-sm sm:text-base text-[#827148]/80 mt-3 max-w-xl mx-auto leading-relaxed">
            Semua yang perlu kamu ketahui tentang program belajar, fitur platform, dan sistem bimbingan kami.
          </p>
        </div>

        {/* Minimal Accordion Container */}
        <div className="w-full">
          <Accordion type="single" collapsible className="w-full space-y-2">
            {FAQS_DATA.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border-b border-[#A5AF79]/30 py-1 transition-colors"
              >
                <AccordionTrigger className="text-left font-semibold text-[#827148] text-base md:text-lg hover:no-underline py-4 cursor-pointer hover:text-[#827148]/80">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm sm:text-base text-[#827148]/80 leading-relaxed pb-4 pt-1">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
