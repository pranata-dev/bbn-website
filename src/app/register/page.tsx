"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BookOpen, Loader2, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import {
    ProductSelector,
    RegularClassForm,
    KelasBesarForm,
} from "@/components/register"
import type { RegularClassFormState } from "@/components/register"
import type { KelasBesarFormState } from "@/components/register"
import type { RegistrationType } from "@/lib/validators/registration"
import { WHATSAPP_REGEX } from "@/constants"
import { useTheme } from "@/contexts/ThemeContext"

const initialRegularData: RegularClassFormState = {
    name: "",
    email: "",
    password: "",
    nim: "",
    subject: "",
    groupSize: "1",
    sessionCount: "1",
    scheduledDate: "",
    scheduledTime: "",
    whatsapp: "",
    notes: "",
}

const initialKelasBesarData: KelasBesarFormState = {
    name: "",
    email: "",
    password: "",
    nim: "",
    subject: "",
    whatsapp: "",
}

export default function RegisterPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const isSubmittingRef = useRef(false)
    const [selectedType, setSelectedType] = useState<RegistrationType | null>(null)

    // Form states
    const [regularData, setRegularData] = useState<RegularClassFormState>(initialRegularData)
    const [kelasBesarData, setKelasBesarData] = useState<KelasBesarFormState>(initialKelasBesarData)

    // Payment file states
    const [paymentFile, setPaymentFile] = useState<File | null>(null)
    const [paymentPreview, setPaymentPreview] = useState<string | null>(null)

    const handlePaymentChange = (file: File | null, preview: string | null) => {
        setPaymentFile(file)
        setPaymentPreview(preview)
    }

    const handleProductSelect = (type: RegistrationType) => {
        setSelectedType(type)
        if (paymentPreview) URL.revokeObjectURL(paymentPreview)
        setPaymentFile(null)
        setPaymentPreview(null)
    }

    const validateRegular = (): boolean => {
        if (!regularData.name || regularData.name.length < 3) {
            toast.error("Nama minimal 3 karakter.")
            return false
        }
        if (!regularData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regularData.email)) {
            toast.error("Email tidak valid.")
            return false
        }
        if (!regularData.password || regularData.password.length < 6) {
            toast.error("Password minimal 6 karakter.")
            return false
        }
        if (!regularData.nim || regularData.nim.length < 5) {
            toast.error("NIM minimal 5 karakter.")
            return false
        }
        if (!regularData.subject) {
            toast.error("Pilih mata kuliah.")
            return false
        }
        const groupSize = Number(regularData.groupSize)
        if (groupSize < 1 || groupSize > 20) {
            toast.error("Jumlah orang harus antara 1–20.")
            return false
        }
        const sessionCount = Number(regularData.sessionCount)
        if (sessionCount < 1 || sessionCount > 14) {
            toast.error("Jumlah minggu harus antara 1–14.")
            return false
        }
        if (!regularData.scheduledDate) {
            toast.error("Pilih tanggal kelas.")
            return false
        }
        if (!regularData.scheduledTime) {
            toast.error("Pilih waktu kelas.")
            return false
        }
        if (!WHATSAPP_REGEX.test(regularData.whatsapp)) {
            toast.error("Format nomor WhatsApp tidak valid.")
            return false
        }
        if (!paymentFile) {
            toast.error("Mohon unggah bukti pembayaran.")
            return false
        }
        return true
    }

    const validateKelasBesar = (): boolean => {
        if (!kelasBesarData.name || kelasBesarData.name.length < 3) {
            toast.error("Nama minimal 3 karakter.")
            return false
        }
        if (!kelasBesarData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(kelasBesarData.email)) {
            toast.error("Email tidak valid.")
            return false
        }
        if (!kelasBesarData.password || kelasBesarData.password.length < 6) {
            toast.error("Password minimal 6 karakter.")
            return false
        }
        if (!kelasBesarData.nim || kelasBesarData.nim.length < 5) {
            toast.error("NIM minimal 5 karakter.")
            return false
        }
        if (!kelasBesarData.subject) {
            toast.error("Pilih mata kuliah dan jadwal.")
            return false
        }
        if (!WHATSAPP_REGEX.test(kelasBesarData.whatsapp)) {
            toast.error("Format nomor WhatsApp tidak valid.")
            return false
        }
        if (!paymentFile) {
            toast.error("Mohon unggah bukti pembayaran.")
            return false
        }
        return true
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (isSubmittingRef.current) return
        isSubmittingRef.current = true

        if (!selectedType) {
            toast.error("Pilih jenis layanan terlebih dahulu.")
            isSubmittingRef.current = false
            return
        }

        if (selectedType === "REGULAR" && !validateRegular()) {
            isSubmittingRef.current = false
            return
        }
        if (selectedType === "KELAS_BESAR" && !validateKelasBesar()) {
            isSubmittingRef.current = false
            return
        }

        setIsLoading(true)

        try {
            const formPayload = new FormData()
            formPayload.append("type", selectedType)
            formPayload.append("paymentProof", paymentFile!)

            if (selectedType === "REGULAR") {
                formPayload.append("name", regularData.name)
                formPayload.append("email", regularData.email)
                formPayload.append("password", regularData.password)
                formPayload.append("nim", regularData.nim)
                formPayload.append("subject", regularData.subject)
                formPayload.append("whatsapp", regularData.whatsapp)
                formPayload.append("groupSize", regularData.groupSize)
                formPayload.append("sessionCount", regularData.sessionCount)
                formPayload.append("scheduledDate", regularData.scheduledDate)
                formPayload.append("scheduledTime", regularData.scheduledTime)
                formPayload.append("notes", regularData.notes)
            } else if (selectedType === "KELAS_BESAR") {
                formPayload.append("name", kelasBesarData.name)
                formPayload.append("email", kelasBesarData.email)
                formPayload.append("password", kelasBesarData.password)
                formPayload.append("nim", kelasBesarData.nim)
                formPayload.append("subject", kelasBesarData.subject)
                formPayload.append("whatsapp", kelasBesarData.whatsapp)
            }

            const response = await fetch("/api/register", {
                method: "POST",
                body: formPayload,
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Terjadi kesalahan saat mendaftar.")
            }

            toast.success("Pendaftaran berhasil! Silakan tunggu verifikasi admin.")
            router.push(`/register/success?type=${selectedType}`)
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Terjadi kesalahan.")
        } finally {
            setIsLoading(false)
            isSubmittingRef.current = false
        }
    }

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

            <div className="w-full max-w-4xl px-4 sm:px-6 lg:px-8 z-10 relative">
                {/* Back link */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm font-bold text-[#2b1b11] font-mono hover:text-[#e87a5d] transition-colors mb-8 bg-[#FEFCF3] border-2 border-[#2b1b11] px-4 py-2 shadow-[2px_2px_0px_#2b1b11] hover:shadow-[3px_3px_0px_#2b1b11] hover:-translate-y-0.5 transition-all"
                >
                    <ArrowLeft className="w-4 h-4 stroke-[3]" />
                    Kembali ke beranda
                </Link>

                {/* Main Card */}
                <div className="bg-[#FEFCF3] border-4 border-[#2b1b11] rounded-2xl shadow-[8px_8px_0px_#2b1b11] overflow-hidden">
                    {/* Header */}
                    <div className="text-center pt-8 pb-4 px-6 border-b-4 border-[#2b1b11] bg-[#bed3c6]">
                        <div className="mx-auto w-12 h-12 bg-[#FEFCF3] border-2 border-[#2b1b11] flex items-center justify-center shadow-[2px_2px_0px_#2b1b11] mb-4">
                            <BookOpen className="w-6 h-6 text-[#2b1b11] stroke-[2]" />
                        </div>
                        <h1
                            className="text-xl md:text-2xl font-extrabold text-[#2b1b11] mb-2"
                            style={{ fontFamily: "var(--font-press-start)", lineHeight: 1.4 }}
                        >
                            Daftar Sekarang
                        </h1>
                        <p className="text-xs md:text-sm text-[#3c5443] font-bold font-mono">
                            Pilih layanan yang sesuai dengan kebutuhanmu.
                        </p>
                    </div>

                    {/* Content */}
                    <div className="p-6 md:p-10">
                        <form onSubmit={handleSubmit} className="space-y-10" aria-label="Formulir pendaftaran">
                            {/* Step 1: Product Selection */}
                            <div className="space-y-5">
                                <div className="flex items-center gap-3">
                                    <span className="w-8 h-8 bg-[#e87a5d] border-2 border-[#2b1b11] text-[#FEFCF3] text-xs font-bold flex items-center justify-center shadow-[2px_2px_0px_#2b1b11] font-mono">1</span>
                                    <p className="text-sm font-bold text-[#2b1b11] font-mono tracking-tight">
                                        Pilih Layanan
                                    </p>
                                </div>
                                <ProductSelector
                                    selected={selectedType}
                                    onSelect={handleProductSelect}
                                />
                            </div>

                            {/* Step 2: Dynamic Form */}
                            {selectedType && (
                                <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
                                    <div className="flex items-center gap-3 mb-8">
                                        <span className="w-8 h-8 bg-[#e87a5d] border-2 border-[#2b1b11] text-[#FEFCF3] text-xs font-bold flex items-center justify-center shadow-[2px_2px_0px_#2b1b11] font-mono">2</span>
                                        <p className="text-sm font-bold text-[#2b1b11] font-mono tracking-tight">
                                            Isi Detail
                                        </p>
                                    </div>

                                    {selectedType === "REGULAR" ? (
                                        <RegularClassForm
                                            formData={regularData}
                                            onChange={setRegularData}
                                            paymentFile={paymentFile}
                                            paymentPreview={paymentPreview}
                                            onPaymentChange={handlePaymentChange}
                                        />
                                    ) : (
                                        <KelasBesarForm
                                            formData={kelasBesarData}
                                            onChange={setKelasBesarData}
                                            paymentFile={paymentFile}
                                            paymentPreview={paymentPreview}
                                            onPaymentChange={handlePaymentChange}
                                        />
                                    )}

                                    {/* Submit */}
                                    <Button
                                        type="submit"
                                        className="w-full bg-[#e87a5d] hover:bg-[#d95a4f] text-[#FEFCF3] h-12 mt-6 rounded-none border-2 border-[#2b1b11] shadow-[4px_4px_0px_#2b1b11] hover:shadow-[6px_6px_0px_#2b1b11] hover:-translate-y-1 transition-all font-bold font-mono text-base"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Mendaftar...
                                            </>
                                        ) : (
                                            "Daftar Sekarang"
                                        )}
                                    </Button>
                                </div>
                            )}

                            <p className="text-center text-xs font-bold text-[#3c5443] font-mono">
                                Sudah punya akun?{" "}
                                <Link href="/login" className="text-[#e87a5d] hover:underline">
                                    Masuk
                                </Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
