"use client"

import { Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowLeft, Clock, GraduationCap, Rocket } from "lucide-react"
import { APP_NAME } from "@/constants"

function SuccessContent() {
    const searchParams = useSearchParams()
    const type = searchParams.get("type")

    const isRegular = type === "REGULAR"
    const Icon = isRegular ? GraduationCap : Rocket

    return (
        <div className="min-h-screen bg-cream flex items-center justify-center p-4">
            <div className="w-full max-w-md text-center">
                <Card className="border-warm-gray/60 shadow-lg shadow-soft-brown/5">
                    <CardHeader className="space-y-4">
                        <div className="mx-auto w-16 h-16 rounded-full bg-earthy-green/10 flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-earthy-green" />
                        </div>
                        <CardTitle className="text-xl font-bold text-foreground">
                            Pendaftaran Berhasil!
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Product type badge */}
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-warm-beige border border-warm-gray/60">
                            <Icon className="w-4 h-4 text-soft-brown" />
                            <span className="text-sm font-medium text-foreground">
                                {isRegular ? "Kelas Reguler" : "Persiapan UTS"}
                            </span>
                        </div>

                        <div className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                Terima kasih sudah mendaftar di {APP_NAME}.
                            </p>
                            <div className="flex items-start gap-3 p-4 rounded-xl bg-warm-beige border border-warm-gray/60 text-left">
                                <Clock className="w-5 h-5 text-soft-brown mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-foreground">Menunggu Verifikasi</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Admin akan memverifikasi pembayaranmu dalam 1x24 jam.
                                        {isRegular
                                            ? " Kamu akan dihubungi via WhatsApp untuk konfirmasi jadwal."
                                            : " Kamu akan menerima email aktivasi setelah pembayaran disetujui."
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Button variant="outline" asChild className="w-full border-warm-gray">
                            <Link href="/">
                                <ArrowLeft className="mr-2 w-4 h-4" />
                                Kembali ke Beranda
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default function RegisterSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-cream flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Memuat...</div>
            </div>
        }>
            <SuccessContent />
        </Suspense>
    )
}
