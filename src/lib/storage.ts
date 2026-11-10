import type { SupabaseClient } from "@supabase/supabase-js"

/**
 * Extracts the storage object key inside the `payment-proofs` bucket from
 * either a raw relative path (`registrations/...`, `dashboard-purchases/...`)
 * or a Supabase public/signed URL (`.../storage/v1/object/public/payment-proofs/...`).
 */
export function extractPaymentProofObjectPath(rawUrlOrPath: string | null | undefined): string | null {
    if (!rawUrlOrPath) return null
    const trimmed = rawUrlOrPath.trim()
    if (!trimmed) return null

    const marker = "/payment-proofs/"
    const idx = trimmed.indexOf(marker)
    if (idx !== -1) {
        const after = trimmed.slice(idx + marker.length)
        const withoutQuery = after.split("?")[0]
        return decodeURIComponent(withoutQuery)
    }

    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
        return trimmed.replace(/^\/+/, "")
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

