import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"

// PATCH /api/admin/questions/[id] - Update a question with optional image update
export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> } | { params: { id: string } }
) {
    try {
        const supabase = createServiceClient()
        const { id } = await context.params

        if (!id) {
            return NextResponse.json({ error: "Missing question ID" }, { status: 400 })
        }

        const formData = await request.formData()

        // Extract text fields from FormData
        const text = formData.get("text") as string
        const category = formData.get("category") as string
        const subject = formData.get("subject") as string
        const optionA = formData.get("optionA") as string
        const optionB = formData.get("optionB") as string
        const optionC = formData.get("optionC") as string
        const optionD = formData.get("optionD") as string
        const optionE = (formData.get("optionE") as string) || null
        const correctAnswer = formData.get("correctAnswer") as string
        const explanation = (formData.get("explanation") as string) || null
        const weight = parseFloat(formData.get("weight") as string) || 1
        const imageFile = formData.get("image") as File | null
        const removeImage = formData.get("removeImage") === "true"

        // Validate required fields
        if (!text || !category || !optionA || !optionB || !optionC || !optionD || !correctAnswer) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            )
        }

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
            // Optionally delete old image from storage
        } else if (imageFile && imageFile.size > 0) {
            const timestamp = Date.now()
            const filePath = `questions/${timestamp}_${imageFile.name}`

            const { error: uploadError } = await supabase.storage
                .from("question-images")
                .upload(filePath, imageFile, {
                    contentType: imageFile.type || "image/webp",
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

        // Update question in the database
        const { data: question, error: updateError } = await supabase
            .from("questions")
            .update({
                text,
                category,
                subject,
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
