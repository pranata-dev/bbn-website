"use client"

import type { RegistrationType } from "@/lib/validators/registration"

interface ProductSelectorProps {
  selected: RegistrationType | null
  onSelect: (type: RegistrationType) => void
}

export function ProductSelector({ selected, onSelect }: ProductSelectorProps) {
  const options = [
    {
      type: "REGULAR" as RegistrationType,
      iconBg: "bg-[#FFEED6]",
      iconInner: "bg-[#827148]",
      title: "Kelas Reguler",
      subtitle: "LIVE CLASS",
      subtitleColor: "text-[#E8A07C]",
      description:
        "Kelas tatap muka/online dengan jadwal fleksibel. Pilih materi dan waktu sesuai kebutuhanmu.",
      badges: ["Jadwal Fleksibel", "Grup/Privat"],
      locked: false,
    },
    {
      type: "UTS" as RegistrationType,
      iconBg: "bg-[#A5AF79]/20",
      iconInner: "bg-[#A5AF79]",
      title: "E-Learning Mandiri",
      subtitle: "SELF-PACED LEARNING",
      subtitleColor: "text-[#A5AF79]",
      description:
        "Akses penuh ke bank soal, materi komprehensif, dan tryout interaktif untuk belajar mandiri kapan saja.",
      badges: ["Bank Soal", "Tryout", "Materi"],
      locked: false,
    },
    {
      type: "KELAS_BESAR" as RegistrationType,
      iconBg: "bg-[#FFEED6]",
      iconInner: "bg-[#827148]",
      title: "Kelas Tutor Besar",
      subtitle: "LIVE CLASS",
      subtitleColor: "text-[#E8A07C]",
      description:
        "Kelas tatap muka/online dengan jadwal fleksibel. Pilih materi dan waktu sesuai kebutuhanmu.",
      badges: ["Jadwal Fleksibel", "Grup/Privat"],
      locked: true,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {options.map((option) => {
        const isSelected = selected === option.type
        const isLocked = option.locked

        return (
          <div
            key={option.type}
            onClick={() => !isLocked && onSelect(option.type)}
            className={`rounded-2xl border-2 p-6 transition-all relative overflow-hidden flex flex-col justify-between ${
              isLocked
                ? "border-[#FFEED6] bg-white cursor-not-allowed"
                : isSelected
                ? "border-[#A5AF79] bg-[#A5AF79]/5 shadow-md -translate-y-0.5 cursor-pointer"
                : "border-[#FFEED6] hover:border-[#A5AF79] bg-white cursor-pointer hover:-translate-y-0.5"
            }`}
          >
            {/* Content (dimmed if locked) */}
            <div className={isLocked ? "opacity-50" : ""}>
              {/* Icon Placeholder */}
              <div
                className={`w-10 h-10 rounded-lg ${option.iconBg} mb-4 flex items-center justify-center border border-[#827148]/10`}
              >
                <div className={`w-3.5 h-3.5 rounded-sm ${option.iconInner}`} />
              </div>

              {/* Title & Subtitle */}
              <h3 className="font-bold text-[#827148] text-lg mb-1 leading-snug">
                {option.title}
              </h3>
              <p className={`text-xs font-bold ${option.subtitleColor} mb-3 uppercase tracking-wider`}>
                {option.subtitle}
              </p>

              {/* Description */}
              <p className="text-sm text-[#827148]/70 mb-4 leading-relaxed">
                {option.description}
              </p>

              {/* Badges Row */}
              <div className="flex flex-wrap gap-2 pt-2">
                {option.badges.map((badge, idx) => (
                  <span
                    key={idx}
                    className="bg-[#FFEED6] text-[#827148] text-xs px-3 py-1 rounded-md font-medium"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>

            {/* Locked Overlay for Option 3 */}
            {isLocked && (
              <div className="absolute inset-0 bg-[#827148]/85 backdrop-blur-xs flex flex-col items-center justify-center text-center p-4 rounded-2xl z-10">
                {/* Lock icon placeholder */}
                <div className="w-8 h-8 rounded-lg bg-white/20 mb-2 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-xs bg-[#E8A07C]" />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white tracking-wide mb-1">
                  KELAS TUTOR BESAR
                </h4>
                <p className="text-xs font-bold text-[#E8A07C] tracking-widest uppercase">
                  COMING SOON
                </p>
              </div>
            )}

            {/* Selection Check Indicator */}
            {isSelected && !isLocked && (
              <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[#A5AF79] flex items-center justify-center text-white text-xs font-bold shadow-2xs">
                ✓
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
