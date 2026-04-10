"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { useTheme } from "@/contexts/ThemeContext"

export function HeroSection() {
    const { isDark } = useTheme()

    return (
        <section className={`relative w-full md:aspect-[2750/1536] min-h-[650px] flex flex-col justify-between overflow-hidden h-auto py-20 md:py-0 ${isDark ? "bg-[#0f1b2e]" : "bg-[#cde0d5]"}`}>
            <div
                className="absolute inset-0 z-0 [image-rendering:pixelated] [image-rendering:-moz-crisp-edges] [image-rendering:-webkit-optimize-contrast] [image-rendering:crisp-edges] [-ms-interpolation-mode:nearest-neighbor]"
                style={{
                    backgroundImage: isDark
                        ? "url('/assets/background-rubah-malam.png')"
                        : "url('/assets/background-rubah-3.png')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat"
                }}
            />

            <div className="container-narrow mx-auto px-4 z-10 flex flex-col items-center pt-[8%] md:pt-[8%] shrink-0">
                <h1
                    className={`font-bold leading-tight tracking-tight mb-8 text-center ${isDark ? "text-[#FEFCF3]" : "text-[#2b1b11]"}`}
                    style={{
                        fontFamily: "var(--font-press-start)",
                        fontSize: "calc(1.5rem + 1vw)",
                        lineHeight: 1.4,
                        textShadow: isDark 
                            ? "2px 2px 0px rgba(0,0,0,0.6)" 
                            : "2px 2px 0px rgba(255,255,255,0.4)"
                    }}
                >
                    Belajar Bareng Nata
                </h1>

                <p className={`text-base md:text-lg font-bold font-mono max-w-3xl mx-auto text-center leading-relaxed ${
                    isDark 
                        ? "text-[#FEFCF3] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" 
                        : "text-[#2b1b11] drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]"
                }`}>
                    Platform tryout dan latihan soal mata kuliah Fisika yang dirancang untuk membantumu memahami konsep, mengukur kemampuan, dan pastinya siap menghadapi ujian!
                </p>
            </div>

            <div className="container-narrow mx-auto px-4 z-10 flex flex-col items-center w-full mt-auto pb-[1%]">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 mb-4">
                    <Button size="lg" asChild className="bg-[#4A3C28] hover:bg-[#3D3120] border-2 border-[#2D2418] text-white rounded-2xl px-8 h-12 shadow-[0_4px_0_rgba(45,36,24,1)] hover:shadow-[0_2px_0_rgba(45,36,24,1)] active:translate-y-1 hover:-translate-y-0.5 transition-all text-sm font-bold">
                        <Link href="/register">
                            Mulai Belajar Sekarang <ArrowRight className="ml-2 w-4 h-4" />
                        </Link>
                    </Button>
                    <Button size="lg" asChild className="px-8 h-12 text-sm bg-[#C4A881]/90 hover:bg-[#B39871] border-2 border-[#8C7456] text-[#2D2418] rounded-2xl shadow-[0_4px_0_rgba(140,116,86,1)] hover:shadow-[0_2px_0_rgba(140,116,86,1)] active:translate-y-1 font-extrabold backdrop-blur-sm transition-all hover:-translate-y-0.5">
                        <a href="#fitur">Pelajari Lebih Lanjut</a>
                    </Button>
                </div>

                <div className="w-full flex justify-center mt-4">
                    <div className="grid grid-cols-3 gap-12 sm:gap-24 text-center" style={{ fontFamily: "var(--font-vt323)" }}>
                        <div>
                            <div className={`text-3xl sm:text-4xl font-extrabold ${isDark ? "text-[#FEFCF3]" : "text-[#2b1b11]"}`}>500+</div>
                            <div className={`text-sm sm:text-lg font-bold ${isDark ? "text-[#bed3c6]" : "text-[#3c5443]"}`}>Latihan Soal</div>
                        </div>
                        <div>
                            <div className={`text-3xl sm:text-4xl font-extrabold ${isDark ? "text-[#FEFCF3]" : "text-[#2b1b11]"}`}>8</div>
                            <div className={`text-sm sm:text-lg font-bold ${isDark ? "text-[#bed3c6]" : "text-[#3c5443]"}`}>Kategori Materi</div>
                        </div>
                        <div>
                            <div className={`text-3xl sm:text-4xl font-extrabold ${isDark ? "text-[#FEFCF3]" : "text-[#2b1b11]"}`}>100%</div>
                            <div className={`text-sm sm:text-lg font-bold ${isDark ? "text-[#bed3c6]" : "text-[#3c5443]"}`}>Auto Scoring</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
