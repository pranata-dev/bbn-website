import { NextRequest, NextResponse } from "next/server"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import { UTS_PACKAGES } from "@/constants"
import { checkRateLimit } from "@/lib/rate-limit"
import { calculatePrice } from "@/lib/pricing"
import { getPlanByCode, SUBSCRIPTION_PLANS } from "@/config/plans"
import { validateImageUpload } from "@/lib/file-validation"
import { normalizeRegistrationTrack } from "@/lib/register-security"

const ACCEPTED_TYPES = ["REGULAR", "UTS", "KELAS_BESAR"] as const
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const TIME_PATTERN = /^[0-2][0-9]:[0-5][0-9]$/

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user || !user.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const rateLimitResponse = await checkRateLimit(request, {
            namespace: "purchase",
            key: user.id,
            maxRequests: 5,
            windowSeconds: 60,
        })
        if (rateLimitResponse) return rateLimitResponse

        const formData = await request.formData()

        // Extract common fields
        const type = ((formData.get("type") as string) || "").trim() as "REGULAR" | "UTS" | "KELAS_BESAR"
        const subject = ((formData.get("subject") as string) || "Fisika Smt 3").trim()
        const track = normalizeRegistrationTrack((formData.get("track") as string) || "PHYSICS_SEM_3")
        const rawPlanCode = ((formData.get("plan_code") as string) || (formData.get("packageType") as string) || "SEMESTER")
            .trim()
            .toUpperCase()
        const planCode = rawPlanCode.includes("MONTH") ? "MONTHLY" : "SEMESTER"
        const paymentProof = formData.get("paymentProof") as File

        // Validate type
        if (!type || !ACCEPTED_TYPES.includes(type as (typeof ACCEPTED_TYPES)[number])) {
            return NextResponse.json(
                { error: "Tipe registrasi tidak valid." },
                { status: 400 }
            )
        }

        if (!subject) {
            return NextResponse.json(
                { error: "Pilih mata kuliah." },
                { status: 400 }
            )
        }

        // Validate payment proof via binary magic bytes and size limit
        const paymentProofBlob = paymentProof instanceof Blob ? paymentProof : null
        const fileValidation = await validateImageUpload(paymentProofBlob)
        if (!fileValidation.ok) {
            return NextResponse.json(
                { error: fileValidation.error },
                { status: fileValidation.status }
            )
        }

        let regularGroupSize: number | null = null
        let regularSessionCount: number | null = null
        let regularScheduledDate: string | null = null
        let regularScheduledTime: string | null = null
        const rawNotes = typeof formData.get("notes") === "string" ? (formData.get("notes") as string).trim() : ""
        const registrationNotes = rawNotes ? rawNotes.slice(0, 1000) : null

        // Validate type-specific fields
        if (type === "REGULAR") {
            const groupSize = parseInt(formData.get("groupSize") as string, 10)
            const sessionCount = parseInt(formData.get("sessionCount") as string, 10)
            const scheduledDate = ((formData.get("scheduledDate") as string) || "").trim()
            const scheduledTime = ((formData.get("scheduledTime") as string) || "").trim()

            if (!groupSize || groupSize < 1 || groupSize > 20) {
                return NextResponse.json({ error: "Jumlah orang harus antara 1-20." }, { status: 400 })
            }
            if (!sessionCount || sessionCount < 1 || sessionCount > 30) {
                return NextResponse.json({ error: "Jumlah pertemuan harus antara 1-30." }, { status: 400 })
            }
            if (!scheduledDate || !scheduledTime) {
                return NextResponse.json({ error: "Pilih tanggal dan waktu kelas." }, { status: 400 })
            }
            if (!DATE_PATTERN.test(scheduledDate) || !TIME_PATTERN.test(scheduledTime)) {
                return NextResponse.json({ error: "Format tanggal atau waktu kelas tidak valid." }, { status: 400 })
            }

            regularGroupSize = groupSize
            regularSessionCount = sessionCount
            regularScheduledDate = scheduledDate
            regularScheduledTime = scheduledTime
        }

        const adminClient = createServiceClient()

        // Get existing user data
        const { data: dbUser } = await adminClient
            .from("users")
            .select("id, name")
            .eq("email", user.email)
            .single()

        if (!dbUser) {
            return NextResponse.json({ error: "User record not found." }, { status: 404 })
        }

        // Get past registration to reuse nim and whatsapp
        const { data: pastReg } = await adminClient
            .from("registrations")
            .select("nim, whatsapp")
            .eq("email", user.email)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle()

        const nim = pastReg?.nim || "-"
        const whatsapp = pastReg?.whatsapp || "-"
        const name = dbUser.name || user.email.split("@")[0]

        // Upload validated payment proof using binary-derived extension and MIME type
        const fileName = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${fileValidation.ext}`
        const { error: uploadError } = await adminClient.storage
            .from("payment-proofs")
            .upload(fileName, fileValidation.bytes, {
                contentType: fileValidation.mime,
                cacheControl: "3600",
                upsert: false,
            })

        if (uploadError) {
            console.error("Upload error:", uploadError)
            return NextResponse.json(
                { error: "Gagal mengunggah bukti pembayaran." },
                { status: 500 }
            )
        }

        // Calculate price
        let calculatedPrice: number | null = null
        let pricingTier: string | null = null

        if (type === "REGULAR") {
            const groupSize = parseInt(formData.get("groupSize") as string, 10)
            const sessionCount = parseInt(formData.get("sessionCount") as string, 10)
            const pricing = calculatePrice(groupSize, sessionCount)
            calculatedPrice = pricing.subtotal
            pricingTier = pricing.tier
        } else if (type === "UTS") {
            const packageType = (formData.get("packageType") as string) || ""
            const legacyPkg = UTS_PACKAGES.find((p) => p.value === packageType)
            if (legacyPkg) {
                calculatedPrice = legacyPkg.price
                pricingTier = legacyPkg.value.toUpperCase()
            } else {
                const unifiedPlan = getPlanByCode(planCode) ?? SUBSCRIPTION_PLANS.MONTHLY
                calculatedPrice = unifiedPlan.price
                pricingTier = unifiedPlan.code
            }
        } else if (type === "KELAS_BESAR") {
            calculatedPrice = 30000
            pricingTier = "MASTERCLASS"
        }

        const registrationId = crypto.randomUUID()
        const { data: registration, error: regError } = await adminClient
            .from("registrations")
            .insert({
                id: registrationId,
                type,
                plan_code: type === "UTS" ? planCode : null,
                track,
                name,
                email: user.email,
                nim,
                subject,
                whatsapp,
                payment_proof_url: fileName,
                calculated_price: calculatedPrice,
                pricing_tier: pricingTier,
                group_size: regularGroupSize,
                session_count: regularSessionCount,
                scheduled_date: regularScheduledDate,
                scheduled_time: regularScheduledTime,
                notes: registrationNotes,
                status: "PENDING",
                updated_at: new Date().toISOString(),
                user_id: dbUser.id,
            })
            .select()
            .single()

        if (regError) {
            console.error("Registration insert error:", regError)
            await adminClient.storage.from("payment-proofs").remove([fileName])
            return NextResponse.json({ error: "Gagal menyimpan data pendaftaran." }, { status: 500 })
        }

        return NextResponse.json(
            {
                message: type === "REGULAR"
                    ? "Pembelian berhasil diproses! Silakan hubungi Admin untuk jadwal."
                    : "Pembelian berhasil diajukan. Menunggu verifikasi admin.",
                id: registration.id,
            },
            { status: 201 }
        )
    } catch (error) {
        console.error("Dashboard purchase error:", error)
        return NextResponse.json(
            { error: "Terjadi kesalahan internal." },
            { status: 500 }
        )
    }
}
