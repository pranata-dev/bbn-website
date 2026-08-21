import { createClient } from "@/lib/supabase/server"
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

  const { data: userData } = await supabase
    .from("users")
    .select("id, name, email, subject_access:user_subject_access(*)")
    .eq("auth_id", authUser.id)
    .single()

  const subjectAccess = userData?.subject_access || []

  return (
    <DashboardClient
      dbUser={userData}
      subjectAccess={subjectAccess}
    />
  )
}
