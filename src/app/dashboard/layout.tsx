"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    LayoutDashboard,
    FileText,
    Trophy,
    History,
    User,
    LogOut,
    BookOpen,
    Menu,
    X,
    Lock,
    ChevronDown,
    Check
} from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { APP_NAME } from "@/constants"
import { getPackageFeatures, PackageFeatures } from "@/lib/package-features"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { SubjectProvider, useSubject } from "@/contexts/SubjectContext"
import { Subject } from "@/types"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Base nav structure without features
const navItems = [
    { id: "dashboard", href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, requiredFeature: null },
    { id: "materi", href: "/dashboard/materi", label: "Materi", icon: BookOpen, requiredFeature: null },
    { id: "latihan", href: "/dashboard/latihan", label: "Latihan Soal", icon: FileText, requiredFeature: "canAccessLatihan" as keyof PackageFeatures },
    { id: "tryouts", href: "/dashboard/tryouts", label: "Tryout", icon: FileText, requiredFeature: "canAccessTryout" as keyof PackageFeatures },
    { id: "leaderboard", href: "/dashboard/leaderboard", label: "Leaderboard", icon: Trophy, requiredFeature: null },
    { id: "history", href: "/dashboard/history", label: "Riwayat", icon: History, requiredFeature: null },
    { id: "profile", href: "/dashboard/profile", label: "Profil", icon: User, requiredFeature: null },
]

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <SubjectProvider>
            <DashboardLayoutInner>
                {children}
            </DashboardLayoutInner>
        </SubjectProvider>
    )
}

function SubjectSwitcher({ subjectAccess }: { subjectAccess: any[] }) {
    const { selectedSubject, setSelectedSubject } = useSubject()
    
    const subjects: { id: Subject; label: string }[] = [
        { id: "FISDAS2", label: "Fisika Dasar 2" },
        { id: "FISMAT", label: "Fisika Matematika" },
    ]

    const getAccess = (subject: Subject) => subjectAccess.find(a => a.subject === subject && a.is_active)

    return (
        <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">
                Pilih Mata Kuliah
            </label>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-between bg-warm-beige/20 border-warm-gray/40 h-10 px-3 hover:bg-warm-beige/40 transition-colors text-left"
                    >
                        <span className="truncate font-medium text-foreground">
                            {subjects.find(s => s.id === selectedSubject)?.label}
                        </span>
                        <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 ml-2" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="start">
                    {subjects.map((s) => {
                        const hasAccess = !!getAccess(s.id)
                        const isSelected = selectedSubject === s.id
                        
                        return (
                            <DropdownMenuItem
                                key={s.id}
                                className={`flex items-center justify-between cursor-pointer ${!hasAccess ? "opacity-60" : ""}`}
                                onClick={() => {
                                    if (hasAccess) {
                                        setSelectedSubject(s.id)
                                    }
                                }}
                                disabled={!hasAccess}
                            >
                                <span className="font-medium">{s.label}</span>
                                <div className="flex items-center gap-2">
                                    {!hasAccess && <Lock className="w-3 h-3 text-muted-foreground" />}
                                    {isSelected && <Check className="w-4 h-4 text-dark-brown" />}
                                </div>
                            </DropdownMenuItem>
                        )
                    })}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [subjectAccess, setSubjectAccess] = useState<any[]>([])
    const [isLoadingUser, setIsLoadingUser] = useState(true)
    const { selectedSubject } = useSubject()

    useEffect(() => {
        const fetchUserPackage = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                try {
                    const { data: profile, error: dbError } = await supabase
                        .from('users')
                        .select('*, subject_access:user_subject_access(*)')
                        .eq('auth_id', user.id)
                        .single()
                        
                    if (dbError) {
                        console.error("Layout fetch DB error", dbError)
                    }

                    if (profile && profile.subject_access) {
                        setSubjectAccess(profile.subject_access)
                    }
                } catch (error) {
                    console.error("Failed to fetch user profile", error)
                }
            }
            setIsLoadingUser(false)
        }

        fetchUserPackage()
    }, [])

    const activeAccess = subjectAccess.find(a => a.subject === selectedSubject && a.is_active)
    const features = activeAccess 
        ? getPackageFeatures(activeAccess.package_type, activeAccess.role)
        : getPackageFeatures(null, "STUDENT_BASIC")

    const handleLogout = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push("/login")
        router.refresh()
    }

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-6 border-b border-warm-gray/60 text-center lg:text-left">
                <Link href="/dashboard" className="flex items-center gap-2 justify-center lg:justify-start">
                    <div className="w-8 h-8 rounded-lg bg-dark-brown flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-cream" />
                    </div>
                    <span className="font-semibold text-foreground tracking-tight">{APP_NAME}</span>
                </Link>
            </div>

            {/* Subject Switcher */}
            <div className="px-4 py-4 border-b border-warm-gray/60">
                <SubjectSwitcher 
                    subjectAccess={subjectAccess} 
                />
            </div>

            {/* Navigation */}
            <ScrollArea className="flex-1 p-4">
                <nav className="space-y-1">
                    <TooltipProvider>
                        {navItems.map((item) => {
                            const isActive = pathname === item.href
                            let isLocked = false
                            if (item.requiredFeature && !features[item.requiredFeature]) {
                                isLocked = true
                            }

                            const navContent = (
                                <div
                                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive && !isLocked
                                        ? "bg-dark-brown text-cream"
                                        : isLocked
                                            ? "text-muted-foreground/50 bg-warm-gray/10 cursor-not-allowed"
                                            : "text-muted-foreground hover:bg-warm-beige hover:text-foreground"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon className="w-4 h-4" />
                                        {item.label}
                                    </div>
                                    {isLocked && <Lock className="w-4 h-4 text-muted-foreground/60" />}
                                </div>
                            )

                            if (isLocked) {
                                let lockdownMessage = "Fitur ini tidak tersedia di paket Anda."
                                if (item.id === "tryouts" && !features.canAccessTryout) {
                                    lockdownMessage = "Upgrade paket Anda untuk membuka TryOut"
                                }
                                return (
                                    <Tooltip key={item.id}>
                                        <TooltipTrigger asChild>
                                            <div className="w-full text-left">{navContent}</div>
                                        </TooltipTrigger>
                                        <TooltipContent side="right">
                                            <p>{lockdownMessage}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                )
                            }

                            return (
                                <Link
                                    key={item.id}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    {navContent}
                                </Link>
                            )
                        })}
                    </TooltipProvider>
                </nav>
            </ScrollArea>

            {/* Logout */}
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
            {/* Mobile header */}
            <div className="lg:hidden flex items-center justify-between p-4 border-b border-warm-gray/60 bg-white">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-dark-brown flex items-center justify-center shrink-0">
                        <BookOpen className="w-4 h-4 text-cream" />
                    </div>
                    <span className="font-semibold text-sm text-foreground">{APP_NAME}</span>
                </Link>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                    {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
            </div>

            <div className="flex">
                {/* Desktop sidebar */}
                <aside className="hidden lg:block w-64 h-screen sticky top-0 bg-white border-r border-warm-gray/60">
                    <SidebarContent />
                </aside>

                {/* Mobile sidebar overlay */}
                {sidebarOpen && (
                    <div className="lg:hidden fixed inset-0 z-50">
                        <div
                            className="absolute inset-0 bg-black/30"
                            onClick={() => setSidebarOpen(false)}
                        />
                        <aside className="relative w-64 h-full bg-white shadow-xl">
                            <SidebarContent />
                        </aside>
                    </div>
                )}

                {/* Main content */}
                <main className="flex-1 min-h-screen">
                    <div className="p-6 sm:p-8 max-w-6xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
