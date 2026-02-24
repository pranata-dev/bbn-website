import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { data: profile } = await supabase
            .from("users")
            .select("role")
            .eq("auth_id", user.id)
            .single()

        if (!profile || profile.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const { data: payments, error } = await supabase
            .from("payments")
            .select("*, users(name, email)")
            .order("created_at", { ascending: false })

        if (error) {
            return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 })
        }

        return NextResponse.json({ payments })
    } catch (error) {
        return NextResponse.json({ error: "Internal error" }, { status: 500 })
    }
}
