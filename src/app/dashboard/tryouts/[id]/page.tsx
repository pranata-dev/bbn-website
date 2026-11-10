"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { QuestionCategory } from "@/types"

interface TryoutQuestionItem {
  id?: string
  count?: number
}

interface TryoutDetail {
  id: string
  title: string
  description: string | null
  category: QuestionCategory | null
  duration: number
  status: string
  max_attempts: number
  tryout_questions: TryoutQuestionItem[]
  subject?: string
}

interface SubmissionSummary {
  id: string
  status: string
  score: number | null
}

const CATEGORY_LABELS: Record<string, string> = {
  WEEK_1: "Minggu 1: Medan Listrik",
  WEEK_2: "Minggu 2: Hukum Gauss",
  WEEK_3: "Minggu 3: Potensial Listrik",
  WEEK_4: "Minggu 4: Kapasitansi & Dielektrik",
  WEEK_5: "Minggu 5: Arus & Resistansi",
  WEEK_6: "Minggu 6: Rangkaian DC",
  WEEK_7: "Minggu 7: Medan Magnet",
  SERIES_POWER: "Deret Kuasa & Taylor",
  COMPLEX_NUMBERS: "Bilangan Kompleks",
  LINEAR_ALGEBRA: "Aljabar Linear",
}

export default function TryoutDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [tryout, setTryout] = useState<TryoutDetail | null>(null)
  const [submission, setSubmission] = useState<SubmissionSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [showConfirm, setShowConfirm] = useState(false)
  const [userQuota, setUserQuota] = useState<{ used: number; max: number }>({ used: 0, max: 0 })

  useEffect(() => {
    const loadPageData = async () => {
      setLoading(true)
      try {
        // Fetch tryout details
        const resTryout = await fetch("/api/tryouts")
        const dataTryout = await resTryout.json()
        const found = ((dataTryout.tryouts || []) as TryoutDetail[]).find((t) => t.id === id)

        if (found) {
          setTryout(found)

          // Fetch submission status
          const resSub = await fetch(`/api/tryouts/${id}/submission`)
          if (resSub.ok) {
            const dataSub = await resSub.json()
            setSubmission(dataSub.submission)
          }

          // Fetch user stats for global quota
          const resStats = await fetch(`/api/dashboard/stats?subject=${found.subject || "FISDAS2"}`)
          if (resStats.ok) {
            const statsData = await resStats.json()
            setUserQuota({
              used: statsData.tryoutStats?.completed || 0,
              max: statsData.tryoutStats?.maxQuota || 0,
            })
          }
        }
      } catch (error) {
        console.error("Failed to load tryout data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadPageData()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] font-mono">
        <div className="bg-surface-white border-2 border-dashed border-[#171717] bg-grid-blueprint p-12 text-center relative tick-corner">
          <div className="size-3 bg-accent-canary border border-[#171717] mx-auto mb-3 animate-spin" />
          <p className="font-mono text-xs font-bold text-[#171717]">
            &gt; STATUS: FETCHING_TRYOUT_SPECIFICATION...
          </p>
        </div>
      </div>
    )
  }

  if (!tryout) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center max-w-lg mx-auto p-6 font-mono">
        <div className="bg-surface-white border-2 border-dashed border-[#171717] bg-grid-blueprint p-10 text-center relative tick-corner w-full">
          <div className="size-14 bg-canvas-paper border-2 border-[#171717] flex items-center justify-center mx-auto mb-4 font-mono text-2xl font-black">
            Ø
          </div>
          <h2 className="font-sans text-xl font-black text-[#171717] mb-2">Tryout Tidak Ditemukan</h2>
          <p className="font-sans text-xs text-ink-muted mb-6">
            Tryout ini tidak tersedia atau belum diaktifkan oleh tim akademik BBN Education.
          </p>
          <Link
            href="/dashboard/tryouts"
            className="inline-flex items-center gap-2 bg-accent-canary hover:bg-[#FDE047]/90 text-[#171717] border-2 border-[#171717] technical-shadow font-mono text-xs font-black px-5 py-2.5 uppercase transition-all"
          >
            <span>&larr;</span>
            <span>Kembali ke Daftar Tryout</span>
          </Link>
        </div>
      </div>
    )
  }

  const questionCount = Array.isArray(tryout.tryout_questions)
    ? tryout.tryout_questions[0]?.count !== undefined
      ? tryout.tryout_questions[0].count
      : tryout.tryout_questions.length
    : 0
  const remainingQuota = Math.max(0, userQuota.max - userQuota.used)
  const isCompleted =
    submission &&
    (submission.status === "SUBMITTED" ||
      submission.status === "COMPLETED" ||
      submission.status === "TIMED_OUT")

  return (
    <div className="max-w-3xl mx-auto space-y-6 font-sans py-2">
      {/* Back button */}
      <div>
        <Link
          href="/dashboard/tryouts"
          className="inline-flex items-center gap-2 bg-surface-white hover:bg-canvas-paper text-[#171717] border-2 border-[#171717] technical-shadow-sm px-4 py-2 font-mono text-xs font-bold uppercase transition-all"
        >
          <span>&larr;</span>
          <span>Kembali ke Daftar Tryout</span>
        </Link>
      </div>

      {/* Main Spec Card */}
      <div className="bg-surface-white border-2 border-[#171717] technical-shadow relative tick-corner overflow-hidden">
        {/* Terminal Header */}
        <div className="border-b-2 border-[#171717] bg-canvas-paper p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 bg-surface-white border border-[#171717] text-[#171717]">
              {tryout.category ? CATEGORY_LABELS[tryout.category] || tryout.category : "Semua Materi"}
            </span>
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 bg-surface-white border border-[#171717] text-ink-muted">
              {tryout.subject || "FISDAS2"}
            </span>
            <span className="font-mono text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-accent-canary text-[#171717] border border-[#171717]">
              CBT TIMED
            </span>
          </div>
          <h1 className="font-sans text-2xl sm:text-3xl font-black tracking-tight text-[#171717] leading-tight">
            {tryout.title}
          </h1>
          {tryout.description && (
            <p className="font-sans text-xs sm:text-sm text-ink-muted mt-2 leading-relaxed">
              {tryout.description}
            </p>
          )}
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Bento Stats Specification Strip */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-canvas-paper border-2 border-[#171717] p-4 flex flex-col justify-between technical-shadow-sm">
              <span className="font-mono text-[10px] font-bold text-ink-muted uppercase tracking-wider">
                DURASI_UJIAN
              </span>
              <p className="font-mono text-2xl font-black text-[#171717] mt-1">
                {tryout.duration} <span className="text-sm font-bold text-ink-muted">MENIT</span>
              </p>
            </div>
            <div className="bg-canvas-paper border-2 border-[#171717] p-4 flex flex-col justify-between technical-shadow-sm">
              <span className="font-mono text-[10px] font-bold text-ink-muted uppercase tracking-wider">
                JUMLAH_SOAL
              </span>
              <p className="font-mono text-2xl font-black text-[#171717] mt-1">
                {questionCount > 0 ? questionCount : "Tersedia"}{" "}
                <span className="text-sm font-bold text-ink-muted">BUTIR</span>
              </p>
            </div>
          </div>

          {/* Rules & Integrity Specification Box */}
          <div className="bg-canvas-paper border-2 border-[#171717] p-5 space-y-3 relative tick-corner">
            <div className="flex items-center gap-2 text-alert-rust font-mono text-xs font-black uppercase tracking-wider">
              <span className="size-2 bg-alert-rust border border-[#171717]" />
              <span>[!] KETENTUAN PENGERJAAN &amp; INTEGRITAS CBT</span>
            </div>
            <ul className="font-mono text-xs text-ink-muted space-y-1.5 list-none leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-alert-rust font-black">&gt;</span>
                <span>Ujian dimulai seketika setelah tombol konfirmasi ditekan.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-alert-rust font-black">&gt;</span>
                <span>Timer {tryout.duration} menit berjalan mundur secara otomatis di server.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-alert-rust font-black">&gt;</span>
                <span>Protokol fullscreen &amp; audit tab aktif untuk menjaga objektivitas penilaian.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-alert-rust font-black">&gt;</span>
                <span>Saat timer habis, seluruh lembar jawaban langsung dikumpulkan &amp; dinilai.</span>
              </li>
            </ul>
          </div>

          {/* Action Trigger Buttons */}
          {submission && submission.status === "IN_PROGRESS" ? (
            <div className="space-y-3">
              <div className="bg-accent-canary/20 border-2 border-[#171717] p-3.5 text-center font-mono text-xs font-bold text-[#171717]">
                SESI AKTIF: Anda memiliki sesi pengerjaan yang sedang berjalan.
              </div>
              <Button
                asChild
                className="w-full bg-accent-canary hover:bg-[#FDE047]/90 text-[#171717] border-2 border-[#171717] technical-shadow rounded-none font-mono text-sm font-black py-4 uppercase tracking-wider transition-all h-auto"
              >
                <Link href={`/dashboard/tryouts/${id}/attempt`} className="flex items-center justify-center gap-2">
                  <span>LANJUTKAN PENGERJAAN TRYOUT</span>
                  <span>&rarr;</span>
                </Link>
              </Button>
            </div>
          ) : isCompleted ? (
            <div className="space-y-4">
              <div className="bg-canvas-paper border-2 border-[#171717] p-4 text-center space-y-1 technical-shadow-sm">
                <p className="font-mono text-[10px] font-bold text-ink-muted uppercase">
                  STATUS: {submission.status === "TIMED_OUT" ? "WAKTU_HABIS" : "SELESAI_DIKERJAKAN"}
                </p>
                <p className="font-mono text-2xl font-black text-[#171717]">
                  SKOR TERCATAT: {submission.score ?? 0}%
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  asChild
                  variant="outline"
                  className="flex-1 bg-surface-white hover:bg-canvas-paper text-[#171717] border-2 border-[#171717] technical-shadow-sm rounded-none font-mono text-xs font-bold py-3 uppercase tracking-wider h-auto"
                >
                  <Link href={`/dashboard/tryouts/${id}/discussion`}>
                    BUKA LEMBAR PEMBAHASAN
                  </Link>
                </Button>
                {remainingQuota > 0 && (
                  <Button
                    onClick={() => setShowConfirm(true)}
                    className="flex-1 bg-accent-canary hover:bg-[#FDE047]/90 text-[#171717] border-2 border-[#171717] technical-shadow rounded-none font-mono text-xs font-black py-3 uppercase tracking-wider h-auto transition-all"
                  >
                    KERJAKAN ULANG
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {userQuota.max > 0 && remainingQuota <= 0 ? (
                <div className="bg-alert-rust/10 border-2 border-alert-rust p-3 text-center font-mono text-xs font-bold text-alert-rust">
                  KUOTA PENGERJAAN: Batas kuota tryout Anda untuk mata kuliah ini telah tercapai.
                </div>
              ) : (
                <Button
                  onClick={() => setShowConfirm(true)}
                  className="w-full bg-[#171717] hover:bg-accent-canary hover:text-[#171717] text-surface-white border-2 border-[#171717] technical-shadow rounded-none font-mono text-sm font-black py-4 uppercase tracking-wider transition-all h-auto"
                >
                  MULAI TRYOUT SEKARANG &rarr;
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="border-4 border-[#171717] shadow-[8px_8px_0px_#171717] bg-surface-white rounded-none font-mono max-w-md p-6 sm:p-7 relative tick-corner">
          <DialogHeader className="space-y-2">
            <div className="flex items-center gap-2 font-mono text-xs font-black text-alert-rust uppercase">
              <span className="size-2 bg-alert-rust border border-[#171717]" />
              <span>[KONFIRMASI // MULAI_SESI_CBT]</span>
            </div>
            <DialogTitle className="font-sans text-xl font-black text-[#171717]">
              Mulai Pengerjaan Tryout?
            </DialogTitle>
            <DialogDescription className="font-sans text-xs text-ink-muted leading-relaxed">
              Anda akan memulai simulasi <strong className="text-[#171717]">{tryout.title}</strong>. Timer {tryout.duration} menit akan langsung berjalan mundur dan tidak dapat dijeda.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-3 pt-4">
            <Button
              variant="outline"
              className="bg-surface-white border-2 border-[#171717] rounded-none font-mono text-xs font-bold uppercase"
              onClick={() => setShowConfirm(false)}
            >
              Batal
            </Button>
            <Button
              className="bg-accent-canary hover:bg-[#FDE047]/90 text-[#171717] border-2 border-[#171717] technical-shadow rounded-none font-mono text-xs font-black uppercase tracking-wider"
              onClick={() => router.push(`/dashboard/tryouts/${id}/attempt`)}
            >
              Ya, Mulai Sesi Ujian &rarr;
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
