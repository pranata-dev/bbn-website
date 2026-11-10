import { Loader2 } from "lucide-react"

export default function DashboardLoading() {
    return (
        <div className="flex flex-col items-center justify-center py-24 gap-3 font-mono text-xs text-[#71717A]">
            <Loader2 className="w-7 h-7 animate-spin text-[#18181B]" />
            <span>[MEMUAT MODUL DASHBOARD...]</span>
        </div>
    )
}

