import { describe, it, expect } from "vitest"
import {
    escapeLikePattern,
    findCourseIdByIdentifier,
    isUuid,
    normalizeIdentifier,
    type QueryClient,
} from "./postgrest-safe"

describe("postgrest-safe", () => {
    describe("normalizeIdentifier", () => {
        it("accepts clean slugs, course codes, and UUIDs", () => {
            expect(normalizeIdentifier("fismat")).toBe("fismat")
            expect(normalizeIdentifier("FISIKA_XII")).toBe("FISIKA_XII")
            expect(normalizeIdentifier("  fisika-kelas-x  ")).toBe("fisika-kelas-x")
            expect(normalizeIdentifier("550e8400-e29b-41d4-a716-446655440000")).toBe(
                "550e8400-e29b-41d4-a716-446655440000"
            )
        })

        it("rejects PostgREST filter syntax and wildcard injection characters", () => {
            expect(normalizeIdentifier("slug,is_published.eq.false")).toBeNull()
            expect(normalizeIdentifier("a.eq.b")).toBeNull()
            expect(normalizeIdentifier("id.in.(1,2)")).toBeNull()
            expect(normalizeIdentifier("fismat%")).toBeNull()
            expect(normalizeIdentifier("fismat*")).toBeNull()
            expect(normalizeIdentifier("foo bar")).toBeNull()
            expect(normalizeIdentifier("")).toBeNull()
            expect(normalizeIdentifier(null)).toBeNull()
            expect(normalizeIdentifier("a".repeat(101))).toBeNull()
        })
    })

    describe("isUuid and escapeLikePattern", () => {
        it("validates UUIDs strictly", () => {
            expect(isUuid("550e8400-e29b-41d4-a716-446655440000")).toBe(true)
            expect(isUuid("not-a-uuid")).toBe(false)
            expect(isUuid(null)).toBe(false)
        })

        it("escapes LIKE/ILIKE wildcards and backslashes", () => {
            expect(escapeLikePattern("user_100%@example.com")).toBe("user\\_100\\%@example.com")
            expect(escapeLikePattern("a\\b")).toBe("a\\\\b")
        })
    })

    describe("findCourseIdByIdentifier", () => {
        function createMockClient(courses: { id: string; code: string; slug: string }[]) {
            const calls: { column: string; value: string }[] = []
            const client = {
                from: () => ({
                    select: () => ({
                        eq: (column: string, value: string) => {
                            calls.push({ column, value })
                            return {
                                maybeSingle: async () => {
                                    const found = courses.find(
                                        (c) => c[column as keyof typeof c] === value
                                    )
                                    return { data: found ? { id: found.id } : null, error: null }
                                },
                            }
                        },
                    }),
                }),
            } as unknown as QueryClient
            return { client, calls }
        }

        it("resolves course by code, slug, or UUID without executing queries on injected payloads", async () => {
            const uuid = "550e8400-e29b-41d4-a716-446655440000"
            const { client, calls } = createMockClient([
                { id: uuid, code: "FISMAT", slug: "fisika-matematika" },
            ])

            expect(await findCourseIdByIdentifier(client, "fismat,id.eq.other")).toBeNull()
            expect(calls).toHaveLength(0)

            expect(await findCourseIdByIdentifier(client, "fismat")).toBe(uuid)
            expect(await findCourseIdByIdentifier(client, "fisika-matematika")).toBe(uuid)
            expect(await findCourseIdByIdentifier(client, uuid, { allowId: true })).toBe(uuid)
        })
    })
})

