import { describe, it, expect } from "vitest"
import {
    buildApprovalEmail,
    hasLiveSubscription,
    resolveApprovalProvisioning,
    resolveApprovalTrack,
    resolveCancellationTracks,
    resolveMasterclassSchedule,
} from "./billing-approval"

describe("billing-approval", () => {
    const now = new Date("2026-04-01T10:00:00Z")

    describe("resolveApprovalTrack and resolveCancellationTracks", () => {
        it("preserves NON_PHYSICS, ALL, and LEGACY tracks instead of coercing to PHYSICS_SEM_3", () => {
            expect(resolveApprovalTrack("ALL")).toBe("ALL")
            expect(resolveApprovalTrack("LEGACY")).toBe("LEGACY")
            expect(resolveApprovalTrack("NON_PHYSICS")).toBe("NON_PHYSICS")
            expect(resolveApprovalTrack("PHYSICS_SEM_3")).toBe("PHYSICS_SEM_3")
            expect(resolveApprovalTrack(null)).toBe("PHYSICS_SEM_3")
        })

        it("scopes cancellation strictly to the target track unless target is ALL", () => {
            expect(resolveCancellationTracks("NON_PHYSICS")).toEqual(["NON_PHYSICS"])
            expect(resolveCancellationTracks("PHYSICS_SEM_3")).toEqual(["PHYSICS_SEM_3"])
            expect(resolveCancellationTracks("ALL")).toEqual([
                "PHYSICS_SEM_3",
                "NON_PHYSICS",
                "LEGACY",
                "ALL",
            ])
        })
    })

    describe("resolveApprovalProvisioning", () => {
        it("provisions 30-day MONTHLY and 180-day SEMESTER only for UTS registrations", () => {
            const monthly = resolveApprovalProvisioning({
                type: "UTS",
                planCode: "MONTHLY",
                track: "NON_PHYSICS",
                hasLiveSubscription: false,
                now,
            })
            expect(monthly).toEqual({
                ok: true,
                kind: "PAID",
                planCode: "MONTHLY",
                track: "NON_PHYSICS",
                startsAt: "2026-04-01T10:00:00.000Z",
                expiresAt: "2026-05-01T10:00:00.000Z",
                cancelTracks: ["NON_PHYSICS"],
            })

            const semesterAll = resolveApprovalProvisioning({
                type: "UTS",
                planCode: "SEMESTER",
                track: "ALL",
                hasLiveSubscription: true,
                now,
            })
            expect(semesterAll.ok).toBe(true)
            if (semesterAll.ok && semesterAll.kind === "PAID") {
                expect(semesterAll.planCode).toBe("SEMESTER")
                expect(semesterAll.track).toBe("ALL")
                expect(semesterAll.expiresAt).toBe("2026-09-28T10:00:00.000Z")
                expect(semesterAll.cancelTracks).toContain("PHYSICS_SEM_3")
                expect(semesterAll.cancelTracks).toContain("NON_PHYSICS")
            }
        })

        it("rejects UTS registrations with invalid or missing paid plan codes", () => {
            const bad = resolveApprovalProvisioning({
                type: "UTS",
                planCode: "FREE",
                track: "PHYSICS_SEM_3",
                hasLiveSubscription: false,
                now,
            })
            expect(bad.ok).toBe(false)
            if (!bad.ok) {
                expect(bad.status).toBe(400)
            }
        })

        it("never provisions SEMESTER or MONTHLY for KELAS_BESAR or REGULAR registrations", () => {
            const kelasBesarNew = resolveApprovalProvisioning({
                type: "KELAS_BESAR",
                planCode: "SEMESTER",
                track: "PHYSICS_SEM_3",
                hasLiveSubscription: false,
                now,
            })
            expect(kelasBesarNew).toEqual({
                ok: true,
                kind: "FREE_BASELINE",
                track: "PHYSICS_SEM_3",
                startsAt: "2026-04-01T10:00:00.000Z",
            })

            const kelasBesarExisting = resolveApprovalProvisioning({
                type: "KELAS_BESAR",
                planCode: null,
                track: "PHYSICS_SEM_3",
                hasLiveSubscription: true,
                now,
            })
            expect(kelasBesarExisting).toEqual({ ok: true, kind: "NONE" })

            const regularNew = resolveApprovalProvisioning({
                type: "REGULAR",
                planCode: null,
                track: "NON_PHYSICS",
                hasLiveSubscription: false,
                now,
            })
            expect(regularNew).toEqual({
                ok: true,
                kind: "FREE_BASELINE",
                track: "NON_PHYSICS",
                startsAt: "2026-04-01T10:00:00.000Z",
            })
        })
    })

    describe("hasLiveSubscription", () => {
        it("detects active non-expired and open-ended subscriptions", () => {
            expect(
                hasLiveSubscription(
                    [{ status: "ACTIVE", expires_at: "2026-03-01T00:00:00Z" }],
                    now
                )
            ).toBe(false)
            expect(
                hasLiveSubscription([{ status: "ACTIVE", expires_at: null }], now)
            ).toBe(true)
            expect(
                hasLiveSubscription(
                    [{ status: "ACTIVE", expires_at: "2026-05-01T00:00:00Z" }],
                    now
                )
            ).toBe(true)
        })
    })

    describe("resolveMasterclassSchedule and buildApprovalEmail", () => {
        it("prefers configured schedule, falls back to registration fields, then null", () => {
            expect(
                resolveMasterclassSchedule("Sabtu, 10 Mei 2026 pukul 19:00 WIB", {
                    scheduled_date: "2026-05-12",
                    scheduled_time: "20:00",
                })
            ).toBe("Sabtu, 10 Mei 2026 pukul 19:00 WIB")
            expect(
                resolveMasterclassSchedule("", {
                    scheduled_date: "2026-05-12",
                    scheduled_time: "20:00",
                })
            ).toBe("2026-05-12 pukul 20:00 WIB")
            expect(resolveMasterclassSchedule("", {})).toBeNull()
        })

        it("HTML-escapes user name, subject, and schedule, and rejects javascript: zoom links", () => {
            const email = buildApprovalEmail({
                type: "KELAS_BESAR",
                name: `<script>alert("xss")</script> & Nata`,
                subject: `<img src=x onerror=alert(1)>`,
                planCode: null,
                zoomLink: "javascript:alert(1)",
                schedule: `<b>Besok</b>`,
                appUrl: "https://belajarbarengnata.com",
            })

            expect(email.html).not.toContain("<script>")
            expect(email.html).not.toContain("<img")
            expect(email.html).not.toContain("javascript:")
            expect(email.html).toContain("&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt; &amp; Nata")
            expect(email.html).toContain("&lt;img src=x onerror=alert(1)&gt;")
            expect(email.html).toContain("&lt;b&gt;Besok&lt;/b&gt;")
            expect(email.html).toContain("Link Zoom akan dikirim oleh admin melalui WhatsApp.")
        })

        it("renders safe https zoom links and UTS plan labels", () => {
            const masterclass = buildApprovalEmail({
                type: "KELAS_BESAR",
                name: "Budi",
                subject: "FISMAT",
                planCode: null,
                zoomLink: "https://zoom.us/j/999888?pwd=xyz",
                schedule: "Sabtu, 10 Mei 2026 pukul 19:00 WIB",
                appUrl: "https://belajarbarengnata.com",
            })
            expect(masterclass.html).toContain("Fisika-Matematika")
            expect(masterclass.html).toContain(`href="https://zoom.us/j/999888?pwd=xyz"`)

            const uts = buildApprovalEmail({
                type: "UTS",
                name: "Ani",
                subject: "Fisika Smt 3",
                planCode: "MONTHLY",
                zoomLink: null,
                schedule: null,
                appUrl: "https://belajarbarengnata.com",
            })
            expect(uts.html).toContain("Bulanan")
            expect(uts.html).toContain(`href="https://belajarbarengnata.com/login"`)
        })
    })
})

