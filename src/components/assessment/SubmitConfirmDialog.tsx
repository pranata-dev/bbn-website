"use client"

import React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface SubmitConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  totalQuestions: number
  answeredCount: number
  doubtfulCount: number
  submitting: boolean
}

export function SubmitConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  totalQuestions,
  answeredCount,
  doubtfulCount,
  submitting,
}: SubmitConfirmDialogProps) {
  const unansweredCount = totalQuestions - answeredCount

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={true}
        className="border-4 border-[#171717] shadow-[8px_8px_0px_#171717] bg-surface-white rounded-none font-mono max-w-lg p-6 sm:p-8 relative tick-corner"
      >
        <DialogHeader className="space-y-2 pr-8">
          <div className="flex items-center gap-2 font-mono text-xs font-black text-alert-rust uppercase">
            <span className="size-2 bg-alert-rust border border-[#171717]" />
            <span>[KONFIRMASI // AKHIRI_UJIAN]</span>
          </div>
          <DialogTitle className="font-sans text-xl sm:text-2xl font-black text-[#171717] tracking-tight">
            Kumpulkan Lembar Jawaban?
          </DialogTitle>
          <DialogDescription className="font-sans text-xs text-ink-muted leading-relaxed">
            Periksa rekapitulasi status pengerjaan soal di bawah ini sebelum mengirimkan sesi Anda ke server nasional.
          </DialogDescription>
        </DialogHeader>

        {/* Status Breakdown Matrix */}
        <div className="grid grid-cols-3 gap-3 my-5">
          <div className="bg-canvas-paper border-2 border-[#171717] p-3 text-center">
            <span className="font-mono text-[10px] font-bold text-ink-muted uppercase block">
              TERJAWAB
            </span>
            <span className="font-mono text-2xl font-black text-green-700">
              {answeredCount}
            </span>
          </div>
          <div className="bg-canvas-paper border-2 border-[#171717] p-3 text-center">
            <span className="font-mono text-[10px] font-bold text-ink-muted uppercase block">
              RAGU-RAGU
            </span>
            <span className="font-mono text-2xl font-black text-alert-rust">
              {doubtfulCount}
            </span>
          </div>
          <div className="bg-canvas-paper border-2 border-[#171717] p-3 text-center">
            <span className="font-mono text-[10px] font-bold text-ink-muted uppercase block">
              KOSONG
            </span>
            <span className="font-mono text-2xl font-black text-[#171717]">
              {unansweredCount}
            </span>
          </div>
        </div>

        {unansweredCount > 0 && (
          <div className="p-3 bg-amber-50 border-2 border-amber-600 text-amber-900 font-mono text-xs font-bold leading-relaxed mb-4">
            PERINGATAN: Masih terdapat {unansweredCount} butir soal yang belum Anda jawab. Jawaban kosong bernilai 0.
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={submitting}
            className="w-full sm:w-auto px-4 py-2.5 bg-surface-white border-2 border-[#171717] hover:bg-canvas-paper text-[#171717] font-mono text-xs font-bold uppercase transition-all"
            type="button"
          >
            Lanjutkan Pengerjaan
          </button>
          <button
            onClick={onConfirm}
            disabled={submitting}
            className="w-full sm:w-auto px-5 py-2.5 bg-alert-rust hover:bg-[#a04410] text-surface-white border-2 border-[#171717] shadow-[4px_4px_0px_#171717] font-mono text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50"
            type="button"
          >
            {submitting ? "MENGIRIMKAN..." : "YA, KUMPULKAN SEKARANG"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
