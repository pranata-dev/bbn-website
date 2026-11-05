import { NextResponse } from "next/server"
import type { User } from "@supabase/supabase-js"
import { createClient, createServiceClient } from "@/lib/supabase/server"

/**
 * Admin authentication is backed by Supabase Auth.
 * A user is an administrator iff `public.users.role = 'ADMIN'` for their auth_id.
 * (Mirrors the SQL helper `public.is_admin()` used by RLS policies.)
 *
 * The legacy env-password + `admin_session` JWT cookie system has been removed.
 */

export type AdminProfile = {
    id: string
    auth_id: string | null
    email: string
    name: string | null
    role: string | null
}

export type AdminCheckResult =
    | { ok: true; user: User; profile: AdminProfile }
    | { ok: false; status: 401 | 403; error: string }

/** Resolves the current Supabase session and verifies the ADMIN role server-side. */
export async function getAdminSession(): Promise<AdminCheckResult> {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { ok: false, status: 401, error: "Unauthorized" }
    }

    const service = createServiceClient()
    const { data: profile, error } = await service
        .from("users")
        .select("id, auth_id, email, name, role")
        .eq("auth_id", user.id)
        .maybeSingle()

    if (error || !profile || profile.role !== "ADMIN") {
        return { ok: false, status: 403, error: "Forbidden: admin access required" }
    }

    return { ok: true, user, profile: profile as AdminProfile }
}

/**
 * Guard for `/api/admin/**` route handlers. Usage:
 *
 *   const guard = await requireAdmin()
 *   if (!guard.ok) return guard.response
 */
export async function requireAdmin(): Promise<
    | { ok: true; user: User; profile: AdminProfile }
    | { ok: false; response: NextResponse }
> {
    const result = await getAdminSession()
    if (!result.ok) {
        return {
            ok: false,
            response: NextResponse.json({ error: result.error }, { status: result.status }),
        }
    }
    return result
}
