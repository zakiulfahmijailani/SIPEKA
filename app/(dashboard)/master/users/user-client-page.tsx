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
import { Plus, Edit, Key, Power, PowerOff } from "lucide-react"
import { toggleUserActive } from "./actions"
import { toast } from "sonner"
import { useRouter, useSearchParams } from "next/navigation"

export function UserClientPage({ users }: { users: any[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)
  const [userToReset, setUserToReset] = useState<{id: string, name: string} | null>(null)

  const currentRole = searchParams.get("role") || "ALL"
  const currentStatus = searchParams.get("status") || "ALL"

  const handleEdit = (user: any) => {
    setSelectedUser(user)
    setIsSheetOpen(true)
  }

  const handleAddNew = () => {
    setSelectedUser(null)
    setIsSheetOpen(true)
  }

  const handleResetPassword = (user: any) => {
    setUserToReset({ id: user.id, name: user.nama_lengkap })
    setIsResetModalOpen(true)
  }

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await toggleUserActive(id, currentStatus)
      if (res.success) {
        toast.success("Status user berhasil diubah")
      } else {
        toast.error(res.error)
      }
    } catch (e) {
      toast.error("Terjadi kesalahan sistem")
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

  const getRoleBadge = (role: string) => {
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
          <h1 className="text-2xl font-bold tracking-tight">Manajemen User</h1>
          <p className="text-muted-foreground">Kelola akun dan hak akses pengguna</p>
        </div>
        <Button onClick={handleAddNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Tambah User
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
    </div>
  )
}
