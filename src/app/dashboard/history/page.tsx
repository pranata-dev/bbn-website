"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { EmptyState } from "@/components/dashboard/EmptyState"
import { Button } from "@/components/ui/button"
import { Clock, CheckCircle2, AlertTriangle, ArrowRight, BookOpen, Loader2 } from "lucide-react"

interface HistoryItem {
  id: string
  tryout_id: string
  status: "IN_PROGRESS" | "SUBMITTED" | "COMPLETED" | "TIMED_OUT"
  score: number | null
  correct_count: number | null
  total_count: number | null
  started_at: string
  submitted_at: string | null
  tryouts: {
    id: string
    title: string
    subject: string
    is_practice: boolean
    duration: number
  } | null
}

export default function HistoryPage() {
  const [submissions, setSubmissions] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/submissions")
        if (res.ok) {
          const data = await res.json()
          setSubmissions(data.submissions || [])
        }
      } catch (err) {
        console.error("Failed to load submission history", err)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [])

  const formatDate = (dateStr: string) => {
    try {
      const utcStr = dateStr.endsWith("Z") ? dateStr : dateStr + "Z"
      const d = new Date(utcStr)
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return dateStr
    }
  }

  const getStatusBadge = (status: HistoryItem["status"]) => {
    switch (status) {
      case "SUBMITTED":
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" /> Selesai
          </span>
        )
      case "TIMED_OUT":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-300">
            <Clock className="w-3.5 h-3.5" /> Waktu Habis
          </span>
        )
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-300">
            <Clock className="w-3.5 h-3.5" /> Berlangsung
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="Riwayat Pengerjaan"
        subtitle="Pantau rekaman dan hasil seluruh tryout serta latihan soal yang pernah kamu kerjakan."
      />

      {loading ? (
        <div className="flex items-center justify-center min-h-[35vh]">
          <div className="text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-olive mx-auto" />
            <p className="text-sm text-muted-foreground">Memuat riwayat pengerjaan...</p>
          </div>
        </div>
      ) : submissions.length === 0 ? (
        <EmptyState
          title="Belum Ada Riwayat"
          description="Riwayat tryout akan muncul di sini setelah kamu menyelesaikan sesi pertama."
          actionLabel="Mulai Tryout Pertama"
          actionHref="/dashboard/tryouts"
        />
      ) : (
        <div className="grid gap-3.5">
          {submissions.map((sub) => {
            const isFinished = sub.status === "SUBMITTED" || sub.status === "COMPLETED" || sub.status === "TIMED_OUT"
            const title = sub.tryouts?.title || "Tryout"
            const isPractice = sub.tryouts?.is_practice ?? false

            return (
              <div
                key={sub.id}
                className="bg-card border border-border rounded-xl p-4 md:p-5 shadow-sm hover:border-olive/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-muted text-muted-foreground">
                      {isPractice ? "Latihan" : "Tryout CBT"}
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-olive/15 text-olive">
                      {sub.tryouts?.subject || "FISIKA"}
                    </span>
                    {getStatusBadge(sub.status)}
                  </div>
                  <h3 className="font-semibold text-foreground text-base tracking-tight truncate">
                    {title}
                  </h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground/70" />
                    <span>Dikerjakan: {formatDate(sub.started_at)}</span>
                  </p>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-border">
                  {isFinished && (
                    <div className="text-left md:text-right">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Skor
                      </p>
                      <p className="text-2xl font-black tracking-tight text-foreground">
                        {sub.score ?? 0}
                        <span className="text-sm font-semibold text-muted-foreground ml-0.5">%</span>
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {sub.correct_count ?? 0} / {sub.total_count ?? 0} Benar
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    {sub.status === "IN_PROGRESS" ? (
                      <Button asChild size="sm" className="bg-olive hover:bg-olive/90 text-white font-semibold">
                        <Link href={`/dashboard/tryouts/${sub.tryout_id}/attempt`}>
                          Lanjutkan
                          <ArrowRight className="w-4 h-4 ml-1.5" />
                        </Link>
                      </Button>
                    ) : (
                      <>
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/dashboard/tryouts/${sub.tryout_id}/result?submissionId=${sub.id}`}>
                            Hasil
                          </Link>
                        </Button>
                        <Button asChild size="sm" className="bg-olive hover:bg-olive/90 text-white font-semibold">
                          <Link href={`/dashboard/tryouts/${sub.tryout_id}/discussion`}>
                            <BookOpen className="w-4 h-4 mr-1.5" />
                            Pembahasan
                          </Link>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
