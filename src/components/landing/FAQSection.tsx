import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { FadeInUp } from "@/components/animations"

const faqs = [
    {
        question: "Apa itu Belajar Bareng Nata?",
        answer:
            "Belajar Bareng Nata adalah platform tutor fisika personal yang dirancang khusus untuk mahasiswa Fisika semester 1 dan 2. Platform ini menyediakan tryout online, bank soal, analisis performa, dan leaderboard untuk membantu persiapan ujian Fisika!",
    },
    {
        question: "Bagaimana cara mendaftar?",
        answer:
            "Kamu bisa mendaftar dengan mengisi formulir registrasi dan mengunggah bukti pembayaran. Setelah admin memverifikasi pembayaran, kamu akan menerima email aktivasi untuk mengatur password dan mulai menggunakan platform.",
    },
    {
        question: "Mata kuliah dan materi apa saja yang tersedia?",
        answer:
            "Saat ini tersedia mata kuliah Fisika Dasar 2 dan Fisika-Matematika! Materi yang tersedia mulai dari pekan 1 hingga pekan 7 perkuliahan!",
    },
    {
        question: "Apakah soal-soalnya diacak?",
        answer:
            "Ya! Setiap kali kamu mengerjakan tryout, urutan soal akan diacak secara otomatis. Ini mencegah menghafal urutan jawaban dan memastikan pemahaman konsep yang lebih baik.",
    },
    {
        question: "Bagaimana sistem penilaiannya?",
        answer:
            "Kami menggunakan sistem scoring berbobot. Setiap soal memiliki bobot yang berbeda berdasarkan tingkat kesulitannya. Nilai akhir mencerminkan pemahaman konsep secara menyeluruh, bukan hanya jumlah jawaban benar.",
    },
    {
        question: "Apakah ada batas waktu mengerjakan tryout?",
        answer:
            "Ya, setiap tryout memiliki batas waktu yang sudah ditentukan. Timer akan berjalan secara real-time dan jawaban akan di-submit otomatis ketika waktu habis. Waktu juga divalidasi dari sisi server.",
    },
    {
        question: "Bisa bayar pakai apa saja?",
        answer:
            "Saat ini kami menerima pembayaran via transfer bank. Unggah bukti transfer saat mendaftar, dan admin akan memverifikasi dalam 1x24 jam.",
    },
    {
        question: "Apakah bisa melihat pembahasan soal?",
        answer:
            "Untuk pengguna Premium, pembahasan soal lengkap tersedia setelah tryout selesai. Pengguna Basic hanya bisa melihat skor dan jawaban yang benar.",
    },
]

export function FAQSection() {
    return (
        <section id="faq" className="section-padding bg-warm-beige/40">
            <div className="container-narrow mx-auto">
                <FadeInUp className="text-center mb-16">
                    <span className="inline-block text-sm font-semibold text-soft-brown uppercase tracking-wider mb-3">
                        FAQ
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-balance">
                        Pertanyaan yang Sering Ditanyakan
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto text-balance">
                        Temukan jawaban untuk pertanyaan umum tentang platform kami.
                    </p>
                </FadeInUp>

                <FadeInUp className="max-w-3xl mx-auto">
                    <Accordion type="single" collapsible className="space-y-3">
                        {faqs.map((faq, index) => (
                            <AccordionItem
                                key={index}
                                value={`item-${index}`}
                                className="bg-white border border-warm-gray/60 rounded-xl px-6 data-[state=open]:shadow-md transition-all"
                            >
                                <AccordionTrigger className="text-sm font-semibold text-foreground hover:text-soft-brown py-5 hover:no-underline">
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-5">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </FadeInUp>
            </div>
        </section>
    )
}
