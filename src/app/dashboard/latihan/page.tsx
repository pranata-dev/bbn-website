"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, BatteryWarning, ArrowRight, Loader2 } from "lucide-react"
import { CATEGORY_LABELS, QuestionCategory } from "@/types"

interface LatihanItem {
    id: string
    title: string
    description: string | null
    category: QuestionCategory | null
    status: string
    is_practice: boolean
    created_at: string
    tryout_questions: { count: number }[]
}

import { useSubject } from "@/contexts/SubjectContext"

export default function LatihanPage() {
    const [latihans, setLatihans] = useState<LatihanItem[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<string>("all")
    const { selectedSubject } = useSubject()

    useEffect(() => {
        fetchLatihan()
    }, [selectedSubject])

    const fetchLatihan = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/tryouts?subject=${selectedSubject}`)
            const data = await res.json()
            // Filter strictly for practice questions
            const practiceItems = (data.tryouts || []).filter((t: any) => t.is_practice)
            setLatihans(practiceItems)
        } catch (error) {
            console.error("Failed to fetch latihan:", error)
        } finally {
            setLoading(false)
        }
    }

    const filteredLatihans = filter === "all"
        ? latihans
        : latihans.filter((t) => t.category === filter)

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Latihan Soal</h1>
                    <p className="text-muted-foreground">Kumpulan soal untuk melatih pemahaman konsep Fisikamu.</p>
                </div>
                <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-[200px] bg-white border-warm-gray">
                        <SelectValue placeholder="Filter kategori" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua Kategori</SelectItem>
                        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Mini Statistic Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="border-warm-gray/60 bg-cream">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Latihan</p>
                            <h3 className="text-2xl font-bold text-foreground">{latihans.length}</h3>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-warm-beige flex items-center justify-center">
                            <FileText className="w-5 h-5 text-dark-brown" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-warm-gray/60 bg-cream">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Week 1–4</p>
                            <h3 className="text-2xl font-bold text-foreground">
                                {latihans.filter(t => t.category && ["WEEK_1", "WEEK_2", "WEEK_3", "WEEK_4"].includes(t.category)).length}
                            </h3>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-earthy-green/20 flex items-center justify-center">
                            <ArrowRight className="w-5 h-5 text-earthy-green" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-warm-gray/60 bg-cream">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Week 5–7</p>
                            <h3 className="text-2xl font-bold text-foreground">
                                {latihans.filter(t => t.category && ["WEEK_5", "WEEK_6", "WEEK_7"].includes(t.category)).length}
                            </h3>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-earthy-gold/20 flex items-center justify-center">
                            <ArrowRight className="w-5 h-5 text-earthy-gold" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
            ) : selectedSubject === "FISMAT" ? (
                <Card className="border-warm-gray/60">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-16 h-16 rounded-full bg-warm-beige flex items-center justify-center mb-4">
                            <FileText className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">Coming Soon!</h3>
                        <p className="text-sm text-muted-foreground max-w-lg">
                            Latihan Soal Fisika Matematika sedang dipersiapkan oleh tim kami. Kami akan segera hadir dengan konten berkualitas untuk membantumu belajar!
                        </p>
                    </CardContent>
                </Card>
            ) : filteredLatihans.length === 0 ? (
                <Card className="border-warm-gray/60">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-16 h-16 rounded-full bg-warm-beige flex items-center justify-center mb-4">
                            <BatteryWarning className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">Belum Ada Latihan Soal</h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                            Bank latihan soal sedang disusun oleh tim akademik kami. Segera kembali untuk mencoba tantangan baru!
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredLatihans.map((latihan) => (
                        <Card
                            key={latihan.id}
                            className="border-warm-gray/60 hover:shadow-md hover:border-soft-brown/30 transition-all"
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <Badge variant="secondary" className="mb-2 bg-warm-beige text-soft-brown text-xs whitespace-normal h-auto text-left">
                                            {latihan.category
                                                ? CATEGORY_LABELS[latihan.category]
                                                : "Semua Materi"}
                                        </Badge>
                                        <CardTitle className="text-lg">{latihan.title}</CardTitle>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {latihan.description && (
                                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                        {latihan.description}
                                    </p>
                                )}
                                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                                    <div className="flex items-center gap-1">
                                        <FileText className="w-3.5 h-3.5" />
                                        <span>{latihan.tryout_questions?.[0]?.count || 0} soal</span>
                                    </div>
                                </div>
                                <Button
                                    asChild
                                    className="w-full bg-dark-brown hover:bg-soft-brown text-cream"
                                    size="sm"
                                >
                                    <Link href={`/dashboard/latihan/${latihan.id}`}>
                                        Masuk Latihan
                                        <ArrowRight className="ml-2 w-4 h-4" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
