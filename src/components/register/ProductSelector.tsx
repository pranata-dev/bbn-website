"use client"

import { GraduationCap, MonitorPlay, Check, Lock } from "lucide-react"
import type { RegistrationType } from "@/lib/validators/registration"

interface ProductSelectorProps {
    selected: RegistrationType | null
    onSelect: (type: RegistrationType) => void
}

const products = [
    {
        type: "REGULAR" as RegistrationType,
        icon: GraduationCap,
        title: "Kelas Reguler",
        subtitle: "Live Class — Service Based",
        description: "Kelas tatap muka/online dengan jadwal fleksibel. Pilih materi, jumlah pertemuan, dan waktu sesuai kebutuhanmu.",
        features: ["Jadwal fleksibel", "Bisa grup/privat", "Materi custom"],
        locked: false,
    },
    {
        type: "KELAS_BESAR" as RegistrationType,
        icon: MonitorPlay,
        title: "Kelas Tutor Besar",
        subtitle: "Zoom Pembahasan Soal-Soal Ujian Tahun Lalu!",
        description: "Kelas Masterclass intensif via Zoom yang difokuskan untuk membedah tuntas soal-soal ujian tahun lalu.",
        features: ["Akses zoom recording", "Bahas soal tahun lalu", "Tips pengerjaan cepat", "Prediksi soal ujian"],
        locked: true,
    },
]

export function ProductSelector({ selected, onSelect }: ProductSelectorProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {products.map((product) => {
                const isSelected = selected === product.type
                const Icon = product.icon
                const isLocked = product.locked

                return (
                    <button
                        key={product.type}
                        type="button"
                        onClick={() => !isLocked && onSelect(product.type)}
                        disabled={isLocked}
                        className={`relative p-5 text-left transition-all group font-mono border-4 rounded-xl ${isLocked
                            ? "bg-[#2b1b11]/10 border-[#2b1b11]/40 shadow-[4px_4px_0px_#2b1b11]/30 cursor-not-allowed opacity-70"
                            : isSelected
                                ? "bg-[#bed3c6] border-[#2b1b11] shadow-[6px_6px_0px_#2b1b11] -translate-y-1"
                                : "bg-[#FEFCF3] border-[#2b1b11] shadow-[4px_4px_0px_#2b1b11] hover:-translate-y-1 hover:shadow-[6px_6px_0px_#2b1b11]"
                            }`}
                    >
                        {/* Locked overlay */}
                        {isLocked && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 rounded-lg">
                                <div className="bg-[#2b1b11] border-2 border-[#e87a5d] px-4 py-3 shadow-[4px_4px_0px_#e87a5d] text-center">
                                    <Lock className="w-5 h-5 text-[#e87a5d] mx-auto mb-2 stroke-[2.5]" />
                                    <p className="text-[10px] font-bold text-[#FEFCF3] leading-tight tracking-wider" style={{ fontFamily: "var(--font-press-start)" }}>
                                        KELAS TUTOR BESAR
                                    </p>
                                    <p className="text-[10px] font-bold text-[#FEFCF3] leading-tight tracking-wider mt-1" style={{ fontFamily: "var(--font-press-start)" }}>
                                        SESI UAS:
                                    </p>
                                    <p className="text-xs font-bold text-[#e87a5d] mt-1 tracking-wider" style={{ fontFamily: "var(--font-press-start)" }}>
                                        COMING SOON
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Selected indicator */}
                        {isSelected && !isLocked && (
                            <div className="absolute top-3 right-3 w-6 h-6 bg-[#e87a5d] border-2 border-[#2b1b11] flex items-center justify-center shadow-[1px_1px_0px_#2b1b11]">
                                <Check className="w-3 h-3 text-[#FEFCF3] stroke-[3]" />
                            </div>
                        )}

                        {/* Icon */}
                        <div className={`w-10 h-10 flex items-center justify-center mb-3 border-2 border-[#2b1b11] shadow-[2px_2px_0px_#2b1b11] ${isLocked
                            ? "bg-[#2b1b11]/20 text-[#2b1b11]/40"
                            : isSelected
                                ? "bg-[#2b1b11] text-[#FEFCF3]"
                                : "bg-[#bed3c6] text-[#2b1b11]"
                            }`}>
                            <Icon className="w-5 h-5 stroke-[2]" />
                        </div>

                        {/* Content */}
                        <h3 className={`text-sm font-bold mb-1 ${isLocked ? "text-[#2b1b11]/40" : "text-[#2b1b11]"}`}>
                            {product.title}
                        </h3>
                        <p className={`text-[10px] font-bold mb-2 uppercase tracking-wider ${isLocked ? "text-[#e87a5d]/40" : "text-[#e87a5d]"}`}>
                            {product.subtitle}
                        </p>
                        <p className={`text-xs leading-relaxed mb-4 font-semibold ${isLocked ? "text-[#3c5443]/30" : "text-[#3c5443]"}`}>
                            {product.description}
                        </p>

                        {/* Features */}
                        <div className={`flex flex-wrap gap-2 ${isLocked ? "opacity-30" : ""}`}>
                            {product.features.map((feature) => (
                                <span
                                    key={feature}
                                    className={`text-[10px] px-2 py-1 font-bold border border-[#2b1b11] ${isSelected && !isLocked
                                        ? "bg-[#2b1b11] text-[#FEFCF3]"
                                        : "bg-[#bed3c6] text-[#2b1b11]"
                                        }`}
                                >
                                    {feature}
                                </span>
                            ))}
                        </div>
                    </button>
                )
            })}
        </div>
    )
}
