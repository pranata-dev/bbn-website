import { NextResponse } from "next/server"
import { signAdminToken } from "@/lib/admin-auth"
import { cookies } from "next/headers"

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json()

        const actualUser = process.env.ADMIN_USERNAME
        const actualPass = process.env.ADMIN_PASSWORD

        if (!actualUser || !actualPass) {
            return NextResponse.json(
                { error: "Admin credentials not configured on server" },
                { status: 500 }
            )
        }

        if (username === actualUser && password === actualPass) {
            const token = await signAdminToken({ role: "ADMIN" })

            const cookieStore = await cookies()
            cookieStore.set("admin_session", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: 60 * 60 * 24, // 24 hours
            })

            return NextResponse.json({ success: true, message: "Login successful" })
        }

        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
