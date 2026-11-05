"use client"

import { useState, useEffect } from "react"
import { Plus, Loader2, BookOpen, Pencil, Trash2, Link as LinkIcon, Headphones, Eye, Sparkles, CheckCircle, FileText } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
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
import MarkdownLatex from "@/components/ui/markdown-latex"

export default function AdminMaterialsPage() {
    const [materials, setMaterials] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [subjectFilter, setSubjectFilter] = useState<string>("all")
    const [activeTab, setActiveTab] = useState<"edit" | "preview" | "split">("split")

    const INITIAL_FORM_DATA = {
        title: "",
        slug: "",
        summary: "",
        contentMd: "",
        driveUrl: "",
        podcastUrl: "",
        moduleNumber: "1",
        readingTimeMinutes: "15",
        isFreePreview: false,
        subject: "FISDAS2",
    }
    const [formData, setFormData] = useState(INITIAL_FORM_DATA)

    useEffect(() => {
        fetchMaterials()
    }, [subjectFilter])

    const fetchMaterials = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (subjectFilter !== "all") params.set("subject", subjectFilter)
            
            const res = await fetch(`/api/admin/materials?${params.toString()}`)
            const data = await res.json()
            
            if (!res.ok) {
                toast.error(data.error || "Gagal mengambil data materi.")
            } else {
                setMaterials(data.materials || [])
            }
        } catch (error) {
            console.error("Failed to fetch materials:", error)
            toast.error("Terjadi kesalahan jaringan.")
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setFormData(INITIAL_FORM_DATA)
        setEditingId(null)
    }

    const handleEdit = (material: any) => {
        setFormData({
            title: material.title,
            slug: material.slug || "",
            summary: material.summary || "",
            contentMd: material.content_md || "",
            driveUrl: material.drive_url || "",
            podcastUrl: material.podcast_url || "",
            moduleNumber: String(material.module_number ?? 1),
            readingTimeMinutes: String(material.reading_time_minutes ?? 15),
            isFreePreview: Boolean(material.is_free_preview),
            subject: material.subject,
        })
        setEditingId(material.id)
        setShowForm(true)
    }

    const handleDelete = async () => {
        if (!deletingId) return
        setSubmitting(true)
        try {
            const res = await fetch(`/api/admin/materials/${deletingId}`, {
                method: "DELETE",
            })
            const data = await res.json()
            if (!res.ok) {
                toast.error(data.error || "Gagal menghapus materi.")
            } else {
                toast.success("Materi berhasil dihapus.")
                fetchMaterials()
                setDeletingId(null)
            }
        } catch (error) {
            console.error("Failed to delete material:", error)
            toast.error("Terjadi kesalahan sistem.")
        } finally {
            setSubmitting(false)
        }
    }

    const handleSubmit = async () => {
        if (!formData.title || !formData.subject) {
            toast.error("Judul dan mata kuliah wajib diisi!")
            return
        }

        setSubmitting(true)
        try {
            const payload = {
                title: formData.title,
                slug: formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
                summary: formData.summary,
                contentMd: formData.contentMd,
                driveUrl: formData.driveUrl,
                podcastUrl: formData.podcastUrl,
                moduleNumber: parseInt(formData.moduleNumber) || 1,
                readingTimeMinutes: parseInt(formData.readingTimeMinutes) || 15,
                isFreePreview: formData.isFreePreview,
                subject: formData.subject,
            }

            const url = editingId 
                ? `/api/admin/materials/${editingId}`
                : `/api/admin/materials`
            const method = editingId ? "PATCH" : "POST"

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })
            const data = await res.json()

            if (!res.ok) {
                toast.error(data.error || "Gagal menyimpan materi.")
            } else {
                toast.success(editingId ? "Materi berhasil diperbarui." : "Materi baru berhasil ditambahkan.")
                setShowForm(false)
                resetForm()
                fetchMaterials()
            }
        } catch (error) {
            console.error("Failed to save material:", error)
            toast.error("Terjadi kesalahan sistem.")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Kelola Modul Materi
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Buat dan perbarui materi belajar interaktif dengan teks Markdown & formula LaTeX.
                    </p>
                </div>
                <Button 
                    onClick={() => {
                        resetForm()
                        setShowForm(true)
                    }}
                    className="bg-olive hover:bg-olive/90 text-white font-semibold"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Modul Materi
                </Button>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-3">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mata Kuliah:</Label>
                <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                    <SelectTrigger className="w-[200px] h-9">
                        <SelectValue placeholder="Pilih Mata Kuliah" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua Mata Kuliah</SelectItem>
                        <SelectItem value="FISDAS2">Fisika Dasar 2</SelectItem>
                        <SelectItem value="FISMAT">Fisika Matematika</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Materials List */}
            <Card className="border border-border">
                <CardContent className="p-4 sm:p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-olive" />
                        </div>
                    ) : materials.length === 0 ? (
                        <div className="text-center py-12 space-y-3">
                            <BookOpen className="w-10 h-10 text-muted-foreground mx-auto" />
                            <p className="text-sm font-semibold text-foreground">Belum ada modul materi</p>
                            <p className="text-xs text-muted-foreground">Klik tombol &quot;Tambah Modul Materi&quot; untuk membuat modul pertama.</p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {materials.map((m) => (
                                <div
                                    key={m.id}
                                    className="border border-border rounded-xl p-4 hover:border-olive/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                                >
                                    <div className="space-y-1.5 flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-muted text-muted-foreground">
                                                Modul {m.module_number ?? "-"}
                                            </span>
                                            <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-olive/15 text-olive">
                                                {m.subject}
                                            </span>
                                            {m.is_free_preview && (
                                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300">
                                                    <CheckCircle className="w-3 h-3" /> Free Preview
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="font-semibold text-foreground text-base tracking-tight truncate">
                                            {m.title}
                                        </h3>
                                        {m.summary && (
                                            <p className="text-xs text-muted-foreground line-clamp-1 max-w-2xl">
                                                {m.summary}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                                            {m.drive_url && (
                                                <a href={m.drive_url} target="_blank" rel="noopener noreferrer" className="hover:text-olive flex items-center gap-1">
                                                    <LinkIcon className="w-3 h-3" /> Drive/PDF
                                                </a>
                                            )}
                                            {m.podcast_url && (
                                                <a href={m.podcast_url} target="_blank" rel="noopener noreferrer" className="hover:text-olive flex items-center gap-1">
                                                    <Headphones className="w-3 h-3" /> Podcast
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleEdit(m)}
                                        >
                                            <Pencil className="w-4 h-4 mr-1.5" />
                                            Edit
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-destructive hover:bg-destructive/10"
                                            onClick={() => setDeletingId(m.id)}
                                        >
                                            <Trash2 className="w-4 h-4 mr-1.5" />
                                            Hapus
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Split-Pane Markdown Editor Dialog */}
            <Dialog 
                open={showForm} 
                onOpenChange={(open) => {
                    if (!open) resetForm()
                    setShowForm(open)
                }}
            >
                <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto rounded-2xl p-6">
                    <DialogHeader className="border-b border-border pb-4">
                        <DialogTitle className="text-lg font-bold text-foreground">
                            {editingId ? "Edit Modul Materi" : "Tambah Modul Materi Baru"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 pt-2">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2 space-y-1.5">
                                <Label className="text-xs font-semibold">Judul Modul *</Label>
                                <Input
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Contoh: Hukum Coulomb & Medan Listrik"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Mata Kuliah *</Label>
                                <Select 
                                    value={formData.subject} 
                                    onValueChange={(val) => setFormData({ ...formData, subject: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Mata Kuliah" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="FISDAS2">Fisika Dasar 2</SelectItem>
                                        <SelectItem value="FISMAT">Fisika Matematika</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Slug URL (opsional)</Label>
                                <Input
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    placeholder="hukum-coulomb-medan-listrik"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Nomor Modul</Label>
                                <Input
                                    type="number"
                                    value={formData.moduleNumber}
                                    onChange={(e) => setFormData({ ...formData, moduleNumber: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Estimasi Baca (Menit)</Label>
                                <Input
                                    type="number"
                                    value={formData.readingTimeMinutes}
                                    onChange={(e) => setFormData({ ...formData, readingTimeMinutes: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Ringkasan Singkat</Label>
                            <Input
                                value={formData.summary}
                                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                                placeholder="Penjelasan singkat modul untuk kartu preview materi..."
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Tautan Google Drive / PDF Modul</Label>
                                <Input
                                    value={formData.driveUrl}
                                    onChange={(e) => setFormData({ ...formData, driveUrl: e.target.value })}
                                    placeholder="https://drive.google.com/..."
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Tautan Audio Podcast</Label>
                                <Input
                                    value={formData.podcastUrl}
                                    onChange={(e) => setFormData({ ...formData, podcastUrl: e.target.value })}
                                    placeholder="https://open.spotify.com/... atau Drive MP3"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pt-1 pb-2">
                            <input
                                type="checkbox"
                                id="isFreePreview"
                                checked={formData.isFreePreview}
                                onChange={(e) => setFormData({ ...formData, isFreePreview: e.target.checked })}
                                className="w-4 h-4 rounded text-olive focus:ring-olive border-border cursor-pointer"
                            />
                            <Label htmlFor="isFreePreview" className="text-xs font-medium cursor-pointer">
                                Jadikan Modul Free Preview (Dapat diakses gratis oleh pengguna baru)
                            </Label>
                        </div>

                        {/* Split-Pane Markdown Editor Header */}
                        <div className="border-t border-border pt-4 space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-bold uppercase tracking-wider text-foreground">
                                    Konten Modul (Markdown & LaTeX Formula)
                                </Label>
                                <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant={activeTab === "edit" ? "default" : "ghost"}
                                        className={`h-7 text-xs ${activeTab === "edit" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}
                                        onClick={() => setActiveTab("edit")}
                                    >
                                        Teks Saja
                                    </Button>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant={activeTab === "preview" ? "default" : "ghost"}
                                        className={`h-7 text-xs ${activeTab === "preview" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}
                                        onClick={() => setActiveTab("preview")}
                                    >
                                        Preview Saja
                                    </Button>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant={activeTab === "split" ? "default" : "ghost"}
                                        className={`h-7 text-xs ${activeTab === "split" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}
                                        onClick={() => setActiveTab("split")}
                                    >
                                        Live Split
                                    </Button>
                                </div>
                            </div>

                            {/* Split-Pane Area */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(activeTab === "edit" || activeTab === "split") && (
                                    <div className={activeTab === "edit" ? "md:col-span-2" : ""}>
                                        <Textarea
                                            value={formData.contentMd}
                                            onChange={(e) => setFormData({ ...formData, contentMd: e.target.value })}
                                            placeholder="# Judul Modul&#10;&#10;Tuliskan penjelasan materi di sini. Gunakan $E = mc^2$ untuk inline LaTeX dan $$...$$ untuk persamaan blok..."
                                            className="font-mono text-xs min-h-[360px] max-h-[500px] leading-relaxed resize-y p-3.5"
                                        />
                                    </div>
                                )}

                                {(activeTab === "preview" || activeTab === "split") && (
                                    <div className={`border border-border rounded-xl p-4 bg-muted/20 min-h-[360px] max-h-[500px] overflow-y-auto ${
                                        activeTab === "preview" ? "md:col-span-2" : ""
                                    }`}>
                                        {formData.contentMd ? (
                                            <MarkdownLatex>
                                                {formData.contentMd}
                                            </MarkdownLatex>
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                                                Preview Markdown & LaTeX akan muncul langsung di sini.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-border pt-4 mt-6 flex justify-end gap-2.5">
                        <Button 
                            variant="outline" 
                            onClick={() => setShowForm(false)}
                            disabled={submitting}
                        >
                            Batal
                        </Button>
                        <Button 
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="bg-olive hover:bg-olive/90 text-white font-semibold"
                        >
                            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {editingId ? "Simpan Perubahan" : "Simpan Modul"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deletingId} onOpenChange={() => !submitting && setDeletingId(null)}>
                <AlertDialogContent className="rounded-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Modul Materi?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Modul ini akan dihapus secara permanen dari platform. Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 sm:gap-0">
                        <AlertDialogCancel disabled={submitting}>
                            Batal
                        </AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={(e) => { e.preventDefault(); handleDelete(); }}
                            disabled={submitting}
                            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold"
                        >
                            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Hapus Permanen
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
