"use client"

import { useState, useEffect } from "react"
import { Plus, Loader2, FileText, CheckCircle2 } from "lucide-react"
import { CATEGORY_LABELS } from "@/types"
import { toast } from "sonner"
import Latex from "react-latex-next"
import "katex/dist/katex.min.css"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"

const INITIAL_FORM_DATA = {
    title: "",
    description: "",
    category: "",
    duration: 120, // default 2 hours
}

export default function AdminTryoutsPage() {
    const [tryouts, setTryouts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    // Form state
    const [formData, setFormData] = useState(INITIAL_FORM_DATA)
    const [availableQuestions, setAvailableQuestions] = useState<any[]>([])
    const [loadingQuestions, setLoadingQuestions] = useState(false)
    const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set())

    useEffect(() => {
        fetchTryouts()
    }, [])

    // Fetch questions when category changes
    useEffect(() => {
        if (!formData.category) {
            setAvailableQuestions([])
            setSelectedQuestionIds(new Set())
            return
        }

        const fetchQuestions = async () => {
            setLoadingQuestions(true)
            try {
                const res = await fetch(`/api/admin/questions?category=${formData.category}`)
                const data = await res.json()
                if (!res.ok) {
                    toast.error(data.error || "Gagal mengambil soal untuk kategori ini.")
                }
                setAvailableQuestions(data.questions || [])
                setSelectedQuestionIds(new Set()) // Reset selection on category change
            } catch (error) {
                console.error("Failed to fetch questions:", error)
            } finally {
                setLoadingQuestions(false)
            }
        }

        fetchQuestions()
    }, [formData.category])

    const fetchTryouts = async () => {
        try {
            const res = await fetch("/api/admin/tryouts")
            const data = await res.json()
            if (!res.ok) {
                toast.error(data.error || "Gagal mengambil data tryout.")
            }
            setTryouts(data.tryouts || [])
        } catch (error) {
            console.error("Failed to fetch tryouts:", error)
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setFormData(INITIAL_FORM_DATA)
        setSelectedQuestionIds(new Set())
        setAvailableQuestions([])
    }

    const toggleQuestion = (questionId: string) => {
        const newSet = new Set(selectedQuestionIds)
        if (newSet.has(questionId)) {
            newSet.delete(questionId)
        } else {
            newSet.add(questionId)
        }
        setSelectedQuestionIds(newSet)
    }

    const handleSubmit = async () => {
        if (!formData.title || !formData.category || !formData.duration) {
            toast.error("Mohon isi judul, kategori, dan durasi.")
            return
        }
        if (selectedQuestionIds.size === 0) {
            toast.error("Mohon pilih setidaknya satu soal untuk tryout ini.")
            return
        }

        setSubmitting(true)
        try {
            const payload = {
                title: formData.title,
                description: formData.description,
                category: formData.category,
                duration: formData.duration,
                questionIds: Array.from(selectedQuestionIds),
            }

            const res = await fetch("/api/admin/tryouts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })

            if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                throw new Error(data.error || "Failed to create tryout")
            }

            toast.success("Tryout berhasil dibuat.")
            setShowForm(false)
            resetForm()
            fetchTryouts()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Gagal membuat tryout.")
        } finally {
            setSubmitting(false)
        }
    }

    const totalWeight = availableQuestions
        .filter(q => selectedQuestionIds.has(q.id))
        .reduce((sum, q) => sum + (q.weight || 1), 0)

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Manajemen Tryout</h1>
                    <p className="text-muted-foreground">Buat dan kelola tryout.</p>
                </div>
                <Button onClick={() => setShowForm(true)} className="bg-dark-brown hover:bg-soft-brown text-cream">
                    <Plus className="w-4 h-4 mr-2" />
                    Buat Tryout
                </Button>
            </div>

            {/* Tryouts List */}
            <Card className="border-warm-gray/60">
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : tryouts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <FileText className="w-8 h-8 text-muted-foreground mb-3" />
                            <p className="text-sm text-muted-foreground">Belum ada tryout.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-warm-gray/40">
                            {tryouts.map((t) => (
                                <div key={t.id} className="p-4 hover:bg-warm-beige/30 transition-colors">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-foreground text-lg">{t.title}</h3>
                                                <Badge variant="secondary" className="bg-warm-beige text-soft-brown text-xs">
                                                    {CATEGORY_LABELS[t.category as keyof typeof CATEGORY_LABELS] || t.category}
                                                </Badge>
                                                <Badge
                                                    variant="outline"
                                                    className={t.status === "ACTIVE" ? "border-emerald-600 text-emerald-700" : "border-warm-gray"}
                                                >
                                                    {t.status}
                                                </Badge>
                                            </div>
                                            {t.description && (
                                                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                                    {t.description}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                                                <span>Durasi: {t.duration} menit</span>
                                                <span className="w-1 h-1 rounded-full bg-warm-gray" />
                                                <span>Dibuat: {new Date(t.created_at).toLocaleDateString("id-ID")}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create Tryout Dialog */}
            <Dialog
                open={showForm}
                onOpenChange={(open) => {
                    if (!open) resetForm()
                    setShowForm(open)
                }}
            >
                <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
                    <DialogHeader className="px-6 py-4 border-b border-warm-gray/30 shrink-0">
                        <DialogTitle>Buat Tryout Baru</DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto px-6 py-4">
                        <div className="space-y-6">
                            {/* Basic Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Judul Tryout</Label>
                                    <Input
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Misal: Tryout Listrik Statis & Dinamis"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Kategori (Materi)</Label>
                                    <Select
                                        value={formData.category}
                                        onValueChange={(val) => setFormData({ ...formData, category: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih kategori" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                                                <SelectItem key={key} value={key}>{label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label>Deskripsi (opsional)</Label>
                                    <Textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Penjelasan singkat mengenai tryout ini..."
                                        rows={2}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Durasi (Menit)</Label>
                                    <Input
                                        type="number"
                                        min={1}
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>

                            <hr className="border-warm-gray/30" />

                            {/* Question Selection */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-lg">Pilih Soal</Label>
                                    <div className="text-sm font-medium">
                                        Total: {selectedQuestionIds.size} soal ({totalWeight} poin)
                                    </div>
                                </div>

                                {!formData.category ? (
                                    <div className="p-8 text-center text-muted-foreground border border-dashed border-warm-gray rounded-lg bg-warm-beige/10">
                                        Pilih kategori terlebih dahulu untuk melihat daftar soal yang tersedia.
                                    </div>
                                ) : loadingQuestions ? (
                                    <div className="flex items-center justify-center p-8 border border-warm-gray/20 rounded-lg">
                                        <Loader2 className="w-6 h-6 animate-spin text-soft-brown" />
                                    </div>
                                ) : availableQuestions.length === 0 ? (
                                    <div className="p-8 text-center text-muted-foreground border border-dashed border-warm-gray rounded-lg bg-warm-beige/10">
                                        Tidak ada soal di Bank Soal untuk kategori ini.
                                    </div>
                                ) : (
                                    <div className="border border-warm-gray/40 rounded-lg max-h-[400px] overflow-y-auto divide-y divide-warm-gray/20">
                                        {availableQuestions.map((q) => {
                                            const isSelected = selectedQuestionIds.has(q.id)
                                            return (
                                                <div
                                                    key={q.id}
                                                    className={`p-4 flex items-start gap-4 transition-colors cursor-pointer ${isSelected ? "bg-emerald-50/50" : "hover:bg-warm-beige/30"}`}
                                                    onClick={() => toggleQuestion(q.id)}
                                                >
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onCheckedChange={() => toggleQuestion(q.id)}
                                                        className="mt-1"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm line-clamp-3">
                                                            <Latex>{q.text}</Latex>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <Badge variant="outline" className="text-[10px] text-muted-foreground border-warm-gray/50">
                                                                Bobot: {q.weight}
                                                            </Badge>
                                                            {q.image_url && (
                                                                <Badge variant="outline" className="text-[10px] text-muted-foreground border-warm-gray/50">
                                                                    Gambar
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t border-warm-gray/30 bg-warm-beige/10 flex justify-end gap-3 shrink-0">
                        <Button
                            variant="outline"
                            onClick={() => setShowForm(false)}
                            disabled={submitting}
                        >
                            Batal
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={submitting || selectedQuestionIds.size === 0}
                            className="bg-dark-brown hover:bg-soft-brown text-cream"
                        >
                            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {submitting ? "Membuat..." : "Buat Tryout"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
