import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { checkRateLimit } from "@/lib/rate-limit"

export async function GET(request: NextRequest) {
    // 1. Rate Limiting
    const rateLimitResponse = checkRateLimit(request)
    if (rateLimitResponse) return rateLimitResponse

    try {
        const adminSupabase = await createAdminClient()

        // 3. Aggregate Statistics
        // Using multiple count queries (Supabase doesn't support easy multi-table counts in one RPC)

        // Users count
        const { count: userCount } = await adminSupabase
            .from("users")
            .select("*", { count: "exact", head: true })

        // Pending verifications (Registrations OR Payments pending)
        // We'll prioritize 'registrations' table which is the new system
        const { count: pendingCount } = await adminSupabase
            .from("registrations")
            .select("*", { count: "exact", head: true })
            .eq("status", "PENDING")

        // Tryouts count
        const { count: tryoutCount } = await adminSupabase
            .from("tryouts")
            .select("*", { count: "exact", head: true })

        // Questions count
        const { count: questionCount } = await adminSupabase
            .from("questions")
            .select("*", { count: "exact", head: true })

        return NextResponse.json({
            stats: {
                totalUsers: userCount || 0,
                pendingVerifications: pendingCount || 0,
                totalTryouts: tryoutCount || 0,
                totalQuestions: questionCount || 0,
            }
        })

    } catch (error) {
        console.error("Stats API error:", error)
        return NextResponse.json({ error: "Internal error" }, { status: 500 })
    }
}
