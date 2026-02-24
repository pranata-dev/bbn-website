"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Loader2, Lock } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { APP_NAME } from "@/constants"

export default function SetPasswordPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: "",
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (formData.password.length < 6) {
            toast.error("Password minimal 6 karakter.")
            return
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error("Password tidak cocok.")
            return
        }

        setIsLoading(true)

        try {
            const supabase = createClient()
            const { error } = await supabase.auth.updateUser({
                password: formData.password,
            })

            if (error) throw error

            toast.success("Password berhasil diatur! Silakan login.")
            router.push("/login")
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Terjadi kesalahan.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-cream flex items-center justify-center p-4">
            <div className="fixed inset-0 -z-10">
                <div className="absolute top-20 right-20 w-72 h-72 bg-earthy-gold/10 rounded-full blur-3xl" />
                <div className="absolute bottom-20 left-20 w-96 h-96 bg-soft-brown/8 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md">
                <Card className="border-warm-gray/60 shadow-lg shadow-soft-brown/5">
                    <CardHeader className="text-center space-y-4">
                        <div className="mx-auto w-12 h-12 rounded-xl bg-dark-brown flex items-center justify-center">
                            <Lock className="w-6 h-6 text-cream" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold text-foreground">Atur Password</CardTitle>
                            <CardDescription className="text-muted-foreground">
                                Buat password untuk akun {APP_NAME} kamu.
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">Password Baru</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Minimal 6 karakter"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="bg-warm-beige/30 border-warm-gray"
                                    required
                                    minLength={6}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirm-password">Konfirmasi Password</Label>
                                <Input
                                    id="confirm-password"
                                    type="password"
                                    placeholder="Ulangi password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className="bg-warm-beige/30 border-warm-gray"
                                    required
                                    minLength={6}
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
                                        Menyimpan...
                                    </>
                                ) : (
                                    "Simpan Password"
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
