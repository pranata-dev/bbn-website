import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET /api/tryouts - List active tryouts
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { data: tryouts, error } = await supabase
            .from("tryouts")
            .select("*, tryout_questions(count)")
            .eq("status", "ACTIVE")
            .order("created_at", { ascending: false })

        if (error) {
            return NextResponse.json({ error: "Failed to fetch tryouts" }, { status: 500 })
        }

        return NextResponse.json({ tryouts })
    } catch (error) {
        return NextResponse.json({ error: "Internal error" }, { status: 500 })
    }
}

// POST /api/tryouts - Create tryout (admin only)
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Check admin role
        const { data: profile } = await supabase
            .from("users")
            .select("role")
            .eq("auth_id", user.id)
            .single()

        if (!profile || profile.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const body = await request.json()
        const { title, description, category, duration, maxAttempts, startDate, endDate, questionIds } = body

        const { data: tryout, error } = await supabase
            .from("tryouts")
            .insert({
                title,
                description,
                category,
                duration,
                max_attempts: maxAttempts || 1,
                start_date: startDate || null,
                end_date: endDate || null,
                status: "DRAFT",
            })
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: "Failed to create tryout" }, { status: 500 })
        }

        // Link questions if provided
        if (questionIds?.length > 0) {
            const links = questionIds.map((qId: string, index: number) => ({
                tryout_id: tryout.id,
                question_id: qId,
                order: index,
            }))

            await supabase.from("tryout_questions").insert(links)
        }

        return NextResponse.json({ tryout }, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: "Internal error" }, { status: 500 })
    }
}
