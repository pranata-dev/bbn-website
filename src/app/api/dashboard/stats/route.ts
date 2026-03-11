import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET /api/dashboard/stats - Get user-specific dashboard data
export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Get the internal user id and role/package for quota info
        const { data: dbUser } = await supabase
            .from("users")
            .select("id, role, package_type")
            .eq("auth_id", user.id)
            .single()

        if (!dbUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        const userId = dbUser.id
        const { getPackageFeatures } = await import("@/lib/package-features")
        const features = getPackageFeatures(dbUser.package_type, dbUser.role)
        const maxQuota = features.tryoutLimit

        // Fetch all SUBMITTED submissions for this user with tryout info
        const { data: submissions } = await supabase
            .from("submissions")
            .select("id, score, correct_count, total_count, created_at, tryout_id, tryouts(title, is_practice, category)")
            .eq("user_id", userId)
            .eq("status", "SUBMITTED")
            .order("created_at", { ascending: false })

        const allSubmissions = submissions || []

        // --- Recent Activity (both Tryout & Latihan, most recent 5) ---
        const recentActivity = allSubmissions.slice(0, 5).map((sub) => {
            const tryout = sub.tryouts as unknown as { title: string; is_practice: boolean; category: string } | null
            return {
                id: sub.id,
                tryoutId: sub.tryout_id,
                title: tryout?.title || "Unknown",
                type: tryout?.is_practice ? "Latihan" : "Tryout",
                score: sub.score,
                correctCount: sub.correct_count,
                totalCount: sub.total_count,
                createdAt: sub.created_at,
            }
        })

        // --- Tryout Stats (is_practice = false) ---
        const tryoutSubmissions = allSubmissions.filter((sub) => {
            const tryout = sub.tryouts as unknown as { is_practice: boolean } | null
            return tryout?.is_practice === false
        })

        const tryoutCompleted = tryoutSubmissions.length
        const tryoutAvgScore = tryoutCompleted > 0
            ? Math.round(tryoutSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) / tryoutCompleted)
            : 0
        const tryoutHighestScore = tryoutCompleted > 0
            ? Math.round(Math.max(...tryoutSubmissions.map((s) => s.score || 0)))
            : 0

        // --- Latihan Stats (is_practice = true) ---
        const latihanSubmissions = allSubmissions.filter((sub) => {
            const tryout = sub.tryouts as unknown as { is_practice: boolean } | null
            return tryout?.is_practice === true
        })

        const latihanCompleted = latihanSubmissions.length
        const latihanAvgScore = latihanCompleted > 0
            ? Math.round(latihanSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) / latihanCompleted)
            : 0
        const latihanHighestScore = latihanCompleted > 0
            ? Math.round(Math.max(...latihanSubmissions.map((s) => s.score || 0)))
            : 0

        // --- Performance Per Materi (Tryout only) ---
        const materiMap: Record<string, { totalScore: number; count: number }> = {}
        for (const sub of tryoutSubmissions) {
            const tryout = sub.tryouts as unknown as { category: string } | null
            const cat = tryout?.category || "UNKNOWN"
            if (!materiMap[cat]) {
                materiMap[cat] = { totalScore: 0, count: 0 }
            }
            materiMap[cat].totalScore += sub.score || 0
            materiMap[cat].count += 1
        }

        const performancePerMateri = Object.entries(materiMap).map(([category, data]) => ({
            category,
            avgScore: Math.round(data.totalScore / data.count),
            totalAttempts: data.count,
        }))

        return NextResponse.json({
            recentActivity,
            tryoutStats: {
                completed: tryoutCompleted,
                avgScore: tryoutAvgScore,
                highestScore: tryoutHighestScore,
                maxQuota: maxQuota,
            },
            latihanStats: {
                completed: latihanCompleted,
                avgScore: latihanAvgScore,
                highestScore: latihanHighestScore,
            },
            performancePerMateri,
        })
    } catch (error) {
        console.error("Dashboard stats error:", error)
        return NextResponse.json({ error: "Internal error" }, { status: 500 })
    }
}
