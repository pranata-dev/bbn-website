export interface SeedMaterialItem {
    id: string
    slug: string
    title: string
    summary: string
    module_number: number
    reading_time_minutes: number
    is_free_preview: boolean
    subject: string
    drive_url: string | null
    podcast_url: string | null
    pdf_url: string | null
}

export const FALLBACK_MATERIAL_SEEDS: Record<string, SeedMaterialItem[]> = {
    FISDAS2: [
        {
            id: "seed-fisdas-1",
            slug: "hukum-coulomb-medan-listrik",
            title: "Hukum Coulomb & Medan Listrik",
            summary:
                "Konsep muatan terkuantisasi, hukum Coulomb gaya elektrostatis, dan formulasi medan listrik pada muatan titik dan kontinu.",
            module_number: 1,
            reading_time_minutes: 15,
            is_free_preview: true,
            subject: "FISDAS2",
            drive_url: "https://drive.google.com/uc?export=download&id=15FjanBliqSbGNLflR0ulE3Se4dE-Whmm",
            podcast_url: "https://drive.google.com/uc?export=download&id=1d3VdZspBokYYZj8amEWI3ihd6hlF8ieT",
            pdf_url: null,
        },
        {
            id: "seed-fisdas-2",
            slug: "hukum-gauss-fluks-listrik",
            title: "Hukum Gauss & Fluks Listrik",
            summary:
                "Perhitungan integral fluks listrik tertutup, permukaan Gauss simetri bola, silinder, dan pelat datar tak berhingga.",
            module_number: 2,
            reading_time_minutes: 18,
            is_free_preview: false,
            subject: "FISDAS2",
            drive_url: null,
            podcast_url: null,
            pdf_url: null,
        },
        {
            id: "seed-fisdas-3",
            slug: "potensial-listrik-kapasitansi",
            title: "Potensial Listrik & Kapasitansi",
            summary:
                "Beda potensial, energi potensial elektrostatik, dielektrik, konfigurasi seri-paralel kapasitor dan penyimpanan energi.",
            module_number: 3,
            reading_time_minutes: 20,
            is_free_preview: false,
            subject: "FISDAS2",
            drive_url: null,
            podcast_url: null,
            pdf_url: null,
        },
        {
            id: "seed-fisdas-4",
            slug: "arus-resistansi-rangkaian-dc",
            title: "Arus, Hambatan & Rangkaian DC",
            summary:
                "Hukum Ohm, kerapatan arus, resistivitas suhu, Hukum Kirchhoff loop & junction, dan rangkaian transient RC.",
            module_number: 4,
            reading_time_minutes: 22,
            is_free_preview: false,
            subject: "FISDAS2",
            drive_url: null,
            podcast_url: null,
            pdf_url: null,
        },
        {
            id: "seed-fisdas-5",
            slug: "medan-magnet-sumber-medan",
            title: "Medan Magnet & Hukum Biot-Savart",
            summary:
                "Gaya Lorentz, gerak siklotron partikel bermuatan, Hukum Biot-Savart, dan Hukum Ampere untuk kawat berarus dan solenoida.",
            module_number: 5,
            reading_time_minutes: 25,
            is_free_preview: false,
            subject: "FISDAS2",
            drive_url: null,
            podcast_url: null,
            pdf_url: null,
        },
        {
            id: "seed-fisdas-6",
            slug: "induksi-elektromagnetik-faraday",
            title: "Induksi Elektromagnetik & Hukum Faraday",
            summary:
                "Fluks magnetik berubah waktu, GGL induksi Faraday-Lenz, induktansi diri, dan energi yang tersimpan dalam medan magnet.",
            module_number: 6,
            reading_time_minutes: 18,
            is_free_preview: false,
            subject: "FISDAS2",
            drive_url: null,
            podcast_url: null,
            pdf_url: null,
        },
        {
            id: "seed-fisdas-7",
            slug: "osilasi-rangkaian-ac",
            title: "Osilasi Elektromagnetik & Rangkaian AC",
            summary:
                "Rangkaian RLC seri, fasor tegangan-arus, reaktansi kapasitif/induktif, resonansi rangkaian, dan daya AC.",
            module_number: 7,
            reading_time_minutes: 20,
            is_free_preview: false,
            subject: "FISDAS2",
            drive_url: null,
            podcast_url: null,
            pdf_url: null,
        },
    ],
    FISMAT: [
        {
            id: "seed-fismat-1",
            slug: "bilangan-kompleks-fismat",
            title: "Bilangan Kompleks & Bentuk Polar",
            summary:
                "Aljabar bilangan kompleks, bidang Argand, rumus Euler, teorema De Moivre, dan aplikasi pada getaran harmonik.",
            module_number: 1,
            reading_time_minutes: 16,
            is_free_preview: true,
            subject: "FISMAT",
            drive_url: "https://drive.google.com/uc?export=download&id=1D9DJXMUaVexRqWDTpz20egIm5rlAxBmA",
            podcast_url: "https://drive.google.com/uc?export=download&id=17I6oVcUdQ_f2fxnu1YotnPt5ZbPxt7JK",
            pdf_url: null,
        },
        {
            id: "seed-fismat-2",
            slug: "aljabar-linear-matriks-vektor",
            title: "Aljabar Linear & Ruang Vektor",
            summary:
                "Operasi matriks, eliminasi Gauss-Jordan, determinan, nilai eigen, dan vektor eigen dalam mekanika kuantum/klasik.",
            module_number: 2,
            reading_time_minutes: 20,
            is_free_preview: false,
            subject: "FISMAT",
            drive_url: null,
            podcast_url: null,
            pdf_url: null,
        },
        {
            id: "seed-fismat-3",
            slug: "deret-tak-hingga-deret-pangkat",
            title: "Deret Tak Hingga & Deret Taylor",
            summary:
                "Uji konvergensi deret (rasio, integral, akar), deret pangkat, ekspansi Taylor-Maclaurin, dan solusi aproksimasi fisika.",
            module_number: 3,
            reading_time_minutes: 22,
            is_free_preview: false,
            subject: "FISMAT",
            drive_url: null,
            podcast_url: null,
            pdf_url: null,
        },
    ],
}

