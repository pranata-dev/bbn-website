import React from "react"

interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-xs border border-[#FFEED6] mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#827148] tracking-tight mb-1">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm sm:text-base text-[#827148]/70 font-medium">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
