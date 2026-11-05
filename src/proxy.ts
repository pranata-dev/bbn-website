import { createServerClient } from "@supabase/ssr"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { NextResponse, type NextRequest } from "next/server"

const publicPaths = ["/", "/login", "/register", "/verify", "/set-password", "/auth/callback"]

function isAdminPage(pathname: string) {
    return pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")
}

function isAdminApi(pathname: string) {
    // /api/admin/auth/me performs its own role check and is used by the admin login page
    return pathname.startsWith("/api/admin") && !pathname.startsWith("/api/admin/auth/me")
}

function misconfigured(pathname: string) {
    const body = { error: "Service temporarily unavailable: server is misconfigured" }
    if (pathname.startsWith("/api/")) {
        return NextResponse.json(body, { status: 503 })
    }
    return new NextResponse(body.error, { status: 503 })
}

export async function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    const isPublicPath = publicPaths.some((path) =>
        path === "/" ? pathname === "/" : pathname === path || pathname.startsWith(`${path}/`)
    )

    // Fail CLOSED: never serve protected routes when auth cannot be verified.
    if (!supabaseUrl || !supabaseKey || !supabaseUrl.startsWith("http")) {
        if (isPublicPath) return NextResponse.next({ request })
        return misconfigured(pathname)
    }

    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
            getAll() {
                return request.cookies.getAll()
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                supabaseResponse = NextResponse.next({ request })
                cookiesToSet.forEach(({ name, value, options }) =>
                    supabaseResponse.cookies.set(name, value, options)
                )
            },
        },
    })

    // ── Admin routes: Supabase session + users.role = 'ADMIN' ────────────────
    if (isAdminPage(pathname) || isAdminApi(pathname)) {
        if (!serviceRoleKey) return misconfigured(pathname)

        const {
            data: { user },
        } = await supabase.auth.getUser()

        let isAdmin = false
        if (user) {
            const service = createSupabaseClient(supabaseUrl, serviceRoleKey, {
                auth: { persistSession: false, autoRefreshToken: false },
            })
            const { data: profile } = await service
                .from("users")
                .select("role")
                .eq("auth_id", user.id)
                .maybeSingle()
            isAdmin = profile?.role === "ADMIN"
        }

        if (!isAdmin) {
            if (pathname.startsWith("/api/")) {
                return NextResponse.json(
                    { error: "Unauthorized admin access" },
                    { status: user ? 403 : 401 }
                )
            }
            return NextResponse.redirect(new URL("/admin/login", request.url))
        }

        return supabaseResponse
    }

    // Other API routes perform their own auth checks; just keep the session fresh.
    if (pathname.startsWith("/api/") || pathname.startsWith("/_next/") || pathname.includes(".")) {
        return supabaseResponse
    }

    if (pathname.startsWith("/admin/login")) {
        return supabaseResponse
    }

    // Special handling for /waiting-approval
    if (pathname === "/waiting-approval") {
        const {
            data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
            const url = request.nextUrl.clone()
            url.pathname = "/login"
            return NextResponse.redirect(url)
        }

        const { data: profile } = await supabase
            .from("users")
            .select("is_active")
            .eq("auth_id", user.id)
            .maybeSingle()

        if (profile && profile.is_active === true) {
            const url = request.nextUrl.clone()
            url.pathname = "/dashboard"
            return NextResponse.redirect(url)
        }

        return supabaseResponse
    }

    if (isPublicPath) {
        return supabaseResponse
    }

    // ── Student-protected routes (e.g. /dashboard) ───────────────────────────
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
        const url = request.nextUrl.clone()
        url.pathname = "/login"
        url.searchParams.set("redirect", pathname)
        return NextResponse.redirect(url)
    }

    // Check if user is active; if inactive or no profile yet, redirect to /waiting-approval
    const { data: profile } = await supabase
        .from("users")
        .select("is_active")
        .eq("auth_id", user.id)
        .maybeSingle()

    if (!profile || profile.is_active !== true) {
        const url = request.nextUrl.clone()
        url.pathname = "/waiting-approval"
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4)$).*)"],
}
