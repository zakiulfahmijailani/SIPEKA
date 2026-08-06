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
import { Plus, Trash, Loader2, Layers3 } from "lucide-react"
import { debounce } from "lodash"
import { saveCpmks, deleteCpmk, deleteSubCpmk } from "../../actions"
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
      cpl_id: c.cplMappings?.[0]?.cpl_id || "",
      subCpmks: c.subCpmks || [],
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
      urutan: cpmks.length + 1,
      subCpmks: [],
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

  const handleAddSubCpmk = (cpmkIndex: number) => {
    const updated = [...cpmks]
    const parent = updated[cpmkIndex]
    const subItems = parent.subCpmks || []
    parent.subCpmks = [
      ...subItems,
      {
        kode: `${parent.kode}.${subItems.length + 1}`,
        deskripsi: "",
        level_bloom: "C3",
        urutan: subItems.length + 1,
      },
    ]
    setCpmks(updated)
  }

  const handleSubChange = (cpmkIndex: number, subIndex: number, field: string, value: string) => {
    const updated = [...cpmks]
    updated[cpmkIndex].subCpmks[subIndex][field] = value
    setCpmks(updated)
    debouncedSave(updated)
  }

  const handleDeleteSubCpmk = async (cpmkIndex: number, subIndex: number) => {
    const target = cpmks[cpmkIndex].subCpmks[subIndex]
    if (target.id) {
      const result = await deleteSubCpmk(target.id)
      if (!result.success) return toast.error(result.error)
    }
    const updated = [...cpmks]
    updated[cpmkIndex].subCpmks = updated[cpmkIndex].subCpmks.filter((_: any, index: number) => index !== subIndex)
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

            <div className="space-y-3 rounded-lg border border-blue-100 bg-blue-50/40 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="flex items-center gap-2 text-sm font-semibold text-blue-950">
                    <Layers3 className="h-4 w-4" /> Sub-CPMK
                  </p>
                  <p className="text-xs text-blue-700/70">Kemampuan akhir yang diukur pada pertemuan dan penugasan.</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => handleAddSubCpmk(idx)}>
                  <Plus className="h-3.5 w-3.5" /> Tambah Sub-CPMK
                </Button>
              </div>

              <div className="space-y-3">
                {(c.subCpmks || []).map((sub: any, subIndex: number) => (
                  <div key={sub.id || `${sub.kode}-${subIndex}`} className="grid gap-3 rounded-lg border bg-white p-3 md:grid-cols-[130px_110px_1fr_40px]">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase text-gray-500">Kode</Label>
                      <Input
                        value={sub.kode}
                        onChange={(event) => handleSubChange(idx, subIndex, "kode", event.target.value)}
                        className="font-mono text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase text-gray-500">Level Bloom</Label>
                      <Select
                        value={sub.level_bloom || "C3"}
                        onValueChange={(value) => handleSubChange(idx, subIndex, "level_bloom", value || "C3")}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {["C1", "C2", "C3", "C4", "C5", "C6"].map((level) => (
                            <SelectItem key={level} value={level}>{level}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase text-gray-500">Rumusan Sub-CPMK</Label>
                      <Textarea
                        value={sub.deskripsi}
                        onChange={(event) => handleSubChange(idx, subIndex, "deskripsi", event.target.value)}
                        placeholder="Mahasiswa mampu menjelaskan, menerapkan, atau mengevaluasi..."
                        className="min-h-10"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button type="button" variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeleteSubCpmk(idx, subIndex)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {(c.subCpmks || []).length === 0 && (
                  <p className="rounded-md border border-dashed border-blue-200 bg-white/60 px-3 py-5 text-center text-xs text-blue-700/70">
                    Belum ada Sub-CPMK untuk CPMK ini.
                  </p>
                )}
              </div>
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
