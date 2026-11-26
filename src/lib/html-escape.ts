const HTML_ESCAPES: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
}

export function escapeHtml(value: string | number | null | undefined): string {
    if (value === null || value === undefined) return ""
    return String(value).replace(/[&<>"']/g, (char) => HTML_ESCAPES[char] ?? char)
}

/**
 * Returns a normalized https URL safe to place in an HTML attribute, or null when the
 * input is not an absolute https URL or embeds credentials.
 */
export function sanitizeHttpsUrl(value: string | null | undefined): string | null {
    if (typeof value !== "string") return null
    const trimmed = value.trim()
    if (!trimmed) return null

    let parsed: URL
    try {
        parsed = new URL(trimmed)
    } catch {
        return null
    }

    if (parsed.protocol !== "https:") return null
    if (parsed.username || parsed.password) return null
    if (!parsed.hostname) return null

    return parsed.toString()
}

