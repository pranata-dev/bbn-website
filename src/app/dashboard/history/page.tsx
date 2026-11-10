"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { EmptyState } from "@/components/dashboard/EmptyState"
import { Button } from "@/components/ui/button"

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
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).toUpperCase()
    } catch {
      return dateStr
    }
  }

  const completedSubmissions = submissions.filter(
    (s) => s.status === "SUBMITTED" || s.status === "COMPLETED"
  )
  const averageScore = completedSubmissions.length > 0
    ? Math.round(
        completedSubmissions.reduce((acc, curr) => acc + (curr.score || 0), 0) /
          completedSubmissions.length
      )
    : 0

  return (
    <div className="space-y-8 font-sans">
      {/* Page Header */}
      <PageHeader
        title="Riwayat Pengerjaan"
        subtitle="Log telemetri aktivitas pengerjaan tryout CBT dan bank latihan soal yang tercatat di sistem."
        breadcrumb="~/bbn-edu/student/history/"
      />

      {/* Diagnostic Telemetry Strip (Mini Stats) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-surface-white border-2 border-[#171717] technical-shadow p-5 relative tick-corner flex flex-col justify-between">
          <div className="flex items-center justify-between font-mono text-xs font-bold uppercase tracking-wider text-ink-muted">
            <span>TOTAL_SESI // LOGS</span>
            <div className="size-3 bg-accent-canary border border-[#171717]" />
          </div>
          <div className="mt-4">
            <p className="font-mono text-3xl font-black text-[#171717]">
              {String(submissions.length).padStart(2, "0")}
            </p>
            <p className="font-mono text-[10px] uppercase tracking-wider text-ink-muted mt-1">
              SESI DIKERJAKAN
            </p>
          </div>
          <div className="w-full h-1 bg-border-grid mt-4 overflow-hidden">
            <div className="h-full bg-accent-canary w-full" />
          </div>
        </div>

        <div className="bg-surface-white border-2 border-[#171717] technical-shadow p-5 relative tick-corner flex flex-col justify-between">
          <div className="flex items-center justify-between font-mono text-xs font-bold uppercase tracking-wider text-ink-muted">
            <span>SESI_SELESAI // VALID</span>
            <div className="size-3 bg-alert-rust border border-[#171717]" />
          </div>
          <div className="mt-4">
            <p className="font-mono text-3xl font-black text-[#171717]">
              {String(completedSubmissions.length).padStart(2, "0")}
            </p>
            <p className="font-mono text-[10px] uppercase tracking-wider text-ink-muted mt-1">
              TRYOUT / LATIHAN TUNTAS
            </p>
          </div>
          <div className="w-full h-1 bg-border-grid mt-4 overflow-hidden">
            <div className="h-full bg-alert-rust w-2/3" />
          </div>
        </div>

        <div className="bg-surface-white border-2 border-[#171717] technical-shadow p-5 relative tick-corner flex flex-col justify-between">
          <div className="flex items-center justify-between font-mono text-xs font-bold uppercase tracking-wider text-ink-muted">
            <span>RATA_RATA_SKOR // AVG</span>
            <div className="size-3 bg-[#171717] border border-[#171717]" />
          </div>
          <div className="mt-4">
            <p className="font-mono text-3xl font-black text-[#171717]">
              {averageScore}%
            </p>
            <p className="font-mono text-[10px] uppercase tracking-wider text-ink-muted mt-1">
              RATA-RATA KUMULATIF
            </p>
          </div>
          <div className="w-full h-1 bg-border-grid mt-4 overflow-hidden">
            <div className="h-full bg-[#171717] w-1/2" />
          </div>
        </div>
      </div>

      {/* Main Activity Telemetry Stream */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b-2 border-[#171717] pb-2 font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#171717]">&gt; AKTIVITAS_TERAKHIR</span>
            <span className="text-ink-muted hidden sm:inline">{"// TELEMETRI KRONOLOGIS"}</span>
          </div>
          <div className="text-ink-muted font-bold">
            [{submissions.length} LOG TERCATAT]
          </div>
        </div>

        {loading ? (
          <div className="bg-surface-white border-2 border-dashed border-[#171717] bg-grid-blueprint p-16 text-center font-mono text-xs font-bold text-ink-muted relative tick-corner">
            <div className="animate-pulse">
              &gt; STATUS: PARSING_TELEMETRY_LOGS... // MEMUAT RIWAYAT
            </div>
          </div>
        ) : submissions.length === 0 ? (
          <EmptyState
            title="Belum Ada Riwayat"
            description="Riwayat tryout dan latihan soal akan dicatat di sini setelah kamu menyelesaikan sesi pertama."
            actionLabel="Mulai Tryout Pertama"
            actionHref="/dashboard/tryouts"
          />
        ) : (
          <div className="border-2 border-[#171717] bg-surface-white technical-shadow divide-y-2 divide-border-grid">
            {submissions.map((sub) => {
              const isFinished = sub.status === "SUBMITTED" || sub.status === "COMPLETED" || sub.status === "TIMED_OUT"
              const title = sub.tryouts?.title || "Sesi Ujian / Latihan"
              const isPractice = sub.tryouts?.is_practice ?? false

              return (
                <div
                  key={sub.id}
                  className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5 hover:bg-canvas-paper/40 transition-colors"
                >
                  {/* Left Column: Telemetry info */}
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 uppercase bg-canvas-paper border border-[#171717] text-[#171717]">
                        {isPractice ? "LATIHAN MANDIRI" : "SIMULASI CBT"}
                      </span>
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 uppercase bg-canvas-paper border border-[#171717] text-ink-muted">
                        {sub.tryouts?.subject || "FISIKA"}
                      </span>

                      {/* Status Badge */}
                      {sub.status === "SUBMITTED" || sub.status === "COMPLETED" ? (
                        <span className="font-mono text-[10px] font-black px-2 py-0.5 uppercase bg-green-100 text-green-900 border border-[#171717]">
                          [STATUS: COMPLETED]
                        </span>
                      ) : sub.status === "TIMED_OUT" ? (
                        <span className="font-mono text-[10px] font-black px-2 py-0.5 uppercase bg-alert-rust/15 text-alert-rust border border-[#171717]">
                          [STATUS: TIMEOUT]
                        </span>
                      ) : (
                        <span className="font-mono text-[10px] font-black px-2 py-0.5 uppercase bg-accent-canary text-[#171717] border border-[#171717] animate-pulse">
                          [STATUS: IN_PROGRESS]
                        </span>
                      )}

                      <span className="font-mono text-[10px] text-ink-muted font-bold hidden sm:inline">
                        {`// ${formatDate(sub.started_at)}`}
                      </span>
                    </div>

                    <h3 className="font-sans text-base sm:text-lg font-black text-[#171717] tracking-tight leading-snug truncate">
                      {title}
                    </h3>

                    <div className="flex items-center gap-3 font-mono text-[10px] text-ink-muted">
                      <span>ID: {sub.id.slice(0, 8).toUpperCase()}</span>
                      <span>·</span>
                      <span className="sm:hidden">{formatDate(sub.started_at)}</span>
                      {sub.tryouts?.duration && (
                        <>
                          <span className="hidden sm:inline">·</span>
                          <span className="hidden sm:inline">DURASI: {sub.tryouts.duration}M</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Score Box & Brutalist Action Buttons */}
                  <div className="flex items-center justify-between lg:justify-end gap-5 border-t lg:border-t-0 pt-4 lg:pt-0 border-border-grid">
                    {isFinished && (
                      <div className="bg-canvas-paper border-2 border-[#171717] px-4 py-2 text-left lg:text-right min-w-[125px]">
                        <p className="font-mono text-[9px] font-bold text-ink-muted uppercase tracking-wider">
                          SKOR_AKHIR
                        </p>
                        <p className="font-mono text-2xl font-black text-[#171717] leading-none my-0.5">
                          {sub.score ?? 0}%
                        </p>
                        <p className="font-mono text-[10px] text-ink-muted font-bold">
                          {sub.correct_count ?? 0} / {sub.total_count ?? 0} BENAR
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 shrink-0">
                      {sub.status === "IN_PROGRESS" ? (
                        <Button
                          asChild
                          size="sm"
                          className="bg-accent-canary hover:bg-[#FDE047]/90 text-[#171717] border-2 border-[#171717] technical-shadow rounded-none font-mono text-xs font-black py-2.5 px-4 uppercase tracking-wider transition-all"
                        >
                          <Link href={`/dashboard/tryouts/${sub.tryout_id}/attempt`} className="flex items-center gap-1.5">
                            <span>LANJUTKAN</span>
                            <span>&rarr;</span>
                          </Link>
                        </Button>
                      ) : (
                        <>
                          <Button
                            asChild
                            size="sm"
                            variant="outline"
                            className="bg-surface-white hover:bg-canvas-paper text-[#171717] border-2 border-[#171717] technical-shadow-sm rounded-none font-mono text-xs font-bold py-2 px-3 uppercase tracking-wider transition-all"
                          >
                            <Link href={`/dashboard/tryouts/${sub.tryout_id}/result?submissionId=${sub.id}`}>
                              HASIL
                            </Link>
                          </Button>
                          <Button
                            asChild
                            size="sm"
                            className="bg-[#171717] hover:bg-accent-canary hover:text-[#171717] text-surface-white border-2 border-[#171717] technical-shadow rounded-none font-mono text-xs font-black py-2 px-4 uppercase tracking-wider transition-all"
                          >
                            <Link href={`/dashboard/tryouts/${sub.tryout_id}/discussion`} className="flex items-center gap-1.5">
                              <span>PEMBAHASAN</span>
                              <span>&rarr;</span>
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
    </div>
  )
}
