import { randomBytes, randomUUID, timingSafeEqual } from "node:crypto"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import { checkRateLimit } from "@/lib/rate-limit"
import { getExcellentCourseByGrade, type ExcellentGrade } from "@/config/excellent"

export const dynamic = "force-dynamic"

const excellentLoginSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Nama lengkap minimal 2 karakter.")
        .max(60, "Nama lengkap maksimal 60 karakter."),
    password: z
        .string()
        .min(1, "Password kelas wajib diisi.")
        .max(128, "Password kelas tidak valid."),
})

function safePasswordMatch(candidate: string, expected: string): boolean {
    const candidateBuf = Buffer.from(candidate, "utf8")
    const expectedBuf = Buffer.from(expected, "utf8")

    if (candidateBuf.length !== expectedBuf.length) {
        // Keep constant-time primitive invoked even when lengths differ
        timingSafeEqual(expectedBuf, expectedBuf)
        return false
    }

    return timingSafeEqual(candidateBuf, expectedBuf)
}

function resolveGradeFromPassword(password: string): {
    configured: boolean
    grade: ExcellentGrade | null
} {
    const entries: Array<{ grade: ExcellentGrade; secret: string | undefined }> = [
        { grade: "X", secret: process.env.EXCELLENT_PASSWORD_X?.trim() },
        { grade: "XI", secret: process.env.EXCELLENT_PASSWORD_XI?.trim() },
        { grade: "XII", secret: process.env.EXCELLENT_PASSWORD_XII?.trim() },
    ]

    const configuredEntries = entries.filter(
        (entry): entry is { grade: ExcellentGrade; secret: string } =>
            Boolean(entry.secret && entry.secret.length > 0)
    )

    if (configuredEntries.length === 0) {
        return { configured: false, grade: null }
    }

    let matchedGrade: ExcellentGrade | null = null
    for (const entry of configuredEntries) {
        if (safePasswordMatch(password, entry.secret) && matchedGrade === null) {
            matchedGrade = entry.grade
        }
    }

    return { configured: true, grade: matchedGrade }
}

export async function POST(request: NextRequest) {
    const rateLimitResponse = checkRateLimit(request)
    if (rateLimitResponse) {
        return rateLimitResponse
    }

    try {
        const body = await request.json().catch(() => null)
        const parsed = excellentLoginSchema.safeParse(body)

        if (!parsed.success) {
            const firstIssue = parsed.error.issues[0]?.message || "Data login tidak valid."
            return NextResponse.json({ error: firstIssue }, { status: 400 })
        }

        const { name, password } = parsed.data
        const { configured, grade } = resolveGradeFromPassword(password)

        if (!configured) {
            console.error("Excellent Beta login attempted but EXCELLENT_PASSWORD_* env vars are not configured.")
            return NextResponse.json(
                { error: "Akses kelas beta belum dikonfigurasi. Silakan hubungi pengajar." },
                { status: 503 }
            )
        }

        if (!grade) {
            return NextResponse.json(
                { error: "Password kelas tidak sesuai. Periksa kembali password dari pengajar." },
                { status: 401 }
            )
        }

        const course = getExcellentCourseByGrade(grade)
        if (!course) {
            return NextResponse.json(
                { error: "Konfigurasi kelas tidak ditemukan." },
                { status: 500 }
            )
        }

        const serviceClient = createServiceClient()
        const randomHex = randomBytes(8).toString("hex")
        const syntheticEmail = `excellent-${grade.toLowerCase()}-${randomHex}@beta.bbn.local`
        const generatedPassword = randomBytes(24).toString("base64url")

        const { data: createdAuth, error: createUserError } =
            await serviceClient.auth.admin.createUser({
                email: syntheticEmail,
                password: generatedPassword,
                email_confirm: true,
                user_metadata: {
                    name,
                    full_name: name,
                    is_excellent_beta: true,
                    excellent_grade: grade,
                },
            })

        if (createUserError || !createdAuth.user) {
            console.error("Failed to create Excellent Beta auth user:", createUserError)
            return NextResponse.json(
                { error: "Gagal membuat sesi belajar. Silakan coba lagi." },
                { status: 500 }
            )
        }

        const authUserId = createdAuth.user.id
        const nowIso = new Date().toISOString()

        // Ensure public.users row is active and synced whether on_auth_user_created trigger ran or not
        const { data: existingProfile } = await serviceClient
            .from("users")
            .select("id")
            .eq("auth_id", authUserId)
            .maybeSingle()

        if (existingProfile) {
            const { error: updateErr } = await serviceClient
                .from("users")
                .update({
                    name,
                    role: "STUDENT",
                    is_active: true,
                    updated_at: nowIso,
                })
                .eq("id", existingProfile.id)

            if (updateErr) {
                console.error("Failed to sync Excellent Beta profile:", updateErr)
                return NextResponse.json(
                    { error: "Gagal menyiapkan profil siswa. Silakan coba lagi." },
                    { status: 500 }
                )
            }
        } else {
            const { error: insertErr } = await serviceClient.from("users").insert({
                id: randomUUID(),
                auth_id: authUserId,
                email: syntheticEmail,
                name,
                role: "STUDENT",
                is_active: true,
                created_at: nowIso,
                updated_at: nowIso,
            })

            if (insertErr) {
                console.error("Failed to insert Excellent Beta profile:", insertErr)
                return NextResponse.json(
                    { error: "Gagal menyiapkan profil siswa. Silakan coba lagi." },
                    { status: 500 }
                )
            }
        }

        // Establish standard Supabase Auth SSR session cookies on this response
        const authClient = await createClient()
        const { error: signInError } = await authClient.auth.signInWithPassword({
            email: syntheticEmail,
            password: generatedPassword,
        })

        if (signInError) {
            console.error("Failed to sign in Excellent Beta user:", signInError)
            return NextResponse.json(
                { error: "Gagal memulai sesi masuk. Silakan coba lagi." },
                { status: 500 }
            )
        }

        return NextResponse.json({
            ok: true,
            grade,
            courseSlug: course.slug,
        })
    } catch (error) {
        console.error("Excellent login error:", error)
        return NextResponse.json(
            { error: "Terjadi kesalahan pada server. Silakan coba lagi." },
            { status: 500 }
        )
    }
}

