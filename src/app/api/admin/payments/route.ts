import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const supabase = createServiceClient()
    const { data: payments, error } = await supabase
      .from("registrations")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Admin payments fetch error:", error)
      return NextResponse.json(
        { error: "Failed to fetch registrations", payments: [] },
        { status: 500 }
      )
    }

    return NextResponse.json({ payments: payments || [] })
  } catch (error: any) {
    console.error("Admin payments internal error:", error)
    return NextResponse.json(
      { error: error?.message || "Internal error", payments: [] },
      { status: 500 }
    )
  }
}
