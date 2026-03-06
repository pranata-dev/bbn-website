import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

// PATCH /api/admin/tryouts/[id] - Update tryout status
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const supabase = createServiceClient()
        const body = await request.json()
        const { status } = body

        if (!status || !["DRAFT", "ACTIVE", "ARCHIVED"].includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 })
        }

        const { data: tryout, error } = await supabase
            .from("tryouts")
            .update({
                status,
                updated_at: new Date().toISOString(),
            })
            .eq("id", id)
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: `Failed to update tryout: ${error.message}` }, { status: 500 })
        }

        return NextResponse.json({ tryout })
    } catch (error) {
        console.error("API error:", error)
        return NextResponse.json({ error: error instanceof Error ? error.message : "Internal error" }, { status: 500 })
    }
}
