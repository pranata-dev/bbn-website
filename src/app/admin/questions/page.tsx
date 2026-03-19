"use client"

import MarkdownLatex from "@/components/ui/markdown-latex"
import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
    DialogFooter,
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
import {
    Plus,
    HelpCircle,
    Loader2,
    ImagePlus,
    X,
    FileImage,
    Eye,
    ArrowRight,
    CheckCircle2,
    Pencil,
    Trash2,
} from "lucide-react"
import { toast } from "sonner"
import { CATEGORY_LABELS } from "@/types"
import {
    compressQuestionImage,
    formatFileSize,
    type CompressionResult,
} from "@/lib/image-compression"

interface QuestionItem {
    id: string
    type: "MULTIPLE_CHOICE" | "ESSAY"
    text: string
    category: string
    subject: string
    option_a: string
    option_b: string
    option_c: string
    option_d: string
    option_e: string | null
    correct_answer: string
    explanation: string | null
    weight: number
    image_url: string | null
    created_at: string
}

    type: "MULTIPLE_CHOICE",
    text: "",
    category: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    optionE: "",
    correctAnswer: "",
    explanation: "",
    weight: 1,
    subject: "FISDAS2",
}

// ─── LaTeX Preview Component ──────────────────────────────────────────
function LatexPreview({ content, label }: { content: string; label?: string }) {
    if (!content) return null
    return (
        <div className="mt-2 p-3 bg-warm-beige/30 rounded-lg border border-warm-gray/40 overflow-x-auto">
            <div className="flex items-center gap-1.5 mb-2">
                <Eye className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-medium">
                    {label || "Preview"}
                </span>
            </div>
            <div className="prose prose-sm max-w-none text-foreground">
                <MarkdownLatex>{content}</MarkdownLatex>
            </div>
        </div>
    )
}

// ─── Image Upload Component ───────────────────────────────────────────
function ImageUploadSection({
    compressedImage,
    compressionResult,
    isCompressing,
    previewUrl,
    existingImageUrl,
    onFileSelect,
    onClear,
    onRemoveExisting,
}: {
    compressedImage: File | null
    compressionResult: CompressionResult | null
    isCompressing: boolean
    previewUrl: string | null
    existingImageUrl?: string | null
    onFileSelect: (file: File) => void
    onClear: () => void
    onRemoveExisting?: () => void
}) {
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault()
            const file = e.dataTransfer.files[0]
            if (file && file.type.startsWith("image/")) {
                onFileSelect(file)
            }
        },
        [onFileSelect]
    )

    const showExistingImage = !compressedImage && !isCompressing && existingImageUrl

    return (
        <div className="space-y-2">
            <Label className="flex items-center gap-2">
                <FileImage className="w-4 h-4" />
                Gambar Soal (opsional)
            </Label>
            <p className="text-xs text-muted-foreground">
                Diagram atau grafik. Otomatis dikompresi ke WebP, maks 1024×1024, maks 100KB.
            </p>

            {!compressedImage && !isCompressing && !showExistingImage ? (
                <div
                    className="relative border-2 border-dashed border-warm-gray/60 rounded-lg p-6 text-center cursor-pointer hover:border-soft-brown/60 hover:bg-warm-beige/20 transition-all"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                >
                    <ImagePlus className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                        Klik atau seret gambar ke sini
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG, WebP
                    </p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) onFileSelect(file)
                            e.target.value = "" // reset so same file can be re-selected
                        }}
                    />
                </div>
            ) : isCompressing ? (
                <div className="border border-warm-gray/60 rounded-lg p-6 text-center bg-warm-beige/10">
                    <Loader2 className="w-6 h-6 animate-spin text-soft-brown mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                        Mengompresi gambar...
                    </p>
                </div>
            ) : showExistingImage ? (
                <div className="border border-warm-gray/60 rounded-lg p-4 bg-white">
                    <div className="flex items-start gap-4">
                        <img
                            src={existingImageUrl!}
                            alt="Existing Preview"
                            className="w-24 h-24 object-contain rounded-md border border-warm-gray/40 bg-warm-beige/20 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-medium text-foreground truncate">
                                    Gambar Saat Ini
                                </span>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="shrink-0 text-muted-foreground hover:text-red-600"
                            onClick={onRemoveExisting}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="border border-warm-gray/60 rounded-lg p-4 bg-white">
                    <div className="flex items-start gap-4">
                        {/* Thumbnail preview */}
                        {previewUrl && (
                            <img
                                src={previewUrl}
                                alt="Preview"
                                className="w-24 h-24 object-contain rounded-md border border-warm-gray/40 bg-warm-beige/20 shrink-0"
                            />
                        )}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span className="text-sm font-medium text-foreground truncate">
                                    {compressedImage?.name}
                                </span>
                            </div>
                            {/* Compression stats */}
                            {compressionResult && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span className="line-through">
                                        {formatFileSize(compressionResult.originalSize)}
                                    </span>
                                    <ArrowRight className="w-3 h-3" />
                                    <span className="font-semibold text-emerald-700">
                                        {formatFileSize(compressionResult.compressedSize)}
                                    </span>
                                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 text-[10px] px-1.5 py-0">
                                        -{Math.round((1 - compressionResult.compressedSize / compressionResult.originalSize) * 100)}%
                                    </Badge>
                                </div>
                            )}
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="shrink-0 text-muted-foreground hover:text-red-600"
                            onClick={onClear}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

// ─── Main Page ────────────────────────────────────────────────────────
export default function QuestionsPage() {
    const [questions, setQuestions] = useState<QuestionItem[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [filter, setFilter] = useState("all")
    const [subjectFilter, setSubjectFilter] = useState("all")
    const [formData, setFormData] = useState(INITIAL_FORM_DATA)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    // Image state
    const [compressedImage, setCompressedImage] = useState<File | null>(null)
    const [compressionResult, setCompressionResult] = useState<CompressionResult | null>(null)
    const [isCompressing, setIsCompressing] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [removeImage, setRemoveImage] = useState(false)

    useEffect(() => {
        fetchQuestions()
    }, [filter, subjectFilter])

    // Cleanup preview URL on unmount or change
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl)
        }
    }, [previewUrl])

    const fetchQuestions = async () => {
        try {
            const params = new URLSearchParams()
            if (filter !== "all") params.set("category", filter)
            if (subjectFilter !== "all") params.set("subject", subjectFilter)
            const res = await fetch(`/api/admin/questions?${params}`)
            const data = await res.json()
            if (!res.ok) {
                toast.error(data.error || "Gagal mengambil data soal.")
            }
            setQuestions(data.questions || [])
        } catch (error) {
            console.error("Failed to fetch questions:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleFileSelect = async (file: File) => {
        setIsCompressing(true)
        try {
            const result = await compressQuestionImage(file)
            setCompressedImage(result.file)
            setCompressionResult(result)
            // Create preview URL from the compressed file
            if (previewUrl) URL.revokeObjectURL(previewUrl)
            setPreviewUrl(URL.createObjectURL(result.file))
        } catch (error) {
            console.error("Compression failed:", error)
            toast.error("Gagal mengompresi gambar. Coba gambar lain.")
        } finally {
            setIsCompressing(false)
        }
    }

    const handleClearImage = () => {
        setCompressedImage(null)
        setCompressionResult(null)
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl)
            setPreviewUrl(null)
        }
    }

    const resetForm = () => {
        setFormData(INITIAL_FORM_DATA)
        setEditingId(null)
        setRemoveImage(false)
        handleClearImage()
    }

    const handleEdit = (q: QuestionItem) => {
        setFormData({
            type: (q.type as any) || "MULTIPLE_CHOICE",
            text: q.text,
            category: q.category,
            optionA: q.option_a,
            optionB: q.option_b,
            optionC: q.option_c,
            optionD: q.option_d,
            optionE: q.option_e || "",
            correctAnswer: q.correct_answer,
            explanation: q.explanation || "",
            weight: q.weight,
            subject: q.subject,
        })
        setEditingId(q.id)
        setRemoveImage(false)
        handleClearImage()
        setShowForm(true)
    }

    const handleDelete = async () => {
        if (!deletingId) return

        try {
            const res = await fetch(`/api/admin/questions/${deletingId}`, {
                method: "DELETE",
            })

            if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                throw new Error(data.error || "Gagal menghapus soal")
            }

            toast.success("Soal berhasil dihapus.")
            fetchQuestions()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Gagal menghapus soal.")
        } finally {
            setDeletingId(null)
        }
    }

    const handleSubmit = async () => {
        if (!formData.text || !formData.category || !formData.correctAnswer) {
            toast.error("Mohon isi semua field yang diperlukan.")
            return
        }
        if (formData.type === "MULTIPLE_CHOICE" && (!formData.optionA || !formData.optionB || !formData.optionC || !formData.optionD)) {
            toast.error("Mohon isi opsi A, B, C, dan D untuk pilihan ganda.")
            return
        }

        setSubmitting(true)
        try {
            // Build FormData for multipart upload (text fields + image)
            const payload = new FormData()
            payload.append("type", formData.type)
            payload.append("text", formData.text)
            payload.append("category", formData.category)
            payload.append("optionA", formData.optionA)
            payload.append("optionB", formData.optionB)
            payload.append("optionC", formData.optionC)
            payload.append("optionD", formData.optionD)
            payload.append("optionE", formData.optionE)
            payload.append("correctAnswer", formData.correctAnswer)
            payload.append("explanation", formData.explanation)
            payload.append("weight", String(formData.weight))
            payload.append("subject", formData.subject)

            if (compressedImage) {
                payload.append("image", compressedImage)
            }
            if (removeImage) {
                payload.append("removeImage", "true")
            }

            const endpoint = editingId
                ? `/api/admin/questions/${editingId}`
                : "/api/admin/questions"

            const method = editingId ? "PATCH" : "POST"

            const res = await fetch(endpoint, {
                method,
                body: payload,
            })

            if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                throw new Error(data.error || `Failed to ${editingId ? "update" : "create"} question`)
            }

            toast.success(editingId ? "Soal berhasil diperbarui." : "Soal berhasil ditambahkan.")
            setShowForm(false)
            resetForm()
            fetchQuestions()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Gagal menambahkan soal.")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Bank Soal</h1>
                    <p className="text-muted-foreground">Kelola soal-soal tryout.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Select value={filter} onValueChange={setFilter}>
                        <SelectTrigger className="w-[220px] bg-white border-warm-gray">
                            <SelectValue placeholder="Filter" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua</SelectItem>
                            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                                <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                        <SelectTrigger className="w-[180px] bg-white border-warm-gray">
                            <SelectValue placeholder="Semua Mata Kuliah" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Mata Kuliah</SelectItem>
                            <SelectItem value="FISDAS2">Fisika Dasar 2</SelectItem>
                            <SelectItem value="FISMAT">Fisika Matematika</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={() => setShowForm(true)} className="bg-dark-brown hover:bg-soft-brown text-cream">
                        <Plus className="w-4 h-4 mr-2" />
                        Tambah Soal
                    </Button>
                </div>
            </div>

            {/* Questions list */}
            <Card className="border-warm-gray/60">
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : questions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <HelpCircle className="w-8 h-8 text-muted-foreground mb-3" />
                            <p className="text-sm text-muted-foreground">Belum ada soal.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-warm-gray/40">
                            {questions.map((q) => (
                                <div key={q.id} className="p-4 hover:bg-warm-beige/30 transition-colors">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge variant="secondary" className="bg-warm-beige text-soft-brown text-xs">
                                                    {CATEGORY_LABELS[q.category as keyof typeof CATEGORY_LABELS] || q.category}
                                                </Badge>
                                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                                                    {q.subject === "FISDAS2" ? "Fisika Dasar 2" : "Fisika Matematika"}
                                                </Badge>
                                                <Badge variant="outline" className="text-xs border-warm-gray">
                                                    Bobot: {q.weight}
                                                </Badge>
                                                {q.image_url && (
                                                    <Badge variant="outline" className="text-xs border-warm-gray">
                                                        <FileImage className="w-3 h-3 mr-1" />
                                                        Gambar
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="text-sm text-foreground line-clamp-2 mt-2">
                                                <MarkdownLatex>{q.text}</MarkdownLatex>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-2">
                                                Jawaban: {q.correct_answer}
                                            </p>
                                        </div>
                                        <div className="shrink-0 flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 flex text-muted-foreground hover:text-soft-brown"
                                                onClick={() => handleEdit(q)}
                                            >
                                                <Pencil className="w-4 h-4 mr-1.5" />
                                                Edit
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 flex text-muted-foreground hover:text-red-600"
                                                onClick={() => setDeletingId(q.id)}
                                            >
                                                <Trash2 className="w-4 h-4 mr-1.5" />
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

            {/* Add question dialog */}
            <Dialog
                open={showForm}
                onOpenChange={(open) => {
                    setShowForm(open)
                    if (!open) resetForm()
                }}
            >
                <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingId ? "Edit Soal" : "Tambah Soal Baru"}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-5">
                        {/* Question Type */}
                        <div className="space-y-2">
                            <Label>Tipe Soal *</Label>
                            <Select value={formData.type} onValueChange={(v: any) => setFormData({ ...formData, type: v })}>
                                <SelectTrigger className="border-warm-gray">
                                    <SelectValue placeholder="Pilih tipe" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MULTIPLE_CHOICE">Pilihan Ganda (MCQ)</SelectItem>
                                    <SelectItem value="ESSAY">Essay / Uraian</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Question text with preview */}
                        <div className="space-y-2">
                            <Label>Soal *</Label>
                            <Textarea
                                value={formData.text}
                                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                                placeholder={"Tulis soal di sini...\n\nContoh LaTeX inline: $E = mc^2$\nContoh LaTeX block: $$\\int_0^\\infty e^{-x} dx = 1$$"}
                                className="border-warm-gray min-h-[120px] font-mono text-sm"
                            />
                            <LatexPreview content={formData.text} label="Preview Soal" />
                        </div>

                        {/* Image upload */}
                        <ImageUploadSection
                            compressedImage={compressedImage}
                            compressionResult={compressionResult}
                            isCompressing={isCompressing}
                            previewUrl={previewUrl}
                            existingImageUrl={editingId && !removeImage ? questions.find(q => q.id === editingId)?.image_url : null}
                            onFileSelect={handleFileSelect}
                            onClear={handleClearImage}
                            onRemoveExisting={() => setRemoveImage(true)}
                        />

                        {/* Category + Weight */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Kategori *</Label>
                                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                                    <SelectTrigger className="border-warm-gray"><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Bobot</Label>
                                <Input
                                    type="number"
                                    min={0.1}
                                    max={10}
                                    step={0.1}
                                    value={formData.weight}
                                    onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) })}
                                    className="border-warm-gray"
                                />
                            </div>
                        </div>

                        {/* Subject Selection */}
                        <div className="space-y-2">
                            <Label>Mata Kuliah *</Label>
                            <Select value={formData.subject} onValueChange={(v) => setFormData({ ...formData, subject: v })}>
                                <SelectTrigger className="border-warm-gray">
                                    <SelectValue placeholder="Pilih mata kuliah" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="FISDAS2">Fisika Dasar 2</SelectItem>
                                    <SelectItem value="FISMAT">Fisika Matematika</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Options A-E with inline preview (Only for MCQ) */}
                        {formData.type === "MULTIPLE_CHOICE" ? (
                            <div className="space-y-3">
                                <Label className="text-sm font-medium">Opsi Jawaban</Label>
                                {["A", "B", "C", "D", "E"].map((opt) => (
                                    <div key={opt} className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-full bg-warm-beige text-soft-brown text-xs font-semibold flex items-center justify-center shrink-0">
                                                {opt}
                                            </span>
                                            <Input
                                                value={formData[`option${opt}` as keyof typeof formData] as string}
                                                onChange={(e) => setFormData({ ...formData, [`option${opt}`]: e.target.value })}
                                                placeholder={`Opsi ${opt}${opt === "E" ? " (opsional)" : ""} — mendukung LaTeX`}
                                                className="border-warm-gray"
                                            />
                                        </div>
                                        <LatexPreview content={formData[`option${opt}` as keyof typeof formData] as string} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                                <p className="text-sm text-blue-800">
                                    <strong>Format Essay:</strong> Opsi A-E tidak diperlukan. Jawaban benar akan disimpan langsung.
                                </p>
                            </div>
                        )}

                        {/* Correct answer */}
                        <div className="space-y-2">
                            <Label>{formData.type === "MULTIPLE_CHOICE" ? "Jawaban Benar *" : "Kunci Jawaban / Hasil Akhir *"}</Label>
                            {formData.type === "MULTIPLE_CHOICE" ? (
                                <Select value={formData.correctAnswer} onValueChange={(v) => setFormData({ ...formData, correctAnswer: v })}>
                                    <SelectTrigger className="border-warm-gray"><SelectValue placeholder="Pilih jawaban" /></SelectTrigger>
                                    <SelectContent>
                                        {["A", "B", "C", "D", "E"].map((o) => (
                                            <SelectItem key={o} value={o}>{o}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Input
                                    value={formData.correctAnswer}
                                    onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                                    placeholder="Contoh: 125, x=5, atau teks jawaban singkat"
                                    className="border-warm-gray"
                                />
                            )}
                        </div>

                        {/* Explanation with preview */}
                        <div className="space-y-2">
                            <Label>Pembahasan (opsional)</Label>
                            <Textarea
                                value={formData.explanation}
                                onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                                placeholder={"Jelaskan jawaban yang benar...\nMendukung LaTeX: $F = qE$"}
                                className="border-warm-gray min-h-[100px] font-mono text-sm"
                            />
                            <LatexPreview content={formData.explanation} label="Preview Pembahasan" />
                        </div>
                    </div>

                    <DialogFooter className="mt-4">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowForm(false)
                                resetForm()
                            }}
                        >
                            Batal
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={submitting || isCompressing}
                            className="bg-dark-brown hover:bg-soft-brown text-cream"
                        >
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Simpan Soal
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deletingId} onOpenChange={(open: boolean) => !open && setDeletingId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Soal?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Soal ini akan dihapus secara permanen dari sistem.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Ya, Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
