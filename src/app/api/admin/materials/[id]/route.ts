import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { createServiceClient } from "@/lib/supabase/server"
import { findCourseIdByIdentifier } from "@/lib/postgrest-safe"
import { adminUpdateMaterialSchema } from "@/lib/validations/api"

export const dynamic = "force-dynamic"

export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const guard = await requireAdmin()
    if (!guard.ok) return guard.response

    try {
        const { id } = await context.params
        const supabase = createServiceClient()
        const body = await request.json().catch(() => null)
        const parsed = adminUpdateMaterialSchema.safeParse(body)
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

        const resolvedDriveUrl =
            driveUrl !== undefined ? driveUrl : pdfUrl !== undefined ? pdfUrl : undefined

        const { data: material, error } = await supabase
            .from("materials")
            .update({
                title,
                slug: generatedSlug,
                course_id: targetCourseId !== null ? targetCourseId : undefined,
                summary: summary !== undefined ? summary : undefined,
                content_md: contentMd !== undefined ? contentMd : undefined,
                drive_url: resolvedDriveUrl ?? undefined,
                podcast_url: podcastUrl !== undefined ? podcastUrl : undefined,
                module_number: moduleNumber !== undefined ? moduleNumber : undefined,
                sort_order: sortOrder !== undefined && sortOrder !== null ? sortOrder : undefined,
                is_free_preview: isFreePreview !== undefined ? Boolean(isFreePreview) : undefined,
                is_published: isPublished !== undefined ? Boolean(isPublished) : undefined,
                reading_time_minutes: readingTimeMinutes !== undefined ? readingTimeMinutes : undefined,
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
        const supabase = createServiceClient()

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
