"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileText, ArrowLeft, ArrowRight, Loader2, BatteryWarning } from "lucide-react"

export default function LatihanDetailPage() {
    const params = useParams()
    const router = useRouter()
    const validId = typeof params?.id === "string" ? params.id : null

    const [latihan, setLatihan] = useState<any>(null)
    const [previousSubmission, setPreviousSubmission] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!validId) return

        const fetchLatihanDetails = async () => {
            try {
                // We use the same public API; since it's just fetching the details, we can reuse it
                // Actually, the tryout get detail API doesn't exist publicly in a simple form. 
                // Let's create one or use a direct supabase query on the client.
                // Wait, if we use supabase client, we can fetch it directly.
                const { createClient } = await import("@/lib/supabase/client")
                const supabase = createClient()

                const { data, error } = await supabase
                    .from("tryouts")
                    .select("*, tryout_questions(count)")
                    .eq("id", validId)
                    .eq("is_practice", true)
                    .single()

                if (error || !data) {
                    throw new Error("Latihan tidak ditemukan.")
                }

                setLatihan({
                    ...data,
                    questionCount: data.tryout_questions?.[0]?.count || 0
                })

                // Fetch user submission history
                const { data: { session } } = await supabase.auth.getSession()
                if (session) {
                    const { data: profile } = await supabase
                        .from("users")
                        .select("id")
                        .eq("auth_id", session.user.id)
                        .single()
                    
                    if (profile) {
                        const { data: submissions } = await supabase
                            .from("submissions")
                            .select("id, status, score")
                            .eq("user_id", profile.id)
                            .eq("tryout_id", validId)
                            .order("created_at", { ascending: false })
                            .limit(1)

                        if (submissions && submissions.length > 0) {
                            setPreviousSubmission(submissions[0])
                        }
                    }
                }

            } catch (err: any) {
                console.error("Fetch error:", err)
                setError(err.message || "Gagal memuat detail latihan.")
            } finally {
                setLoading(false)
            }
        }

        fetchLatihanDetails()
    }, [validId])

    if (!validId) return null

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center font-mono">
                <Loader2 className="w-8 h-8 animate-spin text-[#e87a5d] mb-4" />
                <p className="text-[#2b1b11] font-bold text-sm">Memuat detail latihan...</p>
            </div>
        )
    }

    if (error || !latihan) {
        return (
            <div className="space-y-6 font-mono">
                <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm font-bold text-[#2b1b11] bg-[#FEFCF3] border-2 border-[#2b1b11] px-4 py-2 shadow-[2px_2px_0px_#2b1b11] hover:shadow-[3px_3px_0px_#2b1b11] hover:-translate-y-0.5 transition-all">
                    <ArrowLeft className="w-4 h-4 stroke-[3]" />
                    Kembali
                </button>
                <div className="bg-[#FEFCF3] border-4 border-[#e87a5d] p-8 shadow-[4px_4px_0px_#2b1b11] text-center">
                    <div className="w-16 h-16 bg-[#e87a5d]/20 border-2 border-[#e87a5d] flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-[#e87a5d] stroke-[2]" />
                    </div>
                    <h3 className="text-lg font-bold text-[#2b1b11] mb-2" style={{ fontFamily: "var(--font-press-start)", fontSize: "0.9rem" }}>Latihan Tidak Ditemukan</h3>
                    <p className="text-sm text-[#3c5443] font-bold">
                        {error || "Latihan soal yang Anda cari tidak tersedia."}
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 font-mono">
            {/* Back button */}
            <Link
                href="/dashboard/latihan"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#2b1b11] bg-[#FEFCF3] border-2 border-[#2b1b11] px-4 py-2 shadow-[2px_2px_0px_#2b1b11] hover:shadow-[3px_3px_0px_#2b1b11] hover:-translate-y-0.5 transition-all"
            >
                <ArrowLeft className="w-4 h-4 stroke-[3]" />
                Kembali ke Daftar Latihan
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main detail card */}
                <div className="lg:col-span-2 bg-[#FEFCF3] border-4 border-[#2b1b11] shadow-[4px_4px_0px_#2b1b11]">
                    {/* Header */}
                    <div className="border-b-4 border-[#2b1b11] bg-[#bed3c6] px-6 py-4">
                        <span className="inline-block text-[10px] font-bold text-[#2b1b11] bg-[#FEFCF3] border-2 border-[#2b1b11] px-2 py-0.5 mb-2 uppercase tracking-wider">
                            {latihan.category || "Semua Materi"}
                        </span>
                        <h1 className="text-xl font-bold text-[#2b1b11]" style={{ fontFamily: "var(--font-press-start)", fontSize: "1rem", lineHeight: 1.5 }}>
                            {latihan.title}
                        </h1>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        <div>
                            <h3 className="text-xs font-bold text-[#2b1b11] uppercase tracking-wider mb-2 flex items-center gap-2">
                                <span className="w-1.5 h-4 bg-[#e87a5d]"></span>
                                Deskripsi Latihan
                            </h3>
                            <p className="text-sm text-[#3c5443] font-bold leading-relaxed">
                                {latihan.description || "Tidak ada deskripsi untuk latihan soal ini."}
                            </p>
                        </div>

                        {/* CTA box */}
                        <div className="bg-[#bed3c6] border-4 border-[#2b1b11] p-4 shadow-[2px_2px_0px_#2b1b11]">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-[#FEFCF3] border-2 border-[#2b1b11] flex items-center justify-center shadow-[2px_2px_0px_#2b1b11]">
                                        <BatteryWarning className="w-5 h-5 text-[#e87a5d] stroke-[2]" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-[#2b1b11]">Siap berlatih?</p>
                                        <p className="text-[10px] text-[#3c5443] font-bold">Tidak ada batas waktu. Pelajari pembahasannya.</p>
                                    </div>
                                </div>
                                {previousSubmission ? (
                                    previousSubmission.status === "IN_PROGRESS" ? (
                                        <Link
                                            href={`/dashboard/latihan/${validId}/practice`}
                                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#e87a5d] text-[#FEFCF3] font-bold text-sm px-6 py-3 border-2 border-[#2b1b11] shadow-[3px_3px_0px_#2b1b11] hover:shadow-[4px_4px_0px_#2b1b11] hover:-translate-y-0.5 transition-all"
                                        >
                                            Lanjutkan Latihan
                                            <ArrowRight className="w-4 h-4 stroke-[3]" />
                                        </Link>
                                    ) : (
                                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                            <Link
                                                href={`/dashboard/latihan/${validId}/discussion`}
                                                className="inline-flex items-center justify-center gap-2 bg-[#FEFCF3] text-[#2b1b11] font-bold text-xs px-4 py-2 border-2 border-[#2b1b11] shadow-[2px_2px_0px_#2b1b11] hover:shadow-[3px_3px_0px_#2b1b11] hover:-translate-y-0.5 transition-all"
                                            >
                                                Lihat Pembahasan
                                            </Link>
                                            <Link
                                                href={`/dashboard/latihan/${validId}/practice`}
                                                className="inline-flex items-center justify-center gap-2 bg-[#e87a5d] text-[#FEFCF3] font-bold text-xs px-4 py-2 border-2 border-[#2b1b11] shadow-[2px_2px_0px_#2b1b11] hover:shadow-[3px_3px_0px_#2b1b11] hover:-translate-y-0.5 transition-all"
                                            >
                                                Ulangi Latihan
                                                <ArrowRight className="w-4 h-4 stroke-[3]" />
                                            </Link>
                                        </div>
                                    )
                                ) : (
                                    <Link
                                        href={`/dashboard/latihan/${validId}/practice`}
                                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#e87a5d] text-[#FEFCF3] font-bold text-sm px-6 py-3 border-2 border-[#2b1b11] shadow-[3px_3px_0px_#2b1b11] hover:shadow-[4px_4px_0px_#2b1b11] hover:-translate-y-0.5 transition-all"
                                    >
                                        Mulai Latihan
                                        <ArrowRight className="w-4 h-4 stroke-[3]" />
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar - info module */}
                <div className="space-y-6">
                    <div className="bg-[#FEFCF3] border-4 border-[#2b1b11] shadow-[4px_4px_0px_#2b1b11]">
                        <div className="border-b-4 border-[#2b1b11] bg-[#bed3c6] px-4 py-3">
                            <h2 className="text-sm font-bold text-[#2b1b11]" style={{ fontFamily: "var(--font-press-start)", fontSize: "0.65rem" }}>Informasi Modul</h2>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-[#bed3c6] border-2 border-[#2b1b11] flex items-center justify-center shadow-[1px_1px_0px_#2b1b11]">
                                    <FileText className="w-4 h-4 text-[#2b1b11] stroke-[2]" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-[#3c5443] font-bold uppercase tracking-wider">Total Soal</p>
                                    <p className="text-sm font-extrabold text-[#2b1b11]">{latihan.questionCount} Butir</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-[#bed3c6] border-2 border-[#2b1b11] flex items-center justify-center shadow-[1px_1px_0px_#2b1b11]">
                                    <BatteryWarning className="w-4 h-4 text-[#e87a5d] stroke-[2]" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-[#3c5443] font-bold uppercase tracking-wider">Status Latihan</p>
                                    <p className="text-sm font-extrabold text-[#2b1b11]">
                                        {previousSubmission 
                                            ? previousSubmission.status === "IN_PROGRESS" 
                                                ? "Sedang dikerjakan" 
                                                : `Selesai ${previousSubmission.score !== null ? `(Skor: ${previousSubmission.score})` : ''}`
                                            : "Belum dimulai"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
