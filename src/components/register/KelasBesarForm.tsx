"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { PaymentUpload } from "./PaymentUpload"
import { GoPayInfo } from "./GoPayInfo"

export interface KelasBesarFormState {
    name: string
    email: string
    password: string
    nim: string
    subject: string
    whatsapp: string
}

interface KelasBesarFormProps {
    formData: KelasBesarFormState
    onChange: (data: KelasBesarFormState) => void
    paymentFile: File | null
    paymentPreview: string | null
    onPaymentChange: (file: File | null, preview: string | null) => void
}

const KELAS_BESAR_SUBJECTS = [
    { value: "FISMAT", label: "Fisika-Matematika: Minggu, 5 April 2026 pukul 19:00 - Selesai" },
    { value: "FISDAS2", label: "Fisika Dasar 2: Senin, 6 April 2026 pukul 19:00 - Selesai" },
]

export function KelasBesarForm({
    formData,
    onChange,
    paymentFile,
    paymentPreview,
    onPaymentChange,
}: KelasBesarFormProps) {
    const update = (field: keyof KelasBesarFormState, value: string) => {
        onChange({ ...formData, [field]: value })
    }

    return (
        <div className="space-y-5 font-mono">
            {/* Name */}
            <div className="space-y-2">
                <label htmlFor="kb-name" className="text-sm font-bold text-[#2b1b11]">Nama Lengkap</label>
                <Input
                    id="kb-name"
                    placeholder="Masukkan nama lengkap"
                    value={formData.name}
                    onChange={(e) => update("name", e.target.value)}
                    className="bg-[#bed3c6]/30 border-2 border-[#2b1b11] rounded-none shadow-[2px_2px_0px_#2b1b11] font-mono text-sm text-[#2b1b11] placeholder:text-[#3c5443]/50 focus:ring-[#e87a5d] focus:border-[#e87a5d] h-11"
                    required
                />
            </div>

            {/* Email */}
            <div className="space-y-2">
                <label htmlFor="kb-email" className="text-sm font-bold text-[#2b1b11]">Email</label>
                <Input
                    id="kb-email"
                    type="email"
                    placeholder="Masukkan alamat email"
                    value={formData.email}
                    onChange={(e) => update("email", e.target.value)}
                    className="bg-[#bed3c6]/30 border-2 border-[#2b1b11] rounded-none shadow-[2px_2px_0px_#2b1b11] font-mono text-sm text-[#2b1b11] placeholder:text-[#3c5443]/50 focus:ring-[#e87a5d] focus:border-[#e87a5d] h-11"
                    required
                />
            </div>

            {/* Password */}
            <div className="space-y-2">
                <label htmlFor="kb-password" className="text-sm font-bold text-[#2b1b11]">Password Baru</label>
                <Input
                    id="kb-password"
                    type="password"
                    placeholder="Minimal 6 karakter"
                    value={formData.password}
                    onChange={(e) => update("password", e.target.value)}
                    className="bg-[#bed3c6]/30 border-2 border-[#2b1b11] rounded-none shadow-[2px_2px_0px_#2b1b11] font-mono text-sm text-[#2b1b11] placeholder:text-[#3c5443]/50 focus:ring-[#e87a5d] focus:border-[#e87a5d] h-11"
                    required
                    minLength={6}
                />
            </div>

            {/* NIM */}
            <div className="space-y-2">
                <label htmlFor="kb-nim" className="text-sm font-bold text-[#2b1b11]">NIM</label>
                <Input
                    id="kb-nim"
                    placeholder="Masukkan NIM"
                    value={formData.nim}
                    onChange={(e) => update("nim", e.target.value)}
                    className="bg-[#bed3c6]/30 border-2 border-[#2b1b11] rounded-none shadow-[2px_2px_0px_#2b1b11] font-mono text-sm text-[#2b1b11] placeholder:text-[#3c5443]/50 focus:ring-[#e87a5d] focus:border-[#e87a5d] h-11"
                    required
                />
            </div>

            {/* Subject */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-[#2b1b11]">Mata Kuliah & Jadwal</label>
                <Select
                    value={formData.subject}
                    onValueChange={(v) => update("subject", v)}
                >
                    <SelectTrigger className="bg-[#bed3c6]/30 border-2 border-[#2b1b11] rounded-none shadow-[2px_2px_0px_#2b1b11] font-mono text-sm text-[#2b1b11] h-11">
                        <SelectValue placeholder="Pilih mata kuliah dan jadwal" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#FEFCF3] border-2 border-[#2b1b11] rounded-none font-mono">
                        {KELAS_BESAR_SUBJECTS.map((s) => (
                            <SelectItem key={s.value} value={s.value} className="font-mono text-sm text-[#2b1b11] hover:bg-[#bed3c6]">
                                {s.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* WhatsApp */}
            <div className="space-y-2">
                <label htmlFor="kb-wa" className="text-sm font-bold text-[#2b1b11]">Nomor WhatsApp</label>
                <Input
                    id="kb-wa"
                    type="tel"
                    placeholder="08xxxxxxxxxx"
                    value={formData.whatsapp}
                    onChange={(e) => update("whatsapp", e.target.value)}
                    className="bg-[#bed3c6]/30 border-2 border-[#2b1b11] rounded-none shadow-[2px_2px_0px_#2b1b11] font-mono text-sm text-[#2b1b11] placeholder:text-[#3c5443]/50 h-11"
                    required
                />
                <p className="text-xs text-[#3c5443] font-semibold">Format: 08xx, 62xx, atau +62xx</p>
            </div>

            {/* Price Info Box */}
            <div className="mt-6 bg-[#FEFCF3] border-4 border-[#2b1b11] rounded-xl p-5 shadow-[4px_4px_0px_#2b1b11]">
                <h4 className="text-sm font-bold text-[#2b1b11] mb-3 flex items-center gap-2">
                    <span className="w-2 h-5 bg-[#e87a5d]"></span>
                    Investasi Belajar
                </h4>
                <div className="flex justify-between items-end mb-4 pb-3 border-b-2 border-[#2b1b11]/20">
                    <span className="text-sm text-[#3c5443] font-bold mb-1">Biaya Kelas</span>
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center text-[10px] font-bold bg-red-600 text-white px-1.5 py-0.5 rounded-sm outline outline-1 outline-red-600">
                                Hemat 33%
                            </span>
                            <span className="line-through text-muted-foreground text-sm decoration-red-600 font-mono">
                                Rp 45.000
                            </span>
                        </div>
                        <span className="text-lg font-bold text-[#e87a5d]">Rp 30.000</span>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6">
                    {[
                        "Akses zoom recording masterclass H-1",
                        "Bahas soal-soal tahun lalu",
                        "Tips pengerjaan cepat & santai",
                        "Prediksi soal ujian",
                        "Akses gratis soal-soal tahun lalu",
                    ].map((benefit, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-[#3c5443] font-semibold">
                            <span className="text-[#e87a5d]">✦</span>
                            <span>{benefit}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* GoPay Payment Info */}
            <GoPayInfo />

            {/* Payment Upload */}
            <PaymentUpload
                file={paymentFile}
                previewUrl={paymentPreview}
                onFileChange={onPaymentChange}
            />
        </div>
    )
}
