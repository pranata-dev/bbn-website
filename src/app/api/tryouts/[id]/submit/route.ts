import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { submitTryout } from "@/services/tryoutService"
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
        const body = await request.json()
        const validatedBody = submitTryoutSchema.safeParse(body)

        if (!validatedBody.success) {
            return NextResponse.json({ 
                error: "Invalid request body", 
                details: validatedBody.error.format() 
            }, { status: 400 })
        }

        const { submissionId, answers } = validatedBody.data

        // 3. Call Service Layer
        const result = await submitTryout({
            authId: user.id,
            tryoutId,
            submissionId,
            answers,
        })

        // 4. Return response
        return NextResponse.json(result)
        
    } catch (error: any) {
        console.error("Submit tryout error:", error)
        
        // Map specific business logic errors to HTTP status codes
        const errorMessage = error.message || "Internal error"
        let status = 500
        
        if (errorMessage === "Profile not found" || errorMessage === "Submission tidak ditemukan.") {
            status = 404
        } else if (errorMessage === "Tryout sudah di-submit." || errorMessage.includes("Gagal menyimpan jawaban")) {
            status = 400
        }
        
        return NextResponse.json({ error: errorMessage }, { status })
    }
}
