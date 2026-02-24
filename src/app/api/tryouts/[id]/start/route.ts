import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// POST /api/tryouts/[id]/start - Start a tryout attempt
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: tryoutId } = await params
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Get user profile
        const { data: profile } = await supabase
            .from("users")
            .select("id")
            .eq("auth_id", user.id)
            .single()

        if (!profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 })
        }

        // Get tryout details
        const { data: tryout } = await supabase
            .from("tryouts")
            .select("*, tryout_questions(question_id)")
            .eq("id", tryoutId)
            .eq("status", "ACTIVE")
            .single()

        if (!tryout) {
            return NextResponse.json({ error: "Tryout tidak ditemukan." }, { status: 404 })
        }

        // Check max attempts
        const { count: attemptCount } = await supabase
            .from("submissions")
            .select("*", { count: "exact", head: true })
            .eq("user_id", profile.id)
            .eq("tryout_id", tryoutId)

        if (attemptCount && attemptCount >= tryout.max_attempts) {
            return NextResponse.json(
                { error: "Kamu sudah mencapai batas percobaan untuk tryout ini." },
                { status: 400 }
            )
        }

        // Check active submission
        const { data: activeSubmission } = await supabase
            .from("submissions")
            .select("id")
            .eq("user_id", profile.id)
            .eq("tryout_id", tryoutId)
            .eq("status", "IN_PROGRESS")
            .single()

        if (activeSubmission) {
            return NextResponse.json(
                { error: "Kamu masih memiliki tryout yang sedang berjalan.", submissionId: activeSubmission.id },
                { status: 400 }
            )
        }

        // Randomize question order
        const questionIds = tryout.tryout_questions.map((tq: { question_id: string }) => tq.question_id)
        const shuffled = [...questionIds].sort(() => Math.random() - 0.5)

        // Create submission
        const { data: submission, error } = await supabase
            .from("submissions")
            .insert({
                user_id: profile.id,
                tryout_id: tryoutId,
                status: "IN_PROGRESS",
                started_at: new Date().toISOString(),
                question_order: shuffled,
                total_count: shuffled.length,
            })
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: "Gagal memulai tryout." }, { status: 500 })
        }

        // Get the questions in randomized order
        const { data: questions } = await supabase
            .from("questions")
            .select("id, text, category, option_a, option_b, option_c, option_d, option_e, weight, image_url")
            .in("id", shuffled)

        // Sort by randomized order
        const orderedQuestions = shuffled.map((qId: string) =>
            questions?.find((q: { id: string }) => q.id === qId)
        ).filter(Boolean)

        return NextResponse.json({
            submission: {
                id: submission.id,
                startedAt: submission.started_at,
                duration: tryout.duration,
            },
            questions: orderedQuestions,
        }, { status: 201 })
    } catch (error) {
        console.error("Start tryout error:", error)
        return NextResponse.json({ error: "Internal error" }, { status: 500 })
    }
}
