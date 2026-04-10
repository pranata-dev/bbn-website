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
import { GoPayInfo } from "./GoPayInfo"
import { SUBJECTS } from "@/constants"

export interface RegularClassFormState {
    name: string
    email: string
    password: string
    nim: string
    subject: string
    groupSize: string
    sessionCount: string
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
    const update = (field: keyof RegularClassFormState, value: string) => {
        onChange({ ...formData, [field]: value })
    }

    const handleNumberChange = (field: keyof RegularClassFormState, val: string) => {
        if (!val) {
            update(field, "")
            return
        }
        const numericVal = val.replace(/\D/g, "")
        let cleaned = numericVal.replace(/^0+/, "")
        let finalVal = cleaned || (numericVal === "0" ? "0" : "")
        
        if (field === "sessionCount") {
            const parsed = parseInt(finalVal)
            if (!isNaN(parsed) && parsed > 7) {
                finalVal = "7"
            }
        }
        
        update(field, finalVal)
    }

    return (
        <div className="space-y-5 font-mono">
            {/* Name */}
            <div className="space-y-2">
                <label htmlFor="reg-name" className="text-sm font-bold text-[#2b1b11]">Nama Lengkap</label>
                <Input
                    id="reg-name"
                    placeholder="Masukkan nama lengkap"
                    value={formData.name}
                    onChange={(e) => update("name", e.target.value)}
                    className="bg-[#bed3c6]/30 border-2 border-[#2b1b11] rounded-none shadow-[2px_2px_0px_#2b1b11] font-mono text-sm text-[#2b1b11] placeholder:text-[#3c5443]/50 focus:ring-[#e87a5d] focus:border-[#e87a5d] h-11"
                    required
                />
            </div>

            {/* Email */}
            <div className="space-y-2">
                <label htmlFor="reg-email" className="text-sm font-bold text-[#2b1b11]">Email</label>
                <Input
                    id="reg-email"
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
                <label htmlFor="reg-password" className="text-sm font-bold text-[#2b1b11]">Password Baru</label>
                <Input
                    id="reg-password"
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
                <label htmlFor="reg-nim" className="text-sm font-bold text-[#2b1b11]">NIM</label>
                <Input
                    id="reg-nim"
                    placeholder="Masukkan NIM"
                    value={formData.nim}
                    onChange={(e) => update("nim", e.target.value)}
                    className="bg-[#bed3c6]/30 border-2 border-[#2b1b11] rounded-none shadow-[2px_2px_0px_#2b1b11] font-mono text-sm text-[#2b1b11] placeholder:text-[#3c5443]/50 focus:ring-[#e87a5d] focus:border-[#e87a5d] h-11"
                    required
                />
            </div>

            {/* Subject */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-[#2b1b11]">Mata Kuliah</label>
                <Select
                    value={formData.subject}
                    onValueChange={(v) => update("subject", v)}
                >
                    <SelectTrigger className="bg-[#bed3c6]/30 border-2 border-[#2b1b11] rounded-none shadow-[2px_2px_0px_#2b1b11] font-mono text-sm text-[#2b1b11] h-11">
                        <SelectValue placeholder="Pilih mata kuliah" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#FEFCF3] border-2 border-[#2b1b11] rounded-none font-mono">
                        {SUBJECTS.map((s) => (
                            <SelectItem key={s.value} value={s.value} className="font-mono text-sm text-[#2b1b11] hover:bg-[#bed3c6]">
                                {s.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Group size and session count */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label htmlFor="reg-group" className="text-sm font-bold text-[#2b1b11]">Jumlah Orang</label>
                    <Input
                        id="reg-group"
                        type="number"
                        value={formData.groupSize}
                        onChange={(e) => handleNumberChange("groupSize", e.target.value)}
                        className="bg-[#bed3c6]/30 border-2 border-[#2b1b11] rounded-none shadow-[2px_2px_0px_#2b1b11] font-mono text-sm text-[#2b1b11] h-11"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="reg-sessions" className="text-sm font-bold text-[#2b1b11]">Jumlah Minggu</label>
                    <Input
                        id="reg-sessions"
                        type="number"
                        value={formData.sessionCount}
                        onChange={(e) => handleNumberChange("sessionCount", e.target.value)}
                        className="bg-[#bed3c6]/30 border-2 border-[#2b1b11] rounded-none shadow-[2px_2px_0px_#2b1b11] font-mono text-sm text-[#2b1b11] h-11"
                        required
                    />
                </div>
            </div>

            {/* Pricing Breakdown */}
            <PricingBreakdown
                groupSize={Number(formData.groupSize)}
                sessionCount={Number(formData.sessionCount)}
            />

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label htmlFor="reg-date" className="text-sm font-bold text-[#2b1b11]">Tanggal Kelas</label>
                    <Input
                        id="reg-date"
                        type="date"
                        value={formData.scheduledDate}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => update("scheduledDate", e.target.value)}
                        className="bg-[#bed3c6]/30 border-2 border-[#2b1b11] rounded-none shadow-[2px_2px_0px_#2b1b11] font-mono text-sm text-[#2b1b11] h-11"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="reg-time" className="text-sm font-bold text-[#2b1b11]">Waktu Kelas</label>
                    <Input
                        id="reg-time"
                        type="time"
                        value={formData.scheduledTime}
                        onChange={(e) => update("scheduledTime", e.target.value)}
                        className="bg-[#bed3c6]/30 border-2 border-[#2b1b11] rounded-none shadow-[2px_2px_0px_#2b1b11] font-mono text-sm text-[#2b1b11] h-11"
                        required
                    />
                </div>
            </div>

            {/* WhatsApp */}
            <div className="space-y-2">
                <label htmlFor="reg-wa" className="text-sm font-bold text-[#2b1b11]">Nomor WhatsApp</label>
                <Input
                    id="reg-wa"
                    type="tel"
                    placeholder="08xxxxxxxxxx"
                    value={formData.whatsapp}
                    onChange={(e) => update("whatsapp", e.target.value)}
                    className="bg-[#bed3c6]/30 border-2 border-[#2b1b11] rounded-none shadow-[2px_2px_0px_#2b1b11] font-mono text-sm text-[#2b1b11] placeholder:text-[#3c5443]/50 h-11"
                    required
                />
                <p className="text-xs text-[#3c5443] font-semibold">Format: 08xx, 62xx, atau +62xx</p>
            </div>

            {/* Notes */}
            <div className="space-y-2">
                <label htmlFor="reg-notes" className="text-sm font-bold text-[#2b1b11]">Catatan untuk Kelas</label>
                <Textarea
                    id="reg-notes"
                    placeholder="Materi yang ingin dibahas, preferensi belajar, dll."
                    value={formData.notes}
                    onChange={(e) => update("notes", e.target.value)}
                    className="bg-[#bed3c6]/30 border-2 border-[#2b1b11] rounded-none shadow-[2px_2px_0px_#2b1b11] font-mono text-sm text-[#2b1b11] placeholder:text-[#3c5443]/50 min-h-[80px] resize-none"
                    maxLength={500}
                />
                <p className="text-xs text-[#3c5443] font-semibold text-right">
                    {formData.notes.length}/500
                </p>
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
