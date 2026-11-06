import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getEntitlements } from "@/lib/entitlements"

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

        const entitlements = await getEntitlements(profile.id)

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

        // Resolve course filter
        if (subjectParam) {
            const normalized = subjectParam.toLowerCase().trim()
            const { data: matchedCourse } = await supabase
                .from("courses")
                .select("id, code, slug")
                .or(`slug.ilike.${normalized},code.ilike.${subjectParam.toUpperCase()}`)
                .maybeSingle()

            if (matchedCourse) {
                query = query.eq("course_id", matchedCourse.id)
            }
        }

        const { data: tryouts, error } = await query

        if (error) {
            console.error("Error fetching tryouts:", error)
            return NextResponse.json({ error: "Failed to fetch tryouts" }, { status: 500 })
        }

        // Apply entitlements (paid tier vs free sample)
        const filtered = (tryouts || []).map((t: any) => {
            const canStart = entitlements.canStartTryout(t)
            const canAccessPractice = t.is_practice ? (entitlements.canAccessPractice || !!t.is_free_sample) : canStart
            return {
                ...t,
                is_locked: !canAccessPractice,
            }
        })

        return NextResponse.json({ tryouts: filtered })
    } catch (error) {
        console.error("Tryouts API error:", error)
        return NextResponse.json({ error: "Internal error" }, { status: 500 })
    }
}
