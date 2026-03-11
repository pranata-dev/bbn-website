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

        // Auth check using cookie-based client
        const authClient = await createClient()
        const { data: { user } } = await authClient.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Use service client for all DB operations (bypasses RLS)
        const supabase = createServiceClient()

        // Get user profile
        const { data: profile, error: profileError } = await supabase
            .from("users")
            .select("id, role, package_type")
            .eq("auth_id", user.id)
            .single()

        if (!profile) {
            console.error("Profile not found for auth_id:", user.id, profileError)
            return NextResponse.json({ error: "Profile not found" }, { status: 404 })
        }

        // Get tryout details
        const { data: tryout, error: tryoutError } = await supabase
            .from("tryouts")
            .select("*, tryout_questions(question_id)")
            .eq("id", tryoutId)
            .eq("status", "ACTIVE")
            .single()

        if (!tryout) {
            console.error("Tryout not found:", tryoutId, tryoutError)
            return NextResponse.json({ error: "Tryout tidak ditemukan." }, { status: 404 })
        }

        // Check max attempts (Global Quota Logic)
        if (tryout.is_practice) {
            if (profile.role === "STUDENT_BASIC" || profile.role === "STUDENT_PREMIUM") {
                return NextResponse.json({ error: "Akses latihan tidak diizinkan untuk role ini." }, { status: 403 })
            }
        } else {
            const { data: allSubmissions } = await supabase
                .from("submissions")
                .select("id, tryouts(is_practice)")
                .eq("user_id", profile.id)
                .in("status", ["SUBMITTED", "IN_PROGRESS"])

            const tryoutSubmissions = allSubmissions?.filter((s: any) => {
                const tryout = Array.isArray(s.tryouts) ? s.tryouts[0] : s.tryouts
                return tryout && !tryout.is_practice
            }) || []
            const usedQuota = tryoutSubmissions.length

            const { getPackageFeatures } = await import("@/lib/package-features")
            const features = getPackageFeatures(profile.package_type, profile.role)
            const maxQuota = features.tryoutLimit

            if (usedQuota >= maxQuota && profile.role !== "ADMIN") {
                return NextResponse.json(
                    { error: `Kamu sudah mencapai batas kuota tryout (Maks ${maxQuota} kali). Silakan upgrade paket atau hubungi admin untuk menambah kuota.` },
                    { status: 400 }
                )
            }
        }

        // Check active submission
        const { data: activeSubmission } = await supabase
            .from("submissions")
            .select("id, status, started_at, question_order")
            .eq("user_id", profile.id)
            .eq("tryout_id", tryoutId)
            .eq("status", "IN_PROGRESS")
            .single()

        if (activeSubmission) {
            // Fetch associated answers for resume
            const { data: activeAnswers } = await supabase
                .from("answers")
                .select("question_id, answer")
                .eq("submission_id", activeSubmission.id)

            const { data: questionsData } = await supabase
                .from("questions")
                .select("id, text, category, option_a, option_b, option_c, option_d, option_e, weight, image_url")
                .in("id", activeSubmission.question_order || [])
            
            // Format questions order
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

        // Randomize question order
        const questionIds = tryout.tryout_questions.map((tq: { question_id: string }) => tq.question_id)
        const shuffled = [...questionIds].sort(() => Math.random() - 0.5)

        // Create submission
        const submissionId = uuidv4()
        const now = new Date().toISOString()
        const { data: submission, error } = await supabase
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

        if (error) {
            console.error("Failed to create submission:", error)
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

