import { NextRequest, NextResponse } from "next/server"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import {
    getEntitlements,
    getExcellentCourseRow,
} from "@/lib/entitlements"
import { findCourseIdByIdentifier, normalizeIdentifier } from "@/lib/postgrest-safe"

export const dynamic = "force-dynamic"

// GET /api/tryouts - List active tryouts/latihan
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { data: profile } = await supabase
            .from("users")
            .select("id, role")
            .eq("auth_id", user.id)
            .maybeSingle()

        if (!profile) {
            return NextResponse.json({ tryouts: [] })
        }

        const serviceSupabase = createServiceClient()
        const entitlements = await getEntitlements(profile.id, serviceSupabase, { authUser: user })
        const excellentGrade = entitlements.excellentGrade

        const url = new URL(request.url)
        const subjectParam = url.searchParams.get("subject") || url.searchParams.get("course")
        const isPracticeParam = url.searchParams.get("isPractice")

        let query = supabase
            .from("tryouts")
            .select("*, tryout_questions(count)")
            .eq("status", "ACTIVE")
            .order("created_at", { ascending: false })

        if (isPracticeParam !== null) {
            query = query.eq("is_practice", isPracticeParam === "true")
        }

        if (excellentGrade) {
            const gradeCourse = await getExcellentCourseRow(excellentGrade, serviceSupabase)
            if (!gradeCourse) {
                return NextResponse.json({
                    tryouts: [],
                    excellentBeta: { enabled: true, grade: excellentGrade },
                })
            }
            query = query.eq("course_id", gradeCourse.id)
        } else if (subjectParam && subjectParam !== "all") {
            if (!normalizeIdentifier(subjectParam)) {
                return NextResponse.json({ error: "Parameter mata kuliah tidak valid." }, { status: 400 })
            }
            const matchedCourseId = await findCourseIdByIdentifier(supabase, subjectParam)
            if (matchedCourseId) {
                query = query.eq("course_id", matchedCourseId)
            }
        }

        const { data: tryouts, error } = await query

        if (error) {
            console.error("Error fetching tryouts:", error)
            return NextResponse.json({ error: "Failed to fetch tryouts" }, { status: 500 })
        }

        const filtered = (tryouts || []).map((t) => ({
            ...t,
            is_locked: !entitlements.canStartTryout(t),
        }))

        return NextResponse.json({
            tryouts: filtered,
            excellentBeta: {
                enabled: Boolean(excellentGrade),
                grade: excellentGrade,
            },
        })
    } catch (error) {
        console.error("Tryouts API error:", error)
        return NextResponse.json({ error: "Internal error" }, { status: 500 })
    }
}
