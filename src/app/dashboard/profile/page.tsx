"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, Mail, Shield, Calendar } from "lucide-react"

export default function ProfilePage() {
    // In production, fetch from API
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Profil</h1>
                <p className="text-muted-foreground">Informasi akun kamu.</p>
            </div>

            <Card className="border-warm-gray/60">
                <CardContent className="p-6 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-dark-brown flex items-center justify-center text-cream text-xl font-bold">
                            U
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">User</h2>
                            <p className="text-sm text-muted-foreground">Mahasiswa</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-warm-beige">
                            <Mail className="w-5 h-5 text-soft-brown" />
                            <div>
                                <p className="text-xs text-muted-foreground">Email</p>
                                <p className="text-sm font-medium text-foreground">user@email.com</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-warm-beige">
                            <Shield className="w-5 h-5 text-soft-brown" />
                            <div>
                                <p className="text-xs text-muted-foreground">Role</p>
                                <p className="text-sm font-medium text-foreground">Student Basic</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-warm-beige">
                            <Calendar className="w-5 h-5 text-soft-brown" />
                            <div>
                                <p className="text-xs text-muted-foreground">Bergabung Sejak</p>
                                <p className="text-sm font-medium text-foreground">-</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
