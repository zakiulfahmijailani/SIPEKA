import { notFound, redirect } from "next/navigation"

import { PrintToolbar } from "@/components/rps/print-toolbar"
import { getCurrentSession } from "@/lib/current-session"
import { getRpsDocumentData } from "@/lib/rps-documents"

export const dynamic = "force-dynamic"

const gradeScale = [
  ["A", "85 - 100", "4.00", "Sangat baik"],
  ["A-", "80 - 84,99", "3.67", "Hampir sangat baik"],
  ["B+", "75 - 79,99", "3.33", "Baik plus"],
  ["B", "70 - 74,99", "3.00", "Baik"],
  ["C+", "65 - 69,99", "2.33", "Cukup plus"],
  ["C", "60 - 64,99", "2.00", "Cukup"],
  ["D", "50 - 59,99", "1.00", "Kurang"],
  ["E", "0 - 49,99", "0.00", "Sangat kurang"],
]

export default async function RpmDocumentPage({ params }: { params: Promise<{ dosirId: string }> }) {
  const { dosirId } = await params
  const data = await getRpsDocumentData(dosirId)
  if (!data) notFound()

  const session = await getCurrentSession()
  if (!session?.user) redirect("/login")
  if (session.user.role === "DOSEN" && data.dosir.dosen_id !== session.user.id) redirect("/rpm")

  const assessments = [...(data.rps?.komponens ?? [])].sort((a, b) => a.urutan - b.urutan)
  const cpmkById = new Map((data.rps?.cpmks ?? []).map((item) => [item.id, item.kode]))
  const totalSks = data.dosir.mk.sks_teori + data.dosir.mk.sks_praktik

  return (
    <div className="mx-auto max-w-[210mm] bg-slate-100 p-6 font-serif text-[10pt] print:max-w-none print:bg-white print:p-0">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print { @page { size: A4 portrait; margin: 14mm; } .no-print { display: none !important; } .rpm-page { break-after: page; box-shadow: none !important; margin: 0 !important; } }
        table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #000; padding: 5px; vertical-align: top; } th { text-align: center; font-weight: 700; }
      ` }} />
      <PrintToolbar backHref="/rpm" label="RPM (Rubrik Penilaian Mahasiswa)" />

      {assessments.length === 0 ? (
        <div className="mt-6 rounded-xl border-2 border-dashed bg-white py-20 text-center text-sm text-slate-500">Belum ada komponen asesmen yang dapat dibuatkan RPM.</div>
      ) : assessments.map((assessment, index) => (
        <article key={assessment.id} className="rpm-page mt-6 space-y-5 bg-white p-[14mm] shadow-sm print:mt-0 print:p-0">
          <OfficialHeader />
          <h1 className="text-center text-[13pt] font-bold uppercase">Rubrik Penilaian Mahasiswa</h1>
          <table className="text-[9pt]">
            <tbody>
              <tr><Cell label="Mata Kuliah" value={`${data.dosir.mk.kode} - ${data.dosir.mk.nama_id}`} /><Cell label="SKS" value={`${totalSks} SKS`} /></tr>
              <tr><Cell label="Program Studi" value="Sistem Informasi" /><Cell label="Semester / Tahun Akademik" value={`${data.dosir.mk.semester_rekomendasi} / ${data.dosir.tahunAkademik.kode}`} /></tr>
              <tr><Cell label="Dosen Pengampu" value={data.dosir.dosen.nama_lengkap} /><Cell label="Kelas" value={data.dosir.kelas} /></tr>
              <tr><Cell label="Komponen Penilaian" value={assessment.nama || assessment.tipe} /><Cell label="Bobot" value={`${Number(assessment.bobot).toFixed(2).replace(/\.00$/, "")}%`} /></tr>
            </tbody>
          </table>

          <section className="space-y-2"><Title>CPMK dan Sub-CPMK yang Dinilai</Title><p>{assessment.cpmkMappings.map((item) => cpmkById.get(item.cpmk_id)).filter(Boolean).join(", ") || "-"}{assessment.subCpmkMappings.length ? `; ${assessment.subCpmkMappings.map((item) => item.subCpmk.kode).join(", ")}` : ""}</p></section>
          <section className="space-y-2"><Title>Rubrik Penilaian</Title>
            {assessment.rubrikKriterias.length === 0 ? <p>Rubrik belum dilengkapi pada RPS.</p> : (
              <table className="text-[8pt] leading-tight"><thead><tr><th>Kriteria</th><th className="w-12">Bobot</th><th>Sangat Baik<br />(81-100)</th><th>Baik<br />(61-80)</th><th>Cukup<br />(41-60)</th><th>Kurang<br />(21-40)</th><th>Sangat Kurang<br />(0-20)</th></tr></thead><tbody>
                {assessment.rubrikKriterias.sort((a, b) => a.urutan - b.urutan).map((rubric) => <tr key={rubric.id}><td className="font-semibold">{rubric.kriteria}</td><td className="text-center">{Number(rubric.bobot).toFixed(2).replace(/\.00$/, "")}%</td><td>{rubric.sangat_baik || "-"}</td><td>{rubric.baik || "-"}</td><td>{rubric.cukup || "-"}</td><td>{rubric.kurang || "-"}</td><td>{rubric.sangat_kurang || "-"}</td></tr>)}
              </tbody></table>
            )}
          </section>
          <section className="space-y-2"><Title>Skala Penilaian</Title><table className="text-[8.5pt]"><thead><tr><th>Kualitas</th><th>Nilai</th><th>Nilai Mutu</th><th>Deskripsi / Indikator</th></tr></thead><tbody>{gradeScale.map((row) => <tr key={row[0]}>{row.map((value, cell) => <td key={value} className={cell < 3 ? "text-center" : ""}>{value}</td>)}</tr>)}</tbody></table></section>
          <div className="grid grid-cols-2 gap-16 pt-8 text-center"><Signature label="Mengetahui," name={data.rps?.nama_penyetuju} position={data.rps?.jabatan_penyetuju || "Ketua Program Studi"} /><Signature label="Dosen Pengampu," name={data.dosir.dosen.nama_lengkap} position="" /></div>
          <p className="text-right text-[8pt] text-slate-500">RPM {index + 1} dari {assessments.length}</p>
        </article>
      ))}
    </div>
  )
}

function OfficialHeader() { return <header className="grid grid-cols-[72px_1fr_170px] border border-black text-center text-[9pt]"><div className="flex items-center justify-center border-r border-black font-bold">UB</div><div className="py-2"><p className="font-bold uppercase">Universitas Bakrie</p><p className="font-bold uppercase">Fakultas Teknologi Informasi</p><p className="font-bold uppercase">Form Rubrik Penilaian Mahasiswa</p></div><div className="border-l border-black p-2 text-left text-[8pt]"><p>No. Form: F-EHB-03</p><p>Tgl. Form: 1 April 2026</p><p>Rev. Form: 01</p></div></header> }
function Cell({ label, value }: { label: string; value: string }) { return <><td className="w-[25%] font-bold">{label}</td><td>{value || "-"}</td></> }
function Title({ children }: { children: React.ReactNode }) { return <h2 className="border-y border-black py-1 font-bold uppercase">{children}</h2> }
function Signature({ label, name, position }: { label: string; name?: string | null; position: string }) { return <div><p>{label}</p><div className="h-20" /><p className="font-bold underline">{name || "(........................................)"}</p><p>{position}</p></div> }
