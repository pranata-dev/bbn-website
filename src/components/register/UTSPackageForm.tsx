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
import { BankTransferInfo } from "./BankTransferInfo"
import { UTSPackageSelector } from "./UTSPackageSelector"
import { SUBJECTS, UTS_PACKAGES } from "@/constants"

export interface UTSPackageFormState {
    name: string
    email: string
    password: string
    nim: string
    subject: string
    packageType: string
    price: number
    whatsapp: string
}

interface UTSPackageFormProps {
    formData: UTSPackageFormState
    onChange: (data: UTSPackageFormState) => void
    paymentFile: File | null
    paymentPreview: string | null
    onPaymentChange: (file: File | null, preview: string | null) => void
}

export function UTSPackageForm({
    formData,
    onChange,
    paymentFile,
    paymentPreview,
    onPaymentChange,
}: UTSPackageFormProps) {
    const update = (field: keyof UTSPackageFormState, value: string) => {
        onChange({ ...formData, [field]: value })
    }

    return (
        <div className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
                <Label htmlFor="uts-name">Nama Lengkap</Label>
                <Input
                    id="uts-name"
                    placeholder="Masukkan nama lengkap"
                    value={formData.name}
                    onChange={(e) => update("name", e.target.value)}
                    className="bg-warm-beige/30 border-warm-gray"
                    required
                />
            </div>

            {/* Email */}
            <div className="space-y-2">
                <Label htmlFor="uts-email">Email</Label>
                <Input
                    id="uts-email"
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
                <Label htmlFor="uts-password">Password Baru</Label>
                <Input
                    id="uts-password"
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
                <Label htmlFor="uts-nim">NIM</Label>
                <Input
                    id="uts-nim"
                    placeholder="Masukkan NIM"
                    value={formData.nim}
                    onChange={(e) => update("nim", e.target.value)}
                    className="bg-warm-beige/30 border-warm-gray"
                    required
                />
            </div>

            {/* Subject */}
            <div className="space-y-2">
                <Label>Mata Kuliah</Label>
                <Select
                    value={formData.subject}
                    onValueChange={(v) => update("subject", v)}
                >
                    <SelectTrigger className="bg-warm-beige/30 border-warm-gray">
                        <SelectValue placeholder="Pilih mata kuliah" />
                    </SelectTrigger>
                    <SelectContent>
                        {SUBJECTS.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                                {s.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Package type */}
            <div className="space-y-4">
                <div className="flex flex-col gap-1">
                    <Label className="text-base font-bold text-dark-brown">Pilih Tipe Paket</Label>
                    <p className="text-xs text-muted-foreground">Pilih paket yang paling sesuai dengan target belajarmu.</p>
                </div>

                <UTSPackageSelector
                    selected={formData.packageType}
                    onSelect={(v: string) => {
                        const pkg = UTS_PACKAGES.find(p => p.value === v)
                        if (pkg) {
                            onChange({ ...formData, packageType: v, price: pkg.price })
                        }
                    }}
                />

                {/* Additional Benefits Section */}
                <div className="mt-8 rounded-2xl bg-dark-brown/5 border border-dark-brown/10 p-6">
                    <h4 className="text-sm font-bold text-dark-brown mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-4 bg-dark-brown rounded-full"></span>
                        Kenapa Belajar Bareng Nata?
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                        {[
                            "Prediksi aman di UTS atau lanjut balas di UAS",
                            "Analisis performa per materi",
                            "Sistem auto-save jawaban (anti koneksi putus)",
                            "Akses penuh 24/7 selama 30 hari",
                            "Ranking system (Mode Kompe)",
                        ].map((benefit, i) => (
                            <div key={i} className="flex items-center gap-2.5 text-[11px] text-foreground/80">
                                <div className="w-1 h-1 rounded-full bg-soft-brown"></div>
                                <span>{benefit}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* WhatsApp */}
            <div className="space-y-2">
                <Label htmlFor="uts-wa">Nomor WhatsApp</Label>
                <Input
                    id="uts-wa"
                    type="tel"
                    placeholder="08xxxxxxxxxx"
                    value={formData.whatsapp}
                    onChange={(e) => update("whatsapp", e.target.value)}
                    className="bg-warm-beige/30 border-warm-gray"
                    required
                />
                <p className="text-xs text-muted-foreground">Format: 08xx, 62xx, atau +62xx</p>
            </div>

            {/* Bank Transfer Info */}
            <BankTransferInfo />

            {/* Payment Upload */}
            <PaymentUpload
                file={paymentFile}
                previewUrl={paymentPreview}
                onFileChange={onPaymentChange}
            />
        </div>
    )
}
