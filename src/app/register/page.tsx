"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Upload, Loader2, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { APP_NAME, MAX_FILE_SIZE, ACCEPTED_IMAGE_TYPES } from "@/constants"

export default function RegisterPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
    })
    const [paymentProof, setPaymentProof] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
            toast.error("Format file tidak didukung. Gunakan JPG, PNG, atau WebP.")
            return
        }

        if (file.size > MAX_FILE_SIZE) {
            toast.error("Ukuran file maksimal 5MB.")
            return
        }

        setPaymentProof(file)
        setPreviewUrl(URL.createObjectURL(file))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name || !formData.email) {
            toast.error("Mohon isi semua field yang diperlukan.")
            return
        }

        if (!paymentProof) {
            toast.error("Mohon unggah bukti pembayaran.")
            return
        }

        setIsLoading(true)

        try {
            const formPayload = new FormData()
            formPayload.append("name", formData.name)
            formPayload.append("email", formData.email)
            formPayload.append("paymentProof", paymentProof)

            const response = await fetch("/api/auth/register", {
                method: "POST",
                body: formPayload,
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Terjadi kesalahan saat mendaftar.")
            }

            toast.success("Pendaftaran berhasil! Silakan tunggu verifikasi admin.")
            router.push("/register/success")
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Terjadi kesalahan.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-cream flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute top-20 right-20 w-72 h-72 bg-earthy-gold/10 rounded-full blur-3xl" />
                <div className="absolute bottom-20 left-20 w-96 h-96 bg-soft-brown/8 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md">
                {/* Back link */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Kembali ke beranda
                </Link>

                <Card className="border-warm-gray/60 shadow-lg shadow-soft-brown/5">
                    <CardHeader className="text-center space-y-4">
                        <div className="mx-auto w-12 h-12 rounded-xl bg-dark-brown flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-cream" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold text-foreground">Daftar Akun</CardTitle>
                            <CardDescription className="text-muted-foreground">
                                Bergabung dengan {APP_NAME} dan mulai persiapan ujianmu.
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nama Lengkap</Label>
                                <Input
                                    id="name"
                                    placeholder="Masukkan nama lengkap"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="bg-warm-beige/30 border-warm-gray"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="nama@email.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="bg-warm-beige/30 border-warm-gray"
                                    required
                                />
                            </div>

                            {/* Payment proof upload */}
                            <div className="space-y-2">
                                <Label htmlFor="payment-proof">Bukti Pembayaran</Label>
                                <div className="relative">
                                    <input
                                        id="payment-proof"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    <label
                                        htmlFor="payment-proof"
                                        className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-warm-gray rounded-xl cursor-pointer hover:border-soft-brown/50 transition-colors bg-warm-beige/20"
                                    >
                                        {previewUrl ? (
                                            <img
                                                src={previewUrl}
                                                alt="Preview"
                                                className="h-full w-full object-contain rounded-xl p-2"
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                <Upload className="w-8 h-8" />
                                                <span className="text-sm">Klik untuk unggah bukti transfer</span>
                                                <span className="text-xs">JPG, PNG, WebP (max 5MB)</span>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-dark-brown hover:bg-soft-brown text-cream h-11"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Mendaftar...
                                    </>
                                ) : (
                                    "Daftar Sekarang"
                                )}
                            </Button>

                            <p className="text-center text-sm text-muted-foreground">
                                Sudah punya akun?{" "}
                                <Link href="/login" className="text-dark-brown font-medium hover:underline">
                                    Masuk
                                </Link>
                            </p>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
