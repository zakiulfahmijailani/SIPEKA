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
import { CplFormSheet } from "./cpl-form-sheet"
import { Plus, Edit, Power, PowerOff } from "lucide-react"
import { toggleCPLActive } from "./actions"
import { toast } from "sonner"

export function CplClientPage({ cpls, role }: { cpls: any[], role: string }) {
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [selectedCpl, setSelectedCpl] = useState<any | null>(null)
  
  const canEdit = role === "SUPER_ADMIN" || role === "KAPRODI"

  const handleEdit = (cpl: any) => {
    setSelectedCpl({
      ...cpl,
      is_active: cpl.is_active
    })
    setIsSheetOpen(true)
  }

  const handleAddNew = () => {
    setSelectedCpl(null)
    setIsSheetOpen(true)
  }

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await toggleCPLActive(id, currentStatus)
      if (res.success) {
        toast.success("Status CPL berhasil diubah")
      } else {
        toast.error(res.error)
      }
    } catch (e) {
      toast.error("Terjadi kesalahan sistem")
    }
  }

  const getDomainBadge = (domain: string) => {
    switch (domain) {
      case "SIKAP":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-none">Sikap</Badge>
      case "PENGETAHUAN":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none">Pengetahuan</Badge>
      case "KETERAMPILAN_UMUM":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 border-none">KU</Badge>
      case "KETERAMPILAN_KHUSUS":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 border-none">KK</Badge>
      default:
        return <Badge variant="outline">{domain}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Master CPL</h1>
          <p className="text-muted-foreground">Kelola Capaian Pembelajaran Lulusan (CPL)</p>
        </div>
        {canEdit && (
          <Button onClick={handleAddNew} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Tambah CPL
          </Button>
        )}
      </div>

      <div className="bg-white rounded-md border">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-24">Urutan</TableHead>
              <TableHead className="w-24">Kode</TableHead>
              <TableHead className="w-32">Domain</TableHead>
              <TableHead>Rumusan</TableHead>
              <TableHead className="w-24">Status</TableHead>
              {canEdit && <TableHead className="text-right w-32">Aksi</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {cpls.length > 0 ? (
              cpls.map((item) => (
                <TableRow key={item.id} className={item.is_active !== "true" ? "opacity-60 bg-gray-50" : ""}>
                  <TableCell className="font-medium text-center">{item.urutan}</TableCell>
                  <TableCell className="font-semibold">
                    <div className="flex flex-col">
                      <span>{item.kode}</span>
                      <span className="text-xs text-muted-foreground">({item.slug})</span>
                    </div>
                  </TableCell>
                  <TableCell>{getDomainBadge(item.domain)}</TableCell>
                  <TableCell>
                    <div className="truncate max-w-md xl:max-w-xl" title={item.rumusan}>
                      {item.rumusan}
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.is_active 
                      ? <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Aktif</Badge>
                      : <Badge variant="outline" className="text-gray-500">Nonaktif</Badge>
                    }
                  </TableCell>
                  {canEdit && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleEdit(item)}
                          title="Ubah CPL"
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
                            ? <PowerOff className="h-4 w-4 text-red-500" />
                            : <Power className="h-4 w-4 text-green-600" />
                          }
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={canEdit ? 6 : 5} className="text-center py-8 text-gray-500">
                  Belum ada data CPL.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <CplFormSheet 
        open={isSheetOpen} 
        onOpenChange={setIsSheetOpen} 
        initialData={selectedCpl}
      />
    </div>
  )
}
