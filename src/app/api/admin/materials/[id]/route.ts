import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function PATCH(
    request: NextRequest,
    context: { params: { id: string } }
) {
    try {
        const { id } = context.params
        const supabase = await createAdminClient()
        const body = await request.json()
        const { title, driveUrl, podcastUrl, subject } = body

        if (!title || !driveUrl || !subject) {
            return NextResponse.json({ error: "Title, Drive URL, and Subject are required." }, { status: 400 })
        }

        const now = new Date().toISOString()

        const { data: material, error } = await supabase
            .from("materials")
            .update({
                title,
                drive_url: driveUrl,
                podcast_url: podcastUrl || null,
                subject,
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
    context: { params: { id: string } }
) {
    try {
        const { id } = context.params
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
