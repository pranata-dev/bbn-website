import { NextRequest, NextResponse } from "next/server"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import { resolveSafeInternalRedirect } from "@/lib/register-security"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const safeNext = resolveSafeInternalRedirect(searchParams.get("next"))

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data?.user) {
      const forwardedHost = request.headers.get("x-forwarded-host")
      const baseUrl =
        process.env.NODE_ENV === "development" || !forwardedHost
          ? origin
          : `https://${forwardedHost}`

      try {
        const serviceClient = createServiceClient()
        const userEmail = (data.user.email || "").toLowerCase().trim()

        let { data: userProfile } = await serviceClient
          .from("users")
          .select("id, is_active, email")
          .eq("auth_id", data.user.id)
          .maybeSingle()

        if (!userProfile && userEmail) {
          const { data: emailMatch } = await serviceClient
            .from("users")
            .select("id, is_active, email, auth_id")
            .ilike("email", userEmail)
            .maybeSingle()
          if (emailMatch && emailMatch.auth_id === data.user.id) {
            userProfile = emailMatch
          }
        }

        if (!userProfile) {
          return NextResponse.redirect(`${baseUrl}/register?step=details`)
        }

        if (safeNext?.startsWith("/register")) {
          const [{ count: subCount }, { count: regCount }] = await Promise.all([
            serviceClient
              .from("subscriptions")
              .select("id", { count: "exact", head: true })
              .eq("user_id", userProfile.id),
            serviceClient
              .from("registrations")
              .select("id", { count: "exact", head: true })
              .eq("user_id", userProfile.id),
          ])

          if ((subCount ?? 0) === 0 && (regCount ?? 0) === 0) {
            return NextResponse.redirect(`${baseUrl}${safeNext}`)
          }
        }

        if (userProfile.is_active === false || userProfile.is_active === null) {
          return NextResponse.redirect(`${baseUrl}/waiting-approval`)
        }

        const destination =
          safeNext && !safeNext.startsWith("/register") ? safeNext : "/dashboard"
        return NextResponse.redirect(`${baseUrl}${destination}`)
      } catch (err) {
        console.error("Profile check error during auth callback:", err)
        return NextResponse.redirect(`${baseUrl}/dashboard`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
