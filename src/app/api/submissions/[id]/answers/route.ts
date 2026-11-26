import { NextRequest, NextResponse } from "next/server"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import {
    createSupabaseTryoutStore,
    finalizeTimedOutSubmission,
    isSubmissionExpired,
} from "@/services/tryoutService"

// PATCH /api/submissions/[id]/answers - Auto-save single answer, flagged state, or tab_switch_count
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: submissionId } = await params
        const body = (await request.json()) as {
            questionId?: string
            answer?: string | null
            flagged?: boolean
            incrementTabSwitch?: boolean
        }
        const { questionId, answer, flagged, incrementTabSwitch } = body

        if (!questionId && !incrementTabSwitch) {
            return NextResponse.json({ error: "questionId or incrementTabSwitch required" }, { status: 400 })
        }

        const authClient = await createClient()
        const {
            data: { user },
        } = await authClient.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const supabase = createServiceClient()
        const store = createSupabaseTryoutStore(supabase)

        const profileId = await store.findProfileId(user.id)
        if (!profileId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const submission = await store.findSubmission(submissionId, profileId)
        if (!submission) {
            return NextResponse.json({ error: "Sesi tidak valid atau sudah selesai" }, { status: 400 })
        }

        if (submission.status === "TIMED_OUT" && submission.score === null) {
            await finalizeTimedOutSubmission(store, submission)
            return NextResponse.json(
                { error: "Waktu pengerjaan tryout telah habis.", status: "TIMED_OUT" },
                { status: 403 }
            )
        }

        if (submission.status !== "IN_PROGRESS") {
            return NextResponse.json(
                { error: "Sesi tidak valid atau sudah selesai", status: submission.status },
                { status: 409 }
            )
        }

        if (isSubmissionExpired(submission, Date.now())) {
            await finalizeTimedOutSubmission(store, submission)
            return NextResponse.json(
                { error: "Waktu pengerjaan tryout telah habis.", status: "TIMED_OUT" },
                { status: 403 }
            )
        }

        if (incrementTabSwitch) {
            const { data: nextCount, error: tabError } = await supabase.rpc(
                "increment_submission_tab_switch",
                { p_submission_id: submissionId }
            )

            if (tabError) {
                console.error("Failed to increment tab_switch_count:", tabError)
                return NextResponse.json({ error: "Gagal mencatat perpindahan tab" }, { status: 500 })
            }

            if (nextCount === null) {
                return NextResponse.json(
                    { error: "Sesi tidak valid atau sudah selesai" },
                    { status: 409 }
                )
            }
        }

        if (questionId) {
            const hasAnswer = answer !== undefined
            const hasFlagged = flagged !== undefined

            const { data: saved, error: upsertError } = await supabase.rpc(
                "upsert_submission_answer",
                {
                    p_submission_id: submissionId,
                    p_question_id: questionId,
                    p_answer: hasAnswer ? answer : null,
                    p_has_answer: hasAnswer,
                    p_flagged: hasFlagged ? Boolean(flagged) : false,
                    p_has_flagged: hasFlagged,
                }
            )

            if (upsertError) {
                console.error("Failed to upsert answer:", upsertError)
                return NextResponse.json({ error: "Gagal menyimpan jawaban" }, { status: 500 })
            }

            if (!saved) {
                return NextResponse.json(
                    { error: "Sesi tidak valid atau sudah selesai" },
                    { status: 409 }
                )
            }
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Auto-save error:", error)
        return NextResponse.json({ error: "Internal error" }, { status: 500 })
    }
}
