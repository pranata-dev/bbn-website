"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { MessageSquarePlus, Star } from "lucide-react"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

type FeedbackCategory = "MATERI" | "LATIHAN" | "TAMPILAN" | "BUG" | "LAINNYA"

const CATEGORY_OPTIONS: { value: FeedbackCategory; label: string }[] = [
    { value: "MATERI", label: "Materi Belajar" },
    { value: "LATIHAN", label: "Latihan Soal" },
    { value: "TAMPILAN", label: "Tampilan Aplikasi" },
    { value: "BUG", label: "Laporan Masalah" },
    { value: "LAINNYA", label: "Lainnya" },
]

interface BetaFeedbackDialogProps {
    triggerClassName?: string
    compact?: boolean
}

export function BetaFeedbackDialog({
    triggerClassName,
    compact = false,
}: BetaFeedbackDialogProps) {
    const pathname = usePathname()
    const [open, setOpen] = useState(false)
    const [rating, setRating] = useState<number>(5)
    const [category, setCategory] = useState<FeedbackCategory>("MATERI")
    const [message, setMessage] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const resetForm = () => {
        setRating(5)
        setCategory("MATERI")
        setMessage("")
        setErrorMessage(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrorMessage(null)

        const trimmed = message.trim()
        if (trimmed.length < 5) {
            setErrorMessage("Tulis masukan minimal 5 karakter.")
            return
        }

        setSubmitting(true)
        try {
            const res = await fetch("/api/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    rating,
                    category,
                    message: trimmed,
                    pagePath: pathname,
                }),
            })

            const data = await res.json().catch(() => ({}))

            if (!res.ok) {
                setErrorMessage(data.error || "Gagal mengirim feedback. Coba lagi.")
                return
            }

            toast.success("Terima kasih! Masukan kamu sudah diterima.")
            resetForm()
            setOpen(false)
        } catch {
            setErrorMessage("Koneksi bermasalah. Coba kirim ulang beberapa saat lagi.")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                setOpen(nextOpen)
                if (!nextOpen) {
                    setErrorMessage(null)
                }
            }}
        >
            <DialogTrigger asChild>
                <button
                    type="button"
                    className={
                        triggerClassName ||
                        (compact
                            ? "px-2.5 py-1.5 border border-[#171717] bg-accent-canary hover:bg-[#FACC15] text-[#171717] font-mono text-[10px] font-bold uppercase flex items-center gap-1.5 technical-shadow-sm cursor-pointer"
                            : "w-full py-2 px-3 border border-[#171717] bg-accent-canary hover:bg-[#FACC15] text-[#171717] font-mono text-xs font-bold transition-colors flex items-center justify-between cursor-pointer")
                    }
                >
                    <span className="flex items-center gap-2">
                        <MessageSquarePlus className="size-3.5 shrink-0" />
                        <span>Kirim Feedback</span>
                    </span>
                    {!compact && <span className="size-1.5 bg-[#171717]" />}
                </button>
            </DialogTrigger>

            <DialogContent className="max-w-md">
                <DialogHeader>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-alert-rust">
                        PROGRAM BETA FISIKA
                    </span>
                    <DialogTitle>Kirim Feedback</DialogTitle>
                    <DialogDescription>
                        Bantu kami meningkatkan materi dan latihan soal SAS Fisika. Masukan kamu langsung dibaca oleh pengajar.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                    {errorMessage && (
                        <div
                            role="alert"
                            className="p-2.5 border-2 border-alert-rust bg-[#FFF5F0] text-xs font-mono text-[#171717]"
                        >
                            {errorMessage}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#171717] block">
                            Penilaian (1 sampai 5)
                        </label>
                        <div className="grid grid-cols-5 gap-2">
                            {[1, 2, 3, 4, 5].map((value) => {
                                const selected = rating === value
                                return (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => setRating(value)}
                                        className={`py-2 border-2 border-[#171717] font-mono text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                                            selected
                                                ? "bg-accent-canary text-[#171717] shadow-[2px_2px_0px_#171717]"
                                                : "bg-canvas-paper text-[#171717] hover:bg-surface-white"
                                        }`}
                                    >
                                        <span>{value}</span>
                                        <Star
                                            className={`size-3 ${
                                                selected ? "fill-[#171717] text-[#171717]" : "text-ink-muted"
                                            }`}
                                        />
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#171717] block">
                            Kategori
                        </label>
                        <Select
                            value={category}
                            onValueChange={(v) => setCategory(v as FeedbackCategory)}
                        >
                            <SelectTrigger className="w-full bg-canvas-paper border-2 border-[#171717] rounded-none font-mono text-xs font-semibold text-[#171717] focus:ring-0 h-10">
                                <SelectValue placeholder="Pilih kategori" />
                            </SelectTrigger>
                            <SelectContent className="bg-surface-white border-2 border-[#171717] rounded-none font-mono text-xs">
                                {CATEGORY_OPTIONS.map((option) => (
                                    <SelectItem
                                        key={option.value}
                                        value={option.value}
                                        className="rounded-none cursor-pointer focus:bg-accent-canary focus:text-[#171717]"
                                    >
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <label
                            htmlFor="beta-feedback-message"
                            className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#171717] block"
                        >
                            Pesan
                        </label>
                        <textarea
                            id="beta-feedback-message"
                            rows={4}
                            maxLength={1000}
                            value={message}
                            onChange={(e) => {
                                setMessage(e.target.value)
                                if (errorMessage) setErrorMessage(null)
                            }}
                            placeholder="Tulis saran, soal yang membingungkan, atau kendala yang kamu temui..."
                            className="w-full bg-canvas-paper border-2 border-[#171717] rounded-none p-3 text-sm font-sans text-[#171717] placeholder:text-ink-muted/60 focus:outline-none focus:border-alert-rust focus:bg-surface-white resize-y"
                            required
                        />
                        <div className="text-right font-mono text-[10px] text-ink-muted">
                            {message.trim().length}/1000
                        </div>
                    </div>

                    <DialogFooter className="pt-2">
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="px-4 py-2 border-2 border-[#171717] bg-surface-white hover:bg-canvas-paper font-mono text-xs font-bold uppercase text-[#171717] cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-4 py-2 border-2 border-[#171717] bg-accent-canary hover:bg-[#FACC15] font-mono text-xs font-bold uppercase text-[#171717] shadow-[3px_3px_0px_#171717] cursor-pointer disabled:opacity-60"
                        >
                            {submitting ? "Mengirim..." : "Kirim"}
                        </button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

