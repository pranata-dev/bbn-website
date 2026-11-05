import { NextRequest, NextResponse } from "next/server"
import { createClient, createServiceClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

// GET /api/submissions/[id] - Get submission result / details
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const authClient = await createClient()
        const { data: { user } } = await authClient.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const supabase = createServiceClient()

        // Get calling user db record
        const { data: userRecord } = await supabase
            .from("users")
            .select("id, role")
            .eq("auth_id", user.id)
            .single()

        if (!userRecord) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { data: submission, error } = await supabase
            .from("submissions")
            .select(`
                id,
                user_id,
                tryout_id,
                status,
                score,
                total_weight,
                correct_count,
                total_count,
                started_at,
                submitted_at,
                finished_at,
                expires_at,
                tab_switch_count,
                tryouts (
                    id,
                    title,
                    duration,
                    subject,
                    is_practice,
                    category
                )
            `)
            .eq("id", id)
            .single()

        if (error || !submission) {
            return NextResponse.json({ error: "Submission not found" }, { status: 404 })
        }

        // Only allow owner or admin
        if (submission.user_id !== userRecord.id && userRecord.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        return NextResponse.json({ submission })
    } catch (error) {
        console.error("GET submission error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
