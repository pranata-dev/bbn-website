"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState } from "react"
import { APP_NAME } from "@/constants"

const navItems = [
  { href: "/admin", label: "Dashboard", color: "bg-[#A5AF79]" },
  { href: "/admin/users", label: "Manajemen Pengguna", color: "bg-[#827148]" },
  { href: "/admin/questions", label: "Manajemen Soal", color: "bg-[#A5AF79]" },
  { href: "/admin/tryouts", label: "Simulasi Tryout", color: "bg-[#E8A07C]" },
  { href: "/admin/materials", label: "Modul Materi", color: "bg-[#827148]" },
  { href: "/admin/latihan", label: "Latihan Soal", color: "bg-[#A5AF79]" },
  { href: "/admin/leaderboard", label: "Peringkat Nilai", color: "bg-[#E8A07C]" },
  { href: "/admin/statistics", label: "Statistik & Pengaturan", color: "bg-[#827148]" },
]

export default function AdminClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await fetch("/api/admin/auth/logout", { method: "POST" })
    router.push("/admin/login")
    router.refresh()
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white font-sans">
      {/* Brand Header */}
      <div className="p-6 border-b border-[#FFEED6] bg-white">
        <Link href="/admin" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-[#FFEED6] flex items-center justify-center border border-[#827148]/15 shrink-0 group-hover:bg-[#A5AF79]/20 transition-colors shadow-2xs">
            <div className="w-4 h-4 rounded-md bg-[#A5AF79]" />
          </div>
          <div>
            <span className="font-bold text-[#827148] text-sm sm:text-base leading-tight block">
              Belajar Bareng Nata
            </span>
            <span className="text-[10px] font-bold text-[#A5AF79] uppercase tracking-wider block mt-0.5">
              Admin Portal
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <ScrollArea className="flex-1 p-4">
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#A5AF79] text-white shadow-2xs -translate-y-0.5"
                    : "text-[#827148] hover:bg-[#FFEED6]/50"
                }`}
              >
                {/* Pseudo-Icon Indicator */}
                <div
                  className={`w-2.5 h-2.5 rounded-full shrink-0 transition-colors ${
                    isActive ? "bg-white" : item.color
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Logout Button */}
      <div className="p-4 border-t border-[#FFEED6] bg-white">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full py-3 px-4 bg-white hover:bg-[#E8A07C]/15 border-2 border-[#FFEED6] hover:border-[#E8A07C] text-[#827148] hover:text-[#E8A07C] font-bold rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
        >
          <div className="w-2 h-2 rounded-full bg-[#E8A07C]" />
          <span>Keluar Admin</span>
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FFEED6]/20 font-sans">
      {/* Mobile Top Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-[#FFEED6] bg-white sticky top-0 z-40">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#FFEED6] flex items-center justify-center border border-[#827148]/15">
            <div className="w-3 h-3 rounded-xs bg-[#A5AF79]" />
          </div>
          <div>
            <span className="font-bold text-[#827148] text-xs block">
              Belajar Bareng Nata
            </span>
            <span className="text-[9px] font-bold text-[#A5AF79] uppercase">
              Admin Portal
            </span>
          </div>
        </Link>
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-xl bg-[#FFEED6]/40 border border-[#FFEED6] text-[#827148] hover:bg-[#FFEED6] transition-colors cursor-pointer text-xs font-bold"
        >
          {sidebarOpen ? "Tutup" : "Menu"}
        </button>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-72 h-screen sticky top-0 bg-white border-r-2 border-[#FFEED6] z-30">
          <SidebarContent />
        </aside>

        {/* Mobile Drawer */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div
              className="absolute inset-0 bg-[#827148]/40 backdrop-blur-xs"
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="relative w-72 h-full bg-white border-r-2 border-[#FFEED6] shadow-xl">
              <SidebarContent />
            </aside>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 min-h-screen pb-16">
          <div className="p-4 sm:p-8 lg:p-10 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
