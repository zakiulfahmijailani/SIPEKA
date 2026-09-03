"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { UserFormSheet } from "./user-form-sheet"
import { ResetPasswordModal } from "./reset-password-modal"
import { Plus, Edit, Key, Power, PowerOff, LogIn, Loader2, ShieldCheck, AlertCircle } from "lucide-react"
import { toggleUserActive } from "./actions"
import { startDosenImpersonation } from "@/app/actions/impersonation"
import { toast } from "sonner"
import { useRouter, useSearchParams } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type ManagedUser = {
  id: string
  email: string
  nama_lengkap: string
  nidn: string | null
  role: "SUPER_ADMIN" | "KAPRODI" | "DOSEN" | "VIEWER"
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export function UserClientPage({ users }: { users: ManagedUser[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null)
  
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)
  const [userToReset, setUserToReset] = useState<{id: string, name: string} | null>(null)
  const [userToImpersonate, setUserToImpersonate] = useState<ManagedUser | null>(null)
  const [isImpersonating, setIsImpersonating] = useState(false)

  const currentRole = searchParams.get("role") || "ALL"
  const currentStatus = searchParams.get("status") || "ALL"

  const handleEdit = (user: ManagedUser) => {
    setSelectedUser(user)
    setIsSheetOpen(true)
  }

  const handleAddNew = () => {
    setSelectedUser(null)
    setIsSheetOpen(true)
  }

  const handleResetPassword = (user: ManagedUser) => {
    setUserToReset({ id: user.id, name: user.nama_lengkap })
    setIsResetModalOpen(true)
  }

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await toggleUserActive(id, currentStatus)
      if (res.success) {
        toast.success("Status pengguna berhasil diubah")
      } else {
        toast.error(res.error)
      }
    } catch {
      toast.error("Terjadi kesalahan sistem")
    }
  }

  const handleImpersonate = async () => {
    if (!userToImpersonate) return
    setIsImpersonating(true)
    try {
      const result = await startDosenImpersonation(userToImpersonate.id)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      window.location.assign("/dashboard")
    } catch {
      toast.error("Gagal masuk sebagai dosen")
    } finally {
      setIsImpersonating(false)
    }
  }

  const handleFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "ALL") {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`?${params.toString()}`)
  }

  const getRoleBadge = (role: ManagedUser["role"]) => {
    switch (role) {
      case "SUPER_ADMIN":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-none">SUPER ADMIN</Badge>
      case "KAPRODI":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 border-none">KAPRODI</Badge>
      case "DOSEN":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-none">DOSEN</Badge>
      default:
        return <Badge variant="secondary">{role}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manajemen Pengguna</h1>
          <p className="text-muted-foreground">Kelola akun dan hak akses pengguna</p>
        </div>
        <Button onClick={handleAddNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Tambah Pengguna
        </Button>
      </div>

      <div className="flex gap-2">
        <select 
          className="h-9 w-[180px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={currentRole}
          onChange={(e) => handleFilter("role", e.target.value)}
        >
          <option value="ALL">Semua Role</option>
          <option value="SUPER_ADMIN">SUPER ADMIN</option>
          <option value="KAPRODI">KAPRODI</option>
          <option value="DOSEN">DOSEN</option>
          <option value="VIEWER">VIEWER</option>
        </select>
        
        <select 
          className="h-9 w-[180px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={currentStatus}
          onChange={(e) => handleFilter("status", e.target.value)}
        >
          <option value="ALL">Semua Status</option>
          <option value="true">Aktif</option>
          <option value="false">Non-aktif</option>
        </select>
      </div>

      <div className="bg-white rounded-md border">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>NIDN</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.nama_lengkap}</TableCell>
                <TableCell>{item.email}</TableCell>
                <TableCell>{item.nidn || "-"}</TableCell>
                <TableCell>{getRoleBadge(item.role)}</TableCell>
                <TableCell>
                  {item.is_active 
                    ? <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none">Aktif</Badge>
                    : <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-none">Non-aktif</Badge>
                  }
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {item.role === "DOSEN" && item.is_active && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-blue-700"
                        onClick={() => setUserToImpersonate(item)}
                        title={`Masuk sebagai ${item.nama_lengkap}`}
                      >
                        <LogIn className="h-4 w-4" />
                        Masuk
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => handleResetPassword(item)} title="Atur Ulang Kata Sandi">
                      <Key className="h-4 w-4 text-amber-600" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(item)} title="Ubah Data">
                      <Edit className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleToggleStatus(item.id, item.is_active)}>
                      {item.is_active 
                        ? <PowerOff className="h-4 w-4 text-red-500" />
                        : <Power className="h-4 w-4 text-green-600" />
                      }
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <UserFormSheet 
        open={isSheetOpen} 
        onOpenChange={setIsSheetOpen} 
        initialData={selectedUser}
      />

      <ResetPasswordModal 
        open={isResetModalOpen}
        onOpenChange={setIsResetModalOpen}
        userId={userToReset?.id || null}
        userName={userToReset?.name || null}
      />

      <AlertDialog
        open={Boolean(userToImpersonate)}
        onOpenChange={(open) => {
          if (!open && !isImpersonating) setUserToImpersonate(null)
        }}
      >
        <AlertDialogContent className="sm:max-w-[480px]">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <AlertDialogTitle className="text-lg font-semibold text-slate-900">
                Masuk sebagai Dosen?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-slate-600">
                Anda akan mengakses SIPEKA dengan hak akses akun berikut:
              </AlertDialogDescription>
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white shadow-sm">
              {userToImpersonate?.nama_lengkap?.charAt(0).toUpperCase() || "D"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">
                {userToImpersonate?.nama_lengkap}
              </p>
              <p className="truncate text-xs text-slate-500">
                {userToImpersonate?.email} {userToImpersonate?.nidn ? `• NIDN: ${userToImpersonate.nidn}` : ""}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-lg border border-amber-200/70 bg-amber-50/70 p-3 text-xs text-amber-900 leading-relaxed">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
            <span>
              Mode ini dapat dihentikan kapan saja via banner di atas. Semua tindakan akan dicatat pada <strong>audit log</strong>.
            </span>
          </div>

          <AlertDialogFooter className="mt-1 flex items-center justify-end gap-2.5">
            <AlertDialogCancel disabled={isImpersonating}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isImpersonating}
              onClick={handleImpersonate}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2 px-4 shadow-sm"
            >
              {isImpersonating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="h-4 w-4" />
              )}
              Masuk sebagai Dosen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
