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
    BookOpen,
    Menu,
    X,
    Shield,
} from "lucide-react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { APP_NAME } from "@/constants"

const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/payments", label: "Pembayaran", icon: CreditCard },
    { href: "/admin/users", label: "Pengguna", icon: Users },
    { href: "/admin/questions", label: "Soal", icon: HelpCircle },
    { href: "/admin/tryouts", label: "Tryout", icon: FileText },
    { href: "/admin/leaderboard", label: "Leaderboard", icon: Trophy },
    { href: "/admin/statistics", label: "Statistik", icon: BarChart3 },
]

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const router = useRouter()
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const handleLogout = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push("/login")
        router.refresh()
    }

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            <div className="p-6 border-b border-warm-gray/60">
                <Link href="/admin" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-dark-brown flex items-center justify-center">
                        <Shield className="w-4 h-4 text-cream" />
                    </div>
                    <div>
                        <span className="font-semibold text-foreground text-sm block">{APP_NAME}</span>
                        <span className="text-xs text-muted-foreground">Admin Panel</span>
                    </div>
                </Link>
            </div>

            <ScrollArea className="flex-1 p-4">
                <nav className="space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive
                                        ? "bg-dark-brown text-cream"
                                        : "text-muted-foreground hover:bg-warm-beige hover:text-foreground"
                                    }`}
                            >
                                <item.icon className="w-4 h-4" />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>
            </ScrollArea>

            <div className="p-4 border-t border-warm-gray/60">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground hover:text-foreground"
                    onClick={handleLogout}
                >
                    <LogOut className="w-4 h-4 mr-3" />
                    Keluar
                </Button>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-cream">
            <div className="lg:hidden flex items-center justify-between p-4 border-b border-warm-gray/60 bg-white">
                <Link href="/admin" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-dark-brown flex items-center justify-center">
                        <Shield className="w-4 h-4 text-cream" />
                    </div>
                    <span className="font-semibold text-sm text-foreground">Admin</span>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
                    {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
            </div>

            <div className="flex">
                <aside className="hidden lg:block w-64 h-screen sticky top-0 bg-white border-r border-warm-gray/60">
                    <SidebarContent />
                </aside>

                {sidebarOpen && (
                    <div className="lg:hidden fixed inset-0 z-50">
                        <div className="absolute inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
                        <aside className="relative w-64 h-full bg-white">
                            <SidebarContent />
                        </aside>
                    </div>
                )}

                <main className="flex-1 min-h-screen">
                    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
