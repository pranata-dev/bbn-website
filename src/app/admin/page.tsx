import { Card, CardContent } from "@/components/ui/card"
import { Users, CreditCard, FileText, HelpCircle, TrendingUp, Trophy } from "lucide-react"

export default function AdminDashboardPage() {
    const stats = [
        { label: "Total Pengguna", value: "0", icon: Users, change: "" },
        { label: "Menunggu Verifikasi", value: "0", icon: CreditCard, change: "" },
        { label: "Total Tryout", value: "0", icon: FileText, change: "" },
        { label: "Total Soal", value: "0", icon: HelpCircle, change: "" },
    ]

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-muted-foreground">Kelola platform Belajar Bareng Nata.</p>
            </div>

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
                                    <stat.icon className="w-5 h-5 text-dark-brown" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-warm-gray/60">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <TrendingUp className="w-8 h-8 text-muted-foreground mb-3" />
                        <p className="text-sm text-muted-foreground">
                            Grafik statistik akan muncul setelah ada data aktivitas.
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-warm-gray/60">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <Trophy className="w-8 h-8 text-muted-foreground mb-3" />
                        <p className="text-sm text-muted-foreground">
                            Top performers akan tampil di sini.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
