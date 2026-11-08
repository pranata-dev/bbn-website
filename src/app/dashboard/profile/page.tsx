import { createClient } from "@/lib/supabase/server"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import Link from "next/link"
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
    <div className="space-y-8 font-sans">
      {/* Page Header */}
      <PageHeader
        title="Profil Pengguna"
        subtitle="Informasi identitas akun, kredensial autentikasi, dan status lisensi langganan aktif."
        breadcrumb="~/bbn-edu/student/profile/"
      />

      {/* Identity Hero Card */}
      <div className="bg-surface-white border-2 border-[#171717] technical-shadow p-6 sm:p-8 relative tick-corner">
        {/* Terminal Header Bar */}
        <div className="flex items-center justify-between border-b border-border-grid pb-3 mb-6 font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#171717]">[SYS.USER_IDENTITY]</span>
            <span className="text-ink-muted hidden sm:inline">// ID_MATRIX_ACTIVE</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-2 bg-accent-canary border border-[#171717]" />
            <span className="font-bold text-[#171717] text-[10px] uppercase tracking-wider">
              AUTHENTICATED // CADET
            </span>
          </div>
        </div>

        {/* Identity Details */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="size-20 bg-accent-canary border-2 border-[#171717] technical-shadow-sm flex items-center justify-center font-mono text-3xl font-black text-[#171717] shrink-0">
            {initial}
          </div>
          <div className="space-y-1.5 min-w-0">
            <h2 className="font-sans text-2xl sm:text-3xl font-black text-[#171717] tracking-tight leading-tight truncate">
              {userName}
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-alert-rust uppercase tracking-wider">
                PELAJAR_SAINS // BBN_EDUCATION
              </span>
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-canvas-paper border border-[#171717] text-[#171717]">
                ID: {authUser?.id ? authUser.id.slice(0, 12).toUpperCase() : "ANONYMOUS"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bento Grid Configuration Panels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Panel 01: Email */}
        <div className="bg-surface-white border-2 border-[#171717] technical-shadow p-6 relative tick-corner flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between font-mono text-xs font-bold text-ink-muted uppercase tracking-wider mb-3">
              <span>[01] // ALAMAT_EMAIL</span>
              <span className="size-2 bg-[#171717]" />
            </div>
            <div className="p-3.5 bg-canvas-paper border-2 border-[#171717] font-mono text-xs sm:text-sm font-black text-[#171717] break-all">
              {userEmail}
            </div>
          </div>
          <p className="font-mono text-[10px] text-ink-muted mt-3">
            VERIFIED VIA SUPABASE AUTH SERVICE
          </p>
        </div>

        {/* Panel 02: Bergabung Sejak */}
        <div className="bg-surface-white border-2 border-[#171717] technical-shadow p-6 relative tick-corner flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between font-mono text-xs font-bold text-ink-muted uppercase tracking-wider mb-3">
              <span>[02] // TANGGAL_BERGABUNG</span>
              <span className="size-2 bg-[#171717]" />
            </div>
            <div className="p-3.5 bg-canvas-paper border-2 border-[#171717] font-mono text-xs sm:text-sm font-black text-[#171717]">
              {joinDate.toUpperCase()}
            </div>
          </div>
          <p className="font-mono text-[10px] text-ink-muted mt-3">
            TIMESTAMP TERCATAT DI DATABASE
          </p>
        </div>
      </div>

      {/* Subscription & Licensing Tier Section */}
      <div className="bg-surface-white border-2 border-[#171717] technical-shadow p-6 sm:p-7 relative tick-corner space-y-4">
        <div className="flex items-center justify-between border-b-2 border-[#171717] pb-3 font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#171717]">[SYS.SUBSCRIPTION]</span>
            <span className="text-ink-muted hidden sm:inline">// LISENSI & PAKET BELAJAR</span>
          </div>
          <div className="font-mono text-xs font-black text-alert-rust">
            STATUS: {subscriptions.length > 0 ? "PRO_ACTIVE" : "FREEMIUM_TIER"}
          </div>
        </div>

        {subscriptions.length === 0 ? (
          <div className="p-5 bg-canvas-paper border-2 border-[#171717] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="font-mono text-xs font-black text-[#171717]">
                [TIER: FREEMIUM // FREE_ACCESS]
              </p>
              <p className="font-sans text-xs text-ink-muted leading-relaxed max-w-xl">
                Saat ini akun Anda menggunakan akses gratis. Buka seluruh bank soal tryout CBT, modul materi tingkat lanjut, dan pembahasan terperinci dengan mengaktifkan paket belajar BBN Education.
              </p>
            </div>
            <Link
              href="/#harga"
              className="bg-accent-canary hover:bg-[#FDE047]/90 text-[#171717] border-2 border-[#171717] technical-shadow font-mono text-xs font-black px-4 py-2.5 uppercase tracking-wider shrink-0 transition-all text-center inline-flex items-center justify-center gap-1.5"
            >
              <span>LIHAT PAKET BELAJAR</span>
              <span>&rarr;</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {subscriptions.map((sub: any) => (
              <div
                key={sub.id}
                className="bg-canvas-paper border-2 border-[#171717] p-4 flex items-center justify-between technical-shadow-sm"
              >
                <div>
                  <span className="font-mono text-xs font-black text-[#171717] block">
                    {sub.plan_code === "SEMESTER"
                      ? "PAKET SEMESTER (PRO)"
                      : sub.plan_code === "MONTHLY"
                      ? "PAKET BULANAN (PRO)"
                      : "PAKET BELAJAR"}
                  </span>
                  <span className="font-mono text-[10px] text-ink-muted font-bold block mt-0.5">
                    {sub.track === "NON_PHYSICS"
                      ? "TRACK: UMUM / NON-FISIKA"
                      : "TRACK: DEPARTEMEN FISIKA"}
                  </span>
                </div>
                <span className="font-mono text-[10px] font-black px-2.5 py-1 bg-green-100 text-green-900 border border-[#171717]">
                  {sub.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* System Telemetry & Security Panel */}
      <div className="bg-surface-white border-2 border-[#171717] technical-shadow p-6 relative tick-corner space-y-3">
        <h3 className="font-mono text-xs font-bold text-[#171717] pb-2 border-b-2 border-[#171717] uppercase tracking-wider">
          [SYS.TELEMETRY] // KEAMANAN & SESI DATA
        </h3>
        <div className="divide-y divide-border-grid font-mono text-xs">
          <div className="flex justify-between items-center py-2.5">
            <div>
              <span className="font-bold text-[#171717] block">Protokol Keamanan Autentikasi</span>
              <span className="text-[10px] text-ink-muted">Token sesi terenkripsi via Supabase Auth</span>
            </div>
            <span className="font-mono text-[10px] font-black px-2 py-0.5 bg-green-100 text-green-900 border border-[#171717]">
              SECURE [TLS_1.3]
            </span>
          </div>
          <div className="flex justify-between items-center py-2.5">
            <div>
              <span className="font-bold text-[#171717] block">Platform Kernel Architecture</span>
              <span className="text-[10px] text-ink-muted">BBN_EDUCATION // NEXTJS ENGINE</span>
            </div>
            <span className="font-mono text-[10px] font-bold text-ink-muted">
              SYS.VER // 4.9.1
            </span>
          </div>
          <div className="flex justify-between items-center py-2.5">
            <div>
              <span className="font-bold text-[#171717] block">Data Residency & Routing</span>
              <span className="text-[10px] text-ink-muted">Cloud edge database replication</span>
            </div>
            <span className="font-mono text-[10px] font-bold text-alert-rust">
              REGION: AP-SOUTHEAST-1
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
