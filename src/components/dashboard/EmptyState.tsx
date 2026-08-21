import React from "react"
import Link from "next/link"

interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="bg-white rounded-3xl shadow-xs border border-[#FFEED6] p-12 sm:p-16 flex flex-col items-center justify-center text-center mt-8">
      {/* Large Icon Placeholder */}
      <div 
        className="w-20 h-20 bg-[#FFEED6] rounded-2xl mb-6 flex items-center justify-center border border-[#827148]/10"
        aria-label="Placeholder illustration"
      >
        <div className="w-8 h-8 rounded-xl bg-[#A5AF79]/40 border border-[#827148]/20" />
      </div>

      {/* Title */}
      <h2 className="text-2xl font-bold text-[#827148] mb-2 tracking-tight">
        {title}
      </h2>

      {/* Description */}
      <p className="text-sm sm:text-base text-[#827148]/70 max-w-md leading-relaxed mb-6">
        {description}
      </p>

      {/* Optional action */}
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="bg-[#A5AF79] hover:bg-[#949e6a] text-white font-semibold text-sm px-6 py-2.5 rounded-xl shadow-xs transition-colors"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  )
}
