"use client"

import { useEffect, useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import MarkdownLatex from "@/components/ui/markdown-latex"
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
    ListTree,
    ChevronRight,
    Loader2,
    ArrowRight,
} from "lucide-react"

interface MaterialDetail {
    id: string
    slug: string | null
    title: string
    summary: string | null
    content_md: string | null
    module_number: number | null
    reading_time_minutes: number | null
    is_free_preview: boolean
    subject: string
    drive_url: string | null
    podcast_url: string | null
    pdf_url: string | null
    created_at: string
}

interface TocItem {
    id: string
    text: string
    level: number
}

function extractToc(markdown: string): TocItem[] {
    const lines = markdown.split("\n")
    const items: TocItem[] = []

    for (const line of lines) {
        const h2Match = line.match(/^##\s+(.+)$/)
        const h3Match = line.match(/^###\s+(.+)$/)

        if (h2Match) {
            const raw = h2Match[1].trim()
            const clean = raw.replace(/[*_`]/g, "")
            const id = clean.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-")
            items.push({ id, text: clean, level: 2 })
        } else if (h3Match) {
            const raw = h3Match[1].trim()
            const clean = raw.replace(/[*_`]/g, "")
            const id = clean.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-")
            items.push({ id, text: clean, level: 3 })
        }
    }

    return items
}

const SAMPLE_CONTENT_MD: Record<string, string> = {
    "hukum-coulomb-medan-listrik": `# Modul 1: Hukum Coulomb & Medan Listrik

> Modul ini membahas interaksi elektrostatik antara muatan-muatan titik, formulasi matematis gaya Coulomb, serta definisi dan visualisasi garis medan listrik.

## 1. Konsep Dasar Muatan Listrik
Muatan listrik merupakan sifat dasar materi yang terkuantisasi dalam kelipatan muatan elementer:
$$q = n \\cdot e, \\quad \\text{dengan } e = 1{,}602 \\times 10^{-19} \\text{ C}$$

Muatan bersifat kekal dalam sistem terisolasi:
$$\\sum q_{\\text{awal}} = \\sum q_{\\text{akhir}}$$

## 2. Formulasi Hukum Coulomb
Gaya elektrostatik antara dua muatan titik $q_1$ dan $q_2$ yang terpisah sejauh $r$ dirumuskan oleh Charles-Augustin de Coulomb:
$$\\vec{F}_{12} = \\frac{1}{4\\pi\\varepsilon_0} \\frac{q_1 q_2}{r^2} \\hat{r}_{12}$$

Di mana:
- Permitivitas ruang hampa: $\\varepsilon_0 \\approx 8{,}854 \\times 10^{-12} \\text{ F/m}$
- Konstanta elektrostatik: $k = \\frac{1}{4\\pi\\varepsilon_0} \\approx 8{,}99 \\times 10^9 \\text{ N}\\cdot\\text{m}^2/\\text{C}^2$

### Prinsip Superposisi Gaya
Jika terdapat $N$ buah muatan di sekitar muatan uji $q_0$, gaya total adalah jumlah vektor:
$$\\vec{F}_{\\text{net}} = \\sum_{i=1}^{N} \\vec{F}_{i0} = \\frac{q_0}{4\\pi\\varepsilon_0} \\sum_{i=1}^{N} \\frac{q_i}{r_{i0}^2} \\hat{r}_{i0}$$

## 3. Medan Listrik (Electric Field)
Medan listrik $\\vec{E}$ pada suatu titik didefinisikan sebagai gaya elektrostatik per satuan muatan uji positif $q_0$:
$$\\vec{E} = \\lim_{q_0 \\to 0} \\frac{\\vec{F}}{q_0}$$

Untuk muatan titik tunggal $q$:
$$\\vec{E}(\\vec{r}) = \\frac{1}{4\\pi\\varepsilon_0} \\frac{q}{r^2} \\hat{r}$$

### Distribusi Muatan Kontinu
Untuk benda dengan dimensi terdistribusi, kita menggunakan integral superposisi elemen muatan $dq$:
$$\\vec{E} = \\frac{1}{4\\pi\\varepsilon_0} \\int \\frac{dq}{r^2} \\hat{r}$$

Jenis kerapatan muatan:
1. **Kerapatan Garis (1D):** $dq = \\lambda \\, dl$
2. **Kerapatan Luas (2D):** $dq = \\sigma \\, dA$
3. **Kerapatan Volume (3D):** $dq = \\rho \\, dV$

## 4. Contoh Analisis Soal Ujian
Sebuah dipole listrik terdiri atas muatan $+q$ dan $-q$ yang terpisah pada jarak $d$. Pada titik di sumbu dipole sejauh $z \\gg d$:
$$E \\approx \\frac{1}{2\\pi\\varepsilon_0} \\frac{p}{z^3}$$
Di mana momen dipole didefinisikan sebagai $\\vec{p} = q \\vec{d}$.

## 5. Rangkuman Konsep Kunci
- Gaya Coulomb berbanding terbalik dengan kuadrat jarak ($1/r^2$).
- Medan listrik selalu mengarah keluar dari muatan positif dan masuk menuju muatan negatif.
- Pada benda konduktor statis, muatan selalu berada di permukaan luar dan medan listrik di dalam rongga bernilai nol ($E=0$).
`,
    "bilangan-kompleks-fismat": `# Modul 1: Bilangan Kompleks & Bentuk Polar

> Modul matematika fisika ini mendalami aljabar bilangan kompleks, bentuk eksponensial Euler, dan aplikasinya pada osilasi harmonik teredam.

## 1. Definisi dan Bentuk Aljabar
Bilangan kompleks $z$ dinyatakan dalam bentuk kartesian:
$$z = x + iy, \\quad i = \\sqrt{-1}, \\quad i^2 = -1$$
Di mana $x = \\text{Re}(z)$ dan $y = \\text{Im}(z)$.

Konjugat kompleks:
$$z^* = x - iy, \\quad z \\cdot z^* = x^2 + y^2 = |z|^2$$

## 2. Bentuk Polar dan Rumus Euler
Dengan menggunakan hubungan koordinat polar $x = r \\cos\\theta$ dan $y = r \\sin\\theta$:
$$z = r(\\cos\\theta + i\\sin\\theta) = r e^{i\\theta}$$

Di mana:
- Modulus: $r = |z| = \\sqrt{x^2 + y^2}$
- Argumen (fase): $\\theta = \\arctan\\left(\\frac{y}{x}\\right)$

### Teorema De Moivre
Untuk setiap bilangan bulat $n$:
$$(\\cos\\theta + i\\sin\\theta)^n = \\cos(n\\theta) + i\\sin(n\\theta)$$
$$z^n = r^n e^{in\\theta}$$

## 3. Aplikasi dalam Fisika: Osilasi Harmonik
Persamaan gerak osilator teredam:
$$\\frac{d^2 x}{dt^2} + 2\\gamma \\frac{dx}{dt} + \\omega_0^2 x = 0$$

Dengan mengasumsikan solusi kompleks $x(t) = C e^{\\alpha t}$, solusi umum dapat disederhanakan menggunakan fungsi eksponensial kompleks sebelum mengambil bagian riilnya.
`
}

export default function MaterialReaderPage() {
    const params = useParams()
    const router = useRouter()
    const slug = params.slug as string

    const [material, setMaterial] = useState<MaterialDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [upgradeRequired, setUpgradeRequired] = useState(false)
    const [lockedInfo, setLockedInfo] = useState<any>(null)

    useEffect(() => {
        const fetchMaterial = async () => {
            setLoading(true)
            try {
                const res = await fetch(`/api/materials/${slug}`)
                const data = await res.json()

                if (res.status === 403 && data.error === "UPGRADE_REQUIRED") {
                    setUpgradeRequired(true)
                    setLockedInfo(data.material)
                    return
                }

                if (res.ok && data.material) {
                    setMaterial(data.material)
                    return
                }

                // If not in DB yet, check fallback seed
                if (SAMPLE_CONTENT_MD[slug]) {
                    setMaterial({
                        id: slug,
                        slug: slug,
                        title: slug.includes("fismat") ? "Bilangan Kompleks & Bentuk Polar" : "Hukum Coulomb & Medan Listrik",
                        summary: "Modul belajar interaktif format Markdown dan LaTeX.",
                        content_md: SAMPLE_CONTENT_MD[slug],
                        module_number: 1,
                        reading_time_minutes: 15,
                        is_free_preview: true,
                        subject: slug.includes("fismat") ? "FISMAT" : "FISDAS2",
                        drive_url: "https://drive.google.com",
                        podcast_url: null,
                        pdf_url: null,
                        created_at: new Date().toISOString()
                    })
                } else {
                    // Try looking up if locked
                    setUpgradeRequired(true)
                    setLockedInfo({
                        title: "Modul Pembelajaran Lanjutan",
                        summary: "Materi ini hanya tersedia untuk anggota Paket Semester atau Bulanan aktif."
                    })
                }
            } catch (err) {
                console.error("Fetch material error:", err)
            } finally {
                setLoading(false)
            }
        }

        fetchMaterial()
    }, [slug])

    const toc = useMemo(() => {
        if (!material?.content_md) return []
        return extractToc(material.content_md)
    }, [material?.content_md])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center space-y-3">
                    <Loader2 className="w-8 h-8 animate-spin text-olive mx-auto" />
                    <p className="text-sm font-medium text-muted-foreground">Memuat modul materi...</p>
                </div>
            </div>
        )
    }

    if (upgradeRequired) {
        return (
            <div className="max-w-xl mx-auto py-12 px-4">
                <div className="bg-card border border-amber-300 dark:border-amber-900/60 rounded-3xl p-8 text-center shadow-sm space-y-6">
                    <div className="w-16 h-16 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 rounded-2xl flex items-center justify-center mx-auto border border-amber-300">
                        <Lock className="w-8 h-8" />
                    </div>

                    <div className="space-y-2">
                        <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300">
                            Materi Khusus Premium
                        </span>
                        <h1 className="text-xl font-bold tracking-tight text-foreground">
                            {lockedInfo?.title || "Modul Terkunci"}
                        </h1>
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
                            {lockedInfo?.summary || "Tingkatkan akunmu ke Paket Semester untuk mengakses seluruh modul teks lengkap, formula interaktif, dan bank soal."}
                        </p>
                    </div>

                    <div className="p-4 bg-muted/40 rounded-xl text-left border border-border text-xs space-y-2 text-foreground/80">
                        <p className="font-semibold text-foreground">Keuntungan Berlangganan:</p>
                        <p className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Akses 7 modul lengkap Fisika Dasar 2 & Fisika Matematika</p>
                        <p className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Bank soal ribuan butir CBT dan pembahasan lengkap</p>
                        <p className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Rekaman dan konsultasi belajar bersama tutor</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <Button asChild variant="outline" className="flex-1">
                            <Link href="/dashboard/materi">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Kembali ke Modul
                            </Link>
                        </Button>
                        <Button asChild className="flex-1 bg-olive hover:bg-olive/90 text-white font-semibold">
                            <Link href="/dashboard/beli-paket">
                                <Sparkles className="w-4 h-4 mr-2" />
                                Buka Paket Sekarang
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
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto" />
                <h2 className="text-lg font-bold text-foreground">Modul Tidak Ditemukan</h2>
                <Button asChild variant="outline">
                    <Link href="/dashboard/materi">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Kembali ke Daftar Materi
                    </Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto py-4 space-y-6">
            {/* Breadcrumb & Navigation Bar */}
            <div className="flex items-center justify-between gap-4 flex-wrap border-b border-border pb-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Link href="/dashboard/materi" className="hover:text-foreground transition-colors flex items-center gap-1">
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Materi
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
                    <span className="font-semibold text-foreground truncate max-w-xs md:max-w-md">
                        Modul {material.module_number ?? 1}: {material.title}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    {material.is_free_preview && (
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300">
                            Free Preview
                        </span>
                    )}
                    {material.drive_url && (
                        <Button asChild variant="outline" size="sm" className="text-xs h-8">
                            <a href={material.drive_url} target="_blank" rel="noopener noreferrer">
                                <FileDown className="w-3.5 h-3.5 mr-1.5" />
                                Unduh PDF
                            </a>
                        </Button>
                    )}
                    {material.podcast_url && (
                        <Button asChild variant="outline" size="sm" className="text-xs h-8">
                            <a href={material.podcast_url} target="_blank" rel="noopener noreferrer">
                                <Headphones className="w-3.5 h-3.5 mr-1.5" />
                                Podcast
                            </a>
                        </Button>
                    )}
                </div>
            </div>

            {/* Layout: Sidebar TOC + Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                {/* Main Article */}
                <article className="lg:col-span-3 bg-card border border-border rounded-2xl p-6 md:p-10 shadow-sm">
                    {material.reading_time_minutes && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium mb-4">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Estimasi membaca: {material.reading_time_minutes} menit</span>
                        </div>
                    )}

                    <MarkdownLatex className="text-foreground">
                        {material.content_md || `# ${material.title}\n\n${material.summary || "Materi sedang disiapkan."}`}
                    </MarkdownLatex>

                    {/* End of Lesson card */}
                    <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/20 rounded-xl p-5">
                        <div className="space-y-0.5">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Selesai Membaca?</p>
                            <p className="text-sm font-bold text-foreground">Uji pemahamanmu dengan latihan soal CBT</p>
                        </div>
                        <Button asChild className="bg-olive hover:bg-olive/90 text-white font-semibold">
                            <Link href="/dashboard/tryouts">
                                Buka Tryout CBT
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                        </Button>
                    </div>
                </article>

                {/* Sticky TOC Sidebar */}
                {toc.length > 0 && (
                    <aside className="hidden lg:block lg:col-span-1 sticky top-20 bg-card border border-border rounded-2xl p-5 shadow-sm space-y-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider border-b border-border pb-2.5">
                            <ListTree className="w-4 h-4 text-olive" />
                            <span>Daftar Isi</span>
                        </div>
                        <nav className="space-y-1.5 text-xs max-h-[70vh] overflow-y-auto pr-1">
                            {toc.map((item, idx) => (
                                <a
                                    key={idx}
                                    href={`#${item.id}`}
                                    className={`block py-1 hover:text-olive transition-colors leading-snug ${
                                        item.level === 3 ? "pl-3 text-muted-foreground" : "font-medium text-foreground/90"
                                    }`}
                                >
                                    {item.text}
                                </a>
                            ))}
                        </nav>
                    </aside>
                )}
            </div>
        </div>
    )
}
