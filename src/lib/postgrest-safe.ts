import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database.types"

const IDENTIFIER_PATTERN = /^[A-Za-z0-9_-]{1,100}$/
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export type QueryClient = Pick<SupabaseClient<Database>, "from">

/**
 * Accepts only plain identifiers (letters, digits, `_`, `-`). Values containing PostgREST
 * filter syntax such as `,`, `.`, `(`, `)`, `*`, `%`, or whitespace are rejected.
 */
export function normalizeIdentifier(value: string | null | undefined): string | null {
    if (typeof value !== "string") return null
    const trimmed = value.trim()
    return IDENTIFIER_PATTERN.test(trimmed) ? trimmed : null
}

export function isUuid(value: string | null | undefined): value is string {
    return typeof value === "string" && UUID_PATTERN.test(value.trim())
}

/** Escapes LIKE/ILIKE wildcards so the value is matched literally. */
export function escapeLikePattern(value: string): string {
    return value.replace(/[\\%_]/g, (char) => `\\${char}`)
}

export interface CourseIdentifierOptions {
    allowId?: boolean
}

/**
 * Resolves a course id from a raw subject identifier using parameterized equality filters:
 * exact `id` (when allowed and UUID-shaped), then uppercase `code`, then lowercase `slug`.
 */
export async function findCourseIdByIdentifier(
    client: QueryClient,
    rawIdentifier: string | null | undefined,
    options: CourseIdentifierOptions = {}
): Promise<string | null> {
    const identifier = normalizeIdentifier(rawIdentifier)
    if (!identifier) return null

    if (options.allowId && isUuid(identifier)) {
        const { data } = await client.from("courses").select("id").eq("id", identifier).maybeSingle()
        if (data?.id) return data.id
    }

    const { data: byCode } = await client
        .from("courses")
        .select("id")
        .eq("code", identifier.toUpperCase())
        .maybeSingle()
    if (byCode?.id) return byCode.id

    const { data: bySlug } = await client
        .from("courses")
        .select("id")
        .eq("slug", identifier.toLowerCase())
        .maybeSingle()
    return bySlug?.id ?? null
}

