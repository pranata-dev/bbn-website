import { createClient, createServiceClient } from "@/lib/supabase/server"
import DashboardClient from "./DashboardClient"
import { redirect } from "next/navigation"

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

  const { data: userData } = await serviceClient
    .from("users")
    .select("id, name, email, is_active, student_category, package_type, billing_cycle, subject_access:user_subject_access(*)")
    .or(`auth_id.eq.${authUser.id},email.ilike.${userEmail}`)
    .maybeSingle()

  // Strict verification guard: Must have an active user account
  if (!userData || userData.is_active === false || userData.is_active === null) {
    redirect("/waiting-approval")
  }

  const subjectAccess = userData?.subject_access || []

  return (
    <DashboardClient
      dbUser={userData}
      subjectAccess={subjectAccess}
    />
  )
}
