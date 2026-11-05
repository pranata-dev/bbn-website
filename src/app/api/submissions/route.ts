import { NextRequest, NextResponse } from "next/server"
import { createClient, createServiceClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

// GET /api/submissions - List user's submission history
export async function GET(request: NextRequest) {
    try {
        const authClient = await createClient()
        const { data: { user } } = await authClient.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const supabase = createServiceClient()

        const { data: userRecord } = await supabase
            .from("users")
            .select("id")
            .eq("auth_id", user.id)
            .single()

        if (!userRecord) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const tryoutId = searchParams.get("tryoutId")

        let query = supabase
            .from("submissions")
            .select(`
                id,
                tryout_id,
                status,
                score,
                correct_count,
                total_count,
                started_at,
                submitted_at,
                tryouts (
                    id,
                    title,
                    subject,
                    is_practice,
                    duration
                )
            `)
            .eq("user_id", userRecord.id)
            .order("started_at", { ascending: false })

        if (tryoutId) {
            query = query.eq("tryout_id", tryoutId)
        }

        const { data: submissions, error } = await query

        if (error) {
            console.error("Fetch submissions error:", error)
            return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 })
        }

        return NextResponse.json({ submissions: submissions || [] })
    } catch (error) {
        console.error("API error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
