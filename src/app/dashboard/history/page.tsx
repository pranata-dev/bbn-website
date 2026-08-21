"use client"

import { PageHeader } from "@/components/dashboard/PageHeader"
import { EmptyState } from "@/components/dashboard/EmptyState"

export default function HistoryPage() {
  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <PageHeader
        title="Riwayat Tryout"
        subtitle="Pantau rekaman dan hasil seluruh tryout serta latihan soal yang pernah kamu kerjakan."
      />

      {/* Empty State View */}
      <EmptyState
        title="Belum Ada Riwayat"
        description="Riwayat tryout akan muncul di sini setelah kamu menyelesaikan tryout pertama."
        actionLabel="Mulai Tryout Pertama"
        actionHref="/dashboard/tryouts"
      />
    </div>
  )
}
