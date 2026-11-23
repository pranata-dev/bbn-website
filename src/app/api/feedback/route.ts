import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import { checkRateLimit } from "@/lib/rate-limit"
import { getExcellentBetaGrade } from "@/config/excellent"

export const dynamic = "force-dynamic"

export const FEEDBACK_CATEGORIES = [
    "MATERI",
    "LATIHAN",
    "TAMPILAN",
    "BUG",
    "LAINNYA",
] as const

const createFeedbackSchema = z.object({
    rating: z.coerce
        .number()
        .int("Rating harus berupa bilangan bulat.")
        .min(1, "Pilih rating antara 1 sampai 5.")
        .max(5, "Pilih rating antara 1 sampai 5."),
    category: z.enum(FEEDBACK_CATEGORIES, {
        error: "Kategori feedback tidak valid.",
    }),
    message: z
        .string()
        .trim()
        .min(5, "Pesan feedback minimal 5 karakter.")
        .max(1000, "Pesan feedback maksimal 1000 karakter."),
    pagePath: z.string().trim().max(255).optional().nullable(),
})

export async function POST(request: NextRequest) {
    const rateLimitResponse = checkRateLimit(request)
    if (rateLimitResponse) {
        return rateLimitResponse
    }

    try {
        const authClient = await createClient()
        const {
            data: { user },
        } = await authClient.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json().catch(() => null)
        const parsed = createFeedbackSchema.safeParse(body)

        if (!parsed.success) {
            const firstIssue = parsed.error.issues[0]?.message || "Data feedback tidak valid."
            return NextResponse.json({ error: firstIssue }, { status: 400 })
        }

        const serviceClient = createServiceClient()
        const { data: profile } = await serviceClient
            .from("users")
            .select("id, name")
            .eq("auth_id", user.id)
            .maybeSingle()

        const studentName =
            profile?.name ||
            (typeof user.user_metadata?.name === "string" ? user.user_metadata.name : null) ||
            (typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null) ||
            null

        const grade = getExcellentBetaGrade(user)

        const { data: inserted, error } = await serviceClient
            .from("beta_feedback")
            .insert({
                user_id: profile?.id ?? null,
                student_name: studentName,
                grade,
                rating: parsed.data.rating,
                category: parsed.data.category,
                message: parsed.data.message,
                page_path: parsed.data.pagePath || null,
            })
            .select("id, created_at")
            .single()

        if (error) {
            console.error("Failed to insert beta feedback:", error)
            return NextResponse.json(
                { error: "Gagal menyimpan feedback. Silakan coba lagi." },
                { status: 500 }
            )
        }

        return NextResponse.json(
            {
                ok: true,
                id: inserted.id,
                createdAt: inserted.created_at,
            },
            { status: 201 }
        )
    } catch (error) {
        console.error("POST /api/feedback error:", error)
        return NextResponse.json(
            { error: "Terjadi kesalahan pada server." },
            { status: 500 }
        )
    }
}

