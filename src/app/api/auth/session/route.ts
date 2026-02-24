import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Get user profile from database
        const { data: profile } = await supabase
            .from("users")
            .select("*")
            .eq("auth_id", user.id)
            .single()

        if (!profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 })
        }

        // Update session token for concurrent login prevention
        const sessionToken = crypto.randomUUID()
        await supabase
            .from("users")
            .update({
                session_token: sessionToken,
                last_login_at: new Date().toISOString(),
            })
            .eq("id", profile.id)

        return NextResponse.json({
            id: profile.id,
            name: profile.name,
            email: profile.email,
            role: profile.role,
            isActive: profile.is_active,
            sessionToken,
        })
    } catch (error) {
        console.error("Session error:", error)
        return NextResponse.json({ error: "Internal error" }, { status: 500 })
    }
}
