import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { checkRateLimit } from "@/lib/rate-limit"

export async function GET(request: NextRequest) {
    const rateLimitResponse = checkRateLimit(request)
    if (rateLimitResponse) return rateLimitResponse

    try {
        const adminSupabase = await createAdminClient()

        // --- Chart Data: Submissions per month (last 6 months), split by type ---
        const sixMonthsAgo = new Date()
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

        const { data: submissions } = await adminSupabase
            .from("submissions")
            .select("created_at, tryout_id, tryouts(is_practice)")
            .eq("status", "SUBMITTED")
            .gte("created_at", sixMonthsAgo.toISOString())
            .order("created_at", { ascending: true })

        // Aggregate by month
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"]
        const chartMap: Record<string, { tryout: number; latihan: number }> = {}

        // Initialize last 6 months
        for (let i = 5; i >= 0; i--) {
            const d = new Date()
            d.setMonth(d.getMonth() - i)
            const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`
            chartMap[key] = { tryout: 0, latihan: 0 }
        }

        for (const sub of submissions || []) {
            const date = new Date(sub.created_at)
            const key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`
            const tryout = sub.tryouts as unknown as { is_practice: boolean } | null

            if (chartMap[key]) {
                if (tryout?.is_practice) {
                    chartMap[key].latihan += 1
                } else {
                    chartMap[key].tryout += 1
                }
            }
        }

        const chartData = Object.entries(chartMap).map(([month, counts]) => ({
            month,
            tryout: counts.tryout,
            latihan: counts.latihan,
        }))

        // --- Top Performers: Top 5 by highest Tryout score ---
        const { data: topSubmissions } = await adminSupabase
            .from("submissions")
            .select("user_id, score, tryouts(is_practice, title), users(name, avatar_url)")
            .eq("status", "SUBMITTED")
            .order("score", { ascending: false })

        // Filter to tryout only and get best per user
        const userBest: Record<string, {
            userId: string
            userName: string
            avatarUrl: string | null
            highestScore: number
            tryoutTitle: string
        }> = {}

        for (const sub of topSubmissions || []) {
            const tryout = sub.tryouts as unknown as { is_practice: boolean; title: string } | null
            if (tryout?.is_practice !== false) continue // Only real tryouts

            const userData = sub.users as unknown as { name: string; avatar_url: string | null } | null
            if (!userData) continue

            const userId = sub.user_id
            const score = sub.score || 0

            if (!userBest[userId] || score > userBest[userId].highestScore) {
                userBest[userId] = {
                    userId,
                    userName: userData.name,
                    avatarUrl: userData.avatar_url,
                    highestScore: score,
                    tryoutTitle: tryout.title,
                }
            }
        }

        const topPerformers = Object.values(userBest)
            .sort((a, b) => b.highestScore - a.highestScore)
            .slice(0, 5)
            .map((entry, index) => ({
                rank: index + 1,
                ...entry,
            }))

        return NextResponse.json({ chartData, topPerformers })
    } catch (error) {
        console.error("Admin dashboard API error:", error)
        return NextResponse.json({ error: "Internal error" }, { status: 500 })
    }
}
