import type { CourseTrack } from "@/config/plans"
import { escapeHtml, sanitizeHttpsUrl } from "@/lib/html-escape"

export type ApprovalRegistrationType = "REGULAR" | "UTS" | "KELAS_BESAR"
export type PaidApprovalPlanCode = "MONTHLY" | "SEMESTER"

export const ALL_COURSE_TRACKS: readonly CourseTrack[] = ["PHYSICS_SEM_3", "NON_PHYSICS", "LEGACY", "ALL"] as const

const PLAN_DURATION_DAYS: Record<PaidApprovalPlanCode, number> = {
    MONTHLY: 30,
    SEMESTER: 180,
}

const DAY_MS = 86_400_000

export function resolveApprovalTrack(rawTrack: string | null | undefined): CourseTrack {
    const normalized = (rawTrack || "").trim().toUpperCase()
    if (normalized === "NON_PHYSICS" || normalized === "ALL" || normalized === "LEGACY") {
        return normalized
    }
    return "PHYSICS_SEM_3"
}

/** Tracks whose ACTIVE subscriptions are superseded by a new paid subscription on `target`. */
export function resolveCancellationTracks(target: CourseTrack): CourseTrack[] {
    return target === "ALL" ? [...ALL_COURSE_TRACKS] : [target]
}

export interface SubscriptionStatusLike {
    status: string
    expires_at: string | null
}

export function hasLiveSubscription(rows: SubscriptionStatusLike[], now: Date): boolean {
    return rows.some((row) => {
        if (row.status !== "ACTIVE") return false
        if (!row.expires_at) return true
        const expiresMs = Date.parse(row.expires_at)
        return Number.isFinite(expiresMs) && expiresMs > now.getTime()
    })
}

export interface ResolveApprovalProvisioningInput {
    type: string
    planCode: string | null | undefined
    track: string | null | undefined
    hasLiveSubscription: boolean
    now: Date
}

export type ApprovalProvisioning =
    | {
          ok: true
          kind: "PAID"
          planCode: PaidApprovalPlanCode
          track: CourseTrack
          startsAt: string
          expiresAt: string
          cancelTracks: CourseTrack[]
      }
    | { ok: true; kind: "FREE_BASELINE"; track: CourseTrack; startsAt: string }
    | { ok: true; kind: "NONE" }
    | { ok: false; status: 400; error: string }

/**
 * Subscription provisioning rules for an approved registration.
 * - UTS: MONTHLY (30 days) or SEMESTER (180 days) on the registration track.
 * - KELAS_BESAR and REGULAR: never provision a paid plan; add a FREE baseline only when
 *   the user has no live subscription.
 */
export function resolveApprovalProvisioning(input: ResolveApprovalProvisioningInput): ApprovalProvisioning {
    const type = (input.type || "").trim().toUpperCase()
    const track = resolveApprovalTrack(input.track)
    const startsAt = input.now.toISOString()

    if (type === "UTS") {
        const planCode = (input.planCode || "").trim().toUpperCase()
        if (planCode !== "MONTHLY" && planCode !== "SEMESTER") {
            return {
                ok: false,
                status: 400,
                error: "Kode paket pendaftaran UTS tidak valid untuk disetujui.",
            }
        }
        const expiresAt = new Date(input.now.getTime() + PLAN_DURATION_DAYS[planCode] * DAY_MS).toISOString()
        return {
            ok: true,
            kind: "PAID",
            planCode,
            track,
            startsAt,
            expiresAt,
            cancelTracks: resolveCancellationTracks(track),
        }
    }

    if (type === "KELAS_BESAR" || type === "REGULAR") {
        if (input.hasLiveSubscription) return { ok: true, kind: "NONE" }
        return { ok: true, kind: "FREE_BASELINE", track, startsAt }
    }

    return { ok: false, status: 400, error: "Tipe pendaftaran tidak dikenali." }
}

const SUBJECT_LABELS: Record<string, string> = {
    FISMAT: "Fisika-Matematika",
    FISDAS2: "Fisika Dasar 2",
}

export function resolveSubjectLabel(subject: string | null | undefined): string {
    const normalized = (subject || "").trim()
    return SUBJECT_LABELS[normalized.toUpperCase()] ?? normalized
}

export interface ScheduleFields {
    scheduled_date?: string | null
    scheduled_time?: string | null
}

/** Configured schedule first, then registration schedule fields, otherwise null. */
export function resolveMasterclassSchedule(
    configuredSchedule: string | null | undefined,
    registration: ScheduleFields
): string | null {
    const configured = (configuredSchedule || "").trim()
    if (configured) return configured
    const date = (registration.scheduled_date || "").trim()
    const time = (registration.scheduled_time || "").trim()
    if (date && time) return `${date} pukul ${time} WIB`
    if (date) return date
    return null
}

export interface ApprovalEmailInput {
    type: ApprovalRegistrationType
    name: string
    subject: string | null
    planCode: PaidApprovalPlanCode | null
    zoomLink: string | null
    schedule: string | null
    appUrl: string
}

export interface ApprovalEmail {
    subject: string
    html: string
}

const BUTTON_STYLE =
    "background-color: #4A3C31; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;"

export function buildApprovalEmail(input: ApprovalEmailInput): ApprovalEmail {
    const safeName = escapeHtml(input.name)

    if (input.type === "KELAS_BESAR") {
        const zoomUrl = sanitizeHttpsUrl(input.zoomLink)
        const safeSubject = escapeHtml(resolveSubjectLabel(input.subject))
        const safeSchedule = escapeHtml(input.schedule || "Akan diinformasikan oleh admin melalui WhatsApp.")
        const zoomBlock = zoomUrl
            ? `<a href="${escapeHtml(zoomUrl)}" style="${BUTTON_STYLE}">Klik untuk Bergabung ke Zoom</a>
                    </div>
                    <p style="font-size: 12px; color: #666; line-height: 1.5;">Jika tombol di atas tidak berfungsi, kamu juga bisa menyalin link berikut ke browsermu:<br/>
                    <span style="color: #4A3C31; word-break: break-all;">${escapeHtml(zoomUrl)}</span></p>`
            : `<p style="margin: 0; font-size: 14px;">Link Zoom akan dikirim oleh admin melalui WhatsApp.</p>
                    </div>`

        return {
            subject: "Link Zoom Masterclass Belajar Bareng Nata",
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <h2 style="color: #4A3C31;">Halo, ${safeName}!</h2>
                    <p>Pembayaran kamu untuk <strong>Kelas Tutor Besar (Masterclass)</strong> telah berhasil diverifikasi.</p>
                    <p>Berikut adalah detail pendaftaran dan link Zoom untuk sesi masterclass kamu:</p>
                    <div style="background-color: #FDFBF7; border: 1px solid #EFE8DF; padding: 25px; border-radius: 16px; margin: 25px 0;">
                        <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Mata Kuliah:</strong> ${safeSubject}</p>
                        <p style="margin: 0 0 25px 0; font-size: 14px;"><strong>Jadwal:</strong> ${safeSchedule}</p>
                    ${zoomBlock}
                    <br/>
                    <p>Selamat belajar dan semoga sukses!<br/><strong>Tim Belajar Bareng Nata</strong></p>
                </div>
            `,
        }
    }

    const loginUrl = sanitizeHttpsUrl(`${input.appUrl.replace(/\/+$/, "")}/login`) ?? "https://belajarbarengnata.com/login"
    const packageLine =
        input.type === "UTS" && input.planCode
            ? `paket <strong>${input.planCode === "MONTHLY" ? "Bulanan" : "Semester"}</strong>`
            : "<strong>Kelas Reguler</strong>"

    return {
        subject: "Akun Belajar Bareng Nata Telah Aktif!",
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #4A3C31;">Halo, ${safeName}!</h2>
                <p>Pembayaran kamu untuk ${packageLine} telah berhasil diverifikasi oleh Admin.</p>
                <p>Akun kamu kini sudah <strong>AKTIF</strong> dan kamu dapat langsung masuk ke dashboard belajar.</p>
                <br/>
                <a href="${escapeHtml(loginUrl)}" style="background-color: #4A3C31; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Login ke Dashboard</a>
                <br/><br/>
                <p>Selamat belajar dan semoga sukses!<br/>Tim Belajar Bareng Nata</p>
            </div>
        `,
    }
}

