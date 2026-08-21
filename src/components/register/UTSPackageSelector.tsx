"use client"

import { UTS_PACKAGES } from "@/constants"
import { formatRupiah } from "@/lib/pricing"

interface UTSPackageSelectorProps {
  selected: string
  onSelect: (value: string) => void
}

export function UTSPackageSelector({ selected, onSelect }: UTSPackageSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 font-sans">
      {UTS_PACKAGES.map((pkg) => {
        const isSelected = selected === pkg.value
        const isPopular = pkg.isPopular

        return (
          <div
            key={pkg.value}
            className={`relative flex flex-col rounded-2xl border-2 p-5 cursor-pointer transition-all duration-200 ${
              isSelected
                ? "border-[#A5AF79] bg-[#A5AF79]/5 shadow-md -translate-y-1"
                : "border-[#FFEED6] bg-white hover:border-[#A5AF79] hover:-translate-y-0.5"
            }`}
            onClick={() => onSelect(pkg.value)}
          >
            {isPopular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#E8A07C] text-white text-[9px] uppercase tracking-wider font-bold py-1 px-3 rounded-full shadow-xs z-10">
                Paling Populer
              </div>
            )}

            <div className="mb-3">
              <h4 className="text-base font-bold text-[#827148]">
                {pkg.label}
              </h4>
              <p className="text-xs font-semibold text-[#827148]/70 leading-tight mt-0.5">
                {pkg.headline}
              </p>
            </div>

            <div className="mb-4">
              <div className="flex flex-col">
                {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center text-[10px] font-bold bg-[#E8A07C] text-white px-1.5 py-0.5 rounded-sm">
                      Hemat {Math.round(((pkg.originalPrice - pkg.price) / pkg.originalPrice) * 100)}%
                    </span>
                    <span className="line-through text-[#827148]/50 text-xs">
                      {formatRupiah(pkg.originalPrice)}
                    </span>
                  </div>
                )}
                <div className="flex items-baseline">
                  <span className="text-xl font-extrabold text-[#827148]">
                    {formatRupiah(pkg.price)}
                  </span>
                  <span className="text-[11px] text-[#827148]/60 ml-1 font-medium">
                    / paket
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-3 mb-5">
              <p className="text-xs text-[#827148]/75 leading-relaxed italic border-l-2 border-[#FFEED6] pl-2.5">
                {pkg.description}
              </p>

              <ul className="space-y-2">
                {pkg.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-[#827148] font-medium">
                    <div className="w-4 h-4 rounded-full bg-[#A5AF79]/20 flex items-center justify-center shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#A5AF79]" />
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                isSelected
                  ? "bg-[#A5AF79] text-white shadow-xs"
                  : "bg-[#FFEED6]/40 text-[#827148] hover:bg-[#FFEED6]"
              }`}
            >
              {isSelected ? "Paket Terpilih ✓" : "Pilih Paket"}
            </button>
          </div>
        )
      })}
    </div>
  )
}
