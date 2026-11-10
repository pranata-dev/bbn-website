import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { checkRateLimit } from "@/lib/rate-limit"
import { calculatePrice } from "@/lib/pricing"
import { getPlanByCode } from "@/config/plans"

const ACCEPTED_TYPES = ["REGULAR", "UTS", "KELAS_BESAR"] as const
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
const MAX_FILE_SIZE = 5 * 1024 * 1024

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  // Rate limit check
  const rateLimitResponse = checkRateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const formData = await request.formData()

    // Extract common fields (handling both naming conventions)
    const type = ((formData.get("type") as string) || "UTS").trim().toUpperCase() as "REGULAR" | "UTS" | "KELAS_BESAR"
    const name = (
      (formData.get("fullName") as string) ||
      (formData.get("name") as string) ||
      ""
    ).trim()
    const email = ((formData.get("email") as string) || "").trim().toLowerCase()
    const whatsapp = (
      (formData.get("whatsapp") as string) ||
      (formData.get("phone") as string) ||
      ""
    ).trim()
    const nim = ((formData.get("nim") as string) || "MHS-BBN").trim()
    const studentCategory = (
      (formData.get("studentCategory") as string) ||
      (formData.get("student_category") as string) ||
      "PHYSICS_SEM_3"
    ).trim()
    const billingCycle = (
      (formData.get("billingCycle") as string) ||
      (formData.get("billing_cycle") as string) ||
      "MONTHLY"
    ).trim()
    const rawPlanCode = (
      (formData.get("plan_code") as string) ||
      (formData.get("planCode") as string) ||
      billingCycle
    ).trim().toUpperCase()
    const planCode =
      rawPlanCode === "FREE"
        ? "FREE"
        : rawPlanCode.includes("MONTH")
          ? "MONTHLY"
          : "SEMESTER"
    const packageType = (
      (formData.get("selectedPackageId") as string) ||
      (formData.get("selectedPackageName") as string) ||
      (formData.get("packageType") as string) ||
      (formData.get("package_type") as string) ||
      planCode.toLowerCase()
    ).trim()

    const subject = (
      (formData.get("subject") as string) ||
      (studentCategory === "PHYSICS_SEM_3" ? "Fisika Smt 3" : "Umum")
    ).trim()

    const paymentProof = formData.get("paymentProof") as File | null
    const authId = ((formData.get("authId") as string) || "").trim()

    // Validate type
    if (!ACCEPTED_TYPES.includes(type as (typeof ACCEPTED_TYPES)[number])) {
      return NextResponse.json(
        { error: "Tipe registrasi tidak valid." },
        { status: 400 }
      )
    }

    // Validate required common fields
    if (!name || name.length < 3) {
      return NextResponse.json(
        { error: "Nama lengkap minimal 3 karakter." },
        { status: 400 }
      )
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Alamat email tidak valid." },
        { status: 400 }
      )
    }

    if (!whatsapp || whatsapp.length < 8) {
      return NextResponse.json(
        { error: "Nomor WhatsApp tidak valid." },
        { status: 400 }
      )
    }

    const isFreeRegistration = type === "UTS" && planCode === "FREE"

    // Validate payment proof file for paid registrations
    if (!isFreeRegistration) {
      if (!paymentProof || !(paymentProof instanceof File)) {
        return NextResponse.json(
          { error: "Mohon unggah bukti transfer pembayaran." },
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
          { error: "Ukuran file bukti pembayaran maksimal 5MB." },
          { status: 400 }
        )
      }
    }

    const supabase = createServiceClient()

    // Duplicate Check in Users Table
    const { data: existingUser } = await supabase
      .from("users")
      .select("id, email, is_active, auth_id")
      .ilike("email", email)
      .maybeSingle()

    const localUserId = existingUser?.id || crypto.randomUUID()
    const nowIso = new Date().toISOString()

    // Handle FREE plan registration immediately without manual payment verification
    if (isFreeRegistration) {
      const { error: freeUserErr } = await supabase
        .from("users")
        .upsert(
          {
            id: localUserId,
            email,
            name,
            auth_id: authId || existingUser?.auth_id || localUserId,
            is_active: true,
            updated_at: nowIso,
          },
          { onConflict: "email" }
        )

      if (freeUserErr) {
        console.error("Free user upsert error:", freeUserErr)
      }

      await supabase.from("subscriptions").insert({
        id: crypto.randomUUID(),
        user_id: localUserId,
        plan_code: "FREE",
        track: studentCategory === "NON_PHYSICS" ? "NON_PHYSICS" : "PHYSICS_SEM_3",
        status: "ACTIVE",
        starts_at: nowIso,
        expires_at: null,
        created_at: nowIso,
        updated_at: nowIso,
      })

      return NextResponse.json(
        {
          message: "Pendaftaran Paket Gratis berhasil! Akun Anda langsung aktif.",
          status: "ACTIVE_FREE",
          user_id: localUserId,
        },
        { status: 201 }
      )
    }

    // Upload payment proof for paid plans
    const fileExt = paymentProof!.name.split(".").pop() || "jpg"
    const safeEmailPrefix = email.replace(/[^a-zA-Z0-9]/g, "_")
    const fileName = `registrations/${Date.now()}-${safeEmailPrefix}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from("payment-proofs")
      .upload(fileName, paymentProof!, {
        cacheControl: "3600",
        upsert: true,
      })

    if (uploadError) {
      console.error("Storage upload error:", uploadError)
      return NextResponse.json(
        { error: "Gagal mengunggah bukti pembayaran. Silakan coba lagi." },
        { status: 500 }
      )
    }

    const { data: urlData } = supabase.storage
      .from("payment-proofs")
      .getPublicUrl(fileName)
    const publicUrl = urlData.publicUrl

    // Price calculation
    let calculatedPrice: number | null = null
    let pricingTier: string = packageType.toUpperCase()

    if (type === "REGULAR") {
      const rawPrice = formData.get("price") as string
      const groupSize = parseInt(formData.get("groupSize") as string, 10) || 1
      const sessionCount = parseInt(formData.get("sessionCount") as string, 10) || 1
      const pricing = calculatePrice(groupSize, sessionCount)
      calculatedPrice = rawPrice ? parseInt(rawPrice, 10) || pricing.subtotal : pricing.subtotal
      pricingTier = pricing.tier
    } else if (type === "UTS") {
      const unifiedPlan = getPlanByCode(planCode)
      const rawPrice = formData.get("price") as string
      calculatedPrice = rawPrice ? parseInt(rawPrice, 10) || unifiedPlan.price : unifiedPlan.price
      pricingTier = planCode
    } else if (type === "KELAS_BESAR") {
      calculatedPrice = 30000
      pricingTier = "MASTERCLASS"
    }

    // 1. Insert or Upsert into local `users` table without locking out active users
    const { error: userUpsertError } = await supabase
      .from("users")
      .upsert(
        {
          id: localUserId,
          email,
          name,
          auth_id: authId || existingUser?.auth_id || localUserId,
          is_active: existingUser ? existingUser.is_active : false,
          updated_at: nowIso,
        },
        { onConflict: "email" }
      )

    if (userUpsertError) {
      console.error("Users table upsert error:", userUpsertError)
    }

    // 2. Insert into `registrations` table with status: 'PENDING'
    const registrationId = crypto.randomUUID()
    const { error: regError } = await supabase
      .from("registrations")
      .insert({
        id: registrationId,
        user_id: localUserId,
        type,
        plan_code: planCode,
        track: studentCategory,
        name,
        email,
        nim: nim || "-",
        subject: subject || "Fisika Smt 3",
        whatsapp,
        payment_proof_url: publicUrl,
        calculated_price: calculatedPrice,
        pricing_tier: pricingTier,
        status: "PENDING",
        created_at: nowIso,
        updated_at: nowIso,
      })

    if (regError) {
      console.error("Registration insert error:", regError)
      return NextResponse.json(
        { error: "Gagal menyimpan data pendaftaran. Silakan coba lagi." },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        message: "Pendaftaran berhasil! Akun kamu sedang dalam antrean verifikasi admin.",
        id: registrationId,
        user_id: localUserId,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    const message = error instanceof Error ? error.message : "Terjadi kesalahan internal."
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
