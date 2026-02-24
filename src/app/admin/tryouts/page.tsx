"use client"

import { Card, CardContent } from "@/components/ui/card"
import { FileText, Loader2 } from "lucide-react"

export default function AdminTryoutsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Manajemen Tryout</h1>
                <p className="text-muted-foreground">Buat dan kelola tryout.</p>
            </div>

            <Card className="border-warm-gray/60">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <FileText className="w-8 h-8 text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">
                        Buat tryout dari menu ini setelah menambahkan soal ke bank soal.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
