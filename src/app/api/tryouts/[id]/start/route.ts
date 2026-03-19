import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/server"
import { v4 as uuidv4 } from "uuid"

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

        // 4. Get User Subject Access
        const { data: access } = await supabase
            .from("user_subject_access")
            .select("*")
            .eq("user_id", profile.id)
            .eq("subject", tryout.subject)
            .eq("is_active", true)
            .single()

        if (!access) {
            return NextResponse.json({ 
                error: `Anda tidak memiliki akses aktif untuk mata kuliah ${tryout.subject}.` 
            }, { status: 403 })
        }

        // 5. Check role-based permissions and quotas
        const { getPackageFeatures, canAccessPracticePart } = await import("@/lib/package-features")
        const features = getPackageFeatures(access.package_type, access.role)

        if (tryout.is_practice) {
            if (!features.canAccessLatihan) {
                return NextResponse.json({ error: "Akses latihan tidak diizinkan untuk paket Anda." }, { status: 403 })
            }
            if (!canAccessPracticePart(access.package_type, access.role, tryout.practice_part)) {
                return NextResponse.json({ error: "Upgrade paket Anda untuk mengakses bagian ini." }, { status: 403 })
            }
        } else {
            if (!features.canAccessTryout && access.role !== "ADMIN") {
                return NextResponse.json({ error: "Akses tryout tidak diizinkan untuk paket Anda." }, { status: 403 })
            }

            const usedQuota = access.tryout_attempts_used
            const maxQuota = features.tryoutLimit

            if (usedQuota >= maxQuota && access.role !== "ADMIN") {
                return NextResponse.json(
                    { error: `Kamu sudah mencapai batas kuota tryout (${maxQuota} kali).` },
                    { status: 400 }
                )
            }
        }

        // 6. Check active submission
        const { data: activeSubmission } = await supabase
            .from("submissions")
            .select("id, status, started_at, question_order")
            .eq("user_id", profile.id)
            .eq("tryout_id", tryoutId)
            .eq("status", "IN_PROGRESS")
            .single()

        if (activeSubmission) {
            const { data: activeAnswers } = await supabase
                .from("answers")
                .select("question_id, answer")
                .eq("submission_id", activeSubmission.id)

            const { data: questionsData } = await supabase
                .from("questions")
                .select("id, text, category, option_a, option_b, option_c, option_d, option_e, weight, image_url")
                .in("id", activeSubmission.question_order || [])
            
            const orderedQuestions = (activeSubmission.question_order || []).map((qId: string) => {
                return questionsData?.find((q: any) => q.id === qId)
            }).filter((q: any) => q)

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

        // 7. Start New Attempt
        const questionIds = tryout.tryout_questions.map((tq: { question_id: string }) => tq.question_id)
        const shuffled = [...questionIds].sort(() => Math.random() - 0.5)

        const submissionId = uuidv4()
        const now = new Date().toISOString()
        const { data: submission, error: subError } = await supabase
            .from("submissions")
            .insert({
                id: submissionId,
                user_id: profile.id,
                tryout_id: tryoutId,
                status: "IN_PROGRESS",
                started_at: now,
                question_order: shuffled,
                total_count: shuffled.length,
                created_at: now,
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

