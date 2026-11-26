"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { useSubject } from "@/contexts/SubjectContext"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { EmptyState } from "@/components/dashboard/EmptyState"
import { Button } from "@/components/ui/button"
import { toDirectDownloadUrl } from "@/lib/download-url"
import { BookOpen, Headphones, FileDown, Lock, Sparkles, Clock, CheckCircle, ArrowRight, Loader2 } from "lucide-react"

import { FALLBACK_MATERIAL_SEEDS } from "@/constants/material-seeds"

interface MaterialItem {
  id: string
  slug: string | null
  title: string
  summary: string | null
  has_content?: boolean
  content_md?: string | null
  module_number: number | null
  reading_time_minutes: number | null
  is_free_preview: boolean
  can_access: boolean
  is_locked: boolean
  drive_url: string | null
  podcast_url: string | null
  pdf_url: string | null
  subject: string
}

const FALLBACK_SEEDS: Record<string, MaterialItem[]> = Object.fromEntries(
  Object.entries(FALLBACK_MATERIAL_SEEDS).map(([key, items]) => [
    key,
    items.map((item) => ({
      ...item,
      can_access: item.is_free_preview,
      is_locked: !item.is_free_preview,
    })),
  ])
)

function MateriContent() {
  const searchParams = useSearchParams()
  const courseParam = searchParams.get("course")
  const { selectedSubject, isExcellentBeta, excellentCourse } = useSubject()
  const activeSubject = isExcellentBeta && excellentCourse
    ? excellentCourse.slug
    : ((courseParam || selectedSubject || "FISDAS2") as string)

  const [materials, setMaterials] = useState<MaterialItem[]>([])
  const [isFreeTier, setIsFreeTier] = useState(false)
  const [apiBetaMode, setApiBetaMode] = useState(false)
  const [loading, setLoading] = useState(true)

  const inBetaMode = isExcellentBeta || apiBetaMode

  useEffect(() => {
    const fetchMaterials = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/materials?subject=${activeSubject}`)
        if (res.ok) {
          const data = await res.json()
          const isBetaResponse = Boolean(data.entitlements?.isExcellentBeta)
          setApiBetaMode(isBetaResponse)
          setIsFreeTier(!isBetaResponse && Boolean(data.entitlements?.isFreeTier))

          if (isExcellentBeta || isBetaResponse) {
            // Never show university FALLBACK_SEEDS in Excellent Beta mode
            setMaterials(data.materials || [])
            return
          }

          if (data.materials && data.materials.length > 0) {
            setMaterials(data.materials)
            return
          }
        }

        if (isExcellentBeta) {
          setMaterials([])
          return
        }

        // Fallback to initial curriculum seeds for university mode only
        const fallback = FALLBACK_SEEDS[activeSubject] || FALLBACK_SEEDS["FISDAS2"]
        setMaterials(fallback)
      } catch (err) {
        console.error("Failed to load materials", err)
        if (isExcellentBeta) {
          setMaterials([])
        } else {
          const fallback = FALLBACK_SEEDS[activeSubject] || FALLBACK_SEEDS["FISDAS2"]
          setMaterials(fallback)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchMaterials()
  }, [activeSubject, isExcellentBeta])

  const subjectTitle =
    inBetaMode && excellentCourse
      ? excellentCourse.title
      : activeSubject === "FISMAT"
      ? "Fisika Matematika"
      : "Fisika Dasar 2"

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title={`Rangkuman & Modul: ${subjectTitle}`}
        subtitle={
          inBetaMode
            ? "Kumpulan ringkasan konsep, penurunan rumus, dan contoh soal untuk persiapan SAS Fisika."
            : "Modul belajar interaktif dengan format Markdown, formula LaTeX, audio podcast, dan rangkuman PDF."
        }
      />

      {/* Free Tier Upgrade Banner */}
      {isFreeTier && !inBetaMode && (
        <div className="bg-surface-white border border-[#171717] dark:border-[#3F3F46] p-5 md:p-6 technical-shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs font-mono font-bold px-2.5 py-0.5 bg-accent-canary text-[#171717] border border-[#171717] uppercase">
                <Sparkles className="w-3.5 h-3.5" /> Akun Gratis
              </span>
              <span className="text-xs font-mono text-ink-muted font-medium">1 Modul Preview Terbuka</span>
            </div>
            <h3 className="text-base font-bold text-[#171717] dark:text-[#F5F4EE]">
              Buka Akses Seluruh Modul & Tryout CBT
            </h3>
            <p className="text-xs text-ink-muted max-w-xl">
              Paket Bulanan dan Paket Semester sedang disiapkan (Coming Soon) untuk membuka seluruh materi lengkap, bank soal, dan simulasi tryout.
            </p>
          </div>
          <Button asChild className="bg-[#171717] hover:bg-[#171717]/90 text-white dark:bg-accent-canary dark:text-[#171717] dark:hover:bg-[#fde667] font-mono text-xs font-bold rounded-none border border-[#171717] dark:border-[#FDE047] technical-shadow-sm shrink-0">
            <Link href="/dashboard/beli-paket">
              Upgrade Paket
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </Button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-[35vh]">
          <div className="bg-surface-white border border-[#171717] dark:border-[#3F3F46] p-8 technical-shadow text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#171717] dark:text-[#FDE047] mx-auto" />
            <p className="text-xs font-mono text-ink-muted">Memuat daftar modul materi...</p>
          </div>
        </div>
      ) : materials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
          {materials.map((materi, idx) => {
            const isUnlocked = materi.can_access || !materi.is_locked
            const itemSlug = materi.slug || materi.id
            const pdfDownloadUrl = toDirectDownloadUrl(materi.drive_url || materi.pdf_url)
            const podcastDownloadUrl = toDirectDownloadUrl(materi.podcast_url)
            const hasReadableContent =
              materi.has_content !== undefined
                ? materi.has_content
                : materi.content_md !== undefined
                ? Boolean(materi.content_md && materi.content_md.trim().length > 0)
                : Boolean(materi.id.startsWith("seed-"))

            return (
              <div
                key={materi.id || idx}
                className={`bg-surface-white p-6 border transition-all duration-200 flex flex-col justify-between h-full technical-shadow ${
                  isUnlocked
                    ? "border-[#171717] dark:border-[#3F3F46] hover:border-alert-rust dark:hover:border-[#FDE047]"
                    : "border-[#171717]/40 dark:border-[#3F3F46] bg-canvas-paper dark:bg-[#181A20]/70 opacity-90"
                }`}
              >
                <div>
                  {/* Top Badge & Metadata */}
                  <div className="flex items-center justify-between gap-2 mb-4 pb-2.5 border-b border-[#D4D2C9] dark:border-[#3F3F46]">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 bg-canvas-paper dark:bg-[#22252E] text-ink-muted border border-[#D4D2C9] dark:border-[#3F3F46]">
                      Modul {materi.module_number ?? idx + 1}
                    </span>
                    {materi.is_free_preview ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-400 dark:border-emerald-500/50">
                        <CheckCircle className="w-3 h-3" /> {inBetaMode ? "Terbuka" : "Free Preview"}
                      </span>
                    ) : isUnlocked ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase px-2 py-0.5 bg-accent-canary text-[#171717] border border-[#171717]">
                        <CheckCircle className="w-3 h-3" /> Terbuka
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-400 dark:border-amber-500/50">
                        <Lock className="w-3 h-3" /> Premium
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-extrabold text-[#171717] dark:text-[#F5F4EE] leading-snug mb-2">
                    {materi.title}
                  </h3>

                  {/* Summary */}
                  {materi.summary && (
                    <p className="text-xs text-ink-muted leading-relaxed line-clamp-3 mb-4">
                      {materi.summary}
                    </p>
                  )}

                  {materi.reading_time_minutes && (
                    <p className="text-[11px] font-mono font-medium text-ink-muted flex items-center gap-1 mb-5">
                      <Clock className="w-3 h-3 text-alert-rust" />
                      <span>{materi.reading_time_minutes} menit membaca</span>
                    </p>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="space-y-2.5 pt-4 border-t border-[#D4D2C9] dark:border-[#3F3F46] mt-auto">
                  {!isUnlocked ? (
                    <Button asChild variant="outline" className="w-full font-mono font-bold text-xs h-10 rounded-none border border-[#171717] dark:border-amber-500/60 text-amber-900 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40">
                      <Link href="/dashboard/beli-paket">
                        <Lock className="w-3.5 h-3.5 mr-2 text-amber-600 dark:text-amber-400" />
                        Buka Akses Premium
                      </Link>
                    </Button>
                  ) : hasReadableContent ? (
                    <>
                      <Button asChild className="w-full bg-[#171717] hover:bg-[#171717]/90 text-white dark:bg-accent-canary dark:text-[#171717] dark:hover:bg-[#fde667] font-mono font-bold text-xs h-10 rounded-none border border-[#171717] dark:border-[#FDE047] technical-shadow-sm">
                        <Link href={`/dashboard/materi/${itemSlug}`}>
                          <BookOpen className="w-4 h-4 mr-2" />
                          Baca Modul Interaktif
                        </Link>
                      </Button>

                      {(pdfDownloadUrl || podcastDownloadUrl) && (
                        <div className="flex gap-2">
                          {pdfDownloadUrl && (
                            <Button asChild variant="outline" size="sm" className="flex-1 text-[11px] font-mono font-bold h-8 rounded-none border-[#171717] dark:border-[#3F3F46] text-[#171717] dark:text-[#F5F4EE] hover:bg-accent-canary hover:text-[#171717] dark:hover:text-[#171717]">
                              <a href={pdfDownloadUrl} target="_blank" rel="noopener noreferrer" download>
                                <FileDown className="w-3.5 h-3.5 mr-1" />
                                PDF
                              </a>
                            </Button>
                          )}
                          {podcastDownloadUrl && (
                            <Button asChild variant="outline" size="sm" className="flex-1 text-[11px] font-mono font-bold h-8 rounded-none border-[#171717] dark:border-[#3F3F46] text-[#171717] dark:text-[#F5F4EE] hover:bg-accent-canary hover:text-[#171717] dark:hover:text-[#171717]">
                              <a href={podcastDownloadUrl} target="_blank" rel="noopener noreferrer" download>
                                <Headphones className="w-3.5 h-3.5 mr-1" />
                                Podcast
                              </a>
                            </Button>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {pdfDownloadUrl && (
                        <Button asChild className="w-full bg-accent-canary hover:bg-[#fde667] text-[#171717] font-mono font-bold text-xs h-10 rounded-none border-2 border-[#171717] dark:border-[#FDE047] technical-shadow-sm">
                          <a href={pdfDownloadUrl} target="_blank" rel="noopener noreferrer" download>
                            <FileDown className="w-4 h-4 mr-2" />
                            Unduh Materi (PDF)
                          </a>
                        </Button>
                      )}
                      {podcastDownloadUrl && (
                        <Button asChild variant="outline" className="w-full bg-surface-white hover:bg-canvas-paper dark:hover:bg-[#22252E] text-[#171717] dark:text-[#F5F4EE] font-mono font-bold text-xs h-10 rounded-none border-2 border-[#171717] dark:border-[#3F3F46] dark:hover:border-[#FDE047] technical-shadow-sm">
                          <a href={podcastDownloadUrl} target="_blank" rel="noopener noreferrer" download>
                            <Headphones className="w-4 h-4 mr-2" />
                            Unduh Podcast (Audio)
                          </a>
                        </Button>
                      )}
                      {!pdfDownloadUrl && !podcastDownloadUrl && (
                        <div className="text-center font-mono text-[11px] text-ink-muted py-2 border border-dashed border-[#D4D2C9] dark:border-[#3F3F46] bg-canvas-paper">
                          Tautan unduhan sedang disiapkan
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <EmptyState
          title="Belum Ada Materi"
          description="Materi belajar akan diunggah pada halaman ini saat sudah tersedia. Silakan cek kembali nanti!"
        />
      )}
    </div>
  )
}

export default function MateriPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-muted-foreground text-sm font-semibold">
          Memuat modul materi...
        </div>
      }
    >
      <MateriContent />
    </Suspense>
  )
}
