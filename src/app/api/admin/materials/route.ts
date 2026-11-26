import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { createServiceClient } from "@/lib/supabase/server"
import { findCourseIdByIdentifier } from "@/lib/postgrest-safe"
import { adminCreateMaterialSchema } from "@/lib/validations/api"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
    const guard = await requireAdmin()
    if (!guard.ok) return guard.response

    try {
        const supabase = createServiceClient()
        let query = supabase
            .from("materials")
            .select("*, courses(id, title, code, slug)")
            .order("sort_order", { ascending: true })

        const { searchParams } = new URL(request.url)
        const subject = searchParams.get("subject")
        const courseId = searchParams.get("course_id")

        if (courseId) {
            query = query.eq("course_id", courseId)
        } else if (subject && subject !== "all") {
            const matchedCourseId = await findCourseIdByIdentifier(supabase, subject)
            if (matchedCourseId) query = query.eq("course_id", matchedCourseId)
        }

        const { data: rawMaterials, error } = await query

        if (error) {
            return NextResponse.json({ error: `Fetch error: ${error.message}` }, { status: 500 })
        }

        const materials = (rawMaterials || []).map((m) => {
            const courseRel = m.courses as { code?: string; title?: string; slug?: string } | null
            return {
                ...m,
                subject: courseRel?.code || (m as { subject?: string }).subject || "FISDAS2",
            }
        })

        return NextResponse.json({ materials })
    } catch {
        return NextResponse.json({ error: "Internal error" }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    const guard = await requireAdmin()
    if (!guard.ok) return guard.response

    try {
        const supabase = createServiceClient()
        const body = await request.json().catch(() => null)
        const parsed = adminCreateMaterialSchema.safeParse(body)
        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0]?.message || "Invalid material payload." },
                { status: 400 }
            )
        }

        const {
            title,
            slug,
            summary,
            contentMd,
            driveUrl,
            podcastUrl,
            pdfUrl,
            moduleNumber,
            sortOrder,
            isFreePreview,
            isPublished,
            readingTimeMinutes,
            subject,
            course_id,
        } = parsed.data

        let targetCourseId = course_id || null
        if (!targetCourseId && subject) {
            targetCourseId = await findCourseIdByIdentifier(supabase, subject)
        }

        const now = new Date().toISOString()
        const generatedSlug = (slug || title)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "")

        const { data: material, error } = await supabase
            .from("materials")
            .insert({
                title,
                slug: generatedSlug,
                course_id: targetCourseId,
                summary: summary || null,
                content_md: contentMd || null,
                drive_url: driveUrl || pdfUrl || "",
                podcast_url: podcastUrl || null,
                module_number: moduleNumber ? Number(moduleNumber) : null,
                sort_order: sortOrder ? Number(sortOrder) : 0,
                is_free_preview: Boolean(isFreePreview),
                is_published: isPublished !== false,
                reading_time_minutes: readingTimeMinutes ? Number(readingTimeMinutes) : null,
                created_at: now,
                updated_at: now,
            })
            .select()
            .single()

        if (error) {
            console.error("Insert material error:", error)
            return NextResponse.json({ error: `Failed to create material: ${error.message}` }, { status: 500 })
        }

        return NextResponse.json({ material }, { status: 201 })
    } catch (error) {
        console.error("API error:", error)
        return NextResponse.json({ error: error instanceof Error ? error.message : "Internal error" }, { status: 500 })
    }
}
