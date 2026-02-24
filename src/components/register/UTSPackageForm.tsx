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
import { SUBJECTS, UTS_PACKAGES } from "@/constants"

export interface UTSPackageFormState {
    name: string
    nim: string
    subject: string
    packageType: string
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
            <div className="space-y-2">
                <Label>Tipe Paket</Label>
                <Select
                    value={formData.packageType}
                    onValueChange={(v) => update("packageType", v)}
                >
                    <SelectTrigger className="bg-warm-beige/30 border-warm-gray">
                        <SelectValue placeholder="Pilih tipe paket" />
                    </SelectTrigger>
                    <SelectContent>
                        {UTS_PACKAGES.map((p) => (
                            <SelectItem key={p.value} value={p.value}>
                                {p.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
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
            </div>

            {/* Payment Upload */}
            <PaymentUpload
                file={paymentFile}
                previewUrl={paymentPreview}
                onFileChange={onPaymentChange}
            />
        </div>
    )
}
