"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Loader2, ArrowLeft, CheckCircle2, XCircle, FileText } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import MarkdownLatex from "@/components/ui/markdown-latex"

interface PracticeQuestion {
    id: string
    text: string
    image_url: string | null
    options: any // Expected to be array or dict
    correct_answer: string
    explanation: string | null
}

export default function PracticePage() {
    const params = useParams()
    const router = useRouter()
    const validId = typeof params?.id === "string" ? params.id : null

    const [questions, setQuestions] = useState<PracticeQuestion[]>([])
    const [latihanData, setLatihanData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [currentIndex, setCurrentIndex] = useState(0)

    // Track user answers globally for the session
    const [userAnswers, setUserAnswers] = useState<Record<string, string>>({})

    useEffect(() => {
        if (!validId) return
        fetchPracticeData()
    }, [validId])

    const fetchPracticeData = async () => {
        try {
            const supabase = createClient()
            
            // Fetch Latihan Metadata
            const { data: latihan, error: latihanErr } = await supabase
                .from("tryouts")
                .select("title")
                .eq("id", validId)
                .single()
            if (latihanErr) throw latihanErr
            setLatihanData(latihan)

            // Fetch Questions
            const { data: links, error: linkErr } = await supabase
                .from("tryout_questions")
                .select("questions(*)")
                .eq("tryout_id", validId)
                .order("order", { ascending: true })

            if (linkErr) throw linkErr

            const formattedQuestions = links?.map((link: any) => link.questions) || []
            setQuestions(formattedQuestions)

        } catch (error: any) {
            console.error("Fetch error:", error)
            toast.error("Gagal memuat soal latihan.")
        } finally {
            setLoading(false)
        }
    }

    const handleOptionSelect = (qId: string, optionKey: string) => {
        // Prevent changing answer once selected to enforce "immediate feedback constraint" where they learn from their first choice.
        if (userAnswers[qId]) return
        
        setUserAnswers(prev => ({
            ...prev,
            [qId]: optionKey
        }))
    }

    if (loading) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-muted-foreground mb-4" />
                <p className="text-muted-foreground font-medium">Memuat latihan soal...</p>
            </div>
        )
    }

    if (!questions.length) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
                <p className="text-xl font-semibold mb-2">Tidak ada soal.</p>
                <Button onClick={() => router.back()} variant="outline">Kembali</Button>
            </div>
        )
    }

    const currentQuestion = questions[currentIndex]
    let options = []
    if (Array.isArray(currentQuestion.options)) {
        options = currentQuestion.options
    } else if (typeof currentQuestion.options === "object" && currentQuestion.options !== null) {
        options = Object.entries(currentQuestion.options).map(([k, v]) => ({ key: k, text: v }))
    }

    const userAnswer = userAnswers[currentQuestion.id]
    const isAnswered = !!userAnswer
    const isCorrect = userAnswer === currentQuestion.correct_answer

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-warm-gray/60 shadow-sm sticky top-4 z-10">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => router.push(`/dashboard/latihan/${validId}`)}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="font-semibold text-foreground">{latihanData?.title || "Latihan Soal"}</h1>
                        <p className="text-xs text-muted-foreground">Soal {currentIndex + 1} dari {questions.length}</p>
                    </div>
                </div>
            </div>

            {/* Pagination Grid */}
            <Card className="border-warm-gray/60 shadow-sm">
                <CardContent className="p-4">
                    <div className="flex flex-wrap gap-2">
                        {questions.map((q, idx) => {
                            const answered = !!userAnswers[q.id]
                            const correct = userAnswers[q.id] === q.correct_answer
                            
                            let variant: any = "outline"
                            if (currentIndex === idx) variant = "default"
                            else if (answered) variant = correct ? "success" : "destructive"

                            return (
                                <Button
                                    key={q.id}
                                    variant={variant}
                                    size="sm"
                                    className={`w-10 h-10 rounded-full font-medium transition-all
                                        ${currentIndex === idx ? 'bg-dark-brown text-white hover:bg-soft-brown scale-110 shadow-md' : ''}
                                        ${answered && currentIndex !== idx && correct ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200' : ''}
                                        ${answered && currentIndex !== idx && !correct ? 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200' : ''}
                                        ${!answered && currentIndex !== idx ? 'hover:border-soft-brown/50 hover:bg-warm-beige' : ''}
                                    `}
                                    onClick={() => setCurrentIndex(idx)}
                                >
                                    {idx + 1}
                                </Button>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Question Display */}
            <Card className="border-warm-gray/60 shadow-sm overflow-hidden">
                <div className="bg-warm-beige/30 p-4 border-b border-warm-gray/30 flex justify-between items-center">
                    <Badge variant="secondary" className="bg-white/80 backdrop-blur text-soft-brown">
                        Soal No. {currentIndex + 1}
                    </Badge>
                </div>
                <CardContent className="p-6 sm:p-8 space-y-8">
                    {/* Question Content */}
                    <div className="prose prose-sm max-w-none text-foreground/90 leading-relaxed md:text-base">
                        <MarkdownLatex>{currentQuestion.text}</MarkdownLatex>
                    </div>
                    {currentQuestion.image_url && (
                        <div className="rounded-lg overflow-hidden border border-warm-gray/30 mb-6 bg-cream p-2">
                            <img
                                src={currentQuestion.image_url}
                                alt="Gambar Soal"
                                className="w-full max-w-2xl mx-auto h-auto rounded-md"
                            />
                        </div>
                    )}

                    {/* Options */}
                    <div className="space-y-3 pt-4">
                        {options.map((opt: any) => {
                            const key = opt.key || opt.id || opt.label
                            const text = opt.text || opt.value || opt.content

                            const isSelected = userAnswer === key
                            const isCorrectOption = key === currentQuestion.correct_answer

                            // Styling logic based on interaction state
                            let optionClass = "border-warm-gray/40 hover:border-soft-brown hover:bg-warm-beige/20 bg-white"
                            let badgeClass = "bg-warm-beige text-muted-foreground border-transparent"

                            if (isAnswered) {
                                if (isCorrectOption) {
                                    // Highlight the correct option in green
                                    optionClass = "border-emerald-500 bg-emerald-50/50 shadow-sm"
                                    badgeClass = "bg-emerald-500 text-white border-emerald-600"
                                } else if (isSelected && !isCorrectOption) {
                                    // Highlight the wrongly selected option in red
                                    optionClass = "border-red-500 bg-red-50/50"
                                    badgeClass = "bg-red-500 text-white border-red-600"
                                } else {
                                    // Dim other unselected incorrect options
                                    optionClass = "border-warm-gray/20 bg-white/50 opacity-60"
                                }
                            }

                            return (
                                <div
                                    key={key}
                                    onClick={() => handleOptionSelect(currentQuestion.id, key)}
                                    className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 group ${optionClass} ${!isAnswered ? "hover:-translate-y-0.5" : "cursor-default"}`}
                                >
                                    <div className="flex items-start gap-4 w-full">
                                        <div className={`mt-0.5 shrink-0 flex items-center justify-center w-8 h-8 rounded-lg border font-semibold text-sm transition-colors ${badgeClass}`}>
                                            {key}
                                        </div>
                                        <div className="flex-1 mt-1 prose prose-sm max-w-none text-sm text-foreground/90">
                                            <MarkdownLatex>{text}</MarkdownLatex>
                                        </div>
                                        
                                        {/* Status Icon */}
                                        {isAnswered && isCorrectOption && (
                                            <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0 mt-1 drop-shadow-sm" />
                                        )}
                                        {isAnswered && isSelected && !isCorrectOption && (
                                            <XCircle className="w-6 h-6 text-red-500 shrink-0 mt-1 drop-shadow-sm" />
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Pembahasan / Explanation Section */}
                    {isAnswered && (
                        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="rounded-xl border border-blue-200 bg-blue-50/50 overflow-hidden shadow-sm">
                                <div className="bg-blue-100/50 px-4 py-3 border-b border-blue-200 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-blue-700" />
                                    <h4 className="font-semibold text-blue-900 text-sm">Pembahasan</h4>
                                </div>
                                <div className="p-5 prose prose-sm max-w-none text-blue-950/80 md:text-base leading-relaxed">
                                    <MarkdownLatex>{currentQuestion.explanation || "Belum ada pembahasan yang ditambahkan pada soal ini."}</MarkdownLatex>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
                
                {/* Navigation Footer */}
                <div className="bg-warm-beige/10 p-4 border-t border-warm-gray/30 flex items-center justify-between">
                    <Button
                        variant="outline"
                        onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentIndex === 0}
                        className="border-warm-gray hover:bg-warm-beige/50"
                    >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Sebelumnya
                    </Button>
                    <Button
                        onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                        disabled={currentIndex === questions.length - 1}
                        className="bg-dark-brown hover:bg-soft-brown text-cream"
                    >
                        Selanjutnya
                        <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </Card>
        </div>
    )
}
