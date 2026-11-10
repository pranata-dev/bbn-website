"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"

interface LatihanDetailData {
  id: string
  title: string
  description: string | null
  category: string | null
  questionCount: number
}

interface SubmissionRecord {
  id: string
  status: string
  score: number | null
}

export default function LatihanDetailPage() {
  const params = useParams()
  const validId = typeof params?.id === "string" ? params.id : null

  const [latihan, setLatihan] = useState<LatihanDetailData | null>(null)
  const [previousSubmission, setPreviousSubmission] = useState<SubmissionRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!validId) return

    const fetchLatihanDetails = async () => {
      try {
        const { createClient } = await import("@/lib/supabase/client")
        const supabase = createClient()

        const { data, error: fetchErr } = await supabase
          .from("tryouts")
          .select("*, tryout_questions(id)")
          .eq("id", validId)
          .eq("is_practice", true)
          .single()

        if (fetchErr || !data) {
          throw new Error("Modul latihan tidak ditemukan.")
        }

        setLatihan({
          id: data.id,
          title: data.title,
          description: data.description,
          category: data.category,
          questionCount: data.tryout_questions?.length || 0,
        })

        // Fetch user submission history
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          const { data: profile } = await supabase
            .from("users")
            .select("id")
            .eq("auth_id", session.user.id)
            .single()

          if (profile) {
            const { data: submissions } = await supabase
              .from("submissions")
              .select("id, status, score")
              .eq("user_id", profile.id)
              .eq("tryout_id", validId)
              .order("created_at", { ascending: false })
              .limit(1)

            if (submissions && submissions.length > 0) {
              setPreviousSubmission(submissions[0] as SubmissionRecord)
            }
          }
        }
      } catch (err) {
        console.error("Fetch error:", err)
        const msg = err instanceof Error ? err.message : "Gagal memuat detail modul latihan."
        setError(msg)
      } finally {
        setLoading(false)
      }
    }

    fetchLatihanDetails()
  }, [validId])

  if (!validId) return null

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center font-mono">
        <div className="bg-surface-white border-2 border-dashed border-[#171717] bg-grid-blueprint p-12 text-center relative tick-corner">
          <div className="size-3 bg-accent-canary border border-[#171717] mx-auto mb-3 animate-spin" />
          <p className="font-mono text-xs font-bold text-[#171717]">
            &gt; STATUS: FETCHING_PRACTICE_METADATA...
          </p>
        </div>
      </div>
    )
  }

  if (error || !latihan) {
    return (
      <div className="space-y-6 font-mono max-w-xl mx-auto">
        <Link
          href="/dashboard/latihan"
          className="inline-flex items-center gap-2 bg-surface-white hover:bg-canvas-paper text-[#171717] border-2 border-[#171717] technical-shadow-sm px-4 py-2 font-mono text-xs font-bold uppercase transition-all"
        >
          <span>&larr;</span>
          <span>Kembali</span>
        </Link>
        <div className="bg-surface-white border-2 border-dashed border-[#171717] p-8 text-center relative tick-corner bg-grid-blueprint">
          <div className="size-14 bg-canvas-paper border-2 border-[#171717] flex items-center justify-center mx-auto mb-4 font-mono text-2xl font-black">
            Ø
          </div>
          <h3 className="font-sans text-xl font-black text-[#171717] mb-2">Modul Tidak Ditemukan</h3>
          <p className="font-sans text-xs text-ink-muted leading-relaxed">
            {error || "Latihan soal yang Anda cari tidak tersedia."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 font-sans py-2 max-w-5xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          href="/dashboard/latihan"
          className="inline-flex items-center gap-2 bg-surface-white hover:bg-canvas-paper text-[#171717] border-2 border-[#171717] technical-shadow-sm px-4 py-2 font-mono text-xs font-bold uppercase transition-all"
        >
          <span>&larr;</span>
          <span>Kembali ke Daftar Latihan</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main detail card */}
        <div className="lg:col-span-2 bg-surface-white border-2 border-[#171717] technical-shadow relative tick-corner overflow-hidden">
          {/* Header */}
          <div className="border-b-2 border-[#171717] bg-canvas-paper px-6 py-5 sm:px-8 sm:py-6">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="font-mono text-[10px] font-bold text-[#171717] bg-surface-white border border-[#171717] px-2.5 py-0.5 uppercase tracking-wider">
                {latihan.category || "Semua Materi"}
              </span>
              <span className="font-mono text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-accent-canary text-[#171717] border border-[#171717]">
                MODE MANDIRI
              </span>
            </div>
            <h1 className="font-sans text-2xl sm:text-3xl font-black text-[#171717] tracking-tight leading-tight">
              {latihan.title}
            </h1>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="font-mono text-xs font-bold text-[#171717] uppercase tracking-wider mb-2 flex items-center gap-2">
                <span className="size-2 bg-alert-rust border border-[#171717]" />
                Deskripsi Modul Latihan
              </h3>
              <p className="font-sans text-xs sm:text-sm text-ink-muted leading-relaxed">
                {latihan.description || "Tidak ada deskripsi tambahan untuk modul latihan soal ini."}
              </p>
            </div>

            {/* CTA action box */}
            <div className="bg-canvas-paper border-2 border-[#171717] p-5 relative tick-corner technical-shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="font-mono text-sm font-black text-[#171717]">
                    SIAP BERLATIH MANDIRI?
                  </p>
                  <p className="font-mono text-[10px] text-ink-muted mt-0.5">
                    Tidak ada batasan waktu. Pelajari penalaran matematis secara komprehensif.
                  </p>
                </div>
                {previousSubmission ? (
                  previousSubmission.status === "IN_PROGRESS" ? (
                    <Link
                      href={`/dashboard/latihan/${validId}/practice`}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-accent-canary hover:bg-[#FDE047]/90 text-[#171717] font-mono text-xs font-black px-6 py-3 border-2 border-[#171717] technical-shadow uppercase tracking-wider transition-all"
                    >
                      <span>Lanjutkan Latihan</span>
                      <span>&rarr;</span>
                    </Link>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                      <Link
                        href={`/dashboard/latihan/${validId}/discussion`}
                        className="inline-flex items-center justify-center gap-1.5 bg-surface-white hover:bg-canvas-paper text-[#171717] font-mono text-xs font-bold px-4 py-2.5 border-2 border-[#171717] technical-shadow-sm uppercase transition-all"
                      >
                        Lihat Pembahasan
                      </Link>
                      <Link
                        href={`/dashboard/latihan/${validId}/practice`}
                        className="inline-flex items-center justify-center gap-2 bg-accent-canary hover:bg-[#FDE047]/90 text-[#171717] font-mono text-xs font-black px-5 py-2.5 border-2 border-[#171717] technical-shadow uppercase transition-all"
                      >
                        <span>Ulangi Latihan</span>
                        <span>&rarr;</span>
                      </Link>
                    </div>
                  )
                ) : (
                  <Link
                    href={`/dashboard/latihan/${validId}/practice`}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-accent-canary hover:bg-[#FDE047]/90 text-[#171717] font-mono text-xs font-black px-6 py-3 border-2 border-[#171717] technical-shadow uppercase tracking-wider transition-all"
                  >
                    <span>Mulai Latihan</span>
                    <span>&rarr;</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar module specs */}
        <div className="space-y-6">
          <div className="bg-surface-white border-2 border-[#171717] technical-shadow p-5 relative tick-corner">
            <h2 className="font-mono text-xs font-bold text-[#171717] uppercase tracking-wider pb-3 border-b-2 border-[#171717]">
              SPESIFIKASI MODUL
            </h2>
            <div className="divide-y divide-border-grid mt-2">
              <div className="py-3 flex items-center justify-between">
                <span className="font-mono text-xs text-ink-muted">TOTAL SOAL:</span>
                <span className="font-mono text-sm font-black text-[#171717]">
                  {latihan.questionCount} BUTIR
                </span>
              </div>
              <div className="py-3 flex items-center justify-between">
                <span className="font-mono text-xs text-ink-muted">STATUS:</span>
                <span className="font-mono text-xs font-bold text-alert-rust">
                  {previousSubmission
                    ? previousSubmission.status === "IN_PROGRESS"
                      ? "SEDANG BERJALAN"
                      : `SELESAI (SKOR: ${previousSubmission.score ?? 0}%)`
                    : "BELUM DIMULAI"}
                </span>
              </div>
              <div className="py-3 flex items-center justify-between">
                <span className="font-mono text-xs text-ink-muted">TIPE SESI:</span>
                <span className="font-mono text-xs font-bold text-[#171717]">
                  ANALISIS MANDIRI
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
