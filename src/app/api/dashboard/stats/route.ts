import { NextRequest, NextResponse } from "next/server"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import {
    getEntitlements,
    getExcellentBetaGrade,
    getExcellentCourseRow,
} from "@/lib/entitlements"
import { getExcellentCourseByGrade } from "@/config/excellent"

interface NestedCourse {
    slug?: string | null
    code?: string | null
    track?: string | null
}

interface NestedTryout {
    title?: string | null
    is_practice?: boolean | null
    category?: string | null
    course_id?: string | null
    courses?: NestedCourse | NestedCourse[] | null
}

interface SubmissionRow {
    id: string
    status: string
    score: number | null
    correct_count: number | null
    total_count: number | null
    created_at: string
    tryout_id: string
    tryouts: NestedTryout | NestedTryout[] | null
}

// GET /api/dashboard/stats - Get user-specific dashboard data
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Get the internal user id
        const { data: dbUser } = await supabase
            .from("users")
            .select("id")
            .eq("auth_id", user.id)
            .single()

        if (!dbUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        const userId = dbUser.id

        // Read the optional subject/course filter from the URL query parameter
        const { searchParams } = new URL(request.url)
        const subjectParam = searchParams.get("subject") || searchParams.get("course") || ""
        const normalizedParam = subjectParam.toLowerCase().trim()

        const adminSupabase = createServiceClient()
        const excellentGrade = getExcellentBetaGrade(user)
        const excellentConfig = excellentGrade ? getExcellentCourseByGrade(excellentGrade) : null
        const excellentCourse = excellentGrade
            ? await getExcellentCourseRow(excellentGrade, adminSupabase)
            : null

        const entitlements = await getEntitlements(userId, adminSupabase, { authUser: user })
        const totalMaxQuota = entitlements.tier === "PAID" ? 99 : 1

        // Fetch submissions for this user with tryout & course info
        const { data: submissions } = await supabase
            .from("submissions")
            .select(`
                id, status, score, correct_count, total_count, created_at, tryout_id,
                tryouts(title, is_practice, category, course_id, courses(slug, code, track))
            `)
            .eq("user_id", userId)
            .order("created_at", { ascending: false })

        const typedSubmissions = (submissions || []) as unknown as SubmissionRow[]

        // Filter submissions: Excellent Beta users are strictly scoped to their grade course
        const allSubmissions = typedSubmissions.filter((sub) => {
            const tryoutRaw = sub.tryouts
            const tryout = Array.isArray(tryoutRaw) ? tryoutRaw[0] : tryoutRaw
            if (!tryout) return false

            if (excellentGrade) {
                if (!excellentCourse) return false
                return tryout.course_id === excellentCourse.id
            }

            if (!normalizedParam || normalizedParam === "all") return true
            const courseRaw = tryout.courses
            const course = Array.isArray(courseRaw) ? courseRaw[0] : courseRaw
            if (!course) return true
            return (
                course.slug?.toLowerCase() === normalizedParam ||
                course.code?.toLowerCase() === normalizedParam
            )
        })

        // --- Recent Activity (most recent 5, finished only) ---
        const finishedSubmissions = allSubmissions.filter(
            (sub) => sub.status === "SUBMITTED" || sub.status === "TIMED_OUT"
        )

        const recentActivity = finishedSubmissions
            .slice(0, 5)
            .map((sub) => {
                const tryoutRaw = sub.tryouts
                const tryout = Array.isArray(tryoutRaw) ? tryoutRaw[0] : tryoutRaw
                return {
                    id: sub.id,
                    tryoutId: sub.tryout_id,
                    title: tryout?.title || "Evaluasi Akademik",
                    type: tryout?.is_practice ? "Latihan" : "Tryout",
                    score: Math.round(sub.score || 0),
                    correctCount: sub.correct_count || 0,
                    totalCount: sub.total_count || 0,
                    createdAt: sub.created_at,
                }
            })

        // --- Tryout Stats (is_practice = false) ---
        const tryoutSubmissions = allSubmissions.filter((sub) => {
            const tryoutRaw = sub.tryouts
            const tryout = Array.isArray(tryoutRaw) ? tryoutRaw[0] : tryoutRaw
            return tryout?.is_practice === false
        })

        const tryoutUsed = tryoutSubmissions.length
        const tryoutCompleted = tryoutSubmissions.filter(
            (s) => s.status === "SUBMITTED" || s.status === "TIMED_OUT"
        )

        const tryoutAvgScore =
            tryoutCompleted.length > 0
                ? Math.round(
                      tryoutCompleted.reduce((sum, s) => sum + (s.score || 0), 0) /
                          tryoutCompleted.length
                  )
                : 0
        const tryoutHighestScore =
            tryoutCompleted.length > 0
                ? Math.round(Math.max(...tryoutCompleted.map((s) => s.score || 0)))
                : 0

        const latestFinishedTryout = tryoutCompleted[0] || null
        const latestTryoutMeta = latestFinishedTryout
            ? Array.isArray(latestFinishedTryout.tryouts)
                ? latestFinishedTryout.tryouts[0]
                : latestFinishedTryout.tryouts
            : null

        // --- Latihan Stats (is_practice = true) ---
        const latihanSubmissions = allSubmissions.filter((sub) => {
            const tryoutRaw = sub.tryouts
            const tryout = Array.isArray(tryoutRaw) ? tryoutRaw[0] : tryoutRaw
            return tryout?.is_practice === true
        })

        const latihanCompleted = latihanSubmissions.filter(
            (s) => s.status === "SUBMITTED" || s.status === "TIMED_OUT"
        )

        const latihanAvgScore =
            latihanCompleted.length > 0
                ? Math.round(
                      latihanCompleted.reduce((sum, s) => sum + (s.score || 0), 0) /
                          latihanCompleted.length
                  )
                : 0
        const latihanHighestScore =
            latihanCompleted.length > 0
                ? Math.round(Math.max(...latihanCompleted.map((s) => s.score || 0)))
                : 0

        // --- Performance Per Materi (Tryout only) ---
        const materiMap: Record<string, { totalScore: number; count: number }> = {}
        for (const sub of tryoutSubmissions) {
            const tryoutRaw = sub.tryouts
            const tryout = Array.isArray(tryoutRaw) ? tryoutRaw[0] : tryoutRaw
            const cat = tryout?.category || "Materi Belum Dikategorikan"
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

        // --- Materials & Leaderboard Stats ---
        const userTrack = entitlements.track || "PHYSICS_SEM_3"

        let trackMaterials: Array<{
            id: string
            title: string
            slug: string | null
            content_md: string | null
            module_number: number | null
            is_free_preview: boolean
        }> = []

        if (excellentGrade) {
            if (excellentCourse) {
                const { data: gradeMaterials } = await adminSupabase
                    .from("materials")
                    .select("id, title, slug, content_md, module_number, is_free_preview")
                    .eq("is_published", true)
                    .eq("course_id", excellentCourse.id)
                    .order("module_number", { ascending: true })
                trackMaterials = gradeMaterials || []
            }
        } else {
            const { data: materialsData } = await adminSupabase
                .from("materials")
                .select("id, title, slug, content_md, module_number, is_free_preview, courses!inner(track)")
                .eq("is_published", true)
                .eq("courses.track", userTrack)
                .order("module_number", { ascending: true })
            trackMaterials = materialsData || []
        }

        const totalMaterialsCount = trackMaterials.length
        const unlockedOrCompletedMaterialsCount =
            entitlements.tier === "PAID"
                ? Math.min(totalMaterialsCount, finishedSubmissions.length + trackMaterials.filter((m) => m.is_free_preview).length)
                : trackMaterials.filter((m) => m.is_free_preview).length

        const nextMaterialRow =
            trackMaterials[Math.min(unlockedOrCompletedMaterialsCount, Math.max(0, trackMaterials.length - 1))] ||
            trackMaterials[0] ||
            null

        let globalSubs: Array<{ user_id: string | null; score: number | null }> = []
        if (excellentGrade) {
            if (excellentCourse) {
                const { data: betaSubs } = await adminSupabase
                    .from("submissions")
                    .select("user_id, score, tryouts!inner(course_id)")
                    .in("status", ["SUBMITTED", "TIMED_OUT"])
                    .eq("tryouts.course_id", excellentCourse.id)
                globalSubs = (betaSubs || []).map((row) => ({
                    user_id: row.user_id,
                    score: row.score,
                }))
            }
        } else {
            const { data: allGlobalSubs } = await adminSupabase
                .from("submissions")
                .select("user_id, score")
                .in("status", ["SUBMITTED", "TIMED_OUT"])
            globalSubs = allGlobalSubs || []
        }

        const scoreByUser = new Map<string, { sum: number; count: number }>()
        for (const row of globalSubs) {
            if (!row.user_id) continue
            const current = scoreByUser.get(row.user_id) || { sum: 0, count: 0 }
            current.sum += row.score || 0
            current.count += 1
            scoreByUser.set(row.user_id, current)
        }

        const sortedUserAverages = Array.from(scoreByUser.entries())
            .map(([uid, val]) => ({ userId: uid, avg: val.sum / val.count }))
            .sort((a, b) => b.avg - a.avg)

        const userRankIdx = sortedUserAverages.findIndex((u) => u.userId === userId)

        return NextResponse.json({
            recentActivity,
            tryoutStats: {
                completed: tryoutUsed,
                avgScore: tryoutAvgScore,
                highestScore: tryoutHighestScore,
                maxQuota: totalMaxQuota,
                latestScore: latestFinishedTryout ? Math.round(latestFinishedTryout.score || 0) : null,
                latestTitle: latestTryoutMeta?.title || null,
            },
            latihanStats: {
                completed: latihanCompleted.length,
                avgScore: latihanAvgScore,
                highestScore: latihanHighestScore,
            },
            materialsStats: {
                completedCount: unlockedOrCompletedMaterialsCount,
                totalCount: totalMaterialsCount,
                nextMaterial: nextMaterialRow
                    ? {
                          title: nextMaterialRow.title,
                          slug: nextMaterialRow.slug,
                          moduleNumber: nextMaterialRow.module_number,
                          hasContent: Boolean(
                              nextMaterialRow.content_md &&
                                  nextMaterialRow.content_md.trim().length > 0
                          ),
                      }
                    : null,
            },
            leaderboardStats: {
                rank: userRankIdx >= 0 ? userRankIdx + 1 : null,
                totalParticipants: sortedUserAverages.length,
            },
            performancePerMateri,
            excellentBeta: {
                enabled: Boolean(excellentGrade),
                grade: excellentGrade,
                courseSlug: excellentConfig?.slug ?? null,
                courseTitle: excellentConfig?.title ?? null,
            },
        })
    } catch (error) {
        console.error("Dashboard stats error:", error)
        return NextResponse.json({ error: "Internal error" }, { status: 500 })
    }
}
