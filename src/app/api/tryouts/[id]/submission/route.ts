import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET /api/tryouts/[id]/submission - Get the latest submission for a tryout
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: tryoutId } = await params
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Get user profile
        const { data: profile } = await supabase
            .from("users")
            .select("id")
            .eq("auth_id", user.id)
            .single()

        if (!profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 })
        }

        // Get the latest completed submission
        const { data: submission } = await supabase
            .from("submissions")
            .select("*")
            .eq("user_id", profile.id)
            .eq("tryout_id", tryoutId)
            // .neq("status", "IN_PROGRESS") // Filter removed to detect active sessions for resume
            .order("created_at", { ascending: false })
            .limit(1)
            .single()

        if (!submission) {
            return NextResponse.json({ submission: null }, { status: 200 })
        }

        return NextResponse.json({ submission }, { status: 200 })

    } catch (error) {
        console.error("Fetch submission error:", error)
        return NextResponse.json({ error: "Internal error" }, { status: 500 })
    }
}
