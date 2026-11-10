import { Loader2 } from "lucide-react"

export default function AdminLoading() {
    return (
        <div className="flex flex-col items-center justify-center py-24 gap-3 font-mono text-xs text-ink-muted">
            <Loader2 className="w-7 h-7 animate-spin text-[#171717]" />
            <span>[MEMUAT TELEMETRI ADMIN...]</span>
        </div>
    )
}

