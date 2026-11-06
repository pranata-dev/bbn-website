import { createClient } from "@/lib/supabase/server"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { PageHeader } from "@/components/dashboard/PageHeader"

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  let dbUser = null
  if (authUser) {
    const { data } = await supabase
      .from("users")
      .select("*, subscriptions(*)")
      .eq("auth_id", authUser.id)
      .maybeSingle()
    dbUser = data
  }

  const userName = dbUser?.name || "User"
  const userEmail = dbUser?.email || authUser?.email || "-"
  const subscriptions = ((dbUser as any)?.subscriptions || []).filter(
    (s: any) => s.status === "ACTIVE"
  )

  const joinDate = dbUser?.created_at
    ? format(new Date(dbUser.created_at), "dd MMMM yyyy", { locale: id })
    : "-"
  const initial = userName.charAt(0).toUpperCase()

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="Profil Pengguna"
        subtitle="Informasi akun dan paket langganan aktif kamu."
      />

      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-[#FFEED6] space-y-8 max-w-3xl">
        {/* Avatar + Name */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#FFEED6] border border-[#827148]/20 flex items-center justify-center text-[#827148] text-2xl font-extrabold shadow-2xs">
            {initial}
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#827148]">{userName}</h2>
            <p className="text-xs text-[#827148]/70 font-medium">Mahasiswa / Pelajar</p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#FFEED6]">
          {/* Email */}
          <div className="p-4 rounded-xl bg-[#FFEED6]/20 border border-[#FFEED6]">
            <p className="text-[11px] font-semibold text-[#827148]/70 uppercase tracking-wider mb-1">
              Email
            </p>
            <p className="text-sm font-bold text-[#827148] break-all">{userEmail}</p>
          </div>

          {/* Join Date */}
          <div className="p-4 rounded-xl bg-[#FFEED6]/20 border border-[#FFEED6]">
            <p className="text-[11px] font-semibold text-[#827148]/70 uppercase tracking-wider mb-1">
              Bergabung Sejak
            </p>
            <p className="text-sm font-bold text-[#827148]">{joinDate}</p>
          </div>

          {/* Paket Aktif */}
          <div className="p-4 rounded-xl bg-[#FFEED6]/20 border border-[#FFEED6] sm:col-span-2">
            <p className="text-[11px] font-semibold text-[#827148]/70 uppercase tracking-wider mb-3">
              Paket Langganan Aktif
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {subscriptions.length === 0 ? (
                <p className="text-xs text-[#827148]/60 font-medium">
                  Paket Gratis (Freemium)
                </p>
              ) : (
                subscriptions.map((sub: any) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between bg-white p-3 rounded-xl border border-[#FFEED6]"
                  >
                    <div>
                      <span className="text-xs font-bold text-[#827148] block">
                        {sub.plan_code === "SEMESTER" ? "Paket Semester" : sub.plan_code === "MONTHLY" ? "Paket Bulanan" : "Paket Gratis"}
                      </span>
                      <span className="text-[10px] text-[#827148]/60">
                        {sub.track === "NON_PHYSICS" ? "Umum / Non-Fisika" : "Departemen Fisika"}
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#A5AF79] text-white">
                      {sub.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
