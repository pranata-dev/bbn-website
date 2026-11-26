"use client"

import { useEffect, useState, useMemo } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { useSubject } from "@/contexts/SubjectContext"
import MarkdownLatex from "@/components/ui/markdown-latex"
import TableOfContents, { extractToc } from "@/components/dashboard/TableOfContents"
import { Button } from "@/components/ui/button"
import {
    ArrowLeft,
    Clock,
    BookOpen,
    Headphones,
    FileDown,
    Lock,
    Sparkles,
    CheckCircle,
    ChevronDown,
    Loader2,
    ArrowRight,
    Terminal,
    Download,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { FALLBACK_MATERIAL_SEEDS as FALLBACK_SEEDS } from "@/constants/material-seeds"

interface MaterialDetail {
    id: string
    slug: string | null
    title: string
    summary: string | null
    content_md: string | null
    module_number: number | null
    sort_order?: number | null
    reading_time_minutes: number | null
    is_free_preview: boolean
    subject: string
    drive_url: string | null
    podcast_url: string | null
    pdf_url: string | null
    created_at: string
    courses?: {
        id: string
        title: string
        slug: string
        code: string
        track?: string
    } | null
    prev_material?: {
        id: string
        slug: string | null
        title: string
        module_number: number | null
    } | null
    next_material?: {
        id: string
        slug: string | null
        title: string
        module_number: number | null
    } | null
}

const SAMPLE_CONTENT_MD: Record<string, string> = {
    "hukum-coulomb-medan-listrik": `> [!NOTE] Inti Modul
Modul ini membahas interaksi elektrostatik antara muatan-muatan titik, formulasi matematis gaya Coulomb, serta definisi dan visualisasi garis medan listrik.

## 1. Konsep Dasar Muatan Listrik
Muatan listrik merupakan sifat dasar materi yang terkuantisasi dalam kelipatan muatan elementer:
$$q = n \\cdot e, \\quad \\text{dengan } e = 1{,}602 \\times 10^{-19} \\text{ C}$$

Muatan bersifat kekal dalam sistem terisolasi:
$$\\sum q_{\\text{awal}} = \\sum q_{\\text{akhir}}$$

> [!WARNING] Prinsip Kekekalan Muatan
Dalam setiap reaksi fisika dan kimia, jumlah aljabar muatan netto selalu konstan. Muatan tidak pernah diciptakan atau dimusnahkan secara netto, melainkan hanya berpindah antar materi.

## 2. Formulasi Hukum Coulomb
Gaya elektrostatik antara dua muatan titik $q_1$ dan $q_2$ yang terpisah sejauh $r$ dirumuskan oleh Charles-Augustin de Coulomb:
$$\\vec{F}_{12} = \\frac{1}{4\\pi\\varepsilon_0} \\frac{q_1 q_2}{r^2} \\hat{r}_{12}$$

> [!FORMULA] Hukum Coulomb & Konstanta Fisika
Konstanta elektrostatik $k$ dan permitivitas ruang hampa $\\varepsilon_0$ didefinisikan sebagai:
$$k = \\frac{1}{4\\pi\\varepsilon_0} \\approx 8{,}98755 \\times 10^9 \\text{ N}\\cdot\\text{m}^2/\\text{C}^2$$
$$\\varepsilon_0 \\approx 8{,}85418 \\times 10^{-12} \\text{ C}^2/(\\text{N}\\cdot\\text{m}^2)$$

Berikut adalah rangkuman perbandingan gaya elektrostatik vs gaya gravitasi:

| Karakteristik | Gaya Elektrostatik (Coulomb) | Gaya Gravitasi (Newton) |
| :--- | :--- | :--- |
| **Sifat Interaksi** | Tarik-menarik (beda tanda) & Tolak-menolak (sejenis) | Selalu tarik-menarik |
| **Sumber Gaya** | Muatan Listrik ($q$) | Massa ($m$) |
| **Konstanta Skala** | $k \\approx 8{,}99 \\times 10^9 \\text{ N}\\cdot\\text{m}^2/\\text{C}^2$ | $G \\approx 6{,}67 \\times 10^{-11} \\text{ N}\\cdot\\text{m}^2/\\text{kg}^2$ |
| **Ketergantungan Jarak** | Kuadrat terbalik ($1/r^2$) | Kuadrat terbalik ($1/r^2$) |

### Prinsip Superposisi Gaya
Jika terdapat $N$ buah muatan titik sumber $q_1, q_2, \\dots, q_N$ di sekitar muatan uji $q_0$, maka gaya total adalah jumlah vektor dari masing-masing kontribusi gaya:
$$\\vec{F}_{\\text{net}} = \\sum_{i=1}^{N} \\vec{F}_{i0} = \\frac{q_0}{4\\pi\\varepsilon_0} \\sum_{i=1}^{N} \\frac{q_i}{r_{i0}^2} \\hat{r}_{i0}$$

## 3. Medan Listrik (Electric Field)
Medan listrik $\\vec{E}$ pada suatu titik didefinisikan sebagai gaya elektrostatik per satuan muatan uji positif $q_0$:
$$\\vec{E} = \\lim_{q_0 \\to 0} \\frac{\\vec{F}}{q_0}$$

Untuk muatan titik tunggal $q$:
$$\\vec{E}(\\vec{r}) = \\frac{1}{4\\pi\\varepsilon_0} \\frac{q}{r^2} \\hat{r}$$

> [!TIP] Tips Analisis Vektor Medan
Arah medan listrik menjauhi muatan positif ($+q$) dan menuju muatan negatif ($-q$). Jika menghitung medan dari sistem simetris, manfaatkan pembatalan komponen simetri.

### Distribusi Muatan Kontinu
Untuk benda dengan geometri terdistribusi kontinu, kita menggunakan kalkulus integral superposisi elemen muatan $dq$:
$$\\vec{E} = \\frac{1}{4\\pi\\varepsilon_0} \\int \\frac{dq}{r^2} \\hat{r}$$

Jenis kerapatan muatan yang sering diujikan:
1. **Kerapatan Garis (1D):** $dq = \\lambda \\, dl$
2. **Kerapatan Luas (2D):** $dq = \\sigma \\, dA$
3. **Kerapatan Volume (3D):** $dq = \\rho \\, dV$

## 4. Contoh Analisis Soal Ujian
Sebuah dipole listrik terdiri atas pasangan muatan $+q$ dan $-q$ yang terpisah pada jarak $d$. Pada titik di sumbu aksial dipole sejauh $z \\gg d$:
$$E_z \\approx \\frac{1}{2\\pi\\varepsilon_0} \\frac{p}{z^3}$$
Di mana momen dipole listrik didefinisikan sebagai vektor $\\vec{p} = q \\vec{d}$.

> [!IMPORTANT] Ketergantungan $1/r^3$ pada Dipole
Berbeda dari muatan titik tunggal ($1/r^2$), medan dipole meluruh jauh lebih cepat dengan faktor $1/r^3$ karena kedua muatan berlawanan tanda saling meniadakan sebagian efeknya dari kejauhan.

## 5. Rangkuman Konsep Kunci
- Gaya Coulomb berbanding terbalik dengan kuadrat jarak ($1/r^2$) dan berbanding lurus dengan perkalian kedua muatan.
- Medan listrik adalah besaran vektor yang merepresentasikan gaya per muatan uji positif.
- Pada benda konduktor dalam keadaan elektrostatik, muatan selalu berada pada permukaan luar dan medan listrik di dalam bahan konduktor selalu nol ($E = 0$).
`,
    "bilangan-kompleks-fismat": `> [!NOTE] Ringkasan Fisika Matematika
Modul ini mendalami aljabar bilangan kompleks, bentuk eksponensial Euler, koordinat polar bidang Argand, dan aplikasinya pada sistem osilasi fisik teredam.

## 1. Definisi dan Bentuk Aljabar
Bilangan kompleks $z$ dinyatakan dalam bentuk kartesian:
$$z = x + iy, \\quad i = \\sqrt{-1}, \\quad i^2 = -1$$
Di mana $x = \\text{Re}(z)$ merupakan bagian riil dan $y = \\text{Im}(z)$ merupakan bagian imajiner.

Konjugat kompleks dari $z$:
$$z^* = x - iy, \\quad z \\cdot z^* = x^2 + y^2 = |z|^2$$

> [!FORMULA] Identitas Konjugat
$$\\text{Re}(z) = \\frac{z + z^*}{2}, \\quad \\text{Im}(z) = \\frac{z - z^*}{2i}$$

## 2. Bentuk Polar dan Rumus Euler
Dengan menggunakan representasi koordinat polar $x = r \\cos\\theta$ dan $y = r \\sin\\theta$:
$$z = r(\\cos\\theta + i\\sin\\theta) = r e^{i\\theta}$$

Di mana:
- Modulus: $r = |z| = \\sqrt{x^2 + y^2}$
- Argumen (fase): $\\theta = \\operatorname{atan2}(y, x)$

### Teorema De Moivre
Untuk setiap bilangan bulat maupun rasional $n$:
$$(\\cos\\theta + i\\sin\\theta)^n = \\cos(n\\theta) + i\\sin(n\\theta)$$
$$z^n = r^n e^{in\\theta}$$

## 3. Aplikasi dalam Fisika: Osilasi Harmonik
Persamaan diferensial gerak osilator harmonik teredam:
$$\\frac{d^2 x}{dt^2} + 2\\gamma \\frac{dx}{dt} + \\omega_0^2 x = 0$$

Dengan mengasumsikan solusi kompleks berbentuk $x(t) = C e^{\\alpha t}$, persamaan gerak dapat diselesaikan secara aljabar eksponensial jauh lebih cepat dibandingkan fungsi trigonometri murni.
`
}

function getSubjectDisplayName(code: string | undefined): string {
    if (!code) return "Materi Belajar"
    const upper = code.toUpperCase()
    if (upper === "FISDAS2") return "Fisika Dasar 2"
    if (upper === "FISDAS1") return "Fisika Dasar 1"
    if (upper === "FISMAT") return "Fisika Matematika"
    if (upper === "MEKANIKA") return "Mekanika Newton"
    return code
}

export default function MaterialReaderPage() {
    const params = useParams()
    const slug = params.slug as string
    const { isExcellentBeta } = useSubject()

    const [material, setMaterial] = useState<MaterialDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [upgradeRequired, setUpgradeRequired] = useState(false)
    const [forbiddenGrade, setForbiddenGrade] = useState(false)
    const [lockedInfo, setLockedInfo] = useState<{ title?: string; summary?: string } | null>(null)
    const [mobileTocOpen, setMobileTocOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        const fetchMaterial = async () => {
            setLoading(true)
            setForbiddenGrade(false)
            setUpgradeRequired(false)
            try {
                const res = await fetch(`/api/materials/${slug}`)
                const data = await res.json()

                if (res.status === 403 && data.error === "FORBIDDEN_GRADE") {
                    setForbiddenGrade(true)
                    return
                }

                if (res.status === 403 && data.error === "UPGRADE_REQUIRED") {
                    setUpgradeRequired(true)
                    setLockedInfo(data.material)
                    return
                }

                if (res.ok && data.material) {
                    setMaterial(data.material)
                    return
                }

                if (isExcellentBeta || data.entitlements?.isExcellentBeta) {
                    setMaterial(null)
                    return
                }

                // If not found in DB or running in seed mode, match fallback seeds
                const isFismat = slug.includes("fismat")
                const subjectKey = isFismat ? "FISMAT" : "FISDAS2"
                const seedList = FALLBACK_SEEDS[subjectKey] || []
                const matchedIndex = seedList.findIndex(
                    (s) => s.slug === slug || s.id === slug
                )
                const fallbackItem = matchedIndex >= 0 ? seedList[matchedIndex] : null

                if (fallbackItem && fallbackItem.is_free_preview) {
                    const prevItem = matchedIndex > 0 ? seedList[matchedIndex - 1] : null
                    const nextItem =
                        matchedIndex < seedList.length - 1
                            ? seedList[matchedIndex + 1]
                            : null

                    setMaterial({
                        id: fallbackItem.id,
                        slug: fallbackItem.slug,
                        title: fallbackItem.title,
                        summary: fallbackItem.summary,
                        content_md:
                            SAMPLE_CONTENT_MD[slug] ||
                            `# ${fallbackItem.title}\n\n${fallbackItem.summary}\n\n## 1. Pendahuluan\nPenjelasan modul pembelajaran sedang disusun oleh tim akademik BBN Education.\n\n## 2. Pokok Pembahasan\nSilakan simak rekaman materi dan unduh ringkasan PDF melalui tombol di atas.`,
                        module_number: fallbackItem.module_number,
                        reading_time_minutes: fallbackItem.reading_time_minutes,
                        is_free_preview: fallbackItem.is_free_preview,
                        subject: fallbackItem.subject,
                        drive_url: fallbackItem.drive_url,
                        podcast_url: fallbackItem.podcast_url,
                        pdf_url: fallbackItem.pdf_url,
                        created_at: new Date().toISOString(),
                        prev_material: prevItem
                            ? {
                                  id: prevItem.id,
                                  slug: prevItem.slug,
                                  title: prevItem.title,
                                  module_number: prevItem.module_number,
                              }
                            : null,
                        next_material: nextItem
                            ? {
                                  id: nextItem.id,
                                  slug: nextItem.slug,
                                  title: nextItem.title,
                                  module_number: nextItem.module_number,
                              }
                            : null,
                    })
                } else {
                    setUpgradeRequired(true)
                    setLockedInfo({
                        title: "Modul Pembelajaran Lanjutan",
                        summary:
                            "Materi ini hanya tersedia untuk anggota Paket Semester atau Bulanan aktif BBN Education.",
                    })
                }
            } catch (err) {
                console.error("Fetch material error:", err)
            } finally {
                setLoading(false)
            }
        }

        fetchMaterial()
    }, [slug, isExcellentBeta])

    const toc = useMemo(() => {
        if (!material?.content_md) return []
        const raw = extractToc(material.content_md)
        if (!searchQuery.trim()) return raw
        const q = searchQuery.toLowerCase().trim()
        return raw.filter((item) => item.text.toLowerCase().includes(q))
    }, [material?.content_md, searchQuery])

    const handleSearchJump = () => {
        if (toc.length > 0) {
            const firstMatch = document.getElementById(toc[0].id)
            if (firstMatch) {
                const y = firstMatch.getBoundingClientRect().top + window.scrollY - 96
                window.scrollTo({ top: y, behavior: "smooth" })
            }
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="bg-surface-white border border-[#171717] dark:border-[#3F3F46] p-8 technical-shadow text-center space-y-3 max-w-xs w-full">
                    <Loader2 className="w-8 h-8 animate-spin text-[#171717] dark:text-[#FDE047] mx-auto" />
                    <p className="font-mono text-xs font-bold text-[#171717] dark:text-[#F5F4EE] uppercase tracking-wider">
                        [FETCHING_MODULE_DATA]
                    </p>
                    <p className="font-mono text-[10px] text-ink-muted">
                        Mengakses repositori silabus BBN_EDU...
                    </p>
                </div>
            </div>
        )
    }

    if (forbiddenGrade) {
        return (
            <div className="max-w-md mx-auto py-16 text-center space-y-4">
                <div className="bg-surface-white border-2 border-[#171717] dark:border-[#3F3F46] p-8 technical-shadow space-y-4">
                    <div className="size-12 bg-canvas-paper border border-[#171717] dark:border-[#3F3F46] flex items-center justify-center mx-auto">
                        <Lock className="w-6 h-6 text-[#171717] dark:text-[#F5F4EE]" />
                    </div>
                    <h2 className="text-lg font-extrabold text-[#171717] dark:text-[#F5F4EE]">
                        Materi Tidak Tersedia untuk Kelas Kamu
                    </h2>
                    <p className="text-xs text-ink-muted font-sans leading-relaxed">
                        Modul ini termasuk dalam kelas lain. Kembali ke daftar materi untuk membuka modul Fisika sesuai kelas kamu.
                    </p>
                    <Button asChild variant="outline" className="font-mono text-xs font-bold border-2 border-[#171717] dark:border-[#3F3F46] text-[#171717] dark:text-[#F5F4EE] hover:bg-accent-canary hover:text-[#171717] dark:hover:text-[#171717] rounded-none">
                        <Link href="/dashboard/materi">
                            <ArrowLeft className="w-3.5 h-3.5 mr-2" />
                            KEMBALI KE DAFTAR MATERI
                        </Link>
                    </Button>
                </div>
            </div>
        )
    }

    if (upgradeRequired) {
        return (
            <div className="max-w-xl mx-auto py-12 px-4">
                <div className="bg-surface-white border border-[#171717] dark:border-[#3F3F46] p-8 text-center technical-shadow space-y-6">
                    <div className="size-14 bg-accent-canary border border-[#171717] flex items-center justify-center mx-auto technical-shadow-sm">
                        <Lock className="w-7 h-7 text-[#171717]" />
                    </div>

                    <div className="space-y-2">
                        <span className="font-mono text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 bg-alert-rust text-white border border-[#171717] dark:border-alert-rust inline-block">
                            [SECURITY.RESTRICTED // AKSES_KHUSUS_PREMIUM]
                        </span>
                        <h1 className="text-2xl font-black tracking-tight text-[#171717] dark:text-[#F5F4EE]">
                            {lockedInfo?.title || "Modul Terkunci"}
                        </h1>
                        <p className="text-xs sm:text-sm text-ink-muted leading-relaxed max-w-md mx-auto font-sans">
                            {lockedInfo?.summary ||
                                "Tingkatkan akunmu ke Paket Semester untuk mengakses seluruh modul teks lengkap, formula interaktif, dan bank soal BBN Education."}
                        </p>
                    </div>

                    <div className="p-4 bg-canvas-paper border border-[#171717] dark:border-[#3F3F46] text-left text-xs space-y-2.5 text-[#171717] dark:text-[#F5F4EE] font-mono">
                        <p className="font-bold uppercase tracking-wider border-b border-[#171717]/20 dark:border-[#3F3F46] pb-1">
                            KEUNTUNGAN BERLANGGANAN BBN EDUCATION:
                        </p>
                        <p className="flex items-center gap-2">
                            <CheckCircle className="w-3.5 h-3.5 text-alert-rust shrink-0" />
                            Akses 7 modul lengkap Fisika Dasar 2 & Fisika Matematika
                        </p>
                        <p className="flex items-center gap-2">
                            <CheckCircle className="w-3.5 h-3.5 text-alert-rust shrink-0" />
                            Bank soal ribuan butir CBT dan pembahasan formula
                        </p>
                        <p className="flex items-center gap-2">
                            <CheckCircle className="w-3.5 h-3.5 text-alert-rust shrink-0" />
                            Rekaman audio podcast dan konsultasi tutor
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <Button asChild variant="outline" className="flex-1 font-mono text-xs font-bold border border-[#171717] dark:border-[#3F3F46] text-[#171717] dark:text-[#F5F4EE] rounded-none technical-shadow-sm hover:bg-canvas-paper dark:hover:bg-[#22252E]">
                            <Link href="/dashboard/materi">
                                <ArrowLeft className="w-3.5 h-3.5 mr-2" />
                                KEMBALI KE SILABUS
                            </Link>
                        </Button>
                        <Button
                            asChild
                            className="flex-1 bg-accent-canary hover:bg-[#fde667] text-[#171717] font-mono text-xs font-bold border border-[#171717] dark:border-[#FDE047] rounded-none technical-shadow-sm transition-all"
                        >
                            <Link href="/dashboard/beli-paket">
                                <Sparkles className="w-3.5 h-3.5 mr-2" />
                                AKTIFKAN PAKET SEKARANG
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    if (!material) {
        return (
            <div className="max-w-md mx-auto py-16 text-center space-y-4">
                <div className="bg-surface-white border border-[#171717] dark:border-[#3F3F46] p-8 technical-shadow space-y-4">
                    <BookOpen className="w-10 h-10 text-ink-muted mx-auto" />
                    <h2 className="text-lg font-bold text-[#171717] dark:text-[#F5F4EE] font-mono uppercase">
                        [ERROR: MODUL_TIDAK_DITEMUKAN]
                    </h2>
                    <p className="text-xs text-ink-muted font-sans">
                        Modul materi yang kamu cari tidak terdaftar dalam repositori akademik.
                    </p>
                    <Button asChild variant="outline" className="font-mono text-xs font-bold border border-[#171717] dark:border-[#3F3F46] text-[#171717] dark:text-[#F5F4EE] rounded-none">
                        <Link href="/dashboard/materi">
                            <ArrowLeft className="w-3.5 h-3.5 mr-2" />
                            KEMBALI KE DAFTAR MATERI
                        </Link>
                    </Button>
                </div>
            </div>
        )
    }

    const subjectTitle = getSubjectDisplayName(material.courses?.title || material.subject)
    const prevModule = material.prev_material
    const nextModule = material.next_material

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6 font-sans">
            {/* ======================================================== */}
            {/* TAB [02] MATERI HEADER & SEARCH FILTER BAR               */}
            {/* ======================================================== */}
            <div className="bg-surface-white border border-[#171717] dark:border-[#3F3F46] p-4 technical-shadow flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <div className="flex items-center space-x-2 font-mono text-xs flex-wrap">
                        <span className="uppercase text-ink-muted font-bold">
                            ARCHIVE // KURIKULUM
                        </span>
                        <span className="text-[#D4D2C9] dark:text-[#3F3F46]">/</span>
                        <span className="text-alert-rust font-bold uppercase">
                            {subjectTitle}
                        </span>
                        <span className="text-[#D4D2C9] dark:text-[#3F3F46]">/</span>
                        <span className="text-[#171717] dark:text-[#F5F4EE] font-bold">
                            MODUL {material.module_number ?? 1}
                        </span>
                    </div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#171717] dark:text-[#F5F4EE] tracking-tight mt-1">
                        {material.title}
                    </h1>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                    <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleSearchJump()
                            }}
                            placeholder="Cari Seksi atau Teorema..."
                            className="px-3 py-1.5 bg-canvas-paper dark:bg-[#22252E] text-[#171717] dark:text-[#F5F4EE] text-xs font-mono border border-[#171717] dark:border-[#3F3F46] focus:outline-none focus:ring-1 focus:ring-[#171717] dark:focus:ring-[#FDE047] placeholder:text-ink-muted w-48 sm:w-60 rounded-none"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleSearchJump}
                        className="px-3 py-1.5 bg-accent-canary text-[#171717] border border-[#171717] dark:border-[#FDE047] text-xs font-mono font-bold hover:bg-yellow-400 rounded-none cursor-pointer"
                    >
                        FILTER
                    </button>
                </div>
            </div>

            {/* Topic Badges Filter Row & Quick Action Links */}
            <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 bg-[#171717] dark:bg-[#22252E] text-white dark:text-[#F5F4EE] font-bold border border-[#171717] dark:border-[#3F3F46]">
                        MODUL {material.module_number ?? 1}
                    </span>
                    <span className="px-3 py-1 bg-surface-white text-[#171717] dark:text-[#F5F4EE] border border-[#171717] dark:border-[#3F3F46] font-semibold">
                        {subjectTitle}
                    </span>
                    {material.reading_time_minutes && (
                        <span className="px-3 py-1 bg-canvas-paper text-ink-muted border border-[#171717] dark:border-[#3F3F46]">
                            <Clock className="size-3 inline mr-1 text-alert-rust" />
                            DURASI: {material.reading_time_minutes} MENIT BACA
                        </span>
                    )}
                    {material.is_free_preview && (
                        <span className="px-3 py-1 bg-accent-canary text-[#171717] border border-[#171717] font-bold">
                            FREE PREVIEW
                        </span>
                    )}
                </div>

                {/* Right Actions: PDF & Podcast Download */}
                <div className="flex items-center gap-2">
                    {material.drive_url && (
                        <Button asChild variant="outline" size="sm" className="font-mono text-xs font-bold h-8 border border-[#171717] dark:border-[#3F3F46] text-[#171717] dark:text-[#F5F4EE] rounded-none technical-shadow-sm hover:bg-accent-canary hover:text-[#171717] dark:hover:text-[#171717] transition-all">
                            <a href={material.drive_url} target="_blank" rel="noopener noreferrer">
                                <FileDown className="w-3.5 h-3.5 mr-1.5" />
                                UNDUH PDF
                            </a>
                        </Button>
                    )}
                    {material.podcast_url && (
                        <Button asChild variant="outline" size="sm" className="font-mono text-xs font-bold h-8 border border-[#171717] dark:border-[#3F3F46] text-[#171717] dark:text-[#F5F4EE] rounded-none technical-shadow-sm hover:bg-accent-canary hover:text-[#171717] dark:hover:text-[#171717] transition-all">
                            <a href={material.podcast_url} target="_blank" rel="noopener noreferrer">
                                <Headphones className="w-3.5 h-3.5 mr-1.5" />
                                PODCAST AUDIO
                            </a>
                        </Button>
                    )}
                </div>
            </div>

            {/* ======================================================== */}
            {/* 12-COLUMN BLUEPRINT GRID: Main Content (8) + TOC (4)     */}
            {/* ======================================================== */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* ======================================================== */}
                {/* LEFT: 8 COLUMNS - Material Reader Content               */}
                {/* ======================================================== */}
                <main className="lg:col-span-8 space-y-6 min-w-0">
                    
                    {/* Abstract / Summary Annotation Box */}
                    {material.summary && (
                        <div className="border-l-4 border-alert-rust bg-canvas-paper border-y border-r border-[#171717] dark:border-[#3F3F46] p-4 text-xs sm:text-sm text-[#171717] dark:text-[#F5F4EE] leading-relaxed font-sans">
                            <span className="font-mono text-[10px] font-bold uppercase text-alert-rust block mb-1">
                                [ANNOTATION // RINGKASAN_EKSEKUTIF]
                            </span>
                            {material.summary}
                        </div>
                    )}

                    {/* Mobile/Tablet TOC Drawer (below lg) */}
                    {toc.length > 0 && (
                        <div className="lg:hidden border border-[#171717] dark:border-[#3F3F46] bg-surface-white p-3.5 technical-shadow-sm">
                            <button
                                type="button"
                                onClick={() => setMobileTocOpen(!mobileTocOpen)}
                                className="flex items-center justify-between w-full font-mono text-xs font-bold text-[#171717] dark:text-[#F5F4EE]"
                            >
                                <span className="flex items-center gap-2">
                                    <Terminal className="w-3.5 h-3.5 text-alert-rust" />
                                    <span>[SYS.TOC] // DAFTAR ISI ({toc.length} SEKSI)</span>
                                </span>
                                <ChevronDown
                                    className={cn(
                                        "w-4 h-4 text-[#171717] dark:text-[#F5F4EE] transition-transform duration-200",
                                        mobileTocOpen && "rotate-180"
                                    )}
                                />
                            </button>
                            {mobileTocOpen && (
                                <nav className="mt-3 pt-3 border-t border-[#171717] dark:border-[#3F3F46] space-y-1 font-mono text-xs">
                                    {toc.map((item) => (
                                        <a
                                            key={item.id}
                                            href={`#${item.id}`}
                                            onClick={(e) => {
                                                e.preventDefault()
                                                setMobileTocOpen(false)
                                                const el = document.getElementById(item.id)
                                                if (el) {
                                                    const yOffset = -96
                                                    const y =
                                                        el.getBoundingClientRect().top +
                                                        window.pageYOffset +
                                                        yOffset
                                                    window.scrollTo({ top: y, behavior: "smooth" })
                                                }
                                            }}
                                            className={cn(
                                                "block py-1.5 px-2 hover:bg-accent-canary hover:text-[#171717] dark:hover:text-[#171717] transition-colors leading-snug border border-transparent hover:border-[#171717]",
                                                item.level === 3
                                                    ? "pl-4 text-ink-muted text-[11px]"
                                                    : "font-bold text-[#171717] dark:text-[#F5F4EE]"
                                            )}
                                        >
                                            <span className="mr-1.5 text-ink-muted">
                                                {item.level === 3 ? "├─[+]" : "[#]"}
                                            </span>
                                            {item.text}
                                        </a>
                                    ))}
                                </nav>
                            )}
                        </div>
                    )}

                    {/* Core Markdown & LaTeX Reader Canvas */}
                    <article className="bg-surface-white border border-[#171717] dark:border-[#3F3F46] p-6 sm:p-8 technical-shadow min-w-0">
                        <MarkdownLatex>
                            {material.content_md ||
                                `# ${material.title}\n\n${material.summary || "Materi sedang disiapkan oleh tim akademik BBN Education."}`}
                        </MarkdownLatex>
                    </article>

                    {/* Next & Previous Module Navigation Buttons */}
                    <nav aria-label="Navigasi Modul" className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {prevModule ? (
                            <Link
                                href={`/dashboard/materi/${prevModule.slug || prevModule.id}`}
                                className="group flex flex-col p-4 border border-[#171717] dark:border-[#3F3F46] bg-surface-white hover:bg-canvas-paper dark:hover:bg-[#22252E] dark:hover:border-[#FDE047] technical-shadow hover:translate-x-0.5 hover:translate-y-0.5 transition-all text-left"
                            >
                                <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-ink-muted group-hover:text-alert-rust dark:group-hover:text-[#FDE047] transition-colors mb-1">
                                    <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                                    <span>[PREV_MODULE]</span>
                                </div>
                                <span className="text-sm font-bold text-[#171717] dark:text-[#F5F4EE] group-hover:text-alert-rust dark:group-hover:text-[#FDE047] transition-colors line-clamp-1">
                                    {prevModule.title}
                                </span>
                            </Link>
                        ) : (
                            <div />
                        )}

                        {nextModule ? (
                            <Link
                                href={`/dashboard/materi/${nextModule.slug || nextModule.id}`}
                                className="group flex flex-col p-4 border border-[#171717] dark:border-[#3F3F46] bg-surface-white hover:bg-canvas-paper dark:hover:bg-[#22252E] dark:hover:border-[#FDE047] technical-shadow hover:translate-x-0.5 hover:translate-y-0.5 transition-all text-right sm:items-end"
                            >
                                <div className="flex items-center justify-end gap-1.5 font-mono text-xs font-bold text-ink-muted group-hover:text-alert-rust dark:group-hover:text-[#FDE047] transition-colors mb-1">
                                    <span>[NEXT_MODULE]</span>
                                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                                </div>
                                <span className="text-sm font-bold text-[#171717] dark:text-[#F5F4EE] group-hover:text-alert-rust dark:group-hover:text-[#FDE047] transition-colors line-clamp-1">
                                    {nextModule.title}
                                </span>
                            </Link>
                        ) : (
                            <div />
                        )}
                    </nav>

                    {/* Post-Reading CBT Practice Banner Box */}
                    <section className="p-6 border-2 border-[#171717] dark:border-[#FDE047] bg-accent-canary technical-shadow flex flex-col sm:flex-row items-center justify-between gap-5">
                        <div className="space-y-1 text-center sm:text-left">
                            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#171717] dark:text-[#F5F4EE] bg-surface-white dark:bg-[#171717] border border-[#171717] px-2 py-0.5 inline-block">
                                [EVALUATION.GATEWAY] // VERIFIKASI_PEMAHAMAN
                            </span>
                            <h2 className="text-lg font-black text-[#171717] tracking-tight">
                                Uji Pemahamanmu di Simulasi CBT BBN
                            </h2>
                            <p className="text-xs text-[#171717]/80 max-w-md font-sans">
                                Kerjakan latihan soal komprehensif dengan batas waktu ujian riil, analisis otomatis deviasi jawaban, dan pembahasan formula mendalam.
                            </p>
                        </div>
                        <Button
                            asChild
                            className="bg-[#171717] hover:bg-white hover:text-[#171717] text-white font-mono text-xs font-bold border-2 border-[#171717] rounded-none px-5 py-3 shrink-0 technical-shadow-sm transition-all"
                        >
                            <Link href="/dashboard/tryouts">
                                BUKA TRYOUT CBT
                                <ArrowRight className="w-3.5 h-3.5 ml-2" />
                            </Link>
                        </Button>
                    </section>

                </main>

                {/* ======================================================== */}
                {/* RIGHT: 4 COLUMNS - Table of Contents & LaTeX Drawer     */}
                {/* ======================================================== */}
                <aside className="lg:col-span-4 space-y-6 sticky top-20">
                    
                    {/* 1. Rigid Table of Contents Component */}
                    {toc.length > 0 && (
                        <div className="bg-surface-white border border-[#171717] dark:border-[#3F3F46] p-4 technical-shadow">
                            <TableOfContents items={toc} />
                        </div>
                    )}

                    {/* 2. LaTeX Reference // Lembar Rumus Drawer */}
                    <div className="bg-surface-white border border-[#171717] dark:border-[#3F3F46] p-4 technical-shadow space-y-3">
                        <div className="bg-[#171717] dark:bg-[#22252E] dark:border dark:border-[#3F3F46] text-white px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider flex justify-between items-center">
                            <span>LATEX REFERENCE // LEMBAR RUMUS</span>
                            <span className="text-accent-canary font-mono text-[10px]">MOD_{String(material.module_number ?? 1).padStart(2, "0")}</span>
                        </div>

                        {/* Formula 1 */}
                        <div className="p-3 bg-canvas-paper border border-[#D4D2C9] dark:border-[#3F3F46] space-y-1">
                            <span className="text-[10px] font-mono text-ink-muted uppercase block font-bold">
                                HUKUM COULOMB VEKTOR
                            </span>
                            <div className="text-xs font-bold text-[#171717] dark:text-[#F5F4EE] font-mono">
                                F⃗ = (1 / 4πε₀) · (q₁q₂ / r²) · r̂
                            </div>
                            <p className="text-[11px] text-ink-muted leading-tight">
                                Gaya elektrostatis berbanding lurus dengan hasil kali muatan dan berbanding terbalik dengan kuadrat jarak.
                            </p>
                        </div>

                        {/* Formula 2 */}
                        <div className="p-3 bg-canvas-paper border border-[#D4D2C9] dark:border-[#3F3F46] space-y-1">
                            <span className="text-[10px] font-mono text-ink-muted uppercase block font-bold">
                                MEDAN LISTRIK KONTINU
                            </span>
                            <div className="text-xs font-bold text-[#171717] dark:text-[#F5F4EE] font-mono">
                                E⃗ = (1 / 4πε₀) ∫ (dq / r²) · r̂
                            </div>
                            <p className="text-[11px] text-ink-muted leading-tight">
                                Superposisi integral elemen muatan dq pada distribusi linear, luas, atau volume.
                            </p>
                        </div>

                        {/* Formula 3 */}
                        <div className="p-3 bg-canvas-paper border border-[#D4D2C9] dark:border-[#3F3F46] space-y-1">
                            <span className="text-[10px] font-mono text-ink-muted uppercase block font-bold">
                                MEDAN AKSIAL DIPOLE
                            </span>
                            <div className="text-xs font-bold text-[#171717] dark:text-[#F5F4EE] font-mono">
                                E_z ≈ (1 / 2πε₀) · (p / z³)
                            </div>
                        </div>

                        {material.drive_url || material.pdf_url ? (
                            <a
                                href={material.drive_url || material.pdf_url || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-2 bg-canvas-paper text-[#171717] dark:text-[#F5F4EE] border border-[#171717] dark:border-[#3F3F46] font-mono text-xs font-bold hover:bg-accent-canary hover:text-[#171717] dark:hover:text-[#171717] transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                            >
                                <Download className="size-3.5" />
                                <span>UNDUH CHEATSHEET PDF</span>
                            </a>
                        ) : (
                            <button
                                type="button"
                                disabled
                                className="w-full py-2 bg-canvas-paper text-ink-muted border border-[#D4D2C9] dark:border-[#3F3F46] font-mono text-xs font-bold flex items-center justify-center space-x-1.5 cursor-not-allowed opacity-60"
                            >
                                <Download className="size-3.5" />
                                <span>PDF BELUM TERSEDIA</span>
                            </button>
                        )}
                    </div>

                    {/* 3. Archival Metadata Box */}
                    <div className="p-3 bg-canvas-paper border border-dashed border-[#171717] dark:border-[#3F3F46] font-mono text-xs text-ink-muted flex items-center justify-between">
                        <span>BBN_EDU-REF: #BBN-{material.subject}-V2</span>
                        <span className="text-[#171717] dark:text-[#F5F4EE] font-bold">KURIKULUM RESMI</span>
                    </div>

                </aside>

            </div>
        </div>
    )
}
