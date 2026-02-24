import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET /api/leaderboard - Get leaderboard data
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const category = searchParams.get("category")
        const limit = parseInt(searchParams.get("limit") || "50")

        // Get all submitted submissions with user info
        let query = supabase
            .from("submissions")
            .select("user_id, score, tryouts(category), users(name, avatar_url)")
            .eq("status", "SUBMITTED")

        const { data: submissions, error } = await query

        if (error) {
            return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 })
        }

        // Aggregate by user
        const userScores: Record<string, {
            userId: string
            userName: string
            avatarUrl: string | null
            totalScore: number
            totalTryouts: number
        }> = {}

        for (const sub of submissions || []) {
            const userId = sub.user_id
            const userData = sub.users as unknown as { name: string; avatar_url: string | null } | null

            if (!userData) continue

            // Filter by category if specified
            const tryoutData = sub.tryouts as unknown as { category: string } | null
            if (category && tryoutData?.category !== category) continue

            if (!userScores[userId]) {
                userScores[userId] = {
                    userId,
                    userName: userData.name,
                    avatarUrl: userData.avatar_url,
                    totalScore: 0,
                    totalTryouts: 0,
                }
            }

            userScores[userId].totalScore += sub.score || 0
            userScores[userId].totalTryouts += 1
        }

        // Calculate averages and sort
        const leaderboard = Object.values(userScores)
            .map((entry) => ({
                ...entry,
                averageScore: entry.totalTryouts > 0
                    ? Math.round((entry.totalScore / entry.totalTryouts) * 100) / 100
                    : 0,
            }))
            .sort((a, b) => b.averageScore - a.averageScore)
            .slice(0, limit)
            .map((entry, index) => ({
                rank: index + 1,
                ...entry,
            }))

        return NextResponse.json({ leaderboard })
    } catch (error) {
        return NextResponse.json({ error: "Internal error" }, { status: 500 })
    }
}
