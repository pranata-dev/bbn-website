import { Card, CardContent } from "@/components/ui/card"
import { User, Mail, Calendar, Package } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { format } from "date-fns"
import { id } from "date-fns/locale"

export default async function ProfilePage() {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()

    let dbUser = null
    if (authUser) {
        const { data } = await supabase
            .from("users")
            .select("*")
            .eq("auth_id", authUser.id)
            .single()
        dbUser = data
    }

    const userName = dbUser?.name || "User"
    const userEmail = dbUser?.email || authUser?.email || "-"
    const userRole = dbUser?.role || "STUDENT_PREMIUM"

    let userPackage = dbUser?.package_type

    // Fallback logic for unsynced historic data
    if (!userPackage) {
        switch (userRole) {
            case "UTS_EINSTEIN":
                userPackage = "EINSTEIN"
                break
            case "UTS_SENKU":
                userPackage = "SENKU"
                break
            case "UTS_FLUX":
                userPackage = "FLUX"
                break
            case "STUDENT_PREMIUM":
                userPackage = "REGULER"
                break
            default:
                userPackage = "Belum Ada Paket"
                break
        }
    }

    const joinDate = dbUser?.created_at
        ? format(new Date(dbUser.created_at), "dd MMMM yyyy", { locale: id })
        : "-"
    const initial = userName.charAt(0).toUpperCase()
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Profil</h1>
                <p className="text-muted-foreground">Informasi akun kamu.</p>
            </div>

            <Card className="border-warm-gray/60">
                <CardContent className="p-6 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-dark-brown flex items-center justify-center text-cream text-xl font-bold">
                            {initial}
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">{userName}</h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-warm-beige">
                            <Mail className="w-5 h-5 text-soft-brown" />
                            <div>
                                <p className="text-xs text-muted-foreground">Email</p>
                                <p className="text-sm font-medium text-foreground">{userEmail}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-warm-beige">
                            <Package className="w-5 h-5 text-soft-brown" />
                            <div>
                                <p className="text-xs text-muted-foreground">Paket Aktif</p>
                                <p className="text-sm font-medium text-foreground">{userPackage}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-warm-beige">
                            <Calendar className="w-5 h-5 text-soft-brown" />
                            <div>
                                <p className="text-xs text-muted-foreground">Bergabung Sejak</p>
                                <p className="text-sm font-medium text-foreground">{joinDate}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
