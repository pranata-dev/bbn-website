import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { createServiceClient } from "@/lib/supabase/server"
import { parseUtcTimestamp } from "@/lib/timestamp"

export const dynamic = "force-dynamic"

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"]

function formatAuditTime(timestamp: string): string {
    const ms = parseUtcTimestamp(timestamp)
    if (ms === null) return "--:--"
    return new Date(ms).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
    })
}

export async function GET() {
    const guard = await requireAdmin()
    if (!guard.ok) return guard.response

    try {
        const adminSupabase = createServiceClient()
        const sixMonthsAgo = new Date()
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
        const sixMonthsAgoIso = sixMonthsAgo.toISOString()

        const [
            { data: recentWindowSubs },
            { data: recentWindowUsers },
            { data: topPerfRows, error: topPerfError },
            { data: recentRegs },
            { data: recentSubs },
            { count: totalUsers },
            { count: activeUsers },
            { count: pendingPaymentsCount },
            { count: activeTryoutsCount },
            { data: approvedRegs },
            { data: finishedTryoutScores },
        ] = await Promise.all([
            adminSupabase
                .from("submissions")
                .select("created_at, tryouts(is_practice)")
                .in("status", ["SUBMITTED", "TIMED_OUT", "COMPLETED"])
                .gte("created_at", sixMonthsAgoIso)
                .order("created_at", { ascending: true }),
            adminSupabase
                .from("users")
                .select("created_at")
                .gte("created_at", sixMonthsAgoIso)
                .order("created_at", { ascending: true }),
            adminSupabase.rpc("get_top_tryout_performers", { p_limit: 5 }),
            adminSupabase
                .from("registrations")
                .select("id, name, email, status, plan_code, track, created_at, updated_at")
                .order("updated_at", { ascending: false })
                .limit(8),
            adminSupabase
                .from("submissions")
                .select("id, status, score, submitted_at, started_at, users(name), tryouts(title, is_practice)")
                .order("started_at", { ascending: false })
                .limit(8),
            adminSupabase.from("users").select("*", { count: "exact", head: true }),
            adminSupabase.from("users").select("*", { count: "exact", head: true }).eq("is_active", true),
            adminSupabase
                .from("registrations")
                .select("*", { count: "exact", head: true })
                .eq("status", "PENDING"),
            adminSupabase
                .from("tryouts")
                .select("*", { count: "exact", head: true })
                .eq("is_practice", false)
                .eq("status", "ACTIVE"),
            adminSupabase
                .from("registrations")
                .select("calculated_price")
                .eq("status", "APPROVED"),
            adminSupabase
                .from("submissions")
                .select("score, tryouts!inner(is_practice)")
                .eq("tryouts.is_practice", false)
                .in("status", ["SUBMITTED", "TIMED_OUT", "COMPLETED"]),
        ])

        if (topPerfError) {
            console.error("get_top_tryout_performers RPC error:", topPerfError)
        }

        const chartMap: Record<string, { tryout: number; latihan: number; users: number }> = {}
        for (let i = 5; i >= 0; i--) {
            const d = new Date()
            d.setMonth(d.getMonth() - i)
            const key = `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`
            chartMap[key] = { tryout: 0, latihan: 0, users: 0 }
        }

        for (const sub of recentWindowSubs || []) {
            const ms = parseUtcTimestamp(sub.created_at)
            if (ms === null) continue
            const date = new Date(ms)
            const key = `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`
            const tryoutRaw = sub.tryouts as unknown as { is_practice?: boolean } | { is_practice?: boolean }[] | null
            const tryout = Array.isArray(tryoutRaw) ? tryoutRaw[0] : tryoutRaw
            if (chartMap[key]) {
                if (tryout?.is_practice) {
                    chartMap[key].latihan += 1
                } else {
                    chartMap[key].tryout += 1
                }
            }
        }

        for (const u of recentWindowUsers || []) {
            const ms = parseUtcTimestamp(u.created_at)
            if (ms === null) continue
            const date = new Date(ms)
            const key = `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`
            if (chartMap[key]) {
                chartMap[key].users += 1
            }
        }

        const chartData = Object.entries(chartMap).map(([month, counts]) => ({
            month,
            tryout: counts.tryout,
            latihan: counts.latihan,
        }))

        const trends = {
            userGrowth: Object.entries(chartMap).map(([name, counts]) => ({
                name,
                total: counts.users,
            })),
            completions: Object.entries(chartMap).map(([name, counts]) => ({
                name,
                total: counts.tryout,
            })),
        }

        const totalRevenue = (approvedRegs || []).reduce(
            (sum, row) => sum + (Number(row.calculated_price) || 0),
            0
        )
        const totalCompletions = (finishedTryoutScores || []).length
        const avgScore =
            totalCompletions > 0
                ? Math.round(
                      ((finishedTryoutScores || []).reduce((sum, row) => sum + (Number(row.score) || 0), 0) /
                          totalCompletions) *
                          10
                  ) / 10
                : 0

        const topPerformers = (topPerfRows || []).map((row, index) => {
            const numericScore = Number(row.highest_score) || 0
            return {
                rank: index + 1,
                userId: row.user_id,
                userName: row.user_name,
                name: row.user_name,
                email: row.user_email,
                avatarUrl: row.avatar_url,
                highestScore: numericScore,
                score: Math.round(numericScore),
                tryoutTitle: row.tryout_title,
            }
        })

        const auditLogs: Array<{
            id: string
            timestamp: string
            time: string
            tag: string
            category: string
            message: string
            variant: "success" | "warning" | "info"
        }> = []

        for (const r of recentRegs || []) {
            const ts = r.updated_at || r.created_at
            const tag =
                r.status === "APPROVED"
                    ? "BILLING // APPROVED"
                    : r.status === "REJECTED"
                      ? "BILLING // REJECTED"
                      : "REG // PENDING"
            auditLogs.push({
                id: `reg-${r.id}`,
                timestamp: ts,
                time: formatAuditTime(ts),
                tag,
                category: tag,
                message: `${r.name} (${r.email}) - Paket ${r.plan_code || "KELAS"} [${r.status}]`,
                variant: r.status === "APPROVED" ? "success" : r.status === "REJECTED" ? "warning" : "info",
            })
        }

        for (const s of recentSubs || []) {
            const uRaw = s.users as unknown as { name?: string } | { name?: string }[] | null
            const tRaw = s.tryouts as unknown as
                | { title?: string; is_practice?: boolean }
                | { title?: string; is_practice?: boolean }[]
                | null
            const u = Array.isArray(uRaw) ? uRaw[0] : uRaw
            const t = Array.isArray(tRaw) ? tRaw[0] : tRaw
            const ts = s.submitted_at || s.started_at
            const tag = t?.is_practice ? "LATIHAN // CBT" : "TRYOUT // CBT"
            auditLogs.push({
                id: `sub-${s.id}`,
                timestamp: ts,
                time: formatAuditTime(ts),
                tag,
                category: tag,
                message: `${u?.name || "Siswa"} - ${t?.title || "Simulasi"} (${s.status}${s.score !== null ? `, Skor: ${Math.round(s.score)}` : ""})`,
                variant: s.status === "SUBMITTED" ? "success" : "info",
            })
        }

        auditLogs.sort((a, b) => (parseUtcTimestamp(b.timestamp) ?? 0) - (parseUtcTimestamp(a.timestamp) ?? 0))

        return NextResponse.json({
            kpi: {
                totalUsers: totalUsers || 0,
                activeUsers: activeUsers || 0,
                pendingPaymentsCount: pendingPaymentsCount || 0,
                activeTryoutsCount: activeTryoutsCount || 0,
                totalRevenue,
                avgScore,
                totalCompletions,
            },
            trends,
            chartData,
            topPerformers,
            auditLogs: auditLogs.slice(0, 10),
        })
    } catch (error) {
        console.error("Admin dashboard API error:", error)
        return NextResponse.json({ error: "Internal error" }, { status: 500 })
    }
}
