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
        .select("id, name, package_type, role")
        .eq("auth_id", authUser.id)
        .single()

    const firstName = userData?.name ? userData.name.split(' ')[0] : 'Sobat';

    // Count all TRYOUT submissions for global quota logic
    const { count: usedQuota } = await supabase
        .from("submissions")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", userData?.id)
        .eq("status", "SUBMITTED") // Only count completed ones
        // In this system, 'tryouts' table has 'is_practice' field. 
        // We need to join or filter by tryout type.
        // Let's filter by submissions where the linked tryout is NOT a practice.
    
    // Actually, let's just fetch the submissions and filter in code if count with join is complex in Supabase JS client without a view.
    // Or we can use the 'tryouts' relation.
    const { data: allSubmissions } = await supabase
        .from("submissions")
        .select("id, tryouts(is_practice)")
        .eq("user_id", userData?.id)
        .eq("status", "SUBMITTED")

    const tryoutSubmissions = allSubmissions?.filter((s: any) => s.tryouts && !s.tryouts.is_practice) || []
    const actualUsedQuota = tryoutSubmissions.length

    return (
        <div className="space-y-8">
            {/* Welcome header */}
            <div>
                <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                <p className="text-muted-foreground">
                    Halo {firstName}, selamat datang kembali! Pantau progres belajarmu di sini.
                </p>
            </div>

            <DashboardClient dbUser={userData} usedQuota={actualUsedQuota} />
        </div>
    )
}
