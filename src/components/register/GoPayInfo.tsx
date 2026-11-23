"use client"

export function GoPayInfo() {
  return (
    <div className="bg-canvas-paper dark:bg-[#22252E] border-2 border-[#171717] dark:border-[#3F3F46] p-5 space-y-2 font-sans">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-bold text-[#171717] dark:text-[#F5F4EE]">
          Informasi Pembayaran
        </p>
        <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 bg-accent-canary text-[#171717] border border-[#171717]">
          Coming Soon
        </span>
      </div>

      <p className="text-xs text-ink-muted leading-relaxed">
        Pembayaran dan detail rekening untuk paket berbayar belum tersedia saat ini. Informasi lengkap akan segera diumumkan.
      </p>
    </div>
  )
}
