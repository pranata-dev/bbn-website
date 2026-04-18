import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
    try {
        const supabase = await createAdminClient()
        
        let query = supabase.from("materials").select("*").order("created_at", { ascending: false })

        const { searchParams } = new URL(request.url)
        const subject = searchParams.get("subject")
        if (subject && subject !== "all") {
            query = query.eq("subject", subject)
        }

        const { data: materials, error } = await query

        if (error) {
            return NextResponse.json({ error: `Fetch error: ${error.message}` }, { status: 500 })
        }

        return NextResponse.json({ materials })
    } catch (error) {
        return NextResponse.json({ error: "Internal error" }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createAdminClient()
        const body = await request.json()
        const { title, driveUrl, podcastUrl, subject } = body

        if (!title || !driveUrl || !subject) {
            return NextResponse.json({ error: "Title, Drive URL, and Subject are required." }, { status: 400 })
        }

        const now = new Date().toISOString()

        const { data: material, error } = await supabase
            .from("materials")
            .insert({
                title,
                drive_url: driveUrl,
                podcast_url: podcastUrl || null,
                subject,
                created_at: now,
                updated_at: now,
            })
            .select()
            .single()

        if (error) {
            console.error("Insert material error:", error)
            return NextResponse.json({ error: `Failed to create material: ${error.message}` }, { status: 500 })
        }

        return NextResponse.json({ material }, { status: 201 })
    } catch (error) {
        console.error("API error:", error)
        return NextResponse.json({ error: error instanceof Error ? error.message : "Internal error" }, { status: 500 })
    }
}
