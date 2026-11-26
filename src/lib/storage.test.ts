import { describe, it, expect, vi } from "vitest"
import type { SupabaseClient } from "@supabase/supabase-js"
import {
    extractPaymentProofObjectPath,
    extractMaterialAttachmentObjectPath,
    resolveMaterialAttachmentSignedUrl,
} from "./storage"

describe("storage path extraction and signed URL resolution", () => {
    it("extracts payment-proofs paths from relative keys and Supabase URLs", () => {
        expect(extractPaymentProofObjectPath("user-123/1700000000-abc.png")).toBe(
            "user-123/1700000000-abc.png"
        )
        expect(
            extractPaymentProofObjectPath(
                "https://proj.supabase.co/storage/v1/object/public/payment-proofs/registrations/123-test.jpg?t=1"
            )
        ).toBe("registrations/123-test.jpg")
        expect(extractPaymentProofObjectPath("payment-proofs/user-1/proof.webp")).toBe(
            "user-1/proof.webp"
        )
    })

    it("extracts material-attachments paths while returning null for external Google Drive links", () => {
        expect(
            extractMaterialAttachmentObjectPath(
                "https://proj.supabase.co/storage/v1/object/authenticated/material-attachments/fisdas2/bab-1.pdf"
            )
        ).toBe("fisdas2/bab-1.pdf")
        expect(extractMaterialAttachmentObjectPath("material-attachments/fismat/bab-2.pdf")).toBe(
            "fismat/bab-2.pdf"
        )
        expect(
            extractMaterialAttachmentObjectPath(
                "https://drive.google.com/uc?export=download&id=15FjanBliqSbGNLflR0ulE3Se4dE-Whmm"
            )
        ).toBeNull()
    })

    it("returns short-lived signed URL for material-attachments and preserves external URLs untouched", async () => {
        const createSignedUrl = vi.fn().mockResolvedValue({
            data: { signedUrl: "https://proj.supabase.co/storage/v1/object/sign/material-attachments/bab-1.pdf?token=abc" },
            error: null,
        })
        const mockClient = {
            storage: {
                from: vi.fn().mockReturnValue({ createSignedUrl }),
            },
        } as unknown as SupabaseClient

        const signed = await resolveMaterialAttachmentSignedUrl(
            mockClient,
            "material-attachments/bab-1.pdf",
            300
        )
        expect(signed).toContain("/sign/material-attachments/bab-1.pdf")
        expect(createSignedUrl).toHaveBeenCalledWith("bab-1.pdf", 300)

        const driveUrl = "https://drive.google.com/file/d/abc123/view"
        const untouched = await resolveMaterialAttachmentSignedUrl(mockClient, driveUrl, 300)
        expect(untouched).toBe(driveUrl)
    })

    it("fails closed (returns null) when signing a material-attachments object errors", async () => {
        const createSignedUrl = vi.fn().mockResolvedValue({
            data: null,
            error: { message: "Object not found" },
        })
        const mockClient = {
            storage: {
                from: vi.fn().mockReturnValue({ createSignedUrl }),
            },
        } as unknown as SupabaseClient

        const res = await resolveMaterialAttachmentSignedUrl(
            mockClient,
            "material-attachments/missing.pdf"
        )
        expect(res).toBeNull()
    })
})

