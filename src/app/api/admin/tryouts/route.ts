import { NextRequest, NextResponse } from "next/server"
import { createAdminClient, createServiceClient } from "@/lib/supabase/server"
import { v4 as uuidv4 } from "uuid"

export const dynamic = "force-dynamic"

// GET /api/admin/tryouts - List all tryouts
export async function GET(request: NextRequest) {
    try {
        const adminSupabase = await createAdminClient()

        const url = new URL(request.url)
        const isPractice = url.searchParams.get("isPractice")
        const subject = url.searchParams.get("subject")

        let query = adminSupabase
            .from("tryouts")
            .select("*")
            .order("created_at", { ascending: false })

        if (isPractice !== null) {
            query = query.eq("is_practice", isPractice === "true")
        }

        if (subject && subject !== "all") {
            query = query.eq("subject", subject)
        }

        const { data: tryouts, error } = await query

        if (error) {
            return NextResponse.json({ error: `Fetch error: ${error.message}` }, { status: 500 })
        }

        // We could also fetch question counts here, but sticking to basic list for now
        return NextResponse.json({ tryouts })
    } catch (error) {
        return NextResponse.json({ error: "Internal error" }, { status: 500 })
    }
}

// POST /api/admin/tryouts - Create a Tryout
export async function POST(request: NextRequest) {
    try {
        const supabase = createServiceClient()
        const body = await request.json()
        const { title, description, category, duration, isPractice, questionIds, subject } = body

        if (!title || typeof duration === 'undefined' || !Array.isArray(questionIds) || questionIds.length === 0) {
            return NextResponse.json({ error: "Missing required fields or no questions attached" }, { status: 400 })
        }

        const tryoutId = uuidv4()
        const now = new Date().toISOString()

        // 1. Create Tryout
        const { data: tryout, error: tryoutError } = await supabase
            .from("tryouts")
            .insert({
                id: tryoutId,
                title,
                description: description || null,
                category: category || null,
                subject: subject || "FISDAS2",
                duration: parseInt(duration as string, 10),
                status: "DRAFT", // Default state
                max_attempts: 1,
                is_practice: isPractice === true,
                created_at: now,
                updated_at: now,
            })
            .select()
            .single()

        if (tryoutError) {
            return NextResponse.json({ error: `Failed to create tryout: ${tryoutError.message}` }, { status: 500 })
        }

        // 2. Map questions to tryout
        const tryoutQuestions = questionIds.map((qId: string, index: number) => ({
            id: uuidv4(),
            tryout_id: tryoutId,
            question_id: qId,
            order: index, // Preserve submission order
        }))

        const { error: linkingError } = await supabase
            .from("tryout_questions")
            .insert(tryoutQuestions)

        if (linkingError) {
            console.error("Failed to link questions:", linkingError)
            return NextResponse.json({ error: `Failed to link questions: ${linkingError.message}` }, { status: 500 })
        }

        return NextResponse.json({ tryout }, { status: 201 })
    } catch (error) {
        console.error("API error:", error)
        return NextResponse.json({ error: error instanceof Error ? error.message : "Internal error" }, { status: 500 })
    }
}
