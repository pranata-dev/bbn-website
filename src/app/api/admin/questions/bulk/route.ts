import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

// DELETE /api/admin/questions/bulk
export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createAdminClient()
        const body = await request.json()
        
        const { ids } = body
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: "No question IDs provided." }, { status: 400 })
        }

        const { error } = await supabase
            .from("questions")
            .delete()
            .in("id", ids)

        if (error) {
            console.error("Bulk delete error:", error)
            return NextResponse.json(
                { error: `Database error: ${error.message}` },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true, message: "Questions deleted successfully." }, { status: 200 })
    } catch (error) {
        console.error("API error:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Internal server error" },
            { status: 500 }
        )
    }
}
