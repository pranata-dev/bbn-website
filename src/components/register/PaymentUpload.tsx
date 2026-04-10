"use client"

import { Upload, X } from "lucide-react"
import { Label } from "@/components/ui/label"
import { MAX_FILE_SIZE, ACCEPTED_IMAGE_TYPES } from "@/constants"
import { toast } from "sonner"

interface PaymentUploadProps {
    file: File | null
    previewUrl: string | null
    onFileChange: (file: File | null, previewUrl: string | null) => void
}

export function PaymentUpload({ file, previewUrl, onFileChange }: PaymentUploadProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0]
        if (!selected) return

        if (!ACCEPTED_IMAGE_TYPES.includes(selected.type)) {
            toast.error("Format file tidak didukung. Gunakan JPG, PNG, atau WebP.")
            return
        }

        if (selected.size > MAX_FILE_SIZE) {
            toast.error("Ukuran file maksimal 5MB.")
            return
        }

        onFileChange(selected, URL.createObjectURL(selected))
    }

    const handleClear = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        onFileChange(null, null)
    }

    return (
        <div className="space-y-2 font-mono">
            <label htmlFor="payment-proof" className="text-sm font-bold text-[#2b1b11]">Bukti Pembayaran</label>
            <div className="relative">
                <input
                    id="payment-proof"
                    type="file"
                    accept="image/*"
                    onChange={handleChange}
                    className="hidden"
                />
                <label
                    htmlFor="payment-proof"
                    className="flex flex-col items-center justify-center w-full h-36 border-4 border-dashed border-[#2b1b11] cursor-pointer hover:border-[#e87a5d] transition-colors bg-[#bed3c6]/20"
                >
                    {previewUrl ? (
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="h-full w-full object-contain p-2"
                        />
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-[#3c5443]">
                            <Upload className="w-8 h-8 stroke-[2]" />
                            <span className="text-sm font-bold">Klik untuk unggah bukti transfer GoPay</span>
                            <span className="text-xs font-semibold">JPG, PNG, WebP (max 5MB)</span>
                        </div>
                    )}
                </label>
                {file && (
                    <button
                        type="button"
                        onClick={handleClear}
                        aria-label="Hapus bukti pembayaran"
                        className="absolute top-2 right-2 w-7 h-7 bg-[#e87a5d] border-2 border-[#2b1b11] text-[#FEFCF3] flex items-center justify-center hover:bg-[#d95a4f] transition-colors shadow-[1px_1px_0px_#2b1b11]"
                    >
                        <X className="w-3 h-3 stroke-[3]" />
                    </button>
                )}
            </div>
            {file && (
                <p className="text-xs text-[#3c5443] font-semibold">
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
            )}
        </div>
    )
}
