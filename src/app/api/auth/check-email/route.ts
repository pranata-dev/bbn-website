import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { checkRateLimit } from "@/lib/rate-limit"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const body = await request.json()
    const email = ((body.email as string) || "").trim().toLowerCase()

    if (!email || !email.includes("@")) {
      return NextResponse.json({ exists: false })
    }

    const supabase = createServiceClient()
    const { data: user } = await supabase
      .from("users")
      .select("id")
      .ilike("email", email)
      .maybeSingle()

    return NextResponse.json({
      exists: !!user,
    })
  } catch (error) {
    console.error("Check email error:", error)
    return NextResponse.json({ exists: false, error: "Internal error" }, { status: 500 })
  }
}
