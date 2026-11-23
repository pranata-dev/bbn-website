import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { createServiceClient } from "@/lib/supabase/server"
import { isExcellentGrade } from "@/config/excellent"
import { FEEDBACK_CATEGORIES } from "@/app/api/feedback/route"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
    const guard = await requireAdmin()
    if (!guard.ok) return guard.response

    try {
        const supabase = createServiceClient()
        const { searchParams } = new URL(request.url)
        const gradeParam = searchParams.get("grade")?.trim().toUpperCase()
        const categoryParam = searchParams.get("category")?.trim().toUpperCase()

        let query = supabase
            .from("beta_feedback")
            .select("id, user_id, student_name, grade, rating, category, message, page_path, created_at")
            .order("created_at", { ascending: false })
            .limit(200)

        if (gradeParam && isExcellentGrade(gradeParam)) {
            query = query.eq("grade", gradeParam)
        }

        if (
            categoryParam &&
            (FEEDBACK_CATEGORIES as readonly string[]).includes(categoryParam)
        ) {
            query = query.eq("category", categoryParam)
        }

        const { data: feedback, error } = await query

        if (error) {
            console.error("GET /api/admin/feedback error:", error)
            return NextResponse.json(
                { error: "Gagal memuat daftar feedback." },
                { status: 500 }
            )
        }

        return NextResponse.json({ feedback: feedback || [] })
    } catch (error) {
        console.error("GET /api/admin/feedback unexpected error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

