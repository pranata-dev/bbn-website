import { describe, it, expect } from "vitest"
import { escapeHtml, sanitizeHttpsUrl } from "./html-escape"

describe("html-escape", () => {
    describe("escapeHtml", () => {
        it("escapes HTML special characters to prevent script and attribute injection", () => {
            expect(escapeHtml(`<script>alert("xss")</script>`)).toBe(
                "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;"
            )
            expect(escapeHtml(`A & B's "test"`)).toBe("A &amp; B&#39;s &quot;test&quot;")
        })

        it("handles null, undefined, and numbers safely", () => {
            expect(escapeHtml(null)).toBe("")
            expect(escapeHtml(undefined)).toBe("")
            expect(escapeHtml(42)).toBe("42")
        })
    })

    describe("sanitizeHttpsUrl", () => {
        it("allows valid https URLs", () => {
            expect(sanitizeHttpsUrl("https://zoom.us/j/123456?pwd=abc")).toBe(
                "https://zoom.us/j/123456?pwd=abc"
            )
        })

        it("rejects javascript:, http:, data:, credentialed, and malformed URLs", () => {
            expect(sanitizeHttpsUrl("javascript:alert(1)")).toBeNull()
            expect(sanitizeHttpsUrl("http://zoom.us/j/123")).toBeNull()
            expect(sanitizeHttpsUrl("data:text/html,<script>alert(1)</script>")).toBeNull()
            expect(sanitizeHttpsUrl("https://user:pass@zoom.us/j/123")).toBeNull()
            expect(sanitizeHttpsUrl("not a url")).toBeNull()
            expect(sanitizeHttpsUrl("")).toBeNull()
            expect(sanitizeHttpsUrl(null)).toBeNull()
        })
    })
})

