"use client"

interface PaymentUploadProps {
  file: File | null
  previewUrl: string | null
  onFileChange: (file: File | null, previewUrl: string | null) => void
}

export function PaymentUpload(_props: PaymentUploadProps) {
  void _props
  return (
    <div className="space-y-2 font-sans">
      <div className="flex items-center justify-between border-2 border-dashed border-[#171717] bg-canvas-paper p-4">
        <div className="space-y-1">
          <p className="font-mono text-xs font-bold text-[#171717] uppercase">
            Unggah Bukti Pembayaran
          </p>
          <p className="text-xs text-ink-muted">
            Checkout paket berbayar belum dibuka. Fitur unggah bukti pembayaran akan segera tersedia.
          </p>
        </div>
        <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 bg-accent-canary text-[#171717] border border-[#171717] shrink-0">
          Coming Soon
        </span>
      </div>
    </div>
  )
}
