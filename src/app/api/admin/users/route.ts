import { NextRequest, NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { checkRateLimit } from "@/lib/rate-limit"

export async function GET(request: NextRequest) {
    // Check rate limit
    const rateLimitResponse = checkRateLimit(request)
    if (rateLimitResponse) return rateLimitResponse

    try {

        const adminSupabase = await createAdminClient()
        const { data: users, error } = await adminSupabase
            .from("users")
            .select("*")
            .order("created_at", { ascending: false })

        if (error) {
            return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
        }

        return NextResponse.json({ users })
    } catch (error) {
        return NextResponse.json({ error: "Internal error" }, { status: 500 })
    }
}

// PATCH - Update user role or status
export async function PATCH(request: NextRequest) {
    // Check rate limit
    const rateLimitResponse = checkRateLimit(request)
    if (rateLimitResponse) return rateLimitResponse

    try {

        const body = await request.json()
        const { userId, role, isActive } = body

        const updateData: Record<string, unknown> = {}
        if (role) updateData.role = role
        if (typeof isActive === "boolean") updateData.is_active = isActive

        const adminSupabase = await createAdminClient()
        const { error } = await adminSupabase
            .from("users")
            .update(updateData)
            .eq("id", userId)

        if (error) {
            return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
        }

        return NextResponse.json({ message: "User updated successfully" })
    } catch (error) {
        return NextResponse.json({ error: "Internal error" }, { status: 500 })
    }
}
