"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import {
    ProductSelector,
    PaymentUpload,
    PricingBreakdown,
    GoPayInfo,
    UTSPackageSelector
} from "@/components/register"
import type { RegistrationType } from "@/lib/validators/registration"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { SUBJECTS } from "@/constants"

export default function UpgradePackagePage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [selectedType, setSelectedType] = useState<RegistrationType | null>(null)
    const [isSuccess, setIsSuccess] = useState(false)

    // Form data
    const [subject, setSubject] = useState("")
    const [groupSize, setGroupSize] = useState("1")
    const [sessionCount, setSessionCount] = useState("1")
    const [scheduledDate, setScheduledDate] = useState("")
    const [scheduledTime, setScheduledTime] = useState("")
    const [notes, setNotes] = useState("")
    const [packageType, setPackageType] = useState("")

    // File
    const [paymentFile, setPaymentFile] = useState<File | null>(null)
    const [paymentPreview, setPaymentPreview] = useState<string | null>(null)

    const handlePaymentChange = (file: File | null, preview: string | null) => {
        setPaymentFile(file)
        setPaymentPreview(preview)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!selectedType) {
            toast.error("Pilih jenis layanan terlebih dahulu.")
            return
        }

        if (!subject) {
            toast.error("Pilih mata kuliah.")
            return
        }

        if (selectedType === "UTS" && !packageType) {
            toast.error("Pilih tipe paket UTS.")
            return
        }

        if (!paymentFile) {
            toast.error("Unggah bukti transfer terlebih dahulu.")
            return
        }

        setIsLoading(true)

        try {
            const formData = new FormData()
            formData.append("type", selectedType)
            formData.append("subject", subject)
            formData.append("paymentProof", paymentFile)

            if (selectedType === "REGULAR") {
                formData.append("groupSize", groupSize)
                formData.append("sessionCount", sessionCount)
                formData.append("scheduledDate", scheduledDate)
                formData.append("scheduledTime", scheduledTime)
                formData.append("notes", notes)
            } else if (selectedType === "UTS") {
                formData.append("packageType", packageType)
            }

            const res = await fetch("/api/dashboard/purchase", {
                method: "POST",
                body: formData,
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Gagal melakukan pembelian paket.")
            }

            setIsSuccess(true)
            toast.success("Pesanan berhasil dikirim!", {
                description: "Admin kami akan memverifikasi bukti pembayaran Anda.",
            })
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Terjadi kesalahan.")
        } finally {
            setIsLoading(false)
        }
    }

    if (isSuccess) {
        return (
            <div className="max-w-xl mx-auto py-12 px-4 text-center font-sans">
                <div className="bg-white border border-[#FFEED6] rounded-3xl p-8 sm:p-10 shadow-sm space-y-5">
                    <div className="w-16 h-16 rounded-2xl bg-[#A5AF79]/15 text-[#A5AF79] mx-auto flex items-center justify-center">
                        <CheckCircle2 className="w-9 h-9" />
                    </div>
                    <h1 className="text-2xl font-bold text-[#827148]">Pembelian Berhasil Diajukan</h1>
                    <p className="text-sm text-[#827148]/75 leading-relaxed">
                        Bukti pembayaran kamu telah diterima dan sedang menunggu verifikasi oleh tim admin.
                        Akses modul dan tryout kamu akan aktif setelah disetujui.
                    </p>
                    <div className="pt-2">
                        <Button
                            onClick={() => router.push("/dashboard")}
                            className="w-full bg-[#827148] hover:bg-[#827148]/90 text-white rounded-xl h-11 font-semibold shadow-xs"
                        >
                            Kembali ke Dashboard
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 font-sans space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#827148] tracking-tight">
                    Upgrade Paket Belajar
                </h1>
                <p className="text-sm text-[#827148]/75 mt-1 font-medium">
                    Tingkatkan akun belajarmu untuk membuka seluruh materi, bank soal, dan simulasi CBT Tryout.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Step 1: Select Type */}
                <div className="bg-white border border-[#FFEED6] rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-[#FFEED6] text-[#827148] font-bold text-xs flex items-center justify-center">
                            1
                        </span>
                        <h2 className="text-base sm:text-lg font-bold text-[#827148]">
                            Pilih Jenis Layanan
                        </h2>
                    </div>

                    <ProductSelector selected={selectedType} onSelect={setSelectedType} />
                </div>

                {/* Step 2: Form Details */}
                {selectedType && (
                    <div className="bg-white border border-[#FFEED6] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in-50 duration-200">
                        <div className="flex items-center gap-3">
                            <span className="w-7 h-7 rounded-lg bg-[#FFEED6] text-[#827148] font-bold text-xs flex items-center justify-center">
                                2
                            </span>
                            <h2 className="text-base sm:text-lg font-bold text-[#827148]">
                                Detail Pesanan
                            </h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-[#827148] mb-1.5 block">
                                    Mata Kuliah
                                </label>
                                <Select value={subject} onValueChange={setSubject}>
                                    <SelectTrigger className="w-full bg-white border border-[#FFEED6] rounded-xl text-sm text-[#827148] h-11">
                                        <SelectValue placeholder="Pilih Mata Kuliah" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border border-[#FFEED6] rounded-xl text-sm text-[#827148]">
                                        {SUBJECTS.map((s) => (
                                            <SelectItem key={s.value} value={s.value} className="cursor-pointer">
                                                {s.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {selectedType === "REGULAR" && (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-[#827148] mb-1.5 block">
                                                Jumlah Orang
                                            </label>
                                            <Select value={groupSize} onValueChange={setGroupSize}>
                                                <SelectTrigger className="w-full bg-white border border-[#FFEED6] rounded-xl text-sm text-[#827148] h-11">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white border border-[#FFEED6] rounded-xl text-sm text-[#827148]">
                                                    <SelectItem value="1">1 Orang (Privat)</SelectItem>
                                                    <SelectItem value="2">2 Orang</SelectItem>
                                                    <SelectItem value="3">3 Orang</SelectItem>
                                                    <SelectItem value="4">4 Orang</SelectItem>
                                                    <SelectItem value="5">5 Orang</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-[#827148] mb-1.5 block">
                                                Jumlah Minggu
                                            </label>
                                            <Select value={sessionCount} onValueChange={setSessionCount}>
                                                <SelectTrigger className="w-full bg-white border border-[#FFEED6] rounded-xl text-sm text-[#827148] h-11">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white border border-[#FFEED6] rounded-xl text-sm text-[#827148]">
                                                    <SelectItem value="1">1 Minggu</SelectItem>
                                                    <SelectItem value="2">2 Minggu</SelectItem>
                                                    <SelectItem value="3">3 Minggu</SelectItem>
                                                    <SelectItem value="4">4 Minggu</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <PricingBreakdown
                                        groupSize={parseInt(groupSize, 10)}
                                        sessionCount={parseInt(sessionCount, 10)}
                                    />

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-[#827148] mb-1.5 block">
                                                Tanggal Kelas
                                            </label>
                                            <Input
                                                type="date"
                                                value={scheduledDate}
                                                onChange={(e) => setScheduledDate(e.target.value)}
                                                className="bg-white border border-[#FFEED6] rounded-xl text-sm text-[#827148] h-11"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-[#827148] mb-1.5 block">
                                                Waktu Kelas
                                            </label>
                                            <Input
                                                type="time"
                                                value={scheduledTime}
                                                onChange={(e) => setScheduledTime(e.target.value)}
                                                className="bg-white border border-[#FFEED6] rounded-xl text-sm text-[#827148] h-11"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-[#827148] mb-1.5 block">
                                            Catatan Khusus (Opsional)
                                        </label>
                                        <Textarea
                                            placeholder="Topik spesifik yang ingin difokuskan"
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            maxLength={500}
                                            className="bg-white border border-[#FFEED6] rounded-xl text-sm text-[#827148] resize-none"
                                        />
                                    </div>
                                </>
                            )}

                            {selectedType === "UTS" && (
                                <div className="space-y-4">
                                    <UTSPackageSelector selected={packageType} onSelect={setPackageType} />
                                </div>
                            )}

                            {selectedType === "KELAS_BESAR" && (
                                <div className="p-4 bg-[#E8A07C]/15 border border-[#E8A07C] text-[#827148] rounded-2xl text-xs font-semibold leading-relaxed">
                                    Total Biaya: Rp30.000 (Mendapat akses Zoom Masterclass langsung, Recording, & Bahan Ajaran Lengkap)
                                </div>
                            )}

                            <GoPayInfo />
                            <PaymentUpload file={paymentFile} previewUrl={paymentPreview} onFileChange={handlePaymentChange} />

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-[#827148] hover:bg-[#827148]/90 text-white h-12 rounded-xl text-sm font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Mengirim Bukti Pembayaran...
                                    </>
                                ) : (
                                    "Kirim Konfirmasi Pembayaran"
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </form>
        </div>
    )
}
