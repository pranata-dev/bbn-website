"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Loader2, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { APP_NAME } from "@/constants"

export default function LoginPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const redirect = searchParams.get("redirect") || "/dashboard"
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const supabase = createClient()
            const { error } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password,
            })

            if (error) {
                throw new Error(error.message === "Invalid login credentials"
                    ? "Email atau password salah."
                    : error.message)
            }

            // Check user role and redirect
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const res = await fetch(`/api/auth/session`, { method: "POST" })
                const data = await res.json()

                if (data.role === "ADMIN") {
                    router.push("/admin")
                } else {
                    router.push(redirect)
                }
                router.refresh()
            }

            toast.success("Login berhasil!")
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Terjadi kesalahan.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-cream flex items-center justify-center p-4">
            <div className="fixed inset-0 -z-10">
                <div className="absolute top-20 left-20 w-72 h-72 bg-earthy-gold/10 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-soft-brown/8 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Kembali ke beranda
                </Link>

                <Card className="border-warm-gray/60 shadow-lg shadow-soft-brown/5">
                    <CardHeader className="text-center space-y-4">
                        <div className="mx-auto w-12 h-12 rounded-xl bg-dark-brown flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-cream" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold text-foreground">Masuk</CardTitle>
                            <CardDescription className="text-muted-foreground">
                                Masuk ke akun {APP_NAME} kamu.
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="nama@email.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="bg-warm-beige/30 border-warm-gray"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Masukkan password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="bg-warm-beige/30 border-warm-gray"
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-dark-brown hover:bg-soft-brown text-cream h-11"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Memproses...
                                    </>
                                ) : (
                                    "Masuk"
                                )}
                            </Button>

                            <p className="text-center text-sm text-muted-foreground">
                                Belum punya akun?{" "}
                                <Link href="/register" className="text-dark-brown font-medium hover:underline">
                                    Daftar Sekarang
                                </Link>
                            </p>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
