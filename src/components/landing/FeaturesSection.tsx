"use client"

import Image from "next/image"
import { useTheme } from "@/contexts/ThemeContext"

function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
    return (
        <div className="bg-[#FEFCF3] border-4 border-[#2b1b11] rounded-xl p-5 shadow-[4px_4px_0px_#2b1b11] flex flex-col transition-transform hover:-translate-y-1 hover:shadow-[6px_6px_0px_#2b1b11] mx-auto w-full max-w-[340px] place-self-start">
            <div className="flex items-center gap-3 mb-3">
                <div className="relative w-12 h-12 shrink-0 drop-shadow-md">
                    <Image src={icon} alt={title} fill className="object-contain" />
                </div>
                <h3 className="text-base md:text-lg font-bold text-[#2b1b11] leading-tight font-mono whitespace-pre-wrap -mt-1">
                    {title}
                </h3>
            </div>
            <p className="text-xs md:text-sm text-[#3c5443] font-bold font-mono leading-relaxed mt-auto">
                {desc}
            </p>
        </div>
    )
}

export function FeaturesSection() {
    const { isDark } = useTheme()

    return (
        <section id="fitur" className={`relative w-full md:aspect-[2750/1536] min-h-[600px] flex flex-col justify-center overflow-hidden h-auto ${isDark ? "bg-[#0f1b2e]" : "bg-[#bed3c6]"}`}>
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
                <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-12">
                    <p className={`text-sm md:text-base font-bold tracking-[0.25em] mb-4 font-mono uppercase ${isDark ? "text-[#FEFCF3] drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]" : "text-[#2b1b11] drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]"}`}>
                        Fitur Unggulan
                    </p>
                    <h2
                        className={`text-2xl md:text-3xl lg:text-4xl font-extrabold mb-6 ${isDark ? "text-[#FEFCF3] drop-shadow-[0_2px_2px_rgba(0,0,0,0.7)]" : "text-[#2b1b11] drop-shadow-[0_2px_2px_rgba(255,255,255,0.7)]"}`}
                        style={{ fontFamily: "var(--font-press-start)", lineHeight: 1.4 }}
                    >
                        Semua yang Kamu Butuhkan untuk Siap Ujian
                    </h2>
                    <p className={`text-base md:text-lg font-bold font-mono max-w-2xl mx-auto leading-relaxed ${isDark ? "text-[#bed3c6] drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]" : "text-[#3c5443] drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]"}`}>
                        Platform kami dilengkapi dengan berbagai fitur canggih yang dirancang untuk
                        memastikan kamu menguasai Fisika dan meraih hasil ujian terbaik.
                    </p>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <FeatureCard
                        icon="/assets/ikon-buku-integral.webp"
                        title={"Bank Soal\nLengkap"}
                        desc="Akses ribuan soal latihan dan pembahasan lengkap dari berbagai topik fisika."
                    />
                    <FeatureCard
                        icon="/assets/ikon-kaca-pembesar.webp"
                        title={"Tryout dengan\nTimer"}
                        desc="Simulasi ujian nyata dengan batas waktu untuk melatih manajemen waktu dan mental."
                    />
                    <FeatureCard
                        icon="/assets/ikon-lampu.webp"
                        title={"Analisis\nPerforma"}
                        desc="Dapatkan laporan detail kekuatan dan kelemahanmu untuk belajar lebih efektif."
                    />
                    <FeatureCard
                        icon="/assets/ikon-bar-hijau.webp"
                        title={"Leaderboard &\nRanking"}
                        desc="Bersaing dengan murid lain dan pantau posisimu dalam peringkat"
                    />
                    <FeatureCard
                        icon="/assets/ikon-kunci.webp"
                        title={"Anti-Cheating\nSystem"}
                        desc="Ujian yang aman dan adil dengan sistem deteksi kecurangan canggih."
                    />
                    <FeatureCard
                        icon="/assets/ikon-tas.webp"
                        title={"Scoring\nBerbobot"}
                        desc="Sistem penilaian yang adil dengan bobot soal yang berbeda-beda."
                    />
                </div>
            </div>
        </section>
    )
}
