"use client"

import React, { useEffect, useState } from "react"
import { ArrowUp, Terminal } from "lucide-react"
import { cn } from "@/lib/utils"

export interface TocItem {
    id: string
    text: string
    level: number
}

export function slugify(text: string): string {
    return text
        .toLowerCase()
        // Strip markdown links [text](url) -> text
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        // Strip inline code
        .replace(/`([^`]+)`/g, "$1")
        // Strip formatting asterisks / underscores
        .replace(/[*_~]/g, "")
        // Strip inline math $...$
        .replace(/\$([^$]+)\$/g, "$1")
        // Remove special punctuation, keeping letters, numbers, spaces, hyphens
        .replace(/[^\w\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
}

function cleanHeaderText(raw: string): string {
    return raw
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/`([^`]+)`/g, "$1")
        .replace(/[*_~]/g, "")
        .replace(/\$([^$]+)\$/g, "$1")
        .trim()
}

export function extractToc(markdown: string): TocItem[] {
    if (!markdown) return []
    const lines = markdown.split("\n")
    const items: TocItem[] = []
    const slugCounts = new Map<string, number>()

    for (const line of lines) {
        const trimmed = line.trim()
        // Skip code blocks
        if (trimmed.startsWith("```")) continue

        const h2Match = trimmed.match(/^##\s+(.+)$/)
        const h3Match = trimmed.match(/^###\s+(.+)$/)

        if (h2Match) {
            const raw = h2Match[1].trim()
            const baseSlug = slugify(raw)
            const count = (slugCounts.get(baseSlug) || 0) + 1
            slugCounts.set(baseSlug, count)
            const id = count > 1 ? `${baseSlug}-${count - 1}` : baseSlug
            items.push({ id, text: cleanHeaderText(raw), level: 2 })
        } else if (h3Match) {
            const raw = h3Match[1].trim()
            const baseSlug = slugify(raw)
            const count = (slugCounts.get(baseSlug) || 0) + 1
            slugCounts.set(baseSlug, count)
            const id = count > 1 ? `${baseSlug}-${count - 1}` : baseSlug
            items.push({ id, text: cleanHeaderText(raw), level: 3 })
        }
    }

    return items
}

export function useActiveHeading(headingIds: string[]): string {
    const [activeId, setActiveId] = useState<string>("")

    useEffect(() => {
        if (!headingIds || headingIds.length === 0) return

        const headingElements = headingIds
            .map((id) => document.getElementById(id))
            .filter((el): el is HTMLElement => el !== null)

        if (headingElements.length === 0) return

        // Observer with rootMargin to trigger around top third of screen
        const observer = new IntersectionObserver(
            (entries) => {
                const visibleEntries = entries.filter((entry) => entry.isIntersecting)
                if (visibleEntries.length > 0) {
                    // Pick the entry nearest to the top
                    visibleEntries.sort(
                        (a, b) => a.boundingClientRect.top - b.boundingClientRect.top
                    )
                    setActiveId(visibleEntries[0].target.id)
                }
            },
            {
                rootMargin: "-80px 0px -65% 0px",
                threshold: [0, 1],
            }
        )

        headingElements.forEach((el) => observer.observe(el))

        // Handle page scroll top/bottom extremes
        const handleScroll = () => {
            if (window.scrollY < 120) {
                setActiveId(headingIds[0] || "")
                return
            }
            if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 60) {
                setActiveId(headingIds[headingIds.length - 1] || "")
            }
        }

        window.addEventListener("scroll", handleScroll, { passive: true })

        return () => {
            observer.disconnect()
            window.removeEventListener("scroll", handleScroll)
        }
    }, [headingIds])

    return activeId || headingIds[0] || ""
}

interface TableOfContentsProps {
    items: TocItem[]
    className?: string
}

export default function TableOfContents({ items, className }: TableOfContentsProps) {
    const headingIds = React.useMemo(() => items.map((item) => item.id), [items])
    const activeId = useActiveHeading(headingIds)

    const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault()
        const element = document.getElementById(id)
        if (element) {
            const yOffset = -96 // header offset
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
            window.scrollTo({ top: y, behavior: "smooth" })
            window.history.pushState(null, "", `#${id}`)
        }
    }

    if (!items || items.length === 0) {
        return null
    }

    const activeIndex = items.findIndex((item) => item.id === activeId)

    return (
        <div className={cn("font-mono text-xs space-y-3", className)}>
            {/* Rigid Directory Tree Header */}
            <div className="border-b border-[#171717] pb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[#171717]">
                    <Terminal className="size-3.5 text-alert-rust" />
                    <span>[SYS.TOC] // DIREKTORI_MODUL</span>
                </div>
                <span className="text-[10px] text-ink-muted">
                    {items.length} SEKSI
                </span>
            </div>

            {/* Rigid Directory List */}
            <nav className="space-y-1.5">
                {items.map((item, index) => {
                    const isActive = activeId === item.id
                    const isCompleted = activeIndex !== -1 && index < activeIndex

                    if (isActive) {
                        return (
                            <a
                                key={item.id}
                                href={`#${item.id}`}
                                onClick={(e) => handleLinkClick(e, item.id)}
                                className={cn(
                                    "block p-2.5 border-2 border-[#171717] bg-accent-canary text-[#171717] font-bold technical-shadow-sm transition-all leading-snug",
                                    item.level === 3 ? "ml-2.5" : ""
                                )}
                            >
                                <div className="flex items-center justify-between gap-1.5 mb-1">
                                    <span className="font-mono text-[10px] text-[#171717]">
                                        [-] SEKSI 0{index + 1}
                                    </span>
                                    <span className="bg-alert-rust text-white text-[9px] font-mono px-1.5 py-0.2 uppercase font-bold shrink-0">
                                        SEDANG BERJALAN
                                    </span>
                                </div>
                                <div className="text-xs font-black line-clamp-2">
                                    {item.text}
                                </div>
                            </a>
                        )
                    }

                    if (isCompleted) {
                        return (
                            <a
                                key={item.id}
                                href={`#${item.id}`}
                                onClick={(e) => handleLinkClick(e, item.id)}
                                className={cn(
                                    "block p-2 border border-[#D4D2C9] bg-surface-white hover:bg-canvas-paper hover:border-[#171717] transition-all leading-snug group",
                                    item.level === 3 ? "ml-2.5" : ""
                                )}
                            >
                                <div className="flex items-center justify-between gap-1.5">
                                    <div className="flex items-center gap-1.5 truncate">
                                        <span className="w-4 h-4 bg-green-700 text-surface-white text-[9px] font-bold flex items-center justify-center shrink-0">
                                            ✓
                                        </span>
                                        <span className="text-xs font-semibold text-[#171717] truncate">
                                            {item.text}
                                        </span>
                                    </div>
                                    <span className="text-[9px] font-mono font-bold text-green-700 bg-green-100 border border-green-300 px-1 py-0.2 shrink-0">
                                        SELESAI 100%
                                    </span>
                                </div>
                            </a>
                        )
                    }

                    // Upcoming / Unread
                    return (
                        <a
                            key={item.id}
                            href={`#${item.id}`}
                            onClick={(e) => handleLinkClick(e, item.id)}
                            className={cn(
                                "block p-2 border border-[#D4D2C9] bg-surface-white hover:bg-canvas-paper hover:border-[#171717] text-ink-muted hover:text-[#171717] transition-all leading-snug group",
                                item.level === 3 ? "ml-2.5 text-[11px]" : "text-xs"
                            )}
                        >
                            <div className="flex items-center gap-1.5">
                                <span className="font-mono text-[10px] text-ink-muted/70 group-hover:text-[#171717] shrink-0">
                                    {item.level === 3 ? "├─[+]" : "[+]"}
                                </span>
                                <span className="truncate group-hover:font-medium">
                                    {item.text}
                                </span>
                            </div>
                        </a>
                    )
                })}
            </nav>

            {/* Back to Top Mechanical Button */}
            <div className="pt-2">
                <button
                    type="button"
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-[#171717] bg-canvas-paper border border-[#171717] hover:bg-accent-canary transition-colors py-2 px-3 w-full cursor-pointer technical-shadow-sm"
                >
                    <ArrowUp className="size-3 text-[#171717]" />
                    <span>[^ KEMBALI_KE_PUNCAK]</span>
                </button>
            </div>
        </div>
    )
}
