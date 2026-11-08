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
    <div className="bg-surface-white border-2 border-dashed border-[#171717] bg-grid-blueprint p-8 sm:p-14 flex flex-col items-center justify-center text-center mt-6 relative tick-corner">
      {/* Blueprint Status Header */}
      <div className="flex items-center gap-2 font-mono text-[11px] font-bold text-ink-muted uppercase tracking-wider mb-5">
        <span className="size-2 bg-alert-rust border border-[#171717]" />
        <span>&gt; STATUS: AWAITING_TELEMETRY // DATA_EMPTY</span>
      </div>

      {/* Decorative Technical Crosshair */}
      <div 
        className="size-16 bg-canvas-paper border-2 border-[#171717] technical-shadow-sm mb-6 flex items-center justify-center"
        aria-hidden="true"
      >
        <span className="font-mono text-2xl font-black text-ink-muted">Ø</span>
      </div>

      {/* Title */}
      <h2 className="font-sans text-xl sm:text-2xl font-black text-[#171717] mb-2 tracking-tight">
        {title}
      </h2>

      {/* Description */}
      <p className="font-sans text-xs sm:text-sm text-ink-muted max-w-md leading-relaxed mb-6 font-normal">
        {description}
      </p>

      {/* Optional action button */}
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="bg-accent-canary hover:bg-[#FDE047]/90 text-[#171717] border-2 border-[#171717] technical-shadow font-mono text-xs font-black px-6 py-2.5 uppercase tracking-wider transition-all inline-flex items-center gap-2"
        >
          <span>{actionLabel}</span>
          <span>&rarr;</span>
        </Link>
      )}
    </div>
  )
}
