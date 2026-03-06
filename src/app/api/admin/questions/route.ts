import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"

import { v4 as uuidv4 } from "uuid"

// POST /api/admin/questions - Create a question with optional image upload
export async function POST(request: NextRequest) {
    try {
        const supabase = createServiceClient()
        const formData = await request.formData()

        // Extract text fields from FormData
        const text = formData.get("text") as string
        const category = formData.get("category") as string
        const optionA = formData.get("optionA") as string
        const optionB = formData.get("optionB") as string
        const optionC = formData.get("optionC") as string
        const optionD = formData.get("optionD") as string
        const optionE = (formData.get("optionE") as string) || null
        const correctAnswer = formData.get("correctAnswer") as string
        const explanation = (formData.get("explanation") as string) || null
        const weight = parseFloat(formData.get("weight") as string) || 1
        const imageFile = formData.get("image") as File | null

        // Validate required fields
        if (!text || !category || !optionA || !optionB || !optionC || !optionD || !correctAnswer) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            )
        }

        let imageUrl: string | null = null

        // Upload image to Supabase Storage if provided
        if (imageFile && imageFile.size > 0) {
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

            // Get the public URL
            const { data: publicUrlData } = supabase.storage
                .from("question-images")
                .getPublicUrl(filePath)

            imageUrl = publicUrlData.publicUrl
        }

        // Generate UUID manually since Prisma's @default(uuid()) doesn't apply when using Supabase client directly
        const questionId = uuidv4()
        const now = new Date().toISOString()

        // Insert question into the database
        const { data: question, error: insertError } = await supabase
            .from("questions")
            .insert({
                id: questionId,
                text,
                category,
                option_a: optionA,
                option_b: optionB,
                option_c: optionC,
                option_d: optionD,
                option_e: optionE,
                correct_answer: correctAnswer,
                explanation,
                weight,
                image_url: imageUrl,
                created_at: now,
                updated_at: now,
            })
            .select()
            .single()

        if (insertError) {
            console.error("Insert error:", insertError)
            return NextResponse.json(
                { error: `Database error: ${insertError.message}` },
                { status: 500 }
            )
        }

        return NextResponse.json({ question }, { status: 201 })
    } catch (error) {
        console.error("API error:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Internal server error" },
            { status: 500 }
        )
    }
}
