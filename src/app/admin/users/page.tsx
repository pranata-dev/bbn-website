"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Users, Loader2, Shield, UserCheck, UserX } from "lucide-react"
import { toast } from "sonner"

interface UserItem {
    id: string
    name: string
    email: string
    role: string
    is_active: boolean
    created_at: string
}

export default function UsersPage() {
    const [users, setUsers] = useState<UserItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/admin/users")
            const data = await res.json()
            setUsers(data.users || [])
        } catch (error) {
            console.error("Failed to fetch users:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateRole = async (userId: string, role: string) => {
        try {
            const res = await fetch("/api/admin/users", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, role }),
            })

            if (!res.ok) throw new Error("Failed to update")
            toast.success("Role berhasil diubah.")
            fetchUsers()
        } catch (error) {
            toast.error("Gagal mengubah role.")
        }
    }

    const handleToggleActive = async (userId: string, isActive: boolean) => {
        try {
            const res = await fetch("/api/admin/users", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, isActive: !isActive }),
            })

            if (!res.ok) throw new Error("Failed to update")
            toast.success(isActive ? "Pengguna dinonaktifkan." : "Pengguna diaktifkan.")
            fetchUsers()
        } catch (error) {
            toast.error("Gagal mengubah status.")
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Manajemen Pengguna</h1>
                <p className="text-muted-foreground">Kelola pengguna, role, dan status akun.</p>
            </div>

            <Card className="border-warm-gray/60">
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : users.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <Users className="w-8 h-8 text-muted-foreground mb-3" />
                            <p className="text-sm text-muted-foreground">Belum ada pengguna.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-warm-gray/40">
                            {users.map((u) => (
                                <div
                                    key={u.id}
                                    className="flex items-center justify-between p-4 hover:bg-warm-beige/30 transition-colors gap-4"
                                >
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <div className="w-10 h-10 rounded-full bg-dark-brown flex items-center justify-center text-cream text-sm font-bold flex-shrink-0">
                                            {u.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-foreground truncate">{u.name}</p>
                                            <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        <Badge
                                            className={u.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}
                                        >
                                            {u.is_active ? "Aktif" : "Nonaktif"}
                                        </Badge>

                                        <Select
                                            value={u.role}
                                            onValueChange={(value) => handleUpdateRole(u.id, value)}
                                        >
                                            <SelectTrigger className="w-[140px] h-8 text-xs border-warm-gray">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="STUDENT_BASIC">Student Basic</SelectItem>
                                                <SelectItem value="STUDENT_PREMIUM">Student Premium</SelectItem>
                                                <SelectItem value="ADMIN">Admin</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleToggleActive(u.id, u.is_active)}
                                        >
                                            {u.is_active ? (
                                                <UserX className="w-4 h-4 text-red-500" />
                                            ) : (
                                                <UserCheck className="w-4 h-4 text-earthy-green" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
