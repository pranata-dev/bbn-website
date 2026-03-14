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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Users, Loader2, Shield, UserCheck, UserX, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface UserItem {
    id: string
    name: string
    email: string
    is_active: boolean
    created_at: string
    subject_access: any[]
}

export default function UsersPage() {
    const [users, setUsers] = useState<UserItem[]>([])
    const [loading, setLoading] = useState(true)
    const [deletingId, setDeletingId] = useState<string | null>(null)

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

    const handleUpdateRole = async (userId: string, role: string, subject: string) => {
        try {
            const res = await fetch("/api/admin/users", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, role, subject }),
            })

            if (!res.ok) throw new Error("Failed to update")
            toast.success(`Role ${subject} berhasil diubah.`)
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

    const handleDelete = async () => {
        if (!deletingId) return
        try {
            const res = await fetch(`/api/admin/users/${deletingId}`, {
                method: "DELETE",
            })
            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || "Gagal menghapus pengguna")
            }
            toast.success("Pengguna berhasil dihapus.")
            fetchUsers()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Terjadi kesalahan")
        } finally {
            setDeletingId(null)
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

                                    <div className="flex flex-col gap-2 min-w-[200px] flex-shrink-0">
                                        {u.subject_access.length === 0 ? (
                                            <span className="text-xs text-muted-foreground italic">Tidak ada akses mata kuliah</span>
                                        ) : (
                                            u.subject_access.map((acc) => (
                                                <div key={acc.id} className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold text-dark-brown w-16 truncate">
                                                        {acc.subject}
                                                    </span>
                                                    <Select
                                                        value={acc.role === "STUDENT_BASIC" ? "STUDENT_PREMIUM" : acc.role}
                                                        onValueChange={(value) => handleUpdateRole(u.id, value, acc.subject)}
                                                    >
                                                        <SelectTrigger className="w-[120px] h-7 text-[10px] border-warm-gray">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="STUDENT_PREMIUM">Student Premium</SelectItem>
                                                            <SelectItem value="UTS_FLUX">UTS Flux</SelectItem>
                                                            <SelectItem value="UTS_SENKU">UTS Senku</SelectItem>
                                                            <SelectItem value="UTS_EINSTEIN">UTS Einstein</SelectItem>
                                                            <SelectItem value="ADMIN">Admin</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <Badge
                                            className={u.is_active ? "bg-green-100 text-green-700 text-[10px]" : "bg-red-100 text-red-700 text-[10px]"}
                                        >
                                            {u.is_active ? "Aktif" : "Nonaktif"}
                                        </Badge>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleToggleActive(u.id, u.is_active)}
                                            className="h-8 w-8 p-0"
                                        >
                                            {u.is_active ? (
                                                <UserX className="w-4 h-4 text-red-500" />
                                            ) : (
                                                <UserCheck className="w-4 h-4 text-earthy-green" />
                                            )}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setDeletingId(u.id)}
                                            className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500 hover:bg-red-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <AlertDialog open={!!deletingId} onOpenChange={(open: boolean) => !open && setDeletingId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Pengguna?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Data pengguna, riwayat tryout, dan pembayaran akan dihapus secara permanen.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
                            Ya, Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
