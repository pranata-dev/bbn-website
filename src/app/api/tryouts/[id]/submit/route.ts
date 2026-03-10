import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/server"
import { v4 as uuidv4 } from "uuid"

// POST /api/tryouts/[id]/submit - Submit tryout answers
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: tryoutId } = await params
        // Auth client
        const authClient = await createClient()
        const { data: { user } } = await authClient.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Service client for DB operations
        const supabase = createServiceClient()

        const { data: profile } = await supabase
            .from("users")
            .select("id")
            .eq("auth_id", user.id)
            .single()

        if (!profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 })
        }

        const body = await request.json()
        const { submissionId, answers } = body

        // Validate submission exists and belongs to user
        const { data: submission, error: submissionError } = await supabase
            .from("submissions")
            .select("*, tryouts(*)")
            .eq("id", submissionId)
            .eq("user_id", profile.id)
            .eq("tryout_id", tryoutId)
            .single()

        if (!submission || submissionError) {
            console.error("Submission fetch error:", submissionError)
            return NextResponse.json({ error: "Submission tidak ditemukan." }, { status: 404 })
        }

        if (submission.status !== "IN_PROGRESS") {
            return NextResponse.json({ error: "Tryout sudah di-submit." }, { status: 400 })
        }

        // Server-side time validation
        // PostgREST returns timestamps without 'Z' if the column is 'timestamp without time zone'.
        // We know it's UTC since we inserted it using toISOString(). Force UTC parsing.
        const startStr = submission.started_at
        const utcStartStr = startStr.endsWith("Z") ? startStr : startStr + "Z"
        const startTime = new Date(utcStartStr).getTime()
        const duration = submission.tryouts.duration * 60 * 1000 // Convert to ms
        const now = Date.now()
        const gracePeriod = 30000 // 30 seconds grace period

        const timedOut = now > startTime + duration + gracePeriod
        const status = timedOut ? "TIMED_OUT" : "SUBMITTED"

        // Get correct answers from database
        const questionIds = answers.map((a: { questionId: string }) => a.questionId)
        const { data: correctAnswers } = await supabase
            .from("questions")
            .select("id, correct_answer, weight")
            .in("id", questionIds)

        // Score the answers
        let correctCount = 0
        let totalWeight = 0
        let correctWeight = 0

        const answerRecords = answers.map((a: { questionId: string; answer: string | null }) => {
            const question = correctAnswers?.find((q: { id: string }) => q.id === a.questionId)
            const isCorrect = question ? a.answer === question.correct_answer : false
            const weight = question?.weight || 1

            totalWeight += weight
            if (isCorrect) {
                correctWeight += weight
                correctCount++
            }

            return {
                id: uuidv4(),
                submission_id: submissionId,
                question_id: a.questionId,
                answer: a.answer,
                is_correct: isCorrect,
                created_at: new Date().toISOString(),
            }
        })

        const score = totalWeight > 0 ? Math.round((correctWeight / totalWeight) * 10000) / 100 : 0

        // Save answers (upsert to overwrite auto-saved answers with final corrected status)
        const { error: answersError } = await supabase
            .from("answers")
            .upsert(answerRecords, {
                onConflict: "submission_id, question_id"
            })
            
        if (answersError) {
            console.error("Failed to upsert answers:", answersError)
            return NextResponse.json({ error: "Gagal menyimpan jawaban." }, { status: 500 })
        }

        // Update submission
        const { error: updateError } = await supabase
            .from("submissions")
            .update({
                status,
                score,
                total_weight: totalWeight,
                correct_count: correctCount,
                submitted_at: new Date().toISOString(),
            })
            .eq("id", submissionId)

        if (updateError) {
            console.error("Failed to update submission:", updateError)
            return NextResponse.json({ error: "Gagal mengupdate status submission." }, { status: 500 })
        }

        return NextResponse.json({
            score,
            correctCount,
            totalCount: answers.length,
            totalWeight,
            status,
        })
    } catch (error) {
        console.error("Submit tryout error:", error)
        return NextResponse.json({ error: "Internal error" }, { status: 500 })
    }
}
