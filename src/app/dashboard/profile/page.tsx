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
        <div className="space-y-6 font-mono">
            <div className="bg-[#FEFCF3] border-4 border-[#2b1b11] rounded-2xl p-5 shadow-[6px_6px_0px_#2b1b11]">
                <h1
                    className="text-lg md:text-xl font-extrabold text-[#2b1b11] mb-1 flex items-center gap-3"
                    style={{ fontFamily: "var(--font-press-start)", lineHeight: 1.4 }}
                >
                    <User className="w-6 h-6 text-[#e87a5d] stroke-[2]" />
                    Profil
                </h1>
                <p className="text-sm text-[#3c5443] font-bold">Informasi akun kamu.</p>
            </div>

            <div className="bg-[#FEFCF3] border-4 border-[#2b1b11] shadow-[4px_4px_0px_#2b1b11] overflow-hidden">
                <div className="p-6 space-y-6">
                    {/* Avatar + Name */}
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-[#2b1b11] border-4 border-[#2b1b11] flex items-center justify-center text-[#FEFCF3] text-xl font-extrabold shadow-[3px_3px_0px_#e87a5d]">
                            {initial}
                        </div>
                        <div>
                            <h2 className="text-base font-extrabold text-[#2b1b11]">{userName}</h2>
                        </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Email */}
                        <div className="flex items-center gap-3 p-4 bg-[#bed3c6]/30 border-2 border-[#2b1b11]">
                            <div className="w-9 h-9 bg-[#bed3c6] border-2 border-[#2b1b11] flex items-center justify-center shadow-[1px_1px_0px_#2b1b11]">
                                <Mail className="w-4 h-4 text-[#2b1b11] stroke-[2]" />
                            </div>
                            <div>
                                <p className="text-[10px] text-[#3c5443] font-bold uppercase tracking-wider">Email</p>
                                <p className="text-xs font-extrabold text-[#2b1b11]">{userEmail}</p>
                            </div>
                        </div>

                        {/* Join Date */}
                        <div className="flex items-center gap-3 p-4 bg-[#bed3c6]/30 border-2 border-[#2b1b11]">
                            <div className="w-9 h-9 bg-[#bed3c6] border-2 border-[#2b1b11] flex items-center justify-center shadow-[1px_1px_0px_#2b1b11]">
                                <Calendar className="w-4 h-4 text-[#2b1b11] stroke-[2]" />
                            </div>
                            <div>
                                <p className="text-[10px] text-[#3c5443] font-bold uppercase tracking-wider">Bergabung Sejak</p>
                                <p className="text-xs font-extrabold text-[#2b1b11]">{joinDate}</p>
                            </div>
                        </div>

                        {/* Paket Aktif */}
                        <div className="flex flex-col gap-3 p-4 bg-[#bed3c6]/30 border-2 border-[#2b1b11] sm:col-span-2">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-[#bed3c6] border-2 border-[#2b1b11] flex items-center justify-center shadow-[1px_1px_0px_#2b1b11]">
                                    <Package className="w-4 h-4 text-[#2b1b11] stroke-[2]" />
                                </div>
                                <p className="text-[10px] text-[#3c5443] font-bold uppercase tracking-wider">Paket Aktif</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                                {subjectAccess.length === 0 ? (
                                    <p className="text-xs font-extrabold text-[#2b1b11]">Belum Ada Paket</p>
                                ) : (
                                    subjectAccess.map((acc: any) => (
                                        <div key={acc.id} className="flex items-center justify-between bg-[#FEFCF3] p-2 border-2 border-[#2b1b11]/30">
                                            <span className="text-[10px] font-extrabold text-[#2b1b11]">
                                                {acc.subject === "FISDAS2" ? "Fisika Dasar 2" : acc.subject}
                                            </span>
                                            <span className="text-[10px] font-bold bg-[#bed3c6] text-[#2b1b11] px-2 py-0.5 border border-[#2b1b11]">
                                                {acc.package_type}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
