"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Clock, MessageCircle, LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { APP_NAME } from "@/constants"

export default function ExpiredPage() {
    const router = useRouter()

    const handleLogout = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push("/")
        router.refresh()
    }

    return (
        <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-warm-gray/60 p-8 text-center">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                    <Clock className="w-8 h-8 text-red-600" />
                    <div className="absolute top-0 right-0 w-4 h-4 rounded-full bg-white flex items-center justify-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-600" />
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-foreground tracking-tight mb-2">
                    Masa Akses Berakhir
                </h1>
                
                <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
                    Mohon maaf, masa aktif paket belajar Anda di {APP_NAME} telah habis (lebih dari 30 hari sejak persetujuan). 
                    Silakan hubungi Admin untuk memperbarui atau membeli paket baru.
                </p>

                <div className="space-y-3">
                    <Button 
                        className="w-full bg-[#25D366] hover:bg-[#1fbc5b] text-white flex items-center justify-center gap-2"
                        asChild
                    >
                        <Link href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer">
                            <MessageCircle className="w-4 h-4" />
                            Hubungi Admin via WhatsApp
                        </Link>
                    </Button>

                    <Button 
                        variant="outline" 
                        onClick={handleLogout}
                        className="w-full text-muted-foreground hover:text-foreground border-warm-gray/60 flex items-center justify-center gap-2"
                    >
                        <LogOut className="w-4 h-4" />
                        Keluar
                    </Button>
                </div>
            </div>
            
            <p className="mt-8 text-xs text-muted-foreground font-medium">
                &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
            </p>
        </div>
    )
}
