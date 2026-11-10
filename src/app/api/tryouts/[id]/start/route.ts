import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/server"
import { v4 as uuidv4 } from "uuid"
import { getEntitlements, getTryoutQuota } from "@/lib/entitlements"

// POST /api/tryouts/[id]/start - Start a tryout attempt
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: tryoutId } = await params

        // 1. Auth check
        const authClient = await createClient()
        const { data: { user } } = await authClient.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const supabase = createServiceClient()

        // 2. Get user internal ID
        const { data: profile } = await supabase
            .from("users")
            .select("id")
            .eq("auth_id", user.id)
            .single()

        if (!profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 })
        }

        // 3. Get tryout details
        const { data: tryout } = await supabase
            .from("tryouts")
            .select("*, tryout_questions(question_id)")
            .eq("id", tryoutId)
            .eq("status", "ACTIVE")
            .single()

        if (!tryout) {
            return NextResponse.json({ error: "Tryout tidak ditemukan." }, { status: 404 })
        }

        // 4. Entitlements & Permissions check
        const entitlements = await getEntitlements(profile.id, supabase)
        const canAccess = tryout.is_practice
            ? (entitlements.canAccessPractice || !!tryout.is_free_sample)
            : entitlements.canStartTryout(tryout)

        if (!canAccess) {
            return NextResponse.json({
                error: "Upgrade paket Anda untuk mengakses tryout/latihan ini.",
                code: "UPGRADE_REQUIRED",
            }, { status: 403 })
        }

        // 5. Check if there is already an active session in progress (resume)
        const { data: activeSubmission } = await supabase
            .from("submissions")
            .select("id, status, started_at, question_order")
            .eq("user_id", profile.id)
            .eq("tryout_id", tryoutId)
            .eq("status", "IN_PROGRESS")
            .maybeSingle()

        if (activeSubmission) {
            const { data: activeAnswers } = await supabase
                .from("answers")
                .select("question_id, answer, flagged")
                .eq("submission_id", activeSubmission.id)

            const { data: questionsData } = await supabase
                .from("questions")
                .select("id, text, category, option_a, option_b, option_c, option_d, option_e, weight, image_url")
                .in("id", activeSubmission.question_order || [])

            const orderedQuestions = (activeSubmission.question_order || []).map((qId: string) => {
                return questionsData?.find((q) => q.id === qId)
            }).filter(Boolean)

            return NextResponse.json({
                message: "Berhasil memuat sesi yang sedang berjalan",
                submission: {
                    id: activeSubmission.id,
                    status: activeSubmission.status,
                    startedAt: activeSubmission.started_at,
                    duration: tryout.duration,
                },
                questions: orderedQuestions,
                answers: activeAnswers || []
            })
        }

        // 6. Quota check based strictly on submissions table (SUBMITTED / COMPLETED / TIMED_OUT)
        const quota = await getTryoutQuota(profile.id, tryout, entitlements, supabase)
        if (!quota.allowed) {
            return NextResponse.json(
                {
                    error: `Batas percobaan Tryout untuk paket Anda telah habis (${quota.limit} kali).`,
                    code: "QUOTA_EXCEEDED",
                },
                { status: 403 }
            )
        }

        // 7. Start New Attempt
        const questionIds = (tryout.tryout_questions || []).map((tq: { question_id: string }) => tq.question_id)
        const shuffled = [...questionIds].sort(() => Math.random() - 0.5)

        const submissionId = uuidv4()
        const now = new Date()
        const startedAt = now.toISOString()
        const durationMs = (tryout.duration || 0) * 60 * 1000
        const expiresAt = durationMs > 0 ? new Date(now.getTime() + durationMs).toISOString() : null

        const { data: submission, error: subError } = await supabase
            .from("submissions")
            .insert({
                id: submissionId,
                user_id: profile.id,
                tryout_id: tryoutId,
                status: "IN_PROGRESS",
                started_at: startedAt,
                expires_at: expiresAt,
                question_order: shuffled,
                total_count: shuffled.length,
                tab_switch_count: 0,
                created_at: startedAt,
            })
            .select()
            .single()

        if (subError) {
            console.error("Failed to create submission:", subError)
            return NextResponse.json({ error: "Gagal memulai tryout." }, { status: 500 })
        }

        const { data: questions } = await supabase
            .from("questions")
            .select("id, text, category, option_a, option_b, option_c, option_d, option_e, weight, image_url")
            .in("id", shuffled)

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
