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
import { MkFormSheet } from "./mk-form-sheet"
import { Plus, Edit, Check } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import type { MKFormValues } from "./mk-form-sheet"

type MkRow = {
  id: string
  kode: string
  nama_id: string
  nama_en: string | null
  sks_teori: number
  sks_praktik: number
  semester_rekomendasi: number
  status: "WAJIB" | "PILIHAN"
  track: "UMUM" | "BIS" | "DSA" | "ISG" | "DMS"
  tipe_aktivitas: MKFormValues["tipe_aktivitas"]
  deskripsi: string | null
  has_praktikum: boolean
  is_pbl: boolean
  cplCount?: number
}

export function MkClientPage({ mks, role }: { mks: MkRow[]; role: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [selectedMk, setSelectedMk] = useState<MKFormValues | null>(null)
  
  const currentSemester = searchParams.get("semester") || "ALL"
  const currentStatus = searchParams.get("status") || "ALL"
  const currentTrack = searchParams.get("track") || "ALL"

  const canEdit = role === "SUPER_ADMIN" || role === "KAPRODI"

  const handleEdit = (mk: MkRow) => {
    const normalizedTrack = mk.track === "BIS" ? "ISG" : mk.track === "DSA" ? "DMS" : mk.track
    setSelectedMk({
      id: mk.id,
      kode: mk.kode,
      nama_id: mk.nama_id,
      nama_en: mk.nama_en ?? "",
      sks_teori: mk.sks_teori,
      sks_praktik: mk.sks_praktik,
      semester_rekomendasi: mk.semester_rekomendasi,
      status: mk.status,
      track: normalizedTrack,
      tipe_aktivitas: mk.tipe_aktivitas,
      deskripsi: mk.deskripsi ?? "",
    })
    setIsSheetOpen(true)
  }

  const handleAddNew = () => {
    setSelectedMk(null)
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

  const getTrackBadge = (track: string) => {
    switch (track) {
      case "UMUM":
        return <Badge variant="outline" className="text-gray-600 bg-gray-50 border-gray-200">Umum</Badge>
      case "ISG":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-none">ISG</Badge>
      case "DMS":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none">DMS</Badge>
      default:
        return <Badge variant="outline">{track}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Master Mata Kuliah</h1>
          <p className="text-muted-foreground">Kelola daftar Mata Kuliah Program Studi</p>
        </div>
        {canEdit && (
          <Button onClick={handleAddNew} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Tambah MK
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 py-2">
        <select 
          className="h-9 w-[180px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={currentSemester}
          onChange={(e) => handleFilter("semester", e.target.value)}
        >
          <option value="ALL">Semua Semester</option>
          {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s.toString()}>Semester {s}</option>)}
        </select>
        
        <select 
          className="h-9 w-[180px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={currentStatus}
          onChange={(e) => handleFilter("status", e.target.value)}
        >
          <option value="ALL">Semua Status</option>
          <option value="WAJIB">Wajib</option>
          <option value="PILIHAN">Pilihan</option>
        </select>

        <select 
          className="h-9 w-[180px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={currentTrack}
          onChange={(e) => handleFilter("track", e.target.value)}
        >
          <option value="ALL">Semua Track</option>
          <option value="UMUM">Umum</option>
          <option value="ISG">Information Systems &amp; Governance</option>
          <option value="DMS">Data Management Systems</option>
        </select>
      </div>

      <div className="bg-white rounded-md border">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-24">Kode</TableHead>
              <TableHead>Nama Mata Kuliah</TableHead>
              <TableHead className="w-24 text-center">SKS</TableHead>
              <TableHead className="w-24 text-center">Semester</TableHead>
              <TableHead className="w-24">Track</TableHead>
              <TableHead className="w-24">Status</TableHead>
              <TableHead className="w-24 text-center">Prak.</TableHead>
              <TableHead className="w-24 text-center">PBL</TableHead>
              <TableHead className="w-24 text-center">CPL Terkait</TableHead>
              {canEdit && <TableHead className="text-right w-24">Aksi</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {mks.length > 0 ? (
              mks.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-semibold">{item.kode}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{item.nama_id}</span>
                      {item.nama_en && <span className="text-xs text-muted-foreground italic">{item.nama_en}</span>}
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {item.sks_teori + item.sks_praktik} 
                    <span className="text-xs text-muted-foreground font-normal ml-1">
                      ({item.sks_teori}T{item.sks_praktik > 0 ? `+${item.sks_praktik}P` : ''})
                    </span>
                  </TableCell>
                  <TableCell className="text-center">{item.semester_rekomendasi}</TableCell>
                  <TableCell>{getTrackBadge(item.track)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={item.status === "WAJIB" ? "border-blue-200 text-blue-700 bg-blue-50" : "border-amber-200 text-amber-700 bg-amber-50"}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {item.has_praktikum ? (
                      <Check className="h-4 w-4 mx-auto text-green-600" />
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {item.is_pbl ? (
                      <Check className="h-4 w-4 mx-auto text-purple-600" />
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="cursor-pointer hover:bg-gray-200" title="Klik untuk lihat pemetaan CPL">
                      {item.cplCount || 0} CPL
                    </Badge>
                  </TableCell>
                  {canEdit && (
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEdit(item)}
                        title="Ubah Mata Kuliah"
                      >
                        <Edit className="h-4 w-4 text-blue-600" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={canEdit ? 10 : 9} className="text-center py-8 text-gray-500">
                  Tidak ada data Mata Kuliah yang sesuai.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <MkFormSheet 
        open={isSheetOpen} 
        onOpenChange={setIsSheetOpen} 
        initialData={selectedMk}
      />
    </div>
  )
}
