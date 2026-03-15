import { NextRequest, NextResponse } from "next/server"
import { createServiceClient, createAdminClient } from "@/lib/supabase/server"
import { v4 as uuidv4 } from "uuid"
import { questionSchema } from "@/lib/validations/admin"

export const dynamic = "force-dynamic"

// GET /api/admin/questions - List questions for admin (bypasses regular user cookie check)
export async function GET(request: NextRequest) {
    try {
        const adminSupabase = await createAdminClient()
        const { searchParams } = new URL(request.url)
        const category = searchParams.get("category")
        const subject = searchParams.get("subject")

        let query = adminSupabase.from("questions").select("*").order("created_at", { ascending: false })

        if (category && category !== "all") {
            query = query.eq("category", category)
        }

        if (subject && subject !== "all") {
            query = query.eq("subject", subject)
        }

        const { data: questions, error } = await query

        if (error) {
            return NextResponse.json({ error: `Fetch error: ${error.message}` }, { status: 500 })
        }

        return NextResponse.json({ questions })
    } catch (error) {
        return NextResponse.json({ error: "Internal error" }, { status: 500 })
    }
}

// POST /api/admin/questions - Create a question with optional image upload
export async function POST(request: NextRequest) {
    try {
        const supabase = createServiceClient()
        const formData = await request.formData()

        const imageFile = formData.get("image") as File | null

        // Validate using Zod schema
        const parsed = questionSchema.safeParse(Object.fromEntries(formData.entries()))
        if (!parsed.success) {
            console.error("Validation error:", parsed.error.format())
            return NextResponse.json(
                { error: "Validation failed", details: parsed.error.format() },
                { status: 400 }
            )
        }

        const {
            text,
            category,
            subject,
            option_a,
            option_b,
            option_c,
            option_d,
            option_e,
            correct_answer,
            explanation,
            weight
        } = parsed.data

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
                subject,
                option_a,
                option_b,
                option_c,
                option_d,
                option_e,
                correct_answer,
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
