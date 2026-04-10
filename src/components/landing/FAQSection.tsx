"use client"

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { useTheme } from "@/contexts/ThemeContext"

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
    const leftFaqs = faqs.slice(0, 4)
    const rightFaqs = faqs.slice(4)
    const { isDark } = useTheme()

    return (
        <section id="faq" className={`relative w-full md:aspect-[2750/1536] min-h-[600px] flex flex-col justify-center overflow-hidden h-auto ${isDark ? "bg-[#0f1b2e]" : "bg-[#bed3c6]"}`}>
            {/* Pixel Art Background */}
            <div 
                className="absolute inset-0 z-0 opacity-80 [image-rendering:pixelated] [image-rendering:-moz-crisp-edges] [image-rendering:-webkit-optimize-contrast] [image-rendering:crisp-edges] [-ms-interpolation-mode:nearest-neighbor]"
                style={{
                    backgroundImage: isDark ? "url('/assets/background-only-malam.png')" : "url('/assets/background-only-2.png')",
                    backgroundSize: "cover",
                    backgroundPosition: "center center",
                    backgroundRepeat: "no-repeat"
                }}
            />

            <div className="container mx-auto px-4 lg:px-12 z-10 relative flex flex-col justify-center h-full py-20 md:py-10 text-center">
                
                {/* Header Section */}
                <div className="max-w-3xl mx-auto mb-6 w-full">
                    <p className={`text-sm md:text-base font-bold tracking-[0.25em] mb-2 font-mono uppercase ${isDark ? "text-[#FEFCF3] drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]" : "text-[#2b1b11] drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]"}`}>
                        FAQ
                    </p>
                    <h2 
                        className={`text-xl md:text-2xl lg:text-3xl font-extrabold mb-2 ${isDark ? "text-[#FEFCF3] drop-shadow-[0_2px_2px_rgba(0,0,0,0.7)]" : "text-[#2b1b11] drop-shadow-[0_2px_2px_rgba(255,255,255,0.7)]"}`}
                        style={{ fontFamily: "var(--font-press-start)", lineHeight: 1.4 }}
                    >
                        Pertanyaan Umum
                    </h2>
                    <p className={`text-xs md:text-sm font-bold font-mono max-w-2xl mx-auto ${isDark ? "text-[#bed3c6] drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]" : "text-[#3c5443] drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]"}`}>
                        Temukan petunjuk dari warga hutan tentang petualangan belajarmu.
                    </p>
                </div>

                {/* FAQ 2-Column Grid */}
                <div className="mx-auto w-full max-w-5xl text-left grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left Column */}
                    <Accordion type="single" collapsible className="space-y-3">
                        {leftFaqs.map((faq, index) => (
                            <AccordionItem
                                key={index}
                                value={`item-${index}`}
                                className="bg-[#FEFCF3] border-3 border-[#2b1b11] rounded-lg px-3 md:px-4 shadow-[3px_3px_0px_#2b1b11] transition-transform hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#2b1b11]"
                            >
                                <AccordionTrigger className="text-xs md:text-sm font-bold text-[#2b1b11] font-mono hover:text-[#e87a5d] py-3 hover:no-underline text-left">
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-xs text-[#3c5443] font-mono leading-relaxed pb-3 font-semibold">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                    {/* Right Column */}
                    <Accordion type="single" collapsible className="space-y-3">
                        {rightFaqs.map((faq, index) => (
                            <AccordionItem
                                key={index + 4}
                                value={`item-${index + 4}`}
                                className="bg-[#FEFCF3] border-3 border-[#2b1b11] rounded-lg px-3 md:px-4 shadow-[3px_3px_0px_#2b1b11] transition-transform hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#2b1b11]"
                            >
                                <AccordionTrigger className="text-xs md:text-sm font-bold text-[#2b1b11] font-mono hover:text-[#e87a5d] py-3 hover:no-underline text-left">
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-xs text-[#3c5443] font-mono leading-relaxed pb-3 font-semibold">
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
