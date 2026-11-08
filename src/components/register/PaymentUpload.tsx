"use client"

import { MAX_FILE_SIZE, ACCEPTED_IMAGE_TYPES } from "@/constants"
import { toast } from "sonner"
import { Upload, X } from "lucide-react"

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
    <div className="space-y-2 font-sans">
      <label htmlFor="payment-proof" className="font-mono text-[10px] sm:text-xs font-bold text-[#171717] uppercase tracking-wider block">
        [BERKAS] BUKTI PEMBAYARAN TRANSFER *
      </label>
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
          className="flex flex-col items-center justify-center w-full min-h-[140px] border-2 border-dashed border-[#171717] hover:border-alert-rust bg-canvas-paper hover:bg-surface-white cursor-pointer transition-colors p-4 text-center"
        >
          {previewUrl ? (
            <div className="relative h-full w-full flex items-center justify-center">
              <img
                src={previewUrl}
                alt="Bukti Transfer"
                className="max-h-28 object-contain border border-[#171717]"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5 text-[#171717]">
              <div className="w-8 h-8 bg-surface-white border border-[#171717] flex items-center justify-center shadow-[1px_1px_0px_#171717]">
                <Upload className="w-4 h-4 text-[#171717]" />
              </div>
              <span className="font-mono text-xs font-bold uppercase mt-1">
                KLIK UNTUK UNGGAH BUKTI TRANSFER
              </span>
              <span className="font-mono text-[10px] text-ink-muted">
                JPG, PNG, WebP (Maksimal 5MB)
              </span>
            </div>
          )}
        </label>
        {file && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Hapus bukti pembayaran"
            className="absolute top-2 right-2 px-2 py-1 bg-alert-rust hover:bg-[#993A08] text-white border border-[#171717] font-mono text-[10px] font-bold shadow-[2px_2px_0px_#171717] flex items-center gap-1 cursor-pointer transition-colors"
          >
            <X className="w-3 h-3" />
            <span>HAPUS</span>
          </button>
        )}
      </div>
      {file && (
        <p className="font-mono text-[10px] text-ink-muted">
          BERKAS: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
        </p>
      )}
    </div>
  )
}
