import { describe, it, expect, vi } from "vitest"
import { resolveLeaderboardQuery } from "./leaderboard-query"

describe("resolveLeaderboardQuery", () => {
    it("locks Excellent Beta students to their verified grade course and ignores client filters", async () => {
        const resolveExcellentCourseId = vi.fn(async () => "course-fisika-xi")
        const resolveCourseIdBySubject = vi.fn(async () => "course-fismat")

        const result = await resolveLeaderboardQuery({
            isAdmin: false,
            excellentGrade: "XI",
            rawCategory: "WEEK_1",
            rawSubject: "FISIKA_XII",
            rawLimit: "25",
            resolveExcellentCourseId,
            resolveCourseIdBySubject,
        })

        expect(result).toEqual({
            kind: "rpc",
            params: {
                p_is_excellent_beta: true,
                p_course_id: "course-fisika-xi",
                p_category: null,
                p_limit: 25,
            },
        })
        expect(resolveExcellentCourseId).toHaveBeenCalledWith("XI")
        expect(resolveCourseIdBySubject).not.toHaveBeenCalled()
    })

    it("returns empty without querying when an Excellent Beta grade course is not seeded", async () => {
        const result = await resolveLeaderboardQuery({
            isAdmin: false,
            excellentGrade: "X",
            rawCategory: null,
            rawSubject: null,
            rawLimit: null,
            resolveExcellentCourseId: async () => null,
            resolveCourseIdBySubject: async () => null,
        })

        expect(result).toEqual({ kind: "empty" })
    })

    it("allows ADMIN callers to inspect FISIKA_X/XI/XII class leaderboards with p_is_excellent_beta = true", async () => {
        for (const [subject, expectedCourseId] of [
            ["FISIKA_X", "course-x-id"],
            ["FISIKA_XI", "course-xi-id"],
            ["FISIKA_XII", "course-xii-id"],
        ] as const) {
            const result = await resolveLeaderboardQuery({
                isAdmin: true,
                excellentGrade: null,
                rawCategory: null,
                rawSubject: subject,
                rawLimit: "50",
                resolveExcellentCourseId: async () => null,
                resolveCourseIdBySubject: async () => expectedCourseId,
            })

            expect(result).toEqual({
                kind: "rpc",
                params: {
                    p_is_excellent_beta: true,
                    p_course_id: expectedCourseId,
                    p_category: null,
                    p_limit: 50,
                },
            })
        }
    })

    it("blocks non-admin university students from querying Excellent Beta class subjects", async () => {
        const resolveCourseIdBySubject = vi.fn(async () => "course-x-id")

        const result = await resolveLeaderboardQuery({
            isAdmin: false,
            excellentGrade: null,
            rawCategory: null,
            rawSubject: "FISIKA_X",
            rawLimit: "50",
            resolveExcellentCourseId: async () => null,
            resolveCourseIdBySubject,
        })

        expect(result).toEqual({ kind: "empty" })
        expect(resolveCourseIdBySubject).not.toHaveBeenCalled()
    })

    it("keeps university leaderboard queries scoped to p_is_excellent_beta = false for both admins and students", async () => {
        const result = await resolveLeaderboardQuery({
            isAdmin: true,
            excellentGrade: null,
            rawCategory: "week_2",
            rawSubject: "FISMAT",
            rawLimit: "500",
            resolveExcellentCourseId: async () => null,
            resolveCourseIdBySubject: async () => "course-fismat",
        })

        expect(result).toEqual({
            kind: "rpc",
            params: {
                p_is_excellent_beta: false,
                p_course_id: "course-fismat",
                p_category: "WEEK_2",
                p_limit: 200,
            },
        })
    })

    it("rejects malformed PostgREST filter characters in category or subject with 400", async () => {
        const badCategory = await resolveLeaderboardQuery({
            isAdmin: false,
            excellentGrade: null,
            rawCategory: "WEEK_1,is_practice.eq.true",
            rawSubject: null,
            rawLimit: null,
            resolveExcellentCourseId: async () => null,
            resolveCourseIdBySubject: async () => null,
        })
        expect(badCategory).toMatchObject({ kind: "error", status: 400 })

        const badSubject = await resolveLeaderboardQuery({
            isAdmin: true,
            excellentGrade: null,
            rawCategory: null,
            rawSubject: "FISMAT.eq.1",
            rawLimit: null,
            resolveExcellentCourseId: async () => null,
            resolveCourseIdBySubject: async () => null,
        })
        expect(badSubject).toMatchObject({ kind: "error", status: 400 })
    })
})

