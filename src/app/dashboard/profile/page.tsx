import { Card, CardContent } from "@/components/ui/card"
import { User, Mail, Calendar, Package } from "lucide-react"
import { Badge } from "@/components/ui/badge"
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
            .select("*, subject_access:user_subject_access(*)")
            .eq("auth_id", authUser.id)
            .single()
        dbUser = data
    }

    const userName = dbUser?.name || "User"
    const userEmail = dbUser?.email || authUser?.email || "-"
    const subjectAccess = dbUser?.subject_access || []

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
                        <div className="flex flex-col gap-3 p-4 rounded-xl bg-warm-beige sm:col-span-2">
                            <div className="flex items-center gap-3">
                                <Package className="w-5 h-5 text-soft-brown" />
                                <p className="text-xs text-muted-foreground">Paket Aktif</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                                {subjectAccess.length === 0 ? (
                                    <p className="text-sm font-medium text-foreground">Belum Ada Paket</p>
                                ) : (
                                    subjectAccess.map((acc: any) => (
                                        <div key={acc.id} className="flex items-center justify-between bg-white/50 p-2 rounded-lg border border-warm-gray/20">
                                            <span className="text-xs font-bold text-dark-brown">
                                                {acc.subject === "FISDAS2" ? "Fisika Dasar 2" : acc.subject}
                                            </span>
                                            <Badge variant="secondary" className="text-[10px] bg-warm-beige text-soft-brown">
                                                {acc.package_type}
                                            </Badge>
                                        </div>
                                    ))
                                )}
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
