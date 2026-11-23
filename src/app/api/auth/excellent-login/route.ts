import { timingSafeEqual } from "node:crypto"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import { checkRateLimit } from "@/lib/rate-limit"
import {
    getExcellentCourseByGrade,
    normalizeExcellentName,
    type ExcellentGrade,
} from "@/config/excellent"
import {
    resolveOrCreateExcellentUser,
    type ExcellentAuthStore,
} from "@/lib/excellent-auth"

export const dynamic = "force-dynamic"

const excellentLoginSchema = z.preprocess(
    (input) => {
        if (!input || typeof input !== "object") return input
        const record = input as Record<string, unknown>
        const rawName =
            typeof record.name === "string"
                ? record.name
                : typeof record.fullName === "string"
                ? record.fullName
                : ""
        return {
            name: normalizeExcellentName(rawName).displayName,
            password: record.password,
        }
    },
    z.object({
        name: z
            .string()
            .min(2, "Nama lengkap minimal 2 karakter.")
            .max(80, "Nama lengkap maksimal 80 karakter."),
        password: z
            .string()
            .min(1, "Password kelas wajib diisi.")
            .max(128, "Password kelas tidak valid."),
    })
)

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

function createSupabaseExcellentAuthStore(
    serviceClient: ReturnType<typeof createServiceClient>,
    authClient: Awaited<ReturnType<typeof createClient>>
): ExcellentAuthStore {
    return {
        async findProfileByEmail(email) {
            const { data } = await serviceClient
                .from("users")
                .select("id, auth_id, email, name")
                .eq("email", email)
                .maybeSingle()
            return data ?? null
        },

        async findProfileByAuthId(authId) {
            const { data } = await serviceClient
                .from("users")
                .select("id, auth_id, email, name")
                .eq("auth_id", authId)
                .maybeSingle()
            return data ?? null
        },

        async updateProfile(profileId, patch) {
            const { error } = await serviceClient
                .from("users")
                .update(patch)
                .eq("id", profileId)
            if (error) {
                throw new Error(`Failed to update Excellent Beta profile: ${error.message}`)
            }
        },

        async insertProfile(row) {
            const { error } = await serviceClient.from("users").insert(row)
            if (error) {
                throw new Error(`Failed to insert Excellent Beta profile: ${error.message}`)
            }
        },

        async createAuthUser({ email, user_metadata }) {
            const { data, error } = await serviceClient.auth.admin.createUser({
                email,
                email_confirm: true,
                user_metadata,
            })
            return {
                user: data?.user ? { id: data.user.id } : null,
                error: error ?? null,
            }
        },

        async updateAuthUserMetadata(authUserId, metadata) {
            const { error } = await serviceClient.auth.admin.updateUserById(authUserId, {
                user_metadata: metadata,
            })
            return { error: error ?? null }
        },

        async generateMagicLink(email) {
            const { data, error } = await serviceClient.auth.admin.generateLink({
                type: "magiclink",
                email,
            })
            return {
                user: data?.user ? { id: data.user.id } : null,
                hashedToken: data?.properties?.hashed_token ?? null,
                error: error ?? null,
            }
        },

        async verifyMagicLinkOtp(hashedToken) {
            const { error } = await authClient.auth.verifyOtp({
                token_hash: hashedToken,
                type: "magiclink",
            })
            return { error: error ?? null }
        },
    }
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
            console.error(
                "Excellent Beta login attempted but EXCELLENT_PASSWORD_* env vars are not configured."
            )
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
        const authClient = await createClient()
        const store = createSupabaseExcellentAuthStore(serviceClient, authClient)

        await resolveOrCreateExcellentUser({
            store,
            rawName: name,
            grade,
        })

        return NextResponse.json({
            ok: true,
            grade,
            courseSlug: course.slug,
        })
    } catch (error) {
        console.error("Excellent login error:", error)
        return NextResponse.json(
            { error: "Gagal memulai sesi masuk. Silakan coba lagi." },
            { status: 500 }
        )
    }
}
