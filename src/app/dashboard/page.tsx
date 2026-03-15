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
        .select("id, name, subject_access:user_subject_access(*)")
        .eq("auth_id", authUser.id)
        .single()

    const firstName = userData?.name ? userData.name.split(' ')[0] : 'Sobat';
    
    // For the global dashboard, we can show a summary or the first subject's quota
    // The client will handle displaying per-subject if needed.
    const subjectAccess = userData?.subject_access || []
    
    return (
        <div className="space-y-8">
            {/* Welcome header */}
            <div>
                <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                <p className="text-muted-foreground">
                    Halo {firstName}, selamat datang kembali! Pantau progres belajarmu di sini.
                </p>
            </div>

            <DashboardClient 
                dbUser={userData} 
                subjectAccess={subjectAccess}
            />
        </div>
    )
}
