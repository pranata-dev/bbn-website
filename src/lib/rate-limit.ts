import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Simple in-memory rate limiter for registration API
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_REQUESTS = 5 // max 5 requests per minute per IP

export function checkRateLimit(request: NextRequest): NextResponse | null {
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const now = Date.now()

    const entry = rateLimitMap.get(ip)

    if (!entry || now > entry.resetTime) {
        rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
        return null
    }

    if (entry.count >= MAX_REQUESTS) {
        return NextResponse.json(
            { error: "Terlalu banyak permintaan. Silakan coba lagi nanti." },
            { status: 429 }
        )
    }

    entry.count++
    return null
}

// Cleanup old entries periodically (every 5 minutes)
if (typeof globalThis !== "undefined") {
    setInterval(() => {
        const now = Date.now()
        for (const [key, value] of rateLimitMap.entries()) {
            if (now > value.resetTime) {
                rateLimitMap.delete(key)
            }
        }
    }, 5 * 60 * 1000)
}
