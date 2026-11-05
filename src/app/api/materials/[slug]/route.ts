import { NextRequest, NextResponse } from "next/server"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import { getEntitlements } from "@/lib/entitlements"

export const dynamic = "force-dynamic"

// GET /api/materials/[slug] - Read single material with entitlement gate
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params
        const authClient = await createClient()
        const { data: { user } } = await authClient.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const supabase = createServiceClient()

        const { data: userRecord } = await supabase
            .from("users")
            .select("id")
            .eq("auth_id", user.id)
            .single()

        if (!userRecord) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const entitlements = await getEntitlements(userRecord.id)

        // Try lookup by slug, fallback to ID
        let query = supabase
            .from("materials")
            .select(`
                id,
                course_id,
                slug,
                title,
                summary,
                content_md,
                module_number,
                sort_order,
                reading_time_minutes,
                is_free_preview,
                is_published,
                subject,
                drive_url,
                podcast_url,
                pdf_url,
                created_at,
                courses (
                    id,
                    title,
                    slug,
                    code,
                    track
                )
            `)
            .or(`slug.eq.${slug},id.eq.${slug}`)
            .maybeSingle()

        const { data: material, error } = await query

        if (error || !material) {
            return NextResponse.json({ error: "Materi tidak ditemukan." }, { status: 404 })
        }

        const isAccessible = entitlements.canAccessMaterial(material)

        if (!isAccessible) {
            return NextResponse.json({
                error: "UPGRADE_REQUIRED",
                message: "Materi ini adalah materi premium. Tingkatkan paketmu untuk membuka modul ini.",
                material: {
                    id: material.id,
                    slug: material.slug,
                    title: material.title,
                    summary: material.summary,
                    module_number: material.module_number,
                    subject: material.subject,
                    is_free_preview: false,
                },
                entitlements: {
                    isFreeTier: entitlements.tier === "FREE",
                    tier: entitlements.tier,
                    planCode: entitlements.planCode,
                    track: entitlements.track,
                }
            }, { status: 403 })
        }

        return NextResponse.json({
            material,
            entitlements: {
                isFreeTier: entitlements.tier === "FREE",
                tier: entitlements.tier,
                planCode: entitlements.planCode,
                track: entitlements.track,
            }
        })
    } catch (error) {
        console.error("GET material slug error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
