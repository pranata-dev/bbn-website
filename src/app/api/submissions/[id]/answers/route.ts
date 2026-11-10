import { NextRequest, NextResponse } from "next/server"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import { v4 as uuidv4 } from "uuid"

interface TryoutMeta {
    duration?: number | null
    is_practice?: boolean | null
}

// PATCH /api/submissions/[id]/answers - Auto-save single answer, flagged state, or tab_switch_count
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: submissionId } = await params
        const body = await request.json()
        const { questionId, answer, flagged, incrementTabSwitch } = body as {
            questionId?: string
            answer?: string | null
            flagged?: boolean
            incrementTabSwitch?: boolean
        }

        if (!questionId && !incrementTabSwitch) {
            return NextResponse.json({ error: "questionId or incrementTabSwitch required" }, { status: 400 })
        }

        const authClient = await createClient()
        const { data: { user } } = await authClient.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const supabase = createServiceClient()

        // Verify user owns submission
        const { data: userRecord } = await supabase
            .from("users")
            .select("id")
            .eq("auth_id", user.id)
            .single()

        if (!userRecord) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        // Check if submission belongs to this user and is IN_PROGRESS
        const { data: submission } = await supabase
            .from("submissions")
            .select("id, status, started_at, tab_switch_count, tryouts(duration, is_practice)")
            .eq("id", submissionId)
            .eq("user_id", userRecord.id)
            .single()

        if (!submission || submission.status !== "IN_PROGRESS") {
            return NextResponse.json({ error: "Sesi tidak valid atau sudah selesai" }, { status: 400 })
        }

        const tryoutRaw = submission.tryouts as unknown as TryoutMeta | TryoutMeta[] | null
        const tryoutMeta = Array.isArray(tryoutRaw) ? tryoutRaw[0] : tryoutRaw
        const isPractice = Boolean(tryoutMeta?.is_practice)
        const durationMinutes = tryoutMeta?.duration || 0
        const startStr = submission.started_at
        const utcStartStr = startStr.endsWith("Z") ? startStr : startStr + "Z"
        const startedAtMs = new Date(utcStartStr).getTime()
        const gracePeriodMs = 30000

        // Only enforce timer timeout for non-practice tryout exams
        if (
            !isPractice &&
            durationMinutes > 0 &&
            Date.now() > startedAtMs + durationMinutes * 60 * 1000 + gracePeriodMs
        ) {
            await supabase
                .from("submissions")
                .update({ status: "TIMED_OUT" })
                .eq("id", submissionId)
            return NextResponse.json(
                { error: "Waktu pengerjaan tryout telah habis.", status: "TIMED_OUT" },
                { status: 403 }
            )
        }

        if (incrementTabSwitch) {
            await supabase
                .from("submissions")
                .update({ tab_switch_count: (submission.tab_switch_count || 0) + 1 })
                .eq("id", submissionId)
        }

        if (questionId) {
            const { data: existing } = await supabase
                .from("answers")
                .select("id, answer, flagged")
                .eq("submission_id", submissionId)
                .eq("question_id", questionId)
                .maybeSingle()

            if (existing) {
                const updatePayload: { answer?: string | null; flagged?: boolean } = {}
                if (answer !== undefined) updatePayload.answer = answer
                if (flagged !== undefined) updatePayload.flagged = flagged

                const { error: updateError } = await supabase
                    .from("answers")
                    .update(updatePayload)
                    .eq("id", existing.id)

                if (updateError) {
                    console.error("Failed to update answer:", updateError)
                    return NextResponse.json({ error: "Gagal mengupdate jawaban" }, { status: 500 })
                }
            } else {
                const { error: insertError } = await supabase
                    .from("answers")
                    .insert({
                        id: uuidv4(),
                        submission_id: submissionId,
                        question_id: questionId,
                        answer: answer ?? null,
                        flagged: flagged ?? false,
                    })

                if (insertError) {
                    console.error("Failed to insert answer:", insertError)
                    return NextResponse.json({ error: "Gagal menyimpan jawaban" }, { status: 500 })
                }
            }
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Auto-save error:", error)
        return NextResponse.json({ error: "Internal error" }, { status: 500 })
    }
}
