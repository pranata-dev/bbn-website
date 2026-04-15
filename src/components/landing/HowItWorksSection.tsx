"use client"

import Image from "next/image"
import { useTheme } from "@/contexts/ThemeContext"

function StepCard({ number, icon, title, desc }: { number: string; icon: string; title: string; desc: string }) {
    return (
        <div className="flex flex-col items-center text-center relative w-full px-4 group z-10">
            {/* Connecting Line (hidden on small screens, shown between items on md+) */}
            <div className="hidden md:block absolute top-[3rem] left-[50%] w-full h-[3px] bg-[#2b1b11] opacity-30 -z-10"></div>

            {/* Step Number + Icon Bubble */}
            <div className="relative bg-[#bed3c6] border-4 border-[#2b1b11] rounded-2xl w-24 h-24 flex items-center justify-center shadow-[4px_4px_0px_#2b1b11] mb-8 group-hover:-translate-y-2 group-hover:shadow-[6px_6px_0px_#2b1b11] transition-all">
                <div className="absolute -top-4 -right-4 bg-[#2b1b11] text-[#FEFCF3] font-bold font-mono border-2 border-[#FEFCF3] rounded-full w-10 h-10 flex items-center justify-center text-sm shadow-[2px_2px_0px_#FEFCF3] z-20">
                    {number}
                </div>
                <div className="relative w-14 h-14 drop-shadow-md">
                    <Image src={icon} alt={title} fill className="object-contain" />
                </div>
            </div>

            {/* Context Dialogue Box */}
            <div className="bg-[#FEFCF3] border-4 border-[#2b1b11] rounded-xl p-4 shadow-[4px_4px_0px_#2b1b11] w-full max-w-[260px] flex flex-col items-center mt-2 group-hover:-translate-y-1 group-hover:shadow-[6px_6px_0px_#2b1b11] transition-all relative mb-10 md:mb-0">
                {/* Pointer Triangle */}
                <div className="absolute -top-[16px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[16px] border-b-[#2b1b11]"></div>
                <div className="absolute -top-[10px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[12px] border-b-[#FEFCF3] z-10"></div>

                <p className="text-[10px] font-bold text-[#FEFCF3] tracking-widest uppercase font-mono mb-2 bg-[#2b1b11] px-2 py-1 rounded shadow-sm z-20">
                    Langkah {number}
                </p>
                <h3 className="text-sm md:text-base font-bold text-[#2b1b11] mb-2 font-mono text-center leading-snug">
                    {title}
                </h3>
                <p className="text-xs text-[#3c5443] font-bold font-mono leading-relaxed text-center">
                    {desc}
                </p>
            </div>
        </div>
    )
}

export function HowItWorksSection() {
    const { isDark } = useTheme()

    return (
        <section id="cara-kerja" className={`relative w-full md:aspect-[2750/1536] min-h-[700px] flex flex-col justify-center overflow-hidden h-auto ${isDark ? "bg-[#0f1b2e]" : "bg-[#bed3c6]"}`}>
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

            <div className="container mx-auto px-4 lg:px-12 z-10 relative flex flex-col justify-center h-full py-20 md:py-12">
                {/* Header */}
                <div className="max-w-3xl mx-auto text-center mb-16 sm:mb-24">
                    <p className={`text-sm md:text-base font-bold tracking-[0.25em] mb-4 font-mono uppercase ${isDark ? "text-[#FEFCF3] drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]" : "text-[#2b1b11] drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]"}`}>
                        Cara Kerja
                    </p>
                    <h2
                        className={`text-2xl md:text-3xl lg:text-4xl font-extrabold mb-6 ${isDark ? "text-[#FEFCF3] drop-shadow-[0_2px_2px_rgba(0,0,0,0.7)]" : "text-[#2b1b11] drop-shadow-[0_2px_2px_rgba(255,255,255,0.7)]"}`}
                        style={{ fontFamily: "var(--font-press-start)", lineHeight: 1.4 }}
                    >
                        4 Langkah Mudah untuk Memulai
                    </h2>
                    <p className={`text-base md:text-lg font-bold font-mono max-w-2xl mx-auto leading-relaxed ${isDark ? "text-[#bed3c6] drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]" : "text-[#3c5443] drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]"}`}>
                        Proses pendaftaran yang simpel. Fokusmu hanya satu: belajar fisika.
                    </p>
                </div>

                {/* Steps Container */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-y-20 md:gap-4 relative pb-0">
                    <StepCard
                        number="01"
                        icon="/assets/ikon-pohon-1.png"
                        title="Daftar Akun"
                        desc="Isi data diri dan unggah bukti pembayaran untuk mendaftar."
                    />
                    <StepCard
                        number="02"
                        icon="/assets/ikon-gelas-kopi.png"
                        title="Verifikasi"
                        desc="Admin akan memverifikasi pembayaranmu dan mengaktifkan akun."
                    />
                    <StepCard
                        number="03"
                        icon="/assets/ikon-kunci.png"
                        title="Aktivasi Akun"
                        desc="Kamu akan menerima email aktivasi. Set password dan login."
                    />
                    <div className="flex flex-col items-center text-center relative w-full px-4 group z-10">
                        {/* Terminal Step has no right connecting line, so just the bubble */}
                        <div className="relative bg-[#bed3c6] border-4 border-[#2b1b11] rounded-2xl w-24 h-24 flex items-center justify-center shadow-[4px_4px_0px_#2b1b11] mb-8 group-hover:-translate-y-2 group-hover:shadow-[6px_6px_0px_#2b1b11] transition-all">
                            <div className="absolute -top-4 -right-4 bg-[#2b1b11] text-[#FEFCF3] font-bold font-mono border-2 border-[#FEFCF3] rounded-full w-10 h-10 flex items-center justify-center text-sm shadow-[2px_2px_0px_#FEFCF3] z-20">
                                04
                            </div>
                            <div className="relative w-14 h-14 drop-shadow-md">
                                <Image src="/assets/ikon-buku-integral.png" alt="Mulai Belajar" fill className="object-contain" />
                            </div>
                        </div>

                        {/* Context Dialogue Box */}
                        <div className="bg-[#FEFCF3] border-4 border-[#2b1b11] rounded-xl p-4 shadow-[4px_4px_0px_#2b1b11] w-full max-w-[260px] flex flex-col items-center mt-2 group-hover:-translate-y-1 group-hover:shadow-[6px_6px_0px_#2b1b11] transition-all relative mb-10 md:mb-0">
                            {/* Pointer Triangle */}
                            <div className="absolute -top-[16px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[16px] border-b-[#2b1b11]"></div>
                            <div className="absolute -top-[10px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[12px] border-b-[#FEFCF3] z-10"></div>

                            <p className="text-[10px] font-bold text-[#FEFCF3] tracking-widest uppercase font-mono mb-2 bg-[#2b1b11] px-2 py-1 rounded shadow-sm z-20">
                                Langkah 04
                            </p>
                            <h3 className="text-sm md:text-base font-bold text-[#2b1b11] mb-2 font-mono text-center leading-snug">
                                Mulai Belajar
                            </h3>
                            <p className="text-xs text-[#3c5443] font-bold font-mono leading-relaxed text-center">
                                Akses tryout, kerjakan soal, lihat skor, dan pantau progresmu.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
