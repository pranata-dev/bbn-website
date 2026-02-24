"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Clock, Users, ArrowRight, Loader2 } from "lucide-react"
import { CATEGORY_LABELS } from "@/types"
import type { QuestionCategory } from "@/types"

interface TryoutItem {
    id: string
    title: string
    description: string | null
    category: QuestionCategory
    duration: number
    status: string
    created_at: string
    tryout_questions: { count: number }[]
}

export default function TryoutsPage() {
    const [tryouts, setTryouts] = useState<TryoutItem[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<string>("all")

    useEffect(() => {
        fetchTryouts()
    }, [])

    const fetchTryouts = async () => {
        try {
            const res = await fetch("/api/tryouts")
            const data = await res.json()
            setTryouts(data.tryouts || [])
        } catch (error) {
            console.error("Failed to fetch tryouts:", error)
        } finally {
            setLoading(false)
        }
    }

    const filteredTryouts = filter === "all"
        ? tryouts
        : tryouts.filter((t) => t.category === filter)

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Tryout</h1>
                    <p className="text-muted-foreground">Pilih dan kerjakan tryout yang tersedia.</p>
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

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
            ) : filteredTryouts.length === 0 ? (
                <Card className="border-warm-gray/60">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-16 h-16 rounded-full bg-warm-beige flex items-center justify-center mb-4">
                            <FileText className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">Belum Ada Tryout</h3>
                        <p className="text-sm text-muted-foreground">
                            Belum ada tryout aktif saat ini. Cek kembali nanti!
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredTryouts.map((tryout) => (
                        <Card
                            key={tryout.id}
                            className="border-warm-gray/60 hover:shadow-md hover:border-soft-brown/30 transition-all"
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <Badge variant="secondary" className="mb-2 bg-warm-beige text-soft-brown text-xs">
                                            {CATEGORY_LABELS[tryout.category]}
                                        </Badge>
                                        <CardTitle className="text-lg">{tryout.title}</CardTitle>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {tryout.description && (
                                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                        {tryout.description}
                                    </p>
                                )}
                                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span>{tryout.duration} menit</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <FileText className="w-3.5 h-3.5" />
                                        <span>{tryout.tryout_questions?.[0]?.count || 0} soal</span>
                                    </div>
                                </div>
                                <Button
                                    asChild
                                    className="w-full bg-dark-brown hover:bg-soft-brown text-cream"
                                    size="sm"
                                >
                                    <Link href={`/dashboard/tryouts/${tryout.id}`}>
                                        Mulai Tryout
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
