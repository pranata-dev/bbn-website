import { describe, it, expect } from "vitest"
import { parseUtcTimestamp } from "./timestamp"

describe("parseUtcTimestamp", () => {
    const expectedUtcMs = Date.UTC(2026, 2, 18, 12, 30, 45)

    it("parses ISO timestamps with uppercase or lowercase Z", () => {
        expect(parseUtcTimestamp("2026-03-18T12:30:45Z")).toBe(expectedUtcMs)
        expect(parseUtcTimestamp("2026-03-18T12:30:45z")).toBe(expectedUtcMs)
        expect(parseUtcTimestamp("2026-03-18T12:30:45.500Z")).toBe(expectedUtcMs + 500)
    })

    it("parses explicit timezone offsets without appending Z", () => {
        expect(parseUtcTimestamp("2026-03-18T12:30:45+00:00")).toBe(expectedUtcMs)
        expect(parseUtcTimestamp("2026-03-18T19:30:45+07:00")).toBe(expectedUtcMs)
        expect(parseUtcTimestamp("2026-03-18T07:30:45-05:00")).toBe(expectedUtcMs)
        expect(parseUtcTimestamp("2026-03-18T12:30:45.250+00:00")).toBe(expectedUtcMs + 250)
    })

    it("parses Postgres space-separated timestamps with short +00 or +HHMM offsets", () => {
        expect(parseUtcTimestamp("2026-03-18 12:30:45+00")).toBe(expectedUtcMs)
        expect(parseUtcTimestamp("2026-03-18 12:30:45.123456+00")).toBe(expectedUtcMs + 123)
        expect(parseUtcTimestamp("2026-03-18 19:30:45+0700")).toBe(expectedUtcMs)
        expect(parseUtcTimestamp("2026-03-18 12:30:45")).toBe(expectedUtcMs)
    })

    it("treats bare ISO strings and date-only strings as UTC", () => {
        expect(parseUtcTimestamp("2026-03-18T12:30:45")).toBe(expectedUtcMs)
        expect(parseUtcTimestamp("2026-03-18")).toBe(Date.UTC(2026, 2, 18, 0, 0, 0))
    })

    it("returns null for empty, nullish, or invalid timestamps", () => {
        expect(parseUtcTimestamp(null)).toBeNull()
        expect(parseUtcTimestamp(undefined)).toBeNull()
        expect(parseUtcTimestamp("")).toBeNull()
        expect(parseUtcTimestamp("   ")).toBeNull()
        expect(parseUtcTimestamp("not-a-date")).toBeNull()
        expect(parseUtcTimestamp("2026-13-45T99:99:99Z")).toBeNull()
    })
})

