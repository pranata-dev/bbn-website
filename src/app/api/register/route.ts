import { NextRequest, NextResponse } from "next/server"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import { checkRateLimit } from "@/lib/rate-limit"
import { validateImageUpload } from "@/lib/file-validation"
import {
  evaluateRegistrationIdentity,
  normalizeRegistrationTrack,
  resolveRegistrationPricing,
  type ExistingUserSnapshot,
  type RegistrationType,
} from "@/lib/register-security"

const ACCEPTED_TYPES: readonly RegistrationType[] = ["REGULAR", "UTS", "KELAS_BESAR"] as const
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const TIME_PATTERN = /^[0-2][0-9]:[0-5][0-9]$/

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  try {
    // 1. Authenticate caller and derive auth_id + email strictly from verified session
    const authClient = await createClient()
    const {
      data: { user: authUser },
      error: authError,
    } = await authClient.auth.getUser()

    if (authError || !authUser || !authUser.email) {
      return NextResponse.json(
        { error: "Silakan masuk atau buat akun terlebih dahulu sebelum mendaftar." },
        { status: 401 }
      )
    }

    const sessionAuthId = authUser.id
    const sessionEmail = authUser.email.trim().toLowerCase()

    const formData = await request.formData()

    const rawType = ((formData.get("type") as string) || "UTS").trim().toUpperCase()
    if (!ACCEPTED_TYPES.includes(rawType as RegistrationType)) {
      return NextResponse.json(
        { error: "Tipe registrasi tidak valid." },
        { status: 400 }
      )
    }
    const type = rawType as RegistrationType

    const name = (
      (formData.get("fullName") as string) ||
      (formData.get("name") as string) ||
      ""
    ).trim()
    const submittedEmail = ((formData.get("email") as string) || "").trim().toLowerCase() || null
    const whatsapp = (
      (formData.get("whatsapp") as string) ||
      (formData.get("phone") as string) ||
      ""
    ).trim()
    const nim = ((formData.get("nim") as string) || "MHS-BBN").trim()
    const track = normalizeRegistrationTrack(
      (formData.get("studentCategory") as string) ||
        (formData.get("student_category") as string) ||
        (formData.get("track") as string)
    )
    const billingCycle = (
      (formData.get("billingCycle") as string) ||
      (formData.get("billing_cycle") as string) ||
      ""
    ).trim()
    const rawPlanCode = (
      (formData.get("plan_code") as string) ||
      (formData.get("planCode") as string) ||
      billingCycle
    )
      .trim()
      .toUpperCase()
    const normalizedUtsPlan =
      rawPlanCode === "FREE"
        ? "FREE"
        : rawPlanCode.includes("MONTH")
          ? "MONTHLY"
          : rawPlanCode.includes("SEMESTER")
            ? "SEMESTER"
            : rawPlanCode

    const subject = (
      (formData.get("subject") as string) ||
      (track === "NON_PHYSICS" ? "Umum" : "Fisika Smt 3")
    ).trim()

    if (!name || name.length < 3) {
      return NextResponse.json(
        { error: "Nama lengkap minimal 3 karakter." },
        { status: 400 }
      )
    }

    if (!whatsapp || whatsapp.length < 8) {
      return NextResponse.json(
        { error: "Nomor WhatsApp tidak valid." },
        { status: 400 }
      )
    }

    // 2. Authoritative server-side price computation (ignores any client-supplied price)
    const groupSizeRaw = formData.get("groupSize")
    const sessionCountRaw = formData.get("sessionCount")
    const parsedGroupSize =
      typeof groupSizeRaw === "string" && groupSizeRaw.trim() !== ""
        ? Number(groupSizeRaw)
        : undefined
    const parsedSessionCount =
      typeof sessionCountRaw === "string" && sessionCountRaw.trim() !== ""
        ? Number(sessionCountRaw)
        : undefined
    const pricing = resolveRegistrationPricing({
      type,
      planCodeRaw: type === "UTS" ? normalizedUtsPlan : null,
      groupSize: parsedGroupSize,
      sessionCount: parsedSessionCount,
    })

    if (!pricing.ok) {
      return NextResponse.json({ error: pricing.error }, { status: pricing.status })
    }

    const rawScheduledDate =
      typeof formData.get("scheduledDate") === "string"
        ? (formData.get("scheduledDate") as string).trim()
        : ""
    const rawScheduledTime =
      typeof formData.get("scheduledTime") === "string"
        ? (formData.get("scheduledTime") as string).trim()
        : ""
    const rawNotes =
      typeof formData.get("notes") === "string"
        ? (formData.get("notes") as string).trim()
        : ""

    if (rawScheduledDate && !DATE_PATTERN.test(rawScheduledDate)) {
      return NextResponse.json({ error: "Format tanggal jadwal tidak valid." }, { status: 400 })
    }
    if (rawScheduledTime && !TIME_PATTERN.test(rawScheduledTime)) {
      return NextResponse.json({ error: "Format waktu jadwal tidak valid." }, { status: 400 })
    }

    const regularGroupSize =
      type === "REGULAR" && typeof parsedGroupSize === "number" && Number.isInteger(parsedGroupSize)
        ? parsedGroupSize
        : null
    const regularSessionCount =
      type === "REGULAR" &&
      typeof parsedSessionCount === "number" &&
      Number.isInteger(parsedSessionCount)
        ? parsedSessionCount
        : null
    const scheduledDate = rawScheduledDate || null
    const scheduledTime = rawScheduledTime || null
    const registrationNotes = rawNotes ? rawNotes.slice(0, 1000) : null

    const isFreeRegistration = type === "UTS" && pricing.planCode === "FREE"

    // 3. Validate payment proof via binary magic bytes before any DB mutation
    const paymentProofEntry = formData.get("paymentProof")
    const paymentProofBlob = paymentProofEntry instanceof Blob ? paymentProofEntry : null
    const verifiedProof = isFreeRegistration
      ? null
      : await validateImageUpload(paymentProofBlob)

    if (verifiedProof && !verifiedProof.ok) {
      return NextResponse.json(
        { error: verifiedProof.error },
        { status: verifiedProof.status }
      )
    }

    const supabase = createServiceClient()

    // 4. Verify identity ownership and onboarding state without overwriting another user's row
    const [{ data: userByAuth }, { data: userByEmail }] = await Promise.all([
      supabase
        .from("users")
        .select("id, auth_id, email, is_active, role")
        .eq("auth_id", sessionAuthId)
        .maybeSingle(),
      supabase
        .from("users")
        .select("id, auth_id, email, is_active, role")
        .ilike("email", sessionEmail)
        .maybeSingle(),
    ])

    const candidateUserId = userByAuth?.id ?? userByEmail?.id ?? null
    let existingSubscriptionCount = 0
    let existingRegistrationCount = 0

    if (candidateUserId) {
      const [{ count: subCount }, { count: regCount }] = await Promise.all([
        supabase
          .from("subscriptions")
          .select("id", { count: "exact", head: true })
          .eq("user_id", candidateUserId),
        supabase
          .from("registrations")
          .select("id", { count: "exact", head: true })
          .eq("user_id", candidateUserId),
      ])
      existingSubscriptionCount = subCount ?? 0
      existingRegistrationCount = regCount ?? 0
    }

    const identity = evaluateRegistrationIdentity({
      sessionAuthId,
      sessionEmail,
      submittedEmail,
      existingUserByAuthId: (userByAuth as ExistingUserSnapshot | null) ?? null,
      existingUserByEmail: (userByEmail as ExistingUserSnapshot | null) ?? null,
      existingSubscriptionCount,
      existingRegistrationCount,
      isFreeRegistration,
    })

    if (!identity.ok) {
      return NextResponse.json({ error: identity.error }, { status: identity.status })
    }

    const nowIso = new Date().toISOString()
    const localUserId = identity.userId ?? crypto.randomUUID()

    // 5. Persist user profile safely (never overwrite auth_id or role on existing rows)
    if (identity.mode === "update") {
      const { error: userUpdateError } = await supabase
        .from("users")
        .update({
          name,
          is_active: identity.nextIsActive,
          updated_at: nowIso,
        })
        .eq("id", localUserId)
        .eq("auth_id", identity.authId)

      if (userUpdateError) {
        console.error("Users table update error:", userUpdateError)
        return NextResponse.json(
          { error: "Gagal memperbarui profil pengguna. Silakan coba lagi." },
          { status: 500 }
        )
      }
    } else {
      const { error: userInsertError } = await supabase.from("users").insert({
        id: localUserId,
        auth_id: identity.authId,
        email: identity.email,
        name,
        role: "STUDENT",
        is_active: identity.nextIsActive,
        created_at: nowIso,
        updated_at: nowIso,
      })

      if (userInsertError) {
        console.error("Users table insert error:", userInsertError)
        const isConflict = userInsertError.code === "23505"
        return NextResponse.json(
          {
            error: isConflict
              ? "Alamat email sudah terdaftar. Silakan masuk melalui halaman login."
              : "Gagal menyimpan profil pengguna. Silakan coba lagi.",
          },
          { status: isConflict ? 409 : 500 }
        )
      }
    }

    // 6. Handle FREE plan onboarding immediately without manual payment verification
    if (isFreeRegistration) {
      const { error: freeSubError } = await supabase.from("subscriptions").insert({
        id: crypto.randomUUID(),
        user_id: localUserId,
        plan_code: "FREE",
        track,
        status: "ACTIVE",
        starts_at: nowIso,
        expires_at: null,
        created_at: nowIso,
      })

      if (freeSubError) {
        console.error("Free subscription insert error:", freeSubError)
        return NextResponse.json(
          { error: "Gagal mengaktifkan Paket Gratis. Silakan coba lagi." },
          { status: 500 }
        )
      }

      return NextResponse.json(
        {
          message: "Pendaftaran Paket Gratis berhasil! Akun Anda langsung aktif.",
          status: "ACTIVE_FREE",
          user_id: localUserId,
        },
        { status: 201 }
      )
    }

    if (!verifiedProof || !verifiedProof.ok) {
      return NextResponse.json(
        { error: "Mohon unggah bukti transfer pembayaran." },
        { status: 400 }
      )
    }

    // 7. Upload validated payment proof with extension derived strictly from binary magic bytes
    const objectPath = `${identity.authId}/${Date.now()}-${crypto.randomUUID()}.${verifiedProof.ext}`

    const { error: uploadError } = await supabase.storage
      .from("payment-proofs")
      .upload(objectPath, verifiedProof.bytes, {
        contentType: verifiedProof.mime,
        cacheControl: "3600",
        upsert: false,
      })

    if (uploadError) {
      console.error("Storage upload error:", uploadError)
      return NextResponse.json(
        { error: "Gagal mengunggah bukti pembayaran. Silakan coba lagi." },
        { status: 500 }
      )
    }

    // 8. Insert PENDING registration record
    const registrationId = crypto.randomUUID()
    const { error: regError } = await supabase.from("registrations").insert({
      id: registrationId,
      user_id: localUserId,
      type,
      plan_code: pricing.planCode,
      track,
      name,
      email: identity.email,
      nim: nim || "-",
      subject: subject || "Fisika Smt 3",
      whatsapp,
      payment_proof_url: objectPath,
      calculated_price: pricing.calculatedPrice,
      pricing_tier: pricing.pricingTier,
      group_size: regularGroupSize,
      session_count: regularSessionCount,
      scheduled_date: scheduledDate,
      scheduled_time: scheduledTime,
      notes: registrationNotes,
      status: "PENDING",
      created_at: nowIso,
      updated_at: nowIso,
    })

    if (regError) {
      console.error("Registration insert error:", regError)
      await supabase.storage.from("payment-proofs").remove([objectPath])
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
    return NextResponse.json(
      { error: "Terjadi kesalahan internal." },
      { status: 500 }
    )
  }
}
