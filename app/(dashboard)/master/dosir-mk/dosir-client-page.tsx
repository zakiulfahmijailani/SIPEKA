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
import { DosirFormSheet } from "./dosir-form-sheet"
import { Plus, Edit, Trash2, Search } from "lucide-react"
import { deleteDosirMk } from "./actions"
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
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function DosirClientPage({ 
  dosirs, 
  mks, 
  dosens, 
  tas,
  activeTaId
}: { 
  dosirs: any[], 
  mks: any[], 
  dosens: any[], 
  tas: any[],
  activeTaId?: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [selectedDosir, setSelectedDosir] = useState<any | null>(null)
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [dosirToDelete, setDosirToDelete] = useState<string | null>(null)

  const currentTa = searchParams.get("ta") || activeTaId || "ALL"
  const currentMk = searchParams.get("mk") || "ALL"
  const currentDosen = searchParams.get("dosen") || "ALL"

  const handleEdit = (dosir: any) => {
    setSelectedDosir(dosir)
    setIsSheetOpen(true)
  }

  const handleAddNew = () => {
    setSelectedDosir(null)
    setIsSheetOpen(true)
  }

  const handleDelete = async () => {
    if (!dosirToDelete) return
    try {
      const res = await deleteDosirMk(dosirToDelete)
      if (res.success) {
        toast.success("Penugasan berhasil dihapus")
      } else {
        toast.error(res.error)
      }
    } catch (e) {
      toast.error("Terjadi kesalahan sistem")
    } finally {
      setIsDeleteDialogOpen(false)
      setDosirToDelete(null)
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dosir Mata Kuliah</h1>
          <p className="text-muted-foreground">Penugasan dosen pengampu per tahun akademik</p>
        </div>
        <Button onClick={handleAddNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Tambah Penugasan
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Tahun Akademik</label>
          <select 
            className="h-9 w-[180px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={currentTa}
            onChange={(e) => handleFilter("ta", e.target.value)}
          >
            <option value="ALL">Semua TA</option>
            {tas.map(ta => <option key={ta.id} value={ta.id}>{ta.label}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Mata Kuliah</label>
          <select 
            className="h-9 w-[220px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={currentMk}
            onChange={(e) => handleFilter("mk", e.target.value)}
          >
            <option value="ALL">Semua Mata Kuliah</option>
            {mks.map(mk => <option key={mk.id} value={mk.id}>{mk.label}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Dosen</label>
          <select 
            className="h-9 w-[200px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={currentDosen}
            onChange={(e) => handleFilter("dosen", e.target.value)}
          >
            <option value="ALL">Semua Dosen</option>
            {dosens.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-md border">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead>Mata Kuliah</TableHead>
              <TableHead>Dosen Pengampu</TableHead>
              <TableHead>Kelas</TableHead>
              <TableHead>TA</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dosirs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Tidak ada data penugasan ditemukan.
                </TableCell>
              </TableRow>
            ) : dosirs.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-semibold">{item.mk.kode}</span>
                    <span className="text-xs text-muted-foreground">{item.mk.nama_id}</span>
                  </div>
                </TableCell>
                <TableCell>{item.dosen.nama_lengkap}</TableCell>
                <TableCell><Badge variant="outline" className="font-bold">{item.kelas}</Badge></TableCell>
                <TableCell>{item.tahunAkademik.kode}</TableCell>
                <TableCell>
                  {item.is_active === "true" 
                    ? <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none">AKTIF</Badge>
                    : <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-none">NON-AKTIF</Badge>
                  }
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                      <Edit className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => {
                      setDosirToDelete(item.id)
                      setIsDeleteDialogOpen(true)
                    }}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <DosirFormSheet 
        open={isSheetOpen} 
        onOpenChange={setIsSheetOpen} 
        initialData={selectedDosir}
        mks={mks}
        dosens={dosens}
        tas={tas}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Penugasan?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Menghapus penugasan dosen juga dapat mempengaruhi data RPS yang terkait.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
