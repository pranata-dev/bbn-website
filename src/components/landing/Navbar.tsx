"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, BookOpen, Sun, Moon } from "lucide-react"
import { useTheme } from "@/contexts/ThemeContext"

const NEW_NAV_LINKS = [
    { href: "#fitur", label: "Fitur" },
    { href: "#cara-kerja", label: "Cara Kerja" },
    { href: "#harga", label: "Harga" },
    { href: "#faq", label: "FAQ" },
]

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
    const { isDark, toggleTheme } = useTheme()

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 border-b-2 py-1 font-mono transition-colors ${
            isDark 
                ? "bg-[#1a1a2e] border-[#e87a5d] shadow-[0_2px_0px_#e87a5d]" 
                : "bg-[#FEFCF3] border-[#2b1b11] shadow-[0_2px_0px_#2b1b11]"
        }`}>
            <nav className="container mx-auto flex items-center justify-between px-6 lg:px-12 h-14">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group">
                    <div className={`w-7 h-7 border flex items-center justify-center shadow-[1px_1px_0px] transition-transform group-hover:scale-105 ${
                        isDark 
                            ? "bg-[#16213e] border-[#e87a5d] shadow-[#e87a5d] text-[#e87a5d]"
                            : "bg-[#bed3c6] border-[#2b1b11] shadow-[#2b1b11] text-[#2b1b11]"
                    }`}>
                        <BookOpen className="w-3.5 h-3.5 stroke-[2]" />
                    </div>
                    <span className={`font-bold text-sm md:text-base tracking-tight hover:text-[#e87a5d] transition-colors ${
                        isDark ? "text-[#FEFCF3]" : "text-[#2b1b11]"
                    }`}>Belajar Bareng Nata</span>
                </Link>

                {/* Desktop nav */}
                <div className="hidden md:flex items-center gap-3 lg:gap-4">
                    {NEW_NAV_LINKS.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className={`px-4 h-8 flex items-center justify-center border shadow-[1px_1px_0px] text-xs font-bold font-mono hover:shadow-[2px_2px_0px] hover:-translate-y-0.5 transition-all ${
                                isDark
                                    ? "bg-[#16213e] text-[#FEFCF3] border-[#e87a5d] shadow-[#e87a5d] hover:bg-[#0f3460] hover:shadow-[#e87a5d]"
                                    : "bg-[#bed3c6] text-[#2b1b11] border-[#2b1b11] shadow-[#2b1b11] hover:bg-[#a5c2b0] hover:shadow-[#2b1b11]"
                            }`}
                        >
                            {link.label}
                        </a>
                    ))}
                </div>

                {/* Desktop CTA + Theme Toggle */}
                <div className="hidden md:flex items-center gap-3 lg:gap-4">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className={`w-8 h-8 flex items-center justify-center border shadow-[1px_1px_0px] hover:shadow-[2px_2px_0px] hover:-translate-y-0.5 transition-all ${
                            isDark
                                ? "bg-[#16213e] border-[#e87a5d] shadow-[#e87a5d] text-[#e87a5d] hover:bg-[#0f3460]"
                                : "bg-[#FEFCF3] border-[#2b1b11] shadow-[#2b1b11] text-[#2b1b11] hover:bg-[#bed3c6]"
                        }`}
                        aria-label="Toggle dark mode"
                    >
                        {isDark ? <Sun className="w-4 h-4 stroke-[2]" /> : <Moon className="w-4 h-4 stroke-[2]" />}
                    </button>
                    <Link 
                        href="/login" 
                        className={`px-5 h-8 flex items-center justify-center border shadow-[1px_1px_0px] text-xs font-bold font-mono hover:shadow-[2px_2px_0px] hover:-translate-y-0.5 transition-all ${
                            isDark
                                ? "bg-[#1a1a2e] text-[#FEFCF3] border-[#e87a5d] shadow-[#e87a5d] hover:bg-[#16213e]"
                                : "bg-[#FEFCF3] text-[#2b1b11] border-[#2b1b11] shadow-[#2b1b11] hover:bg-[#e0ccba]"
                        }`}
                    >
                        Masuk
                    </Link>
                    <Button size="sm" asChild className="bg-[#e87a5d] hover:bg-[#d95a4f] text-[#FEFCF3] rounded-none border border-[#2b1b11] px-5 h-8 shadow-[1px_1px_0px_#2b1b11] hover:shadow-[2px_2px_0px_#2b1b11] hover:-translate-y-0.5 transition-all text-xs font-bold font-mono">
                        <Link href="/register">Daftar Sekarang</Link>
                    </Button>
                </div>

                {/* Mobile menu */}
                <div className="flex md:hidden items-center gap-2">
                    <button
                        onClick={toggleTheme}
                        className={`w-9 h-9 flex items-center justify-center border shadow-[1px_1px_0px] transition-all ${
                            isDark
                                ? "bg-[#16213e] border-[#e87a5d] shadow-[#e87a5d] text-[#e87a5d]"
                                : "bg-[#FEFCF3] border-[#2b1b11] shadow-[#2b1b11] text-[#2b1b11]"
                        }`}
                        aria-label="Toggle dark mode"
                    >
                        {isDark ? <Sun className="w-4 h-4 stroke-[2]" /> : <Moon className="w-4 h-4 stroke-[2]" />}
                    </button>
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className={isDark ? "text-[#FEFCF3] hover:bg-[#16213e]" : "text-[#2b1b11] hover:bg-[#bed3c6]"}>
                                <Menu className="w-6 h-6 stroke-[3]" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className={`w-[300px] border-l-4 p-6 pt-16 font-mono ${
                            isDark 
                                ? "bg-[#1a1a2e] border-[#e87a5d]" 
                                : "bg-[#FEFCF3] border-[#2b1b11]"
                        }`}>
                            <div className="flex flex-col gap-4 mt-8">
                                {NEW_NAV_LINKS.map((link) => (
                                    <a
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setIsOpen(false)}
                                        className={`w-full h-12 flex items-center justify-center border-2 shadow-[2px_2px_0px] text-sm font-bold font-mono hover:shadow-[4px_4px_0px] hover:-translate-y-1 transition-all ${
                                            isDark
                                                ? "bg-[#16213e] text-[#FEFCF3] border-[#e87a5d] shadow-[#e87a5d] hover:bg-[#0f3460]"
                                                : "bg-[#bed3c6] text-[#2b1b11] border-[#2b1b11] shadow-[#2b1b11] hover:bg-[#a5c2b0]"
                                        }`}
                                    >
                                        {link.label}
                                    </a>
                                ))}
                                <div className={`w-full h-1 my-2 opacity-20 ${isDark ? "bg-[#e87a5d]" : "bg-[#2b1b11]"}`}></div>
                                <div className="flex flex-col gap-4">
                                    <Link 
                                        href="/login" 
                                        onClick={() => setIsOpen(false)} 
                                        className={`w-full h-12 flex items-center justify-center border-2 shadow-[2px_2px_0px] text-sm font-bold font-mono hover:shadow-[4px_4px_0px] hover:-translate-y-1 transition-all ${
                                            isDark
                                                ? "bg-[#1a1a2e] text-[#FEFCF3] border-[#e87a5d] shadow-[#e87a5d] hover:bg-[#16213e]"
                                                : "bg-[#FEFCF3] text-[#2b1b11] border-[#2b1b11] shadow-[#2b1b11] hover:bg-[#e0ccba]"
                                        }`}
                                    >
                                        Masuk
                                    </Link>
                                    <Button size="lg" asChild className="bg-[#e87a5d] hover:bg-[#d95a4f] text-[#FEFCF3] rounded-none border-2 border-[#2b1b11] w-full h-12 shadow-[2px_2px_0px_#2b1b11] hover:shadow-[4px_4px_0px_#2b1b11] hover:-translate-y-1 transition-all text-sm font-bold font-mono">
                                        <Link href="/register" onClick={() => setIsOpen(false)}>
                                            Daftar Sekarang
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </nav>
        </header>
    )
}
