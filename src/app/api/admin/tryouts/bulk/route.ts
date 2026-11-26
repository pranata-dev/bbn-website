import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { createServiceClient } from "@/lib/supabase/server"
import { adminBulkIdsSchema, adminBulkUpdateTryoutsSchema } from "@/lib/validations/api"

export const dynamic = "force-dynamic"

// PATCH /api/admin/tryouts/bulk
export async function PATCH(request: NextRequest) {
    const guard = await requireAdmin()
    if (!guard.ok) return guard.response

    try {
        const supabase = createServiceClient()
        const body = await request.json().catch(() => null)
        const parsed = adminBulkUpdateTryoutsSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0]?.message || "Invalid bulk update payload." },
                { status: 400 }
            )
        }

        const { error } = await supabase
            .from("tryouts")
            .update({ status: parsed.data.status })
            .in("id", parsed.data.ids)

        if (error) {
            console.error("Bulk patch error:", error)
            return NextResponse.json(
                { error: `Database error: ${error.message}` },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true, message: "Tryouts updated successfully." }, { status: 200 })
    } catch (error) {
        console.error("API error:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Internal server error" },
            { status: 500 }
        )
    }
}

// DELETE /api/admin/tryouts/bulk
export async function DELETE(request: NextRequest) {
    const guard = await requireAdmin()
    if (!guard.ok) return guard.response

    try {
        const supabase = createServiceClient()
        const body = await request.json().catch(() => null)
        const parsed = adminBulkIdsSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0]?.message || "No tryout IDs provided." },
                { status: 400 }
            )
        }

        const { error } = await supabase
            .from("tryouts")
            .delete()
            .in("id", parsed.data.ids)

        if (error) {
            console.error("Bulk delete error:", error)
            return NextResponse.json(
                { error: `Database error: ${error.message}` },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true, message: "Tryouts deleted successfully." }, { status: 200 })
    } catch (error) {
        console.error("API error:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Internal server error" },
            { status: 500 }
        )
    }
}
