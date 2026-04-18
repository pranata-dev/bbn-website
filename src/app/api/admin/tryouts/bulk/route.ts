import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

// PATCH /api/admin/tryouts/bulk
export async function PATCH(request: NextRequest) {
    try {
        const supabase = await createAdminClient()
        const body = await request.json()
        
        const { ids, status } = body
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: "No tryout IDs provided." }, { status: 400 })
        }
        if (!status) {
            return NextResponse.json({ error: "Status is required." }, { status: 400 })
        }

        const { error } = await supabase
            .from("tryouts")
            .update({ status })
            .in("id", ids)

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
    try {
        const supabase = await createAdminClient()
        const body = await request.json()
        
        const { ids } = body
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: "No tryout IDs provided." }, { status: 400 })
        }

        const { error } = await supabase
            .from("tryouts")
            .delete()
            .in("id", ids)

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
