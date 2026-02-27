"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Shield, Loader2 } from "lucide-react"

export default function AdminLoginPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch("/api/admin/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Login gagal")
            }

            toast.success("Login berhasil", {
                description: "Selamat datang di Admin Panel BBN.",
            })

            // Hard refresh to ensure layout clears caches
            window.location.href = "/admin"
        } catch (error: any) {
            toast.error(error.message)
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-cream flex items-center justify-center p-4">
            <Card className="w-full max-w-sm shadow-lg border-warm-gray/60">
                <CardHeader className="text-center space-y-4 pb-6">
                    <div className="w-12 h-12 rounded-xl bg-dark-brown flex items-center justify-center mx-auto shadow-sm">
                        <Shield className="w-6 h-6 text-cream" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                            Admin Access
                        </CardTitle>
                        <CardDescription className="text-muted-foreground mt-2">
                            Gunakan kredensial environment untuk masuk.
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-sm font-medium">Username</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="Masukkan username admin"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                required
                                className="h-11 bg-white focus-visible:ring-soft-brown"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder={"•".repeat(8)}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                className="h-11 bg-white focus-visible:ring-soft-brown"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-11 bg-dark-brown hover:bg-soft-brown text-cream mt-6 font-medium transition-colors"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                                    Verifikasi...
                                </>
                            ) : (
                                "Masuk Panel"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
