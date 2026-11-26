import { NextRequest, NextResponse } from "next/server"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import { getEntitlements, getExcellentCourseRow } from "@/lib/entitlements"
import { getExcellentCourseByCodeOrSlug } from "@/config/excellent"
import { findCourseIdByIdentifier, normalizeIdentifier } from "@/lib/postgrest-safe"

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
        const excellentGrade = entitlements?.excellentGrade ?? null

        const { searchParams } = new URL(request.url)
        const rawCategory = searchParams.get("category")
        const rawSubject = searchParams.get("subject") || searchParams.get("course")
        const rawLimit = Number.parseInt(searchParams.get("limit") || "50", 10)
        const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), 200) : 50

        let isExcellentBeta = false
        let courseId: string | null = null
        let category: string | null = null

        if (excellentGrade) {
            // Strictly scope Excellent Beta students to their verified grade course;
            // ignore any client-supplied subject, course, or category filters.
            const gradeCourse = await getExcellentCourseRow(excellentGrade, supabase)
            if (!gradeCourse) {
                return NextResponse.json({ leaderboard: [] })
            }
            isExcellentBeta = true
            courseId = gradeCourse.id
            category = null
        } else {
            if (rawCategory && rawCategory !== "all") {
                const safeCategory = normalizeIdentifier(rawCategory)
                if (!safeCategory) {
                    return NextResponse.json({ error: "Kategori tidak valid." }, { status: 400 })
                }
                category = safeCategory.toUpperCase()
            }

            if (rawSubject && rawSubject !== "all") {
                const safeSubject = normalizeIdentifier(rawSubject)
                if (!safeSubject) {
                    return NextResponse.json({ error: "Parameter mata kuliah tidak valid." }, { status: 400 })
                }
                const isBetaCourseFilter = Boolean(getExcellentCourseByCodeOrSlug(safeSubject))
                if (isBetaCourseFilter && !entitlements?.isAdmin) {
                    return NextResponse.json({ leaderboard: [] })
                }
                const matchedCourseId = await findCourseIdByIdentifier(supabase, safeSubject)
                if (!matchedCourseId) {
                    return NextResponse.json({ leaderboard: [] })
                }
                courseId = matchedCourseId
                isExcellentBeta = isBetaCourseFilter && Boolean(entitlements?.isAdmin)
            }
        }

        const { data: rows, error } = await supabase.rpc("get_leaderboard", {
            p_is_excellent_beta: isExcellentBeta,
            p_course_id: courseId,
            p_category: category,
            p_limit: limit,
        })

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
