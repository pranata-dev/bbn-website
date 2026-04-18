import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

// DELETE /api/admin/users/[id] - Delete a user
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const supabase = await createAdminClient()

        // Supabase REST API doesn't easily let us delete auth users without admin privileges,
        // but Since we use service_role key derived adminClient, we can delete from the 'users' table 
        // which might trigger cascading deletes or we can delete using the admin.auth.deleteUser API if needed.
        // Usually, deleting the public.users record is the minimum requirement for the app.
        // However, to fully clean up from Auth, we need to delete the Auth user.
        
        // 1. Get the auth_id from the public.users table (if it exists)
        const { data: userProfile, error: fetchError } = await supabase
            .from("users")
            .select("auth_id")
            .eq("id", id)
            .single()

        if (fetchError || !userProfile) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        const authId = userProfile.auth_id

        if (authId) {
            // 2. Delete the user from Supabase Auth
            // Our new PostgreSQL trigger `on_auth_user_deleted` will automatically cascade 
            // and delete the record from `public.users`.
            const { error: authDeleteError } = await supabase.auth.admin.deleteUser(authId)
            
            if (authDeleteError) {
                if (authDeleteError.status === 404 || authDeleteError.message.toLowerCase().includes("not found")) {
                    console.warn(`Orphaned user detected for auth_id ${authId}, falling back to manual public.users deletion...`)
                    const { error: deleteError } = await supabase
                        .from("users")
                        .delete()
                        .eq("id", id)

                    if (deleteError) {
                        return NextResponse.json({ error: `Failed to delete orphaned public user: ${deleteError.message}` }, { status: 500 })
                    }
                } else {
                    console.error("Failed to delete auth user:", authDeleteError)
                    return NextResponse.json({ error: `Failed to delete auth user: ${authDeleteError.message}` }, { status: 500 })
                }
            }
        } else {
            // 3. Fallback: If this is a legacy corrupted record with no auth_id, just delete the public profile
            const { error: deleteError } = await supabase
                .from("users")
                .delete()
                .eq("id", id)

            if (deleteError) {
                return NextResponse.json({ error: `Failed to delete public user: ${deleteError.message}` }, { status: 500 })
            }
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("API error:", error)
        return NextResponse.json({ error: "Internal error" }, { status: 500 })
    }
}
