import { NextRequest, NextResponse } from "next/server"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import {
    FINISHED_SUBMISSION_STATUSES,
    getEntitlements,
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

interface TrackMaterialRow {
    id: string
    title: string
    slug: string | null
    has_content: boolean | null
    module_number: number | null
    is_free_preview: boolean
}

const FINISHED_STATUS_SET = new Set<string>(FINISHED_SUBMISSION_STATUSES)

// GET /api/dashboard/stats - Get user-specific dashboard data
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { data: dbUser } = await supabase
            .from("users")
            .select("id")
            .eq("auth_id", user.id)
            .single()

        if (!dbUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        const userId = dbUser.id
        const { searchParams } = new URL(request.url)
        const subjectParam = searchParams.get("subject") || searchParams.get("course") || ""
        const normalizedParam = subjectParam.toLowerCase().trim()

        const adminSupabase = createServiceClient()
        const entitlements = await getEntitlements(userId, adminSupabase, { authUser: user })
        const excellentGrade = entitlements.excellentGrade
        const excellentConfig = excellentGrade ? getExcellentCourseByGrade(excellentGrade) : null
        const excellentCourse = excellentGrade
            ? await getExcellentCourseRow(excellentGrade, adminSupabase)
            : null

        const totalMaxQuota = entitlements.tier === "PAID" ? 99 : 1
        const userTrack = entitlements.track || "PHYSICS_SEM_3"

        const fetchUserSubmissions = supabase
            .from("submissions")
            .select(`
                id, status, score, correct_count, total_count, created_at, tryout_id,
                tryouts(title, is_practice, category, course_id, courses(slug, code, track))
            `)
            .eq("user_id", userId)
            .order("created_at", { ascending: false })

        const fetchTrackMaterials = async (): Promise<TrackMaterialRow[]> => {
            if (excellentGrade) {
                if (!excellentCourse) return []
                const { data } = await adminSupabase
                    .from("materials")
                    .select("id, title, slug, has_content, module_number, is_free_preview")
                    .eq("is_published", true)
                    .eq("course_id", excellentCourse.id)
                    .order("module_number", { ascending: true })
                return (data || []) as TrackMaterialRow[]
            }

            const { data } = await adminSupabase
                .from("materials")
                .select("id, title, slug, has_content, module_number, is_free_preview, courses!inner(track)")
                .eq("is_published", true)
                .eq("courses.track", userTrack)
                .order("module_number", { ascending: true })
            return (data || []) as unknown as TrackMaterialRow[]
        }

        const fetchLeaderboardRank = async (): Promise<{ rank: number | null; totalParticipants: number }> => {
            if (excellentGrade && !excellentCourse) {
                return { rank: null, totalParticipants: 0 }
            }

            const { data, error } = await adminSupabase.rpc("get_user_leaderboard_rank", {
                p_user_id: userId,
                p_is_excellent_beta: Boolean(excellentGrade),
                p_course_id: excellentGrade ? excellentCourse?.id ?? null : null,
            })

            if (error) {
                console.error("User leaderboard rank RPC error:", error)
                return { rank: null, totalParticipants: 0 }
            }

            const row = Array.isArray(data) ? data[0] : data
            return {
                rank: row?.user_rank !== null && row?.user_rank !== undefined ? Number(row.user_rank) : null,
                totalParticipants: Number(row?.total_participants ?? 0),
            }
        }

        const [{ data: submissions }, trackMaterials, leaderboardStats] = await Promise.all([
            fetchUserSubmissions,
            fetchTrackMaterials(),
            fetchLeaderboardRank(),
        ])

        const typedSubmissions = (submissions || []) as unknown as SubmissionRow[]

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

        const finishedSubmissions = allSubmissions.filter((sub) => FINISHED_STATUS_SET.has(sub.status))

        const recentActivity = finishedSubmissions.slice(0, 5).map((sub) => {
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

        const tryoutSubmissions = allSubmissions.filter((sub) => {
            const tryoutRaw = sub.tryouts
            const tryout = Array.isArray(tryoutRaw) ? tryoutRaw[0] : tryoutRaw
            return tryout?.is_practice === false
        })

        const tryoutUsed = tryoutSubmissions.length
        const tryoutCompleted = tryoutSubmissions.filter((s) => FINISHED_STATUS_SET.has(s.status))

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

        const latihanSubmissions = allSubmissions.filter((sub) => {
            const tryoutRaw = sub.tryouts
            const tryout = Array.isArray(tryoutRaw) ? tryoutRaw[0] : tryoutRaw
            return tryout?.is_practice === true
        })

        const latihanCompleted = latihanSubmissions.filter((s) => FINISHED_STATUS_SET.has(s.status))

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

        const totalMaterialsCount = trackMaterials.length
        const unlockedOrCompletedMaterialsCount =
            entitlements.tier === "PAID"
                ? Math.min(
                      totalMaterialsCount,
                      finishedSubmissions.length + trackMaterials.filter((m) => m.is_free_preview).length
                  )
                : trackMaterials.filter((m) => m.is_free_preview).length

        const nextMaterialRow =
            trackMaterials[
                Math.min(unlockedOrCompletedMaterialsCount, Math.max(0, trackMaterials.length - 1))
            ] ||
            trackMaterials[0] ||
            null

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
                          hasContent: Boolean(nextMaterialRow.has_content),
                      }
                    : null,
            },
            leaderboardStats,
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
