"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { History, Clock, Target, FileText } from "lucide-react"

export default function HistoryPage() {
    // In production, this would fetch from API
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Riwayat Tryout</h1>
                <p className="text-muted-foreground">Lihat semua tryout yang pernah kamu kerjakan.</p>
            </div>

            <Card className="border-warm-gray/60">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 rounded-full bg-warm-beige flex items-center justify-center mb-4">
                        <History className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Belum Ada Riwayat</h3>
                    <p className="text-sm text-muted-foreground">
                        Riwayat tryout akan muncul di sini setelah kamu menyelesaikan tryout pertama.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
