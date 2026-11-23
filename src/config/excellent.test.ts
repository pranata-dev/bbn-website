import { describe, it, expect } from "vitest"
import {
    EXCELLENT_COURSES,
    getExcellentBetaGrade,
    getExcellentCourseByCodeOrSlug,
    getExcellentCourseByGrade,
    isExcellentGrade,
} from "./excellent"

describe("Excellent Beta Grade Course Configuration", () => {
    it("defines the three Physics high school grade courses", () => {
        expect(EXCELLENT_COURSES).toHaveLength(3)
        expect(EXCELLENT_COURSES.map((c) => c.grade)).toEqual(["X", "XI", "XII"])
        expect(EXCELLENT_COURSES.map((c) => c.code)).toEqual([
            "FISIKA_X",
            "FISIKA_XI",
            "FISIKA_XII",
        ])
        expect(EXCELLENT_COURSES.map((c) => c.slug)).toEqual([
            "fisika-kelas-x",
            "fisika-kelas-xi",
            "fisika-kelas-xii",
        ])
    })

    describe("isExcellentGrade", () => {
        it("returns true only for X, XI, and XII", () => {
            expect(isExcellentGrade("X")).toBe(true)
            expect(isExcellentGrade("XI")).toBe(true)
            expect(isExcellentGrade("XII")).toBe(true)
            expect(isExcellentGrade("x")).toBe(false)
            expect(isExcellentGrade("IX")).toBe(false)
            expect(isExcellentGrade("")).toBe(false)
            expect(isExcellentGrade(null)).toBe(false)
            expect(isExcellentGrade(undefined)).toBe(false)
        })
    })

    describe("getExcellentCourseByGrade", () => {
        it("resolves course config case-insensitively with trimming", () => {
            expect(getExcellentCourseByGrade("X")?.code).toBe("FISIKA_X")
            expect(getExcellentCourseByGrade(" xi ")?.slug).toBe("fisika-kelas-xi")
            expect(getExcellentCourseByGrade("XII")?.title).toBe("Fisika Kelas XII")
        })

        it("returns undefined for unknown or empty grades", () => {
            expect(getExcellentCourseByGrade("IX")).toBeUndefined()
            expect(getExcellentCourseByGrade("")).toBeUndefined()
            expect(getExcellentCourseByGrade(null)).toBeUndefined()
        })
    })

    describe("getExcellentCourseByCodeOrSlug", () => {
        it("matches by course code or slug regardless of casing", () => {
            expect(getExcellentCourseByCodeOrSlug("FISIKA_X")?.grade).toBe("X")
            expect(getExcellentCourseByCodeOrSlug("fisika_xi")?.grade).toBe("XI")
            expect(getExcellentCourseByCodeOrSlug("fisika-kelas-xii")?.code).toBe("FISIKA_XII")
            expect(getExcellentCourseByCodeOrSlug(" FISIKA-KELAS-X ")?.label).toBe("Kelas X")
        })

        it("returns undefined for university subjects or invalid values", () => {
            expect(getExcellentCourseByCodeOrSlug("FISDAS2")).toBeUndefined()
            expect(getExcellentCourseByCodeOrSlug("fismat")).toBeUndefined()
            expect(getExcellentCourseByCodeOrSlug(undefined)).toBeUndefined()
        })
    })

    describe("getExcellentBetaGrade", () => {
        it("extracts valid grade only when is_excellent_beta is strictly true", () => {
            expect(
                getExcellentBetaGrade({
                    user_metadata: { is_excellent_beta: true, excellent_grade: "X" },
                })
            ).toBe("X")

            expect(
                getExcellentBetaGrade({
                    user_metadata: { is_excellent_beta: true, excellent_grade: " xii " },
                })
            ).toBe("XII")

            expect(
                getExcellentBetaGrade({
                    user_metadata: { is_excellent_beta: false, excellent_grade: "X" },
                })
            ).toBeNull()

            expect(
                getExcellentBetaGrade({
                    user_metadata: { is_excellent_beta: true, excellent_grade: "INVALID" },
                })
            ).toBeNull()

            expect(getExcellentBetaGrade(null)).toBeNull()
        })
    })
})

