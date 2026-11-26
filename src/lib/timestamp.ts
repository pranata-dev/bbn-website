const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const SPACE_SEPARATED_PATTERN = /^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2})/
const OFFSET_PATTERN = /([+-])(\d{2})(?::?(\d{2}))?$/
const ZULU_PATTERN = /[Zz]$/
const TIME_PART_PATTERN = /T\d{2}:\d{2}/

/**
 * Parses a database timestamp as UTC unless it carries an explicit offset.
 * Accepts ISO 8601 strings, Postgres space-separated output, `Z`/`z`, `+HH`, `+HHMM`,
 * and `+HH:MM` offsets. Returns epoch milliseconds, or null when the value is invalid.
 */
export function parseUtcTimestamp(value: string | null | undefined): number | null {
    if (typeof value !== "string") return null
    let normalized = value.trim()
    if (!normalized) return null

    if (DATE_ONLY_PATTERN.test(normalized)) {
        normalized = `${normalized}T00:00:00Z`
    } else {
        normalized = normalized.replace(SPACE_SEPARATED_PATTERN, "$1T$2")

        if (!TIME_PART_PATTERN.test(normalized)) return null

        if (ZULU_PATTERN.test(normalized)) {
            normalized = `${normalized.slice(0, -1)}Z`
        } else {
            const offsetMatch = normalized.match(OFFSET_PATTERN)
            const timeIndex = normalized.indexOf("T")
            if (offsetMatch && offsetMatch.index !== undefined && offsetMatch.index > timeIndex) {
                const [, sign, hours, minutes] = offsetMatch
                normalized = `${normalized.slice(0, offsetMatch.index)}${sign}${hours}:${minutes ?? "00"}`
            } else {
                normalized = `${normalized}Z`
            }
        }
    }

    const ms = Date.parse(normalized)
    return Number.isFinite(ms) ? ms : null
}

