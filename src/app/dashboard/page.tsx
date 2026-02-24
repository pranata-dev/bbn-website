import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
    FileText,
    Trophy,
    Target,
    TrendingUp,
    ArrowRight,
    Clock,
} from "lucide-react"

export default function DashboardPage() {
    // These would be fetched from API in production
    const stats = [
        { label: "Tryout Selesai", value: "0", icon: FileText, color: "text-dark-brown" },
        { label: "Rata-rata Skor", value: "0%", icon: Target, color: "text-earthy-green" },
        { label: "Skor Tertinggi", value: "0%", icon: TrendingUp, color: "text-earthy-gold" },
        { label: "Peringkat", value: "-", icon: Trophy, color: "text-soft-brown" },
    ]

    return (
        <div className="space-y-8">
            {/* Welcome header */}
            <div>
                <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                <p className="text-muted-foreground">
                    Selamat datang kembali! Pantau progres belajarmu di sini.
                </p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <Card key={stat.label} className="border-warm-gray/60 hover:shadow-md transition-shadow">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                                    <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-warm-beige flex items-center justify-center">
                                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Available tryouts */}
                <Card className="border-warm-gray/60">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">Tryout Tersedia</CardTitle>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/dashboard/tryouts">
                                Lihat Semua
                                <ArrowRight className="ml-1 w-4 h-4" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <div className="w-12 h-12 rounded-full bg-warm-beige flex items-center justify-center mb-3">
                                <FileText className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Belum ada tryout aktif. Cek kembali nanti!
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent activity */}
                <Card className="border-warm-gray/60">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">Aktivitas Terakhir</CardTitle>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/dashboard/history">
                                Lihat Semua
                                <ArrowRight className="ml-1 w-4 h-4" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <div className="w-12 h-12 rounded-full bg-warm-beige flex items-center justify-center mb-3">
                                <Clock className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Belum ada aktivitas. Mulai tryout pertamamu!
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Performance overview placeholder */}
            <Card className="border-warm-gray/60">
                <CardHeader>
                    <CardTitle className="text-lg">Analisis Performa Per Materi</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-warm-beige flex items-center justify-center mb-4">
                            <TrendingUp className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground">
                            Data analisis akan muncul setelah kamu menyelesaikan tryout.
                        </p>
                        <Button asChild className="mt-4 bg-dark-brown hover:bg-soft-brown text-cream">
                            <Link href="/dashboard/tryouts">Mulai Tryout</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
