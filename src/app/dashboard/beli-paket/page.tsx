"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2, PlusCircle, CheckCircle2 } from "lucide-react"
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

        if (selectedType === "REGULAR") {
            if (!scheduledDate || !scheduledTime) {
                toast.error("Pilih tanggal dan waktu kelas.")
                return
            }
        }

        if (selectedType === "UTS" && !packageType) {
            toast.error("Pilih paket UTS.")
            return
        }

        if (!paymentFile) {
            toast.error("Mohon unggah bukti pembayaran.")
            return
        }

        setIsLoading(true)

        try {
            const formPayload = new FormData()
            formPayload.append("type", selectedType)
            formPayload.append("subject", subject)
            formPayload.append("paymentProof", paymentFile)

            if (selectedType === "REGULAR") {
                formPayload.append("groupSize", groupSize)
                formPayload.append("sessionCount", sessionCount)
                formPayload.append("scheduledDate", scheduledDate)
                formPayload.append("scheduledTime", scheduledTime)
                formPayload.append("notes", notes)
            } else if (selectedType === "UTS") {
                formPayload.append("packageType", packageType)
            }

            const response = await fetch("/api/dashboard/purchase", {
                method: "POST",
                body: formPayload,
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Terjadi kesalahan.")
            }

            toast.success("Berhasil! Silakan tunggu verifikasi admin.")
            setIsSuccess(true)
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Terjadi kesalahan.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleNumberChange = (setter: any, val: string, isSession: boolean = false) => {
        if (!val) {
            setter("")
            return
        }
        const numericVal = val.replace(/\D/g, "")
        let cleaned = numericVal.replace(/^0+/, "")
        let finalVal = cleaned || (numericVal === "0" ? "0" : "")
        if (isSession) {
            const parsed = parseInt(finalVal)
            if (!isNaN(parsed) && parsed > 7) finalVal = "7"
        }
        setter(finalVal)
    }

    if (isSuccess) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-lg mx-auto p-4 animate-fade-up font-mono">
                <CheckCircle2 className="w-20 h-20 text-[#e87a5d] mb-6 stroke-[1.5]" />
                <h1 className="text-2xl font-bold text-[#2b1b11] mb-4">Pembelian Berhasil</h1>
                <p className="text-[#3c5443] mb-8 font-semibold">
                    Terima kasih! Bukti pembayaranmu sedang diproses oleh admin. Kami akan memberitahumu melalui email/WhatsApp jika sudah disetujui.
                </p>
                <Button 
                    onClick={() => router.push("/dashboard")}
                    className="w-full bg-[#2b1b11] text-[#FEFCF3] hover:bg-[#3c5443] rounded-none border-2 border-[#2b1b11] shadow-[4px_4px_0px_#2b1b11] h-12"
                >
                    Kembali ke Dashboard
                </Button>
            </div>
        )
    }

    return (
        <div className="animate-fade-in font-mono max-w-4xl mx-auto pb-12">
            <h1 className="text-2xl font-bold text-[#2b1b11] mb-2 flex items-center gap-2">
                <PlusCircle className="w-6 h-6 stroke-[2.5]" />
                Beli Paket Baru
            </h1>
            <p className="text-sm text-[#3c5443] mb-8 font-bold">Pilih layanan tambahan yang kamu inginkan dan rasakan pengalaman belajar maksimal!</p>

            <form onSubmit={handleSubmit} className="space-y-10">
                <div className="bg-[#FEFCF3] border-4 border-[#2b1b11] p-6 shadow-[6px_6px_0px_#2b1b11]">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="w-8 h-8 bg-[#e87a5d] border-2 border-[#2b1b11] text-[#FEFCF3] text-xs font-bold flex items-center justify-center shadow-[2px_2px_0px_#2b1b11]">1</span>
                        <h2 className="text-lg font-bold text-[#2b1b11]">Pilih Layanan</h2>
                    </div>
                    <ProductSelector selected={selectedType} onSelect={setSelectedType} />
                </div>

                {selectedType && (
                    <div className="bg-[#FEFCF3] border-4 border-[#2b1b11] p-6 shadow-[6px_6px_0px_#2b1b11] animate-fade-up">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-8 h-8 bg-[#e87a5d] border-2 border-[#2b1b11] text-[#FEFCF3] text-xs font-bold flex items-center justify-center shadow-[2px_2px_0px_#2b1b11]">2</span>
                            <h2 className="text-lg font-bold text-[#2b1b11]">Detail Pesanan</h2>
                        </div>

                        <div className="space-y-6">
                            {/* Subject is common to all */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-[#2b1b11]">Mata Kuliah</label>
                                <Select value={subject} onValueChange={setSubject}>
                                    <SelectTrigger className="bg-[#bed3c6]/30 border-2 border-[#2b1b11] rounded-none shadow-[2px_2px_0px_#2b1b11] text-[#2b1b11] h-11">
                                        <SelectValue placeholder="Pilih mata kuliah" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#FEFCF3] border-2 border-[#2b1b11] rounded-none font-mono text-sm">
                                        {SUBJECTS.map((s) => (
                                            <SelectItem key={s.value} value={s.value} className="hover:bg-[#bed3c6] focus:bg-[#bed3c6]">
                                                {s.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {selectedType === "REGULAR" && (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-[#2b1b11]">Jumlah Orang</label>
                                            <Input 
                                                type="number" value={groupSize} 
                                                onChange={(e) => handleNumberChange(setGroupSize, e.target.value)}
                                                className="bg-[#bed3c6]/30 border-2 border-[#2b1b11] rounded-none shadow-[2px_2px_0px_#2b1b11] h-11"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-[#2b1b11]">Jumlah Minggu</label>
                                            <Input 
                                                type="number" value={sessionCount} 
                                                onChange={(e) => handleNumberChange(setSessionCount, e.target.value, true)}
                                                className="bg-[#bed3c6]/30 border-2 border-[#2b1b11] rounded-none shadow-[2px_2px_0px_#2b1b11] h-11"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <PricingBreakdown groupSize={Number(groupSize)} sessionCount={Number(sessionCount)} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-[#2b1b11]">Tanggal Kelas</label>
                                            <Input 
                                                type="date" value={scheduledDate} min={new Date().toISOString().split("T")[0]} 
                                                onChange={(e) => setScheduledDate(e.target.value)}
                                                className="bg-[#bed3c6]/30 border-2 border-[#2b1b11] rounded-none shadow-[2px_2px_0px_#2b1b11] h-11"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-[#2b1b11]">Waktu Kelas</label>
                                            <Input 
                                                type="time" value={scheduledTime} 
                                                onChange={(e) => setScheduledTime(e.target.value)}
                                                className="bg-[#bed3c6]/30 border-2 border-[#2b1b11] rounded-none shadow-[2px_2px_0px_#2b1b11] h-11"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-[#2b1b11]">Catatan</label>
                                        <Textarea 
                                            placeholder="Materi yang ingin dibahas" value={notes} 
                                            onChange={(e) => setNotes(e.target.value)} maxLength={500}
                                            className="bg-[#bed3c6]/30 border-2 border-[#2b1b11] rounded-none shadow-[2px_2px_0px_#2b1b11] resize-none"
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
                                <div className="p-4 bg-[#e87a5d]/10 border-l-4 border-[#e87a5d] text-[#e87a5d] font-bold text-sm">
                                    Total Biaya: Rp30.000 (Mendapat link Zoom, Recording, & Bahan Ajaran)
                                </div>
                            )}

                            <GoPayInfo />
                            <PaymentUpload file={paymentFile} previewUrl={paymentPreview} onFileChange={handlePaymentChange} />
                            
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-[#e87a5d] hover:bg-[#d95a4f] text-[#FEFCF3] h-12 rounded-none border-2 border-[#2b1b11] shadow-[4px_4px_0px_#2b1b11] hover:shadow-[6px_6px_0px_#2b1b11] hover:-translate-y-1 transition-all text-base font-bold"
                            >
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Selesaikan Pembelian"}
                            </Button>
                        </div>
                    </div>
                )}
            </form>
        </div>
    )
}
