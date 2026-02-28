"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, X, BookOpen } from "lucide-react"
import { NAV_LINKS, APP_NAME } from "@/constants"
import { ThemeToggle } from "@/components/ThemeToggle"

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-warm-gray/50"
                : "bg-transparent"
                }`}
        >
            <nav className="container-narrow mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-9 h-9 rounded-lg bg-dark-brown flex items-center justify-center transition-transform group-hover:scale-105">
                        <BookOpen className="w-5 h-5 text-cream" />
                    </div>
                    <span className="font-semibold text-lg text-foreground tracking-tight">{APP_NAME}</span>
                </Link>

                {/* Desktop nav */}
                <div className="hidden md:flex items-center gap-8">
                    {NAV_LINKS.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {link.label}
                        </a>
                    ))}
                </div>

                {/* Desktop CTA */}
                <div className="hidden md:flex items-center gap-3">
                    <ThemeToggle />
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/login">Masuk</Link>
                    </Button>
                    <Button size="sm" asChild className="bg-dark-brown hover:bg-soft-brown text-cream">
                        <Link href="/register">Daftar Sekarang</Link>
                    </Button>
                </div>

                {/* Mobile menu */}
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild className="md:hidden">
                        <Button variant="ghost" size="icon">
                            <Menu className="w-5 h-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[300px] bg-cream p-6">
                        <div className="flex flex-col gap-6 mt-8">
                            {NAV_LINKS.map((link) => (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsOpen(false)}
                                    className="text-sm font-medium text-foreground hover:text-soft-brown transition-colors"
                                >
                                    {link.label}
                                </a>
                            ))}
                            <hr className="border-warm-gray" />
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">Tema Tampilan</span>
                                    <ThemeToggle />
                                </div>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href="/login" onClick={() => setIsOpen(false)}>
                                        Masuk
                                    </Link>
                                </Button>
                                <Button size="sm" asChild className="bg-dark-brown hover:bg-soft-brown text-cream">
                                    <Link href="/register" onClick={() => setIsOpen(false)}>
                                        Daftar Sekarang
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </nav>
        </header>
    )
}
