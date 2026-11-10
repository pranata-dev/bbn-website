import { NextRequest, NextResponse } from "next/server"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import { UTS_PACKAGES } from "@/constants"
import { checkRateLimit } from "@/lib/rate-limit"
import { calculatePrice } from "@/lib/pricing"
import { getPlanByCode, SUBSCRIPTION_PLANS } from "@/config/plans"

const ACCEPTED_TYPES = ["REGULAR", "UTS", "KELAS_BESAR"] as const
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
const MAX_FILE_SIZE = 5 * 1024 * 1024

export async function POST(request: NextRequest) {
    // Check rate limit
    const rateLimitResponse = checkRateLimit(request)
    if (rateLimitResponse) return rateLimitResponse

    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user || !user.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const formData = await request.formData()

        // Extract common fields
        const type = ((formData.get("type") as string) || "").trim() as "REGULAR" | "UTS" | "KELAS_BESAR"
        const subject = ((formData.get("subject") as string) || "Fisika Smt 3").trim()
        const track = ((formData.get("track") as string) || "PHYSICS_SEM_3").trim()
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

        // Validate file
        if (!paymentProof || !(paymentProof instanceof File)) {
            return NextResponse.json(
                { error: "Mohon unggah bukti pembayaran." },
                { status: 400 }
            )
        }

        if (!ACCEPTED_FILE_TYPES.includes(paymentProof.type)) {
            return NextResponse.json(
                { error: "Format file tidak didukung. Gunakan JPG, PNG, atau WebP." },
                { status: 400 }
            )
        }

        if (paymentProof.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: "Ukuran file maksimal 5MB." },
                { status: 400 }
            )
        }

        // Validate type-specific fields
        if (type === "REGULAR") {
            const groupSize = parseInt(formData.get("groupSize") as string, 10)
            const sessionCount = parseInt(formData.get("sessionCount") as string, 10)
            const scheduledDate = formData.get("scheduledDate") as string
            const scheduledTime = formData.get("scheduledTime") as string

            if (!groupSize || groupSize < 1 || groupSize > 20) {
                return NextResponse.json({ error: "Jumlah orang harus antara 1-20." }, { status: 400 })
            }
            if (!sessionCount || sessionCount < 1 || sessionCount > 30) {
                return NextResponse.json({ error: "Jumlah pertemuan harus antara 1-30." }, { status: 400 })
            }
            if (!scheduledDate || !scheduledTime) {
                return NextResponse.json({ error: "Pilih tanggal dan waktu kelas." }, { status: 400 })
            }
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

        // Upload payment proof
        const fileExt = paymentProof.name.split(".").pop() || "jpg"
        const fileName = `dashboard-purchases/${Date.now()}-${dbUser.id}.${fileExt}`
        const { error: uploadError } = await adminClient.storage
            .from("payment-proofs")
            .upload(fileName, paymentProof, {
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

        const { data: { publicUrl } } = adminClient.storage
            .from("payment-proofs")
            .getPublicUrl(fileName)

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
                plan_code: planCode,
                track: track === "NON_PHYSICS" ? "NON_PHYSICS" : "PHYSICS_SEM_3",
                name,
                email: user.email,
                nim,
                subject,
                whatsapp,
                payment_proof_url: publicUrl,
                calculated_price: calculatedPrice,
                pricing_tier: pricingTier,
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
