"use client"

import { UTS_PACKAGES } from "@/constants"

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
            className={`relative flex flex-col border-2 border-[#171717] p-5 cursor-pointer transition-all duration-200 ${
              isSelected
                ? "bg-accent-canary/20 shadow-[4px_4px_0px_#171717] -translate-y-0.5"
                : "bg-surface-white hover:bg-canvas-paper shadow-[2px_2px_0px_#171717]"
            }`}
            onClick={() => onSelect(pkg.value)}
          >
            {isPopular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#171717] text-accent-canary text-[9px] font-mono uppercase tracking-wider font-bold py-1 px-3 z-10">
                Paling Populer
              </div>
            )}

            <div className="mb-3">
              <h4 className="text-base font-bold text-[#171717]">
                {pkg.label}
              </h4>
              <p className="text-xs font-medium text-ink-muted leading-tight mt-0.5">
                {pkg.headline}
              </p>
            </div>

            <div className="mb-4">
              <span className="font-mono text-xl font-extrabold text-[#171717]">
                Coming Soon
              </span>
            </div>

            <div className="flex-1 space-y-3 mb-5">
              <p className="text-xs text-ink-muted leading-relaxed border-l-2 border-[#171717] pl-2.5">
                {pkg.description}
              </p>

              <ul className="space-y-2">
                {pkg.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-[#171717] font-medium">
                    <div className="w-2 h-2 bg-[#171717] shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              disabled
              className="w-full py-2.5 border border-[#171717] bg-canvas-paper text-ink-muted font-mono text-xs font-bold uppercase cursor-not-allowed"
            >
              Coming Soon
            </button>
          </div>
        )
      })}
    </div>
  )
}
