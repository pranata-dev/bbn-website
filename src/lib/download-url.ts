const PLACEHOLDER_URL = "https://bebasbikinnyaman.com"

const DRIVE_FILE_D_REGEX = /^https?:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i

/**
 * Converts common Google Drive sharing links into direct-download URLs.
 * Returns null for empty strings or the default placeholder URL.
 * Preserves non-Google Drive HTTPS URLs (such as Supabase Storage URLs) untouched.
 */
export function toDirectDownloadUrl(rawUrl: string | null | undefined): string | null {
    if (!rawUrl) return null

    const trimmed = rawUrl.trim()
    if (!trimmed) return null

    if (trimmed.replace(/\/+$/, "").toLowerCase() === PLACEHOLDER_URL) {
        return null
    }

    const filePathMatch = trimmed.match(DRIVE_FILE_D_REGEX)
    if (filePathMatch?.[1]) {
        return `https://drive.google.com/uc?export=download&id=${filePathMatch[1]}`
    }

    try {
        const parsed = new URL(trimmed)
        if (parsed.hostname.toLowerCase() === "drive.google.com") {
            const normalizedPath = parsed.pathname.replace(/\/+$/, "").toLowerCase()
            if (normalizedPath === "/open" || normalizedPath === "/uc") {
                const fileId = parsed.searchParams.get("id")?.trim()
                if (fileId) {
                    return `https://drive.google.com/uc?export=download&id=${fileId}`
                }
            }
        }
    } catch {
        // Not a parseable absolute URL; return trimmed value below.
    }

    return trimmed
}

