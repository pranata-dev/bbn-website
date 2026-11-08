import React from "react"

interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
  breadcrumb?: string
}

export function PageHeader({ title, subtitle, action, breadcrumb }: PageHeaderProps) {
  const defaultPath = breadcrumb || `~/bbn-edu/student/${title.toLowerCase().replace(/[^a-z0-9]/g, "-")}/`

  return (
    <div className="bg-surface-white border-2 border-[#171717] technical-shadow p-5 sm:p-6 mb-8 border-b-4 border-b-[#171717]">
      {/* Terminal Input / Filepath Breadcrumb */}
      <div className="flex items-center justify-between border-b border-border-grid pb-2.5 mb-3 font-mono text-xs">
        <div className="flex items-center gap-2 truncate text-ink-muted">
          <span className="text-alert-rust font-bold">&gt;</span>
          <span className="text-[#171717] font-semibold truncate">{defaultPath}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 pl-2">
          <span className="size-2 bg-accent-canary border border-[#171717] inline-block" />
          <span className="text-[10px] uppercase tracking-wider text-ink-muted hidden sm:inline">SYS_ACTIVE</span>
        </div>
      </div>

      {/* Main Title & Action Cluster */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-sans text-2xl sm:text-3xl font-extrabold text-[#171717] tracking-tight leading-snug">
            {title}
          </h1>
          {subtitle && (
            <p className="font-sans text-xs sm:text-sm text-ink-muted font-normal mt-1 leading-relaxed max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="shrink-0 pt-2 sm:pt-0">{action}</div>}
      </div>
    </div>
  )
}
