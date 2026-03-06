import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import MarkdownLatex from "@/components/ui/markdown-latex"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle, Info } from "lucide-react"
import Image from "next/image"

export const dynamic = "force-dynamic"

export default async function LatihanDiscussionPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: tryoutId } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect("/login")
    }

    // Get user profile
    const { data: profile } = await supabase
        .from("users")
        .select("id")
        .eq("auth_id", user.id)
        .single()

    if (!profile) {
        redirect("/dashboard")
    }

    // Get the latest completed submission
    const { data: submission } = await supabase
        .from("submissions")
        .select("*, tryouts(*)")
        .eq("user_id", profile.id)
        .eq("tryout_id", tryoutId)
        .neq("status", "IN_PROGRESS") // Must be completed (SUBMITTED or TIMED_OUT)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

    if (!submission) {
        redirect(`/dashboard/latihan/${tryoutId}`)
    }

    // Get answers
    const { data: answers } = await supabase
        .from("answers")
        .select("*")
        .eq("submission_id", submission.id)

    // Get questions
    const questionIds = submission.question_order || []
    const { data: questionsData } = await supabase
        .from("questions")
        .select("*")
        .in("id", questionIds)

    // Format and order questions to match the submission's randomized order
    const orderedQuestions = questionIds.map((qId: string, index: number) => {
        const question = questionsData?.find((q: any) => q.id === qId)
        const answer = answers?.find((a: any) => a.question_id === qId)

        return {
            index: index + 1,
            ...question,
            userAnswer: answer?.answer || null,
            isCorrect: answer?.is_correct || false
        }
    }).filter((q: any) => q.id) // Filter out any missing questions

    const getOptionText = (question: any, optionKey: string) => {
        const key = `option_${optionKey.toLowerCase()}`
        return question[key] || ""
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="hover:bg-warm-beige hover:text-dark-brown">
                    <Link href={`/dashboard/latihan/${tryoutId}/result?score=${submission.score}&correct=${submission.correct_count}&total=${submission.total_count}`}>
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold font-serif text-dark-brown">Pembahasan Latihan</h1>
                    <p className="text-muted-foreground">{submission.tryouts.title}</p>
                </div>
            </div>

            <Card className="border-warm-gray/60 bg-warm-beige shadow-sm">
                <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="text-center px-4 py-2 bg-cream rounded-lg border border-warm-gray">
                            <p className="text-sm text-muted-foreground mb-1">Skor Akhir</p>
                            <p className="text-2xl font-bold text-dark-brown">{submission.score}%</p>
                        </div>
                        <div className="text-center px-4 py-2 bg-cream rounded-lg border border-warm-gray">
                            <p className="text-sm text-muted-foreground mb-1">Benar</p>
                            <p className="text-2xl font-bold text-earthy-green">{submission.correct_count}/{submission.total_count}</p>
                        </div>
                    </div>
                    <Badge variant={submission.status === "TIMED_OUT" ? "destructive" : "default"} className={submission.status === "TIMED_OUT" ? "" : "bg-dark-brown"}>
                        {submission.status === "TIMED_OUT" ? "Waktu Habis" : "Selesai"}
                    </Badge>
                </CardContent>
            </Card>

            <div className="space-y-8">
                {orderedQuestions.map((q: any) => (
                    <Card key={q.id} className="border-warm-gray/60 shadow-md overflow-hidden">
                        <div className="bg-dark-brown/5 px-6 py-3 border-b border-warm-gray/60 flex justify-between items-center">
                            <h3 className="font-bold font-serif text-dark-brown">Soal {q.index}</h3>
                            {q.isCorrect ? (
                                <Badge className="bg-earthy-green hover:bg-earthy-green/90 text-white flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Benar
                                </Badge>
                            ) : (
                                <Badge variant="destructive" className="flex items-center gap-1.5">
                                    <XCircle className="w-3.5 h-3.5" /> Salah
                                </Badge>
                            )}
                        </div>
                        <CardContent className="p-6 space-y-6">
                            {/* Question Text */}
                            <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-dark-brown/5 prose-pre:text-dark-brown text-foreground">
                                <MarkdownLatex>{q.text}</MarkdownLatex>
                            </div>

                            {/* Question Image */}
                            {q.image_url && (
                                <div className="relative w-full max-w-lg h-64 mx-auto rounded-lg overflow-hidden border border-warm-gray/60">
                                    <Image
                                        src={q.image_url}
                                        alt="Gambar soal"
                                        fill
                                        style={{ objectFit: "contain" }}
                                    />
                                </div>
                            )}

                            {/* Options */}
                            <div className="grid grid-cols-1 gap-3">
                                {["A", "B", "C", "D", "E"].map((opt) => {
                                    const optionText = getOptionText(q, opt)
                                    if (!optionText) return null

                                    const isUserChoice = q.userAnswer === opt
                                    const isCorrectChoice = q.correct_answer === opt

                                    let bgClass = "bg-white border-warm-gray"
                                    let icon = null

                                    if (isCorrectChoice) {
                                        bgClass = "bg-green-50/50 border-earthy-green ring-1 ring-earthy-green"
                                        icon = <CheckCircle2 className="w-5 h-5 text-earthy-green shrink-0" />
                                    } else if (isUserChoice && !isCorrectChoice) {
                                        bgClass = "bg-red-50/50 border-red-500 ring-1 ring-red-500"
                                        icon = <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                                    }

                                    return (
                                        <div
                                            key={opt}
                                            className={`flex p-4 rounded-xl border items-start transition-colors ${bgClass}`}
                                        >
                                            <div className="flex-1 flex gap-3">
                                                <span className={`font-bold shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                                                    isCorrectChoice ? "bg-earthy-green text-white" :
                                                    isUserChoice && !isCorrectChoice ? "bg-red-500 text-white" :
                                                    "bg-warm-beige text-dark-brown"
                                                }`}>
                                                    {opt}
                                                </span>
                                                <div className="prose prose-sm max-w-none text-foreground mt-0.5">
                                                    <MarkdownLatex>{optionText}</MarkdownLatex>
                                                </div>
                                            </div>
                                            {icon && <div className="ml-3 mt-0.5">{icon}</div>}
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Unanswered Badge */}
                            {!q.userAnswer && (
                                <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
                                    <AlertCircle className="w-4 h-4" />
                                    <span>Kamu tidak menjawab soal ini.</span>
                                </div>
                            )}

                            {/* Explanation */}
                            {q.explanation && (
                                <div className="mt-8 rounded-xl border border-warm-gray/60 overflow-hidden">
                                    <div className="bg-warm-beige px-5 py-3 border-b border-warm-gray/60 flex items-center gap-2">
                                        <Info className="w-4 h-4 text-soft-brown" />
                                        <h4 className="font-bold text-dark-brown">Pembahasan</h4>
                                    </div>
                                    <div className="bg-white p-5 prose prose-sm max-w-none text-foreground">
                                        <MarkdownLatex>{q.explanation}</MarkdownLatex>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
            
            <div className="flex justify-center pt-4 pb-8">
                <Button asChild variant="outline" className="border-warm-gray text-dark-brown hover:bg-warm-beige hover:text-dark-brown">
                    <Link href="/dashboard">Kembali ke Dashboard</Link>
                </Button>
            </div>
        </div>
    )
}
