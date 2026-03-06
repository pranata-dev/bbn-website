import imageCompression from "browser-image-compression"

/**
 * Compression options strictly optimized for Supabase 1GB Free Tier:
 * - Convert to WebP
 * - Max resolution: 1024x1024
 * - Max file size: 100KB
 */
const COMPRESSION_OPTIONS: Parameters<typeof imageCompression>[1] = {
    maxSizeMB: 0.1, // 100KB
    maxWidthOrHeight: 1024,
    fileType: "image/webp",
    useWebWorker: true,
}

export interface CompressionResult {
    file: File
    originalSize: number
    compressedSize: number
}

/**
 * Compresses an image file for question diagrams/graphs.
 * Converts to WebP, constrains to 1024x1024, and caps at 100KB.
 */
export async function compressQuestionImage(
    file: File
): Promise<CompressionResult> {
    const originalSize = file.size
    const compressed = await imageCompression(file, COMPRESSION_OPTIONS)

    // Ensure the output filename has .webp extension
    const webpFile = new File(
        [compressed],
        file.name.replace(/\.[^.]+$/, ".webp"),
        { type: "image/webp" }
    )

    return {
        file: webpFile,
        originalSize,
        compressedSize: webpFile.size,
    }
}

/**
 * Formats bytes into a human-readable string (e.g. "84.2 KB")
 */
export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
