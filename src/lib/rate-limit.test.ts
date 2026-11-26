import { describe, it, expect } from "vitest"
import {
    buildRateLimitKey,
    checkRateLimit,
    extractClientIp,
    peekRateLimit,
    recordRateLimitFailure,
    type RateLimitRpcClient,
} from "./rate-limit"

function makeRequest(headers: Record<string, string> = {}) {
    return { headers: new Headers(headers) }
}

function createInMemoryRateLimitRpc(): {
    client: RateLimitRpcClient
    buckets: Map<string, { count: number; retryAfter: number }>
    calls: Array<{ fn: string; params: Record<string, unknown> }>
} {
    const buckets = new Map<string, { count: number; retryAfter: number }>()
    const calls: Array<{ fn: string; params: Record<string, unknown> }> = []

    const client: RateLimitRpcClient = {
        async rpc(fn, params) {
            calls.push({ fn, params })
            const key = String(params.p_key)
            const max = Number(params.p_max_requests)
            const windowSeconds = Number(params.p_window_seconds ?? 60)

            if (fn === "peek_rate_limit") {
                const existing = buckets.get(key)
                if (!existing) {
                    return { data: [{ allowed: true, current_count: 0, retry_after_seconds: 0 }], error: null }
                }
                return {
                    data: [
                        {
                            allowed: existing.count < max,
                            current_count: existing.count,
                            retry_after_seconds: existing.retryAfter,
                        },
                    ],
                    error: null,
                }
            }

            const existing = buckets.get(key)
            const nextCount = (existing?.count ?? 0) + 1
            buckets.set(key, { count: nextCount, retryAfter: windowSeconds })
            return {
                data: [
                    {
                        allowed: nextCount <= max,
                        current_count: nextCount,
                        retry_after_seconds: windowSeconds,
                    },
                ],
                error: null,
            }
        },
    }

    return { client, buckets, calls }
}

describe("rate-limit", () => {
    describe("extractClientIp", () => {
        it("prioritizes x-vercel-forwarded-for, then cf-connecting-ip, x-real-ip, and first x-forwarded-for entry", () => {
            expect(
                extractClientIp(
                    makeRequest({
                        "x-vercel-forwarded-for": "198.51.100.10, 10.0.0.1",
                        "cf-connecting-ip": "203.0.113.5",
                        "x-real-ip": "203.0.113.6",
                        "x-forwarded-for": "203.0.113.9, 10.0.0.2",
                    })
                )
            ).toBe("198.51.100.10")

            expect(
                extractClientIp(
                    makeRequest({
                        "cf-connecting-ip": "203.0.113.5",
                        "x-forwarded-for": "203.0.113.9, 10.0.0.2",
                    })
                )
            ).toBe("203.0.113.5")

            expect(
                extractClientIp(
                    makeRequest({
                        "x-real-ip": "203.0.113.6",
                        "x-forwarded-for": "203.0.113.9, 10.0.0.2",
                    })
                )
            ).toBe("203.0.113.6")

            expect(
                extractClientIp(
                    makeRequest({
                        "x-forwarded-for": "203.0.113.9, 10.0.0.1",
                    })
                )
            ).toBe("203.0.113.9")

            expect(extractClientIp(makeRequest())).toBe("unknown")
        })

        it("sanitizes and bounds excessively long header values", () => {
            const huge = "1".repeat(200)
            expect(extractClientIp(makeRequest({ "x-forwarded-for": huge })).length).toBe(64)
            expect(extractClientIp(makeRequest({ "x-forwarded-for": "203.0.113.9; DROP TABLE" }))).toBe(
                "203.0.113.9DROPTABLE"
            )
        })
    })

    describe("namespacing and user-key vs IP-key isolation", () => {
        it("keys authenticated routes by verified user.id so shared NAT IPs do not throttle other students", async () => {
            const { client, calls } = createInMemoryRateLimitRpc()
            const sharedNatReq = makeRequest({ "x-forwarded-for": "203.0.113.50" })

            expect(
                await checkRateLimit(
                    sharedNatReq,
                    { namespace: "feedback", key: "user-a", maxRequests: 1, windowSeconds: 60 },
                    client
                )
            ).toBeNull()

            // Same IP, different authenticated student still passes
            expect(
                await checkRateLimit(
                    sharedNatReq,
                    { namespace: "feedback", key: "user-b", maxRequests: 1, windowSeconds: 60 },
                    client
                )
            ).toBeNull()

            // Same user exceeds their own bucket -> 429 + Retry-After
            const throttled = await checkRateLimit(
                sharedNatReq,
                { namespace: "feedback", key: "user-a", maxRequests: 1, windowSeconds: 60 },
                client
            )
            expect(throttled?.status).toBe(429)
            expect(throttled?.headers.get("Retry-After")).toBe("60")
            expect(calls[0]?.params.p_key).toBe(buildRateLimitKey("feedback", "user-a"))
        })

        it("supports classroom NAT burst + failure-only lockout without incrementing on valid logins", async () => {
            const { client, buckets } = createInMemoryRateLimitRpc()
            const classroomReq = makeRequest({ "x-forwarded-for": "198.51.100.77" })

            // 40 valid classroom logins share one IP under the 60/min burst guard
            for (let i = 0; i < 40; i++) {
                expect(
                    await checkRateLimit(
                        classroomReq,
                        { namespace: "excellent-login", maxRequests: 60, windowSeconds: 60 },
                        client
                    )
                ).toBeNull()
                expect(
                    await peekRateLimit(
                        classroomReq,
                        { namespace: "excellent-login-fail", maxRequests: 10 },
                        client
                    )
                ).toBeNull()
            }

            // Failure bucket must remain untouched after valid logins
            expect(buckets.get("excellent-login-fail:198.51.100.77")).toBeUndefined()

            // 10 failed passwords exhaust the failure bucket
            for (let i = 0; i < 10; i++) {
                const res = await recordRateLimitFailure(
                    classroomReq,
                    { namespace: "excellent-login-fail", maxRequests: 10, windowSeconds: 300 },
                    client
                )
                expect(res).toBeNull()
            }

            // Pre-check now blocks immediately with 429 and Retry-After
            const lockedOut = await peekRateLimit(
                classroomReq,
                { namespace: "excellent-login-fail", maxRequests: 10 },
                client
            )
            expect(lockedOut?.status).toBe(429)
            expect(lockedOut?.headers.get("Retry-After")).toBe("300")
        })
    })
})

