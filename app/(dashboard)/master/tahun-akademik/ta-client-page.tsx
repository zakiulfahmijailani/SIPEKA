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
import { TaFormSheet } from "./ta-form-sheet"
import { Plus, Edit, CheckCircle } from "lucide-react"
import { setAktifTahunAkademik } from "./actions"
import { toast } from "sonner"
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

export function TaClientPage({ tas, role }: { tas: any[], role: string }) {
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [selectedTa, setSelectedTa] = useState<any | null>(null)
  const [taToActivate, setTaToActivate] = useState<string | null>(null)
  const [isAlertOpen, setIsAlertOpen] = useState(false)

  const handleEdit = (ta: any) => {
    setSelectedTa(ta)
    setIsSheetOpen(true)
  }

  const handleAddNew = () => {
    setSelectedTa(null)
    setIsSheetOpen(true)
  }

  const handleSetAktif = async () => {
    if (!taToActivate) return
    try {
      const res = await setAktifTahunAkademik(taToActivate)
      if (res.success) {
        toast.success("Tahun Akademik aktif berhasil diubah")
      } else {
        toast.error(res.error)
      }
    } catch (e) {
      toast.error("Terjadi kesalahan sistem")
    } finally {
      setIsAlertOpen(false)
      setTaToActivate(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manajemen Tahun Akademik</h1>
          <p className="text-muted-foreground">Kelola periode akademik aktif</p>
        </div>
        <Button onClick={handleAddNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Tambah TA
        </Button>
      </div>

      <div className="bg-white rounded-md border">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead>Kode</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Semester</TableHead>
              <TableHead>Tahun Mulai</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tas.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.kode}</TableCell>
                <TableCell>{item.nama}</TableCell>
                <TableCell>{item.semester === 1 ? "1 (Ganjil)" : "2 (Genap)"}</TableCell>
                <TableCell>{item.tahun_mulai}</TableCell>
                <TableCell>
                  {item.is_active === "true" 
                    ? <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none">AKTIF</Badge>
                    : <Badge variant="outline" className="text-gray-400">Non-aktif</Badge>
                  }
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {item.is_active !== "true" && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-green-600 border-green-200 hover:bg-green-50"
                        onClick={() => {
                          setTaToActivate(item.id)
                          setIsAlertOpen(true)
                        }}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Jadikan Aktif
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                      <Edit className="h-4 w-4 text-blue-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <TaFormSheet 
        open={isSheetOpen} 
        onOpenChange={setIsSheetOpen} 
        initialData={selectedTa}
      />

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Pengaktifan TA</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menjadikan Tahun Akademik ini sebagai yang aktif? 
              TA lainnya akan otomatis dinonaktifkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleSetAktif} className="bg-green-600 hover:bg-green-700">
              Ya, Aktifkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
