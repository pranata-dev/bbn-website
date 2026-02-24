"use client"

import { Check } from "lucide-react"
import { UTS_PACKAGES, type UTSPackage } from "@/constants"
import { formatRupiah } from "@/lib/pricing"

interface UTSPackageSelectorProps {
    selected: string
    onSelect: (value: string) => void
}

export function UTSPackageSelector({ selected, onSelect }: UTSPackageSelectorProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {UTS_PACKAGES.map((pkg) => {
                const isSelected = selected === pkg.value
                const isPopular = pkg.isPopular

                return (
                    <div
                        key={pkg.value}
                        className={`relative flex flex-col rounded-2xl border-2 p-6 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isSelected
                                ? "border-dark-brown bg-dark-brown/[0.02] shadow-2xl scale-105 -translate-y-2 z-10"
                                : "border-warm-gray bg-white/50 hover:border-soft-brown/40 hover:scale-[1.03] hover:-translate-y-1 hover:shadow-lg"
                            }`}
                        onClick={() => onSelect(pkg.value)}
                    >
                        {isPopular && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#8B7E74] text-cream text-[9px] uppercase tracking-wider font-medium py-1 px-3.5 rounded-full shadow-sm z-20 border border-white/10 animate-badge-pop">
                                MOST POPULAR
                            </div>
                        )}

                        <div className="mb-4">
                            <h3 className="text-lg font-bold text-foreground">
                                {pkg.label}
                            </h3>
                            <p className="text-sm font-semibold text-soft-brown leading-tight mt-1">
                                {pkg.headline}
                            </p>
                        </div>

                        <div className="mb-6">
                            <span className="text-2xl font-black text-dark-brown">
                                {formatRupiah(pkg.price)}
                            </span>
                            <span className="text-xs text-muted-foreground ml-1">
                                / paket
                            </span>
                        </div>

                        <div className="flex-1 space-y-4 mb-6">
                            <p className="text-xs text-muted-foreground leading-relaxed italic border-l-2 border-warm-gray pl-3">
                                {pkg.description}
                            </p>

                            <ul className="space-y-2.5">
                                {pkg.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-2.5 text-[11px] leading-snug text-foreground/80">
                                        <div className="mt-0.5 w-3.5 h-3.5 rounded-full bg-dark-brown/10 flex items-center justify-center flex-shrink-0">
                                            <Check className="w-2.5 h-2.5 text-dark-brown" />
                                        </div>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <button
                            type="button"
                            className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${isSelected
                                ? "bg-dark-brown text-cream shadow-sm"
                                : "bg-warm-beige text-dark-brown hover:bg-soft-brown/20"
                                }`}
                        >
                            {isSelected ? "Paket Terpilih" : "Pilih Paket"}
                        </button>
                    </div>
                )
            })}
        </div>
    )
}
