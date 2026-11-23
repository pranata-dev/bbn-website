import { describe, expect, it } from "vitest"
import { toDirectDownloadUrl } from "./download-url"

describe("toDirectDownloadUrl", () => {
    it("converts Google Drive /file/d/<ID>/view links to direct download URLs", () => {
        expect(
            toDirectDownloadUrl(
                "https://drive.google.com/file/d/169T3aXw8G5aBhV2vEt32HQkkXN6W76Ue/view?usp=drive_link"
            )
        ).toBe(
            "https://drive.google.com/uc?export=download&id=169T3aXw8G5aBhV2vEt32HQkkXN6W76Ue"
        )

        expect(
            toDirectDownloadUrl(
                "  https://drive.google.com/file/d/1xpYtzWPv9xt_eDYlN5j8b-M4rMSQ2WJl/view?usp=sharing  "
            )
        ).toBe(
            "https://drive.google.com/uc?export=download&id=1xpYtzWPv9xt_eDYlN5j8b-M4rMSQ2WJl"
        )
    })

    it("converts Google Drive /open?id=<ID> links to direct download URLs", () => {
        expect(
            toDirectDownloadUrl("https://drive.google.com/open?id=1RH2UcgEsCyy51UqTequR-6T2hHs0aaCB")
        ).toBe(
            "https://drive.google.com/uc?export=download&id=1RH2UcgEsCyy51UqTequR-6T2hHs0aaCB"
        )
    })

    it("normalizes Google Drive /uc?...id=<ID> links to direct download URLs", () => {
        expect(
            toDirectDownloadUrl(
                "https://drive.google.com/uc?export=view&id=1Wx8f1mdhblgd7l6GX4N0KpZaL9aSYR0G"
            )
        ).toBe(
            "https://drive.google.com/uc?export=download&id=1Wx8f1mdhblgd7l6GX4N0KpZaL9aSYR0G"
        )

        expect(
            toDirectDownloadUrl(
                "https://drive.google.com/uc?export=download&id=1pVXvev_9f7xx_3pGRJeM1xAJspDWPeuR"
            )
        ).toBe(
            "https://drive.google.com/uc?export=download&id=1pVXvev_9f7xx_3pGRJeM1xAJspDWPeuR"
        )
    })

    it("returns null for empty, whitespace, or placeholder URLs", () => {
        expect(toDirectDownloadUrl(null)).toBeNull()
        expect(toDirectDownloadUrl(undefined)).toBeNull()
        expect(toDirectDownloadUrl("")).toBeNull()
        expect(toDirectDownloadUrl("   ")).toBeNull()
        expect(toDirectDownloadUrl("https://bebasbikinnyaman.com")).toBeNull()
        expect(toDirectDownloadUrl("https://bebasbikinnyaman.com/")).toBeNull()
    })

    it("keeps non-Google Drive HTTPS URLs intact", () => {
        const supabaseUrl =
            "https://xyzcompany.supabase.co/storage/v1/object/public/materials/sas-fisika-x.pdf"
        expect(toDirectDownloadUrl(` ${supabaseUrl} `)).toBe(supabaseUrl)
    })
})

