import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

const publicPaths = ["/", "/login", "/register", "/verify", "/set-password", "/auth/callback"]
const adminPaths = ["/admin"]
const dashboardPaths = ["/dashboard"]

export async function middleware(request: NextRequest) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Skip auth when Supabase is not configured (local dev without credentials)
    if (!supabaseUrl || !supabaseKey || !supabaseUrl.startsWith("http")) {
        return NextResponse.next({ request })
    }

    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const pathname = request.nextUrl.pathname

    // 1. HTTP Basic Auth for Admin Routes
    if (pathname.startsWith("/admin")) {
        const authHeader = request.headers.get("authorization")

        if (authHeader) {
            const authValue = authHeader.split(" ")[1]
            const [username, password] = Buffer.from(authValue, "base64").toString().split(":")

            const adminUser = process.env.ADMIN_USERNAME
            const adminPass = process.env.ADMIN_PASSWORD

            if (username === adminUser && password === adminPass) {
                return NextResponse.next()
            }
        }

        return new NextResponse("Unauthorized", {
            status: 401,
            headers: {
                "WWW-Authenticate": 'Basic realm="Secure Area"',
            },
        })
    }

    // Improved path matching using startsWith for nested routes
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

    // Redirect unauthenticated users to login
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
