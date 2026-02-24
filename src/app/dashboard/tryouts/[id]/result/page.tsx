"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trophy, Target, CheckCircle, ArrowRight, Home } from "lucide-react"

export default function TryoutResultPage() {
    const searchParams = useSearchParams()
    const score = parseFloat(searchParams.get("score") || "0")
    const correct = parseInt(searchParams.get("correct") || "0")
    const total = parseInt(searchParams.get("total") || "0")

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-earthy-green"
        if (score >= 60) return "text-earthy-gold"
        if (score >= 40) return "text-amber-600"
        return "text-red-500"
    }

    const getScoreMessage = (score: number) => {
        if (score >= 80) return "Luar biasa! 🎉"
        if (score >= 60) return "Bagus, terus tingkatkan! 👍"
        if (score >= 40) return "Cukup, perlu latihan lagi. 💪"
        return "Jangan menyerah, terus belajar! 📚"
    }

    return (
        <div className="max-w-lg mx-auto space-y-6">
            <Card className="border-warm-gray/60 shadow-lg text-center overflow-hidden">
                {/* Score header */}
                <div className="bg-dark-brown p-8">
                    <div className="w-16 h-16 rounded-full bg-cream/15 flex items-center justify-center mx-auto mb-4">
                        <Trophy className="w-8 h-8 text-cream" />
                    </div>
                    <h2 className="text-xl font-bold text-cream mb-2">Tryout Selesai!</h2>
                    <p className="text-cream/70 text-sm">{getScoreMessage(score)}</p>
                </div>

                <CardContent className="p-8 space-y-6">
                    {/* Score display */}
                    <div>
                        <p className="text-sm text-muted-foreground mb-1">Skor Kamu</p>
                        <p className={`text-5xl font-bold ${getScoreColor(score)}`}>{score}%</p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-warm-beige">
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <CheckCircle className="w-4 h-4 text-earthy-green" />
                                <span className="text-sm text-muted-foreground">Benar</span>
                            </div>
                            <p className="text-xl font-bold text-foreground">
                                {correct}/{total}
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-warm-beige">
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <Target className="w-4 h-4 text-soft-brown" />
                                <span className="text-sm text-muted-foreground">Akurasi</span>
                            </div>
                            <p className="text-xl font-bold text-foreground">
                                {total > 0 ? Math.round((correct / total) * 100) : 0}%
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3 pt-2">
                        <Button asChild className="bg-dark-brown hover:bg-soft-brown text-cream">
                            <Link href="/dashboard/leaderboard">
                                <Trophy className="mr-2 w-4 h-4" />
                                Lihat Leaderboard
                            </Link>
                        </Button>
                        <Button variant="outline" asChild className="border-warm-gray">
                            <Link href="/dashboard">
                                <Home className="mr-2 w-4 h-4" />
                                Kembali ke Dashboard
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
