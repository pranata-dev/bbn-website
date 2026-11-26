import { NextRequest, NextResponse } from "next/server"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import { getEntitlements, getExcellentCourseRow } from "@/lib/entitlements"
import { findCourseIdByIdentifier } from "@/lib/postgrest-safe"
import { resolveLeaderboardQuery } from "@/lib/leaderboard-query"

export const dynamic = "force-dynamic"

// GET /api/leaderboard - Bounded SQL leaderboard with strict Excellent Beta grade isolation
export async function GET(request: NextRequest) {
    try {
        const authClient = await createClient()
        const {
            data: { user },
        } = await authClient.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const supabase = createServiceClient()
        const { data: profile } = await supabase
            .from("users")
            .select("id")
            .eq("auth_id", user.id)
            .maybeSingle()

        const entitlements = profile
            ? await getEntitlements(profile.id, supabase, { authUser: user })
            : null

        const { searchParams } = new URL(request.url)
        const resolved = await resolveLeaderboardQuery({
            isAdmin: Boolean(entitlements?.isAdmin),
            excellentGrade: entitlements?.excellentGrade ?? null,
            rawCategory: searchParams.get("category"),
            rawSubject: searchParams.get("subject") || searchParams.get("course"),
            rawLimit: searchParams.get("limit"),
            resolveExcellentCourseId: async (grade) => {
                const course = await getExcellentCourseRow(grade, supabase)
                return course?.id ?? null
            },
            resolveCourseIdBySubject: (subject) => findCourseIdByIdentifier(supabase, subject),
        })

        if (resolved.kind === "error") {
            return NextResponse.json({ error: resolved.error }, { status: resolved.status })
        }

        if (resolved.kind === "empty") {
            return NextResponse.json({ leaderboard: [] })
        }

        const { data: rows, error } = await supabase.rpc("get_leaderboard", resolved.params)

        if (error) {
            console.error("Leaderboard RPC error:", error)
            return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 })
        }

        const leaderboard = (rows || []).map((row) => ({
            rank: Number(row.rank),
            userId: row.user_id,
            userName: row.user_name,
            avatarUrl: row.avatar_url,
            totalScore: Number(row.total_score),
            totalTryouts: Number(row.total_tryouts),
            averageScore: Number(row.average_score),
        }))

        return NextResponse.json({ leaderboard })
    } catch (error) {
        console.error("Leaderboard API error:", error)
        return NextResponse.json({ error: "Internal error" }, { status: 500 })
    }
}
