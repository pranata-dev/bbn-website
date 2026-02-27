"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { PaymentUpload } from "./PaymentUpload"
import { PricingBreakdown } from "./PricingBreakdown"
import { BankTransferInfo } from "./BankTransferInfo"
import { SUBJECTS } from "@/constants"

export interface RegularClassFormState {
    name: string
    email: string
    nim: string
    subject: string
    groupSize: number
    sessionCount: number
    scheduledDate: string
    scheduledTime: string
    whatsapp: string
    notes: string
}

interface RegularClassFormProps {
    formData: RegularClassFormState
    onChange: (data: RegularClassFormState) => void
    paymentFile: File | null
    paymentPreview: string | null
    onPaymentChange: (file: File | null, preview: string | null) => void
}

export function RegularClassForm({
    formData,
    onChange,
    paymentFile,
    paymentPreview,
    onPaymentChange,
}: RegularClassFormProps) {
    const update = (field: keyof RegularClassFormState, value: string | number) => {
        onChange({ ...formData, [field]: value })
    }

    return (
        <div className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
                <Label htmlFor="reg-name">Nama Lengkap</Label>
                <Input
                    id="reg-name"
                    placeholder="Masukkan nama lengkap"
                    value={formData.name}
                    onChange={(e) => update("name", e.target.value)}
                    className="bg-warm-beige/30 border-warm-gray"
                    required
                />
            </div>

            {/* Email */}
            <div className="space-y-2">
                <Label htmlFor="reg-email">Email</Label>
                <Input
                    id="reg-email"
                    type="email"
                    placeholder="Masukkan alamat email"
                    value={formData.email}
                    onChange={(e) => update("email", e.target.value)}
                    className="bg-warm-beige/30 border-warm-gray"
                    required
                />
            </div>

            {/* NIM */}
            <div className="space-y-2">
                <Label htmlFor="reg-nim">NIM</Label>
                <Input
                    id="reg-nim"
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

            {/* Group size and session count */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="reg-group">Jumlah Orang</Label>
                    <Input
                        id="reg-group"
                        type="number"
                        min={1}
                        max={20}
                        value={formData.groupSize}
                        onChange={(e) => update("groupSize", parseInt(e.target.value) || 1)}
                        className="bg-warm-beige/30 border-warm-gray"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="reg-sessions">Jumlah Pertemuan</Label>
                    <Input
                        id="reg-sessions"
                        type="number"
                        min={1}
                        max={30}
                        value={formData.sessionCount}
                        onChange={(e) => update("sessionCount", parseInt(e.target.value) || 1)}
                        className="bg-warm-beige/30 border-warm-gray"
                        required
                    />
                </div>
            </div>

            {/* Pricing Breakdown */}
            <PricingBreakdown
                groupSize={formData.groupSize}
                sessionCount={formData.sessionCount}
            />

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="reg-date">Tanggal Kelas</Label>
                    <Input
                        id="reg-date"
                        type="date"
                        value={formData.scheduledDate}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => update("scheduledDate", e.target.value)}
                        className="bg-warm-beige/30 border-warm-gray"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="reg-time">Waktu Kelas</Label>
                    <Input
                        id="reg-time"
                        type="time"
                        value={formData.scheduledTime}
                        onChange={(e) => update("scheduledTime", e.target.value)}
                        className="bg-warm-beige/30 border-warm-gray"
                        required
                    />
                </div>
            </div>

            {/* WhatsApp */}
            <div className="space-y-2">
                <Label htmlFor="reg-wa">Nomor WhatsApp</Label>
                <Input
                    id="reg-wa"
                    type="tel"
                    placeholder="08xxxxxxxxxx"
                    value={formData.whatsapp}
                    onChange={(e) => update("whatsapp", e.target.value)}
                    className="bg-warm-beige/30 border-warm-gray"
                    required
                />
                <p className="text-xs text-muted-foreground">Format: 08xx, 62xx, atau +62xx</p>
            </div>

            {/* Notes */}
            <div className="space-y-2">
                <Label htmlFor="reg-notes">Catatan untuk Kelas</Label>
                <Textarea
                    id="reg-notes"
                    placeholder="Materi yang ingin dibahas, preferensi belajar, dll."
                    value={formData.notes}
                    onChange={(e) => update("notes", e.target.value)}
                    className="bg-warm-beige/30 border-warm-gray min-h-[80px] resize-none"
                    maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right">
                    {formData.notes.length}/500
                </p>
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
