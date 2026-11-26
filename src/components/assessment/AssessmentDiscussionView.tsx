import { createClient, createServiceClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import MarkdownLatex from "@/components/ui/markdown-latex"
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle, Info } from "lucide-react"
import Image from "next/image"

interface QuestionRecord {
    id: string
    text: string
    option_a: string
    option_b: string
    option_c: string
    option_d: string
    option_e: string | null
    correct_answer: string
    explanation: string | null
    image_url: string | null
}

interface AnswerRecord {
    question_id: string
    answer: string | null
    is_correct: boolean | null
}

export interface AssessmentDiscussionViewProps {
    tryoutId: string
    mode: "latihan" | "tryouts"
}

export async function AssessmentDiscussionView({ tryoutId, mode }: AssessmentDiscussionViewProps) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
        redirect("/login")
    }

    const adminSupabase = createServiceClient()

    const { data: profile } = await adminSupabase
        .from("users")
        .select("id")
        .eq("auth_id", user.id)
        .single()

    if (!profile) {
        redirect("/dashboard")
    }

    const { data: submission } = await adminSupabase
        .from("submissions")
        .select("*, tryouts(*)")
        .eq("user_id", profile.id)
        .eq("tryout_id", tryoutId)
        .neq("status", "IN_PROGRESS")
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

    if (!submission) {
        redirect(`/dashboard/${mode}/${tryoutId}`)
    }

    const { data: answers } = await adminSupabase
        .from("answers")
        .select("question_id, answer, is_correct")
        .eq("submission_id", submission.id)

    const questionIds: string[] = submission.question_order || []
    const { data: questionsData } = await adminSupabase
        .from("questions")
        .select("id, text, option_a, option_b, option_c, option_d, option_e, correct_answer, explanation, image_url")
        .in("id", questionIds)

    const typedQuestions = (questionsData || []) as QuestionRecord[]
    const typedAnswers = (answers || []) as AnswerRecord[]

    const orderedQuestions = questionIds
        .map((qId: string, index: number) => {
            const question = typedQuestions.find((q) => q.id === qId)
            if (!question) return null
            const answer = typedAnswers.find((a) => a.question_id === qId)

            return {
                index: index + 1,
                ...question,
                userAnswer: answer?.answer || null,
                isCorrect: answer?.is_correct || false,
            }
        })
        .filter((q): q is NonNullable<typeof q> => q !== null)

    const getOptionText = (question: QuestionRecord, optionKey: string) => {
        const map: Record<string, string | null> = {
            A: question.option_a,
            B: question.option_b,
            C: question.option_c,
            D: question.option_d,
            E: question.option_e,
        }
        return map[optionKey] || ""
    }

    const isPractice = mode === "latihan"

    return (
        <div className="max-w-4xl mx-auto space-y-6 font-sans">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href={`/dashboard/${mode}/${tryoutId}/result?submissionId=${submission.id}&score=${submission.score}&correct=${submission.correct_count}&total=${submission.total_count}`}
                    className="w-10 h-10 bg-surface-white border-2 border-[#171717] dark:border-[#3F3F46] flex items-center justify-center technical-shadow-sm hover:bg-accent-canary hover:text-[#171717] text-[#171717] dark:text-[#F5F4EE] dark:hover:text-[#171717] transition-all shrink-0"
                >
                    <ArrowLeft className="w-5 h-5 stroke-[2]" />
                </Link>
                <div>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-alert-rust block">
                        {isPractice ? "EVALUASI // PEMBAHASAN_LATIHAN" : "EVALUASI // PEMBAHASAN_TRYOUT"}
                    </span>
                    <h1 className="text-xl sm:text-2xl font-black text-[#171717] dark:text-[#F5F4EE] tracking-tight">
                        {isPractice ? "Pembahasan Latihan" : "Pembahasan Tryout"}
                    </h1>
                    <p className="text-sm text-ink-muted font-medium">{submission.tryouts.title}</p>
                </div>
            </div>

            {/* Score summary */}
            <div className="bg-surface-white border-2 border-[#171717] dark:border-[#3F3F46] technical-shadow relative tick-corner">
                <div className="border-b-2 border-[#171717] dark:border-[#3F3F46] bg-canvas-paper px-4 py-2.5 flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#171717] dark:text-[#F5F4EE] uppercase tracking-wider">
                        Ringkasan Hasil
                    </span>
                    <span className={`font-mono text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 border ${
                        submission.status === "TIMED_OUT"
                            ? "bg-alert-rust text-white border-[#171717]"
                            : "bg-accent-canary text-[#171717] border-[#171717]"
                    }`}>
                        {submission.status === "TIMED_OUT" ? "Waktu Habis" : "Selesai"}
                    </span>
                </div>
                <div className="p-5 flex flex-wrap items-center gap-4">
                    <div className="text-center bg-canvas-paper border-2 border-[#171717] dark:border-[#3F3F46] px-5 py-2.5 technical-shadow-sm">
                        <p className="font-mono text-[10px] text-ink-muted font-bold uppercase tracking-wider">Skor Akhir</p>
                        <p className="font-mono text-2xl font-black text-[#171717] dark:text-[#F5F4EE]">{submission.score}%</p>
                    </div>
                    <div className="text-center bg-canvas-paper border-2 border-[#171717] dark:border-[#3F3F46] px-5 py-2.5 technical-shadow-sm">
                        <p className="font-mono text-[10px] text-ink-muted font-bold uppercase tracking-wider">Benar</p>
                        <p className="font-mono text-2xl font-black text-emerald-700 dark:text-emerald-400">
                            {submission.correct_count}/{submission.total_count}
                        </p>
                    </div>
                </div>
            </div>

            {/* Questions */}
            <div className="space-y-6">
                {orderedQuestions.map((q) => (
                    <div key={q.id} className="bg-surface-white border-2 border-[#171717] dark:border-[#3F3F46] technical-shadow overflow-hidden">
                        <div className="bg-canvas-paper px-5 py-3 border-b-2 border-[#171717] dark:border-[#3F3F46] flex justify-between items-center">
                            <h3 className="font-mono font-black text-[#171717] dark:text-[#F5F4EE] text-xs uppercase tracking-wider">
                                SOAL NO. {String(q.index).padStart(2, "0")}
                            </h3>
                            {q.isCorrect ? (
                                <span className="font-mono text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-500 px-2.5 py-0.5 flex items-center gap-1 uppercase">
                                    <CheckCircle2 className="w-3 h-3" /> BENAR
                                </span>
                            ) : (
                                <span className="font-mono text-[10px] font-bold text-rose-800 dark:text-rose-300 bg-rose-100 dark:bg-rose-950/60 border border-rose-500 px-2.5 py-0.5 flex items-center gap-1 uppercase">
                                    <XCircle className="w-3 h-3" /> SALAH
                                </span>
                            )}
                        </div>

                        <div className="p-5 sm:p-6 space-y-6">
                            <div className="text-sm sm:text-base text-[#171717] dark:text-[#F5F4EE]">
                                <MarkdownLatex>{q.text}</MarkdownLatex>
                            </div>

                            {q.image_url && (
                                <div className="relative w-full max-w-lg h-64 mx-auto overflow-hidden border-2 border-[#171717] dark:border-[#3F3F46] bg-white p-2">
                                    <Image
                                        src={q.image_url}
                                        alt="Gambar soal"
                                        fill
                                        style={{ objectFit: "contain" }}
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-3">
                                {["A", "B", "C", "D", "E"].map((opt) => {
                                    const optionText = getOptionText(q, opt)
                                    if (!optionText) return null

                                    const isUserChoice = q.userAnswer === opt
                                    const isCorrectChoice = q.correct_answer === opt

                                    let containerClass = "bg-canvas-paper border-[#D4D2C9] dark:border-[#3F3F46]"
                                    let badgeClass = "bg-surface-white text-[#171717] dark:text-[#F5F4EE] border-[#171717] dark:border-[#3F3F46]"
                                    let icon = null

                                    if (isCorrectChoice) {
                                        containerClass = "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-600 dark:border-emerald-400"
                                        badgeClass = "bg-emerald-700 dark:bg-emerald-500 text-white dark:text-[#171717] border-emerald-800 dark:border-emerald-400"
                                        icon = <CheckCircle2 className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0 stroke-[2]" />
                                    } else if (isUserChoice && !isCorrectChoice) {
                                        containerClass = "bg-rose-50 dark:bg-rose-950/40 border-rose-600 dark:border-rose-400"
                                        badgeClass = "bg-rose-700 dark:bg-rose-500 text-white border-rose-800 dark:border-rose-400"
                                        icon = <XCircle className="w-5 h-5 text-rose-700 dark:text-rose-400 shrink-0 stroke-[2]" />
                                    }

                                    return (
                                        <div
                                            key={opt}
                                            className={`flex p-3.5 border-2 items-start ${containerClass}`}
                                        >
                                            <div className="flex-1 flex gap-3 min-w-0">
                                                <span className={`font-mono font-black shrink-0 w-7 h-7 flex items-center justify-center text-xs border ${badgeClass}`}>
                                                    {opt}
                                                </span>
                                                <div className="flex-1 min-w-0 text-sm text-[#171717] dark:text-[#F5F4EE]">
                                                    <MarkdownLatex>{optionText}</MarkdownLatex>
                                                </div>
                                            </div>
                                            {icon && <div className="ml-3 mt-0.5">{icon}</div>}
                                        </div>
                                    )
                                })}
                            </div>

                            {!q.userAnswer && (
                                <div className="flex items-center gap-2 font-mono text-xs text-amber-900 dark:text-amber-300 font-bold bg-amber-50 dark:bg-amber-950/40 p-3 border-2 border-amber-500 dark:border-amber-500/70">
                                    <AlertCircle className="w-4 h-4 stroke-[2] shrink-0" />
                                    <span>Kamu tidak menjawab soal ini.</span>
                                </div>
                            )}

                            {q.explanation && (
                                <div className="border-2 border-[#171717] dark:border-[#3F3F46] overflow-hidden technical-shadow-sm">
                                    <div className="bg-accent-canary px-4 py-2 border-b-2 border-[#171717] dark:border-[#3F3F46] flex items-center gap-2">
                                        <Info className="w-4 h-4 text-[#171717] stroke-[2]" />
                                        <h4 className="font-mono font-black text-[#171717] text-xs uppercase tracking-wider">
                                            Pembahasan Soal
                                        </h4>
                                    </div>
                                    <div className="bg-canvas-paper p-5 text-sm text-[#171717] dark:text-[#F5F4EE]">
                                        <MarkdownLatex>{q.explanation}</MarkdownLatex>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-center pt-4 pb-8">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 bg-accent-canary hover:bg-[#fde667] text-[#171717] font-mono font-black text-xs uppercase tracking-wider px-6 py-3 border-2 border-[#171717] dark:border-[#FDE047] technical-shadow transition-all"
                >
                    <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                    Kembali ke Dashboard
                </Link>
            </div>
        </div>
    )
}

