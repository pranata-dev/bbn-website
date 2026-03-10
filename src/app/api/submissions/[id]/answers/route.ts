import { NextRequest, NextResponse } from "next/server"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import { v4 as uuidv4 } from "uuid"

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

        // Check if answer already exists
        const { data: existing } = await supabase
            .from("answers")
            .select("id")
            .eq("submission_id", submissionId)
            .eq("question_id", questionId)
            .single()

        if (existing) {
            const { error: updateError } = await supabase
                .from("answers")
                .update({ answer: answer })
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
                    answer: answer
                })

            if (insertError) {
                console.error("Failed to insert answer:", insertError)
                return NextResponse.json({ error: "Gagal menyimpan jawaban" }, { status: 500 })
            }
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Auto-save error:", error)
        return NextResponse.json({ error: "Internal error" }, { status: 500 })
    }
}
