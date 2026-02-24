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
        <div className="space-y-2">
            <Label htmlFor="payment-proof">Bukti Pembayaran</Label>
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
                    className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-warm-gray rounded-xl cursor-pointer hover:border-soft-brown/50 transition-colors bg-warm-beige/20"
                >
                    {previewUrl ? (
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="h-full w-full object-contain rounded-xl p-2"
                        />
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Upload className="w-8 h-8" />
                            <span className="text-sm">Klik untuk unggah bukti transfer</span>
                            <span className="text-xs">JPG, PNG, WebP (max 5MB)</span>
                        </div>
                    )}
                </label>
                {file && (
                    <button
                        type="button"
                        onClick={handleClear}
                        aria-label="Hapus bukti pembayaran"
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-dark-brown/80 text-cream flex items-center justify-center hover:bg-dark-brown transition-colors"
                    >
                        <X className="w-3 h-3" />
                    </button>
                )}
            </div>
            {file && (
                <p className="text-xs text-muted-foreground">
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
            )}
        </div>
    )
}
