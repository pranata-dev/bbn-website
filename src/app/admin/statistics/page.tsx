"use client"

import { Card, CardContent } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"

export default function AdminStatisticsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Statistik</h1>
                <p className="text-muted-foreground">Statistik penggunaan platform.</p>
            </div>

            <Card className="border-warm-gray/60">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <BarChart3 className="w-8 h-8 text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">
                        Data statistik akan muncul setelah ada aktivitas di platform.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
