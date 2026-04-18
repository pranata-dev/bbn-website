import { NextRequest, NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { checkRateLimit } from "@/lib/rate-limit"

export const dynamic = "force-dynamic"
export async function GET(request: NextRequest) {
    // Check rate limit
    const rateLimitResponse = checkRateLimit(request)
    if (rateLimitResponse) return rateLimitResponse

    try {

        const adminSupabase = await createAdminClient()
        const { data: users, error } = await adminSupabase
            .from("users")
            .select("*, subject_access:user_subject_access(*)")
            .order("created_at", { ascending: false })

        if (error) {
            return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
        }

        return NextResponse.json({ users })
    } catch (error) {
        return NextResponse.json({ error: "Internal error" }, { status: 500 })
    }
}

// PATCH - Update user subject access or status
export async function PATCH(request: NextRequest) {
    const rateLimitResponse = checkRateLimit(request)
    if (rateLimitResponse) return rateLimitResponse

    try {
        const body = await request.json()
        const { userId, role, subject, isActive } = body

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 })
        }

        const adminSupabase = await createAdminClient()

        // 1. Update user active status if provided
        if (typeof isActive === "boolean") {
            const { error: userError } = await adminSupabase
                .from("users")
                .update({ is_active: isActive })
                .eq("id", userId)
            
            if (userError) throw userError
        }

        // 2. Update/Upsert subject access if role and subject provided
        if (role && subject) {
            let packageType = "REGULER"
            switch (role) {
                case "UTS_EINSTEIN": packageType = "EINSTEIN"; break
                case "UTS_SENKU": packageType = "SENKU"; break
                case "UTS_FLUX": packageType = "FLUX"; break
                case "STUDENT_PREMIUM": packageType = "REGULER"; break
            }

            const { error: accessError } = await adminSupabase
                .from("user_subject_access")
                .upsert({
                    user_id: userId,
                    subject,
                    role,
                    package_type: packageType,
                    is_active: true,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id,subject' })
            
            if (accessError) throw accessError
        }

        return NextResponse.json({ message: "User updated successfully" })
    } catch (error) {
        return NextResponse.json({ error: "Internal error" }, { status: 500 })
    }
}
