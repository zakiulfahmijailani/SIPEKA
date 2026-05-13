"use client"

import { useState, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Plus, Trash, Loader2, AlertCircle } from "lucide-react"
import { debounce } from "lodash"
import { saveKomponens } from "../../actions"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

interface AssessmentSectionProps {
  rpsId: string
  initialKomponens: any[]
  cpmks: any[]
}

export function AssessmentSection({ rpsId, initialKomponens, cpmks }: AssessmentSectionProps) {
  const [komponens, setKomponens] = useState<any[]>(
    initialKomponens.map(k => ({
      ...k,
      cpmk_ids: k.cpmkMappings?.map((m: any) => m.cpmk_id) || []
    }))
  )
  const [isSaving, setIsSaving] = useState(false)

  const totalBobot = useMemo(() => {
    return komponens.reduce((sum, k) => sum + (k.bobot || 0), 0)
  }, [komponens])

  const debouncedSave = useCallback(
    debounce(async (data: any[]) => {
      setIsSaving(true)
      await saveKomponens(rpsId, data)
      setIsSaving(false)
    }, 1500),
    [rpsId]
  )

  const handleAdd = () => {
    const newItem = {
      nama: "",
      tipe: "TUGAS",
      bobot: 0,
      cpmk_ids: [],
      urutan: komponens.length + 1
    }
    setKomponens([...komponens, newItem])
  }

  const handleDelete = (index: number) => {
    const updated = komponens.filter((_, i) => i !== index)
    setKomponens(updated)
    debouncedSave(updated)
  }

  const handleChange = (index: number, field: string, value: any) => {
    const updated = [...komponens]
    updated[index][field] = value
    setKomponens(updated)
    debouncedSave(updated)
  }

  const toggleCpmk = (compIndex: number, cpmkId: string) => {
    const updated = [...komponens]
    const current = updated[compIndex].cpmk_ids
    if (current.includes(cpmkId)) {
      updated[compIndex].cpmk_ids = current.filter((id: string) => id !== cpmkId)
    } else {
      updated[compIndex].cpmk_ids = [...current, cpmkId]
    }
    setKomponens(updated)
    debouncedSave(updated)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Komponen Penilaian</h2>
          <p className="text-sm text-muted-foreground">Definisikan bobot nilai dan pemetaan ke CPMK</p>
        </div>
        <div className="flex items-center gap-2">
           {isSaving && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
           <Button variant="outline" size="sm" onClick={handleAdd} className="gap-2">
             <Plus className="h-4 w-4" /> Tambah Komponen
           </Button>
        </div>
      </div>

      {/* Progres Bobot */}
      <div className="p-4 border rounded-lg bg-gray-50/50 space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="font-medium">Total Bobot</span>
          <span className={cn(
            "font-bold",
            totalBobot === 100 ? "text-green-600" : "text-red-600"
          )}>
            {totalBobot}% / 100%
          </span>
        </div>
        <Progress value={totalBobot} className={cn(
          "h-2",
          totalBobot > 100 ? "bg-red-200" : ""
        )} />
        {totalBobot !== 100 && (
          <p className="text-[10px] text-red-500 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> Total bobot harus 100% untuk dapat mengajukan RPS.
          </p>
        )}
      </div>

      <div className="space-y-4">
        {komponens.map((k, idx) => (
          <div key={idx} className="p-4 border rounded-lg bg-white shadow-sm space-y-4">
            <div className="flex gap-4 items-start">
               <div className="flex-1 space-y-4">
                 <div className="grid grid-cols-4 gap-4">
                   <div className="col-span-2 space-y-2">
                     <Label className="text-xs uppercase text-gray-500 font-bold">Nama Komponen</Label>
                     <Input
                       placeholder="Contoh: UTS, Tugas 1, Proyek"
                       value={k.nama}
                       onChange={(e) => handleChange(idx, "nama", e.target.value)}
                     />
                   </div>
                   <div className="space-y-2">
                     <Label className="text-xs uppercase text-gray-500 font-bold">Bobot (%)</Label>
                     <Input
                       type="number"
                       value={k.bobot}
                       onChange={(e) => handleChange(idx, "bobot", parseInt(e.target.value) || 0)}
                     />
                   </div>
                   <div className="flex items-end justify-end">
                     <Button variant="ghost" size="icon" onClick={() => handleDelete(idx)} className="text-red-400">
                       <Trash className="h-4 w-4" />
                     </Button>
                   </div>
                 </div>

                 <div className="space-y-2">
                   <Label className="text-xs uppercase text-gray-500 font-bold">CPMK yang Diukur</Label>
                   <div className="flex flex-wrap gap-4 pt-1">
                     {cpmks.map((c) => (
                       <div key={c.id} className="flex items-center gap-2">
                         <Checkbox
                           id={`comp-${idx}-cpmk-${c.id}`}
                           checked={k.cpmk_ids.includes(c.id)}
                           onCheckedChange={() => toggleCpmk(idx, c.id)}
                         />
                         <Label
                           htmlFor={`comp-${idx}-cpmk-${c.id}`}
                           className="text-xs font-medium cursor-pointer"
                         >
                           {c.kode}
                         </Label>
                       </div>
                     ))}
                   </div>
                   {cpmks.length === 0 && <p className="text-[10px] text-muted-foreground italic">Belum ada CPMK yang didefinisikan.</p>}
                 </div>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
