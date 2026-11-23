import { describe, expect, it, vi } from "vitest"
import {
    buildExcellentSyntheticEmail,
    isAlreadyExistsAuthError,
    resolveOrCreateExcellentUser,
    type ExcellentAuthStore,
    type ExcellentProfileRow,
    type ExcellentUserMetadata,
} from "./excellent-auth"

interface MockAuthUser {
    id: string
    email: string
    user_metadata: ExcellentUserMetadata
}

function createInMemoryStore(options?: {
    simulateTrigger?: boolean
    preExistingAuthUser?: MockAuthUser
}) {
    let authCounter = 0
    const authUsers = new Map<string, MockAuthUser>()
    const profiles = new Map<string, ExcellentProfileRow & { role: string; is_active: boolean }>()

    if (options?.preExistingAuthUser) {
        authUsers.set(options.preExistingAuthUser.id, options.preExistingAuthUser)
    }

    const createAuthUserSpy = vi.fn<ExcellentAuthStore["createAuthUser"]>(
        async ({ email, user_metadata }) => {
            const existing = Array.from(authUsers.values()).find((u) => u.email === email)
            if (existing) {
                return {
                    user: null,
                    error: {
                        code: "email_exists",
                        message: "A user with this email address has already been registered",
                    },
                }
            }

            authCounter += 1
            const id = `auth-user-${authCounter}`
            authUsers.set(id, { id, email, user_metadata })

            if (options?.simulateTrigger) {
                profiles.set(`profile-trigger-${authCounter}`, {
                    id: `profile-trigger-${authCounter}`,
                    auth_id: id,
                    email,
                    name: user_metadata.name,
                    role: "STUDENT",
                    is_active: false,
                })
            }

            return { user: { id }, error: null }
        }
    )

    const verifyOtpSpy = vi.fn<ExcellentAuthStore["verifyMagicLinkOtp"]>(async () => ({
        error: null,
    }))

    const store: ExcellentAuthStore = {
        async findProfileByEmail(email) {
            return Array.from(profiles.values()).find((p) => p.email === email) ?? null
        },
        async findProfileByAuthId(authId) {
            return Array.from(profiles.values()).find((p) => p.auth_id === authId) ?? null
        },
        async updateProfile(profileId, patch) {
            const existing = profiles.get(profileId)
            if (!existing) throw new Error(`Profile not found: ${profileId}`)
            profiles.set(profileId, {
                ...existing,
                auth_id: patch.auth_id ?? existing.auth_id,
                email: patch.email ?? existing.email,
                name: patch.name,
                role: patch.role,
                is_active: patch.is_active,
            })
        },
        async insertProfile(row) {
            profiles.set(row.id, {
                id: row.id,
                auth_id: row.auth_id,
                email: row.email,
                name: row.name,
                role: row.role,
                is_active: row.is_active,
            })
        },
        createAuthUser: createAuthUserSpy,
        async updateAuthUserMetadata(authUserId, metadata) {
            const existing = authUsers.get(authUserId)
            if (!existing) return { error: { message: "User not found" } }
            authUsers.set(authUserId, { ...existing, user_metadata: metadata })
            return { error: null }
        },
        async generateMagicLink(email) {
            const existing = Array.from(authUsers.values()).find((u) => u.email === email)
            if (!existing) {
                return { user: null, hashedToken: null, error: { message: "User not found" } }
            }
            return {
                user: { id: existing.id },
                hashedToken: `token-for-${existing.id}`,
                error: null,
            }
        },
        verifyMagicLinkOtp: verifyOtpSpy,
    }

    return { store, authUsers, profiles, createAuthUserSpy, verifyOtpSpy }
}

describe("buildExcellentSyntheticEmail", () => {
    it("produces the same deterministic email across case and whitespace differences", () => {
        const a = buildExcellentSyntheticEmail("Nata", "X")
        const b = buildExcellentSyntheticEmail("  nata  ", "X")
        const c = buildExcellentSyntheticEmail("NATA", "X")

        expect(a.email).toBe(b.email)
        expect(a.email).toBe(c.email)
        expect(a.email).toMatch(/^excellent\.x\.nata\.[0-9a-f]{8}@beta\.bbn\.local$/)
        expect(b.displayName).toBe("nata")
        expect(b.canonicalName).toBe("nata")
    })

    it("collapses multiple internal spaces identically", () => {
        const a = buildExcellentSyntheticEmail("Budi Santoso", "XI")
        const b = buildExcellentSyntheticEmail("  budi    santoso  ", "XI")
        expect(a.email).toBe(b.email)
        expect(b.displayName).toBe("budi santoso")
    })

    it("prevents collisions between punctuation variants like 'A. Budi' and 'A Budi'", () => {
        const withDot = buildExcellentSyntheticEmail("A. Budi", "X")
        const withoutDot = buildExcellentSyntheticEmail("A Budi", "X")

        expect(withDot.slug).toBe(withoutDot.slug)
        expect(withDot.shortHash).not.toBe(withoutDot.shortHash)
        expect(withDot.email).not.toBe(withoutDot.email)
    })

    it("isolates identical names across different grades", () => {
        const x = buildExcellentSyntheticEmail("Nata", "X")
        const xi = buildExcellentSyntheticEmail("Nata", "XI")
        const xii = buildExcellentSyntheticEmail("Nata", "XII")

        expect(new Set([x.email, xi.email, xii.email]).size).toBe(3)
        expect(x.email).toContain("excellent.x.")
        expect(xi.email).toContain("excellent.xi.")
        expect(xii.email).toContain("excellent.xii.")
    })

    it("falls back to a safe slug for non-alphanumeric names", () => {
        const res = buildExcellentSyntheticEmail("---", "XII")
        expect(res.slug).toBe("siswa")
        expect(res.email).toMatch(/^excellent\.xii\.siswa\.[0-9a-f]{8}@beta\.bbn\.local$/)
    })
})

describe("isAlreadyExistsAuthError", () => {
    it("detects Supabase duplicate email errors by code or message", () => {
        expect(isAlreadyExistsAuthError({ code: "email_exists" })).toBe(true)
        expect(isAlreadyExistsAuthError({ code: "user_already_exists" })).toBe(true)
        expect(
            isAlreadyExistsAuthError({
                message: "A user with this email address has already been registered",
            })
        ).toBe(true)
        expect(isAlreadyExistsAuthError({ message: "Network timeout" })).toBe(false)
        expect(isAlreadyExistsAuthError(null)).toBe(false)
    })
})

describe("resolveOrCreateExcellentUser", () => {
    it("reuses the exact same Auth user and profile across re-logins with different case/whitespace", async () => {
        const { store, authUsers, profiles, createAuthUserSpy, verifyOtpSpy } =
            createInMemoryStore()

        const first = await resolveOrCreateExcellentUser({
            store,
            rawName: "Nata",
            grade: "X",
        })
        expect(first.reused).toBe(false)
        expect(createAuthUserSpy).toHaveBeenCalledTimes(1)
        expect(authUsers.size).toBe(1)
        expect(profiles.size).toBe(1)

        const second = await resolveOrCreateExcellentUser({
            store,
            rawName: "  nata  ",
            grade: "X",
        })
        expect(second.reused).toBe(true)
        expect(second.authUserId).toBe(first.authUserId)
        expect(second.profileId).toBe(first.profileId)
        expect(second.email).toBe(first.email)
        expect(createAuthUserSpy).toHaveBeenCalledTimes(1)
        expect(authUsers.size).toBe(1)
        expect(profiles.size).toBe(1)
        expect(verifyOtpSpy).toHaveBeenCalledTimes(2)
        expect(verifyOtpSpy).toHaveBeenLastCalledWith(`token-for-${first.authUserId}`)
    })

    it("keeps identical names in different grades strictly isolated into distinct accounts", async () => {
        const { store, authUsers, profiles } = createInMemoryStore()

        const gradeX = await resolveOrCreateExcellentUser({
            store,
            rawName: "Nata",
            grade: "X",
        })
        const gradeXI = await resolveOrCreateExcellentUser({
            store,
            rawName: "Nata",
            grade: "XI",
        })

        expect(gradeX.authUserId).not.toBe(gradeXI.authUserId)
        expect(gradeX.profileId).not.toBe(gradeXI.profileId)
        expect(gradeX.email).not.toBe(gradeXI.email)
        expect(authUsers.size).toBe(2)
        expect(profiles.size).toBe(2)
        expect(authUsers.get(gradeX.authUserId)?.user_metadata.excellent_grade).toBe("X")
        expect(authUsers.get(gradeXI.authUserId)?.user_metadata.excellent_grade).toBe("XI")
    })

    it("syncs trigger-created profiles without creating duplicate public.users rows", async () => {
        const { store, profiles } = createInMemoryStore({ simulateTrigger: true })

        const res = await resolveOrCreateExcellentUser({
            store,
            rawName: "Siti Rahma",
            grade: "XII",
        })

        expect(profiles.size).toBe(1)
        expect(profiles.get(res.profileId)?.is_active).toBe(true)
        expect(profiles.get(res.profileId)?.name).toBe("Siti Rahma")
    })

    it("recovers gracefully from a race condition when createUser reports email already exists", async () => {
        const identity = buildExcellentSyntheticEmail("Budi Santoso", "XI")
        const { store, authUsers, profiles, verifyOtpSpy } = createInMemoryStore({
            preExistingAuthUser: {
                id: "existing-race-user",
                email: identity.email,
                user_metadata: {
                    name: "budi santoso",
                    full_name: "budi santoso",
                    is_excellent_beta: true,
                    excellent_grade: "XI",
                },
            },
        })

        const result = await resolveOrCreateExcellentUser({
            store,
            rawName: "Budi Santoso",
            grade: "XI",
        })

        expect(result.reused).toBe(true)
        expect(result.authUserId).toBe("existing-race-user")
        expect(authUsers.size).toBe(1)
        expect(profiles.size).toBe(1)
        expect(authUsers.get("existing-race-user")?.user_metadata.full_name).toBe("Budi Santoso")
        expect(verifyOtpSpy).toHaveBeenCalledWith("token-for-existing-race-user")
    })
})

