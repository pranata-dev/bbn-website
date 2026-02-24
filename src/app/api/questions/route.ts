import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET /api/questions - List questions (admin only)
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { data: profile } = await supabase
            .from("users")
            .select("role")
            .eq("auth_id", user.id)
            .single()

        if (!profile || profile.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const { searchParams } = new URL(request.url)
        const category = searchParams.get("category")

        let query = supabase.from("questions").select("*").order("created_at", { ascending: false })

        if (category) {
            query = query.eq("category", category)
        }

        const { data: questions, error } = await query

        if (error) {
            return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 })
        }

        return NextResponse.json({ questions })
    } catch (error) {
        return NextResponse.json({ error: "Internal error" }, { status: 500 })
    }
}

// POST /api/questions - Create question (admin only)
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { data: profile } = await supabase
            .from("users")
            .select("role")
            .eq("auth_id", user.id)
            .single()

        if (!profile || profile.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const body = await request.json()
        const { text, category, optionA, optionB, optionC, optionD, optionE, correctAnswer, explanation, weight } = body

        const { data: question, error } = await supabase
            .from("questions")
            .insert({
                text,
                category,
                option_a: optionA,
                option_b: optionB,
                option_c: optionC,
                option_d: optionD,
                option_e: optionE || null,
                correct_answer: correctAnswer,
                explanation: explanation || null,
                weight: weight || 1,
            })
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: "Failed to create question" }, { status: 500 })
        }

        return NextResponse.json({ question }, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: "Internal error" }, { status: 500 })
    }
}
