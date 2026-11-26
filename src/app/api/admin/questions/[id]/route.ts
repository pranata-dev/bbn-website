import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { createServiceClient } from "@/lib/supabase/server"
import { findCourseIdByIdentifier } from "@/lib/postgrest-safe"
import { validateImageUpload } from "@/lib/file-validation"
import { adminQuestionPatchSchema } from "@/lib/validations/api"
import type { Database } from "@/types/database.types"

type DbQuestionCategory = Database["public"]["Enums"]["QuestionCategory"]

// PATCH /api/admin/questions/[id] - Update a question with optional image update
export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> } | { params: { id: string } }
) {
    const guard = await requireAdmin()
    if (!guard.ok) return guard.response

    try {
        const supabase = createServiceClient()
        const { id } = await context.params

        if (!id) {
            return NextResponse.json({ error: "Missing question ID" }, { status: 400 })
        }

        const formData = await request.formData()

        const parsed = adminQuestionPatchSchema.safeParse({
            text: formData.get("text"),
            category: formData.get("category"),
            subject: formData.get("subject") ?? null,
            course_id: formData.get("course_id") ?? null,
            optionA: formData.get("optionA") ?? formData.get("option_a"),
            optionB: formData.get("optionB") ?? formData.get("option_b"),
            optionC: formData.get("optionC") ?? formData.get("option_c"),
            optionD: formData.get("optionD") ?? formData.get("option_d"),
            optionE: formData.get("optionE") ?? formData.get("option_e") ?? null,
            correctAnswer: formData.get("correctAnswer") ?? formData.get("correct_answer"),
            explanation: formData.get("explanation") || null,
            weight: formData.get("weight") || 1,
            removeImage: formData.get("removeImage") === "true",
        })

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0]?.message || "Missing or invalid required fields" },
                { status: 400 }
            )
        }

        const {
            text,
            category,
            subject,
            course_id: rawCourseId,
            optionA,
            optionB,
            optionC,
            optionD,
            optionE,
            correctAnswer,
            explanation,
            weight,
            removeImage,
        } = parsed.data
        const imageEntry = formData.get("image")
        const imageFile = imageEntry instanceof Blob && imageEntry.size > 0 ? imageEntry : null

        // Get existing question to potentially delete old image or preserve its URL
        const { data: existingQuestion, error: fetchError } = await supabase
            .from("questions")
            .select("image_url")
            .eq("id", id)
            .single()

        if (fetchError || !existingQuestion) {
            return NextResponse.json({ error: "Question not found" }, { status: 404 })
        }

        let imageUrl: string | null = existingQuestion.image_url

        // Handle image update or removal
        if (removeImage) {
            imageUrl = null
        } else if (imageFile) {
            const verifiedImage = await validateImageUpload(imageFile)
            if (!verifiedImage.ok) {
                return NextResponse.json(
                    { error: verifiedImage.error },
                    { status: verifiedImage.status }
                )
            }

            const filePath = `questions/${Date.now()}-${crypto.randomUUID()}.${verifiedImage.ext}`

            const { error: uploadError } = await supabase.storage
                .from("question-images")
                .upload(filePath, verifiedImage.bytes, {
                    contentType: verifiedImage.mime,
                    upsert: false,
                })

            if (uploadError) {
                console.error("Storage upload error:", uploadError)
                return NextResponse.json(
                    { error: `Upload error: ${uploadError.message}` },
                    { status: 500 }
                )
            }

            const { data: publicUrlData } = supabase.storage
                .from("question-images")
                .getPublicUrl(filePath)

            imageUrl = publicUrlData.publicUrl
        }

        const now = new Date().toISOString()

        let courseId = rawCourseId || null
        if (!courseId && subject) {
            courseId = await findCourseIdByIdentifier(supabase, subject, { allowId: true })
        }

        // Update question in the database
        const { data: question, error: updateError } = await supabase
            .from("questions")
            .update({
                text,
                category: (category as DbQuestionCategory) || undefined,
                course_id: courseId || undefined,
                option_a: optionA,
                option_b: optionB,
                option_c: optionC,
                option_d: optionD,
                option_e: optionE,
                correct_answer: correctAnswer,
                explanation,
                weight,
                image_url: imageUrl,
                updated_at: now,
            })
            .eq("id", id)
            .select()
            .single()

        if (updateError) {
            console.error("Update error:", updateError)
            return NextResponse.json(
                { error: `Database error: ${updateError.message}` },
                { status: 500 }
            )
        }

        return NextResponse.json({ question }, { status: 200 })
    } catch (error) {
        console.error("API error:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Internal server error" },
            { status: 500 }
        )
    }
}

// DELETE /api/admin/questions/[id] - Delete a question
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> } | { params: { id: string } }
) {
    const guard = await requireAdmin()
    if (!guard.ok) return guard.response

    try {
        const supabase = createServiceClient()
        const { id } = await context.params

        if (!id) {
            return NextResponse.json({ error: "Missing question ID" }, { status: 400 })
        }

        // Delete question from the database
        const { error: deleteError } = await supabase
            .from("questions")
            .delete()
            .eq("id", id)

        if (deleteError) {
            console.error("Delete error:", deleteError)
            return NextResponse.json(
                { error: `Database error: ${deleteError.message}` },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true }, { status: 200 })
    } catch (error) {
        console.error("API error:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Internal server error" },
            { status: 500 }
        )
    }
}
