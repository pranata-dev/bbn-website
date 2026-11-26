import { getExcellentCourseByCodeOrSlug, type ExcellentGrade } from "@/config/excellent"
import { normalizeIdentifier } from "@/lib/postgrest-safe"

export interface ResolveLeaderboardQueryInput {
    isAdmin: boolean
    excellentGrade: ExcellentGrade | null
    rawCategory: string | null
    rawSubject: string | null
    rawLimit: string | null
    resolveExcellentCourseId: (grade: ExcellentGrade) => Promise<string | null>
    resolveCourseIdBySubject: (subject: string) => Promise<string | null>
}

export type ResolvedLeaderboardQuery =
    | {
          kind: "rpc"
          params: {
              p_is_excellent_beta: boolean
              p_course_id: string | null
              p_category: string | null
              p_limit: number
          }
      }
    | { kind: "empty" }
    | { kind: "error"; status: 400; error: string }

/**
 * Resolves and authorizes RPC arguments for `public.get_leaderboard`.
 * - Excellent Beta students are strictly locked to their verified grade course
 *   (`p_is_excellent_beta = true`, `p_course_id = gradeCourseId`), ignoring client filters.
 * - Admins querying `FISIKA_X` / `FISIKA_XI` / `FISIKA_XII` get `p_is_excellent_beta = true`
 *   scoped to that class course.
 * - Regular university students always run with `p_is_excellent_beta = false` and cannot
 *   query high-school beta courses.
 */
export async function resolveLeaderboardQuery(
    input: ResolveLeaderboardQueryInput
): Promise<ResolvedLeaderboardQuery> {
    const parsedLimit = Number.parseInt(input.rawLimit || "50", 10)
    const limit = Number.isFinite(parsedLimit) ? Math.min(Math.max(parsedLimit, 1), 200) : 50

    if (input.excellentGrade) {
        const gradeCourseId = await input.resolveExcellentCourseId(input.excellentGrade)
        if (!gradeCourseId) {
            return { kind: "empty" }
        }
        return {
            kind: "rpc",
            params: {
                p_is_excellent_beta: true,
                p_course_id: gradeCourseId,
                p_category: null,
                p_limit: limit,
            },
        }
    }

    let category: string | null = null
    if (input.rawCategory && input.rawCategory !== "all") {
        const safeCategory = normalizeIdentifier(input.rawCategory)
        if (!safeCategory) {
            return { kind: "error", status: 400, error: "Kategori tidak valid." }
        }
        category = safeCategory.toUpperCase()
    }

    let courseId: string | null = null
    let isExcellentBeta = false

    if (input.rawSubject && input.rawSubject !== "all") {
        const safeSubject = normalizeIdentifier(input.rawSubject)
        if (!safeSubject) {
            return { kind: "error", status: 400, error: "Parameter mata kuliah tidak valid." }
        }

        const isBetaCourseFilter = Boolean(getExcellentCourseByCodeOrSlug(safeSubject))
        if (isBetaCourseFilter && !input.isAdmin) {
            return { kind: "empty" }
        }

        const matchedCourseId = await input.resolveCourseIdBySubject(safeSubject)
        if (!matchedCourseId) {
            return { kind: "empty" }
        }

        courseId = matchedCourseId
        isExcellentBeta = isBetaCourseFilter && input.isAdmin
    }

    return {
        kind: "rpc",
        params: {
            p_is_excellent_beta: isExcellentBeta,
            p_course_id: courseId,
            p_category: category,
            p_limit: limit,
        },
    }
}

