"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Trophy } from "lucide-react"

export default function AdminLeaderboardPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Leaderboard</h1>
                <p className="text-muted-foreground">Lihat peringkat semua peserta.</p>
            </div>

            <Card className="border-warm-gray/60">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <Trophy className="w-8 h-8 text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">
                        Data leaderboard akan muncul setelah ada peserta yang menyelesaikan tryout.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
