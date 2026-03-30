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
        <div className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
                <Label htmlFor="kb-name">Nama Lengkap</Label>
                <Input
                    id="kb-name"
                    placeholder="Masukkan nama lengkap"
                    value={formData.name}
                    onChange={(e) => update("name", e.target.value)}
                    className="bg-warm-beige/30 border-warm-gray"
                    required
                />
            </div>

            {/* Email */}
            <div className="space-y-2">
                <Label htmlFor="kb-email">Email</Label>
                <Input
                    id="kb-email"
                    type="email"
                    placeholder="Masukkan alamat email"
                    value={formData.email}
                    onChange={(e) => update("email", e.target.value)}
                    className="bg-warm-beige/30 border-warm-gray"
                    required
                />
            </div>

            {/* Password */}
            <div className="space-y-2">
                <Label htmlFor="kb-password">Password Baru</Label>
                <Input
                    id="kb-password"
                    type="password"
                    placeholder="Minimal 6 karakter"
                    value={formData.password}
                    onChange={(e) => update("password", e.target.value)}
                    className="bg-warm-beige/30 border-warm-gray"
                    required
                    minLength={6}
                />
            </div>

            {/* NIM */}
            <div className="space-y-2">
                <Label htmlFor="kb-nim">NIM</Label>
                <Input
                    id="kb-nim"
                    placeholder="Masukkan NIM"
                    value={formData.nim}
                    onChange={(e) => update("nim", e.target.value)}
                    className="bg-warm-beige/30 border-warm-gray"
                    required
                />
            </div>

            {/* Subject */}
            <div className="space-y-2">
                <Label>Mata Kuliah & Jadwal</Label>
                <Select
                    value={formData.subject}
                    onValueChange={(v) => update("subject", v)}
                >
                    <SelectTrigger className="bg-warm-beige/30 border-warm-gray">
                        <SelectValue placeholder="Pilih mata kuliah dan jadwal" />
                    </SelectTrigger>
                    <SelectContent>
                        {KELAS_BESAR_SUBJECTS.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                                {s.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* WhatsApp */}
            <div className="space-y-2">
                <Label htmlFor="kb-wa">Nomor WhatsApp</Label>
                <Input
                    id="kb-wa"
                    type="tel"
                    placeholder="08xxxxxxxxxx"
                    value={formData.whatsapp}
                    onChange={(e) => update("whatsapp", e.target.value)}
                    className="bg-warm-beige/30 border-warm-gray"
                    required
                />
                <p className="text-xs text-muted-foreground">Format: 08xx, 62xx, atau +62xx</p>
            </div>

            {/* Price Info Box */}
            <div className="mt-8 rounded-2xl bg-dark-brown/5 border border-dark-brown/10 p-6">
                <h4 className="text-sm font-bold text-dark-brown mb-2 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-dark-brown rounded-full"></span>
                    Investasi Belajar
                </h4>
                <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-foreground/80 font-medium">Biaya Kelas</span>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium line-through text-muted-foreground">Rp 45.000</span>
                        <span className="text-lg font-bold text-dark-brown">Rp 30.000</span>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                    {[
                        "Akses zoom recording masterclass H-1",
                        "Bahas soal-soal tahun lalu",
                        "Tips pengerjaan cepat & santai",
                        "Prediksi soal ujian",
                        "Akses gratis soal-soal tahun lalu",
                    ].map((benefit, i) => (
                        <div key={i} className="flex items-center gap-2.5 text-[11px] text-foreground/80">
                            <div className="w-1 h-1 rounded-full bg-soft-brown"></div>
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
