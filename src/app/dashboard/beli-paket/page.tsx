"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
    ProductSelector,
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
    const [selectedType, setSelectedType] = useState<RegistrationType | null>("UTS")

    // Form data
    const [track, setTrack] = useState<"PHYSICS_SEM_3" | "NON_PHYSICS">("PHYSICS_SEM_3")
    const [planCode, setPlanCode] = useState<PlanCode>("SEMESTER")
    const [subject, setSubject] = useState("FISDAS2")
    const [groupSize, setGroupSize] = useState("1")
    const [sessionCount, setSessionCount] = useState("1")
    const [scheduledDate, setScheduledDate] = useState("")
    const [scheduledTime, setScheduledTime] = useState("")
    const [notes, setNotes] = useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        toast.info("Pembelian paket berbayar belum dibuka (Coming Soon).")
    }

    return (
        <div className="max-w-4xl mx-auto py-6 px-2 sm:px-4 font-sans space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171717] dark:text-[#F5F4EE] tracking-tight">
                    Upgrade Paket Belajar
                </h1>
                <p className="text-sm text-ink-muted mt-1 font-medium">
                    Paket berbayar sedang disiapkan. Informasi harga dan aktivasi akan segera tersedia.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Step 1: Select Type */}
                <div className="bg-surface-white border-2 border-[#171717] dark:border-[#3F3F46] technical-shadow p-6 sm:p-8 space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="w-7 h-7 bg-accent-canary border border-[#171717] text-[#171717] font-mono font-bold text-xs flex items-center justify-center">
                            1
                        </span>
                        <h2 className="text-base sm:text-lg font-bold text-[#171717] dark:text-[#F5F4EE]">
                            Pilih Jenis Layanan
                        </h2>
                    </div>

                    <ProductSelector selected={selectedType} onSelect={setSelectedType} />
                </div>

                {/* Step 2: Form Details */}
                {selectedType && (
                    <div className="bg-surface-white border-2 border-[#171717] dark:border-[#3F3F46] technical-shadow p-6 sm:p-8 space-y-6 animate-in fade-in-50 duration-200">
                        <div className="flex items-center gap-3">
                            <span className="w-7 h-7 bg-accent-canary border border-[#171717] text-[#171717] font-mono font-bold text-xs flex items-center justify-center">
                                2
                            </span>
                            <h2 className="text-base sm:text-lg font-bold text-[#171717] dark:text-[#F5F4EE]">
                                Detail Pesanan
                            </h2>
                        </div>

                        <div className="space-y-4">
                            {selectedType === "UTS" ? (
                                <>
                                    <div>
                                        <label className="text-xs font-mono font-bold uppercase text-[#171717] dark:text-[#F5F4EE] mb-2 block">
                                            Jalur Kurikulum Mahasiswa
                                        </label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setTrack("PHYSICS_SEM_3")}
                                                className={`p-4 border-2 text-left transition-all cursor-pointer ${
                                                    track === "PHYSICS_SEM_3"
                                                        ? "border-[#171717] dark:border-[#FDE047] bg-accent-canary/20 text-[#171717] dark:text-[#F5F4EE]"
                                                        : "border-[#171717]/40 dark:border-[#3F3F46] bg-canvas-paper text-[#171717] dark:text-[#F5F4EE] hover:border-[#171717] dark:hover:border-[#FDE047]"
                                                }`}
                                            >
                                                <div className="font-bold text-sm">Departemen Fisika Smt 3</div>
                                                <div className="text-xs text-ink-muted mt-1">
                                                    6 Mata Kuliah Fisika Lanjutan (Mekanika, Fismat, Gelombang, Elektrostatika, Termo, Komputasi)
                                                </div>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setTrack("NON_PHYSICS")}
                                                className={`p-4 border-2 text-left transition-all cursor-pointer ${
                                                    track === "NON_PHYSICS"
                                                        ? "border-[#171717] dark:border-[#FDE047] bg-accent-canary/20 text-[#171717] dark:text-[#F5F4EE]"
                                                        : "border-[#171717]/40 dark:border-[#3F3F46] bg-canvas-paper text-[#171717] dark:text-[#F5F4EE] hover:border-[#171717] dark:hover:border-[#FDE047]"
                                                }`}
                                            >
                                                <div className="font-bold text-sm">Umum / Non-Fisika (PKU)</div>
                                                <div className="text-xs text-ink-muted mt-1">
                                                    4 Mata Kuliah Sains Dasar (Fisika Dasar 1 & 2, Statistika, Matematika 1)
                                                </div>
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-mono font-bold uppercase text-[#171717] dark:text-[#F5F4EE] mb-2 block">
                                            Pilih Paket Langganan All-Access
                                        </label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {PAID_PLANS.map((plan) => {
                                                const active = planCode === plan.code
                                                return (
                                                    <div
                                                        key={plan.id}
                                                        onClick={() => setPlanCode(plan.code)}
                                                        className={`p-5 border-2 cursor-pointer transition-all ${
                                                            active
                                                                ? "border-[#171717] dark:border-[#FDE047] bg-accent-canary/20 technical-shadow-sm"
                                                                : "border-[#171717]/40 dark:border-[#3F3F46] bg-canvas-paper hover:border-[#171717] dark:hover:border-[#FDE047]"
                                                        }`}
                                                    >
                                                        <div className="flex items-center justify-between gap-2">
                                                            <span className="font-bold text-base text-[#171717] dark:text-[#F5F4EE]">
                                                                {plan.name}
                                                            </span>
                                                            <span className="font-mono text-[10px] font-bold bg-accent-canary text-[#171717] border border-[#171717] px-2 py-0.5 uppercase shrink-0">
                                                                Coming Soon
                                                            </span>
                                                        </div>
                                                        <div className="mt-2 flex items-baseline gap-2">
                                                            <span className="font-mono text-2xl font-extrabold text-[#171717] dark:text-[#F5F4EE]">
                                                                Coming Soon
                                                            </span>
                                                        </div>
                                                        <div className="text-xs text-ink-muted mt-1">
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
                                    <label className="text-xs font-mono font-bold uppercase text-[#171717] dark:text-[#F5F4EE] mb-1.5 block">
                                        Mata Kuliah
                                    </label>
                                    <Select value={subject} onValueChange={setSubject}>
                                        <SelectTrigger className="w-full bg-canvas-paper border-2 border-[#171717] dark:border-[#3F3F46] rounded-none text-sm text-[#171717] dark:text-[#F5F4EE] h-11">
                                            <SelectValue placeholder="Pilih Mata Kuliah" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-surface-white border-2 border-[#171717] dark:border-[#3F3F46] rounded-none text-sm text-[#171717] dark:text-[#F5F4EE]">
                                            {SUBJECTS.map((s) => (
                                                <SelectItem key={s.value} value={s.value} className="cursor-pointer focus:bg-accent-canary focus:text-[#171717]">
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
                                            <label className="text-xs font-mono font-bold uppercase text-[#171717] dark:text-[#F5F4EE] mb-1.5 block">
                                                Jumlah Orang
                                            </label>
                                            <Select value={groupSize} onValueChange={setGroupSize}>
                                                <SelectTrigger className="w-full bg-canvas-paper border-2 border-[#171717] dark:border-[#3F3F46] rounded-none text-sm text-[#171717] dark:text-[#F5F4EE] h-11">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-surface-white border-2 border-[#171717] dark:border-[#3F3F46] rounded-none text-sm text-[#171717] dark:text-[#F5F4EE]">
                                                    <SelectItem value="1">1 Orang (Privat)</SelectItem>
                                                    <SelectItem value="2">2 Orang</SelectItem>
                                                    <SelectItem value="3">3 Orang</SelectItem>
                                                    <SelectItem value="4">4 Orang</SelectItem>
                                                    <SelectItem value="5">5 Orang</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-mono font-bold uppercase text-[#171717] dark:text-[#F5F4EE] mb-1.5 block">
                                                Jumlah Minggu
                                            </label>
                                            <Select value={sessionCount} onValueChange={setSessionCount}>
                                                <SelectTrigger className="w-full bg-canvas-paper border-2 border-[#171717] dark:border-[#3F3F46] rounded-none text-sm text-[#171717] dark:text-[#F5F4EE] h-11">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-surface-white border-2 border-[#171717] dark:border-[#3F3F46] rounded-none text-sm text-[#171717] dark:text-[#F5F4EE]">
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
                                            <label className="text-xs font-mono font-bold uppercase text-[#171717] dark:text-[#F5F4EE] mb-1.5 block">
                                                Tanggal Kelas
                                            </label>
                                            <Input
                                                type="date"
                                                value={scheduledDate}
                                                onChange={(e) => setScheduledDate(e.target.value)}
                                                className="bg-canvas-paper border-2 border-[#171717] dark:border-[#3F3F46] rounded-none text-sm text-[#171717] dark:text-[#F5F4EE] h-11"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-mono font-bold uppercase text-[#171717] dark:text-[#F5F4EE] mb-1.5 block">
                                                Waktu Kelas
                                            </label>
                                            <Input
                                                type="time"
                                                value={scheduledTime}
                                                onChange={(e) => setScheduledTime(e.target.value)}
                                                className="bg-canvas-paper border-2 border-[#171717] dark:border-[#3F3F46] rounded-none text-sm text-[#171717] dark:text-[#F5F4EE] h-11"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-mono font-bold uppercase text-[#171717] dark:text-[#F5F4EE] mb-1.5 block">
                                            Catatan Khusus (Opsional)
                                        </label>
                                        <Textarea
                                            placeholder="Topik spesifik yang ingin difokuskan"
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            maxLength={500}
                                            className="bg-canvas-paper border-2 border-[#171717] dark:border-[#3F3F46] rounded-none text-sm text-[#171717] dark:text-[#F5F4EE] resize-none"
                                        />
                                    </div>
                                </>
                            )}

                            {selectedType === "KELAS_BESAR" && (
                                <div className="p-4 bg-canvas-paper border-2 border-[#171717] dark:border-[#3F3F46] text-[#171717] dark:text-[#F5F4EE] text-xs font-semibold leading-relaxed">
                                    Total Biaya: Coming Soon (Akses Zoom Masterclass langsung, Recording, dan Bahan Ajaran Lengkap)
                                </div>
                            )}

                            <GoPayInfo />

                            <Button
                                type="submit"
                                disabled
                                className="w-full bg-canvas-paper text-ink-muted border-2 border-[#171717] dark:border-[#3F3F46] h-12 rounded-none font-mono text-xs font-bold uppercase cursor-not-allowed opacity-80"
                            >
                                Coming Soon
                            </Button>
                        </div>
                    </div>
                )}
            </form>
        </div>
    )
}
