"use client"

import { useState, useEffect } from "react"
import { Plus, Loader2, BookOpen, Pencil, Trash2, Link as LinkIcon, Headphones } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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

export default function AdminMaterialsPage() {
    const [materials, setMaterials] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [subjectFilter, setSubjectFilter] = useState<string>("all")

    const INITIAL_FORM_DATA = {
        title: "",
        driveUrl: "",
        podcastUrl: "",
        subject: "", // empty by default
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
            driveUrl: material.drive_url,
            podcastUrl: material.podcast_url || "",
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
            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || "Gagal menghapus materi")
            }
            toast.success("Materi berhasil dihapus.")
            fetchMaterials()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Terjadi kesalahan")
        } finally {
            setSubmitting(false)
            setDeletingId(null)
        }
    }

    const handleSubmit = async () => {
        if (!formData.title || !formData.driveUrl || !formData.subject) {
            toast.error("Mohon isi judul, link drive, dan mata kuliah.")
            return
        }

        setSubmitting(true)
        try {
            const method = editingId ? "PATCH" : "POST"
            const url = editingId ? `/api/admin/materials/${editingId}` : "/api/admin/materials"

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                throw new Error(data.error || `Gagal ${editingId ? "memperbarui" : "membuat"} materi.`)
            }

            toast.success(`Materi berhasil ${editingId ? "diperbarui" : "dibuat"}.`)
            setShowForm(false)
            resetForm()
            fetchMaterials()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Gagal menyimpan materi.")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-[#2b1b11] uppercase tracking-tight" style={{ fontFamily: "var(--font-press-start)" }}>Manajemen Materi</h1>
                    <p className="text-[#3c5443] font-mono font-medium mt-1">Kelola tautan materi dan podcast pelajaran.</p>
                </div>
                <Button 
                    onClick={() => { resetForm(); setShowForm(true); }}
                    className="bg-[#e87a5d] hover:bg-[#c96349] text-[#FEFCF3] border-4 border-[#2b1b11] shadow-[4px_4px_0px_#2b1b11] hover:shadow-[6px_6px_0px_#2b1b11] hover:-translate-y-1 transition-all rounded-none font-bold font-mono h-12 px-6"
                >
                    <Plus className="w-5 h-5 mr-2 stroke-[3]" />
                    Tambah Materi
                </Button>
            </div>

            {/* Filter */}
            <Card className="border-4 border-[#2b1b11] shadow-[8px_8px_0px_#2b1b11] rounded-none bg-[#FEFCF3]">
                <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-end gap-4">
                    <div className="space-y-2 w-full sm:w-64">
                        <Label className="font-mono font-bold text-[#2b1b11]">Filter Mata Kuliah</Label>
                        <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                            <SelectTrigger className="border-2 border-[#2b1b11] rounded-none shadow-[2px_2px_0px_#2b1b11] bg-white font-mono font-semibold h-10">
                                <SelectValue placeholder="Pilih Mata Kuliah" />
                            </SelectTrigger>
                            <SelectContent className="border-2 border-[#2b1b11] rounded-none font-mono">
                                <SelectItem value="all">Semua Mata Kuliah</SelectItem>
                                <SelectItem value="FISDAS2">Fisika Dasar 2</SelectItem>
                                <SelectItem value="FISMAT">Fisika Matematika</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Materials List */}
            <Card className="border-4 border-[#2b1b11] shadow-[8px_8px_0px_#2b1b11] rounded-none bg-[#FEFCF3] overflow-hidden">
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-[#2b1b11]" />
                        </div>
                    ) : materials.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-16 h-16 bg-[#bed3c6] border-4 border-[#2b1b11] flex items-center justify-center shadow-[4px_4px_0px_#2b1b11] mb-4">
                                <BookOpen className="w-8 h-8 text-[#2b1b11] stroke-[2]" />
                            </div>
                            <p className="font-mono font-bold text-[#2b1b11]">Belum ada data materi.</p>
                        </div>
                    ) : (
                        <div className="divide-y-4 divide-[#2b1b11]">
                            {materials.map((m) => (
                                <div key={m.id} className="p-4 sm:p-6 hover:bg-[#bed3c6]/30 transition-colors">
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-black text-[#2b1b11] text-lg uppercase tracking-tight">{m.title}</h3>
                                                <Badge className={`border-2 border-[#2b1b11] rounded-none font-bold font-mono text-[10px] uppercase shadow-[2px_2px_0px_#2b1b11] ${m.subject === "FISDAS2" ? "bg-[#bed3c6] text-[#2b1b11]" : "bg-[#e87a5d] text-[#FEFCF3]"}`}>
                                                    {m.subject === "FISDAS2" ? "Fisika Dasar 2" : "Fisika Matematika"}
                                                </Badge>
                                            </div>
                                            
                                            <div className="flex flex-col gap-2 mt-4 font-mono text-sm">
                                                <a href={m.drive_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-800 font-bold max-w-fit break-all">
                                                    <LinkIcon className="w-4 h-4 shrink-0" />
                                                    Tautan Google Drive
                                                </a>
                                                
                                                {m.podcast_url && (
                                                    <a href={m.podcast_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[#e87a5d] hover:text-[#c96349] font-bold max-w-fit break-all mt-1">
                                                        <Headphones className="w-4 h-4 shrink-0" />
                                                        Tautan Podcast
                                                    </a>
                                                )}
                                            </div>
                                            <div className="mt-4 text-xs font-mono font-medium text-[#3c5443]">
                                                Ditambahkan: {new Date(m.created_at).toLocaleDateString("id-ID")}
                                            </div>
                                        </div>

                                        <div className="shrink-0 flex items-center gap-2 mt-4 sm:mt-0">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-10 bg-white border-2 border-[#2b1b11] shadow-[2px_2px_0px_#2b1b11] hover:-translate-y-1 hover:shadow-[4px_4px_0px_#2b1b11] rounded-none font-bold font-mono transition-all"
                                                onClick={() => handleEdit(m)}
                                            >
                                                <Pencil className="w-4 h-4 mr-2" />
                                                Edit
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-10 bg-white border-2 border-[#2b1b11] shadow-[2px_2px_0px_#2b1b11] hover:-translate-y-1 hover:shadow-[4px_4px_0px_#2b1b11] hover:bg-red-50 text-red-600 rounded-none font-bold font-mono transition-all"
                                                onClick={() => setDeletingId(m.id)}
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" />
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

            {/* Create/Edit Modal Form */}
            <Dialog 
                open={showForm} 
                onOpenChange={(open) => {
                    if (!open) resetForm()
                    setShowForm(open)
                }}
            >
                <DialogContent className="border-4 border-[#2b1b11] shadow-[12px_12px_0px_#2b1b11] rounded-none sm:max-w-[500px] p-0 overflow-hidden bg-[#FEFCF3]">
                    <DialogHeader className="px-6 py-4 border-b-4 border-[#2b1b11] bg-[#bed3c6]">
                        <DialogTitle className="font-extrabold uppercase text-[#2b1b11]" style={{ fontFamily: "var(--font-press-start)" }}>
                            {editingId ? "Edit Materi" : "Tambah Materi"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="p-6 space-y-6">
                        <div className="space-y-3">
                            <Label className="font-bold font-mono text-[#2b1b11]">Judul Materi</Label>
                            <Input
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Contoh: Modul Optik Geometrik"
                                className="border-2 border-[#2b1b11] rounded-none shadow-[2px_2px_0px_#2b1b11] focus-visible:ring-0 focus-visible:shadow-[4px_4px_0px_#e87a5d] bg-white font-mono"
                            />
                        </div>

                        <div className="space-y-3">
                            <Label className="font-bold font-mono text-[#2b1b11]">Mata Kuliah</Label>
                            <Select 
                                value={formData.subject} 
                                onValueChange={(val) => setFormData({ ...formData, subject: val })}
                            >
                                <SelectTrigger className="border-2 border-[#2b1b11] rounded-none shadow-[2px_2px_0px_#2b1b11] bg-white font-mono font-semibold">
                                    <SelectValue placeholder="Pilih Mata Kuliah" />
                                </SelectTrigger>
                                <SelectContent className="border-2 border-[#2b1b11] rounded-none font-mono">
                                    <SelectItem value="FISDAS2">Fisika Dasar 2</SelectItem>
                                    <SelectItem value="FISMAT">Fisika Matematika</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <Label className="font-bold font-mono text-[#2b1b11]">Tautan Google Drive Modul</Label>
                            <Input
                                value={formData.driveUrl}
                                onChange={(e) => setFormData({ ...formData, driveUrl: e.target.value })}
                                placeholder="https://drive.google.com/..."
                                className="border-2 border-[#2b1b11] rounded-none shadow-[2px_2px_0px_#2b1b11] focus-visible:ring-0 focus-visible:shadow-[4px_4px_0px_#e87a5d] bg-white font-mono"
                            />
                        </div>

                        <div className="space-y-3">
                            <Label className="font-bold font-mono text-[#2b1b11]">Tautan Podcast (Spotify/Lainnya) <span className="text-[#e87a5d] text-sm ml-1">*Opsional</span></Label>
                            <Input
                                value={formData.podcastUrl}
                                onChange={(e) => setFormData({ ...formData, podcastUrl: e.target.value })}
                                placeholder="https://open.spotify.com/..."
                                className="border-2 border-[#2b1b11] rounded-none shadow-[2px_2px_0px_#2b1b11] focus-visible:ring-0 focus-visible:shadow-[4px_4px_0px_#e87a5d] bg-white font-mono"
                            />
                        </div>
                    </div>

                    <div className="p-6 border-t-4 border-[#2b1b11] bg-white flex justify-end gap-3">
                        <Button 
                            variant="outline" 
                            onClick={() => setShowForm(false)}
                            disabled={submitting}
                            className="border-2 border-[#2b1b11] rounded-none font-bold font-mono text-[#2b1b11] shadow-[2px_2px_0px_#2b1b11]"
                        >
                            Batal
                        </Button>
                        <Button 
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="bg-[#2b1b11] hover:bg-[#3c5443] text-[#FEFCF3] border-2 border-[#2b1b11] shadow-[2px_2px_0px_#e87a5d] hover:shadow-[4px_4px_0px_#e87a5d] hover:-translate-y-1 transition-all rounded-none font-bold font-mono"
                        >
                            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {editingId ? "Simpan Perubahan" : "Simpan Materi"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Alert Dialog */}
            <AlertDialog open={!!deletingId} onOpenChange={() => !submitting && setDeletingId(null)}>
                <AlertDialogContent className="border-4 border-red-600 shadow-[8px_8px_0px_#dc2626] rounded-none bg-[#FEFCF3]">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-red-600 font-extrabold flex items-center gap-2" style={{ fontFamily: "var(--font-press-start)" }}>
                            <Trash2 className="w-6 h-6" /> Hapus Materi?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="font-mono text-[#2b1b11] font-medium mt-2">
                            Apakah Anda yakin? Materi ini akan dihapus secara permanen dari basis data dan tidak dapat dikembalikan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-4">
                        <AlertDialogCancel 
                            disabled={submitting}
                            className="border-2 border-[#2b1b11] rounded-none shadow-[2px_2px_0px_#2b1b11] font-mono font-bold hover:bg-[#bed3c6] text-[#2b1b11]"
                        >
                            Batal
                        </AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={(e) => { e.preventDefault(); handleDelete(); }}
                            disabled={submitting}
                            className="bg-red-600 border-2 border-red-800 text-white shadow-[2px_2px_0px_#991b1b] rounded-none font-mono font-bold hover:bg-red-700 hover:-translate-y-1 hover:shadow-[4px_4px_0px_#991b1b] transition-all"
                        >
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Ya, Hapus Permanen
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
