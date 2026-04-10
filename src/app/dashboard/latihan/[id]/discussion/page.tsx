import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import MarkdownLatex from "@/components/ui/markdown-latex"
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
        <div className="max-w-4xl mx-auto space-y-6 font-mono">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href={`/dashboard/latihan/${tryoutId}/result?score=${submission.score}&correct=${submission.correct_count}&total=${submission.total_count}`}
                    className="w-10 h-10 bg-[#FEFCF3] border-2 border-[#2b1b11] flex items-center justify-center shadow-[2px_2px_0px_#2b1b11] hover:shadow-[3px_3px_0px_#2b1b11] hover:-translate-y-0.5 transition-all shrink-0"
                >
                    <ArrowLeft className="w-5 h-5 text-[#2b1b11] stroke-[2]" />
                </Link>
                <div>
                    <h1 className="text-lg font-bold text-[#2b1b11]" style={{ fontFamily: "var(--font-press-start)", fontSize: "0.85rem", lineHeight: 1.5 }}>
                        Pembahasan Latihan
                    </h1>
                    <p className="text-sm text-[#3c5443] font-bold">{submission.tryouts.title}</p>
                </div>
            </div>

            {/* Score summary */}
            <div className="bg-[#FEFCF3] border-4 border-[#2b1b11] shadow-[4px_4px_0px_#2b1b11]">
                <div className="border-b-4 border-[#2b1b11] bg-[#bed3c6] px-4 py-2">
                    <span className="text-xs font-bold text-[#2b1b11] uppercase tracking-wider">Ringkasan Hasil</span>
                </div>
                <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="text-center bg-[#bed3c6] border-4 border-[#2b1b11] px-4 py-2 shadow-[2px_2px_0px_#2b1b11]">
                            <p className="text-[10px] text-[#3c5443] font-bold uppercase tracking-wider">Skor Akhir</p>
                            <p className="text-2xl font-extrabold text-[#2b1b11]">{submission.score}%</p>
                        </div>
                        <div className="text-center bg-[#bed3c6] border-4 border-[#2b1b11] px-4 py-2 shadow-[2px_2px_0px_#2b1b11]">
                            <p className="text-[10px] text-[#3c5443] font-bold uppercase tracking-wider">Benar</p>
                            <p className="text-2xl font-extrabold text-[#2b1b11]">{submission.correct_count}/{submission.total_count}</p>
                        </div>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 border-2 ${
                        submission.status === "TIMED_OUT" 
                            ? "bg-[#e87a5d] text-[#FEFCF3] border-[#2b1b11]" 
                            : "bg-[#2b1b11] text-[#FEFCF3] border-[#2b1b11]"
                    }`}>
                        {submission.status === "TIMED_OUT" ? "Waktu Habis" : "Selesai"}
                    </span>
                </div>
            </div>

            {/* Questions */}
            <div className="space-y-8">
                {orderedQuestions.map((q: any) => (
                    <div key={q.id} className="bg-[#FEFCF3] border-4 border-[#2b1b11] shadow-[4px_4px_0px_#2b1b11] overflow-hidden">
                        {/* Question header */}
                        <div className="bg-[#bed3c6] px-4 py-3 border-b-4 border-[#2b1b11] flex justify-between items-center">
                            <h3 className="font-bold text-[#2b1b11] text-sm" style={{ fontFamily: "var(--font-press-start)", fontSize: "0.65rem" }}>
                                Soal {q.index}
                            </h3>
                            {q.isCorrect ? (
                                <span className="text-[10px] font-bold text-[#FEFCF3] bg-[#3c5443] border-2 border-[#2b1b11] px-2 py-0.5 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> BENAR
                                </span>
                            ) : (
                                <span className="text-[10px] font-bold text-[#FEFCF3] bg-[#e87a5d] border-2 border-[#2b1b11] px-2 py-0.5 flex items-center gap-1">
                                    <XCircle className="w-3 h-3" /> SALAH
                                </span>
                            )}
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Question Text */}
                            <div className="prose prose-sm max-w-none text-[#2b1b11] font-bold">
                                <MarkdownLatex>{q.text}</MarkdownLatex>
                            </div>

                            {/* Question Image */}
                            {q.image_url && (
                                <div className="relative w-full max-w-lg h-64 mx-auto overflow-hidden border-2 border-[#2b1b11]">
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

                                    let containerClass = "bg-[#FEFCF3] border-[#2b1b11]/30"
                                    let badgeClass = "bg-[#bed3c6] text-[#2b1b11] border-[#2b1b11]"
                                    let icon = null

                                    if (isCorrectChoice) {
                                        containerClass = "bg-green-50 border-[#3c5443] border-4"
                                        badgeClass = "bg-[#3c5443] text-[#FEFCF3] border-[#2b1b11]"
                                        icon = <CheckCircle2 className="w-5 h-5 text-[#3c5443] shrink-0 stroke-[2]" />
                                    } else if (isUserChoice && !isCorrectChoice) {
                                        containerClass = "bg-red-50 border-[#e87a5d] border-4"
                                        badgeClass = "bg-[#e87a5d] text-[#FEFCF3] border-[#2b1b11]"
                                        icon = <XCircle className="w-5 h-5 text-[#e87a5d] shrink-0 stroke-[2]" />
                                    }

                                    return (
                                        <div
                                            key={opt}
                                            className={`flex p-3 border-2 items-start ${containerClass}`}
                                        >
                                            <div className="flex-1 flex gap-3">
                                                <span className={`font-extrabold shrink-0 w-7 h-7 flex items-center justify-center text-xs border-2 ${badgeClass}`}>
                                                    {opt}
                                                </span>
                                                <div className="prose prose-sm max-w-none text-[#2b1b11] mt-0.5 font-bold">
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
                                <div className="flex items-center gap-2 text-xs text-amber-700 font-bold bg-amber-50 p-3 border-2 border-amber-500 shadow-[2px_2px_0px_#b45309]">
                                    <AlertCircle className="w-4 h-4 stroke-[2]" />
                                    <span>Kamu tidak menjawab soal ini.</span>
                                </div>
                            )}

                            {/* Explanation */}
                            {q.explanation && (
                                <div className="border-4 border-[#2b1b11] overflow-hidden shadow-[2px_2px_0px_#2b1b11]">
                                    <div className="bg-[#bed3c6] px-4 py-2 border-b-4 border-[#2b1b11] flex items-center gap-2">
                                        <Info className="w-4 h-4 text-[#2b1b11] stroke-[2]" />
                                        <h4 className="font-bold text-[#2b1b11] text-xs uppercase tracking-wider">Pembahasan</h4>
                                    </div>
                                    <div className="bg-[#FEFCF3] p-5 prose prose-sm max-w-none text-[#2b1b11] font-bold">
                                        <MarkdownLatex>{q.explanation}</MarkdownLatex>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Back to Dashboard - uses colors readable in both light and dark mode */}
            <div className="flex justify-center pt-4 pb-8">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 bg-[#e87a5d] text-[#FEFCF3] font-bold text-sm px-6 py-3 border-2 border-[#2b1b11] shadow-[3px_3px_0px_#2b1b11] hover:shadow-[4px_4px_0px_#2b1b11] hover:-translate-y-0.5 transition-all"
                >
                    <ArrowLeft className="w-4 h-4 stroke-[3]" />
                    Kembali ke Dashboard
                </Link>
            </div>
        </div>
    )
}
