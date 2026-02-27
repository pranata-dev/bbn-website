import { jwtVerify, SignJWT } from "jose"

const getJwtSecretKey = () => {
    const secret = process.env.JWT_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!secret) {
        throw new Error("JWT Secret key is not set")
    }
    return new TextEncoder().encode(secret)
}

export async function signAdminToken(payload: { role: string }) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("24h")
        .sign(getJwtSecretKey())
}

export async function verifyAdminToken(token: string) {
    try {
        const verified = await jwtVerify(token, getJwtSecretKey())
        return verified.payload
    } catch (err) {
        throw new Error("Invalid token")
    }
}
