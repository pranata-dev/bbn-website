"use client"

import { useTheme } from "@/contexts/ThemeContext"

export function PricingSection() {
    const { isDark } = useTheme()

    return (
        <section id="harga" className={`relative w-full md:aspect-[2750/1536] min-h-[600px] flex flex-col justify-center overflow-hidden h-auto ${isDark ? "bg-[#0f1b2e]" : "bg-[#bed3c6]"}`}>
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

            <div className="container mx-auto px-4 lg:px-12 z-10 relative flex flex-col justify-center h-full py-20 md:py-12 text-center">

                {/* Header Section */}
                <div className="max-w-3xl mx-auto mb-10 w-full">
                    <p className={`text-sm md:text-base font-bold tracking-[0.25em] mb-4 font-mono uppercase ${isDark ? "text-[#FEFCF3] drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]" : "text-[#2b1b11] drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]"}`}>
                        Harga
                    </p>
                    <h2
                        className={`text-2xl md:text-3xl lg:text-4xl font-extrabold mb-4 ${isDark ? "text-[#FEFCF3] drop-shadow-[0_2px_2px_rgba(0,0,0,0.7)]" : "text-[#2b1b11] drop-shadow-[0_2px_2px_rgba(255,255,255,0.7)]"}`}
                        style={{ fontFamily: "var(--font-press-start)", lineHeight: 1.4 }}
                    >
                        Investasi Kecil, Hasil Maksimal
                    </h2>
                    <p className={`text-sm md:text-base font-bold font-mono ${isDark ? "text-[#bed3c6] drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]" : "text-[#3c5443] drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]"}`}>
                        Pilih paket yang sesuai dengan kebutuhanmu. Upgrade kapan saja.
                    </p>
                </div>

                {/* Table Container */}
                <div className="mx-auto w-full max-w-5xl bg-[#FEFCF3] border-4 border-[#2b1b11] rounded-xl shadow-[6px_6px_0px_#2b1b11] overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                            <tr className="bg-[#bed3c6] text-[#2b1b11] font-mono border-b-4 border-[#2b1b11]">
                                <th className="p-3 border-r-4 border-[#2b1b11] font-bold uppercase tracking-wider text-xs md:text-sm text-center">Jumlah Murid</th>
                                <th className="p-3 border-r-2 border-[#2b1b11] font-bold text-center text-xs md:text-sm">1 Pertemuan</th>
                                <th className="p-3 border-r-2 border-[#2b1b11] font-bold text-center text-xs md:text-sm">2 Pertemuan</th>
                                <th className="p-3 border-r-2 border-[#2b1b11] font-bold text-center text-xs md:text-sm">3 Pertemuan</th>
                                <th className="p-3 border-r-2 border-[#2b1b11] font-bold text-center text-xs md:text-sm">4 Pertemuan</th>
                                <th className="p-3 border-r-2 border-[#2b1b11] font-bold text-center text-xs md:text-sm">5 Pertemuan</th>
                                <th className="p-3 border-r-2 border-[#2b1b11] font-bold text-center text-xs md:text-sm">6 Pertemuan</th>
                                <th className="p-3 font-bold text-center text-xs md:text-sm">7 Pertemuan</th>
                            </tr>
                        </thead>
                        <tbody className="font-mono text-[#2b1b11] text-xs pb-2 font-semibold">
                            <tr className="border-b-2 border-[#2b1b11] hover:bg-[#e0ccba] transition-colors">
                                <td className="p-3 border-r-4 border-[#2b1b11] text-center font-bold bg-[#FEFCF3]">1 Orang</td>
                                <td className="p-3 border-r-2 border-[#2b1b11] text-center">Rp55,000</td>
                                <td className="p-3 border-r-2 border-[#2b1b11] text-center">Rp105,000</td>
                                <td className="p-3 border-r-2 border-[#2b1b11] text-center">Rp155,000</td>
                                <td className="p-3 border-r-2 border-[#2b1b11] text-center">Rp205,000</td>
                                <td className="p-3 border-r-2 border-[#2b1b11] text-center">Rp255,000</td>
                                <td className="p-3 border-r-2 border-[#2b1b11] text-center">Rp305,000</td>
                                <td className="p-3 text-center">Rp350,000</td>
                            </tr>
                            <tr className="border-b-2 border-[#2b1b11] hover:bg-[#e0ccba] transition-colors">
                                <td className="p-3 border-r-4 border-[#2b1b11] text-center font-bold bg-[#FEFCF3]">2 - 4 Orang</td>
                                <td className="p-3 border-r-2 border-[#2b1b11] text-center">Rp40,000</td>
                                <td className="p-3 border-r-2 border-[#2b1b11] text-center">Rp75,000</td>
                                <td className="p-3 border-r-2 border-[#2b1b11] text-center">Rp110,000</td>
                                <td className="p-3 border-r-2 border-[#2b1b11] text-center">Rp145,000</td>
                                <td className="p-3 border-r-2 border-[#2b1b11] text-center">Rp180,000</td>
                                <td className="p-3 border-r-2 border-[#2b1b11] text-center">Rp215,000</td>
                                <td className="p-3 text-center">Rp245,000</td>
                            </tr>
                            <tr className="border-b-2 border-[#2b1b11] hover:bg-[#e0ccba] transition-colors">
                                <td className="p-3 border-r-4 border-[#2b1b11] text-center font-bold bg-[#FEFCF3]">5 - 6 Orang</td>
                                <td className="p-3 border-r-2 border-[#2b1b11] text-center">Rp35,000</td>
                                <td className="p-3 border-r-2 border-[#2b1b11] text-center">Rp65,000</td>
                                <td className="p-3 border-r-2 border-[#2b1b11] text-center">Rp95,000</td>
                                <td className="p-3 border-r-2 border-[#2b1b11] text-center">Rp125,000</td>
                                <td className="p-3 border-r-2 border-[#2b1b11] text-center">Rp155,000</td>
                                <td className="p-3 border-r-2 border-[#2b1b11] text-center">Rp185,000</td>
                                <td className="p-3 text-center">Rp210,000</td>
                            </tr>
                            <tr className="border-b-2 border-[#2b1b11] hover:bg-[#e0ccba] transition-colors">
                                <td className="p-3 border-r-4 border-[#2b1b11] text-center font-bold bg-[#FEFCF3]">7 - 9 Orang</td>
                                <td className="p-3 border-r-2 border-[#2b1b11] text-center">Rp30,000</td>
                                <td className="p-3 border-r-2 border-[#2b1b11] text-center">Rp55,000</td>
                                <td className="p-3 border-r-2 border-[#2b1b11] text-center">Rp80,000</td>
                                <td className="p-3 border-r-2 border-[#2b1b11] text-center">Rp105,000</td>
                                <td className="p-3 border-r-2 border-[#2b1b11] text-center">Rp130,000</td>
                                <td className="p-3 border-r-2 border-[#2b1b11] text-center">Rp155,000</td>
                                <td className="p-3 text-center">Rp160,000</td>
                            </tr>
                            <tr className="hover:bg-[#e0ccba] transition-colors">
                                <td className="p-3 border-r-4 border-[#2b1b11] text-center font-bold bg-[#FEFCF3] rounded-bl-xl">&gt; 10 Orang</td>
                                <td className="p-3 border-r-2 border-[#2b1b11] text-center">Rp25,000</td>
                                <td className="p-3 border-r-2 border-[#2b1b11] text-center">Rp45,000</td>
                                <td className="p-3 border-r-2 border-[#2b1b11] text-center">Rp65,000</td>
                                <td className="p-3 border-r-2 border-[#2b1b11] text-center">Rp85,000</td>
                                <td className="p-3 border-r-2 border-[#2b1b11] text-center">Rp105,000</td>
                                <td className="p-3 border-r-2 border-[#2b1b11] text-center">Rp125,000</td>
                                <td className="p-3 text-center">Rp140,000</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Important Note */}
                <div className="mt-8 max-w-2xl mx-auto w-full flex justify-center px-4">
                    <div className="bg-[#2b1b11] text-[#FEFCF3] border-2 border-[#FEFCF3] font-mono text-xs md:text-sm px-5 py-4 rounded-lg shadow-[4px_4px_0px_#FEFCF3] flex items-start sm:items-center gap-3">
                        <span className="text-[#e87a5d] text-lg sm:text-xl shrink-0 leading-none">★</span>
                        <p className="italic leading-relaxed text-left">
                            Harga di atas adalah harga untuk 1 orang. Jika ingin memesan lebih dari 7 kali pertemuan silakan menghubungi Nata untuk mendapatkan penawaran yang menarik!
                        </p>
                    </div>
                </div>

            </div>
        </section>
    )
}
