import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

const publicPaths = ["/", "/login", "/register", "/verify", "/set-password", "/auth/callback"]
const adminPaths = ["/admin"]
const dashboardPaths = ["/dashboard"]

export async function middleware(request: NextRequest) {
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

    // Allow public paths
    if (publicPaths.some((path) => pathname === path)) {
        return supabaseResponse
    }

    // Allow API and static paths
    if (pathname.startsWith("/api/") || pathname.startsWith("/_next/") || pathname.includes(".")) {
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
