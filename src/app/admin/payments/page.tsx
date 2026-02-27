"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Check, X, Eye, Loader2, CreditCard } from "lucide-react"
import { toast } from "sonner"

interface PaymentItem {
    id: string
    type: string
    name: string
    email: string
    nim: string
    subject: string
    payment_proof_url: string
    status: string
    notes: string | null
    created_at: string
}

export default function PaymentsPage() {
    const [payments, setPayments] = useState<PaymentItem[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedPayment, setSelectedPayment] = useState<PaymentItem | null>(null)
    const [notes, setNotes] = useState("")
    const [processing, setProcessing] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    useEffect(() => {
        fetchPayments()
    }, [])

    const fetchPayments = async () => {
        try {
            const res = await fetch("/api/admin/payments")
            const data = await res.json()
            setPayments(data.payments || [])
        } catch (error) {
            console.error("Failed to fetch payments:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleAction = async (action: "APPROVED" | "REJECTED") => {
        if (!selectedPayment) return
        setProcessing(true)

        try {
            const res = await fetch("/api/auth/approve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    registrationId: selectedPayment.id,
                    action,
                    notes,
                }),
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.error)

            toast.success(data.message)
            setSelectedPayment(null)
            setNotes("")
            fetchPayments()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Terjadi kesalahan.")
        } finally {
            setProcessing(false)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PENDING":
                return <Badge className="bg-amber-100 text-amber-700">Menunggu</Badge>
            case "APPROVED":
                return <Badge className="bg-green-100 text-green-700">Disetujui</Badge>
            case "REJECTED":
                return <Badge className="bg-red-100 text-red-700">Ditolak</Badge>
            default:
                return <Badge variant="secondary">{status}</Badge>
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Verifikasi Pembayaran</h1>
                <p className="text-muted-foreground">Kelola verifikasi pembayaran pendaftar.</p>
            </div>

            <Card className="border-warm-gray/60">
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : payments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <CreditCard className="w-8 h-8 text-muted-foreground mb-3" />
                            <p className="text-sm text-muted-foreground">Belum ada pembayaran.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-warm-gray/40">
                            {payments.map((payment) => (
                                <div
                                    key={payment.id}
                                    className="flex items-center justify-between p-4 hover:bg-warm-beige/30 transition-colors"
                                >
                                    <div className="flex-1 min-w-0 mr-4">
                                        <p className="text-sm font-semibold text-foreground">
                                            {payment.name}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <p className="text-xs font-medium text-dark-brown">
                                                {payment.type} - {payment.subject}
                                            </p>
                                            <span className="w-1 h-1 rounded-full bg-warm-gray"></span>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {payment.email}
                                            </p>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {new Date(payment.created_at).toLocaleDateString("id-ID")}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {getStatusBadge(payment.status)}

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setPreviewUrl(payment.payment_proof_url)}
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Button>

                                        {payment.status === "PENDING" && (
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    onClick={() => setSelectedPayment(payment)}
                                                    className="bg-earthy-green hover:bg-earthy-green/80 text-white"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => {
                                                        setSelectedPayment(payment)
                                                    }}
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Action dialog */}
            <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Verifikasi Pendaftaran</DialogTitle>
                        <DialogDescription>
                            {selectedPayment?.name} - {selectedPayment?.email} ({selectedPayment?.type})
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Textarea
                            placeholder="Catatan (opsional)"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="border-warm-gray"
                        />
                    </div>
                    <DialogFooter className="gap-2">
                        <Button
                            variant="destructive"
                            onClick={() => handleAction("REJECTED")}
                            disabled={processing}
                        >
                            {processing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <X className="w-4 h-4 mr-2" />}
                            Tolak
                        </Button>
                        <Button
                            onClick={() => handleAction("APPROVED")}
                            disabled={processing}
                            className="bg-earthy-green hover:bg-earthy-green/80 text-white"
                        >
                            {processing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                            Setujui
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Image preview dialog */}
            <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Bukti Pembayaran</DialogTitle>
                    </DialogHeader>
                    {previewUrl && (
                        <img src={previewUrl} alt="Payment proof" className="w-full rounded-lg" />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
