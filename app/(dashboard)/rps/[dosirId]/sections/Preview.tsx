"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, Send, RotateCcw, AlertTriangle, Printer, ClipboardList, ClipboardCheck } from "lucide-react"
import { useMemo, useState } from "react"
import { calculateRpsReadiness } from "@/lib/rps-readiness"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import type { RpsStatus } from "../../actions"

interface PreviewSectionProps {
  dosir: any
  rps: any
  mappedCpls: any[]
  onStatusChange: (status: RpsStatus, catatan?: string) => void
  currentUser: any
}

export function PreviewSection({ dosir, rps, mappedCpls, onStatusChange, currentUser }: PreviewSectionProps) {
  const [showConfirm, setShowConfirm] = useState<{ status: RpsStatus; title: string; desc: string } | null>(null)
  const [catatan, setCatatan] = useState("")

  const totalBobot = useMemo(() => {
    return Number((rps.komponens?.reduce((sum: number, k: any) => sum + Number(k.bobot || 0), 0) || 0).toFixed(2))
  }, [rps.komponens])

  const readiness = useMemo(() => calculateRpsReadiness(rps), [rps])
  const isValid = readiness.issues.length === 0

  const handlePrint = () => {
    window.open(`/rps/${dosir.id}/print`, "_blank")
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Kontrol Aksi */}
      <div className="flex flex-wrap gap-3 p-4 bg-blue-50 border border-blue-100 rounded-lg no-print">
        <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
          <Printer className="h-4 w-4" /> Cetak RPS
        </Button>
        <Button variant="outline" size="sm" onClick={() => window.open(`/rpm/${dosir.id}`, "_blank")} className="gap-2">
          <ClipboardCheck className="h-4 w-4" /> Lihat RPM (Rubrik)
        </Button>
        <Button variant="outline" size="sm" onClick={() => window.open(`/rtm/${dosir.id}`, "_blank")} className="gap-2">
          <ClipboardList className="h-4 w-4" /> Lihat RTM
        </Button>

        {rps.status === "DRAFT" || rps.status === "REVISION_REQUIRED" ? (
          <Button
            size="sm"
            disabled={!isValid}
            onClick={() => setShowConfirm({
              status: "SUBMITTED",
              title: "Ajukan RPS?",
              desc: "RPS akan dikirim ke Kaprodi untuk ditinjau."
            })}
            className="gap-2"
          >
            <Send className="h-4 w-4" /> Ajukan ke Kaprodi
          </Button>
        ) : null}

        {currentUser.role !== "DOSEN" && rps.status === "SUBMITTED" ? (
          <>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setShowConfirm({
                status: "REVISION_REQUIRED",
                title: "Kembalikan RPS?",
                desc: "Berikan catatan revisi untuk dosen pengampu."
              })}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" /> Kembalikan / Revisi
            </Button>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 gap-2"
              onClick={() => setShowConfirm({
                status: "APPROVED",
                title: "Setujui RPS?",
                desc: "RPS akan disahkan dan digunakan untuk perkuliahan."
              })}
            >
              <CheckCircle2 className="h-4 w-4" /> Setujui & Sahkan
            </Button>
          </>
        ) : null}

        {!isValid && (
          <div className="flex min-w-full items-start gap-2 rounded-md border border-red-100 bg-white/70 p-3 text-xs font-medium text-red-700">
            <AlertTriangle className="h-4 w-4" />
            <div>
              <p>Dokumen belum siap diajukan:</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-4 font-normal">
                {readiness.issues.map((issue) => <li key={issue}>{issue}</li>)}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Dokumen RPS */}
      <div className="document-container space-y-8 p-8 border shadow-sm rounded bg-white font-serif text-sm">
        <div className="text-center space-y-1 border-b-2 pb-4">
          <h1 className="text-2xl font-bold uppercase">Rencana Pembelajaran Semester (RPS)</h1>
          <p className="text-lg">{dosir.mk.nama_id} ({dosir.mk.kode})</p>
          <p className="font-bold">Program Studi Sistem Informasi</p>
        </div>

        {/* 1. Identitas */}
        <section className="space-y-2">
           <h3 className="font-bold border-b">I. IDENTITAS MATA KULIAH</h3>
           <table className="w-full border-collapse">
             <tbody>
               <tr><td className="w-48 py-1">Nama Mata Kuliah</td><td className="w-4">:</td><td className="font-bold">{dosir.mk.nama_id}</td></tr>
               <tr><td className="py-1">Kode MK</td><td>:</td><td className="font-mono">{dosir.mk.kode}</td></tr>
               <tr><td className="py-1">SKS</td><td>:</td><td>{dosir.mk.sks_teori + dosir.mk.sks_praktik} SKS</td></tr>
               <tr><td className="py-1">Semester / Kelas</td><td>:</td><td>{dosir.mk.semester_rekomendasi} / {dosir.kelas}</td></tr>
               <tr><td className="py-1">Tahun Akademik</td><td>:</td><td>{dosir.tahunAkademik.kode}</td></tr>
               <tr><td className="py-1">Dosen Pengampu</td><td>:</td><td>{dosir.dosen.nama_lengkap}</td></tr>
             </tbody>
           </table>
        </section>

        {/* 2. CPL */}
        <section className="space-y-2">
           <h3 className="font-bold border-b uppercase">II. Capaian Pembelajaran Lulusan (CPL)</h3>
           <div className="space-y-2">
             {mappedCpls.map(c => (
               <div key={c.id} className="flex gap-4">
                 <span className="font-bold min-w-[60px]">{c.kode}</span>
                 <span className="text-justify">{c.rumusan}</span>
               </div>
             ))}
           </div>
        </section>

        {/* 3. CPMK */}
        <section className="space-y-2">
           <h3 className="font-bold border-b uppercase">III. Capaian Pembelajaran Mata Kuliah (CPMK)</h3>
           <div className="space-y-2">
             {rps.cpmks?.map((c: any) => (
               <div key={c.id} className="flex gap-4">
                 <span className="font-bold min-w-[60px]">{c.kode}</span>
                 <div className="space-y-1">
                   <p className="text-justify">{c.deskripsi}</p>
                   <p className="text-[10px] text-gray-500 uppercase tracking-tighter">Mendukung: {c.cplMappings?.[0]?.cpl?.kode || 'N/A'}</p>
                 </div>
               </div>
             ))}
           </div>
        </section>

        {/* 4. Penilaian */}
        <section className="space-y-2">
           <h3 className="font-bold border-b uppercase">IV. KOMPONEN PENILAIAN</h3>
           <Table className="border">
             <TableHeader className="bg-gray-50">
               <TableRow>
                 <TableHead className="w-10">No</TableHead>
                 <TableHead>Komponen</TableHead>
                 <TableHead className="text-center w-32">CPMK Terukur</TableHead>
                 <TableHead className="text-right w-24">Bobot (%)</TableHead>
               </TableRow>
             </TableHeader>
             <TableBody>
               {rps.komponens?.map((k: any, i: number) => (
                 <TableRow key={k.id}>
                   <TableCell className="text-center">{i+1}</TableCell>
                   <TableCell className="font-medium">{k.nama}</TableCell>
                   <TableCell className="text-center">
                      <div className="flex flex-wrap justify-center gap-1">
                        {k.cpmkMappings?.map((m: any) => <span key={m.cpmk_id} className="text-[10px] font-mono border px-1 rounded">{rps.cpmks.find((cx:any) => cx.id === m.cpmk_id)?.kode}</span>)}
                      </div>
                   </TableCell>
                   <TableCell className="text-right">{k.bobot}%</TableCell>
                 </TableRow>
               ))}
               <TableRow className="bg-gray-50 font-bold">
                 <TableCell colSpan={3} className="text-right">TOTAL</TableCell>
                 <TableCell className="text-right">{totalBobot}%</TableCell>
               </TableRow>
             </TableBody>
           </Table>
        </section>

        {/* 5. Pertemuan */}
        <section className="space-y-2">
           <h3 className="font-bold border-b uppercase">V. Rencana Pertemuan</h3>
           <Table className="border text-[10px] leading-tight">
             <TableHeader className="bg-gray-50">
               <TableRow>
                 <TableHead className="w-8">Mng</TableHead>
                 <TableHead className="w-1/2">Materi / Topik</TableHead>
                 <TableHead>Metode & Media</TableHead>
                 <TableHead className="w-16">Waktu</TableHead>
               </TableRow>
             </TableHeader>
             <TableBody>
               {rps.pertemuans?.sort((a:any, b:any) => a.minggu_ke - b.minggu_ke).map((m: any) => (
                 <TableRow key={m.id}>
                   <TableCell className="text-center font-bold">{m.minggu_ke}</TableCell>
                   <TableCell className="whitespace-pre-wrap">{m.materi}</TableCell>
                   <TableCell>
                      <p className="font-semibold">{m.metode}</p>
                      <p className="text-gray-500">{m.media}</p>
                   </TableCell>
                   <TableCell className="text-center">{m.estimasi_waktu}</TableCell>
                 </TableRow>
               ))}
             </TableBody>
           </Table>
        </section>

        {/* 6. Referensi */}
        <section className="space-y-2">
           <h3 className="font-bold border-b uppercase">VI. REFERENSI</h3>
           <ul className="list-decimal list-inside space-y-1">
             {rps.referensis?.sort((a:any, b:any) => a.urutan - b.urutan).map((r: any) => (
               <li key={r.id} className="text-justify"><span className="font-bold">[{r.jenis}]</span> {r.teks}</li>
             ))}
           </ul>
        </section>
      </div>

      {/* Dialog Konfirmasi */}
      <Dialog open={!!showConfirm} onOpenChange={() => setShowConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{showConfirm?.title}</DialogTitle>
            <DialogDescription>{showConfirm?.desc}</DialogDescription>
          </DialogHeader>

          {showConfirm?.status === "REVISION_REQUIRED" && (
            <div className="space-y-2 py-4">
               <Label>Catatan Revisi</Label>
               <Textarea
                 placeholder="Tuliskan catatan perbaikan untuk dosen..."
                 value={catatan}
                 onChange={(e) => setCatatan(e.target.value)}
                 rows={4}
               />
            </div>
          )}

          <DialogFooter>
             <Button variant="ghost" onClick={() => setShowConfirm(null)}>Batal</Button>
             <Button
               variant={showConfirm?.status === "REVISION_REQUIRED" ? "destructive" : "default"}
               onClick={() => {
                 onStatusChange(showConfirm!.status, catatan)
                 setShowConfirm(null)
               }}
               disabled={showConfirm?.status === "REVISION_REQUIRED" && !catatan}
             >
               Konfirmasi
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
