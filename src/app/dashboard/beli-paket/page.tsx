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
import { SUBSCRIPTION_PLAN_LIST, type PlanCode } from "@/config/plans"

const PAID_PLANS = SUBSCRIPTION_PLAN_LIST.filter((p) => p.code !== "FREE")

export default function UpgradePackagePage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [selectedType, setSelectedType] = useState<RegistrationType | null>("UTS")
    const [isSuccess, setIsSuccess] = useState(false)

    // Form data
    const [track, setTrack] = useState<"PHYSICS_SEM_3" | "NON_PHYSICS">("PHYSICS_SEM_3")
    const [planCode, setPlanCode] = useState<PlanCode>("SEMESTER")
    const [subject, setSubject] = useState("FISDAS2")
    const [groupSize, setGroupSize] = useState("1")
    const [sessionCount, setSessionCount] = useState("1")
    const [scheduledDate, setScheduledDate] = useState("")
    const [scheduledTime, setScheduledTime] = useState("")
    const [notes, setNotes] = useState("")

    // File
    const [paymentFile, setPaymentFile] = useState<File | null>(null)
    const [paymentPreview, setPaymentPreview] = useState<string | null>(null)

    const handlePaymentChange = (file: File | null, preview: string | null) => {
        setPaymentFile(file)
        setPaymentPreview(preview)
    }

    const selectedPaidPlan = PAID_PLANS.find((p) => p.code === planCode) || PAID_PLANS[1]

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!selectedType) {
            toast.error("Pilih jenis layanan terlebih dahulu.")
            return
        }

        if (selectedType !== "UTS" && !subject) {
            toast.error("Pilih mata kuliah.")
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
            formData.append(
                "subject",
                selectedType === "UTS"
                    ? track === "PHYSICS_SEM_3"
                        ? "Fisika Smt 3"
                        : "Umum / Non-Fisika"
                    : subject
            )
            formData.append("track", track)
            formData.append("paymentProof", paymentFile)

            if (selectedType === "REGULAR") {
                formData.append("groupSize", groupSize)
                formData.append("sessionCount", sessionCount)
                formData.append("scheduledDate", scheduledDate)
                formData.append("scheduledTime", scheduledTime)
                formData.append("notes", notes)
            } else if (selectedType === "UTS") {
                formData.append("plan_code", planCode)
                formData.append("packageType", planCode.toLowerCase())
                formData.append("price", String(selectedPaidPlan.price))
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
                            {selectedType === "UTS" ? (
                                <>
                                    <div>
                                        <label className="text-xs font-bold text-[#827148] mb-2 block">
                                            Jalur Kurikulum Mahasiswa
                                        </label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setTrack("PHYSICS_SEM_3")}
                                                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                                                    track === "PHYSICS_SEM_3"
                                                        ? "border-[#827148] bg-[#FFEED6]/40 text-[#827148]"
                                                        : "border-[#FFEED6] bg-white text-[#827148]/80 hover:border-[#A5AF79]"
                                                }`}
                                            >
                                                <div className="font-bold text-sm">Departemen Fisika Smt 3</div>
                                                <div className="text-xs text-[#827148]/70 mt-1">
                                                    6 Mata Kuliah Fisika Lanjutan (Mekanika, Fismat, Gelombang, Elektrostatika, Termo, Komputasi)
                                                </div>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setTrack("NON_PHYSICS")}
                                                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                                                    track === "NON_PHYSICS"
                                                        ? "border-[#827148] bg-[#FFEED6]/40 text-[#827148]"
                                                        : "border-[#FFEED6] bg-white text-[#827148]/80 hover:border-[#A5AF79]"
                                                }`}
                                            >
                                                <div className="font-bold text-sm">Umum / Non-Fisika (PKU)</div>
                                                <div className="text-xs text-[#827148]/70 mt-1">
                                                    4 Mata Kuliah Sains Dasar (Fisika Dasar 1 & 2, Statistika, Matematika 1)
                                                </div>
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-[#827148] mb-2 block">
                                            Pilih Paket Langganan All-Access
                                        </label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {PAID_PLANS.map((plan) => {
                                                const active = planCode === plan.code
                                                return (
                                                    <div
                                                        key={plan.id}
                                                        onClick={() => setPlanCode(plan.code)}
                                                        className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                                                            active
                                                                ? "border-[#827148] bg-[#FFEED6]/50 shadow-sm"
                                                                : "border-[#FFEED6] bg-white hover:border-[#A5AF79]"
                                                        }`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-bold text-base text-[#827148]">
                                                                {plan.name}
                                                            </span>
                                                            <span className="text-[10px] font-bold bg-[#A5AF79] text-white px-2.5 py-0.5 rounded-full">
                                                                {plan.badge}
                                                            </span>
                                                        </div>
                                                        <div className="mt-2 flex items-baseline gap-2">
                                                            <span className="text-2xl font-extrabold text-[#827148]">
                                                                {plan.priceFormatted}
                                                            </span>
                                                            {plan.originalPriceFormatted && (
                                                                <span className="text-xs text-[#827148]/50 line-through">
                                                                    {plan.originalPriceFormatted}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-[#827148]/70 mt-1">
                                                            Masa aktif: {plan.durationLabel}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </>
                            ) : (
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
                            )}

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
