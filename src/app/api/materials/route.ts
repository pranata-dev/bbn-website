import { NextRequest, NextResponse } from "next/server"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import { getEntitlements } from "@/lib/entitlements"

export const dynamic = "force-dynamic"

// GET /api/materials - List materials with entitlement annotations
export async function GET(request: NextRequest) {
    try {
        const authClient = await createClient()
        const { data: { user } } = await authClient.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const supabase = createServiceClient()

        const { data: userRecord } = await supabase
            .from("users")
            .select("id")
            .eq("auth_id", user.id)
            .single()

        if (!userRecord) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const entitlements = await getEntitlements(userRecord.id)

        const { searchParams } = new URL(request.url)
        const courseId = searchParams.get("course_id")
        const subject = searchParams.get("subject")

        let query = supabase
            .from("materials")
            .select(`
                id,
                course_id,
                slug,
                title,
                summary,
                module_number,
                sort_order,
                reading_time_minutes,
                is_free_preview,
                is_published,
                subject,
                drive_url,
                podcast_url,
                pdf_url,
                created_at
            `)
            .eq("is_published", true)
            .order("sort_order", { ascending: true })

        if (courseId) {
            query = query.eq("course_id", courseId)
        } else if (subject && subject !== "all") {
            query = query.eq("subject", subject as "FISDAS2" | "FISMAT")
        }

        const { data: materials, error } = await query

        if (error) {
            console.error("Fetch materials error:", error)
            return NextResponse.json({ error: "Gagal memuat materi." }, { status: 500 })
        }

        // Annotate whether user has access to each material using authoritative helper
        const annotated = (materials || []).map((m) => {
            const canAccess = entitlements.canAccessMaterial(m)

            return {
                ...m,
                can_access: canAccess,
                is_locked: !canAccess,
            }
        })

        return NextResponse.json({
            materials: annotated,
            entitlements: {
                isFreeTier: entitlements.tier === "FREE",
                tier: entitlements.tier,
                planCode: entitlements.planCode,
                track: entitlements.track,
                isExpired: entitlements.isExpired,
            }
        })
    } catch (error) {
        console.error("Materials API error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
