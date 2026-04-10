"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/contexts/ThemeContext"

export function CTASection() {
    const { isDark } = useTheme()

    return (
        <section className={`relative w-full md:aspect-[2750/1536] min-h-[600px] flex flex-col justify-center overflow-hidden h-auto ${isDark ? "bg-[#0f1b2e]" : "bg-[#bed3c6]"}`}>
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

            <div className="container mx-auto px-4 lg:px-12 z-10 relative flex flex-col items-center justify-center h-full py-20 md:py-12 text-center">
                <div className="bg-[#FEFCF3] border-4 border-[#2b1b11] rounded-2xl px-6 py-10 md:px-16 md:py-16 shadow-[8px_8px_0px_#2b1b11] max-w-4xl w-full">
                    <h2 
                        className="text-2xl md:text-4xl font-extrabold text-[#2b1b11] mb-6 drop-shadow-[0_2px_2px_rgba(255,255,255,0.7)] leading-snug"
                        style={{ fontFamily: "var(--font-press-start)" }}
                    >
                        Siap Tingkatkan Nilai Fisikamu?
                    </h2>
                    <p className="text-sm md:text-lg text-[#3c5443] font-bold font-mono max-w-xl mx-auto mb-10 leading-relaxed drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]">
                        Bergabung sekarang dan mulai latihan soal Fisika dengan cara yang lebih
                        terstruktur, santai, dan menyenangkan ala warga hutan.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Button
                            size="lg"
                            asChild
                            className="bg-[#e87a5d] hover:bg-[#d95a4f] text-[#FEFCF3] rounded-none border-4 border-[#2b1b11] px-8 h-14 text-base md:text-lg shadow-[4px_4px_0px_#2b1b11] hover:shadow-[6px_6px_0px_#2b1b11] hover:-translate-y-1 transition-all font-bold font-mono w-full sm:w-auto"
                        >
                            <Link href="/register">
                                Mulai Petualangan
                            </Link>
                        </Button>
                        <Button
                            size="lg"
                            asChild
                            className="bg-[#bed3c6] text-[#2b1b11] hover:bg-[#a5c2b0] rounded-none border-4 border-[#2b1b11] px-8 h-14 text-base md:text-lg shadow-[4px_4px_0px_#2b1b11] hover:shadow-[6px_6px_0px_#2b1b11] hover:-translate-y-1 transition-all font-bold font-mono w-full sm:w-auto"
                        >
                            <a href="#cara-kerja">Pelajari Buku Panduan</a>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    )
}
