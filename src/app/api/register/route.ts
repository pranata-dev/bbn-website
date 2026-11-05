import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { WHATSAPP_REGEX, UTS_PACKAGES } from "@/constants"
import { checkRateLimit } from "@/lib/rate-limit"
import { calculatePrice } from "@/lib/pricing"

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
    const type = (formData.get("type") as string || "UTS").trim().toUpperCase()
    const name = (
      (formData.get("fullName") as string) ||
      (formData.get("name") as string) ||
      ""
    ).trim()
    const email = (formData.get("email") as string || "").trim().toLowerCase()
    const password = (formData.get("password") as string || "").trim()
    const whatsapp = (
      (formData.get("whatsapp") as string) ||
      (formData.get("phone") as string) ||
      ""
    ).trim()
    const nim = (formData.get("nim") as string || "MHS-BBN").trim()
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
    const packageType = (
      (formData.get("selectedPackageId") as string) ||
      (formData.get("selectedPackageName") as string) ||
      (formData.get("packageType") as string) ||
      (formData.get("package_type") as string) ||
      "einstein_monthly"
    ).trim()

    const subject = (
      (formData.get("subject") as string) ||
      (studentCategory === "PHYSICS_SEM_3" ? "Fisika Smt 3" : "Umum")
    ).trim()

    const paymentProof = formData.get("paymentProof") as File | null
    const authId = (formData.get("authId") as string || "").trim()

    // Validate type
    if (!ACCEPTED_TYPES.includes(type as typeof ACCEPTED_TYPES[number])) {
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

    // Validate payment proof file
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

    const supabase = createServiceClient()

    // Duplicate Check in Users Table
    const { data: existingUser } = await supabase
      .from("users")
      .select("id, email, is_active, auth_id")
      .ilike("email", email)
      .maybeSingle()

    // Upload payment proof
    const fileExt = paymentProof.name.split(".").pop() || "jpg"
    const safeEmailPrefix = email.replace(/[^a-zA-Z0-9]/g, "_")
    const fileName = `registrations/${Date.now()}-${safeEmailPrefix}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from("payment-proofs")
      .upload(fileName, paymentProof, {
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
      const groupSize = parseInt(formData.get("groupSize") as string) || 1
      const sessionCount = parseInt(formData.get("sessionCount") as string) || 1
      const pricing = calculatePrice(groupSize, sessionCount)
      calculatedPrice = pricing.subtotal
      pricingTier = pricing.tier
    } else if (type === "UTS") {
      const rawPrice = formData.get("price") as string
      if (rawPrice) {
        calculatedPrice = parseInt(rawPrice) || null
      }
    } else if (type === "KELAS_BESAR") {
      calculatedPrice = 30000
      pricingTier = "MASTERCLASS"
    }

    // 1. Insert or Upsert into local `users` table without locking out active users
    const localUserId = existingUser?.id || crypto.randomUUID()
    const { error: userUpsertError } = await supabase
      .from("users")
      .upsert(
        {
          id: localUserId,
          email,
          name,
          auth_id: authId || existingUser?.auth_id || undefined,
          student_category: studentCategory,
          package_type: packageType,
          billing_cycle: billingCycle,
          is_active: existingUser ? existingUser.is_active : false, // Preserve active status if already existing
          updated_at: new Date().toISOString(),
        },
        { onConflict: "email" }
      )

    if (userUpsertError) {
      console.error("Users table upsert error:", userUpsertError)
    }

    // 2. Insert into `registrations` table with status: 'PENDING'
    const registrationId = crypto.randomUUID()
    const { data: registration, error: regError } = await supabase
      .from("registrations")
      .insert({
        id: registrationId,
        type,
        name,
        email,
        nim: nim || "-",
        subject: subject || "Fisika Smt 3",
        whatsapp,
        phone: whatsapp,
        student_category: studentCategory,
        package_type: packageType,
        billing_cycle: billingCycle,
        payment_proof_url: publicUrl,
        calculated_price: calculatedPrice,
        pricing_tier: pricingTier,
        status: "PENDING",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .maybeSingle()

    if (regError) {
      console.error("Registration insert error:", regError)
      // Retry without optional columns if schema differs
      const { data: retryReg, error: retryError } = await supabase
        .from("registrations")
        .insert({
          id: registrationId,
          type,
          name,
          email,
          nim: nim || "-",
          subject: subject || "Fisika Smt 3",
          whatsapp,
          payment_proof_url: publicUrl,
          calculated_price: calculatedPrice,
          pricing_tier: pricingTier,
          status: "PENDING",
        })
        .select()
        .maybeSingle()

      if (retryError) {
        console.error("Registration retry insert error:", retryError)
        return NextResponse.json(
          { error: "Gagal menyimpan data pendaftaran. Silakan coba lagi." },
          { status: 500 }
        )
      }
    }

    // 3. Create detail records safely if applicable
    try {
      if (type === "UTS") {
        await supabase
          .from("uts_package_details")
          .insert({
            id: crypto.randomUUID(),
            registration_id: registrationId,
            package_type: packageType,
          })
      } else if (type === "REGULAR") {
        const groupSize = parseInt(formData.get("groupSize") as string) || 1
        const sessionCount = parseInt(formData.get("sessionCount") as string) || 1
        const scheduledDate = (formData.get("scheduledDate") as string) || new Date().toISOString()
        const scheduledTime = (formData.get("scheduledTime") as string) || "19:00"
        const notes = (formData.get("notes") as string) || ""

        await supabase
          .from("regular_class_details")
          .insert({
            id: crypto.randomUUID(),
            registration_id: registrationId,
            group_size: groupSize,
            session_count: sessionCount,
            scheduled_date: scheduledDate,
            scheduled_time: scheduledTime,
            notes,
          })
      }
    } catch (detailErr) {
      console.warn("Optional detail table insert skipped/warned:", detailErr)
    }

    return NextResponse.json(
      {
        message: "Pendaftaran berhasil! Akun kamu sedang dalam antrean verifikasi admin.",
        id: registrationId,
        user_id: localUserId,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: error?.message || "Terjadi kesalahan internal." },
      { status: 500 }
    )
  }
}
