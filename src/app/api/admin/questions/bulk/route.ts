import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { createServiceClient } from "@/lib/supabase/server"
import { adminBulkIdsSchema } from "@/lib/validations/api"

export const dynamic = "force-dynamic"

// DELETE /api/admin/questions/bulk
export async function DELETE(request: NextRequest) {
    const guard = await requireAdmin()
    if (!guard.ok) return guard.response

    try {
        const supabase = createServiceClient()
        const body = await request.json().catch(() => null)
        const parsed = adminBulkIdsSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0]?.message || "No question IDs provided." },
                { status: 400 }
            )
        }

        const { error } = await supabase
            .from("questions")
            .delete()
            .in("id", parsed.data.ids)

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
