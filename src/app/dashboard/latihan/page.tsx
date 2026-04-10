"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, BatteryWarning, ArrowRight, Loader2, Lock } from "lucide-react"
import { CATEGORY_LABELS, QuestionCategory } from "@/types"
import { createClient } from "@/lib/supabase/client"
import { canAccessPracticePart } from "@/lib/package-features"
import { toast } from "sonner"

interface LatihanItem {
    id: string
    title: string
    description: string | null
    category: QuestionCategory | null
    status: string
    is_practice: boolean
    practice_part: number | null
    created_at: string
    tryout_questions: { count: number }[]
}

import { useSubject } from "@/contexts/SubjectContext"

export default function LatihanPage() {
    const [latihans, setLatihans] = useState<LatihanItem[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<string>("all")
    const { selectedSubject } = useSubject()

    const [subjectAccess, setSubjectAccess] = useState<any[]>([])

    useEffect(() => {
        fetchLatihan()
        fetchUserAccess()
    }, [selectedSubject])

    const fetchUserAccess = async () => {
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: profile } = await supabase
                    .from("users")
                    .select("*, subject_access:user_subject_access(*)")
                    .eq("auth_id", user.id)
                    .single()
                if (profile?.subject_access) {
                    setSubjectAccess(profile.subject_access)
                }
            }
        } catch (error) {
            console.error("Failed to fetch user profile", error)
        }
    }

    const fetchLatihan = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/tryouts?subject=${selectedSubject}`)
            const data = await res.json()
            const practiceItems = (data.tryouts || []).filter((t: any) => t.is_practice)
            setLatihans(practiceItems)
        } catch (error) {
            console.error("Failed to fetch latihan:", error)
        } finally {
            setLoading(false)
        }
    }

    const filteredLatihans = filter === "all"
        ? latihans
        : latihans.filter((t) => t.category === filter)

    return (
        <div className="space-y-6 font-mono">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="bg-[#FEFCF3] border-4 border-[#2b1b11] rounded-2xl p-5 shadow-[6px_6px_0px_#2b1b11] flex-1">
                    <h1
                        className="text-lg md:text-xl font-extrabold text-[#2b1b11] mb-1"
                        style={{ fontFamily: "var(--font-press-start)", lineHeight: 1.4 }}
                    >
                        Latihan Soal
                    </h1>
                    <p className="text-sm text-[#3c5443] font-bold">Kumpulan soal untuk melatih pemahaman konsep Fisikamu.</p>
                </div>
                <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-[200px] bg-[#FEFCF3] border-2 border-[#2b1b11] rounded-none shadow-[2px_2px_0px_#2b1b11] font-mono font-bold text-[#2b1b11]">
                        <SelectValue placeholder="Filter kategori" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#FEFCF3] border-2 border-[#2b1b11] rounded-none shadow-[4px_4px_0px_#2b1b11] font-mono">
                        <SelectItem value="all">Semua Kategori</SelectItem>
                        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Mini Statistic Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#FEFCF3] border-4 border-[#2b1b11] p-4 shadow-[4px_4px_0px_#2b1b11]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-[#3c5443] font-bold">Total Latihan</p>
                            <h3 className="text-2xl font-extrabold text-[#2b1b11]">{latihans.length}</h3>
                        </div>
                        <div className="w-10 h-10 bg-[#bed3c6] border-2 border-[#2b1b11] flex items-center justify-center shadow-[2px_2px_0px_#2b1b11]">
                            <FileText className="w-5 h-5 text-[#2b1b11] stroke-[2]" />
                        </div>
                    </div>
                </div>
                <div className="bg-[#FEFCF3] border-4 border-[#2b1b11] p-4 shadow-[4px_4px_0px_#2b1b11]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-[#3c5443] font-bold">Week 1–4</p>
                            <h3 className="text-2xl font-extrabold text-[#2b1b11]">
                                {latihans.filter(t => t.category && ["WEEK_1", "WEEK_2", "WEEK_3", "WEEK_4"].includes(t.category)).length}
                            </h3>
                        </div>
                        <div className="w-10 h-10 bg-[#bed3c6] border-2 border-[#2b1b11] flex items-center justify-center shadow-[2px_2px_0px_#2b1b11]">
                            <ArrowRight className="w-5 h-5 text-[#2b1b11] stroke-[2]" />
                        </div>
                    </div>
                </div>
                <div className="bg-[#FEFCF3] border-4 border-[#2b1b11] p-4 shadow-[4px_4px_0px_#2b1b11]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-[#3c5443] font-bold">Week 5–7</p>
                            <h3 className="text-2xl font-extrabold text-[#2b1b11]">
                                {latihans.filter(t => t.category && ["WEEK_5", "WEEK_6", "WEEK_7"].includes(t.category)).length}
                            </h3>
                        </div>
                        <div className="w-10 h-10 bg-[#e87a5d]/20 border-2 border-[#2b1b11] flex items-center justify-center shadow-[2px_2px_0px_#2b1b11]">
                            <ArrowRight className="w-5 h-5 text-[#e87a5d] stroke-[2]" />
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-6 h-6 animate-spin text-[#2b1b11]" />
                </div>
            ) : filteredLatihans.length === 0 ? (
                <div className="bg-[#FEFCF3] border-4 border-[#2b1b11] shadow-[4px_4px_0px_#2b1b11]">
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-14 h-14 bg-[#bed3c6] border-2 border-[#2b1b11] flex items-center justify-center shadow-[2px_2px_0px_#2b1b11] mb-4">
                            <BatteryWarning className="w-7 h-7 text-[#2b1b11] stroke-[2]" />
                        </div>
                        <h3 className="text-sm font-extrabold text-[#2b1b11] mb-1" style={{ fontFamily: "var(--font-press-start)" }}>Belum Ada Latihan</h3>
                        <p className="text-xs text-[#3c5443] font-bold max-w-sm">
                            Bank latihan soal sedang disusun oleh tim akademik kami.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredLatihans.map((latihan) => {
                        const activeAccess = subjectAccess.find(a => a.subject === selectedSubject && a.is_active)
                        const totalPartsInCategory = latihan.category
                            ? latihans.filter(l => l.category === latihan.category).length
                            : latihans.length
                        const isLocked = !canAccessPracticePart(activeAccess?.package_type, activeAccess?.role, latihan.practice_part, latihan.title, selectedSubject, totalPartsInCategory)

                        return (
                            <div
                                key={latihan.id}
                                className={`bg-[#FEFCF3] border-4 border-[#2b1b11] shadow-[4px_4px_0px_#2b1b11] transition-all ${
                                    isLocked ? "opacity-60" : "hover:-translate-y-1 hover:shadow-[6px_6px_0px_#2b1b11]"
                                }`}
                            >
                                <div className="p-4 border-b-2 border-[#2b1b11]/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-[10px] px-2 py-0.5 font-bold bg-[#bed3c6] text-[#2b1b11] border border-[#2b1b11]">
                                            {latihan.category ? CATEGORY_LABELS[latihan.category] : "Semua Materi"}
                                        </span>
                                        {isLocked && (
                                            <span className="text-[10px] px-2 py-0.5 font-bold text-[#e87a5d] border border-[#e87a5d] flex items-center gap-1">
                                                <Lock className="w-3 h-3" /> Upgrade
                                            </span>
                                        )}
                                    </div>
                                    <h3 className={`text-sm font-extrabold ${isLocked ? "text-[#2b1b11]/40" : "text-[#2b1b11]"}`}>
                                        {latihan.title}
                                    </h3>
                                </div>
                                <div className="p-4">
                                    {latihan.description && (
                                        <p className="text-xs text-[#3c5443] font-bold mb-3 line-clamp-2">{latihan.description}</p>
                                    )}
                                    <div className="flex items-center gap-3 text-[10px] text-[#3c5443] font-bold mb-4">
                                        <div className="flex items-center gap-1">
                                            <FileText className="w-3.5 h-3.5 stroke-[2]" />
                                            <span>{latihan.tryout_questions?.[0]?.count || 0} soal</span>
                                        </div>
                                    </div>
                                    {isLocked ? (
                                        <Button
                                            className="w-full bg-[#2b1b11]/10 text-[#2b1b11]/40 border-2 border-[#2b1b11]/20 rounded-none font-bold text-xs"
                                            size="sm"
                                            onClick={() => toast.error("Upgrade paket Anda ke Senku atau Einstein untuk mengakses bagian ini!")}
                                        >
                                            <Lock className="w-4 h-4 mr-2" /> Terkunci
                                        </Button>
                                    ) : (
                                        <Button
                                            asChild
                                            className="w-full bg-[#e87a5d] hover:bg-[#d95a4f] text-[#FEFCF3] border-2 border-[#2b1b11] shadow-[2px_2px_0px_#2b1b11] rounded-none font-bold text-xs"
                                            size="sm"
                                        >
                                            <Link href={`/dashboard/latihan/${latihan.id}`}>
                                                Masuk Latihan
                                                <ArrowRight className="ml-2 w-4 h-4 stroke-[2]" />
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
