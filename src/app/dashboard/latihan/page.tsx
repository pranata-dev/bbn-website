"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BatteryWarning, FileText, ArrowRight } from "lucide-react"

export default function LatihanPage() {
    // Placeholder data since we don't have a real latihan API hook yet
    const placeholderLatihanCount = 10
    const listrikCount = 6
    const optikaCount = 4

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Latihan Soal</h1>
                    <p className="text-muted-foreground">Kumpulan soal untuk melatih pemahaman konsep Fisikamu.</p>
                </div>
            </div>

            {/* Mini Statistic Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="border-warm-gray/60 bg-cream">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Latihan</p>
                            <h3 className="text-2xl font-bold text-foreground">{placeholderLatihanCount}</h3>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-warm-beige flex items-center justify-center">
                            <FileText className="w-5 h-5 text-dark-brown" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-warm-gray/60 bg-cream">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Listrik & Magnet</p>
                            <h3 className="text-2xl font-bold text-foreground">{listrikCount}</h3>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-earthy-green/20 flex items-center justify-center">
                            <ArrowRight className="w-5 h-5 text-earthy-green" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-warm-gray/60 bg-cream">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Optika & Gelombang</p>
                            <h3 className="text-2xl font-bold text-foreground">{optikaCount}</h3>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-earthy-gold/20 flex items-center justify-center">
                            <ArrowRight className="w-5 h-5 text-earthy-gold" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Content Area Placeholder */}
            <Card className="border-warm-gray/60 mt-8">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 rounded-full bg-warm-beige flex items-center justify-center mb-4">
                        <BatteryWarning className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Modul Sedang Dipersiapkan</h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                        Bank latihan soal sedang disusun oleh tim akademik kami. Segera kembali untuk mencoba tantangan baru!
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
