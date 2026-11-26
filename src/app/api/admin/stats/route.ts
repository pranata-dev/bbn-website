import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { createServiceClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET() {
    const guard = await requireAdmin()
    if (!guard.ok) return guard.response

    try {
        const adminSupabase = createServiceClient()

        const [
            { count: userCount },
            { count: pendingCount },
            { count: tryoutCount },
            { count: practiceCount },
            { count: questionCount },
        ] = await Promise.all([
            adminSupabase.from("users").select("*", { count: "exact", head: true }),
            adminSupabase
                .from("registrations")
                .select("*", { count: "exact", head: true })
                .eq("status", "PENDING"),
            adminSupabase
                .from("tryouts")
                .select("*", { count: "exact", head: true })
                .eq("is_practice", false),
            adminSupabase
                .from("tryouts")
                .select("*", { count: "exact", head: true })
                .eq("is_practice", true),
            adminSupabase.from("questions").select("*", { count: "exact", head: true }),
        ])

        return NextResponse.json({
            stats: {
                totalUsers: userCount || 0,
                pendingVerifications: pendingCount || 0,
                totalTryouts: tryoutCount || 0,
                totalPractices: practiceCount || 0,
                totalQuestions: questionCount || 0,
            },
        })
    } catch (error) {
        console.error("Stats API error:", error)
        return NextResponse.json({ error: "Internal error" }, { status: 500 })
    }
}
