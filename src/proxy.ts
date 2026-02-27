import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { verifyAdminToken } from "@/lib/admin-auth"

const publicPaths = ["/", "/login", "/register", "/verify", "/set-password", "/auth/callback"]

export async function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname


    // 2. Supabase SSR Authentication & Cookie Management
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Skip auth when Supabase is not configured (local dev without credentials)
    if (!supabaseUrl || !supabaseKey || !supabaseUrl.startsWith("http")) {
        return NextResponse.next({ request })
    }

    let supabaseResponse = NextResponse.next({ request })

    // If it's an admin route (and not the custom admin login itself), verify JWT
    if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
        // Exclude Next.js static files or assets from strict middleware if accidentally caught
        if (!pathname.startsWith("/_next/") && !pathname.includes(".")) {
            const adminSessionCookie = request.cookies.get("admin_session")?.value
            if (!adminSessionCookie) {
                return NextResponse.redirect(new URL("/admin/login", request.url))
            }
            try {
                const payload = await verifyAdminToken(adminSessionCookie)
                if (payload.role !== "ADMIN") {
                    throw new Error("Role mismatch")
                }
            } catch (err) {
                return NextResponse.redirect(new URL("/admin/login", request.url))
            }
        }
    } else if (pathname.startsWith("/api/admin") && !pathname.startsWith("/api/admin/auth")) {
        const adminSessionCookie = request.cookies.get("admin_session")?.value
        if (!adminSessionCookie) {
            return NextResponse.json({ error: "Unauthorized admin access" }, { status: 401 })
        }
        try {
            const payload = await verifyAdminToken(adminSessionCookie)
            if (payload.role !== "ADMIN") {
                throw new Error("Role mismatch")
            }
        } catch (err) {
            return NextResponse.json({ error: "Unauthorized admin access" }, { status: 401 })
        }
    }

    const supabase = createServerClient(
        supabaseUrl,
        supabaseKey,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Only get the user if we are dealing with standard student path routing
    const isPublicPath = publicPaths.some((path) =>
        path === "/" ? pathname === "/" : pathname === path || pathname.startsWith(`${path}/`)
    )

    if (pathname.startsWith("/api/") || pathname.startsWith("/_next/") || pathname.includes(".")) {
        return supabaseResponse
    }

    if (isPublicPath) {
        return supabaseResponse
    }

    // Only force Supabase User auth redirect on standard (non-admin) secured routes e.g. /dashboard
    if (!pathname.startsWith("/admin")) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            const url = request.nextUrl.clone()
            url.pathname = "/login"
            url.searchParams.set("redirect", pathname)
            return NextResponse.redirect(url)
        }
    }

    return supabaseResponse
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
