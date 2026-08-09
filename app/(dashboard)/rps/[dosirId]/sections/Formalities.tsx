"use client"

import { useCallback, useEffect, useState } from "react"
import { debounce } from "lodash"
import { FileText, Loader2 } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import { saveRpsFormalities } from "../../actions"

type Formalities = {
  deskripsi_mk: string
  metode_pembelajaran: string
  persyaratan_kehadiran: string
  status_revisi: string
  tanggal_penyusunan: string
  nama_penyetuju: string
  jabatan_penyetuju: string
  tanggal_pengesahan: string
}

const toDateInput = (value: unknown) => typeof value === "string" ? value.slice(0, 10) : ""

function initialState(rps: any, dosir: any): Formalities {
  return {
    deskripsi_mk: rps?.deskripsi_mk || dosir.mk.deskripsi || "",
    metode_pembelajaran: rps?.metode_pembelajaran || "",
    persyaratan_kehadiran: rps?.persyaratan_kehadiran || "",
    status_revisi: rps?.status_revisi || "R-1",
    tanggal_penyusunan: toDateInput(rps?.tanggal_penyusunan),
    nama_penyetuju: rps?.nama_penyetuju || "",
    jabatan_penyetuju: rps?.jabatan_penyetuju || "Ketua Program Studi",
    tanggal_pengesahan: toDateInput(rps?.tanggal_pengesahan),
  }
}

export function FormalitiesSection({ rpsId, initialRps, dosir }: { rpsId: string; initialRps: any; dosir: any }) {
  const [form, setForm] = useState(() => initialState(initialRps, dosir))
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => setForm(initialState(initialRps, dosir)), [initialRps, dosir])

  const debouncedSave = useCallback(
    debounce(async (data: Formalities) => {
      setIsSaving(true)
      await saveRpsFormalities(rpsId, data)
      setIsSaving(false)
    }, 900),
    [rpsId],
  )

  const update = (field: keyof Formalities, value: string) => {
    const next = { ...form, [field]: value }
    setForm(next)
    debouncedSave(next)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-amber-50/60 p-5 shadow-sm">
        <div className="flex gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm shadow-amber-200"><FileText className="size-5" /></div>
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Kelengkapan Dokumen RPS</h2>
            <p className="mt-1 text-sm text-slate-500">Bagian resmi yang akan muncul pada dokumen RPS cetak.</p>
          </div>
        </div>
        {isSaving && <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500"><Loader2 className="size-3.5 animate-spin text-blue-600" /> Menyimpan</span>}
      </div>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h3 className="font-semibold text-slate-900">Deskripsi dan pelaksanaan mata kuliah</h3>
          <p className="mt-1 text-sm text-slate-500">Isian ini menggantikan bagian Course Description, Methods of Instruction, dan Attendance Requirement pada template resmi.</p>
        </div>
        <div className="space-y-2">
          <Label>Deskripsi mata kuliah</Label>
          <Textarea value={form.deskripsi_mk} onChange={(event) => update("deskripsi_mk", event.target.value)} rows={6} placeholder="Jelaskan ruang lingkup, kompetensi, dan kontribusi mata kuliah." />
        </div>
        <div className="space-y-2">
          <Label>Metode pembelajaran umum</Label>
          <Textarea value={form.metode_pembelajaran} onChange={(event) => update("metode_pembelajaran", event.target.value)} rows={4} placeholder="Contoh: kuliah interaktif, diskusi, studi kasus, latihan terstruktur, dan presentasi." />
        </div>
        <div className="space-y-2">
          <Label>Persyaratan kehadiran</Label>
          <Textarea value={form.persyaratan_kehadiran} onChange={(event) => update("persyaratan_kehadiran", event.target.value)} rows={3} placeholder="Contoh: Mahasiswa wajib hadir minimal 80% untuk dapat mengikuti evaluasi akhir." />
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h3 className="font-semibold text-slate-900">Revisi dan pengesahan</h3>
          <p className="mt-1 text-sm text-slate-500">Dosen pengampu terisi otomatis dari penugasan. Isi data pihak yang mengesahkan sebelum RPS diajukan.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2"><Label>Status revisi</Label><Input value={form.status_revisi} onChange={(event) => update("status_revisi", event.target.value)} placeholder="R-1" /></div>
          <div className="space-y-2"><Label>Tanggal penyusunan</Label><Input type="date" value={form.tanggal_penyusunan} onChange={(event) => update("tanggal_penyusunan", event.target.value)} /></div>
          <div className="space-y-2"><Label>Dosen penyusun</Label><Input value={dosir.dosen.nama_lengkap} readOnly className="bg-slate-50 text-slate-600" /></div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2"><Label>Nama pengesah</Label><Input value={form.nama_penyetuju} onChange={(event) => update("nama_penyetuju", event.target.value)} placeholder="Nama Ketua Program Studi" /></div>
          <div className="space-y-2"><Label>Jabatan pengesah</Label><Input value={form.jabatan_penyetuju} onChange={(event) => update("jabatan_penyetuju", event.target.value)} /></div>
          <div className="space-y-2"><Label>Tanggal pengesahan</Label><Input type="date" value={form.tanggal_pengesahan} onChange={(event) => update("tanggal_pengesahan", event.target.value)} /></div>
        </div>
      </section>
    </div>
  )
}
