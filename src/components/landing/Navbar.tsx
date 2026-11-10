"use client"

import { useState } from "react"
import Link from "next/link"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const NAV_LINKS = [
  { href: "#home", label: "Beranda" },
  { href: "#program", label: "Program" },
  { href: "#fitur", label: "Fitur" },
  { href: "#harga", label: "Harga" },
  { href: "#faq", label: "FAQ" },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeLink, setActiveLink] = useState("Beranda")

  return (
    <header className="sticky top-0 z-50 w-full bg-surface-white border-b border-[#171717]">
      <nav className="max-w-[1440px] mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        {/* Left: Brand Logo */}
        <Link 
          href="/" 
          className="flex items-center gap-2.5 group"
        >
          <span className="size-3 bg-alert-rust shrink-0 rounded-none group-hover:rotate-45 transition-transform" />
          <span className="font-sans font-extrabold text-lg sm:text-xl tracking-tight text-[#171717]">
            BBN Education
          </span>
          <span className="hidden sm:inline-block font-mono text-[10px] font-medium tracking-wider px-1.5 py-0.5 bg-canvas-paper border border-[#171717] text-ink-muted">
            SYS // V2.4
          </span>
        </Link>

        {/* Center: Monospace Navigation Links (Desktop) */}
        <div className="hidden lg:flex items-center gap-1 font-mono text-xs tracking-wider">
          {NAV_LINKS.map((link) => {
            const isActive = activeLink === link.label
            return (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setActiveLink(link.label)}
                className={`px-3 py-1.5 border transition-all uppercase font-medium ${
                  isActive
                    ? "bg-[#171717] text-surface-white border-[#171717]"
                    : "border-transparent text-[#171717] hover:border-[#171717] hover:bg-accent-canary"
                }`}
              >
                {link.label}
              </a>
            )
          })}
        </div>

        {/* Right: Search Keycap Shortcut & Primary CTA (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          {/* Search Keycap Badge */}
          <a
            href="#program"
            onClick={() => setActiveLink("Program")}
            className="flex items-center gap-2 px-2.5 py-1 bg-canvas-paper hover:bg-accent-canary border border-[#171717] font-mono text-xs text-ink-muted hover:text-[#171717] shadow-[1px_1px_0px_#171717] transition-colors"
          >
            <Search className="size-3.5 text-[#171717]" />
            <span className="text-[11px]">Cari Silabus</span>
            <kbd className="px-1 py-0.2 bg-surface-white border border-[#D4D2C9] text-[10px] text-[#171717] font-semibold">
              ⌘K
            </kbd>
          </a>

          {/* Primary CTA Button */}
          <Button 
            asChild 
            size="default" 
            className="bg-accent-canary hover:bg-accent-canary/90 text-[#171717] font-mono font-bold text-xs uppercase px-4 h-9 border border-[#171717] technical-shadow rounded-none cursor-pointer"
          >
            <Link href="/login">Login / Register</Link>
          </Button>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex lg:hidden items-center gap-2">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <button 
                type="button"
                className="p-2 border border-[#171717] bg-surface-white hover:bg-accent-canary transition-colors focus:outline-none technical-shadow-sm rounded-none"
                aria-label="Buka menu navigasi"
              >
                <div className="w-5 h-4 flex flex-col justify-between">
                  <span className="w-full h-0.5 bg-[#171717]" />
                  <span className="w-full h-0.5 bg-[#171717]" />
                  <span className="w-full h-0.5 bg-[#171717]" />
                </div>
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] p-6 bg-surface-white border-l border-[#171717] rounded-none">
              <div className="flex flex-col gap-6 mt-6">
                <div className="flex items-center gap-2 pb-3 border-b border-[#171717]">
                  <span className="size-3 bg-alert-rust rounded-none" />
                  <span className="font-sans font-bold text-lg tracking-tight text-[#171717]">
                    BBN Education
                  </span>
                </div>

                <div className="flex flex-col gap-2 font-mono text-xs uppercase">
                  {NAV_LINKS.map((link) => {
                    const isActive = activeLink === link.label
                    return (
                      <a
                        key={link.label}
                        href={link.href}
                        onClick={() => {
                          setActiveLink(link.label)
                          setIsOpen(false)
                        }}
                        className={`py-2 px-3 border transition-colors ${
                          isActive
                            ? "bg-[#171717] text-surface-white border-[#171717]"
                            : "border-[#D4D2C9] bg-canvas-paper text-[#171717] hover:bg-accent-canary hover:border-[#171717]"
                        }`}
                      >
                        {link.label}
                      </a>
                    )
                  })}
                </div>

                <div className="pt-4 border-t border-[#171717]">
                  <Button asChild className="w-full bg-accent-canary hover:bg-accent-canary/90 text-[#171717] font-mono font-bold text-xs uppercase border border-[#171717] technical-shadow rounded-none py-3 h-auto">
                    <Link href="/login" onClick={() => setIsOpen(false)}>
                      Login / Register
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
