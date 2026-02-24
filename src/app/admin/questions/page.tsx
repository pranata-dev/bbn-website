"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Plus, HelpCircle, Loader2, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { CATEGORY_LABELS } from "@/types"

interface QuestionItem {
    id: string
    text: string
    category: string
    option_a: string
    option_b: string
    option_c: string
    option_d: string
    option_e: string | null
    correct_answer: string
    explanation: string | null
    weight: number
    created_at: string
}

export default function QuestionsPage() {
    const [questions, setQuestions] = useState<QuestionItem[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [filter, setFilter] = useState("all")
    const [formData, setFormData] = useState({
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
    })

    useEffect(() => {
        fetchQuestions()
    }, [filter])

    const fetchQuestions = async () => {
        try {
            const params = new URLSearchParams()
            if (filter !== "all") params.set("category", filter)
            const res = await fetch(`/api/questions?${params}`)
            const data = await res.json()
            setQuestions(data.questions || [])
        } catch (error) {
            console.error("Failed to fetch questions:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async () => {
        if (!formData.text || !formData.category || !formData.correctAnswer) {
            toast.error("Mohon isi semua field yang diperlukan.")
            return
        }

        setSubmitting(true)
        try {
            const res = await fetch("/api/questions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            if (!res.ok) throw new Error("Failed to create question")

            toast.success("Soal berhasil ditambahkan.")
            setShowForm(false)
            setFormData({
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
            })
            fetchQuestions()
        } catch (error) {
            toast.error("Gagal menambahkan soal.")
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
                        <SelectTrigger className="w-[180px] bg-white border-warm-gray">
                            <SelectValue placeholder="Filter" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua</SelectItem>
                            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                                <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
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
                            {questions.map((q, i) => (
                                <div key={q.id} className="p-4 hover:bg-warm-beige/30 transition-colors">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge variant="secondary" className="bg-warm-beige text-soft-brown text-xs">
                                                    {CATEGORY_LABELS[q.category as keyof typeof CATEGORY_LABELS] || q.category}
                                                </Badge>
                                                <Badge variant="outline" className="text-xs border-warm-gray">
                                                    Bobot: {q.weight}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-foreground line-clamp-2">{q.text}</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Jawaban: {q.correct_answer}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add question dialog */}
            <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Tambah Soal Baru</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Soal</Label>
                            <Textarea
                                value={formData.text}
                                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                                placeholder="Tulis soal di sini..."
                                className="border-warm-gray min-h-[80px]"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Kategori</Label>
                                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                                    <SelectTrigger className="border-warm-gray"><SelectValue placeholder="Pilih" /></SelectTrigger>
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

                        {["A", "B", "C", "D", "E"].map((opt) => (
                            <div key={opt} className="space-y-2">
                                <Label>Opsi {opt} {opt === "E" ? "(opsional)" : ""}</Label>
                                <Input
                                    value={formData[`option${opt}` as keyof typeof formData] as string}
                                    onChange={(e) => setFormData({ ...formData, [`option${opt}`]: e.target.value })}
                                    placeholder={`Opsi ${opt}`}
                                    className="border-warm-gray"
                                />
                            </div>
                        ))}

                        <div className="space-y-2">
                            <Label>Jawaban Benar</Label>
                            <Select value={formData.correctAnswer} onValueChange={(v) => setFormData({ ...formData, correctAnswer: v })}>
                                <SelectTrigger className="border-warm-gray"><SelectValue placeholder="Pilih" /></SelectTrigger>
                                <SelectContent>
                                    {["A", "B", "C", "D", "E"].map((o) => (
                                        <SelectItem key={o} value={o}>{o}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Pembahasan (opsional)</Label>
                            <Textarea
                                value={formData.explanation}
                                onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                                placeholder="Jelaskan jawaban yang benar..."
                                className="border-warm-gray"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowForm(false)}>Batal</Button>
                        <Button onClick={handleSubmit} disabled={submitting} className="bg-dark-brown hover:bg-soft-brown text-cream">
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Simpan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
