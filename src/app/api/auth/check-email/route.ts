import { NextRequest, NextResponse } from "next/server"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import { checkRateLimit } from "@/lib/rate-limit"
import { checkEmailSchema } from "@/lib/validations/api"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
    try {
        const authClient = await createClient()
        const {
            data: { user },
        } = await authClient.auth.getUser()

        if (!user) {
            const ipRateLimit = await checkRateLimit(request, {
                namespace: "check-email",
                maxRequests: 3,
                windowSeconds: 60,
            })
            if (ipRateLimit) return ipRateLimit

            // Uniform non-enumerating response for unauthenticated callers.
            // Duplicate account feedback is surfaced via POST /api/register 409.
            return NextResponse.json({ exists: false })
        }

        const userRateLimit = await checkRateLimit(request, {
            namespace: "check-email-user",
            key: user.id,
            maxRequests: 15,
            windowSeconds: 60,
        })
        if (userRateLimit) return userRateLimit

        const body = await request.json().catch(() => null)
        const parsed = checkEmailSchema.safeParse(body)
        if (!parsed.success) {
            return NextResponse.json({ exists: false })
        }

        const sessionEmail = (user.email || "").trim().toLowerCase()
        if (!sessionEmail || parsed.data.email !== sessionEmail) {
            return NextResponse.json({ exists: false })
        }

        const supabase = createServiceClient()
        const { data: profile } = await supabase
            .from("users")
            .select("id")
            .eq("auth_id", user.id)
            .maybeSingle()

        if (!profile) {
            return NextResponse.json({ exists: false })
        }

        const [{ count: subCount }, { count: regCount }] = await Promise.all([
            supabase
                .from("subscriptions")
                .select("id", { count: "exact", head: true })
                .eq("user_id", profile.id),
            supabase
                .from("registrations")
                .select("id", { count: "exact", head: true })
                .eq("user_id", profile.id),
        ])

        return NextResponse.json({
            exists: (subCount ?? 0) > 0 || (regCount ?? 0) > 0,
        })
    } catch (error) {
        console.error("Check email error:", error)
        return NextResponse.json({ exists: false, error: "Internal error" }, { status: 500 })
    }
}
