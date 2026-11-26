import { NextRequest, NextResponse } from "next/server"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import { v4 as uuidv4 } from "uuid"
import {
    canBetaAccessCourse,
    getEntitlements,
    getExcellentCourseRow,
    getTryoutQuota,
} from "@/lib/entitlements"

type ServiceClient = ReturnType<typeof createServiceClient>

interface ActiveSubmissionRow {
    id: string
    status: string
    started_at: string
    question_order: string[] | null
}

async function buildResumeResponse(
    supabase: ServiceClient,
    activeSubmission: ActiveSubmissionRow,
    duration: number
) {
    const order = activeSubmission.question_order || []
    const [{ data: activeAnswers }, { data: questionsData }] = await Promise.all([
        supabase
            .from("answers")
            .select("question_id, answer, flagged")
            .eq("submission_id", activeSubmission.id),
        order.length > 0
            ? supabase
                  .from("questions")
                  .select("id, text, category, option_a, option_b, option_c, option_d, option_e, weight, image_url")
                  .in("id", order)
            : Promise.resolve({ data: [] }),
    ])

    const questionMap = new Map((questionsData || []).map((q) => [q.id, q]))
    const orderedQuestions = order
        .map((qId) => questionMap.get(qId))
        .filter((q): q is NonNullable<typeof q> => Boolean(q))

    return NextResponse.json({
        message: "Berhasil memuat sesi yang sedang berjalan",
        submission: {
            id: activeSubmission.id,
            status: activeSubmission.status,
            startedAt: activeSubmission.started_at,
            duration,
        },
        questions: orderedQuestions,
        answers: activeAnswers || [],
    })
}

// POST /api/tryouts/[id]/start - Start a tryout attempt
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: tryoutId } = await params

        const authClient = await createClient()
        const {
            data: { user },
        } = await authClient.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const supabase = createServiceClient()

        const { data: profile } = await supabase
            .from("users")
            .select("id")
            .eq("auth_id", user.id)
            .single()

        if (!profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 })
        }

        const { data: tryout } = await supabase
            .from("tryouts")
            .select("*, tryout_questions(question_id)")
            .eq("id", tryoutId)
            .eq("status", "ACTIVE")
            .single()

        if (!tryout) {
            return NextResponse.json({ error: "Tryout tidak ditemukan." }, { status: 404 })
        }

        const entitlements = await getEntitlements(profile.id, supabase, { authUser: user })
        const excellentGrade = entitlements.excellentGrade
        if (excellentGrade) {
            const gradeCourse = await getExcellentCourseRow(excellentGrade, supabase)
            if (!canBetaAccessCourse(excellentGrade, gradeCourse?.id, tryout.course_id)) {
                return NextResponse.json(
                    {
                        error: "Latihan atau tryout ini tidak tersedia untuk kelas kamu.",
                        code: "FORBIDDEN_GRADE",
                    },
                    { status: 403 }
                )
            }
        }

        if (!entitlements.canStartTryout(tryout)) {
            return NextResponse.json(
                {
                    error: "Upgrade paket Anda untuk mengakses tryout/latihan ini.",
                    code: "UPGRADE_REQUIRED",
                },
                { status: 403 }
            )
        }

        const { data: activeSubmission } = await supabase
            .from("submissions")
            .select("id, status, started_at, question_order")
            .eq("user_id", profile.id)
            .eq("tryout_id", tryoutId)
            .eq("status", "IN_PROGRESS")
            .maybeSingle()

        if (activeSubmission) {
            return buildResumeResponse(supabase, activeSubmission, tryout.duration)
        }

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

        const questionIds = (tryout.tryout_questions || []).map(
            (tq: { question_id: string }) => tq.question_id
        )
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
            if (subError.code === "23505") {
                const { data: concurrentSubmission } = await supabase
                    .from("submissions")
                    .select("id, status, started_at, question_order")
                    .eq("user_id", profile.id)
                    .eq("tryout_id", tryoutId)
                    .eq("status", "IN_PROGRESS")
                    .maybeSingle()

                if (concurrentSubmission) {
                    return buildResumeResponse(supabase, concurrentSubmission, tryout.duration)
                }
            }
            console.error("Failed to create submission:", subError)
            return NextResponse.json({ error: "Gagal memulai tryout." }, { status: 500 })
        }

        const { data: questions } = await supabase
            .from("questions")
            .select("id, text, category, option_a, option_b, option_c, option_d, option_e, weight, image_url")
            .in("id", shuffled)

        const orderedQuestions = shuffled
            .map((qId: string) => questions?.find((q: { id: string }) => q.id === qId))
            .filter(Boolean)

        return NextResponse.json(
            {
                submission: {
                    id: submission.id,
                    startedAt: submission.started_at,
                    duration: tryout.duration,
                },
                questions: orderedQuestions,
            },
            { status: 201 }
        )
    } catch (error) {
        console.error("Start tryout error:", error)
        return NextResponse.json({ error: "Internal error" }, { status: 500 })
    }
}
