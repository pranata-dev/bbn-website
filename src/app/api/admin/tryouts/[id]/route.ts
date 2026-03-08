import { NextRequest, NextResponse } from "next/server"
import { createAdminClient, createServiceClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

// GET /api/admin/tryouts/[id] - Get specific tryout details with its questions
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const supabase = await createAdminClient()

        const { data: tryout, error } = await supabase
            .from("tryouts")
            .select("*, tryout_questions (question_id)")
            .eq("id", id)
            .single()

        if (error) {
            return NextResponse.json({ error: `Failed to fetch tryout: ${error.message}` }, { status: 500 })
        }

        // Extract just the question_ids as a flat array
        const questionIds = tryout.tryout_questions?.map((tq: any) => tq.question_id) || []
        
        // Remove the nested object to simplify the response
        const { tryout_questions, ...tryoutData } = tryout

        return NextResponse.json({ tryout: tryoutData, questionIds })
    } catch (error) {
        console.error("API error:", error)
        return NextResponse.json({ error: "Internal error" }, { status: 500 })
    }
}

// PATCH /api/admin/tryouts/[id] - Update tryout details or status
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const supabase = createServiceClient()
        const body = await request.json()
        const { status, title, description, duration, questionIds } = body

        const updateData: any = {
            updated_at: new Date().toISOString(),
        }

        if (status) {
            if (!["DRAFT", "ACTIVE", "ARCHIVED"].includes(status)) {
                return NextResponse.json({ error: "Invalid status" }, { status: 400 })
            }
            updateData.status = status
        }

        if (title) updateData.title = title
        if (typeof description !== "undefined") updateData.description = description
        if (typeof duration !== "undefined") updateData.duration = parseInt(duration as string, 10)

        // 1. Update Tryout metadata
        const { data: tryout, error } = await supabase
            .from("tryouts")
            .update(updateData)
            .eq("id", id)
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: `Failed to update tryout: ${error.message}` }, { status: 500 })
        }

        // 2. Re-map questions if questionIds provided
        if (Array.isArray(questionIds)) {
            // First delete old mapping
            const { error: deleteError } = await supabase
                .from("tryout_questions")
                .delete()
                .eq("tryout_id", id)

            if (deleteError) {
                return NextResponse.json({ error: `Failed to delete old questions: ${deleteError.message}` }, { status: 500 })
            }

            // Then insert new mapping
            if (questionIds.length > 0) {
                const tryoutQuestions = questionIds.map((qId: string, index: number) => ({
                    id: crypto.randomUUID(),
                    tryout_id: id,
                    question_id: qId,
                    order: index,
                }))

                const { error: linkingError } = await supabase
                    .from("tryout_questions")
                    .insert(tryoutQuestions)

                if (linkingError) {
                    return NextResponse.json({ error: `Failed to link new questions: ${linkingError.message}` }, { status: 500 })
                }
            }
        }

        return NextResponse.json({ tryout })
    } catch (error) {
        console.error("API error:", error)
        return NextResponse.json({ error: error instanceof Error ? error.message : "Internal error" }, { status: 500 })
    }
}

// DELETE /api/admin/tryouts/[id] - Delete a tryout
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const supabase = createServiceClient()

        // Delete the tryout. Relational data (tryout_questions, submissions) should CASCADE delete
        // according to Prisma schema settings (`onDelete: Cascade`).
        const { error } = await supabase
            .from("tryouts")
            .delete()
            .eq("id", id)

        if (error) {
            return NextResponse.json({ error: `Failed to delete tryout: ${error.message}` }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("API error:", error)
        return NextResponse.json({ error: "Internal error" }, { status: 500 })
    }
}
