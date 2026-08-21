"use client"

import { useState } from "react"
import Link from "next/link"
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
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-[#FFEED6] shadow-xs">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16 sm:h-20">
        {/* Left: Text placeholder for Logo */}
        <Link 
          href="/" 
          className="flex items-center gap-2"
        >
          <div className="bg-[#FFEED6] text-[#827148] font-bold text-base sm:text-lg px-3.5 py-1.5 rounded-full tracking-tight">
            BELAJAR BARENG NATA
          </div>
        </Link>

        {/* Center: Horizontal list of navigation links (Desktop) */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => {
            const isActive = activeLink === link.label
            return (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setActiveLink(link.label)}
                className={`text-sm font-medium transition-colors relative py-1 ${
                  isActive
                    ? "text-[#827148] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#A5AF79] after:rounded-full"
                    : "text-[#827148]/75 hover:text-[#827148]"
                }`}
              >
                {link.label}
              </a>
            )
          })}
        </div>

        {/* Right: Primary solid button for Login / Register (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          <Button asChild size="default" className="bg-[#827148] hover:bg-[#827148]/90 text-white rounded-xl font-semibold shadow-xs px-5 h-10 transition-colors">
            <Link href="/login">Login / Register</Link>
          </Button>
        </div>

        {/* Mobile menu trigger using pure CSS lines (NO external icons) */}
        <div className="flex md:hidden items-center gap-2">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <button 
                type="button"
                className="p-2.5 rounded-xl border border-[#FFEED6] bg-[#FFEED6]/40 hover:bg-[#FFEED6] transition-colors focus:outline-none"
                aria-label="Buka menu navigasi"
              >
                <div className="w-5 h-4 flex flex-col justify-between">
                  <span className="w-full h-0.5 bg-[#827148] rounded-full" />
                  <span className="w-full h-0.5 bg-[#827148] rounded-full" />
                  <span className="w-full h-0.5 bg-[#827148] rounded-full" />
                </div>
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] p-6 bg-white border-l border-[#FFEED6]">
              <div className="flex flex-col gap-6 mt-8">
                <div className="font-bold text-lg tracking-tight text-[#827148] pb-3 border-b border-[#FFEED6]">
                  BELAJAR BARENG NATA
                </div>
                <div className="flex flex-col gap-3">
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
                        className={`text-base font-semibold py-2.5 px-4 rounded-xl transition-colors ${
                          isActive
                            ? "bg-[#FFEED6] text-[#827148]"
                            : "text-[#827148]/80 hover:bg-[#FFEED6]/50 hover:text-[#827148]"
                        }`}
                      >
                        {link.label}
                      </a>
                    )
                  })}
                </div>
                <div className="pt-4 border-t border-[#FFEED6]">
                  <Button asChild className="w-full bg-[#827148] hover:bg-[#827148]/90 text-white rounded-xl font-semibold shadow-xs py-3 h-auto">
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
