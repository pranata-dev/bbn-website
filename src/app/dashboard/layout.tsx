"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import UserPresenceTracker from "@/components/UserPresenceTracker"
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
    Check,
    Sun,
    Moon
} from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { APP_NAME } from "@/constants"
import { getPackageFeatures, PackageFeatures } from "@/lib/package-features"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { SubjectProvider, useSubject } from "@/contexts/SubjectContext"
import { useTheme } from "@/contexts/ThemeContext"
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
    const [isMounted, setIsMounted] = useState(false)
    
    useEffect(() => {
        setIsMounted(true)
    }, [])
    
    const subjects: { id: Subject; label: string }[] = [
        { id: "FISDAS2", label: "Fisika Dasar 2" },
        { id: "FISMAT", label: "Fisika Matematika" },
    ]

    const getAccess = (subject: Subject) => subjectAccess.find(a => a.subject === subject && a.is_active)

    return (
        <div className="space-y-1.5 font-mono">
            <label className="text-[10px] font-bold text-[#2b1b11] uppercase tracking-wider ml-1">
                Pilih Mata Kuliah
            </label>
            {isMounted ? (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full justify-between bg-[#bed3c6]/30 border-2 border-[#2b1b11] h-10 px-3 hover:bg-[#bed3c6]/50 transition-colors text-left rounded-none shadow-[2px_2px_0px_#2b1b11] font-mono"
                        >
                            <span className="truncate font-bold text-[#2b1b11]">
                                {subjects.find(s => s.id === selectedSubject)?.label}
                            </span>
                            <ChevronDown className="w-4 h-4 text-[#2b1b11] shrink-0 ml-2 stroke-[2]" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-[#FEFCF3] border-2 border-[#2b1b11] rounded-none shadow-[4px_4px_0px_#2b1b11] font-mono" align="start">
                        {subjects.map((s) => {
                            const hasAccess = !!getAccess(s.id)
                            const isSelected = selectedSubject === s.id
                            
                            return (
                                <DropdownMenuItem
                                    key={s.id}
                                    className={`flex items-center justify-between cursor-pointer font-bold text-sm ${!hasAccess ? "opacity-40" : "text-[#2b1b11] hover:bg-[#bed3c6]"}`}
                                    onClick={() => {
                                        if (hasAccess) {
                                            setSelectedSubject(s.id)
                                        }
                                    }}
                                    disabled={!hasAccess}
                                >
                                    <span>{s.label}</span>
                                    <div className="flex items-center gap-2">
                                        {!hasAccess && <Lock className="w-3 h-3 text-[#2b1b11]/40" />}
                                        {isSelected && <Check className="w-4 h-4 text-[#e87a5d] stroke-[3]" />}
                                    </div>
                                </DropdownMenuItem>
                            )
                        })}
                    </DropdownMenuContent>
                </DropdownMenu>
            ) : (
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-between bg-[#bed3c6]/30 border-2 border-[#2b1b11] h-10 px-3 transition-colors text-left rounded-none shadow-[2px_2px_0px_#2b1b11] font-mono opacity-50"
                    disabled
                >
                    <span className="truncate font-bold text-[#2b1b11]">Memuat...</span>
                    <ChevronDown className="w-4 h-4 text-[#2b1b11] shrink-0 ml-2 stroke-[2]" />
                </Button>
            )}
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
        <div className="flex flex-col h-full font-mono bg-[#FEFCF3]">
            {/* Logo */}
            <div className="p-5 border-b-4 border-[#2b1b11] text-center lg:text-left bg-[#bed3c6]">
                <Link href="/dashboard" className="flex items-center gap-2 justify-center lg:justify-start">
                    <div className="w-8 h-8 bg-[#FEFCF3] border-2 border-[#2b1b11] flex items-center justify-center shadow-[2px_2px_0px_#2b1b11]">
                        <BookOpen className="w-4 h-4 text-[#2b1b11] stroke-[2]" />
                    </div>
                    <span className="font-bold text-[#2b1b11] tracking-tight">{APP_NAME}</span>
                </Link>
            </div>

            {/* Subject Switcher */}
            <div className="px-4 py-4 border-b-2 border-[#2b1b11]/20">
                <SubjectSwitcher 
                    subjectAccess={subjectAccess} 
                />
            </div>

            {/* Navigation */}
            <ScrollArea className="flex-1 p-3">
                <nav className="space-y-1.5">
                    <TooltipProvider>
                        {navItems.map((item) => {
                            const isActive = pathname === item.href
                            let isLocked = false
                            if (item.requiredFeature && !features[item.requiredFeature]) {
                                isLocked = true
                            }

                            const navContent = (
                                <div
                                    className={`flex items-center justify-between px-3 py-2.5 text-sm font-bold transition-all border-2 ${isActive && !isLocked
                                        ? "bg-[#2b1b11] text-[#FEFCF3] border-[#2b1b11] shadow-[3px_3px_0px_#e87a5d]"
                                        : isLocked
                                            ? "text-[#2b1b11]/30 bg-[#bed3c6]/20 border-transparent cursor-not-allowed"
                                            : "text-[#3c5443] border-transparent hover:bg-[#bed3c6]/40 hover:border-[#2b1b11]/30 hover:text-[#2b1b11]"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon className="w-4 h-4 stroke-[2]" />
                                        {item.label}
                                    </div>
                                    {isLocked && <Lock className="w-4 h-4 text-[#2b1b11]/30" />}
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
                                        <TooltipContent side="right" className="bg-[#2b1b11] text-[#FEFCF3] border-2 border-[#e87a5d] font-mono text-xs">
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

            {/* Logout + Theme Toggle */}
            <div className="p-3 border-t-2 border-[#2b1b11]/20 space-y-2">
                <button
                    onClick={toggleTheme}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm font-bold font-mono text-[#2b1b11] hover:bg-[#bed3c6]/50 border-2 border-transparent hover:border-[#2b1b11]/20 transition-all"
                >
                    {isDark ? <Sun className="w-4 h-4 stroke-[2] text-[#e87a5d]" /> : <Moon className="w-4 h-4 stroke-[2]" />}
                    {isDark ? "Mode Terang" : "Mode Malam"}
                </button>
                <Button
                    variant="ghost"
                    className="w-full justify-start text-[#e87a5d] hover:text-[#d95a4f] hover:bg-[#e87a5d]/10 font-bold font-mono border-2 border-transparent hover:border-[#e87a5d]/30"
                    onClick={handleLogout}
                >
                    <LogOut className="w-4 h-4 mr-3 stroke-[2]" />
                    Keluar
                </Button>
            </div>
        </div>
    )

    const { isDark, toggleTheme } = useTheme()

    return (
        <div className={`relative min-h-screen ${isDark ? "bg-[#0f1b2e]" : "bg-[#bed3c6]"}`}>
            <UserPresenceTracker />

            {/* Pixel Art Background — per-route + theme */}
            {(() => {
                const isMateri = pathname.startsWith("/dashboard/materi")
                const isLatihan = pathname.startsWith("/dashboard/latihan")
                const isTryout = pathname.startsWith("/dashboard/tryouts")

                if (isMateri) {
                    return null
                }

                if (isLatihan || isTryout) {
                    return (
                        <div
                            className="fixed inset-0 z-0 opacity-70 [image-rendering:pixelated] [image-rendering:-moz-crisp-edges] [image-rendering:-webkit-optimize-contrast] [image-rendering:crisp-edges] [-ms-interpolation-mode:nearest-neighbor]"
                            style={{
                                backgroundImage: isDark ? "url('/assets/background-latihan-tryout-malam.png')" : "url('/assets/background-latihan-tryout-3.png')",
                                backgroundSize: "100% 100%",
                                backgroundPosition: "center center",
                                backgroundRepeat: "no-repeat"
                            }}
                        />
                    )
                }

                return (
                    <div
                        className="fixed inset-0 z-0 opacity-60 [image-rendering:pixelated] [image-rendering:-moz-crisp-edges] [image-rendering:-webkit-optimize-contrast] [image-rendering:crisp-edges] [-ms-interpolation-mode:nearest-neighbor]"
                        style={{
                            backgroundImage: isDark ? "url('/assets/background-only-malam.png')" : "url('/assets/background-only-2.png')",
                            backgroundSize: "cover",
                            backgroundPosition: "center center",
                            backgroundRepeat: "no-repeat"
                        }}
                    />
                )
            })()}

            {/* Mobile header */}
            <div className={`lg:hidden flex items-center justify-between p-4 border-b-4 relative z-20 ${isDark ? "border-[#e87a5d] bg-[#1a1a2e]" : "border-[#2b1b11] bg-[#bed3c6]"}`}>
                <Link href="/dashboard" className="flex items-center gap-2">
                    <div className={`w-8 h-8 border-2 flex items-center justify-center shadow-[2px_2px_0px] shrink-0 ${isDark ? "bg-[#16213e] border-[#e87a5d] shadow-[#e87a5d]" : "bg-[#FEFCF3] border-[#2b1b11] shadow-[#2b1b11]"}`}>
                        <BookOpen className={`w-4 h-4 stroke-[2] ${isDark ? "text-[#e87a5d]" : "text-[#2b1b11]"}`} />
                    </div>
                    <span className={`font-bold text-sm font-mono ${isDark ? "text-[#FEFCF3]" : "text-[#2b1b11]"}`}>{APP_NAME}</span>
                </Link>
                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleTheme}
                        className={`w-9 h-9 border-2 flex items-center justify-center shadow-[2px_2px_0px] transition-colors ${isDark ? "bg-[#16213e] border-[#e87a5d] shadow-[#e87a5d] text-[#e87a5d] hover:bg-[#0f3460]" : "bg-[#FEFCF3] border-[#2b1b11] shadow-[#2b1b11] text-[#2b1b11] hover:bg-[#bed3c6]"}`}
                        aria-label="Toggle dark mode"
                    >
                        {isDark ? <Sun className="w-4 h-4 stroke-[2]" /> : <Moon className="w-4 h-4 stroke-[2]" />}
                    </button>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className={`w-9 h-9 border-2 flex items-center justify-center shadow-[2px_2px_0px] transition-colors ${isDark ? "bg-[#16213e] border-[#e87a5d] shadow-[#e87a5d] hover:bg-[#0f3460]" : "bg-[#FEFCF3] border-[#2b1b11] shadow-[#2b1b11] hover:bg-[#bed3c6]"}`}
                    >
                        {sidebarOpen 
                            ? <X className={`w-5 h-5 stroke-[2] ${isDark ? "text-[#e87a5d]" : "text-[#2b1b11]"}`} /> 
                            : <Menu className={`w-5 h-5 stroke-[2] ${isDark ? "text-[#e87a5d]" : "text-[#2b1b11]"}`} />
                        }
                    </button>
                </div>
            </div>

            <div className="flex relative z-10">
                {/* Desktop sidebar */}
                <aside className="hidden lg:block w-64 h-screen sticky top-0 border-r-4 border-[#2b1b11] shadow-[4px_0px_0px_#2b1b11] z-20">
                    <SidebarContent />
                </aside>

                {/* Mobile sidebar overlay */}
                {sidebarOpen && (
                    <div className="lg:hidden fixed inset-0 z-50">
                        <div
                            className="absolute inset-0 bg-[#2b1b11]/40"
                            onClick={() => setSidebarOpen(false)}
                        />
                        <aside className="relative w-64 h-full shadow-[8px_0px_0px_#2b1b11] z-10">
                            <SidebarContent />
                        </aside>
                    </div>
                )}

                {/* Main content */}
                <main className="flex-1 min-h-screen relative">
                    <div className="p-6 sm:p-8 max-w-6xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
