import { describe, it, expect } from "vitest"
import { slugify, extractToc } from "./TableOfContents"

describe("TableOfContents utilities", () => {
    it("should correctly slugify plain and formatted headings", () => {
        expect(slugify("1. Konsep Dasar Muatan Listrik")).toBe("1-konsep-dasar-muatan-listrik")
        expect(slugify("Formulasi Gaya Coulomb & Medan")).toBe("formulasi-gaya-coulomb-medan")
        expect(slugify("Aplikasi $E = mc^2$ dalam Fisika")).toBe("aplikasi-e-mc2-dalam-fisika")
        expect(slugify("Heading with `code` block")).toBe("heading-with-code-block")
    })

    it("should extract h2 and h3 headings from markdown into hierarchical toc items", () => {
        const markdown = `
# Title (ignored)
> [!NOTE]
> Intro text

## 1. Konsep Dasar
Content paragraph.

### Prinsip Superposisi
More content.

## 2. Formulasi Coulomb
Final content.
`
        const toc = extractToc(markdown)
        expect(toc).toHaveLength(3)

        expect(toc[0]).toEqual({
            id: "1-konsep-dasar",
            text: "1. Konsep Dasar",
            level: 2,
        })

        expect(toc[1]).toEqual({
            id: "prinsip-superposisi",
            text: "Prinsip Superposisi",
            level: 3,
        })

        expect(toc[2]).toEqual({
            id: "2-formulasi-coulomb",
            text: "2. Formulasi Coulomb",
            level: 2,
        })
    })

    it("should handle duplicate headings by appending index", () => {
        const markdown = `
## Analisis Soal
## Analisis Soal
`
        const toc = extractToc(markdown)
        expect(toc).toHaveLength(2)
        expect(toc[0].id).toBe("analisis-soal")
        expect(toc[1].id).toBe("analisis-soal-1")
    })
})

