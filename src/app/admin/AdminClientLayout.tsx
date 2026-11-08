"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileQuestion,
  Timer,
  CheckSquare,
  Trophy,
  Sliders,
  LogOut,
  Search,
  Menu,
  X,
  Activity,
  Terminal,
} from "lucide-react"

interface NavItem {
  index: string
  href: string
  label: string
  icon: typeof LayoutDashboard
  badge?: string
}

const navItems: NavItem[] = [
  { index: "01", href: "/admin", label: "Ringkasan Utama", icon: LayoutDashboard },
  { index: "02", href: "/admin/users", label: "Data Siswa", icon: Users },
  { index: "03", href: "/admin/materials", label: "Kurikulum & Modul", icon: BookOpen },
  { index: "04", href: "/admin/questions", label: "Bank Soal & LaTeX", icon: FileQuestion, badge: "HOT" },
  { index: "05", href: "/admin/tryouts", label: "Kelola Tryout", icon: Timer },
  { index: "06", href: "/admin/latihan", label: "Latihan Soal", icon: CheckSquare },
  { index: "07", href: "/admin/leaderboard", label: "Peringkat Nilai", icon: Trophy },
  { index: "08", href: "/admin/statistics", label: "Pengaturan Sistem", icon: Sliders },
]

export default function AdminClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/admin/login")
    router.refresh()
  }

  const currentNav = navItems.find((item) =>
    item.href === "/admin"
      ? pathname === "/admin"
      : pathname.startsWith(item.href)
  ) || navItems[0]

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-canvas-paper font-sans select-none justify-between">
      <div className="flex flex-col">
        {/* Brand & System Status Header */}
        <div className="p-4 border-b border-[#171717] bg-surface-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-emerald-600 inline-block animate-pulse border border-[#171717]" />
              <span className="font-mono text-[10px] text-ink-muted font-bold tracking-wider">
                SYS_STATUS: ONLINE
              </span>
            </div>
            <span className="font-mono text-[10px] bg-accent-canary px-1.5 py-0.5 border border-[#171717] text-[#171717] font-bold">
              [SYS_ADMIN v2.4]
            </span>
          </div>

          <Link href="/admin" className="block group">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-accent-canary border border-[#171717]" />
              <h1 className="font-extrabold text-lg tracking-tight text-[#171717] leading-none group-hover:text-ink-muted transition-colors">
                BBN Education
              </h1>
            </div>
            <p className="font-mono text-[10px] text-ink-muted mt-1 uppercase tracking-wider">
              Backoffice Management Console
            </p>
          </Link>
        </div>

        {/* System Diagnostic Metric Strip */}
        <div className="px-4 py-2 bg-canvas-paper border-b border-[#171717]/20 flex items-center justify-between font-mono text-[10px] text-ink-muted">
          <span>LOC: ID-JKT-SRV01</span>
          <span className="text-emerald-700 font-bold flex items-center gap-1">
            <Activity className="w-3 h-3" /> PING: 42ms
          </span>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex flex-col p-3 space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href)
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`w-full text-left font-mono text-xs px-3 py-2.5 flex items-center justify-between border transition-all ${
                  isActive
                    ? "border-[#171717] bg-accent-canary text-[#171717] font-bold shadow-[2px_2px_0px_#171717]"
                    : "border-transparent text-ink-muted hover:border-[#171717] hover:bg-surface-white hover:text-[#171717]"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-[10px] font-bold shrink-0">
                    [{item.index}]
                  </span>
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate font-medium">{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {item.badge && (
                    <span className="font-mono text-[9px] bg-alert-rust text-white px-1 font-bold">
                      {item.badge}
                    </span>
                  )}
                  {isActive && <span className="text-xs">→</span>}
                </div>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Nav Footer / Admin User Context */}
      <div className="p-3 border-t border-[#171717] bg-surface-white flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 bg-[#171717] text-surface-white flex items-center justify-center font-mono text-xs font-bold border border-[#171717] shrink-0">
              AD
            </div>
            <div className="overflow-hidden">
              <p className="font-mono text-xs font-bold text-[#171717] leading-tight truncate">
                Admin Console
              </p>
              <p className="font-mono text-[10px] text-ink-muted">
                SuperAdministrator
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="p-1.5 hover:bg-canvas-paper border border-[#171717] hover:bg-alert-rust/10 hover:text-alert-rust transition-colors cursor-pointer"
            title="Keluar dari Panel Admin"
          >
            <LogOut className="w-3.5 h-3.5 text-ink-muted hover:text-alert-rust" />
          </button>
        </div>

        <div className="text-center bg-canvas-paper py-1 border border-[#171717]/20 font-mono text-[9px] text-ink-muted">
          SESSION SECURE // IP 180.252.88.19
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#171717] antialiased flex flex-col md:flex-row selection:bg-accent-canary selection:text-[#171717]">
      {/* Mobile Top Bar */}
      <header className="md:hidden flex items-center justify-between p-3.5 border-b-2 border-[#171717] bg-surface-white sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 bg-accent-canary border border-[#171717]" />
          <div>
            <span className="font-extrabold text-sm text-[#171717] block leading-none">
              BBN Education
            </span>
            <span className="font-mono text-[9px] text-ink-muted uppercase">
              Admin Portal
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 bg-canvas-paper border border-[#171717] text-[#171717] font-mono text-xs font-bold flex items-center gap-1 cursor-pointer"
        >
          {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          <span>{sidebarOpen ? "TUTUP" : "MENU"}</span>
        </button>
      </header>

      {/* Desktop Sidebar (Fixed 268px) */}
      <aside className="hidden md:block w-[268px] min-h-screen bg-canvas-paper border-r-2 border-[#171717] shrink-0 sticky top-0 h-screen z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay Drawer */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative w-[280px] max-w-[85%] h-full bg-canvas-paper border-r-2 border-[#171717] shadow-xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Workspace Canvas */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#FBFBFA] overflow-y-auto">
        {/* Sticky Top Utility Bar */}
        <header className="w-full bg-canvas-paper border-b border-[#171717] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-20">
          {/* Breadcrumb Cluster */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[11px] text-ink-muted uppercase">
              BBN_EDU // BACKOFFICE
            </span>
            <span className="text-ink-muted text-xs">/</span>
            <span className="font-mono text-[11px] bg-surface-white px-2 py-0.5 border border-[#171717] font-bold text-[#171717]">
              [{currentNav.index}] {currentNav.label.toUpperCase()}
            </span>
            <span className="hidden sm:inline-block w-2 h-2 bg-emerald-600 border border-[#171717] ml-2" />
            <span className="hidden sm:inline font-mono text-[10px] text-emerald-800 font-bold tracking-wide">
              SEMUA SERVICE NORMAL (42ms)
            </span>
          </div>

          {/* Right Utility Actions */}
          <div className="flex items-center gap-2">
            {/* Quick Search */}
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 absolute left-2 text-ink-muted" />
              <input
                type="text"
                placeholder="[Cmd+K] Cari Data..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-surface-white text-[#171717] font-mono text-xs pl-7 pr-3 py-1.5 border border-[#171717] w-36 sm:w-56 focus:outline-none focus:bg-white placeholder:text-ink-muted"
              />
            </div>

            {/* Live Session Counter */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 bg-surface-white border border-[#171717] font-mono text-[11px]">
              <span className="w-2 h-2 bg-accent-canary border border-[#171717]" />
              <span className="font-bold text-[#171717]">DISPATCH: ONLINE</span>
            </div>

            {/* Terminal Console Trigger */}
            <Link
              href="/admin/statistics"
              className="px-2 py-1.5 bg-surface-white border border-[#171717] hover:bg-accent-canary font-mono text-xs flex items-center gap-1 transition-colors"
              title="Terminal Konsol Sistem"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-bold">CONSOLE</span>
            </Link>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
