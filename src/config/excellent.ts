export type ExcellentGrade = "X" | "XI" | "XII"

export type ExcellentCourseCode = "FISIKA_X" | "FISIKA_XI" | "FISIKA_XII"

export type ExcellentCourseSlug =
    | "fisika-kelas-x"
    | "fisika-kelas-xi"
    | "fisika-kelas-xii"

export interface ExcellentCourseConfig {
    grade: ExcellentGrade
    code: ExcellentCourseCode
    slug: ExcellentCourseSlug
    title: string
    label: string
    sortOrder: number
}

export const EXCELLENT_GRADES: readonly ExcellentGrade[] = ["X", "XI", "XII"] as const

export const EXCELLENT_COURSES: readonly ExcellentCourseConfig[] = [
    {
        grade: "X",
        code: "FISIKA_X",
        slug: "fisika-kelas-x",
        title: "Fisika Kelas X",
        label: "Kelas X",
        sortOrder: 210,
    },
    {
        grade: "XI",
        code: "FISIKA_XI",
        slug: "fisika-kelas-xi",
        title: "Fisika Kelas XI",
        label: "Kelas XI",
        sortOrder: 220,
    },
    {
        grade: "XII",
        code: "FISIKA_XII",
        slug: "fisika-kelas-xii",
        title: "Fisika Kelas XII",
        label: "Kelas XII",
        sortOrder: 230,
    },
] as const

export function isExcellentGrade(value: unknown): value is ExcellentGrade {
    return value === "X" || value === "XI" || value === "XII"
}

export function getExcellentCourseByGrade(
    grade: string | null | undefined
): ExcellentCourseConfig | undefined {
    if (!grade) return undefined
    const normalized = grade.trim().toUpperCase()
    return EXCELLENT_COURSES.find((course) => course.grade === normalized)
}

export function getExcellentCourseByCodeOrSlug(
    value: string | null | undefined
): ExcellentCourseConfig | undefined {
    if (!value) return undefined
    const trimmed = value.trim()
    const upper = trimmed.toUpperCase()
    const lower = trimmed.toLowerCase()
    return EXCELLENT_COURSES.find(
        (course) => course.code === upper || course.slug === lower
    )
}

export interface AuthUserMetadataLike {
    user_metadata?: Record<string, unknown> | null
}

/**
 * Extracts the locked Excellent Beta grade from Supabase Auth user_metadata.
 * Returns null for regular university users and admins.
 */
export function getExcellentBetaGrade(
    authUser: AuthUserMetadataLike | null | undefined
): ExcellentGrade | null {
    const meta = authUser?.user_metadata
    if (!meta || meta.is_excellent_beta !== true) {
        return null
    }

    const rawGrade =
        typeof meta.excellent_grade === "string"
            ? meta.excellent_grade.trim().toUpperCase()
            : null

    return isExcellentGrade(rawGrade) ? rawGrade : null
}

