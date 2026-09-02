"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { CalendarDays, CheckCircle2, ChevronDown, Download, Loader2, Upload } from "lucide-react"
import { debounce } from "lodash"
import { toast } from "sonner"
import * as XLSX from "xlsx"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

import { saveMeetings } from "../../actions"
import type { RegisterRpsSectionSave } from "../rps-save-progress"

interface MeetingsSectionProps {
  rpsId: string
  initialMeetings: any[]
  cpmks: any[]
  registerSave: RegisterRpsSectionSave
}

type ExcelMeetingRow = Record<string, unknown>

export function MeetingsSection({ rpsId, initialMeetings, cpmks, registerSave }: MeetingsSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const subCpmks = useMemo(
    () => cpmks.flatMap((item) => (item.subCpmks || []).map((sub: any) => ({ ...sub, cpmkKode: item.kode }))),
    [cpmks],
  )
  const [meetings, setMeetings] = useState<any[]>(() =>
    Array.from({ length: 16 }, (_, index) => {
      const existing = initialMeetings.find((item) => item.minggu_ke === index + 1)
      return existing
        ? {
            ...existing,
            sub_cpmk_ids: existing.subCpmkMappings?.map((mapping: any) => mapping.sub_cpmk_id) || [],
          }
        : {
            minggu_ke: index + 1,
            materi: index === 7 ? "Ujian Tengah Semester" : index === 15 ? "Ujian Akhir Semester" : "",
            metode: index === 7 || index === 15 ? "Tes tertulis / unjuk kerja" : "Ceramah, diskusi, dan pembelajaran berbasis kasus",
            media: "LMS, laptop, dan media presentasi",
            estimasi_waktu: "150 menit",
            indikator: "",
            bentuk_pembelajaran: index === 7 || index === 15 ? "Asesmen" : "Tatap muka / bauran",
            aktivitas_dosen: "",
            aktivitas_mahasiswa: "",
            kriteria_penilaian: "",
            referensi: "",
            sub_cpmk_ids: [],
          }
    }),
  )
  const [isSaving, setIsSaving] = useState(false)

  const completedWeeks = meetings.filter((item) => item.materi?.trim() && item.metode?.trim()).length

  const debouncedSave = useCallback(
    debounce(async (data: any[]) => {
      setIsSaving(true)
      const result = await saveMeetings(rpsId, data)
      if (!result.success) toast.error(result.error)
      setIsSaving(false)
    }, 1400),
    [rpsId],
  )

  const saveNow = useCallback(async () => {
    debouncedSave.cancel()
    setIsSaving(true)
    const result = await saveMeetings(rpsId, meetings)
    setIsSaving(false)
    return result
  }, [debouncedSave, meetings, rpsId])

  useEffect(() => {
    registerSave(saveNow)
    return () => registerSave(null)
  }, [registerSave, saveNow])

  const handleChange = (index: number, field: string, value: unknown) => {
    const next = [...meetings]
    next[index] = { ...next[index], [field]: value }
    setMeetings(next)
    debouncedSave(next)
  }

  const toggleSubCpmk = (index: number, id: string) => {
    const next = [...meetings]
    const current: string[] = next[index].sub_cpmk_ids || []
    next[index] = {
      ...next[index],
      sub_cpmk_ids: current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    }
    setMeetings(next)
    debouncedSave(next)
  }

  const handleDownloadTemplate = () => {
    const rows = meetings.map((m) => {
      const selectedCodes = subCpmks
        .filter((s: any) => (m.sub_cpmk_ids || []).includes(s.id))
        .map((s: any) => s.kode)
        .join(", ")

      return {
        "Minggu Ke": m.minggu_ke,
        "Materi / Topik": m.materi || (m.minggu_ke === 8 ? "Ujian Tengah Semester" : m.minggu_ke === 16 ? "Ujian Akhir Semester" : ""),
        "Kode Sub-CPMK": selectedCodes,
        "Bentuk Pembelajaran": m.bentuk_pembelajaran || (m.minggu_ke === 8 || m.minggu_ke === 16 ? "Asesmen" : "Tatap muka / bauran"),
        "Metode Pembelajaran": m.metode || (m.minggu_ke === 8 || m.minggu_ke === 16 ? "Tes tertulis / unjuk kerja" : "Ceramah, diskusi, dan pembelajaran berbasis kasus"),
        "Media": m.media || "LMS, laptop, dan media presentasi",
        "Estimasi Waktu": m.estimasi_waktu || "150 menit",
        "Indikator Pencapaian": m.indikator || "",
        "Aktivitas Dosen": m.aktivitas_dosen || "",
        "Aktivitas Mahasiswa": m.aktivitas_mahasiswa || "",
        "Kriteria Penilaian": m.kriteria_penilaian || "",
        "Referensi": m.referensi || "",
      }
    })

    const subCpmkRows = subCpmks.length > 0 
      ? subCpmks.map((s: any) => ({
          "Kode Sub-CPMK": s.kode,
          "Induk CPMK": s.cpmkKode || "",
          "Level Bloom": s.level_bloom || "",
          "Deskripsi Sub-CPMK": s.deskripsi || "",
        }))
      : [{ "Info": "Belum ada Sub-CPMK yang dibuat pada tab CPMK" }]

    const wb = XLSX.utils.book_new()
    const ws1 = XLSX.utils.json_to_sheet(rows)
    const ws2 = XLSX.utils.json_to_sheet(subCpmkRows)

    ws1["!cols"] = [
      { wch: 12 },
      { wch: 35 },
      { wch: 25 },
      { wch: 22 },
      { wch: 32 },
      { wch: 24 },
      { wch: 15 },
      { wch: 35 },
      { wch: 35 },
      { wch: 35 },
      { wch: 30 },
      { wch: 30 },
    ]

    ws2["!cols"] = [
      { wch: 18 },
      { wch: 15 },
      { wch: 15 },
      { wch: 60 },
    ]

    XLSX.utils.book_append_sheet(wb, ws1, "Rencana Mingguan")
    XLSX.utils.book_append_sheet(wb, ws2, "Daftar Sub-CPMK")

    XLSX.writeFile(wb, "Template_Rencana_Mingguan_RPS.xlsx")
    toast.success("Template Excel berhasil diunduh")
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })
        
        const sheetName = workbook.SheetNames.find((name) => name.toLowerCase().includes("rencana")) || workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        if (!worksheet) {
          toast.error("Sheet tidak ditemukan dalam file Excel")
          return
        }

        const rows = XLSX.utils.sheet_to_json<ExcelMeetingRow>(worksheet, { defval: "" })
        if (!rows || rows.length === 0) {
          toast.error("File Excel kosong atau format tidak sesuai")
          return
        }

        const rowsByWeek = new Map<number, ExcelMeetingRow>()
        for (const [rowIndex, row] of rows.entries()) {
          const rawWeek = row["Minggu Ke"] ?? row["Minggu"] ?? row["minggu_ke"] ?? row["No"] ?? row["Minggu ke-"]
          const week = Number(rawWeek)

          if (!Number.isInteger(week) || week < 1 || week > 16) {
            throw new Error(`Nomor minggu pada baris Excel ${rowIndex + 2} harus berupa angka 1 sampai 16.`)
          }
          if (rowsByWeek.has(week)) {
            throw new Error(`Minggu ${week} tercantum lebih dari sekali di file Excel.`)
          }

          rowsByWeek.set(week, row)
        }

        const updated = Array.from({ length: 16 }, (_, index) => {
          const targetWeek = index + 1
          const row = rowsByWeek.get(targetWeek)

          if (!row) return meetings[index]

          const subCpmkCol = row["Kode Sub-CPMK (dipisah koma)"] ?? row["Kode Sub-CPMK"] ?? row["Sub-CPMK"] ?? row["sub_cpmk"] ?? ""
          const rawCodes = String(subCpmkCol)
            .split(/[,;\n]+/)
            .map((c) => c.trim().toLowerCase())
            .filter(Boolean)

          const matchedSubCpmkIds = subCpmks
            .filter((s: any) => rawCodes.includes(s.kode?.trim().toLowerCase()))
            .map((s: any) => s.id)

          const materi = String(row["Materi / Topik"] ?? row["Materi / Topik Pembelajaran"] ?? row["Materi"] ?? row["materi"] ?? "").trim()
          const bentuk = String(row["Bentuk Pembelajaran"] ?? row["Bentuk"] ?? row["bentuk_pembelajaran"] ?? "").trim()
          const metode = String(row["Metode Pembelajaran"] ?? row["Metode"] ?? row["metode"] ?? "").trim()
          const media = String(row["Media"] ?? row["media"] ?? "").trim()
          const waktu = String(row["Estimasi Waktu"] ?? row["Waktu"] ?? row["estimasi_waktu"] ?? "").trim()
          const indikator = String(row["Indikator Pencapaian"] ?? row["Indikator"] ?? row["indikator"] ?? "").trim()
          const aktDosen = String(row["Aktivitas Dosen"] ?? row["aktivitas_dosen"] ?? "").trim()
          const aktMhs = String(row["Aktivitas Mahasiswa"] ?? row["aktivitas_mahasiswa"] ?? "").trim()
          const kriteria = String(row["Kriteria Penilaian"] ?? row["Kriteria / Teknik Penilaian"] ?? row["kriteria_penilaian"] ?? "").trim()
          const referensi = String(row["Referensi"] ?? row["Referensi / Bahan Pembelajaran"] ?? row["referensi"] ?? "").trim()

          return {
            ...meetings[index],
            minggu_ke: targetWeek,
            materi: materi || meetings[index].materi,
            bentuk_pembelajaran: bentuk || meetings[index].bentuk_pembelajaran,
            metode: metode || meetings[index].metode,
            media: media || meetings[index].media,
            estimasi_waktu: waktu || meetings[index].estimasi_waktu,
            indikator: indikator || meetings[index].indikator,
            aktivitas_dosen: aktDosen || meetings[index].aktivitas_dosen,
            aktivitas_mahasiswa: aktMhs || meetings[index].aktivitas_mahasiswa,
            kriteria_penilaian: kriteria || meetings[index].kriteria_penilaian,
            referensi: referensi || meetings[index].referensi,
            sub_cpmk_ids: matchedSubCpmkIds.length > 0 ? matchedSubCpmkIds : meetings[index].sub_cpmk_ids,
          }
        })

        setMeetings(updated)
        setIsSaving(true)
        const res = await saveMeetings(rpsId, updated)
        setIsSaving(false)
        if (res.success) {
          toast.success(`${rowsByWeek.size} data rencana mingguan berhasil ditarik dari Excel dan disimpan!`)
        } else {
          toast.error(res.error || "Gagal menyimpan data dari Excel")
        }
      } catch (err: unknown) {
        console.error(err)
        toast.error(err instanceof Error ? err.message : "Gagal membaca file Excel. Pastikan format file .xlsx valid.")
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = ""
      }
    }
    reader.readAsArrayBuffer(file)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Rencana Pembelajaran Mingguan</h2>
          <p className="text-sm text-muted-foreground">Data ini otomatis menjadi dokumen RPM dan bagian mingguan RPS.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx,.xls"
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownloadTemplate}
            className="gap-2 text-xs bg-white"
          >
            <Download className="h-3.5 w-3.5 text-blue-600" />
            Template Excel
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSaving}
            className="gap-2 text-xs border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
          >
            <Upload className="h-3.5 w-3.5 text-blue-600" />
            Tarik dari Excel
          </Button>
          {isSaving && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
          <span className={cn("rounded-full px-3 py-1 font-medium", completedWeeks >= 14 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")}>
            {completedWeeks}/16 minggu terisi
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {meetings.map((meeting, index) => {
          const isComplete = Boolean(meeting.materi?.trim() && meeting.metode?.trim())
          return (
            <details key={meeting.minggu_ke} open={index === 0} className="group rounded-xl border bg-white shadow-sm">
              <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-4">
                <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold", isComplete ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700")}>
                  {isComplete ? <CheckCircle2 className="h-5 w-5" /> : meeting.minggu_ke}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Minggu {meeting.minggu_ke}</p>
                  <p className="truncate font-semibold text-gray-800">{meeting.materi || "Materi belum diisi"}</p>
                </div>
                <div className="hidden items-center gap-2 text-xs text-gray-500 md:flex">
                  <CalendarDays className="h-4 w-4" /> {meeting.estimasi_waktu || "Waktu belum diisi"}
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400 transition-transform group-open:rotate-180" />
              </summary>

              <div className="space-y-5 border-t bg-gray-50/40 p-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Materi / topik pembelajaran</Label>
                    <Textarea value={meeting.materi} onChange={(event) => handleChange(index, "materi", event.target.value)} placeholder={`Topik minggu ke-${meeting.minggu_ke}`} />
                  </div>
                  <div className="space-y-2">
                    <Label>Indikator pencapaian</Label>
                    <Textarea value={meeting.indikator || ""} onChange={(event) => handleChange(index, "indikator", event.target.value)} placeholder="Mahasiswa mampu menunjukkan atau menghasilkan..." />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Sub-CPMK minggu ini</Label>
                  <div className="flex flex-wrap gap-2 rounded-lg border bg-white p-3">
                    {subCpmks.map((item: any) => (
                      <label key={item.id} className="flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs">
                        <Checkbox checked={(meeting.sub_cpmk_ids || []).includes(item.id)} onCheckedChange={() => toggleSubCpmk(index, item.id)} />
                        <span className="font-mono font-semibold">{item.kode}</span>
                        <span className="hidden max-w-56 truncate text-gray-500 lg:inline">{item.deskripsi}</span>
                      </label>
                    ))}
                    {subCpmks.length === 0 && <p className="text-xs text-amber-700">Belum ada Sub-CPMK yang dapat dipilih.</p>}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Bentuk pembelajaran</Label>
                    <Input value={meeting.bentuk_pembelajaran || ""} onChange={(event) => handleChange(index, "bentuk_pembelajaran", event.target.value)} placeholder="Tatap muka / bauran" />
                  </div>
                  <div className="space-y-2">
                    <Label>Metode pembelajaran</Label>
                    <Input value={meeting.metode || ""} onChange={(event) => handleChange(index, "metode", event.target.value)} placeholder="Diskusi, studi kasus, PBL" />
                  </div>
                  <div className="space-y-2">
                    <Label>Media dan waktu</Label>
                    <div className="grid grid-cols-[1fr_110px] gap-2">
                      <Input value={meeting.media || ""} onChange={(event) => handleChange(index, "media", event.target.value)} placeholder="LMS, laptop" />
                      <Input value={meeting.estimasi_waktu || ""} onChange={(event) => handleChange(index, "estimasi_waktu", event.target.value)} placeholder="150 menit" />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Aktivitas dosen</Label>
                    <Textarea value={meeting.aktivitas_dosen || ""} onChange={(event) => handleChange(index, "aktivitas_dosen", event.target.value)} placeholder="Memantik diskusi, memberi contoh, dan memberikan umpan balik." />
                  </div>
                  <div className="space-y-2">
                    <Label>Aktivitas mahasiswa</Label>
                    <Textarea value={meeting.aktivitas_mahasiswa || ""} onChange={(event) => handleChange(index, "aktivitas_mahasiswa", event.target.value)} placeholder="Menganalisis kasus, berdiskusi, mempraktikkan, dan merefleksikan." />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Kriteria / teknik penilaian minggu ini</Label>
                  <Textarea value={meeting.kriteria_penilaian || ""} onChange={(event) => handleChange(index, "kriteria_penilaian", event.target.value)} placeholder="Kosongkan bila minggu ini tidak memiliki asesmen." />
                </div>
                <div className="space-y-2">
                  <Label>Referensi / bahan pembelajaran minggu ini</Label>
                  <Textarea value={meeting.referensi || ""} onChange={(event) => handleChange(index, "referensi", event.target.value)} placeholder="Contoh: [T1] Bab 3–4, video LMS, atau artikel pendukung." />
                </div>
              </div>
            </details>
          )
        })}
      </div>
    </div>
  )
}
