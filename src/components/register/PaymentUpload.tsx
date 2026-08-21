"use client"

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
    <div className="space-y-2 font-sans">
      <label htmlFor="payment-proof" className="text-sm font-semibold text-[#827148] block">
        Bukti Pembayaran
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
          className="flex flex-col items-center justify-center w-full h-36 rounded-2xl border-2 border-dashed border-[#FFEED6] cursor-pointer hover:border-[#A5AF79] transition-colors bg-[#FFEED6]/20 p-4 text-center"
        >
          {previewUrl ? (
            <div className="relative h-full w-full flex items-center justify-center">
              <img
                src={previewUrl}
                alt="Bukti Transfer"
                className="h-full max-h-28 object-contain rounded-lg"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-[#827148]">
              <div className="w-10 h-10 rounded-xl bg-[#FFEED6] flex items-center justify-center border border-[#827148]/10">
                <div className="w-3.5 h-3.5 rounded-sm bg-[#A5AF79]" />
              </div>
              <span className="text-xs font-bold text-[#827148]">
                Klik untuk unggah bukti transfer SeaBank
              </span>
              <span className="text-[11px] text-[#827148]/70 font-medium">
                JPG, PNG, WebP (maks. 5MB)
              </span>
            </div>
          )}
        </label>
        {file && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Hapus bukti pembayaran"
            className="absolute top-3 right-3 w-7 h-7 bg-[#E8A07C] hover:bg-[#d8916e] text-white rounded-full flex items-center justify-center font-bold text-xs shadow-sm transition-colors"
          >
            ✕
          </button>
        )}
      </div>
      {file && (
        <p className="text-xs text-[#827148]/80 font-medium">
          {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
        </p>
      )}
    </div>
  )
}
