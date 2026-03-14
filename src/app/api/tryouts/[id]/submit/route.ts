import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { submitTryout, SubmitTryoutResponse } from "@/services/tryoutService"
import { submitTryoutSchema } from "@/lib/validators"

// POST /api/tryouts/[id]/submit - Submit tryout answers
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

        // 2. Parse and validate request body
        const body = (await request.json()) as unknown
        const validatedBody = submitTryoutSchema.safeParse(body)

        if (!validatedBody.success) {
            return NextResponse.json({ 
                error: "Invalid request body", 
                details: validatedBody.error.format() 
            }, { status: 400 })
        }

        const { submissionId, answers } = validatedBody.data

        // 3. Call Service Layer
        const result: SubmitTryoutResponse = await submitTryout({
            authId: user.id,
            tryoutId,
            submissionId,
            answers: answers.map(a => ({
                questionId: a.questionId,
                answer: a.answer
            })),
        })

        // 4. Return response
        return NextResponse.json(result)
        
    } catch (error: unknown) {
        console.error("Submit tryout error:", error)
        
        const errorMessage = error instanceof Error ? error.message : "Internal error"
        let status = 500
        
        if (errorMessage === "Profile not found" || errorMessage === "Submission tidak ditemukan.") {
            status = 404
        } else if (errorMessage === "Tryout sudah di-submit." || errorMessage.includes("Gagal menyimpan jawaban")) {
            status = 400
        }
        
        return NextResponse.json({ error: errorMessage }, { status })
    }
}
