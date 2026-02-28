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
    Lock,
    Unlock,
} from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { getPackageFeatures } from "@/lib/package-features"
import { PackageType } from "@prisma/client"

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()

    let dbUser = null
    if (authUser) {
        const { data } = await supabase
            .from("users")
            .select("package_type, tryout_attempt_used, role")
            .eq("auth_id", authUser.id)
            .single()

        dbUser = data
    }

    const packageType = (dbUser?.package_type as PackageType) || null
    const tryoutAttemptUsed = dbUser?.tryout_attempt_used || 0
    const features = getPackageFeatures(packageType, dbUser?.role)

    // Remaining Tryout Quotas
    const remainingTryouts = Math.max(0, features.tryoutLimit - tryoutAttemptUsed)
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

            {/* Quick actions & Package specifics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Dynamically Replaced Available Tryouts based on Package */}
                {!features.canAccessTryout ? (
                    <Card className="border-warm-gray/60 bg-warm-gray/10">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg text-muted-foreground flex items-center gap-2">
                                <Lock className="w-4 h-4" /> Tryout Terkunci
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center justify-center py-6 text-center">
                                <div className="w-12 h-12 rounded-full bg-warm-gray/20 flex items-center justify-center mb-3">
                                    <FileText className="w-6 h-6 text-muted-foreground/50" />
                                </div>
                                <p className="text-sm font-medium text-foreground mb-1">
                                    Fitur TryOut tidak tersedia di paket ini.
                                </p>
                                <p className="text-xs text-muted-foreground mb-4">
                                    Upgrade ke Berotak Senku Mode untuk membuka akses TryOut.
                                </p>
                                <Button variant="outline" className="w-full text-xs" asChild>
                                    <a href="https://wa.me/6281234567890?text=Halo%20Admin%2C%20saya%20ingin%20upgrade%20paket%20ke%20Senku%20Mode" target="_blank" rel="noopener noreferrer">
                                        Upgrade Sekarang
                                    </a>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : packageType === "SENKU" || packageType === "EINSTEIN" ? (
                    <Card className="border-earthy-gold/50 shadow-sm shadow-earthy-gold/10">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Unlock className="w-4 h-4 text-earthy-gold" /> Kuota Tryout
                            </CardTitle>
                            <Badge variant={remainingTryouts > 0 ? "default" : "destructive"}>
                                {remainingTryouts} Tersisa
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center justify-center py-6 text-center">
                                <div className="w-12 h-12 rounded-full bg-earthy-gold/20 flex items-center justify-center mb-3">
                                    <FileText className="w-6 h-6 text-earthy-gold" />
                                </div>
                                {remainingTryouts === 0 ? (
                                    <>
                                        <p className="text-sm font-medium text-destructive mb-1">
                                            Kuota TryOut telah habis.
                                        </p>
                                        <p className="text-xs text-muted-foreground mb-4">
                                            {packageType === "SENKU" ? "Upgrade ke Einstein Mode untuk tambahan kuota!" : "Hubungi admin untuk menambah kuota Tryout kamu."}
                                        </p>
                                        <Button variant="outline" className="w-full text-xs" asChild>
                                            <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer">
                                                {packageType === "SENKU" ? "Upgrade Sekarang" : "Hubungi Admin"}
                                            </a>
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-sm font-medium text-foreground mb-1">
                                            Kamu memiliki {remainingTryouts} kuota tryout.
                                        </p>
                                        <p className="text-xs text-muted-foreground mb-4">
                                            Persiapkan dirimu dan mulai ujian simulasi sekarang.
                                        </p>
                                        <Button className="w-full text-xs bg-dark-brown text-cream hover:bg-soft-brown" asChild>
                                            <Link href="/dashboard/tryouts">Mulai Tryout</Link>
                                        </Button>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="border-warm-gray/60">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
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
                )}

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
