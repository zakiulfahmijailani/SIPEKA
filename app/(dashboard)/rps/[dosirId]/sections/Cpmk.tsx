"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Trash, Loader2 } from "lucide-react"
import { debounce } from "lodash"
import { saveCpmks, deleteCpmk } from "../../actions"
import { toast } from "sonner"

interface CpmkSectionProps {
  rpsId: string
  initialCpmks: any[]
  mappedCpls: any[]
}

export function CpmkSection({ rpsId, initialCpmks, mappedCpls }: CpmkSectionProps) {
  const [cpmks, setCpmks] = useState<any[]>(
    initialCpmks.length > 0 ? initialCpmks.map(c => ({
      ...c,
      cpl_id: c.cplMappings?.[0]?.cpl_id || ""
    })) : []
  )
  const [isSaving, setIsSaving] = useState(false)

  // Auto-save logic
  const debouncedSave = useCallback(
    debounce(async (data: any[]) => {
      setIsSaving(true)
      const res = await saveCpmks(rpsId, data)
      if (res.success) {
        // toast.success("CPMK disimpan otomatis", { duration: 1000 })
      }
      setIsSaving(false)
    }, 1500),
    [rpsId]
  )

  const handleAdd = () => {
    const newCpmk = {
      kode: `CPMK${cpmks.length + 1}`,
      deskripsi: "",
      cpl_id: mappedCpls[0]?.id || "",
      urutan: cpmks.length + 1
    }
    setCpmks([...cpmks, newCpmk])
  }

  const handleDelete = async (id: string, index: number) => {
    if (id) {
      const res = await deleteCpmk(id)
      if (!res.success) return toast.error("Gagal menghapus")
    }
    const updated = cpmks.filter((_, i) => i !== index)
    setCpmks(updated)
    debouncedSave(updated)
  }

  const handleChange = (index: number, field: string, value: any) => {
    const updated = [...cpmks]
    updated[index][field] = value
    setCpmks(updated)
    debouncedSave(updated)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Capaian Pembelajaran Mata Kuliah (CPMK)</h2>
          <p className="text-sm text-muted-foreground">Rumusan kompetensi yang diturunkan dari CPL</p>
        </div>
        <div className="flex items-center gap-2">
           {isSaving && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
           <Button variant="outline" size="sm" onClick={handleAdd} className="gap-2">
             <Plus className="h-4 w-4" /> Tambah CPMK
           </Button>
        </div>
      </div>

      <div className="space-y-6">
        {cpmks.map((c, idx) => (
          <div key={idx} className="p-6 border rounded-xl bg-white shadow-sm space-y-4 relative group">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-2 right-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleDelete(c.id, idx)}
            >
              <Trash className="h-4 w-4" />
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               <div className="space-y-2">
                 <Label className="text-xs uppercase text-gray-500 font-bold">Kode</Label>
                 <Input value={c.kode} readOnly className="bg-gray-50 font-mono" />
               </div>
               <div className="md:col-span-3 space-y-2">
                 <Label className="text-xs uppercase text-gray-500 font-bold">CPL Terkait</Label>
                 <Select 
                   value={c.cpl_id} 
                   onValueChange={(val) => handleChange(idx, "cpl_id", val || "")}
                 >
                   <SelectTrigger>
                     <SelectValue placeholder="Pilih CPL" />
                   </SelectTrigger>
                   <SelectContent>
                     {mappedCpls.map(m => (
                       <SelectItem key={m.id} value={m.id}>{m.kode} - {m.rumusan.substring(0, 80)}...</SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase text-gray-500 font-bold">Rumusan CPMK</Label>
              <Textarea 
                placeholder="Contoh: Mahasiswa mampu merancang basis data relasional..." 
                value={c.deskripsi}
                onChange={(e) => handleChange(idx, "deskripsi", e.target.value)}
                rows={3}
              />
            </div>
          </div>
        ))}

        {cpmks.length === 0 && (
          <div className="py-12 text-center border-2 border-dashed rounded-xl bg-gray-50">
            <p className="text-muted-foreground">Belum ada CPMK. Klik "Tambah CPMK" untuk memulai.</p>
          </div>
        )}
      </div>
    </div>
  )
}
