"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Loader2, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { APP_NAME } from "@/constants"
import {
    ProductSelector,
    RegularClassForm,
    UTSPackageForm,
} from "@/components/register"
import type { RegularClassFormState } from "@/components/register"
import type { UTSPackageFormState } from "@/components/register"
import type { RegistrationType } from "@/lib/validators/registration"
import { WHATSAPP_REGEX } from "@/constants"

const initialRegularData: RegularClassFormState = {
    name: "",
    nim: "",
    subject: "",
    groupSize: 1,
    sessionCount: 1,
    scheduledDate: "",
    scheduledTime: "",
    whatsapp: "",
    notes: "",
}

const initialUTSData: UTSPackageFormState = {
    name: "",
    nim: "",
    subject: "",
    packageType: "",
    whatsapp: "",
}

export default function RegisterPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const isSubmittingRef = useRef(false)
    const [selectedType, setSelectedType] = useState<RegistrationType | null>(null)

    // Form states
    const [regularData, setRegularData] = useState<RegularClassFormState>(initialRegularData)
    const [utsData, setUTSData] = useState<UTSPackageFormState>(initialUTSData)

    // Payment file states
    const [paymentFile, setPaymentFile] = useState<File | null>(null)
    const [paymentPreview, setPaymentPreview] = useState<string | null>(null)

    const handlePaymentChange = (file: File | null, preview: string | null) => {
        setPaymentFile(file)
        setPaymentPreview(preview)
    }

    const handleProductSelect = (type: RegistrationType) => {
        setSelectedType(type)
        // Reset payment when switching types
        if (paymentPreview) URL.revokeObjectURL(paymentPreview)
        setPaymentFile(null)
        setPaymentPreview(null)
    }

    const validateRegular = (): boolean => {
        if (!regularData.name || regularData.name.length < 3) {
            toast.error("Nama minimal 3 karakter.")
            return false
        }
        if (!regularData.nim || regularData.nim.length < 5) {
            toast.error("NIM minimal 5 karakter.")
            return false
        }
        if (!regularData.subject) {
            toast.error("Pilih mata kuliah.")
            return false
        }
        if (regularData.groupSize < 1) {
            toast.error("Jumlah orang minimal 1.")
            return false
        }
        if (regularData.sessionCount < 1) {
            toast.error("Jumlah pertemuan minimal 1.")
            return false
        }
        if (!regularData.scheduledDate) {
            toast.error("Pilih tanggal kelas.")
            return false
        }
        if (!regularData.scheduledTime) {
            toast.error("Pilih waktu kelas.")
            return false
        }
        if (!WHATSAPP_REGEX.test(regularData.whatsapp)) {
            toast.error("Format nomor WhatsApp tidak valid.")
            return false
        }
        if (!paymentFile) {
            toast.error("Mohon unggah bukti pembayaran.")
            return false
        }
        return true
    }

    const validateUTS = (): boolean => {
        if (!utsData.name || utsData.name.length < 3) {
            toast.error("Nama minimal 3 karakter.")
            return false
        }
        if (!utsData.nim || utsData.nim.length < 5) {
            toast.error("NIM minimal 5 karakter.")
            return false
        }
        if (!utsData.subject) {
            toast.error("Pilih mata kuliah.")
            return false
        }
        if (!utsData.packageType) {
            toast.error("Pilih tipe paket.")
            return false
        }
        if (!WHATSAPP_REGEX.test(utsData.whatsapp)) {
            toast.error("Format nomor WhatsApp tidak valid.")
            return false
        }
        if (!paymentFile) {
            toast.error("Mohon unggah bukti pembayaran.")
            return false
        }
        return true
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Prevent double-click submission
        if (isSubmittingRef.current) return
        isSubmittingRef.current = true

        if (!selectedType) {
            toast.error("Pilih jenis layanan terlebih dahulu.")
            isSubmittingRef.current = false
            return
        }

        // Validate based on type
        if (selectedType === "REGULAR" && !validateRegular()) {
            isSubmittingRef.current = false
            return
        }
        if (selectedType === "UTS" && !validateUTS()) {
            isSubmittingRef.current = false
            return
        }

        setIsLoading(true)

        try {
            const formPayload = new FormData()
            formPayload.append("type", selectedType)
            formPayload.append("paymentProof", paymentFile!)

            if (selectedType === "REGULAR") {
                formPayload.append("name", regularData.name)
                formPayload.append("nim", regularData.nim)
                formPayload.append("subject", regularData.subject)
                formPayload.append("whatsapp", regularData.whatsapp)
                formPayload.append("groupSize", String(regularData.groupSize))
                formPayload.append("sessionCount", String(regularData.sessionCount))
                formPayload.append("scheduledDate", regularData.scheduledDate)
                formPayload.append("scheduledTime", regularData.scheduledTime)
                formPayload.append("notes", regularData.notes)
            } else {
                formPayload.append("name", utsData.name)
                formPayload.append("nim", utsData.nim)
                formPayload.append("subject", utsData.subject)
                formPayload.append("whatsapp", utsData.whatsapp)
                formPayload.append("packageType", utsData.packageType)
            }

            const response = await fetch("/api/register", {
                method: "POST",
                body: formPayload,
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Terjadi kesalahan saat mendaftar.")
            }

            toast.success("Pendaftaran berhasil! Silakan tunggu verifikasi admin.")
            router.push(`/register/success?type=${selectedType}`)
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Terjadi kesalahan.")
        } finally {
            setIsLoading(false)
            isSubmittingRef.current = false
        }
    }

    return (
        <div className="min-h-screen bg-cream flex items-center justify-center p-4 py-12">
            {/* Background decoration */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute top-20 right-20 w-72 h-72 bg-earthy-gold/10 rounded-full blur-3xl" />
                <div className="absolute bottom-20 left-20 w-96 h-96 bg-soft-brown/8 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-2xl">
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
                            <CardTitle className="text-xl font-bold text-foreground">Daftar Sekarang</CardTitle>
                            <CardDescription className="text-muted-foreground">
                                Pilih layanan yang sesuai dengan kebutuhanmu di {APP_NAME}.
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6" aria-label="Formulir pendaftaran">
                            {/* Step 1: Product Selection */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-dark-brown text-cream text-xs font-bold flex items-center justify-center">1</span>
                                    <p className="text-sm font-medium text-foreground">
                                        Pilih Layanan
                                    </p>
                                </div>
                                <ProductSelector
                                    selected={selectedType}
                                    onSelect={handleProductSelect}
                                />
                            </div>

                            {/* Step 2: Dynamic Form */}
                            {selectedType && (
                                <div
                                    className="animate-fade-up"
                                    style={{ animationDelay: "0.1s" }}
                                >
                                    {/* Step 2 header */}
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="w-6 h-6 rounded-full bg-dark-brown text-cream text-xs font-bold flex items-center justify-center">2</span>
                                        <p className="text-sm font-medium text-foreground">
                                            Isi Detail
                                        </p>
                                    </div>

                                    {selectedType === "REGULAR" ? (
                                        <RegularClassForm
                                            formData={regularData}
                                            onChange={setRegularData}
                                            paymentFile={paymentFile}
                                            paymentPreview={paymentPreview}
                                            onPaymentChange={handlePaymentChange}
                                        />
                                    ) : (
                                        <UTSPackageForm
                                            formData={utsData}
                                            onChange={setUTSData}
                                            paymentFile={paymentFile}
                                            paymentPreview={paymentPreview}
                                            onPaymentChange={handlePaymentChange}
                                        />
                                    )}

                                    {/* Submit */}
                                    <Button
                                        type="submit"
                                        className="w-full bg-dark-brown hover:bg-soft-brown text-cream h-11 mt-6"
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
                                </div>
                            )}

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
