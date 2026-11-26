import { NextRequest, NextResponse } from "next/server"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import {
    canBetaAccessCourse,
    getEntitlements,
    getExcellentCourseRow,
} from "@/lib/entitlements"
import { normalizeIdentifier } from "@/lib/postgrest-safe"

export const dynamic = "force-dynamic"

const MATERIAL_SELECT = `
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
    drive_url,
    podcast_url,
    created_at,
    courses (
        id,
        title,
        slug,
        code,
        track
    )
`

// GET /api/materials/[slug] - Read single material with entitlement gate
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params
        const normalizedSlug = normalizeIdentifier(slug)
        if (!normalizedSlug) {
            return NextResponse.json({ error: "Identifier materi tidak valid." }, { status: 400 })
        }

        const authClient = await createClient()
        const {
            data: { user },
        } = await authClient.auth.getUser()

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

        const entitlements = await getEntitlements(userRecord.id, supabase, { authUser: user })
        const excellentGrade = entitlements.excellentGrade

        const findMaterial = async (column: "slug" | "id") => {
            let query = supabase
                .from("materials")
                .select(MATERIAL_SELECT)
                .eq(column, normalizedSlug)
            if (!entitlements.isAdmin) {
                query = query.eq("is_published", true)
            }
            return query.maybeSingle()
        }

        const { data: bySlug, error: slugError } = await findMaterial("slug")
        if (slugError) {
            return NextResponse.json({ error: "Materi tidak ditemukan." }, { status: 404 })
        }

        let material = bySlug
        if (!material) {
            const { data: byId, error: idError } = await findMaterial("id")
            if (idError) {
                return NextResponse.json({ error: "Materi tidak ditemukan." }, { status: 404 })
            }
            material = byId
        }

        if (!material) {
            return NextResponse.json({ error: "Materi tidak ditemukan." }, { status: 404 })
        }

        if (excellentGrade) {
            const gradeCourse = await getExcellentCourseRow(excellentGrade, supabase)
            if (!canBetaAccessCourse(excellentGrade, gradeCourse?.id, material.course_id)) {
                return NextResponse.json(
                    {
                        error: "FORBIDDEN_GRADE",
                        message: "Materi ini bukan untuk kelas kamu.",
                        entitlements: {
                            isFreeTier: false,
                            tier: entitlements.tier,
                            planCode: entitlements.planCode,
                            track: entitlements.track,
                            isExcellentBeta: true,
                            excellentGrade,
                        },
                    },
                    { status: 403 }
                )
            }
        }

        const isAccessible = entitlements.canAccessMaterial(material)

        if (!isAccessible) {
            return NextResponse.json(
                {
                    error: "UPGRADE_REQUIRED",
                    message: "Materi ini adalah materi premium. Tingkatkan paketmu untuk membuka modul ini.",
                    material: {
                        id: material.id,
                        slug: material.slug,
                        title: material.title,
                        summary: material.summary,
                        module_number: material.module_number,
                        is_free_preview: false,
                    },
                    entitlements: {
                        isFreeTier: entitlements.isFreeTier,
                        tier: entitlements.tier,
                        planCode: entitlements.planCode,
                        track: entitlements.track,
                        isExcellentBeta: entitlements.isExcellentBeta,
                        excellentGrade: entitlements.excellentGrade,
                    },
                },
                { status: 403 }
            )
        }

        let prevMaterial = null
        let nextMaterial = null

        if (material.course_id) {
            const { data: siblings } = await supabase
                .from("materials")
                .select("id, slug, title, module_number, sort_order")
                .eq("course_id", material.course_id)
                .eq("is_published", true)
                .order("sort_order", { ascending: true })

            if (siblings && siblings.length > 0) {
                const currentIndex = siblings.findIndex(
                    (s) => s.id === material.id || (material.slug && s.slug === material.slug)
                )
                if (currentIndex > 0) {
                    prevMaterial = siblings[currentIndex - 1]
                }
                if (currentIndex >= 0 && currentIndex < siblings.length - 1) {
                    nextMaterial = siblings[currentIndex + 1]
                }
            }
        }

        return NextResponse.json({
            material: {
                ...material,
                prev_material: prevMaterial,
                next_material: nextMaterial,
            },
            entitlements: {
                isFreeTier: entitlements.isFreeTier,
                tier: entitlements.tier,
                planCode: entitlements.planCode,
                track: entitlements.track,
                isExcellentBeta: entitlements.isExcellentBeta,
                excellentGrade: entitlements.excellentGrade,
            },
        })
    } catch (error) {
        console.error("GET material slug error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
