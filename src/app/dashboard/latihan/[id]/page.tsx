"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, ArrowLeft, ArrowRight, Loader2, BatteryWarning } from "lucide-react"

export default function LatihanDetailPage() {
    const params = useParams()
    const router = useRouter()
    const validId = typeof params?.id === "string" ? params.id : null

    const [latihan, setLatihan] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!validId) return

        const fetchLatihanDetails = async () => {
            try {
                // We use the same public API; since it's just fetching the details, we can reuse it
                // Actually, the tryout get detail API doesn't exist publicly in a simple form. 
                // Let's create one or use a direct supabase query on the client.
                // Wait, if we use supabase client, we can fetch it directly.
                const { createClient } = await import("@/lib/supabase/client")
                const supabase = createClient()

                const { data, error } = await supabase
                    .from("tryouts")
                    .select("*, tryout_questions(count)")
                    .eq("id", validId)
                    .eq("is_practice", true)
                    .single()

                if (error || !data) {
                    throw new Error("Latihan tidak ditemukan.")
                }

                setLatihan({
                    ...data,
                    questionCount: data.tryout_questions?.[0]?.count || 0
                })
            } catch (err: any) {
                console.error("Fetch error:", err)
                setError(err.message || "Gagal memuat detail latihan.")
            } finally {
                setLoading(false)
            }
        }

        fetchLatihanDetails()
    }, [validId])

    if (!validId) return null

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Memuat detail latihan...</p>
            </div>
        )
    }

    if (error || !latihan) {
        return (
            <div className="space-y-6">
                <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Kembali
                </Button>
                <Card className="border-red-200 bg-red-50/50">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                            <FileText className="w-8 h-8 text-red-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-red-900 mb-2">Latihan Tidak Ditemukan</h3>
                        <p className="text-sm text-red-600/80 mb-6 max-w-md">
                            {error || "Latihan soal yang Anda cari tidak tersedia."}
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <Button variant="ghost" asChild className="mb-2 text-muted-foreground hover:text-foreground">
                <Link href="/dashboard/latihan">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Kembali ke Daftar Latihan
                </Link>
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border-warm-gray/60 shadow-sm">
                    <CardHeader className="border-b border-warm-gray/30 bg-warm-beige/10 pb-6">
                        <div className="flex justify-between items-start gap-4">
                            <div>
                                <Badge variant="secondary" className="mb-3 bg-earthy-gold/20 text-earthy-gold hover:bg-earthy-gold/30">
                                    {latihan.category || "Semua Materi"}
                                </Badge>
                                <CardTitle className="text-2xl font-bold text-foreground">
                                    {latihan.title}
                                </CardTitle>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 text-muted-foreground space-y-4">
                        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                            Deskripsi Latihan
                        </h3>
                        <p className="leading-relaxed">
                            {latihan.description || "Tidak ada deskripsi untuk latihan soal ini."}
                        </p>

                        <div className="mt-8 bg-cream p-4 rounded-lg border border-warm-gray/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <BatteryWarning className="w-10 h-10 text-earthy-gold" />
                                <div>
                                    <p className="font-semibold text-foreground">Siap berlatih?</p>
                                    <p className="text-xs text-muted-foreground">Tidak ada batas waktu. Pelajari pembahasannya.</p>
                                </div>
                            </div>
                            <Button 
                                asChild
                                className="w-full sm:w-auto bg-dark-brown hover:bg-soft-brown text-cream shadow-sm transition-all hover:scale-[1.02]"
                            >
                                <Link href={`/dashboard/latihan/${validId}/practice`}>
                                    Mulai Latihan
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="border-warm-gray/60 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Informasi Modul</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-warm-beige/50 flex items-center justify-center shrink-0">
                                    <FileText className="w-4 h-4 text-soft-brown" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-foreground">Total Soal</p>
                                    <p className="text-sm text-muted-foreground">{latihan.questionCount} Butir</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-warm-beige/50 flex items-center justify-center shrink-0">
                                    <BatteryWarning className="w-4 h-4 text-soft-brown" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-foreground">Tipe Penilaian</p>
                                    <p className="text-sm text-muted-foreground">Pembahasan interaktif langsung</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
