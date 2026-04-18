"use client"

import { useState, useEffect } from "react"
import { useOnlineUsers } from "@/hooks/useOnlineUsers"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Users, Loader2, Shield, UserCheck, UserX, Trash2, Settings2 } from "lucide-react"
import { toast } from "sonner"

interface UserItem {
    id: string
    auth_id: string
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
    const onlineUserIds = useOnlineUsers()

    // Manage Access Modal State
    const [managingUser, setManagingUser] = useState<UserItem | null>(null)
    const [selectedSubjects, setSelectedSubjects] = useState<{subject: string, role: string}[]>([])
    const [isSavingAccess, setIsSavingAccess] = useState(false)

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
            
            // Perbarui state UI secara langsung agar data hilang dari tabel tanpa delay
            setUsers(prev => prev.filter(user => user.id !== deletingId))
            toast.success("Pengguna berhasil dihapus.")
            
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Terjadi kesalahan")
        } finally {
            setDeletingId(null)
        }
    }

    // Modal Handlers
    const handleOpenManageAccess = (user: UserItem) => {
        setManagingUser(user)
        setSelectedSubjects(user.subject_access.map(acc => ({
            subject: acc.subject,
            role: acc.role
        })))
    }

    const handleToggleSubject = (subject: string, checked: boolean) => {
        if (checked) {
            setSelectedSubjects(prev => [...prev, { subject, role: "STUDENT_PREMIUM" }])
        } else {
            setSelectedSubjects(prev => prev.filter(s => s.subject !== subject))
        }
    }

    const handleChangeRole = (subject: string, newRole: string) => {
        setSelectedSubjects(prev => prev.map(s => 
            s.subject === subject ? { ...s, role: newRole } : s
        ))
    }

    const handleSaveAccess = async () => {
        if (!managingUser) return
        setIsSavingAccess(true)
        try {
            const res = await fetch(`/api/admin/users/${managingUser.id}/subjects`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subjects: selectedSubjects }),
            })

            if (!res.ok) throw new Error("Failed to save")
            toast.success("Akses mata kuliah berhasil diperbarui.")
            setManagingUser(null)
            fetchUsers()
        } catch (error) {
            toast.error("Gagal memperbarui akses.")
        } finally {
            setIsSavingAccess(false)
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
                                        <div className="relative flex-shrink-0">
                                            <div className="w-10 h-10 rounded-full bg-dark-brown flex items-center justify-center text-cream text-sm font-bold">
                                                {u.name.charAt(0).toUpperCase()}
                                            </div>
                                            {onlineUserIds.includes(u.auth_id) && (
                                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full animate-pulse" />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-semibold text-foreground truncate">{u.name}</p>
                                                {onlineUserIds.includes(u.auth_id) ? (
                                                    <Badge className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0">Online</Badge>
                                                ) : (
                                                    <Badge className="bg-gray-100 text-gray-500 text-[10px] px-1.5 py-0">Offline</Badge>
                                                )}
                                            </div>
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
                                                    <Badge variant="outline" className="text-[10px] text-muted-foreground border-warm-gray/40 font-normal">
                                                        {acc.role === 'STUDENT_PREMIUM' ? 'Student Premium' : 
                                                         acc.role === 'STUDENT_BASIC' ? 'Student Basic' :
                                                         acc.role}
                                                    </Badge>
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
                                            onClick={() => handleOpenManageAccess(u)}
                                            className="h-8 w-8 p-0 text-muted-foreground hover:text-dark-brown hover:bg-warm-beige/50"
                                            title="Kelola Akses"
                                        >
                                            <Settings2 className="w-4 h-4" />
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleToggleActive(u.id, u.is_active)}
                                            className="h-8 w-8 p-0"
                                            title={u.is_active ? "Nonaktifkan Pengguna" : "Aktifkan Pengguna"}
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
                                            title="Hapus Pengguna"
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

            {/* Delete Dialog */}
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

            {/* Manage Access Dialog */}
            <Dialog open={!!managingUser} onOpenChange={(open) => !open && setManagingUser(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Kelola Akses - {managingUser?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {["FISDAS2", "FISMAT"].map((subject) => {
                            const isSelected = selectedSubjects.some(s => s.subject === subject)
                            const currentRole = selectedSubjects.find(s => s.subject === subject)?.role || "STUDENT_PREMIUM"
                            
                            return (
                                <div key={subject} className="flex flex-col gap-3 p-3 border rounded-md border-warm-gray/40">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox 
                                            id={`subject-${subject}`} 
                                            checked={isSelected}
                                            onCheckedChange={(checked) => handleToggleSubject(subject, checked as boolean)}
                                        />
                                        <Label htmlFor={`subject-${subject}`} className="text-sm font-semibold cursor-pointer">
                                            {subject === "FISDAS2" ? "Fisika Dasar 2 (FISDAS2)" : "Fisika Matematika (FISMAT)"}
                                        </Label>
                                    </div>
                                    
                                    {isSelected && (
                                        <div className="pl-6 flex items-center gap-2">
                                            <Label className="text-xs text-muted-foreground min-w-[40px]">Role:</Label>
                                            <Select 
                                                value={currentRole === "STUDENT_BASIC" ? "STUDENT_PREMIUM" : currentRole} 
                                                onValueChange={(val) => handleChangeRole(subject, val)}
                                            >
                                                <SelectTrigger className="w-[180px] h-8 text-xs border-warm-gray/40">
                                                    <SelectValue placeholder="Pilih Role" />
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
                                    )}
                                </div>
                            )
                        })}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setManagingUser(null)} className="h-9">
                            Batal
                        </Button>
                        <Button 
                            onClick={handleSaveAccess} 
                            disabled={isSavingAccess}
                            className="bg-dark-brown hover:bg-dark-brown/90 text-cream h-9"
                        >
                            {isSavingAccess ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                            Simpan Perubahan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
