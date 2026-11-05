import { NextResponse } from "next/server"
import { getAdminSession } from "@/lib/admin-auth"

/** Returns the current admin profile, or 401/403 if the Supabase session is not an ADMIN. */
export async function GET() {
    const result = await getAdminSession()
    if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: result.status })
    }
    return NextResponse.json({
        admin: { id: result.profile.id, email: result.profile.email, name: result.profile.name },
    })
}

