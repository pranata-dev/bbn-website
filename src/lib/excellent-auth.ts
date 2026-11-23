import { createHash, randomUUID } from "node:crypto"
import { normalizeExcellentName, type ExcellentGrade } from "@/config/excellent"

const MAX_SLUG_LENGTH = 32

export interface ExcellentIdentity {
    displayName: string
    canonicalName: string
    slug: string
    shortHash: string
    email: string
}

/**
 * Builds a deterministic synthetic email scoped to `(normalized_name, grade)`.
 * Including a short SHA-256 hash suffix prevents punctuation collisions
 * (e.g., "A. Budi" vs "A Budi") while guaranteeing identical emails across
 * case and whitespace variations within the same grade.
 */
export function buildExcellentSyntheticEmail(
    rawName: string,
    grade: ExcellentGrade
): ExcellentIdentity {
    const { displayName, canonicalName } = normalizeExcellentName(rawName)
    const rawSlug = canonicalName
        .replace(/[^a-z0-9]+/g, ".")
        .replace(/^\.+|\.+$/g, "")
    const slug = (rawSlug || "siswa").slice(0, MAX_SLUG_LENGTH).replace(/\.+$/, "") || "siswa"
    const shortHash = createHash("sha256")
        .update(`${grade.toLowerCase()}:${canonicalName}`)
        .digest("hex")
        .slice(0, 8)
    const email = `excellent.${grade.toLowerCase()}.${slug}.${shortHash}@beta.bbn.local`

    return {
        displayName,
        canonicalName,
        slug,
        shortHash,
        email,
    }
}

interface AuthErrorLike {
    message?: string | null
    code?: string | null
    status?: number | null
}

export function isAlreadyExistsAuthError(error: AuthErrorLike | null | undefined): boolean {
    if (!error) return false
    const code = (error.code || "").toLowerCase()
    if (code === "email_exists" || code === "user_already_exists") {
        return true
    }
    const message = error.message || ""
    return /already\s+(been\s+)?registered|already\s+exists|duplicate/i.test(message)
}

export interface ExcellentUserMetadata {
    name: string
    full_name: string
    is_excellent_beta: true
    excellent_grade: ExcellentGrade
}

export interface ExcellentProfileRow {
    id: string
    auth_id: string
    email: string
    name: string
}

export interface ExcellentAuthStore {
    findProfileByEmail: (email: string) => Promise<ExcellentProfileRow | null>
    findProfileByAuthId: (authId: string) => Promise<ExcellentProfileRow | null>
    updateProfile: (
        profileId: string,
        patch: {
            auth_id?: string
            email?: string
            name: string
            role: string
            is_active: boolean
            last_login_at: string
            updated_at: string
        }
    ) => Promise<void>
    insertProfile: (row: {
        id: string
        auth_id: string
        email: string
        name: string
        role: string
        is_active: boolean
        last_login_at: string
        created_at: string
        updated_at: string
    }) => Promise<void>
    createAuthUser: (input: {
        email: string
        user_metadata: ExcellentUserMetadata
    }) => Promise<{ user: { id: string } | null; error: AuthErrorLike | null }>
    updateAuthUserMetadata: (
        authUserId: string,
        metadata: ExcellentUserMetadata
    ) => Promise<{ error: AuthErrorLike | null }>
    generateMagicLink: (email: string) => Promise<{
        user: { id: string } | null
        hashedToken: string | null
        error: AuthErrorLike | null
    }>
    verifyMagicLinkOtp: (hashedToken: string) => Promise<{ error: AuthErrorLike | null }>
}

export interface ResolveOrCreateExcellentUserResult {
    authUserId: string
    profileId: string
    email: string
    displayName: string
    reused: boolean
}

/**
 * Idempotent lookup-or-create login flow for Excellent Beta students.
 * Re-logging in with the same `(normalized_name, grade)` reuses the existing
 * Supabase Auth user and `public.users` row, preserving all progress.
 */
export async function resolveOrCreateExcellentUser(params: {
    store: ExcellentAuthStore
    rawName: string
    grade: ExcellentGrade
    now?: Date
}): Promise<ResolveOrCreateExcellentUserResult> {
    const { store, rawName, grade, now = new Date() } = params
    const identity = buildExcellentSyntheticEmail(rawName, grade)
    const nowIso = now.toISOString()

    const metadata: ExcellentUserMetadata = {
        name: identity.displayName,
        full_name: identity.displayName,
        is_excellent_beta: true,
        excellent_grade: grade,
    }

    let authUserId: string | null = null
    let reused = false
    let prefetchedHashedToken: string | null = null

    // Step 1: Indexed lookup in public.users by deterministic synthetic email
    const existingByEmail = await store.findProfileByEmail(identity.email)

    if (existingByEmail?.auth_id) {
        // Branch A: Existing user found — ensure auth metadata stays synced
        const { error: metaErr } = await store.updateAuthUserMetadata(
            existingByEmail.auth_id,
            metadata
        )
        if (!metaErr) {
            authUserId = existingByEmail.auth_id
            reused = true
        }
    }

    // Step 2: Branch B — New user (or profile existed with orphaned auth_id)
    if (!authUserId) {
        const { user: createdUser, error: createErr } = await store.createAuthUser({
            email: identity.email,
            user_metadata: metadata,
        })

        if (!createErr && createdUser?.id) {
            authUserId = createdUser.id
            reused = false
        } else if (isAlreadyExistsAuthError(createErr)) {
            // Race condition (e.g. double-submit) or pre-existing auth user without public.users row:
            // Fall back to Branch A via O(1) email-indexed generateLink lookup.
            const linkResult = await store.generateMagicLink(identity.email)
            if (linkResult.error || !linkResult.user?.id || !linkResult.hashedToken) {
                throw new Error(
                    linkResult.error?.message || "Gagal memuat akun siswa yang sudah terdaftar."
                )
            }

            authUserId = linkResult.user.id
            prefetchedHashedToken = linkResult.hashedToken
            reused = true

            const { error: metaErr } = await store.updateAuthUserMetadata(authUserId, metadata)
            if (metaErr) {
                throw new Error(metaErr.message || "Gagal menyinkronkan metadata akun siswa.")
            }
        } else {
            throw new Error(createErr?.message || "Gagal membuat akun sesi belajar.")
        }
    }

    // Step 3: Upsert/sync public.users without duplicates (handles DB trigger & race conditions)
    const profileRow =
        (existingByEmail && existingByEmail.auth_id === authUserId ? existingByEmail : null) ||
        (await store.findProfileByAuthId(authUserId)) ||
        existingByEmail

    let profileId: string
    if (profileRow) {
        profileId = profileRow.id
        await store.updateProfile(profileId, {
            auth_id: authUserId,
            email: identity.email,
            name: identity.displayName,
            role: "STUDENT",
            is_active: true,
            last_login_at: nowIso,
            updated_at: nowIso,
        })
    } else {
        profileId = randomUUID()
        await store.insertProfile({
            id: profileId,
            auth_id: authUserId,
            email: identity.email,
            name: identity.displayName,
            role: "STUDENT",
            is_active: true,
            last_login_at: nowIso,
            created_at: nowIso,
            updated_at: nowIso,
        })
    }

    // Step 4: Issue magic-link token server-side and verify OTP to attach SSR session cookies
    let hashedToken = prefetchedHashedToken
    if (!hashedToken) {
        const linkResult = await store.generateMagicLink(identity.email)
        if (linkResult.error || !linkResult.hashedToken) {
            throw new Error(linkResult.error?.message || "Gagal membuat tautan sesi masuk.")
        }
        hashedToken = linkResult.hashedToken
    }

    const { error: verifyErr } = await store.verifyMagicLinkOtp(hashedToken)
    if (verifyErr) {
        throw new Error(verifyErr.message || "Gagal memulai sesi masuk.")
    }

    return {
        authUserId,
        profileId,
        email: identity.email,
        displayName: identity.displayName,
        reused,
    }
}
