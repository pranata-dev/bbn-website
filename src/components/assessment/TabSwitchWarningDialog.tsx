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

interface TabSwitchWarningDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function TabSwitchWarningDialog({
  isOpen,
  onClose,
}: TabSwitchWarningDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="border-4 border-alert-rust shadow-[8px_8px_0px_#B85014] bg-surface-white rounded-none font-mono max-w-md p-6 sm:p-7 relative tick-corner"
      >
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2 font-mono text-xs font-black text-alert-rust uppercase">
            <span className="size-2 bg-alert-rust animate-pulse" />
            <span>[INTEGRITY_VIOLATION_TRIGGERED]</span>
          </div>
          <DialogTitle className="font-sans text-xl font-black text-alert-rust">
            Peringatan Integritas Ujian!
          </DialogTitle>
          <DialogDescription className="font-sans text-xs text-ink-muted leading-relaxed">
            Sistem mendeteksi Anda berpindah jendela atau membuka tab lain. Aktivitas ini dicatat dalam log audit telemetri pengawas CBT.
          </DialogDescription>
        </DialogHeader>

        <div className="p-3.5 bg-red-50 border-2 border-alert-rust text-alert-rust font-mono text-xs font-bold my-4 leading-relaxed">
          Mohon untuk tetap berada di jendela ujian sampai seluruh sesi pengerjaan selesai.
        </div>

        <DialogFooter>
          <button
            onClick={onClose}
            className="w-full px-5 py-2.5 bg-alert-rust hover:bg-[#a04410] text-surface-white border-2 border-[#171717] shadow-[4px_4px_0px_#171717] font-mono text-xs font-black uppercase tracking-wider transition-all"
            type="button"
          >
            SAYA MENGERTI &amp; KEMBALI KE UJIAN
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
