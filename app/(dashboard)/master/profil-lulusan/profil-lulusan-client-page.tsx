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
import { ProfilLulusanFormSheet } from "./profil-lulusan-form-sheet"
import { Plus, Edit, Power, PowerOff, Trash2 } from "lucide-react"
import { toggleProfilLulusanActive, deleteProfilLulusan } from "./actions"
import { toast } from "sonner"

type ProfilLulusanItem = {
  id: string
  kode: string
  nama: string
  deskripsi: string | null
  bidang_pekerjaan: string | null
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export function ProfilLulusanClientPage({ data, role }: { data: ProfilLulusanItem[], role: string }) {
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ProfilLulusanItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ProfilLulusanItem | null>(null)

  const canEdit = role === "SUPER_ADMIN" || role === "KAPRODI"

  const handleEdit = (item: ProfilLulusanItem) => {
    setSelectedItem(item)
    setIsSheetOpen(true)
  }

  const handleAddNew = () => {
    setSelectedItem(null)
    setIsSheetOpen(true)
  }

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const res = await toggleProfilLulusanActive(id, currentStatus)
    if (res.success) {
      toast.success("Status profil lulusan berhasil diubah")
    } else {
      toast.error(res.error)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    const res = await deleteProfilLulusan(deleteTarget.id)
    if (res.success) {
      toast.success("Profil lulusan berhasil dihapus")
    } else {
      toast.error(res.error)
    }
    setDeleteTarget(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Master Profil Lulusan</h1>
          <p className="text-muted-foreground">Kelola profil lulusan program studi</p>
        </div>
        {canEdit && (
          <Button onClick={handleAddNew} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Tambah Profil Lulusan
          </Button>
        )}
      </div>

      <div className="bg-white rounded-md border">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-16 text-center">Kode</TableHead>
              <TableHead className="w-44">Nama</TableHead>
              <TableHead>Deskripsi</TableHead>
              <TableHead className="w-60">Bidang Pekerjaan</TableHead>
              <TableHead className="w-24">Status</TableHead>
              {canEdit && <TableHead className="text-right w-36">Aksi</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              data.map((item) => (
                <TableRow key={item.id} className={!item.is_active ? "opacity-60 bg-gray-50" : ""}>
                  <TableCell className="font-semibold text-center align-top">{item.kode}</TableCell>
                  <TableCell className="font-medium align-top">{item.nama}</TableCell>
                  <TableCell className="align-top">
                    <div className="line-clamp-2 max-w-xs text-muted-foreground text-sm" title={item.deskripsi ?? "-"}>
                      {item.deskripsi ?? <span className="italic text-gray-400">-</span>}
                    </div>
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="flex flex-wrap gap-1.5" title={item.bidang_pekerjaan ?? "-"}>
                      {item.bidang_pekerjaan ? (
                        item.bidang_pekerjaan.split(",").map((bp, i) => (
                          <span key={i} className="bg-teal-50 text-teal-700 border border-teal-200 rounded-full px-2 py-0.5 text-xs truncate max-w-[200px]">
                            {bp.trim()}
                          </span>
                        ))
                      ) : (
                        <span className="italic text-gray-400 text-sm">-</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="align-top">
                    {item.is_active
                      ? <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Aktif</Badge>
                      : <Badge variant="outline" className="text-gray-500">Nonaktif</Badge>
                    }
                  </TableCell>
                  {canEdit && (
                    <TableCell className="text-right align-top">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(item)}
                          title="Ubah profil lulusan"
                        >
                          <Edit className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleStatus(item.id, item.is_active)}
                          title={item.is_active ? "Nonaktifkan" : "Aktifkan"}
                        >
                          {item.is_active
                            ? <PowerOff className="h-4 w-4 text-orange-500" />
                            : <Power className="h-4 w-4 text-green-600" />
                          }
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTarget(item)}
                          title="Hapus profil lulusan"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={canEdit ? 6 : 5} className="text-center py-10 text-gray-400">
                  Belum ada data profil lulusan. Klik &ldquo;Tambah Profil Lulusan&rdquo; untuk memulai.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ProfilLulusanFormSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        initialData={selectedItem}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Profil Lulusan?</AlertDialogTitle>
            <AlertDialogDescription>
              Profil lulusan <strong>{deleteTarget?.kode} — {deleteTarget?.nama}</strong> akan dihapus permanen.
              Data ini tidak dapat dipulihkan. Pastikan profil ini belum terhubung ke CPL manapun.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
