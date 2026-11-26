import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"

const DEFAULT_ERROR_MESSAGE = "Terlalu banyak permintaan. Silakan coba lagi nanti."
const MAX_IDENTIFIER_LENGTH = 64

export interface RateLimitRequestLike {
    headers: Pick<Headers, "get">
}

export interface RateLimitOptions {
    namespace: string
    maxRequests?: number
    windowSeconds?: number
    /** Explicit identity (for example verified user.id). Defaults to extracted client IP. */
    key?: string
    errorMessage?: string
}

export interface RateLimitRpcRow {
    allowed: boolean
    current_count: number
    retry_after_seconds: number
}

export interface RateLimitRpcClient {
    rpc: (
        fn: "check_rate_limit" | "peek_rate_limit",
        params: Record<string, unknown>
    ) => PromiseLike<{
        data: RateLimitRpcRow[] | RateLimitRpcRow | null
        error: { code?: string | null; message?: string | null } | null
    }>
}

function sanitizeIdentifier(raw: string): string {
    const cleaned = raw.trim().replace(/[^A-Za-z0-9.:_-]/g, "")
    return (cleaned || "unknown").slice(0, MAX_IDENTIFIER_LENGTH)
}

function firstHeaderValue(value: string | null): string | null {
    if (!value) return null
    const first = value.split(",")[0]?.trim()
    return first ? first : null
}

/**
 * Extracts client IP in proxy-trust order:
 * x-vercel-forwarded-for -> cf-connecting-ip -> x-real-ip -> first x-forwarded-for entry.
 */
export function extractClientIp(request: RateLimitRequestLike): string {
    const candidate =
        firstHeaderValue(request.headers.get("x-vercel-forwarded-for")) ||
        firstHeaderValue(request.headers.get("cf-connecting-ip")) ||
        firstHeaderValue(request.headers.get("x-real-ip")) ||
        firstHeaderValue(request.headers.get("x-forwarded-for"))

    return candidate ? sanitizeIdentifier(candidate) : "unknown"
}

export function buildRateLimitKey(namespace: string, identifier: string): string {
    return `${sanitizeIdentifier(namespace)}:${sanitizeIdentifier(identifier)}`
}

function firstRpcRow(data: RateLimitRpcRow[] | RateLimitRpcRow | null): RateLimitRpcRow | null {
    if (!data) return null
    return Array.isArray(data) ? data[0] ?? null : data
}

function buildTooManyRequestsResponse(retryAfterSeconds: number, message: string): NextResponse {
    const retryAfter = Math.max(1, Math.ceil(retryAfterSeconds || 1))
    return NextResponse.json(
        { error: message },
        {
            status: 429,
            headers: {
                "Retry-After": String(retryAfter),
            },
        }
    )
}

function getDefaultRpcClient(): RateLimitRpcClient {
    return createServiceClient() as unknown as RateLimitRpcClient
}

async function evaluateRateLimitRpc(
    fn: "check_rate_limit" | "peek_rate_limit",
    request: RateLimitRequestLike,
    options: RateLimitOptions,
    client?: RateLimitRpcClient
): Promise<NextResponse | null> {
    const maxRequests = options.maxRequests ?? 5
    const windowSeconds = options.windowSeconds ?? 60
    const identifier = options.key ? sanitizeIdentifier(options.key) : extractClientIp(request)
    const bucketKey = buildRateLimitKey(options.namespace, identifier)

    const rpcClient = client ?? getDefaultRpcClient()
    const params =
        fn === "check_rate_limit"
            ? {
                  p_key: bucketKey,
                  p_max_requests: maxRequests,
                  p_window_seconds: windowSeconds,
              }
            : {
                  p_key: bucketKey,
                  p_max_requests: maxRequests,
              }

    const { data, error } = await rpcClient.rpc(fn, params)

    if (error) {
        console.error(`Rate limit RPC (${fn}) failed:`, error)
        const isMissingRpc = error.code === "PGRST202" || error.code === "42883"
        if (isMissingRpc && process.env.NODE_ENV !== "production") {
            return null
        }
        return NextResponse.json(
            { error: "Layanan sementara tidak tersedia. Silakan coba lagi nanti." },
            { status: 503 }
        )
    }

    const row = firstRpcRow(data)
    if (!row || row.allowed) {
        return null
    }

    return buildTooManyRequestsResponse(
        row.retry_after_seconds,
        options.errorMessage ?? DEFAULT_ERROR_MESSAGE
    )
}

/**
 * Atomic serverless rate limiter backed by `public.check_rate_limit` in Postgres.
 * Increments the bucket and returns a 429 NextResponse with Retry-After when exceeded.
 */
export async function checkRateLimit(
    request: RateLimitRequestLike,
    options: RateLimitOptions,
    client?: RateLimitRpcClient
): Promise<NextResponse | null> {
    return evaluateRateLimitRpc("check_rate_limit", request, options, client)
}

/**
 * Read-only pre-check against a failure lockout bucket via `public.peek_rate_limit`.
 * Never increments the counter; returns 429 with Retry-After when already exhausted.
 */
export async function peekRateLimit(
    request: RateLimitRequestLike,
    options: Omit<RateLimitOptions, "windowSeconds">,
    client?: RateLimitRpcClient
): Promise<NextResponse | null> {
    return evaluateRateLimitRpc("peek_rate_limit", request, options, client)
}

/**
 * Increments a failure lockout bucket ONLY after a failed auth attempt.
 * Returns 429 with Retry-After when the failure threshold has been exceeded.
 */
export async function recordRateLimitFailure(
    request: RateLimitRequestLike,
    options: RateLimitOptions,
    client?: RateLimitRpcClient
): Promise<NextResponse | null> {
    return evaluateRateLimitRpc("check_rate_limit", request, options, client)
}
