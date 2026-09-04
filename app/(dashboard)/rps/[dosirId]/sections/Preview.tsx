"use client"

import { useEffect, useMemo, useState } from "react"
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  FileDown,
  FileText,
  Loader2,
  Printer,
  RotateCcw,
  Send,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { calculateRpsReadiness } from "@/lib/rps-readiness"
import type { OfficialRpsData } from "@/lib/rps-export-official"
import { getOfficialRpsDataAction, type RpsStatus } from "../../actions"

interface PreviewSectionProps {
  dosir: any
  rps: any
  mappedCpls: any[]
  onStatusChange: (status: RpsStatus, catatan?: string) => void
  currentUser: any
}

export function PreviewSection({
  dosir,
  rps,
  mappedCpls,
  onStatusChange,
  currentUser,
}: PreviewSectionProps) {
  const [showConfirm, setShowConfirm] = useState<{
    status: RpsStatus
    title: string
    desc: string
  } | null>(null)
  const [catatan, setCatatan] = useState("")
  const [officialData, setOfficialData] = useState<OfficialRpsData | null>(null)
  const [isLoadingOfficial, setIsLoadingOfficial] = useState(false)
  const [viewMode, setViewMode] = useState<"ALL" | "PAGE1" | "PAGE2" | "PAGE3">("ALL")

  useEffect(() => {
    let isMounted = true
    async function fetchOfficial() {
      if (!dosir?.id) return
      setIsLoadingOfficial(true)
      try {
        const res = await getOfficialRpsDataAction(dosir.id)
        if (isMounted && res.success && res.data) {
          setOfficialData(res.data)
        }
      } catch (err) {
        console.error("Gagal mengambil data resmi RPS:", err)
      } finally {
        if (isMounted) setIsLoadingOfficial(false)
      }
    }
    fetchOfficial()
    return () => {
      isMounted = false
    }
  }, [dosir?.id, rps?.updated_at])

  const totalBobot = useMemo(() => {
    if (officialData) return officialData.assessmentSummary.total
    return Number(
      (
        rps.komponens?.reduce(
          (sum: number, k: any) => sum + Number(k.bobot || 0),
          0
        ) || 0
      ).toFixed(2)
    )
  }, [officialData, rps.komponens])

  const isWeightValid = Math.abs(totalBobot - 100) < 0.05
  const readiness = useMemo(() => calculateRpsReadiness(rps), [rps])
  const isValid = readiness.issues.length === 0 && isWeightValid

  const handlePrint = () => {
    window.open(`/rps/${dosir.id}/print`, "_blank")
  }

  const docxUrl = `/api/export/rps/${dosir.id}?format=docx`
  const pdfUrl = `/api/export/rps/${dosir.id}?format=pdf`

  return (
    <div className="space-y-8 pb-24 font-sans">
      {/* Top Toolbar */}
      <div className="no-print rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">
                Pratinjau & Ekspor Dokumen Resmi (F-PPK-09)
              </h2>
              <Badge
                className={
                  rps.status === "APPROVED"
                    ? "bg-green-600"
                    : rps.status === "SUBMITTED"
                    ? "bg-yellow-600"
                    : rps.status === "REVISION_REQUIRED"
                    ? "bg-red-600"
                    : "bg-slate-600"
                }
              >
                {rps.status}
              </Badge>
              {!isWeightValid && (
                <Badge variant="outline" className="border-red-500 text-red-600 font-semibold">
                  Bobot {totalBobot}% (Wajib 100%)
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Format baku sesuai formulir F-PPK-09: 2 Halaman Portrait + 1 Halaman Landscape.
            </p>
          </div>

          {/* Download Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="default"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-sm font-medium"
              render={<a href={docxUrl} download />}
            >
              <FileText className="h-4 w-4" /> Unduh Word (.docx)
            </Button>

            <Button
              variant="default"
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white gap-2 shadow-sm font-medium"
              render={<a href={pdfUrl} download />}
            >
              <FileDown className="h-4 w-4" /> Unduh PDF (.pdf)
            </Button>

            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
              <Printer className="h-4 w-4" /> Cetak Lembar RPS
            </Button>
          </div>
        </div>

        {/* Status Actions & Secondary Links */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`/rpm/${dosir.id}`, "_blank")}
              className="gap-1.5 text-xs text-slate-700"
            >
              <ClipboardCheck className="h-3.5 w-3.5" /> Rubrik Penilaian (RPM)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`/rtm/${dosir.id}`, "_blank")}
              className="gap-1.5 text-xs text-slate-700"
            >
              <ClipboardList className="h-3.5 w-3.5" /> Rancangan Tugas (RTM)
            </Button>

            {/* View switcher */}
            <div className="ml-2 inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setViewMode("ALL")}
                className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                  viewMode === "ALL" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Semua Halaman
              </button>
              <button
                type="button"
                onClick={() => setViewMode("PAGE1")}
                className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                  viewMode === "PAGE1" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Hal 1 (Portrait)
              </button>
              <button
                type="button"
                onClick={() => setViewMode("PAGE2")}
                className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                  viewMode === "PAGE2" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Hal 2 (Portrait)
              </button>
              <button
                type="button"
                onClick={() => setViewMode("PAGE3")}
                className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                  viewMode === "PAGE3" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Hal 3 (Landscape)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {rps.status === "DRAFT" || rps.status === "REVISION_REQUIRED" ? (
              <Button
                size="sm"
                disabled={!isValid}
                onClick={() =>
                  setShowConfirm({
                    status: "SUBMITTED",
                    title: "Ajukan RPS ke Kaprodi?",
                    desc: "RPS akan dikirim ke Kaprodi untuk diverifikasi dan disahkan.",
                  })
                }
                className="gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-4 w-4" /> Ajukan ke Kaprodi
              </Button>
            ) : null}

            {currentUser.role !== "DOSEN" && rps.status === "SUBMITTED" ? (
              <>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() =>
                    setShowConfirm({
                      status: "REVISION_REQUIRED",
                      title: "Kembalikan RPS untuk Revisi?",
                      desc: "Tuliskan catatan perbaikan yang harus dipenuhi dosen pengampu.",
                    })
                  }
                  className="gap-2"
                >
                  <RotateCcw className="h-4 w-4" /> Minta Revisi
                </Button>
                <Button
                  size="sm"
                  disabled={!isValid}
                  className="bg-green-600 hover:bg-green-700 gap-2 text-white"
                  onClick={() =>
                    setShowConfirm({
                      status: "APPROVED",
                      title: "Setujui & Sahkan RPS?",
                      desc: "RPS resmi disahkan sebagai acuan pembelajaran semester ini.",
                    })
                  }
                >
                  <CheckCircle2 className="h-4 w-4" /> Setujui & Sahkan
                </Button>
              </>
            ) : null}
          </div>
        </div>

        {/* Validation Warning Alert */}
        {!isValid && (
          <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs font-medium text-amber-900">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-950">Dokumen belum siap diajukan:</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-4 font-normal text-amber-800">
                {!isWeightValid && (
                  <li>
                    Total bobot asesmen saat ini <strong>{totalBobot}%</strong>. Wajib tepat <strong>100%</strong> (UTS + UAS + Tugas + Lainnya).
                  </li>
                )}
                {readiness.issues.map((issue) => (
                  <li key={issue}>{issue}</li>
                ))}
              </ul>
              <p className="mt-1.5 text-[11px] text-amber-700">
                Catatan: Ekspor Word dan PDF tetap dapat diunduh untuk kebutuhan tinjauan internal, namun akan ditandai dengan watermark <strong>DRAFT</strong>.
              </p>
            </div>
          </div>
        )}
      </div>

      {isLoadingOfficial && !officialData && (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-3 bg-white rounded-2xl border border-slate-200">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm font-medium text-slate-600">Menyusun pratinjau template resmi F-PPK-09...</p>
        </div>
      )}

      {/* DOCUMENT PREVIEW SHEETS */}
      <div className="space-y-12">
        {/* PAGE 1: PORTRAIT */}
        {(viewMode === "ALL" || viewMode === "PAGE1") && (
          <div className="relative mx-auto max-w-[820px] rounded-xl border border-slate-300 bg-white p-10 shadow-lg text-[9.5pt] text-slate-900 font-serif leading-snug">
            {/* Header Form */}
            <div className="border border-black grid grid-cols-[90px_1fr_180px] text-center mb-6">
              <div className="border-r border-black p-2 flex items-center justify-center">
                <img src="/images/rps/image1.jpeg" alt="Logo Universitas Bakrie" className="max-h-12 w-auto object-contain" />
              </div>
              <div className="p-2 flex flex-col justify-center font-bold">
                <p className="text-[12pt] tracking-wide">SYLLABUS</p>
                <p className="text-[10pt] font-semibold">(RENCANA PEMBELAJARAN SEMESTER)</p>
              </div>
              <div className="border-l border-black p-2 flex flex-col justify-center text-left text-[9pt] font-semibold space-y-1">
                <p>[{dosir.mk.kode}]</p>
                <p className="text-slate-500 font-normal">Pg. 1/3</p>
              </div>
            </div>

            {/* Table 1: Course Identity */}
            <table className="w-full border-collapse border border-black text-[9pt] mb-6">
              <tbody>
                <tr>
                  <td className="w-[28%] border border-black p-2 font-bold">Course Code (Kode MK)</td>
                  <td className="w-[22%] border border-black p-2 font-mono">{dosir.mk.kode}</td>
                  <td className="w-[25%] border border-black p-2 font-bold">Course Name (Nama MK)</td>
                  <td className="w-[25%] border border-black p-2 font-semibold">
                    {dosir.mk.nama_id}
                    {dosir.mk.nama_en ? ` / ${dosir.mk.nama_en}` : ""}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-2 font-bold">Study Program (Program Studi)</td>
                  <td className="border border-black p-2">Sistem Informasi</td>
                  <td className="border border-black p-2 font-bold">Faculty (Fakultas)</td>
                  <td className="border border-black p-2">Fakultas Teknik dan Ilmu Komputer</td>
                </tr>
                <tr>
                  <td className="border border-black p-2 font-bold">Course Prerequisite (Prasyarat)</td>
                  <td colSpan={3} className="border border-black p-2">
                    {officialData?.prasyaratText || "Tidak ada"}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-2 font-bold">Credit (Bobot SKS)</td>
                  <td className="border border-black p-2">
                    {(dosir.mk.sks_teori || 0) + (dosir.mk.sks_praktik || 0)} SKS
                  </td>
                  <td className="border border-black p-2 font-bold">Lecture / Tutorial / Practicum</td>
                  <td className="border border-black p-2">
                    {dosir.mk.sks_teori || 0} / {(dosir.mk as any).sks_tutorial || 0} / {dosir.mk.sks_praktik || 0} SKS
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-2 font-bold">Revision Status (Status Revisi)</td>
                  <td className="border border-black p-2">{rps.status_revisi || "R-1"}</td>
                  <td className="border border-black p-2 font-bold">Semester & Academic Year</td>
                  <td className="border border-black p-2">
                    Semester {dosir.mk.semester_rekomendasi || 1} - {dosir.tahunAkademik.kode}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-2 font-bold">Lecturer's name (Dosen Pengampu)</td>
                  <td colSpan={3} className="border border-black p-2 font-semibold">
                    {officialData?.dosenList?.join(", ") || dosir.dosen?.nama_lengkap || "—"}
                  </td>
                </tr>
                <tr>
                  <td colSpan={2} className="border border-black p-2 align-top">
                    <p className="font-bold text-[8.5pt]">Dipersiapkan oleh (Prepared by) :</p>
                    <p className="mt-1">Nama: {(rps as any).nama_penyusun || dosir.dosen?.nama_lengkap || "—"}</p>
                    <p>Jabatan: {(rps as any).jabatan_penyusun || "Dosen Pengampu"}</p>
                    <p>Tanggal: {rps.tanggal_penyusunan || "—"}</p>
                    <div className="h-12" />
                    <p className="text-center font-mono text-[8pt] text-slate-400">( Tanda Tangan )</p>
                  </td>
                  <td colSpan={2} className="border border-black p-2 align-top">
                    <p className="font-bold text-[8.5pt]">Disahkan oleh (Certified by) :</p>
                    <p className="mt-1">Nama: {rps.nama_penyetuju || "—"}</p>
                    <p>Jabatan: {rps.jabatan_penyetuju || "Ketua Program Studi"}</p>
                    <p>Tanggal: {rps.tanggal_pengesahan || "—"}</p>
                    <div className="h-12" />
                    <p className="text-center font-mono text-[8pt] text-slate-400">( Tanda Tangan )</p>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Course Description */}
            <div className="mb-4">
              <h3 className="font-bold text-[9pt] uppercase tracking-wide">
                COURSE DESCRIPTION / Deskripsi Matakuliah
              </h3>
              <p className="mt-1 text-justify text-[9pt] leading-relaxed text-slate-800">
                {rps.deskripsi_mk || "— Belum ada deskripsi mata kuliah —"}
              </p>
            </div>

            {/* Course Objectives */}
            <div className="mb-4">
              <h3 className="font-bold text-[9pt] uppercase tracking-wide">
                COURSE OBJECTIVES / Sasaran Kompetensi Lulusan
              </h3>
              <p className="mt-1 text-justify text-[9pt] leading-relaxed text-slate-800">
                {(rps as any).sasaran_kompetensi_lulusan ||
                  "Menguasai kompetensi dasar, analisis, perancangan, dan implementasi sesuai bidang keilmuan mata kuliah ini."}
              </p>
            </div>

            {/* Learning Outcome (Table 2: CPL Matrix) */}
            <div className="mb-6">
              <h3 className="font-bold text-[9pt] uppercase tracking-wide">
                LEARNING OUTCOME / Capaian Pembelajaran*
              </h3>
              <div className="mt-1 overflow-x-auto">
                <table className="w-full border-collapse border border-black text-center text-[8.5pt]">
                  <thead>
                    <tr className="bg-slate-50 font-bold">
                      <th className="border border-black p-1.5 w-[14%]">Course Code</th>
                      <th className="border border-black p-1.5 w-[30%]">Course Name</th>
                      <th className="border border-black p-1.5 w-[10%]">Credit</th>
                      {(officialData?.allCpls || mappedCpls).map((c) => (
                        <th key={c.id || c.kode} className="border border-black p-1 text-[8pt]">
                          CP<br />({c.kode})
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-black p-1.5 font-mono">{dosir.mk.kode}</td>
                      <td className="border border-black p-1.5 text-left font-medium">{dosir.mk.nama_id}</td>
                      <td className="border border-black p-1.5">
                        {(dosir.mk.sks_teori || 0) + (dosir.mk.sks_praktik || 0)}
                      </td>
                      {(officialData?.allCpls || mappedCpls).map((c) => {
                        const isMapped = officialData
                          ? officialData.mappedCplCodes.includes(c.kode)
                          : mappedCpls.some((mc: any) => mc.kode === c.kode || mc.id === c.id)
                        return (
                          <td key={c.id || c.kode} className="border border-black p-1 font-bold text-center">
                            {isMapped ? "✓" : ""}
                          </td>
                        )
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-1 text-[7.5pt] italic text-slate-500">
                *beri tanda pada CP yang dibebankan pada MK
              </p>
            </div>

            <div className="border-t border-slate-200 pt-3 text-right text-[8pt] text-slate-500 font-mono">
              F-PPK-09-r1
            </div>
          </div>
        )}

        {/* PAGE 2: PORTRAIT */}
        {(viewMode === "ALL" || viewMode === "PAGE2") && (
          <div className="relative mx-auto max-w-[820px] rounded-xl border border-slate-300 bg-white p-10 shadow-lg text-[9.5pt] text-slate-900 font-serif leading-snug">
            {/* Header Form */}
            <div className="border border-black grid grid-cols-[90px_1fr_180px] text-center mb-6">
              <div className="border-r border-black p-2 flex items-center justify-center">
                <img src="/images/rps/image1.jpeg" alt="Logo Universitas Bakrie" className="max-h-12 w-auto object-contain" />
              </div>
              <div className="p-2 flex flex-col justify-center font-bold">
                <p className="text-[12pt] tracking-wide">SYLLABUS</p>
                <p className="text-[10pt] font-semibold">(RENCANA PEMBELAJARAN SEMESTER)</p>
              </div>
              <div className="border-l border-black p-2 flex flex-col justify-center text-left text-[9pt] font-semibold space-y-1">
                <p>[{dosir.mk.kode}]</p>
                <p className="text-slate-500 font-normal">Pg. 2/3</p>
              </div>
            </div>

            {/* Subject Learning Outcome (CPMK Table) */}
            <div className="mb-6">
              <h3 className="font-bold text-[9pt] uppercase tracking-wide mb-2">
                SUBJECT LEARNING OUTCOME / Capaian Pembelajaran Mata Kuliah
              </h3>
              <table className="w-full border-collapse border border-black text-[8.5pt]">
                <thead>
                  <tr className="bg-slate-50 font-bold text-center">
                    <th className="border border-black p-1.5 w-[12%]">Course LO (CPMK)</th>
                    <th className="border border-black p-1.5 w-[42%]">Learning Outcome / Deskripsi</th>
                    <th className="border border-black p-1.5 w-[20%]">Program LO (CPL)</th>
                    <th className="border border-black p-1.5 w-[26%]">Methods of Instruction</th>
                  </tr>
                </thead>
                <tbody>
                  {(officialData?.cpmkRows || rps.cpmks || []).map((c: any) => (
                    <tr key={c.id || c.kode}>
                      <td className="border border-black p-1.5 font-bold text-center font-mono">{c.kode}</td>
                      <td className="border border-black p-1.5 text-justify">{c.deskripsi}</td>
                      <td className="border border-black p-1.5 text-center">
                        {c.cplCodes || c.cplMappings?.map((m: any) => m.cpl?.kode).join(", ") || "—"}
                      </td>
                      <td className="border border-black p-1.5 text-justify">
                        {c.metode || c.metode_pencapaian || "Tatap muka, diskusi, dan latihan terstruktur"}
                      </td>
                    </tr>
                  ))}
                  {(!rps.cpmks || rps.cpmks.length === 0) && (
                    <tr>
                      <td colSpan={4} className="border border-black p-4 text-center text-slate-400 italic">
                        Belum ada data CPMK
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Methods of Instruction */}
            <div className="mb-4">
              <h3 className="font-bold text-[9pt] uppercase tracking-wide">
                METHODS OF INSTRUCTION / Metode Pembelajaran
              </h3>
              <p className="mt-1 text-justify text-[9pt] leading-relaxed text-slate-800">
                {rps.metode_pembelajaran ||
                  "Diskusi kelompok, simulasi, studi kasus, pembelajaran kolaboratif, dan pembelajaran berbasis proyek (PBL)."}
              </p>
            </div>

            {/* Attendance Requirement */}
            <div className="mb-4">
              <h3 className="font-bold text-[9pt] uppercase tracking-wide">
                ATTENDANCE REQUIREMENT / Syarat Kehadiran
              </h3>
              <p className="mt-1 text-justify text-[9pt] leading-relaxed text-slate-800">
                {rps.persyaratan_kehadiran ||
                  "Sesuai dengan peraturan akademik Universitas Bakrie (kehadiran minimal 75% dari total tatap muka untuk dapat mengikuti Ujian Akhir Semester)."}
              </p>
            </div>

            {/* Assessment Section */}
            <div className="mb-4">
              <h3 className="font-bold text-[9pt] uppercase tracking-wide">
                ASSESSMENT / Penilaian dan Pembobotannya
              </h3>
              <div className="mt-1 rounded-lg border border-slate-200 bg-slate-50/70 p-3 text-[9pt]">
                <p className="font-bold text-slate-900 mb-1.5">
                  Coursework evaluation will be weighted as follows:
                </p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                  <p>• Mid-Semester Examination (UTS) : <strong>{officialData?.assessmentSummary.uts ?? 0}%</strong></p>
                  <p>• Final Examination (UAS) : <strong>{officialData?.assessmentSummary.uas ?? 0}%</strong></p>
                  <p>• Assignment (Tugas) : <strong>{officialData?.assessmentSummary.tugas ?? 0}%</strong></p>
                  <p>• Others (Partisipasi, Kuis, dll) : <strong>{officialData?.assessmentSummary.lainnya ?? 0}%</strong></p>
                </div>
                <div className="mt-2 border-t border-slate-200 pt-1.5 flex items-center justify-between font-bold">
                  <span>Total Penilaian:</span>
                  <span className={isWeightValid ? "text-green-700" : "text-red-600 font-extrabold"}>
                    {totalBobot}% {isWeightValid ? "(Valid 100%)" : "(Belum 100%)"}
                  </span>
                </div>
                {!isWeightValid && (
                  <p className="mt-1.5 text-[8pt] text-red-600 font-semibold">
                    PERINGATAN: Total bobot asesmen belum 100%. Dokumen berstatus DRAFT hingga bobot tepat 100%.
                  </p>
                )}
              </div>
            </div>

            {/* Material References & Supplies */}
            <div className="mb-6">
              <h3 className="font-bold text-[9pt] uppercase tracking-wide">
                MATERIAL REFERENCES AND REQUIRED SUPPLIES / Daftar Referensi & Perlengkapan
              </h3>
              <div className="mt-1 space-y-2">
                <div>
                  <p className="font-bold text-[8.5pt]">Daftar Referensi:</p>
                  <ol className="list-decimal list-inside space-y-0.5 text-[8.5pt] text-slate-800">
                    {(rps.referensis || []).map((r: any, idx: number) => (
                      <li key={r.id || idx}>
                        <strong>[{r.jenis}]</strong> {r.teks}
                      </li>
                    ))}
                    {(!rps.referensis || rps.referensis.length === 0) && (
                      <li className="text-slate-400 italic">Belum ada daftar referensi</li>
                    )}
                  </ol>
                </div>

                <div>
                  <p className="font-bold text-[8.5pt]">Perlengkapan / Required Supplies:</p>
                  <p className="text-[8.5pt] text-slate-800">
                    {officialData?.perlengkapan ||
                      (rps as any).perlengkapan_pembelajaran ||
                      "Komputer/Laptop, Perangkat Lunak Terkait, LCD Proyektor, Akses Internet, dan LMS SIPEKA."}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-3 text-right text-[8pt] text-slate-500 font-mono">
              F-PPK-09-r1
            </div>
          </div>
        )}

        {/* PAGE 3: LANDSCAPE (Course Outline) */}
        {(viewMode === "ALL" || viewMode === "PAGE3") && (
          <div className="relative mx-auto max-w-[1100px] rounded-xl border border-slate-300 bg-white p-8 shadow-lg text-[9pt] text-slate-900 font-serif leading-snug">
            {/* Header Form Landscape */}
            <div className="border border-black grid grid-cols-[90px_1fr_200px] text-center mb-6">
              <div className="border-r border-black p-2 flex items-center justify-center">
                <img src="/images/rps/image1.jpeg" alt="Logo Universitas Bakrie" className="max-h-12 w-auto object-contain" />
              </div>
              <div className="p-2 flex flex-col justify-center font-bold">
                <p className="text-[12pt] tracking-wide">SYLLABUS</p>
                <p className="text-[10pt] font-semibold">(RENCANA PEMBELAJARAN SEMESTER)</p>
              </div>
              <div className="border-l border-black p-2 flex flex-col justify-center text-left text-[9pt] font-semibold space-y-1">
                <p>[{dosir.mk.kode}]</p>
                <p className="text-slate-500 font-normal">Pg. 3/3</p>
              </div>
            </div>

            {/* Course Outline Section */}
            <div className="mb-4">
              <h3 className="font-bold text-[10pt] uppercase tracking-wide mb-2">
                COURSE OUTLINE / Rencana Pembelajaran Mingguan
              </h3>
              <p className="text-[8pt] text-slate-600 mb-3 italic">
                Rencana pembelajaran per sesi (Minggu 1-7, UTS, Minggu 8-14, UAS) sesuai formulir resmi F-PPK-09.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-black text-[8pt] leading-tight">
                  <thead>
                    <tr className="bg-slate-100 text-center font-bold">
                      <th className="border border-black p-1.5 w-[6%]">Session<br />(Sesi)</th>
                      <th className="border border-black p-1.5 w-[19%]">Targeted Competencies<br />(Kemampuan Akhir)</th>
                      <th className="border border-black p-1.5 w-[22%]">Topic & Sub-topics<br />(Materi Pembelajaran)</th>
                      <th className="border border-black p-1.5 w-[21%]">Forms of Instruction & Duration<br />(Bentuk & Waktu)</th>
                      <th className="border border-black p-1.5 w-[16%]">Material References<br />(Sumber Pembelajaran)</th>
                      <th className="border border-black p-1.5 w-[16%]">Assessment Indicators<br />(Indikator Penilaian)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {officialData ? (
                      officialData.outlineRows.map((row, idx) => {
                        if (row.type === "UTS" || row.type === "UAS") {
                          return (
                            <tr key={`outline-${idx}`} className="bg-slate-100 font-bold">
                              <td colSpan={6} className="border border-black p-2 text-center text-[8.5pt] tracking-wider uppercase">
                                {row.topic}
                              </td>
                            </tr>
                          )
                        }
                        return (
                          <tr key={`outline-${idx}`}>
                            <td className="border border-black p-1 text-center font-bold font-mono">{row.sessionNum}</td>
                            <td className="border border-black p-1.5">{row.competency}</td>
                            <td className="border border-black p-1.5 font-medium whitespace-pre-wrap">{row.topic}</td>
                            <td className="border border-black p-1.5 text-slate-700">{row.formAndDuration}</td>
                            <td className="border border-black p-1.5 text-slate-700">{row.references}</td>
                            <td className="border border-black p-1.5 text-slate-700">{row.indicators}</td>
                          </tr>
                        )
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="border border-black p-6 text-center text-slate-400 italic">
                          Memuat susunan pertemuan RPS...
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-3 text-right text-[8pt] text-slate-500 font-mono">
              F-PPK-09-r1
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={!!showConfirm} onOpenChange={() => setShowConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{showConfirm?.title}</DialogTitle>
            <DialogDescription>{showConfirm?.desc}</DialogDescription>
          </DialogHeader>

          {showConfirm?.status === "REVISION_REQUIRED" && (
            <div className="space-y-2 py-4">
              <Label>Catatan Revisi untuk Dosen Pengampu</Label>
              <Textarea
                placeholder="Tuliskan aspek RPS yang harus diperbaiki..."
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                rows={4}
              />
            </div>
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowConfirm(null)}>
              Batal
            </Button>
            <Button
              variant={showConfirm?.status === "REVISION_REQUIRED" ? "destructive" : "default"}
              onClick={() => {
                onStatusChange(showConfirm!.status, catatan)
                setShowConfirm(null)
              }}
              disabled={showConfirm?.status === "REVISION_REQUIRED" && !catatan.trim()}
            >
              Konfirmasi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
