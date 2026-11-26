export const MAX_IMAGE_UPLOAD_BYTES = 5 * 1024 * 1024

export type VerifiedImageExtension = "png" | "jpg" | "webp"
export type VerifiedImageMime = "image/png" | "image/jpeg" | "image/webp"

export interface VerifiedImageSignature {
    ext: VerifiedImageExtension
    mime: VerifiedImageMime
}

export type ImageValidationResult =
    | {
          ok: true
          ext: VerifiedImageExtension
          mime: VerifiedImageMime
          size: number
          bytes: Uint8Array
      }
    | {
          ok: false
          status: 400
          error: string
      }

const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] as const
const JPEG_MAGIC = [0xff, 0xd8, 0xff] as const
const RIFF_MAGIC = [0x52, 0x49, 0x46, 0x46] as const
const WEBP_MAGIC = [0x57, 0x45, 0x42, 0x50] as const

function matchesBytesAt(bytes: Uint8Array, offset: number, expected: readonly number[]): boolean {
    if (bytes.length < offset + expected.length) return false
    for (let i = 0; i < expected.length; i++) {
        if (bytes[offset + i] !== expected[i]) return false
    }
    return true
}

/**
 * Inspects raw binary header bytes to identify PNG, JPEG, or WebP images.
 * Ignores file names and client-supplied MIME types.
 */
export function detectImageSignature(bytes: Uint8Array): VerifiedImageSignature | null {
    if (matchesBytesAt(bytes, 0, PNG_MAGIC)) {
        return { ext: "png", mime: "image/png" }
    }

    if (matchesBytesAt(bytes, 0, JPEG_MAGIC)) {
        return { ext: "jpg", mime: "image/jpeg" }
    }

    if (matchesBytesAt(bytes, 0, RIFF_MAGIC) && matchesBytesAt(bytes, 8, WEBP_MAGIC)) {
        return { ext: "webp", mime: "image/webp" }
    }

    return null
}

async function readBlobBytes(blob: Blob): Promise<Uint8Array> {
    if (typeof blob.arrayBuffer === "function") {
        return new Uint8Array(await blob.arrayBuffer())
    }
    return new Uint8Array(await new Response(blob).arrayBuffer())
}

/**
 * Validates an uploaded image file by enforcing size bounds before reading
 * binary magic bytes (PNG, JPEG, WebP). Derives extension and Content-Type
 * strictly from verified binary signature.
 */
export async function validateImageUpload(
    file: Blob | null | undefined,
    maxBytes: number = MAX_IMAGE_UPLOAD_BYTES
): Promise<ImageValidationResult> {
    if (!file || !(file instanceof Blob)) {
        return {
            ok: false,
            status: 400,
            error: "Mohon unggah bukti transfer pembayaran.",
        }
    }

    if (file.size <= 0) {
        return {
            ok: false,
            status: 400,
            error: "File bukti pembayaran kosong.",
        }
    }

    if (file.size > maxBytes) {
        const maxMb = Math.round((maxBytes / (1024 * 1024)) * 10) / 10
        return {
            ok: false,
            status: 400,
            error: `Ukuran file bukti pembayaran maksimal ${maxMb}MB.`,
        }
    }

    const headerBytes = await readBlobBytes(file.slice(0, 12))
    const signature = detectImageSignature(headerBytes)

    if (!signature) {
        return {
            ok: false,
            status: 400,
            error: "Format file tidak didukung. Gunakan file gambar PNG, JPG, atau WebP yang valid.",
        }
    }

    const fullBytes = await readBlobBytes(file)

    return {
        ok: true,
        ext: signature.ext,
        mime: signature.mime,
        size: fullBytes.byteLength,
        bytes: fullBytes,
    }
}

