import { describe, it, expect } from "vitest"
import {
    detectImageSignature,
    validateImageUpload,
    MAX_IMAGE_UPLOAD_BYTES,
} from "./file-validation"

function makeBytes(values: number[]): Uint8Array {
    return new Uint8Array(values)
}

function makeFile(bytes: Uint8Array, name: string, type: string): File {
    const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer
    return new File([buffer], name, { type })
}

const VALID_PNG = makeBytes([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d])
const VALID_JPEG_JFIF = makeBytes([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46])
const VALID_JPEG_EXIF = makeBytes([0xff, 0xd8, 0xff, 0xe1, 0x00, 0x10, 0x45, 0x78])
const VALID_WEBP = makeBytes([
    0x52, 0x49, 0x46, 0x46, // RIFF
    0x24, 0x00, 0x00, 0x00, // chunk size
    0x57, 0x45, 0x42, 0x50, // WEBP
    0x56, 0x50, 0x38, 0x20,
])
const FAKE_RIFF_WAV = makeBytes([
    0x52, 0x49, 0x46, 0x46, // RIFF
    0x24, 0x00, 0x00, 0x00,
    0x57, 0x41, 0x56, 0x45, // WAVE
])

describe("file-validation: binary magic-byte inspection", () => {
    it("detects valid PNG, JPEG (JFIF/EXIF), and WebP signatures", () => {
        expect(detectImageSignature(VALID_PNG)).toEqual({ ext: "png", mime: "image/png" })
        expect(detectImageSignature(VALID_JPEG_JFIF)).toEqual({ ext: "jpg", mime: "image/jpeg" })
        expect(detectImageSignature(VALID_JPEG_EXIF)).toEqual({ ext: "jpg", mime: "image/jpeg" })
        expect(detectImageSignature(VALID_WEBP)).toEqual({ ext: "webp", mime: "image/webp" })
    })

    it("rejects non-WebP RIFF containers, HTML/SVG, PDF, and truncated buffers", () => {
        expect(detectImageSignature(FAKE_RIFF_WAV)).toBeNull()
        expect(detectImageSignature(new TextEncoder().encode("<svg onload=alert(1)>"))).toBeNull()
        expect(detectImageSignature(new TextEncoder().encode("%PDF-1.7"))).toBeNull()
        expect(detectImageSignature(makeBytes([0x89, 0x50]))).toBeNull()
    })

    it("derives stored extension from magic bytes rather than file.name or file.type", async () => {
        const pngDisguisedAsPhp = makeFile(VALID_PNG, "shell.php.jpg", "application/octet-stream")
        const result = await validateImageUpload(pngDisguisedAsPhp)

        expect(result.ok).toBe(true)
        if (result.ok) {
            expect(result.ext).toBe("png")
            expect(result.mime).toBe("image/png")
            expect(result.size).toBe(VALID_PNG.byteLength)
        }
    })

    it("rejects spoofed HTML/SVG payload claiming image/png and .png extension", async () => {
        const spoofed = makeFile(
            new TextEncoder().encode("<html><script>alert(1)</script></html>"),
            "proof.png",
            "image/png"
        )
        const result = await validateImageUpload(spoofed)

        expect(result.ok).toBe(false)
        if (!result.ok) {
            expect(result.status).toBe(400)
        }
    })

    it("rejects null, empty, and oversized files before accepting", async () => {
        const missingRes = await validateImageUpload(null)
        expect(missingRes.ok).toBe(false)

        const emptyFile = makeFile(new Uint8Array(0), "empty.png", "image/png")
        const emptyRes = await validateImageUpload(emptyFile)
        expect(emptyRes.ok).toBe(false)

        const oversizeBytes = new Uint8Array(1024)
        oversizeBytes.set(VALID_PNG, 0)
        const oversizeFile = makeFile(oversizeBytes, "big.png", "image/png")
        const oversizeRes = await validateImageUpload(oversizeFile, 512)
        expect(oversizeRes.ok).toBe(false)
        expect(MAX_IMAGE_UPLOAD_BYTES).toBe(5 * 1024 * 1024)
    })
})

