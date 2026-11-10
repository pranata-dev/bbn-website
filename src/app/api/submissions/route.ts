import { NextRequest, NextResponse } from "next/server"
import { createClient, createServiceClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

// GET /api/submissions - List user's submission history
export async function GET(request: NextRequest) {
    try {
        const authClient = await createClient()
        const { data: { user } } = await authClient.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const supabase = createServiceClient()

        const { data: userRecord } = await supabase
            .from("users")
            .select("id")
            .eq("auth_id", user.id)
            .single()

        if (!userRecord) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const tryoutId = searchParams.get("tryoutId")

        let query = supabase
            .from("submissions")
            .select(`
                id,
                tryout_id,
                status,
                score,
                correct_count,
                total_count,
                started_at,
                submitted_at,
                tryouts (
                    id,
                    title,
                    course_id,
                    is_practice,
                    duration,
                    courses (
                        title,
                        code,
                        slug
                    )
                )
            `)
            .eq("user_id", userRecord.id)
            .order("started_at", { ascending: false })

        if (tryoutId) {
            query = query.eq("tryout_id", tryoutId)
        }

        const { data: submissions, error } = await query

        if (error) {
            console.error("Fetch submissions error:", error)
            return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 })
        }

        const normalizedSubmissions = (submissions || []).map((sub) => {
            const rawTryout = sub.tryouts as unknown as {
                id: string
                title: string
                course_id: string | null
                is_practice: boolean
                duration: number
                courses?: { title?: string; code?: string; slug?: string } | null
            } | null
            return {
                ...sub,
                tryouts: rawTryout
                    ? {
                          id: rawTryout.id,
                          title: rawTryout.title,
                          subject: rawTryout.courses?.code || rawTryout.courses?.title || "FISIKA",
                          is_practice: rawTryout.is_practice,
                          duration: rawTryout.duration,
                      }
                    : null,
            }
        })

        return NextResponse.json({ submissions: normalizedSubmissions })
    } catch (error) {
        console.error("API error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
