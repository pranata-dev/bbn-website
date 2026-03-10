import { createClient } from "@/lib/supabase/server"
import DashboardClient from "./DashboardClient"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()

    if (!authUser) {
        redirect("/login")
    }

    const { data: userData } = await supabase
        .from("users")
        .select("name, package_type, tryout_attempt_used, role")
        .eq("auth_id", authUser.id)
        .single()

    const firstName = userData?.name ? userData.name.split(' ')[0] : 'Sobat';

    return (
        <div className="space-y-8">
            {/* Welcome header */}
            <div>
                <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                <p className="text-muted-foreground">
                    Halo {firstName}, selamat datang kembali! Pantau progres belajarmu di sini.
                </p>
            </div>

            <DashboardClient dbUser={userData} />
        </div>
    )
}
