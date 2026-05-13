"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, Search, MoreVertical, Edit, Trash, Upload, Filter } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { MahasiswaFormSheet } from "./mahasiswa-form-sheet"
import { ImportModal } from "./import-modal"
import { deleteMahasiswa } from "./actions"
import { toast } from "sonner"

export function MahasiswaClientPage({ students }: { students: any[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null)
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "")

  const currentStatus = searchParams.get("status") || "ALL"
  const currentAngkatan = searchParams.get("angkatan") || "ALL"

  // Get unique angkatan for filter
  const allAngkatan = Array.from(new Set(students.map(s => s.angkatan))).sort((a, b) => b - a)

  const handleEdit = (student: any) => {
    setSelectedStudent(student)
    setIsSheetOpen(true)
  }

  const handleAddNew = () => {
    setSelectedStudent(null)
    setIsSheetOpen(true)
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

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString())
    if (searchTerm) {
      params.set("q", searchTerm)
    } else {
      params.delete("q")
    }
    router.push(`?${params.toString()}`)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus data mahasiswa ini?")) {
      const res = await deleteMahasiswa(id)
      if (res.success) {
        toast.success("Mahasiswa berhasil dihapus")
      } else {
        toast.error(res.error || "Gagal menghapus")
      }
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "AKTIF": return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none">AKTIF</Badge>
      case "CUTI": return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-none">CUTI</Badge>
      case "LULUS": return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-none">LULUS</Badge>
      case "DO": return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-none">DO</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manajemen Mahasiswa</h1>
          <p className="text-muted-foreground">Kelola basis data mahasiswa Program Studi</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsImportOpen(true)} className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Import CSV
          </Button>
          <Button onClick={handleAddNew} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Tambah Mahasiswa
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 py-2">
        <div className="flex gap-2 flex-1 min-w-[300px]">
          <Input 
            placeholder="Cari NIM atau Nama..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="max-w-sm"
          />
          <Button variant="secondary" onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2">
          <select 
            className="h-9 w-[150px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            value={currentAngkatan}
            onChange={(e) => handleFilter("angkatan", e.target.value)}
          >
            <option value="ALL">Semua Angkatan</option>
            {allAngkatan.map(a => <option key={a} value={a.toString()}>{a}</option>)}
          </select>

          <select 
            className="h-9 w-[150px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            value={currentStatus}
            onChange={(e) => handleFilter("status", e.target.value)}
          >
            <option value="ALL">Semua Status</option>
            <option value="AKTIF">Aktif</option>
            <option value="CUTI">Cuti</option>
            <option value="LULUS">Lulus</option>
            <option value="DO">Drop Out</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-md border">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-[150px]">NIM</TableHead>
              <TableHead>Nama Mahasiswa</TableHead>
              <TableHead className="w-[120px]">Angkatan</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead className="w-[120px]">Track</TableHead>
              <TableHead className="text-right w-[80px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.length > 0 ? (
              students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-mono font-medium">{student.nim}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{student.nama_lengkap}</span>
                      {student.email && <span className="text-xs text-muted-foreground">{student.email}</span>}
                    </div>
                  </TableCell>
                  <TableCell>{student.angkatan}</TableCell>
                  <TableCell>{getStatusBadge(student.status)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{student.track}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
                        <MoreVertical className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(student)} className="flex items-center gap-2">
                          <Edit className="h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(student.id)} className="flex items-center gap-2 text-red-600">
                          <Trash className="h-4 w-4" /> Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Data mahasiswa tidak ditemukan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <MahasiswaFormSheet 
        open={isSheetOpen} 
        onOpenChange={setIsSheetOpen} 
        initialData={selectedStudent} 
      />

      <ImportModal 
        open={isImportOpen} 
        onOpenChange={setIsImportOpen} 
      />
    </div>
  )
}
