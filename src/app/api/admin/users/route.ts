import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { createAdminClient } from "@/lib/supabase/server"
import { checkRateLimit } from "@/lib/rate-limit"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
    const guard = await requireAdmin()
    if (!guard.ok) return guard.response

  // Check rate limit
  const rateLimitResponse = checkRateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const adminSupabase = await createAdminClient()

    // 1. Fetch all users with subject access
    const { data: users, error: usersError } = await adminSupabase
      .from("users")
      .select("*, subject_access:user_subject_access(*)")
      .order("created_at", { ascending: false })

    if (usersError) {
      console.error("Users fetch error:", usersError)
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
    }

    // 2. Fetch registrations to join payment proofs and registration status
    const { data: registrations } = await adminSupabase
      .from("registrations")
      .select("id, email, name, payment_proof_url, status, package_type, type, created_at")
      .order("created_at", { ascending: false })

    // 3. Map registrations to users by matching email
    const enrichedUsers = (users || []).map((u) => {
      const userRegs = (registrations || []).filter(
        (r) =>
          (r.email && u.email && r.email.toLowerCase().trim() === u.email.toLowerCase().trim()) ||
          (r.name && u.name && r.name.toLowerCase().trim() === u.name.toLowerCase().trim())
      )

      return {
        ...u,
        registrations: userRegs,
        payment_proof_url: userRegs[0]?.payment_proof_url || null,
        registration_status: userRegs[0]?.status || null,
      }
    })

    return NextResponse.json({ users: enrichedUsers })
  } catch (error: any) {
    console.error("Internal error in /api/admin/users:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

// PATCH - Update user subject access or status
export async function PATCH(request: NextRequest) {
    const guard = await requireAdmin()
    if (!guard.ok) return guard.response

  const rateLimitResponse = checkRateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const body = await request.json()
    const { userId, role, subject, isActive } = body

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const adminSupabase = await createAdminClient()

    // 1. Update user active status if provided
    if (typeof isActive === "boolean") {
      const { error: userError } = await adminSupabase
        .from("users")
        .update({
          is_active: isActive,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      if (userError) throw userError

      // Also sync registrations status if user was updated
      const { data: targetUser } = await adminSupabase
        .from("users")
        .select("email")
        .eq("id", userId)
        .maybeSingle()

      if (targetUser?.email) {
        await adminSupabase
          .from("registrations")
          .update({
            status: isActive ? "APPROVED" : "PENDING",
            updated_at: new Date().toISOString(),
          })
          .ilike("email", targetUser.email)
      }
    }

    // 2. Update/Upsert subject access if role and subject provided
    if (role && subject) {
      let packageType = "REGULER"
      switch (role) {
        case "UTS_EINSTEIN":
          packageType = "EINSTEIN"
          break
        case "UTS_SENKU":
          packageType = "SENKU"
          break
        case "UTS_FLUX":
          packageType = "FLUX"
          break
        case "STUDENT_PREMIUM":
          packageType = "REGULER"
          break
      }

      const { error: accessError } = await adminSupabase
        .from("user_subject_access")
        .upsert(
          {
            user_id: userId,
            subject,
            role,
            package_type: packageType,
            is_active: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,subject" }
        )

      if (accessError) throw accessError
    }

    return NextResponse.json({ message: "User updated successfully" })
  } catch (error: any) {
    console.error("PATCH user error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
