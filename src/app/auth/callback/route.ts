import { NextRequest, NextResponse } from "next/server"
import { createClient, createServiceClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")

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

        // Check if user already exists in `users` table
        const { data: userProfile } = await serviceClient
          .from("users")
          .select("id, is_active, email")
          .or(`auth_id.eq.${data.user.id},email.ilike.${userEmail}`)
          .maybeSingle()

        if (!userProfile) {
          // New user -> redirect cleanly to details form
          return NextResponse.redirect(`${baseUrl}/register?step=details`)
        }

        // Existing user check status
        if (userProfile.is_active === false || userProfile.is_active === null) {
          return NextResponse.redirect(`${baseUrl}/waiting-approval`)
        }

        return NextResponse.redirect(`${baseUrl}/dashboard`)
      } catch (err) {
        console.error("Profile check error during auth callback:", err)
        return NextResponse.redirect(`${baseUrl}/dashboard`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
