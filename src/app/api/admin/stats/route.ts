import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { checkRateLimit } from "@/lib/rate-limit"

export async function GET(request: NextRequest) {
    // 1. Rate Limiting
    const rateLimitResponse = checkRateLimit(request)
    if (rateLimitResponse) return rateLimitResponse

    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // 2. Admin Role Protection
        const { data: profile } = await supabase
            .from("users")
            .select("role")
            .eq("auth_id", user.id)
            .single()

        if (!profile || profile.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        // 3. Aggregate Statistics
        // Using multiple count queries (Supabase doesn't support easy multi-table counts in one RPC)

        // Users count
        const { count: userCount } = await supabase
            .from("users")
            .select("*", { count: "exact", head: true })

        // Pending verifications (Registrations OR Payments pending)
        // We'll prioritize 'registrations' table which is the new system
        const { count: pendingCount } = await supabase
            .from("registrations")
            .select("*", { count: "exact", head: true })
            .eq("status", "PENDING")

        // Tryouts count
        const { count: tryoutCount } = await supabase
            .from("tryouts")
            .select("*", { count: "exact", head: true })

        // Questions count
        const { count: questionCount } = await supabase
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
