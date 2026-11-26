import type { SupabaseClient } from "@supabase/supabase-js"

function extractBucketObjectPath(
    bucketName: string,
    rawUrlOrPath: string | null | undefined
): string | null {
    if (!rawUrlOrPath) return null
    const trimmed = rawUrlOrPath.trim()
    if (!trimmed) return null

    const marker = `/${bucketName}/`
    const idx = trimmed.indexOf(marker)
    if (idx !== -1) {
        const after = trimmed.slice(idx + marker.length)
        const withoutQuery = after.split("?")[0]
        const decoded = decodeURIComponent(withoutQuery).replace(/^\/+/, "")
        return decoded || null
    }

    const prefix = `${bucketName}/`
    if (trimmed.startsWith(prefix)) {
        const stripped = trimmed.slice(prefix.length).replace(/^\/+/, "")
        return stripped || null
    }

    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
        const cleaned = trimmed.replace(/^\/+/, "")
        return cleaned || null
    }

    return null
}

/**
 * Extracts the storage object key inside the `payment-proofs` bucket from
 * either a raw relative path (`registrations/...`, `dashboard-purchases/...`)
 * or a Supabase public/signed URL (`.../storage/v1/object/public/payment-proofs/...`).
 */
export function extractPaymentProofObjectPath(rawUrlOrPath: string | null | undefined): string | null {
    return extractBucketObjectPath("payment-proofs", rawUrlOrPath)
}

/**
 * Extracts the storage object key inside the private `material-attachments` bucket
 * from either a Supabase Storage URL or a `material-attachments/<path>` prefix.
 * Returns null for external URLs (such as Google Drive links).
 */
export function extractMaterialAttachmentObjectPath(
    rawUrlOrPath: string | null | undefined
): string | null {
    if (!rawUrlOrPath) return null
    const trimmed = rawUrlOrPath.trim()
    if (!trimmed) return null

    if (
        trimmed.includes("/material-attachments/") ||
        trimmed.startsWith("material-attachments/")
    ) {
        return extractBucketObjectPath("material-attachments", trimmed)
    }

    return null
}

/**
 * Resolves a stored `payment_proof_url` value to a short-lived signed URL
 * from the private `payment-proofs` bucket so administrators can view it.
 */
export async function resolvePaymentProofSignedUrl(
    serviceClient: SupabaseClient,
    rawUrlOrPath: string | null | undefined,
    expiresInSeconds = 3600
): Promise<string | null> {
    if (!rawUrlOrPath) return null
    const objectPath = extractPaymentProofObjectPath(rawUrlOrPath)
    if (!objectPath) return rawUrlOrPath

    try {
        const { data, error } = await serviceClient.storage
            .from("payment-proofs")
            .createSignedUrl(objectPath, expiresInSeconds)

        if (error || !data?.signedUrl) {
            return rawUrlOrPath
        }
        return data.signedUrl
    } catch {
        return rawUrlOrPath
    }
}

/**
 * Resolves a stored `material-attachments` URL or bucket path to a short-lived
 * signed URL (default 5 minutes) after server-side entitlement checks succeed.
 * External URLs (e.g. Google Drive) are returned untouched.
 */
export async function resolveMaterialAttachmentSignedUrl(
    serviceClient: SupabaseClient,
    rawUrlOrPath: string | null | undefined,
    expiresInSeconds = 300
): Promise<string | null> {
    if (!rawUrlOrPath) return null
    const objectPath = extractMaterialAttachmentObjectPath(rawUrlOrPath)
    if (!objectPath) return rawUrlOrPath

    try {
        const { data, error } = await serviceClient.storage
            .from("material-attachments")
            .createSignedUrl(objectPath, expiresInSeconds)

        if (error || !data?.signedUrl) {
            return null
        }
        return data.signedUrl
    } catch {
        return null
    }
}

