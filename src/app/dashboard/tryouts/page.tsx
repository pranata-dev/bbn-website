"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Clock, ArrowRight, Loader2 } from "lucide-react"
import { CATEGORY_LABELS } from "@/types"
import type { QuestionCategory } from "@/types"

interface TryoutItem {
    id: string
    title: string
    description: string | null
    category: QuestionCategory | null
    duration: number
    status: string
    is_practice: boolean
    created_at: string
    tryout_questions: { count: number }[]
}

import { useSubject } from "@/contexts/SubjectContext"

export default function TryoutsPage() {
    const [tryouts, setTryouts] = useState<TryoutItem[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<string>("all")
    const { selectedSubject } = useSubject()

    useEffect(() => {
        fetchTryouts()
    }, [selectedSubject])

    const fetchTryouts = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/tryouts?subject=${selectedSubject}`)
            const data = await res.json()
            const properTryouts = (data.tryouts || []).filter((t: any) => !t.is_practice)
            setTryouts(properTryouts)
        } catch (error) {
            console.error("Failed to fetch tryouts:", error)
        } finally {
            setLoading(false)
        }
    }

    const filteredTryouts = filter === "all"
        ? tryouts
        : tryouts.filter((t) => t.category === filter)

    return (
        <div className="space-y-6 font-mono">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="bg-[#FEFCF3] border-4 border-[#2b1b11] rounded-2xl p-5 shadow-[6px_6px_0px_#2b1b11] flex-1">
                    <h1
                        className="text-lg md:text-xl font-extrabold text-[#2b1b11] mb-1"
                        style={{ fontFamily: "var(--font-press-start)", lineHeight: 1.4 }}
                    >
                        Tryout
                    </h1>
                    <p className="text-sm text-[#3c5443] font-bold">Pilih dan kerjakan tryout yang tersedia.</p>
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
                            <p className="text-xs text-[#3c5443] font-bold">Total Tryout</p>
                            <h3 className="text-2xl font-extrabold text-[#2b1b11]">{tryouts.length}</h3>
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
                                {tryouts.filter(t => t.category && ["WEEK_1", "WEEK_2", "WEEK_3", "WEEK_4"].includes(t.category)).length}
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
                                {tryouts.filter(t => t.category && ["WEEK_5", "WEEK_6", "WEEK_7"].includes(t.category)).length}
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
            ) : filteredTryouts.length === 0 ? (
                <div className="bg-[#FEFCF3] border-4 border-[#2b1b11] shadow-[4px_4px_0px_#2b1b11]">
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-14 h-14 bg-[#bed3c6] border-2 border-[#2b1b11] flex items-center justify-center shadow-[2px_2px_0px_#2b1b11] mb-4">
                            <FileText className="w-7 h-7 text-[#2b1b11] stroke-[2]" />
                        </div>
                        <h3 className="text-sm font-extrabold text-[#2b1b11] mb-1" style={{ fontFamily: "var(--font-press-start)" }}>Belum Ada Tryout</h3>
                        <p className="text-xs text-[#3c5443] font-bold">Belum ada tryout aktif saat ini. Cek kembali nanti!</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredTryouts.map((tryout) => (
                        <div
                            key={tryout.id}
                            className="bg-[#FEFCF3] border-4 border-[#2b1b11] shadow-[4px_4px_0px_#2b1b11] hover:-translate-y-1 hover:shadow-[6px_6px_0px_#2b1b11] transition-all"
                        >
                            <div className="p-4 border-b-2 border-[#2b1b11]/20">
                                <span className="text-[10px] px-2 py-0.5 font-bold bg-[#bed3c6] text-[#2b1b11] border border-[#2b1b11] mb-2 inline-block">
                                    {tryout.category ? CATEGORY_LABELS[tryout.category] : "Semua Materi"}
                                </span>
                                <h3 className="text-sm font-extrabold text-[#2b1b11]">{tryout.title}</h3>
                            </div>
                            <div className="p-4">
                                {tryout.description && (
                                    <p className="text-xs text-[#3c5443] font-bold mb-3 line-clamp-2">{tryout.description}</p>
                                )}
                                <div className="flex items-center gap-4 text-[10px] text-[#3c5443] font-bold mb-4">
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5 stroke-[2]" />
                                        <span>{tryout.duration} menit</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <FileText className="w-3.5 h-3.5 stroke-[2]" />
                                        <span>{tryout.tryout_questions?.[0]?.count || 0} soal</span>
                                    </div>
                                </div>
                                <Button
                                    asChild
                                    className="w-full bg-[#e87a5d] hover:bg-[#d95a4f] text-[#FEFCF3] border-2 border-[#2b1b11] shadow-[2px_2px_0px_#2b1b11] rounded-none font-bold text-xs"
                                    size="sm"
                                >
                                    <Link href={`/dashboard/tryouts/${tryout.id}`}>
                                        Mulai Tryout
                                        <ArrowRight className="ml-2 w-4 h-4 stroke-[2]" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
