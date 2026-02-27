import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

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

    const supabase = createServerClient(
        supabaseUrl,
        supabaseKey,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
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

    // IMPORTANT: Refresh session if expired
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // 3. Path Routing Logic
    // Enhanced matching for nested public routes
    const isPublicPath = publicPaths.some((path) =>
        path === "/" ? pathname === "/" : pathname === path || pathname.startsWith(`${path}/`)
    )

    // Allow API and static paths
    if (pathname.startsWith("/api/") || pathname.startsWith("/_next/") || pathname.includes(".")) {
        return supabaseResponse
    }

    // Allow public paths
    if (isPublicPath) {
        return supabaseResponse
    }

    // 4. Redirect unauthenticated users to login for protected routes (e.g., /dashboard)
    if (!user) {
        const url = request.nextUrl.clone()
        url.pathname = "/login"
        url.searchParams.set("redirect", pathname)
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
