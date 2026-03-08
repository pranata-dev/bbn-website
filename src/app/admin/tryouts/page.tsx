"use client"

import { useState, useEffect } from "react"
import { Plus, Loader2, FileText, CheckCircle2, Play, Archive, RotateCcw, Pencil, Trash2 } from "lucide-react"
import { CATEGORY_LABELS } from "@/types"
import type { QuestionCategory } from "@/types"
import { toast } from "sonner"
import MarkdownLatex from "@/components/ui/markdown-latex"

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
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const INITIAL_FORM_DATA = {
    title: "",
    description: "",
    duration: 120, // default 2 hours
}

export default function AdminTryoutsPage() {
    const [tryouts, setTryouts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    // Form state
    const [formData, setFormData] = useState(INITIAL_FORM_DATA)
    const [availableQuestions, setAvailableQuestions] = useState<any[]>([])
    const [loadingQuestions, setLoadingQuestions] = useState(false)
    const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set())

    useEffect(() => {
        fetchTryouts()
    }, [])

    // Fetch ALL questions when the dialog opens
    useEffect(() => {
        if (!showForm) return

        const fetchAllQuestions = async () => {
            setLoadingQuestions(true)
            try {
                const res = await fetch(`/api/admin/questions`)
                const data = await res.json()
                if (!res.ok) {
                    toast.error(data.error || "Gagal mengambil soal.")
                }
                setAvailableQuestions(data.questions || [])
            } catch (error) {
                console.error("Failed to fetch questions:", error)
            } finally {
                setLoadingQuestions(false)
            }
        }

        fetchAllQuestions()
    }, [showForm])

    const fetchTryouts = async () => {
        try {
            const res = await fetch("/api/admin/tryouts?isPractice=false")
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
        setEditingId(null)
        setAvailableQuestions([])
    }

    const handleEdit = async (tryout: any) => {
        try {
            const res = await fetch(`/api/admin/tryouts/${tryout.id}`)
            if (!res.ok) throw new Error("Gagal mengambil detail tryout")
            const data = await res.json()
            
            setFormData({
                title: data.tryout.title,
                description: data.tryout.description || "",
                duration: data.tryout.duration,
            })
            setSelectedQuestionIds(new Set(data.questionIds || []))
            setEditingId(tryout.id)
            setShowForm(true)
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Terjadi kesalahan")
        }
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

    const selectAllInCategory = (categoryQuestions: any[]) => {
        const newSet = new Set(selectedQuestionIds)
        const allSelected = categoryQuestions.every(q => newSet.has(q.id))
        if (allSelected) {
            // Deselect all in this category
            categoryQuestions.forEach(q => newSet.delete(q.id))
        } else {
            // Select all in this category
            categoryQuestions.forEach(q => newSet.add(q.id))
        }
        setSelectedQuestionIds(newSet)
    }

    const handleSubmit = async () => {
        if (!formData.title || !formData.duration) {
            toast.error("Mohon isi judul dan durasi.")
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
                duration: formData.duration,
                questionIds: Array.from(selectedQuestionIds),
            }

            const method = editingId ? "PATCH" : "POST"
            const url = editingId ? `/api/admin/tryouts/${editingId}` : "/api/admin/tryouts"

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })

            if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                throw new Error(data.error || `Failed to ${editingId ? "update" : "create"} tryout`)
            }

            toast.success(`Tryout berhasil ${editingId ? "diperbarui" : "dibuat"}.`)
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

    const toggleStatus = async (tryoutId: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/admin/tryouts/${tryoutId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            })

            if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                throw new Error(data.error || "Failed to update status")
            }

            toast.success(
                newStatus === "ACTIVE"
                    ? "Tryout berhasil diaktifkan."
                    : newStatus === "ARCHIVED"
                        ? "Tryout berhasil diarsipkan."
                        : "Status tryout diperbarui."
            )
            fetchTryouts()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Gagal mengubah status.")
        }
    }

    const handleDelete = async () => {
        if (!deletingId) return
        try {
            const res = await fetch(`/api/admin/tryouts/${deletingId}`, {
                method: "DELETE",
            })
            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || "Gagal menghapus tryout")
            }
            toast.success("Tryout berhasil dihapus.")
            fetchTryouts()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Terjadi kesalahan")
        } finally {
            setDeletingId(null)
        }
    }

    // Group questions by category
    const questionsByCategory = availableQuestions.reduce<Record<string, any[]>>((acc, q) => {
        const cat = q.category || "UNCATEGORIZED"
        if (!acc[cat]) acc[cat] = []
        acc[cat].push(q)
        return acc
    }, {})

    // Order categories by CATEGORY_LABELS key order
    const orderedCategories = Object.keys(CATEGORY_LABELS).filter(cat => questionsByCategory[cat]?.length > 0)

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
                                                    {t.category
                                                        ? CATEGORY_LABELS[t.category as keyof typeof CATEGORY_LABELS] || t.category
                                                        : "Semua Materi"}
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
                                        <div className="shrink-0 flex items-center gap-2">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 text-muted-foreground hover:text-soft-brown"
                                                onClick={() => handleEdit(t)}
                                            >
                                                <Pencil className="w-3.5 h-3.5 mr-1.5" />
                                                Edit
                                            </Button>
                                            {t.status === "DRAFT" && (
                                                <Button
                                                    size="sm"
                                                    className="bg-emerald-600 hover:bg-emerald-700 text-white h-8"
                                                    onClick={() => toggleStatus(t.id, "ACTIVE")}
                                                >
                                                    <Play className="w-3.5 h-3.5 mr-1.5" />
                                                    Aktifkan
                                                </Button>
                                            )}
                                            {t.status === "ACTIVE" && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 border-warm-gray text-muted-foreground hover:text-foreground"
                                                    onClick={() => toggleStatus(t.id, "ARCHIVED")}
                                                >
                                                    <Archive className="w-3.5 h-3.5 mr-1.5" />
                                                    Arsipkan
                                                </Button>
                                            )}
                                            {t.status === "ARCHIVED" && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 border-warm-gray text-muted-foreground hover:text-foreground"
                                                    onClick={() => toggleStatus(t.id, "ACTIVE")}
                                                >
                                                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                                                    Aktifkan Ulang
                                                </Button>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 text-muted-foreground hover:text-red-500 hover:bg-red-50"
                                                onClick={() => setDeletingId(t.id)}
                                            >
                                                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                                                Hapus
                                            </Button>
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
                        <DialogTitle>{editingId ? "Edit Tryout" : "Buat Tryout Baru"}</DialogTitle>
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
                                        placeholder="Misal: Tryout UTS Fisika II"
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
                                <div className="space-y-2 md:col-span-2">
                                    <Label>Deskripsi (opsional)</Label>
                                    <Textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Penjelasan singkat mengenai tryout ini..."
                                        rows={2}
                                    />
                                </div>
                            </div>

                            <hr className="border-warm-gray/30" />

                            {/* Question Selection - Grouped by Category */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-lg">Pilih Soal</Label>
                                    <div className="text-sm font-medium">
                                        Total: {selectedQuestionIds.size} soal ({totalWeight} poin)
                                    </div>
                                </div>

                                {loadingQuestions ? (
                                    <div className="flex items-center justify-center p-8 border border-warm-gray/20 rounded-lg">
                                        <Loader2 className="w-6 h-6 animate-spin text-soft-brown" />
                                    </div>
                                ) : availableQuestions.length === 0 ? (
                                    <div className="p-8 text-center text-muted-foreground border border-dashed border-warm-gray rounded-lg bg-warm-beige/10">
                                        Tidak ada soal di Bank Soal.
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {orderedCategories.map((cat) => {
                                            const catQuestions = questionsByCategory[cat]
                                            const allSelected = catQuestions.every((q: any) => selectedQuestionIds.has(q.id))
                                            const someSelected = catQuestions.some((q: any) => selectedQuestionIds.has(q.id))
                                            const selectedCount = catQuestions.filter((q: any) => selectedQuestionIds.has(q.id)).length

                                            return (
                                                <div key={cat} className="border border-warm-gray/40 rounded-lg overflow-hidden">
                                                    {/* Category Header */}
                                                    <div
                                                        className="flex items-center justify-between px-4 py-3 bg-warm-beige/30 border-b border-warm-gray/20 cursor-pointer hover:bg-warm-beige/50 transition-colors"
                                                        onClick={() => selectAllInCategory(catQuestions)}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <Checkbox
                                                                checked={allSelected}
                                                                className={someSelected && !allSelected ? "opacity-60" : ""}
                                                                onCheckedChange={() => selectAllInCategory(catQuestions)}
                                                            />
                                                            <span className="font-semibold text-sm text-foreground">
                                                                {CATEGORY_LABELS[cat as QuestionCategory] || cat}
                                                            </span>
                                                        </div>
                                                        <Badge variant="outline" className="text-xs border-warm-gray/50 text-muted-foreground">
                                                            {selectedCount}/{catQuestions.length} dipilih
                                                        </Badge>
                                                    </div>

                                                    {/* Questions in this category */}
                                                    <div className="max-h-[250px] overflow-y-auto divide-y divide-warm-gray/20">
                                                        {catQuestions.map((q: any) => {
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
                                                                            <MarkdownLatex>{q.text}</MarkdownLatex>
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
                            {submitting ? "Menyimpan..." : (editingId ? "Simpan Perubahan" : "Buat Tryout")}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!deletingId} onOpenChange={(open: boolean) => !open && setDeletingId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Tryout?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Pengaturan soal tryout dan riwayat ujian tryout ini akan dihapus permanen.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
                            Ya, Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
