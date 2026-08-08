"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, Loader2, Layers3, Target } from "lucide-react"
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
  const subCpmkCount = cpmks.reduce((total, cpmk) => total + (cpmk.subCpmks?.length || 0), 0)

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
    <div className="space-y-5">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-white to-blue-50/70 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-200">
            <Target className="size-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h2 className="text-lg font-semibold tracking-tight text-slate-950">CPMK & Sub-CPMK</h2>
              {cpmks.length > 0 && (
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                  {cpmks.length} CPMK · {subCpmkCount} Sub-CPMK
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-500">Rumusan kompetensi dan indikator pembelajaran yang diturunkan dari CPL.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 self-end sm:self-auto">
          {isSaving && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Loader2 className="size-3.5 animate-spin text-blue-600" /> Menyimpan
            </span>
          )}
          <Button size="sm" onClick={handleAdd} className="gap-2 rounded-xl bg-blue-600 px-4 shadow-sm hover:bg-blue-700">
            <Plus className="h-4 w-4" /> Tambah CPMK
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {cpmks.map((c, idx) => (
          <section key={c.id || `${c.kode}-${idx}`} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/80 px-5 py-3.5">
              <div className="flex items-center gap-3">
                <span className="flex size-7 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600">{idx + 1}</span>
                <div>
                  <p className="font-mono text-sm font-semibold text-slate-900">{c.kode}</p>
                  <p className="text-xs text-slate-500">{(c.subCpmks || []).length} Sub-CPMK terhubung</p>
                </div>
              </div>
              <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
              onClick={() => handleDelete(c.id, idx)}
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Hapus</span>
            </Button>
            </div>

            <div className="space-y-5 p-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-[11rem_minmax(0,1fr)]">
               <div className="space-y-2">
                 <Label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Kode CPMK</Label>
                 <Input value={c.kode} readOnly className="h-10 border-slate-200 bg-slate-50 font-mono text-sm font-medium text-slate-700" />
               </div>
               <div className="min-w-0 space-y-2">
                 <Label className="text-xs font-semibold uppercase tracking-wide text-slate-500">CPL Terkait</Label>
                 <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                   {mappedCpls.map((mappedCpl) => {
                     const isSelected = mappedCpl.id === c.cpl_id
                     return (
                       <button
                         key={mappedCpl.id}
                         type="button"
                         onClick={() => handleChange(idx, "cpl_id", mappedCpl.id)}
                         className={`rounded-xl border px-3 py-2.5 text-left transition-all ${
                           isSelected
                             ? "border-blue-600 bg-blue-50 shadow-sm shadow-blue-100"
                             : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
                         }`}
                       >
                         <span className={`block text-xs font-bold ${isSelected ? "text-blue-700" : "text-slate-700"}`}>
                           {mappedCpl.kode}
                         </span>
                         <span className="mt-0.5 line-clamp-2 block text-[11px] leading-4 text-slate-500">
                           {mappedCpl.rumusan}
                         </span>
                       </button>
                     )
                   })}
                 </div>
               </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Rumusan CPMK</Label>
              <Textarea 
                placeholder="Contoh: Mahasiswa mampu merancang basis data relasional..." 
                value={c.deskripsi}
                onChange={(e) => handleChange(idx, "deskripsi", e.target.value)}
                rows={3}
                className="min-h-28 resize-y border-slate-200 bg-white leading-6"
              />
            </div>

            <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <Layers3 className="h-4 w-4 text-blue-600" /> Sub-CPMK
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">Kemampuan akhir yang akan ditautkan ke RPM, RTM, dan asesmen.</p>
                </div>
                <Button type="button" variant="outline" size="sm" className="w-full gap-2 rounded-lg border-slate-300 bg-white sm:w-auto" onClick={() => handleAddSubCpmk(idx)}>
                  <Plus className="h-3.5 w-3.5" /> Tambah Sub-CPMK
                </Button>
              </div>

              <div className="space-y-3">
                {(c.subCpmks || []).map((sub: any, subIndex: number) => (
                  <div key={sub.id || `${sub.kode}-${subIndex}`} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-3.5 md:grid-cols-[10rem_8rem_minmax(0,1fr)_2.5rem] md:items-end">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Kode</Label>
                      <Input
                        value={sub.kode}
                        onChange={(event) => handleSubChange(idx, subIndex, "kode", event.target.value)}
                        className="h-10 border-slate-200 bg-slate-50 font-mono text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Level Bloom</Label>
                      <select
                        value={sub.level_bloom || "C3"}
                        onChange={(event) => handleSubChange(idx, subIndex, "level_bloom", event.target.value || "C3")}
                        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition-colors focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                      >
                        {["C1", "C2", "C3", "C4", "C5", "C6"].map((level) => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Rumusan Sub-CPMK</Label>
                      <Textarea
                        value={sub.deskripsi}
                        onChange={(event) => handleSubChange(idx, subIndex, "deskripsi", event.target.value)}
                        placeholder="Mahasiswa mampu menjelaskan, menerapkan, atau mengevaluasi..."
                        className="min-h-10 border-slate-200 leading-5"
                      />
                    </div>
                    <div className="flex items-end justify-end">
                      <Button type="button" variant="ghost" size="icon" className="text-slate-400 hover:bg-red-50 hover:text-red-600" onClick={() => handleDeleteSubCpmk(idx, subIndex)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {(c.subCpmks || []).length === 0 && (
                  <p className="rounded-xl border border-dashed border-slate-300 bg-white/70 px-3 py-6 text-center text-xs text-slate-500">
                    Belum ada Sub-CPMK untuk CPMK ini.
                  </p>
                )}
              </div>
            </div>
            </div>
          </section>
        ))}

        {cpmks.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-14 text-center">
            <Target className="mx-auto mb-3 size-7 text-slate-300" />
            <p className="font-medium text-slate-700">Belum ada CPMK.</p>
            <p className="mt-1 text-sm text-slate-500">Klik “Tambah CPMK” untuk mulai menyusun capaian pembelajaran.</p>
          </div>
        )}
      </div>
    </div>
  )
}
