import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()
        const { subjects } = body

        if (!Array.isArray(subjects)) {
             return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
        }

        const supabase = await createAdminClient()

        // 1. Delete all existing subjects for this user
        const { error: deleteError } = await supabase
            .from("user_subject_access")
            .delete()
            .eq("user_id", id)

        if (deleteError) {
             console.error("Error deleting old access:", deleteError)
             return NextResponse.json({ error: "Failed to clear existing access" }, { status: 500 })
        }

        // 2. Insert new subjects if any were selected
        if (subjects.length > 0) {
            const insertData = subjects.map((s: any) => {
                let packageType = "REGULER"
                switch (s.role) {
                    case "UTS_EINSTEIN": packageType = "EINSTEIN"; break
                    case "UTS_SENKU": packageType = "SENKU"; break
                    case "UTS_FLUX": packageType = "FLUX"; break
                    case "STUDENT_PREMIUM": packageType = "REGULER"; break
                }
                
                return {
                    user_id: id,
                    subject: s.subject,
                    role: s.role,
                    package_type: packageType,
                    is_active: true,
                    updated_at: new Date().toISOString()
                }
            })

            const { error: insertError } = await supabase
                .from("user_subject_access")
                .insert(insertData)

            if (insertError) {
                console.error("Error inserting new access:", insertError)
                return NextResponse.json({ error: "Failed to add new access" }, { status: 500 })
            }
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Manage subjects API Error:", error)
        return NextResponse.json({ error: "Internal error" }, { status: 500 })
    }
}
