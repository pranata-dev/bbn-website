import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import AdminClientLayout from "./AdminClientLayout"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("auth_id", user.id)
        .single()

    if (!profile || profile.role !== "ADMIN") {
        redirect("/dashboard")
    }

    return <AdminClientLayout>{children}</AdminClientLayout>
}
