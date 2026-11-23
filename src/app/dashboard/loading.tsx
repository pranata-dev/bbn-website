import { Loader2 } from "lucide-react"

export default function DashboardLoading() {
    return (
        <div className="flex flex-col items-center justify-center py-24 gap-3 font-mono text-xs text-ink-muted">
            <Loader2 className="w-7 h-7 animate-spin text-[#171717] dark:text-[#FDE047]" />
            <span>[MEMUAT MODUL DASHBOARD...]</span>
        </div>
    )
}

