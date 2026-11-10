import { describe, it, expect, vi, beforeEach } from "vitest"
import { getAdminSession, requireAdmin } from "./admin-auth"

// Mock @/lib/supabase/server
vi.mock("@/lib/supabase/server", () => ({
    createClient: vi.fn(),
    createServiceClient: vi.fn(),
}))

import { createClient, createServiceClient } from "@/lib/supabase/server"

describe("Admin Authorization Guard (requireAdmin & getAdminSession)", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("returns 401 when no authenticated user session exists", async () => {
        vi.mocked(createClient).mockResolvedValue({
            auth: {
                getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
            },
        } as unknown as Awaited<ReturnType<typeof createClient>>)

        const result = await getAdminSession()
        expect(result.ok).toBe(false)
        if (!result.ok) {
            expect(result.status).toBe(401)
            expect(result.error).toBe("Unauthorized")
        }

        const guard = await requireAdmin()
        expect(guard.ok).toBe(false)
        if (!guard.ok) {
            expect(guard.response.status).toBe(401)
        }
    })

    it("returns 403 when authenticated user is not an ADMIN", async () => {
        vi.mocked(createClient).mockResolvedValue({
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: { user: { id: "auth-student-1", email: "student@bbn.id" } },
                }),
            },
        } as unknown as Awaited<ReturnType<typeof createClient>>)

        vi.mocked(createServiceClient).mockReturnValue({
            from: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        maybeSingle: vi.fn().mockResolvedValue({
                            data: {
                                id: "u-1",
                                auth_id: "auth-student-1",
                                email: "student@bbn.id",
                                name: "Budi",
                                role: "STUDENT",
                            },
                            error: null,
                        }),
                    }),
                }),
            }),
        } as unknown as ReturnType<typeof createServiceClient>)

        const result = await getAdminSession()
        expect(result.ok).toBe(false)
        if (!result.ok) {
            expect(result.status).toBe(403)
            expect(result.error).toContain("Forbidden: admin access required")
        }

        const guard = await requireAdmin()
        expect(guard.ok).toBe(false)
        if (!guard.ok) {
            expect(guard.response.status).toBe(403)
        }
    })

    it("returns ok: true when user has role ADMIN in public.users", async () => {
        const mockUser = { id: "auth-admin-1", email: "admin@bbn.id" }
        const mockProfile = {
            id: "u-admin",
            auth_id: "auth-admin-1",
            email: "admin@bbn.id",
            name: "Nata Admin",
            role: "ADMIN",
        }

        vi.mocked(createClient).mockResolvedValue({
            auth: {
                getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
            },
        } as unknown as Awaited<ReturnType<typeof createClient>>)

        vi.mocked(createServiceClient).mockReturnValue({
            from: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        maybeSingle: vi.fn().mockResolvedValue({
                            data: mockProfile,
                            error: null,
                        }),
                    }),
                }),
            }),
        } as unknown as ReturnType<typeof createServiceClient>)

        const result = await getAdminSession()
        expect(result.ok).toBe(true)
        if (result.ok) {
            expect(result.user).toEqual(mockUser)
            expect(result.profile.role).toBe("ADMIN")
        }

        const guard = await requireAdmin()
        expect(guard.ok).toBe(true)
        if (guard.ok) {
            expect(guard.profile.email).toBe("admin@bbn.id")
        }
    })
})

