import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET /api/dashboard/stats?subject=FISDAS2 - Get user-specific dashboard data filtered by subject
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Get the internal user id and all subject access info
        const { data: dbUser } = await supabase
            .from("users")
            .select("id, subject_access:user_subject_access(*)")
            .eq("auth_id", user.id)
            .single()

        if (!dbUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        const userId = dbUser.id
        const subjectAccess = dbUser.subject_access || []

        // Read the subject filter from the URL query parameter
        const { searchParams } = new URL(request.url)
        const subjectParam = searchParams.get("subject") || "FISDAS2"
        
        const { getPackageFeatures } = await import("@/lib/package-features")
        
        // Aggregate max quota across all subjects
        let totalMaxQuota = 0
        subjectAccess.forEach((acc: any) => {
            const features = getPackageFeatures(acc.package_type, acc.role)
            totalMaxQuota += features.tryoutLimit
        })

        // Fetch all SUBMITTED and IN_PROGRESS submissions for this user with tryout info
        const { data: submissions } = await supabase
            .from("submissions")
            .select("id, status, score, correct_count, total_count, created_at, tryout_id, tryouts(title, is_practice, category, subject)")
            .eq("user_id", userId)
            .in("status", ["SUBMITTED", "IN_PROGRESS"])
            .order("created_at", { ascending: false })

        // Filter submissions to only include those matching the requested subject
        const allSubmissions = (submissions || []).filter((sub) => {
            const tryoutRaw = sub.tryouts
            const tryout = Array.isArray(tryoutRaw) ? tryoutRaw[0] : tryoutRaw
            return (tryout as any)?.subject === subjectParam
        })

        // --- Recent Activity (most recent 5, only SUBMITTED) ---
        const recentActivity = allSubmissions
            .filter(sub => sub.status === "SUBMITTED")
            .slice(0, 5)
            .map((sub) => {
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
            const tryoutRaw = sub.tryouts
            const tryout = Array.isArray(tryoutRaw) ? tryoutRaw[0] : tryoutRaw
            return (tryout as any)?.is_practice === false
        })

        const tryoutUsed = tryoutSubmissions.length // Includes IN_PROGRESS
        const tryoutCompleted = tryoutSubmissions.filter(s => s.status === "SUBMITTED")
        
        const tryoutAvgScore = tryoutCompleted.length > 0
            ? Math.round(tryoutCompleted.reduce((sum, s) => sum + (s.score || 0), 0) / tryoutCompleted.length)
            : 0
        const tryoutHighestScore = tryoutCompleted.length > 0
            ? Math.round(Math.max(...tryoutCompleted.map((s) => s.score || 0)))
            : 0

        // --- Latihan Stats (is_practice = true) ---
        const latihanSubmissions = allSubmissions.filter((sub) => {
            const tryoutRaw = sub.tryouts
            const tryout = Array.isArray(tryoutRaw) ? tryoutRaw[0] : tryoutRaw
            return (tryout as any)?.is_practice === true
        })

        const latihanCompleted = latihanSubmissions.filter(s => s.status === "SUBMITTED")
        const latihanUsed = latihanSubmissions.length

        const latihanAvgScore = latihanCompleted.length > 0
            ? Math.round(latihanCompleted.reduce((sum, s) => sum + (s.score || 0), 0) / latihanCompleted.length)
            : 0
        const latihanHighestScore = latihanCompleted.length > 0
            ? Math.round(Math.max(...latihanCompleted.map((s) => s.score || 0)))
            : 0

        // For Quota logic on client: using tryoutUsed
        const tryoutCompletedCount = tryoutUsed;
        const latihanCompletedCount = latihanCompleted.length;

        // --- Performance Per Materi (Tryout only) ---
        // NOTE FOR ADMIN: Please ensure all questions have a 'category' field filled in 
        // (e.g., "Hukum Gauss", "Medan Magnet") so the performance chart displays correctly.
        const materiMap: Record<string, { totalScore: number; count: number }> = {}
        for (const sub of tryoutSubmissions) {
            const tryoutRaw = sub.tryouts
            const tryout = Array.isArray(tryoutRaw) ? tryoutRaw[0] : tryoutRaw
            const cat = (tryout as any)?.category || "Materi Belum Dikategorikan"
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
                completed: tryoutUsed, // Renamed for quota consistency
                avgScore: tryoutAvgScore,
                highestScore: tryoutHighestScore,
                maxQuota: totalMaxQuota,
            },
            latihanStats: {
                completed: latihanCompletedCount,
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
