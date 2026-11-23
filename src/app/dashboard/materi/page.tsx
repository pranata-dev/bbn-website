"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { useSubject } from "@/contexts/SubjectContext"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { EmptyState } from "@/components/dashboard/EmptyState"
import { Button } from "@/components/ui/button"
import { BookOpen, Headphones, FileDown, Lock, Sparkles, Clock, CheckCircle, ArrowRight, Loader2 } from "lucide-react"

interface MaterialItem {
  id: string
  slug: string | null
  title: string
  summary: string | null
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

const FALLBACK_SEEDS: Record<string, MaterialItem[]> = {
  FISDAS2: [
    {
      id: "seed-fisdas-1",
      slug: "hukum-coulomb-medan-listrik",
      title: "Hukum Coulomb & Medan Listrik",
      summary: "Konsep muatan terkuantisasi, hukum Coulomb gaya elektrostatis, dan formulasi medan listrik pada muatan titik dan kontinu.",
      module_number: 1,
      reading_time_minutes: 15,
      is_free_preview: true,
      can_access: true,
      is_locked: false,
      drive_url: "https://drive.google.com/uc?export=download&id=15FjanBliqSbGNLflR0ulE3Se4dE-Whmm",
      podcast_url: "https://drive.google.com/uc?export=download&id=1d3VdZspBokYYZj8amEWI3ihd6hlF8ieT",
      pdf_url: null,
      subject: "FISDAS2"
    },
    {
      id: "seed-fisdas-2",
      slug: "hukum-gauss-fluks-listrik",
      title: "Hukum Gauss & Fluks Listrik",
      summary: "Perhitungan integral fluks listrik tertutup, permukaan Gauss simetri bola, silinder, dan pelat datar tak berhingga.",
      module_number: 2,
      reading_time_minutes: 18,
      is_free_preview: false,
      can_access: false,
      is_locked: true,
      drive_url: null,
      podcast_url: null,
      pdf_url: null,
      subject: "FISDAS2"
    },
    {
      id: "seed-fisdas-3",
      slug: "potensial-listrik-kapasitansi",
      title: "Potensial Listrik & Kapasitansi",
      summary: "Beda potensial, energi potensial elektrostatik, dielektrik, konfigurasi seri-paralel kapasitor dan penyimpanan energi.",
      module_number: 3,
      reading_time_minutes: 20,
      is_free_preview: false,
      can_access: false,
      is_locked: true,
      drive_url: null,
      podcast_url: null,
      pdf_url: null,
      subject: "FISDAS2"
    },
    {
      id: "seed-fisdas-4",
      slug: "arus-resistansi-rangkaian-dc",
      title: "Arus, Hambatan & Rangkaian DC",
      summary: "Hukum Ohm, kerapatan arus, resistivitas suhu, Hukum Kirchhoff loop & junction, dan rangkaian transient RC.",
      module_number: 4,
      reading_time_minutes: 22,
      is_free_preview: false,
      can_access: false,
      is_locked: true,
      drive_url: null,
      podcast_url: null,
      pdf_url: null,
      subject: "FISDAS2"
    },
    {
      id: "seed-fisdas-5",
      slug: "medan-magnet-sumber-medan",
      title: "Medan Magnet & Hukum Biot-Savart",
      summary: "Gaya Lorentz, gerak siklotron partikel bermuatan, Hukum Biot-Savart, dan Hukum Ampere untuk kawat berarus dan solenoida.",
      module_number: 5,
      reading_time_minutes: 25,
      is_free_preview: false,
      can_access: false,
      is_locked: true,
      drive_url: null,
      podcast_url: null,
      pdf_url: null,
      subject: "FISDAS2"
    },
    {
      id: "seed-fisdas-6",
      slug: "induksi-elektromagnetik-faraday",
      title: "Induksi Elektromagnetik & Hukum Faraday",
      summary: "Fluks magnetik berubah waktu, GGL induksi Faraday-Lenz, induktansi diri, dan energi yang tersimpan dalam medan magnet.",
      module_number: 6,
      reading_time_minutes: 18,
      is_free_preview: false,
      can_access: false,
      is_locked: true,
      drive_url: null,
      podcast_url: null,
      pdf_url: null,
      subject: "FISDAS2"
    },
    {
      id: "seed-fisdas-7",
      slug: "osilasi-rangkaian-ac",
      title: "Osilasi Elektromagnetik & Rangkaian AC",
      summary: "Rangkaian RLC seri, fasor tegangan-arus, reaktansi kapasitif/induktif, resonansi rangkaian, dan daya AC.",
      module_number: 7,
      reading_time_minutes: 20,
      is_free_preview: false,
      can_access: false,
      is_locked: true,
      drive_url: null,
      podcast_url: null,
      pdf_url: null,
      subject: "FISDAS2"
    }
  ],
  FISMAT: [
    {
      id: "seed-fismat-1",
      slug: "bilangan-kompleks-fismat",
      title: "Bilangan Kompleks & Bentuk Polar",
      summary: "Aljabar bilangan kompleks, bidang Argand, rumus Euler, teorema De Moivre, dan aplikasi pada getaran harmonik.",
      module_number: 1,
      reading_time_minutes: 16,
      is_free_preview: true,
      can_access: true,
      is_locked: false,
      drive_url: "https://drive.google.com/uc?export=download&id=1D9DJXMUaVexRqWDTpz20egIm5rlAxBmA",
      podcast_url: "https://drive.google.com/uc?export=download&id=17I6oVcUdQ_f2fxnu1YotnPt5ZbPxt7JK",
      pdf_url: null,
      subject: "FISMAT"
    },
    {
      id: "seed-fismat-2",
      slug: "aljabar-linear-matriks-vektor",
      title: "Aljabar Linear & Ruang Vektor",
      summary: "Operasi matriks, eliminasi Gauss-Jordan, determinan, nilai eigen, dan vektor eigen dalam mekanika kuantum/klasik.",
      module_number: 2,
      reading_time_minutes: 20,
      is_free_preview: false,
      can_access: false,
      is_locked: true,
      drive_url: null,
      podcast_url: null,
      pdf_url: null,
      subject: "FISMAT"
    },
    {
      id: "seed-fismat-3",
      slug: "deret-tak-hingga-deret-pangkat",
      title: "Deret Tak Hingga & Deret Taylor",
      summary: "Uji konvergensi deret (rasio, integral, akar), deret pangkat, ekspansi Taylor-Maclaurin, dan solusi aproksimasi fisika.",
      module_number: 3,
      reading_time_minutes: 22,
      is_free_preview: false,
      can_access: false,
      is_locked: true,
      drive_url: null,
      podcast_url: null,
      pdf_url: null,
      subject: "FISMAT"
    }
  ]
}

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
                        <CheckCircle className="w-3 h-3" /> Free Preview
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
                  {isUnlocked ? (
                    <Button asChild className="w-full bg-[#171717] hover:bg-[#171717]/90 text-white dark:bg-accent-canary dark:text-[#171717] dark:hover:bg-[#fde667] font-mono font-bold text-xs h-10 rounded-none border border-[#171717] dark:border-[#FDE047] technical-shadow-sm">
                      <Link href={`/dashboard/materi/${itemSlug}`}>
                        <BookOpen className="w-4 h-4 mr-2" />
                        Baca Modul Interaktif
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild variant="outline" className="w-full font-mono font-bold text-xs h-10 rounded-none border border-[#171717] dark:border-amber-500/60 text-amber-900 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40">
                      <Link href="/dashboard/beli-paket">
                        <Lock className="w-3.5 h-3.5 mr-2 text-amber-600 dark:text-amber-400" />
                        Buka Akses Premium
                      </Link>
                    </Button>
                  )}

                  {isUnlocked && (materi.drive_url || materi.podcast_url) && (
                    <div className="flex gap-2">
                      {materi.drive_url && (
                        <Button asChild variant="outline" size="sm" className="flex-1 text-[11px] font-mono font-bold h-8 rounded-none border-[#171717] dark:border-[#3F3F46] text-[#171717] dark:text-[#F5F4EE] hover:bg-accent-canary hover:text-[#171717] dark:hover:text-[#171717]">
                          <a href={materi.drive_url} target="_blank" rel="noopener noreferrer">
                            <FileDown className="w-3.5 h-3.5 mr-1" />
                            PDF
                          </a>
                        </Button>
                      )}
                      {materi.podcast_url && (
                        <Button asChild variant="outline" size="sm" className="flex-1 text-[11px] font-mono font-bold h-8 rounded-none border-[#171717] dark:border-[#3F3F46] text-[#171717] dark:text-[#F5F4EE] hover:bg-accent-canary hover:text-[#171717] dark:hover:text-[#171717]">
                          <a href={materi.podcast_url} target="_blank" rel="noopener noreferrer">
                            <Headphones className="w-3.5 h-3.5 mr-1" />
                            Podcast
                          </a>
                        </Button>
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
