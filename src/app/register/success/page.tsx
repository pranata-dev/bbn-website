"use client"

import { Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowLeft, Clock, GraduationCap, Rocket, MonitorPlay, MessageCircle } from "lucide-react"
import { APP_NAME } from "@/constants"
import { useTheme } from "@/contexts/ThemeContext"

function SuccessContent() {
    const searchParams = useSearchParams()
    const type = searchParams.get("type")

    const isRegular = type === "REGULAR"
    const isKelasBesar = type === "KELAS_BESAR"
    const Icon = isKelasBesar ? MonitorPlay : isRegular ? GraduationCap : Rocket

    const { isDark } = useTheme()

    return (
        <div className={`relative min-h-screen flex items-center justify-center p-4 py-12 md:py-16 ${isDark ? "bg-[#0f1b2e]" : "bg-[#bed3c6]"}`}>
            {/* Pixel Art Background */}
            <div
                className="fixed inset-0 z-0 opacity-80 [image-rendering:pixelated] [image-rendering:-moz-crisp-edges] [image-rendering:-webkit-optimize-contrast] [image-rendering:crisp-edges] [-ms-interpolation-mode:nearest-neighbor]"
                style={{
                    backgroundImage: isDark ? "url('/assets/background-only-malam.png')" : "url('/assets/background-only-2.png')",
                    backgroundSize: "cover",
                    backgroundPosition: "center center",
                    backgroundRepeat: "no-repeat"
                }}
            />

            <div className="w-full max-w-md text-center z-10 relative">
                <div className="bg-[#FEFCF3] border-4 border-[#2b1b11] rounded-2xl shadow-[8px_8px_0px_#2b1b11] overflow-hidden">
                    {/* Header */}
                    <div className="text-center pt-8 pb-4 px-6 border-b-4 border-[#2b1b11] bg-[#bed3c6]">
                        <div className="mx-auto w-16 h-16 bg-[#FEFCF3] border-2 border-[#2b1b11] flex items-center justify-center shadow-[2px_2px_0px_#2b1b11] mb-4">
                            <CheckCircle className="w-8 h-8 text-[#2b1b11] stroke-[2]" />
                        </div>
                        <h2 className="text-xl md:text-2xl font-extrabold text-[#2b1b11] mb-2" style={{ fontFamily: "var(--font-press-start)", lineHeight: 1.4 }}>
                            Pendaftaran Berhasil!
                        </h2>
                    </div>

                    <div className="p-6 md:p-8 space-y-6">
                        {/* Product type badge */}
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#FEFCF3] border-2 border-[#2b1b11] shadow-[2px_2px_0px_#2b1b11]">
                            <Icon className="w-4 h-4 text-[#2b1b11] stroke-[2]" />
                            <span className="text-xs md:text-sm font-bold text-[#2b1b11] font-mono">
                                {isKelasBesar ? "Kelas Tutor Besar" : isRegular ? "Kelas Reguler" : "Persiapan UTS"}
                            </span>
                        </div>

                        <div className="space-y-4">
                            <p className="text-sm font-bold text-[#3c5443] font-mono">
                                Terima kasih sudah mendaftar di {APP_NAME}.
                            </p>
                            <div className="flex items-start gap-3 p-4 bg-[#FEFCF3] border-2 border-[#2b1b11] shadow-[4px_4px_0px_#2b1b11] text-left">
                                <Clock className="w-5 h-5 text-[#2b1b11] mt-0.5 flex-shrink-0 stroke-[2]" />
                                <div>
                                    <p className="text-sm font-bold text-[#2b1b11] font-mono">Menunggu Verifikasi</p>
                                    <p className="text-xs text-[#3c5443] mt-2 font-mono leading-relaxed">
                                        Admin akan memverifikasi pembayaranmu dalam 1x24 jam.
                                        {isKelasBesar
                                            ? " Link Zoom masterclass akan dikirimkan melalui email setelah disetujui."
                                            : isRegular
                                                ? " Kamu akan dihubungi via WhatsApp untuk konfirmasi jadwal."
                                                : " Kamu akan menerima email aktivasi setelah pembayaran disetujui."
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 mt-6">
                            <Button asChild className="w-full h-12 bg-[#25D366] hover:bg-[#128C7E] text-white border-2 border-[#2b1b11] shadow-[4px_4px_0px_#2b1b11] hover:shadow-[6px_6px_0px_#2b1b11] hover:-translate-y-1 transition-all rounded-none font-bold font-mono">
                                <a href="https://chat.whatsapp.com/Jw6ZTlTcKkw71epdsigMSz" target="_blank" rel="noopener noreferrer">
                                    <MessageCircle className="mr-2 w-5 h-5" />
                                    Gabung Grup WhatsApp
                                </a>
                            </Button>
                            <Button asChild className="w-full h-12 bg-[#FEFCF3] hover:bg-[#f2efe4] text-[#2b1b11] border-2 border-[#2b1b11] shadow-[4px_4px_0px_#2b1b11] hover:shadow-[6px_6px_0px_#2b1b11] hover:-translate-y-1 transition-all rounded-none font-bold font-mono">
                                <Link href="/">
                                    <ArrowLeft className="mr-2 w-5 h-5" />
                                    Kembali ke Beranda
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function RegisterSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#bed3c6] flex items-center justify-center">
                <div className="animate-pulse text-[#2b1b11] font-mono font-bold">Memuat...</div>
            </div>
        }>
            <RegisterSuccessContent />
        </Suspense>
    )
}

function RegisterSuccessContent() {
    return <SuccessContent />
}
