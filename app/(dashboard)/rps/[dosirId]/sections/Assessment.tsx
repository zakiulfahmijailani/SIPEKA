"use client"

import { useCallback, useMemo, useState } from "react"
import { AlertCircle, ChevronDown, ClipboardCheck, Loader2, Plus, Trash } from "lucide-react"
import { debounce } from "lodash"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

import { deleteKomponen, saveKomponens } from "../../actions"

interface AssessmentSectionProps {
  rpsId: string
  initialKomponens: any[]
  cpmks: any[]
}

const DEFAULT_RUBRIC = {
  kriteria: "Kualitas pencapaian tugas",
  bobot: 100,
  sangat_baik: "Sangat baik melakukan analisis, perancangan, implementasi, pengujian, dan dokumentasi.",
  baik: "Baik melakukan analisis, perancangan, implementasi, pengujian, dan dokumentasi.",
  cukup: "Cukup melakukan analisis, perancangan, implementasi, pengujian, dan dokumentasi.",
  kurang: "Kurang melakukan analisis, perancangan, implementasi, pengujian, dan dokumentasi.",
  sangat_kurang: "Sangat kurang menunjukkan pencapaian pada aspek yang dinilai.",
  urutan: 1,
}

export function AssessmentSection({ rpsId, initialKomponens, cpmks }: AssessmentSectionProps) {
  const subCpmks = useMemo(
    () => cpmks.flatMap((item) => (item.subCpmks || []).map((sub: any) => ({ ...sub, cpmkKode: item.kode }))),
    [cpmks],
  )
  const [komponens, setKomponens] = useState<any[]>(
    initialKomponens.map((item) => ({
      ...item,
      cpmk_ids: item.cpmkMappings?.map((mapping: any) => mapping.cpmk_id) || [],
      sub_cpmk_ids: item.subCpmkMappings?.map((mapping: any) => mapping.sub_cpmk_id) || [],
      rubrik_kriterias: item.rubrikKriterias || [],
    })),
  )
  const [isSaving, setIsSaving] = useState(false)

  const totalBobot = useMemo(
    () => Number(komponens.reduce((sum, item) => sum + Number(item.bobot || 0), 0).toFixed(2)),
    [komponens],
  )

  const debouncedSave = useCallback(
    debounce(async (data: any[]) => {
      setIsSaving(true)
      const result = await saveKomponens(rpsId, data)
      if (!result.success) toast.error(result.error)
      setIsSaving(false)
    }, 1200),
    [rpsId],
  )

  const updateState = (next: any[]) => {
    setKomponens(next)
    debouncedSave(next)
  }

  const handleAdd = () => {
    setKomponens((current) => [
      ...current,
      {
        nama: "",
        tipe: "TUGAS",
        bobot: 0,
        deskripsi: "",
        instruksi: "",
        bentuk: "Dokumen",
        luaran: "",
        kriteria_penilaian: "",
        minggu_pemberian: 1,
        minggu_pengumpulan: 2,
        is_kelompok: false,
        referensi_tugas: "",
        lain_lain: "",
        cpmk_ids: [],
        sub_cpmk_ids: [],
        rubrik_kriterias: [{ ...DEFAULT_RUBRIC }],
        urutan: current.length + 1,
      },
    ])
  }

  const handleDelete = async (index: number) => {
    const target = komponens[index]
    if (target.id) {
      const result = await deleteKomponen(target.id)
      if (!result.success) return toast.error(result.error)
    }
    const next = komponens.filter((_, itemIndex) => itemIndex !== index)
      .map((item, itemIndex) => ({ ...item, urutan: itemIndex + 1 }))
    updateState(next)
  }

  const handleChange = (index: number, field: string, value: unknown) => {
    const next = [...komponens]
    next[index] = { ...next[index], [field]: value }
    updateState(next)
  }

  const toggleMapping = (componentIndex: number, field: "cpmk_ids" | "sub_cpmk_ids", id: string) => {
    const next = [...komponens]
    const current: string[] = next[componentIndex][field] || []
    next[componentIndex] = {
      ...next[componentIndex],
      [field]: current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    }
    updateState(next)
  }

  const addRubric = (componentIndex: number) => {
    const next = [...komponens]
    const rubrics = next[componentIndex].rubrik_kriterias || []
    next[componentIndex] = {
      ...next[componentIndex],
      rubrik_kriterias: [
        ...rubrics,
        { ...DEFAULT_RUBRIC, kriteria: "", urutan: rubrics.length + 1 },
      ],
    }
    setKomponens(next)
  }

  const updateRubric = (componentIndex: number, rubricIndex: number, field: string, value: unknown) => {
    const next = [...komponens]
    const rubrics = [...(next[componentIndex].rubrik_kriterias || [])]
    rubrics[rubricIndex] = { ...rubrics[rubricIndex], [field]: value }
    next[componentIndex] = { ...next[componentIndex], rubrik_kriterias: rubrics }
    updateState(next)
  }

  const deleteRubric = (componentIndex: number, rubricIndex: number) => {
    const next = [...komponens]
    const rubrics = (next[componentIndex].rubrik_kriterias || [])
      .filter((_: any, index: number) => index !== rubricIndex)
      .map((item: any, index: number) => ({ ...item, urutan: index + 1 }))
    next[componentIndex] = { ...next[componentIndex], rubrik_kriterias: rubrics }
    updateState(next)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Asesmen, RTM, dan Rubrik</h2>
          <p className="text-sm text-muted-foreground">Satu komponen asesmen akan membentuk RTM beserta rubriknya.</p>
        </div>
        <div className="flex items-center gap-2">
          {isSaving && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
          <Button variant="outline" size="sm" onClick={handleAdd} className="gap-2">
            <Plus className="h-4 w-4" /> Tambah Asesmen
          </Button>
        </div>
      </div>

      <div className="space-y-2 rounded-xl border bg-gray-50/70 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Total Bobot Asesmen</span>
          <span className={cn("font-bold tabular-nums", Math.abs(totalBobot - 100) < 0.01 ? "text-emerald-600" : "text-red-600")}>
            {totalBobot}% / 100%
          </span>
        </div>
        <Progress value={Math.min(totalBobot, 100)} className="h-2" />
        {Math.abs(totalBobot - 100) >= 0.01 && (
          <p className="flex items-center gap-1 text-xs text-red-600">
            <AlertCircle className="h-3.5 w-3.5" /> Bobot desimal didukung dan total harus tepat 100%.
          </p>
        )}
      </div>

      <div className="space-y-4">
        {komponens.map((component, index) => (
          <div key={component.id || index} className="space-y-5 rounded-xl border bg-white p-5 shadow-sm">
            <div className="grid gap-4 md:grid-cols-[1fr_170px_120px_44px]">
              <div className="space-y-2">
                <Label>Nama asesmen</Label>
                <Input
                  placeholder="Contoh: Tugas Teori Individu, Proyek, UTS"
                  value={component.nama}
                  onChange={(event) => handleChange(index, "nama", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Teknik penilaian</Label>
                <Input
                  placeholder="Tugas Praktikum"
                  value={component.tipe}
                  onChange={(event) => handleChange(index, "tipe", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Bobot (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={component.bobot}
                  onChange={(event) => handleChange(index, "bobot", Number.parseFloat(event.target.value) || 0)}
                />
              </div>
              <div className="flex items-end">
                <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(index)}>
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Deskripsi tugas</Label>
                <Textarea
                  value={component.deskripsi || ""}
                  onChange={(event) => handleChange(index, "deskripsi", event.target.value)}
                  placeholder="Jelaskan tujuan dan konteks tugas mahasiswa."
                />
              </div>
              <div className="space-y-2">
                <Label>Instruksi pengerjaan</Label>
                <Textarea
                  value={component.instruksi || ""}
                  onChange={(event) => handleChange(index, "instruksi", event.target.value)}
                  placeholder="Tuliskan langkah, sumber yang digunakan, dan ketentuan pengumpulan."
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label>Bentuk luaran</Label>
                <Input value={component.bentuk || ""} onChange={(event) => handleChange(index, "bentuk", event.target.value)} placeholder="Laporan / Presentasi" />
              </div>
              <div className="space-y-2">
                <Label>Luaran yang diharapkan</Label>
                <Input value={component.luaran || ""} onChange={(event) => handleChange(index, "luaran", event.target.value)} placeholder="Dokumen analisis" />
              </div>
              <div className="space-y-2">
                <Label>Minggu diberikan</Label>
                <Input type="number" min="1" max="16" value={component.minggu_pemberian || ""} onChange={(event) => handleChange(index, "minggu_pemberian", Number(event.target.value) || null)} />
              </div>
              <div className="space-y-2">
                <Label>Minggu dikumpulkan</Label>
                <Input type="number" min="1" max="16" value={component.minggu_pengumpulan || ""} onChange={(event) => handleChange(index, "minggu_pengumpulan", Number(event.target.value) || null)} />
              </div>
            </div>

            <label className="flex w-fit items-center gap-2 text-sm text-gray-700">
              <Checkbox checked={Boolean(component.is_kelompok)} onCheckedChange={(checked) => handleChange(index, "is_kelompok", checked === true)} />
              Dikerjakan secara kelompok
            </label>

            <div className="grid gap-4 rounded-lg border bg-gray-50/60 p-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-gray-500">CPMK yang diukur</Label>
                <div className="flex flex-wrap gap-3">
                  {cpmks.map((item) => (
                    <label key={item.id} className="flex items-center gap-2 rounded-md border bg-white px-2.5 py-1.5 text-xs">
                      <Checkbox checked={(component.cpmk_ids || []).includes(item.id)} onCheckedChange={() => toggleMapping(index, "cpmk_ids", item.id)} />
                      {item.kode}
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-gray-500">Sub-CPMK sebagai bukti langsung</Label>
                <div className="flex max-h-32 flex-wrap gap-2 overflow-y-auto">
                  {subCpmks.map((item: any) => (
                    <label key={item.id} className="flex items-center gap-2 rounded-md border bg-white px-2.5 py-1.5 text-xs">
                      <Checkbox checked={(component.sub_cpmk_ids || []).includes(item.id)} onCheckedChange={() => toggleMapping(index, "sub_cpmk_ids", item.id)} />
                      {item.kode}
                    </label>
                  ))}
                  {subCpmks.length === 0 && <p className="text-xs text-amber-700">Tambahkan Sub-CPMK terlebih dahulu.</p>}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Kriteria penilaian ringkas</Label>
              <Textarea
                value={component.kriteria_penilaian || ""}
                onChange={(event) => handleChange(index, "kriteria_penilaian", event.target.value)}
                placeholder="Contoh: ketepatan analisis, kelengkapan, orisinalitas, dan kejelasan penyajian."
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Daftar rujukan tugas</Label>
                <Textarea
                  value={component.referensi_tugas || ""}
                  onChange={(event) => handleChange(index, "referensi_tugas", event.target.value)}
                  placeholder="Sumber yang wajib atau disarankan untuk penugasan."
                />
              </div>
              <div className="space-y-2">
                <Label>Lain-lain</Label>
                <Textarea
                  value={component.lain_lain || ""}
                  onChange={(event) => handleChange(index, "lain_lain", event.target.value)}
                  placeholder="Ketentuan tambahan, catatan, atau aturan khusus tugas."
                />
              </div>
            </div>

            <details className="group rounded-lg border border-blue-100 bg-blue-50/30 p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-blue-950">
                <span className="flex items-center gap-2"><ClipboardCheck className="h-4 w-4" /> Rubrik penilaian</span>
                <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
              </summary>
              <div className="mt-4 space-y-4">
                {(component.rubrik_kriterias || []).map((rubric: any, rubricIndex: number) => (
                  <div key={rubric.id || rubricIndex} className="space-y-3 rounded-lg border bg-white p-4">
                    <div className="grid gap-3 md:grid-cols-[1fr_120px_44px]">
                      <Input value={rubric.kriteria} onChange={(event) => updateRubric(index, rubricIndex, "kriteria", event.target.value)} placeholder="Kriteria" />
                      <Input type="number" step="0.01" value={rubric.bobot} onChange={(event) => updateRubric(index, rubricIndex, "bobot", Number(event.target.value) || 0)} placeholder="Bobot" />
                      <Button variant="ghost" size="icon" className="text-red-500" onClick={() => deleteRubric(index, rubricIndex)}><Trash className="h-4 w-4" /></Button>
                    </div>
                    <div className="grid gap-2 md:grid-cols-5">
                      {[
                        ["sangat_baik", "Sangat Baik (81–100)"],
                        ["baik", "Baik (61–80)"],
                        ["cukup", "Cukup (41–60)"],
                        ["kurang", "Kurang (21–40)"],
                        ["sangat_kurang", "Sangat Kurang (0–20)"],
                      ].map(([field, label]) => (
                        <div key={field} className="space-y-1.5">
                          <Label className="text-[10px] leading-tight text-gray-500">{label}</Label>
                          <Textarea className="min-h-24 text-xs" value={rubric[field] || ""} onChange={(event) => updateRubric(index, rubricIndex, field, event.target.value)} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => addRubric(index)}><Plus className="h-3.5 w-3.5" /> Tambah kriteria rubrik</Button>
              </div>
            </details>
          </div>
        ))}

        {komponens.length === 0 && (
          <div className="rounded-xl border-2 border-dashed bg-gray-50 py-12 text-center text-sm text-muted-foreground">
            Belum ada asesmen. Tambahkan komponen untuk membentuk RTM.
          </div>
        )}
      </div>
    </div>
  )
}
