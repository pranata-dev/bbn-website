"use client"

import { GraduationCap, Rocket } from "lucide-react"
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
    },
    {
        type: "UTS" as RegistrationType,
        icon: Rocket,
        title: "Persiapan UTS",
        subtitle: "Digital SaaS Product",
        description: "Paket persiapan ujian tengah semester dengan tryout, pembahasan soal, dan analisis performa.",
        features: ["Tryout online", "Pembahasan lengkap", "Analisis performa"],
    },
]

export function ProductSelector({ selected, onSelect }: ProductSelectorProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.map((product) => {
                const isSelected = selected === product.type
                const Icon = product.icon

                return (
                    <button
                        key={product.type}
                        type="button"
                        onClick={() => onSelect(product.type)}
                        className={`relative p-6 rounded-2xl border-2 text-left transition-all duration-300 group hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dark-brown/50 ${isSelected
                            ? "border-dark-brown bg-dark-brown/[0.03] shadow-md shadow-soft-brown/10"
                            : "border-warm-gray hover:border-soft-brown/40 hover:shadow-sm"
                            }`}
                    >
                        {/* Selected indicator */}
                        {isSelected && (
                            <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-dark-brown flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-cream" />
                            </div>
                        )}

                        {/* Icon */}
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${isSelected
                            ? "bg-dark-brown text-cream"
                            : "bg-warm-beige text-soft-brown group-hover:bg-soft-brown/15"
                            }`}>
                            <Icon className="w-6 h-6" />
                        </div>

                        {/* Content */}
                        <h3 className="text-base font-semibold text-foreground mb-1">
                            {product.title}
                        </h3>
                        <p className="text-xs text-muted-foreground font-medium mb-2">
                            {product.subtitle}
                        </p>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                            {product.description}
                        </p>

                        {/* Features */}
                        <div className="flex flex-wrap gap-2">
                            {product.features.map((feature) => (
                                <span
                                    key={feature}
                                    className={`text-xs px-2.5 py-1 rounded-full transition-colors ${isSelected
                                        ? "bg-dark-brown/10 text-dark-brown"
                                        : "bg-warm-beige text-muted-foreground"
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
