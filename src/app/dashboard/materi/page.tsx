"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileDown, BookOpen, Clock, Layers } from "lucide-react"

// Types for the placeholder data
interface Material {
    id: string
    title: string
    description: string
    category: string
    size: string
    pages: number
    dateAdded: string
    downloadUrl: string // URL to actual PDF file
}

const PLACEHOLDER_MATERIALS: Material[] = [
    {
        id: "mat-001",
        title: "Modul 1: Listrik Statis dan Hukum Coulomb",
        description: "Materi pengantar kelistrikan mencakup muatan listrik, Hukum Coulomb, dan medan listrik titik muatan.",
        category: "Listrik & Magnet",
        size: "2.4 MB",
        pages: 15,
        dateAdded: "2024-02-15",
        downloadUrl: "#", // Replace with real PDF url
    },
    {
        id: "mat-002",
        title: "Modul 2: Hukum Gauss & Potensial Listrik",
        description: "Pembahasan mendalam tentang fluks listrik, aplikasi Hukum Gauss, dan perhitungan energi potensial.",
        category: "Listrik & Magnet",
        size: "3.1 MB",
        pages: 22,
        dateAdded: "2024-02-22",
        downloadUrl: "#",
    },
    {
        id: "mat-003",
        title: "Modul 3: Kapasitansi dan Dielektrik",
        description: "Analisis rangkaian kapasitor seri/paralel, energi tersimpan, dan efek bahan dielektrik.",
        category: "Listrik & Magnet",
        size: "1.8 MB",
        pages: 12,
        dateAdded: "2024-03-01",
        downloadUrl: "#",
    },
    {
        id: "mat-004",
        title: "Modul 4: Optika Geometri",
        description: "Prinsip pemantulan, pembiasan, cermin, dan lensa tipis beserta pembentukan bayangan.",
        category: "Optika & Gelombang",
        size: "4.5 MB",
        pages: 28,
        dateAdded: "2024-03-10",
        downloadUrl: "#",
    },
]

export default function MaterialsPage() {

    // In the future:
    // const handleDownload = (url: string) => {
    //    window.open(url, "_blank")
    // }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Materi Belajar</h1>
                    <p className="text-muted-foreground">Unduh modul dan rangkuman materi Fisika Dasar.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {PLACEHOLDER_MATERIALS.map((material) => (
                    <Card key={material.id} className="border-warm-gray/60 hover:shadow-md hover:border-soft-brown/30 transition-all">
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start gap-4">
                                <div>
                                    <Badge variant="secondary" className="mb-2 bg-warm-beige text-soft-brown text-xs">
                                        {material.category}
                                    </Badge>
                                    <CardTitle className="text-lg leading-tight uppercase tracking-tight">{material.title}</CardTitle>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-orange-100/50 flex items-center justify-center shrink-0">
                                    <BookOpen className="w-5 h-5 text-orange-600" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col h-full">
                                <p className="text-sm text-muted-foreground mb-6 line-clamp-2">
                                    {material.description}
                                </p>

                                <div className="flex items-center justify-between mt-auto">
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1.5">
                                            <Layers className="w-3.5 h-3.5" />
                                            <span>{material.pages} Halaman</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <FileDown className="w-3.5 h-3.5" />
                                            <span>{material.size}</span>
                                        </div>
                                    </div>

                                    {/* Using an anchor tag with download attribute for native PDF downloads */}
                                    <Button
                                        asChild
                                        size="sm"
                                        className="bg-dark-brown hover:bg-soft-brown text-white"
                                    >
                                        <a href={material.downloadUrl} download>
                                            Unduh PDF
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {PLACEHOLDER_MATERIALS.length === 0 && (
                <Card className="border-warm-gray/60 mt-8">
                    <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 rounded-full bg-warm-beige flex items-center justify-center mb-4">
                            <BookOpen className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">Belum Ada Materi</h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                            Modul pembelajaran sedang dalam tahap penyusunan dan akan segera tersedia.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
