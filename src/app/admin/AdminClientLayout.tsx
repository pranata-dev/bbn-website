"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    LayoutDashboard,
    CreditCard,
    Users,
    HelpCircle,
    FileText,
    Trophy,
    BarChart3,
    LogOut,
    Menu,
    X,
    Shield,
    BatteryWarning,
} from "lucide-react"
import { useState } from "react"
import { APP_NAME } from "@/constants"

const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/payments", label: "Pembayaran", icon: CreditCard },
    { href: "/admin/users", label: "Pengguna", icon: Users },
    { href: "/admin/questions", label: "Soal", icon: HelpCircle },
    { href: "/admin/tryouts", label: "Tryout", icon: FileText },
    { href: "/admin/latihan", label: "Latihan Soal", icon: BatteryWarning },
    { href: "/admin/leaderboard", label: "Leaderboard", icon: Trophy },
    { href: "/admin/statistics", label: "Statistik", icon: BarChart3 },
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
        <div className="flex flex-col h-full bg-[#FEFCF3]">
            <div className="p-6 border-b-4 border-[#2b1b11] bg-[#bed3c6]">
                <Link href="/admin" className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#e87a5d] border-2 border-[#2b1b11] flex items-center justify-center shadow-[2px_2px_0px_#2b1b11]">
                        <Shield className="w-5 h-5 text-[#FEFCF3] stroke-[2]" />
                    </div>
                    <div>
                        <span className="font-extrabold text-[#2b1b11] text-[10px] sm:text-xs block" style={{ fontFamily: "var(--font-press-start)", lineHeight: 1.4 }}>{APP_NAME}</span>
                        <span className="text-[10px] text-[#3c5443] font-mono font-bold mt-1 block">Admin Panel</span>
                    </div>
                </Link>
            </div>

            <ScrollArea className="flex-1 p-4">
                <nav className="space-y-3">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 text-sm font-bold font-mono transition-all border-2 border-[#2b1b11] ${
                                    isActive
                                        ? "bg-[#e87a5d] text-[#FEFCF3] shadow-[4px_4px_0px_#2b1b11] -translate-y-1"
                                        : "bg-[#FEFCF3] text-[#2b1b11] shadow-[2px_2px_0px_#2b1b11] hover:bg-[#bed3c6] hover:shadow-[4px_4px_0px_#2b1b11] hover:-translate-y-1"
                                }`}
                            >
                                <item.icon className={`w-5 h-5 stroke-[2.5] ${isActive ? "text-[#FEFCF3]" : "text-[#2b1b11]"}`} />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>
            </ScrollArea>

            <div className="p-4 border-t-4 border-[#2b1b11] bg-[#FEFCF3]">
                <Button
                    variant="outline"
                    className="w-full h-12 justify-center bg-[#FEFCF3] hover:bg-[#e87a5d] text-[#2b1b11] hover:text-[#FEFCF3] border-2 border-[#2b1b11] shadow-[4px_4px_0px_#2b1b11] hover:shadow-[6px_6px_0px_#2b1b11] hover:-translate-y-1 transition-all rounded-none font-bold font-mono"
                    onClick={handleLogout}
                >
                    <LogOut className="w-4 h-4 mr-3 stroke-[3]" />
                    Keluar Admin
                </Button>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-[#bed3c6] font-mono">
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center justify-between p-4 border-b-4 border-[#2b1b11] bg-[#FEFCF3] sticky top-0 z-40">
                <Link href="/admin" className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#e87a5d] border-2 border-[#2b1b11] flex items-center justify-center shadow-[2px_2px_0px_#2b1b11]">
                        <Shield className="w-4 h-4 text-[#FEFCF3] stroke-[2]" />
                    </div>
                    <span className="font-extrabold text-[9px] text-[#2b1b11]" style={{ fontFamily: "var(--font-press-start)" }}>Admin</span>
                </Link>
                <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="border-2 border-[#2b1b11] bg-[#FEFCF3] shadow-[2px_2px_0px_#2b1b11] rounded-none hover:bg-[#bed3c6]"
                >
                    {sidebarOpen ? <X className="w-5 h-5 stroke-[2.5] text-[#2b1b11]" /> : <Menu className="w-5 h-5 stroke-[2.5] text-[#2b1b11]" />}
                </Button>
            </div>

            <div className="flex">
                <aside className="hidden lg:block w-72 h-screen sticky top-0 bg-[#FEFCF3] border-r-4 border-[#2b1b11] z-30">
                    <SidebarContent />
                </aside>

                {sidebarOpen && (
                    <div className="lg:hidden fixed inset-0 z-50 flex">
                        <div className="absolute inset-0 bg-[#2b1b11]/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
                        <aside className="relative w-72 h-full bg-[#FEFCF3] border-r-4 border-[#2b1b11]">
                            <SidebarContent />
                        </aside>
                    </div>
                )}

                <main className="flex-1 min-h-screen pb-12">
                    <div className="p-4 sm:p-8 lg:p-10 max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
