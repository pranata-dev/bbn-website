import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/server"

// PATCH /api/submissions/[id]/answers - Auto-save single answer
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: submissionId } = await params
        const { questionId, answer } = await request.json()

        if (!questionId) {
            return NextResponse.json({ error: "questionId required" }, { status: 400 })
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
            .select("id, status")
            .eq("id", submissionId)
            .eq("user_id", userRecord.id)
            .single()

        if (!submission || submission.status !== "IN_PROGRESS") {
            return NextResponse.json({ error: "Sesi tidak valid atau sudah selesai" }, { status: 400 })
        }

        // Upsert the answer (is_correct is left null until final submit)
        const { error: upsertError } = await supabase
            .from("answers")
            .upsert({
                submission_id: submissionId,
                question_id: questionId,
                answer: answer,
            }, {
                onConflict: "submission_id, question_id"
            })

        if (upsertError) {
            console.error("Failed to auto-save answer:", upsertError)
            return NextResponse.json({ error: "Gagal menyimpan jawaban" }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Auto-save error:", error)
        return NextResponse.json({ error: "Internal error" }, { status: 500 })
    }
}
