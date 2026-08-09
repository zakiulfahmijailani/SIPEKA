import { notFound, redirect } from "next/navigation"

import { PrintToolbar } from "@/components/rps/print-toolbar"
import { getCurrentSession } from "@/lib/current-session"
import { getRpsDocumentData } from "@/lib/rps-documents"

export const dynamic = "force-dynamic"

export default async function RtmDocumentPage({ params }: { params: Promise<{ dosirId: string }> }) {
  const { dosirId } = await params
  const data = await getRpsDocumentData(dosirId)
  if (!data) notFound()
  const session = await getCurrentSession()
  if (!session?.user) redirect("/login")
  if (session.user.role === "DOSEN" && data.dosir.dosen_id !== session.user.id) redirect("/rtm")

  const assessments = [...(data.rps?.komponens ?? [])].sort((a, b) => a.urutan - b.urutan)
  const cpmkById = new Map((data.rps?.cpmks ?? []).map((item) => [item.id, item.kode]))
  const totalSks = data.dosir.mk.sks_teori + data.dosir.mk.sks_praktik

  return <div className="mx-auto max-w-[210mm] bg-slate-100 p-6 font-serif text-[10pt] print:max-w-none print:bg-white print:p-0">
    <style dangerouslySetInnerHTML={{ __html: `@media print { @page { size: A4 portrait; margin: 14mm; } .no-print { display: none !important; } .rtm-page { break-after: page; box-shadow: none !important; margin: 0 !important; } } table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #000; padding: 5px; vertical-align: top; }` }} />
    <PrintToolbar backHref="/rtm" label="RTM" />
    {assessments.length === 0 ? <div className="mt-6 rounded-xl border-2 border-dashed bg-white py-20 text-center text-sm text-slate-500">Belum ada asesmen yang dapat dibuatkan RTM.</div> : assessments.map((assessment, index) => <article key={assessment.id} className="rtm-page mt-6 space-y-5 bg-white p-[14mm] shadow-sm print:mt-0 print:p-0">
      <OfficialHeader />
      <h1 className="text-center text-[13pt] font-bold uppercase">Rencana Tugas Mahasiswa</h1>
      <table className="text-[9pt]"><tbody>
        <tr><Cell label="Mata Kuliah" value={data.dosir.mk.nama_id} /><Cell label="Kode Mata Kuliah" value={data.dosir.mk.kode} /></tr>
        <tr><Cell label="Tugas ke" value={`${index + 1} dari ${assessments.length}`} /><Cell label="SKS" value={`${totalSks} SKS`} /></tr>
        <tr><Cell label="Semester / Tahun Akademik" value={`${data.dosir.mk.semester_rekomendasi} / ${data.dosir.tahunAkademik.kode}`} /><Cell label="Dosen Pengampu" value={data.dosir.dosen.nama_lengkap} /></tr>
        <tr><Cell label="Bentuk Tugas" value={assessment.is_kelompok ? "Tugas kelompok" : "Tugas individu"} /><Cell label="Waktu Pelaksanaan" value={`Minggu ${assessment.minggu_pemberian || "-"} s.d. ${assessment.minggu_pengumpulan || "-"}`} /></tr>
      </tbody></table>
      <Block title="Judul Tugas"><p>{assessment.nama || assessment.tipe}</p></Block>
      <Block title="CPMK / Sub-CPMK yang Ditargetkan"><p>{assessment.cpmkMappings.map((item) => cpmkById.get(item.cpmk_id)).filter(Boolean).join(", ") || "-"}{assessment.subCpmkMappings.length ? `; ${assessment.subCpmkMappings.map((item) => item.subCpmk.kode).join(", ")}` : ""}</p></Block>
      <Block title="Deskripsi, Metode, dan Instruksi Tugas"><p className="whitespace-pre-wrap">{assessment.deskripsi || "-"}{assessment.instruksi ? `\n\nInstruksi: ${assessment.instruksi}` : ""}</p></Block>
      <Block title="Format Luaran"><p>{assessment.bentuk || assessment.luaran || "-"}</p></Block>
      <Block title="Indikator, Kriteria Penilaian, dan Bobot"><p className="whitespace-pre-wrap">{assessment.kriteria_penilaian || "-"}\n\nBobot: {Number(assessment.bobot).toFixed(2).replace(/\.00$/, "")}%</p></Block>
      <Block title="Referensi"><p className="whitespace-pre-wrap">{assessment.referensi_tugas || "-"}</p></Block>
      <Block title="Lain-lain"><p className="whitespace-pre-wrap">{assessment.lain_lain || "-"}</p></Block>
      <div className="grid grid-cols-2 gap-16 pt-8 text-center"><Signature label="Mengetahui," name={data.rps?.nama_penyetuju} position={data.rps?.jabatan_penyetuju || "Ketua Program Studi"} /><Signature label="Dosen Pengampu," name={data.dosir.dosen.nama_lengkap} position="" /></div>
    </article>)}</div>
}

function OfficialHeader() { return <header className="grid grid-cols-[72px_1fr_170px] border border-black text-center text-[9pt]"><div className="flex items-center justify-center border-r border-black font-bold">UB</div><div className="py-2"><p className="font-bold uppercase">Universitas Bakrie</p><p className="font-bold uppercase">Fakultas Teknologi Informasi</p><p className="font-bold uppercase">Form Rencana Tugas Mahasiswa</p></div><div className="border-l border-black p-2 text-left text-[8pt]"><p>No. Form: F-EHB-02</p><p>Tgl. Form: 1 April 2026</p><p>Rev. Form: 01</p></div></header> }
function Cell({ label, value }: { label: string; value: string }) { return <><td className="w-[25%] font-bold">{label}</td><td>{value || "-"}</td></> }
function Block({ title, children }: { title: string; children: React.ReactNode }) { return <section className="space-y-1"><h2 className="border-y border-black py-1 font-bold uppercase">{title}</h2>{children}</section> }
function Signature({ label, name, position }: { label: string; name?: string | null; position: string }) { return <div><p>{label}</p><div className="h-20" /><p className="font-bold underline">{name || "(........................................)"}</p><p>{position}</p></div> }
