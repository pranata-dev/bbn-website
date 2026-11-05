import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { createAdminClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
    const guard = await requireAdmin()
    if (!guard.ok) return guard.response

    try {
        const supabase = await createAdminClient()
        let query = supabase.from("materials").select("*").order("sort_order", { ascending: true })

        const { searchParams } = new URL(request.url)
        const subject = searchParams.get("subject")
        if (subject && subject !== "all") {
            query = query.eq("subject", subject as "FISDAS2" | "FISMAT")
        }

        const { data: materials, error } = await query

        if (error) {
            return NextResponse.json({ error: `Fetch error: ${error.message}` }, { status: 500 })
        }

        return NextResponse.json({ materials })
    } catch (error) {
        return NextResponse.json({ error: "Internal error" }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    const guard = await requireAdmin()
    if (!guard.ok) return guard.response

    try {
        const supabase = await createAdminClient()
        const body = await request.json()
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
        } = body

        if (!title || !subject) {
            return NextResponse.json({ error: "Title and Subject are required." }, { status: 400 })
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
                summary: summary || null,
                content_md: contentMd || null,
                drive_url: driveUrl || null,
                podcast_url: podcastUrl || null,
                pdf_url: pdfUrl || null,
                module_number: moduleNumber ? Number(moduleNumber) : null,
                sort_order: sortOrder ? Number(sortOrder) : 0,
                is_free_preview: Boolean(isFreePreview),
                is_published: isPublished !== false,
                reading_time_minutes: readingTimeMinutes ? Number(readingTimeMinutes) : null,
                subject: subject as "FISDAS2" | "FISMAT",
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
