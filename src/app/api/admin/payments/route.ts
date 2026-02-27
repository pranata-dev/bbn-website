import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

export async function GET() {
    try {
        const adminSupabase = await createAdminClient()
        const { data: payments, error } = await adminSupabase
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
