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
        if (role) {
            updateData.role = role

            // Sync PackageType with Role
            switch (role) {
                case "UTS_EINSTEIN":
                    updateData.package_type = "EINSTEIN"
                    break
                case "UTS_SENKU":
                    updateData.package_type = "SENKU"
                    break
                case "UTS_FLUX":
                    updateData.package_type = "FLUX"
                    break
                case "STUDENT_PREMIUM":
                    updateData.package_type = "REGULER"
                    break
                default:
                    // If ADMIN or unknown, do not explicitly overwrite package_type
                    // Or set it to null if that's the preferred behavior for admins
                    break
            }
        }
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
