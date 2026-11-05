import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { createAdminClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const guard = await requireAdmin()
    if (!guard.ok) return guard.response

    try {
        const { id } = await context.params
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
            .update({
                title,
                slug: generatedSlug,
                summary: summary !== undefined ? summary : undefined,
                content_md: contentMd !== undefined ? contentMd : undefined,
                drive_url: driveUrl !== undefined ? driveUrl : undefined,
                podcast_url: podcastUrl !== undefined ? podcastUrl : undefined,
                pdf_url: pdfUrl !== undefined ? pdfUrl : undefined,
                module_number: moduleNumber !== undefined ? Number(moduleNumber) : undefined,
                sort_order: sortOrder !== undefined ? Number(sortOrder) : undefined,
                is_free_preview: isFreePreview !== undefined ? Boolean(isFreePreview) : undefined,
                is_published: isPublished !== undefined ? Boolean(isPublished) : undefined,
                reading_time_minutes: readingTimeMinutes !== undefined ? Number(readingTimeMinutes) : undefined,
                subject: subject as "FISDAS2" | "FISMAT",
                updated_at: now,
            })
            .eq("id", id)
            .select()
            .single()

        if (error) {
            console.error("Update material error:", error)
            return NextResponse.json({ error: `Failed to update material: ${error.message}` }, { status: 500 })
        }

        return NextResponse.json({ material })
    } catch (error) {
        console.error("API error:", error)
        return NextResponse.json({ error: error instanceof Error ? error.message : "Internal error" }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const guard = await requireAdmin()
    if (!guard.ok) return guard.response

    try {
        const { id } = await context.params
        const supabase = await createAdminClient()

        const { error } = await supabase
            .from("materials")
            .delete()
            .eq("id", id)

        if (error) {
            console.error("Delete material error:", error)
            return NextResponse.json({ error: `Failed to delete material: ${error.message}` }, { status: 500 })
        }

        return NextResponse.json({ success: true, message: "Material deleted successfully." })
    } catch (error) {
        console.error("API error:", error)
        return NextResponse.json({ error: error instanceof Error ? error.message : "Internal error" }, { status: 500 })
    }
}
