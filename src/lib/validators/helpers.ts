/**
 * Sanitize a phone number string to a consistent format
 */
export function sanitizeWhatsAppNumber(phone: string): string {
    // Remove all non-digit chars except leading +
    const cleaned = phone.replace(/[^\d+]/g, "")

    // Normalize to +62 format
    if (cleaned.startsWith("08")) {
        return "+62" + cleaned.slice(1)
    }
    if (cleaned.startsWith("62")) {
        return "+" + cleaned
    }
    return cleaned
}

/**
 * Validate file for payment proof upload
 */
export function validatePaymentFile(file: File): string | null {
    const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    const MAX_SIZE = 5 * 1024 * 1024

    if (!ACCEPTED_TYPES.includes(file.type)) {
        return "Format file tidak didukung. Gunakan JPG, PNG, atau WebP."
    }

    if (file.size > MAX_SIZE) {
        return "Ukuran file maksimal 5MB."
    }

    return null
}

/**
 * Format a date string to Indonesian locale
 */
export function formatDateID(dateStr: string): string {
    try {
        const date = new Date(dateStr)
        return date.toLocaleDateString("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    } catch {
        return dateStr
    }
}
