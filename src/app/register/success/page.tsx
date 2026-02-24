import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowLeft, Clock } from "lucide-react"
import { APP_NAME } from "@/constants"

export default function RegisterSuccessPage() {
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
                                        Kamu akan menerima email aktivasi setelah pembayaran disetujui.
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
