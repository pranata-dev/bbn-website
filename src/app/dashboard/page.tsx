import { createClient, createServiceClient } from "@/lib/supabase/server"
import DashboardClient from "./DashboardClient"
import { redirect } from "next/navigation"
import { getExcellentBetaGrade } from "@/config/excellent"
import { escapeLikePattern } from "@/lib/postgrest-safe"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) {
    redirect("/login")
  }

  const serviceClient = createServiceClient()
  const userEmail = (authUser.email || "").toLowerCase().trim()

  const { data: userByAuth } = await serviceClient
    .from("users")
    .select("id, name, email, is_active, subscriptions(*)")
    .eq("auth_id", authUser.id)
    .maybeSingle()

  let userData = userByAuth
  if (!userData && userEmail) {
    const { data: userByEmail } = await serviceClient
      .from("users")
      .select("id, name, email, is_active, subscriptions(*)")
      .ilike("email", escapeLikePattern(userEmail))
      .maybeSingle()
    userData = userByEmail
  }

  // Strict verification guard: Must have an active user account
  if (!userData || userData.is_active === false || userData.is_active === null) {
    redirect("/waiting-approval")
  }

  const excellentGrade = getExcellentBetaGrade(authUser)

  return (
    <DashboardClient
      dbUser={userData}
      excellentGrade={excellentGrade}
    />
  )
}
