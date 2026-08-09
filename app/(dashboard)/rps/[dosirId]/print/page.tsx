import { db } from "@/db"
import { dosirMk, mkPrasyarat, petaKurikulum, rps } from "@/db/schema"
import { desc, eq } from "drizzle-orm"
import { notFound, redirect } from "next/navigation"

import { PrintToolbar } from "@/components/rps/print-toolbar"
import { getCurrentSession } from "@/lib/current-session"

export const dynamic = "force-dynamic"

const formatDate = (value?: string | Date | null) => {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(date)
}

const semesterLabel = (kode: string) => kode.endsWith("-2") ? "Genap" : "Ganjil"

function OfficialHeader({ title, formCode }: { title: string; formCode: string }) {
  return (
    <header className="grid grid-cols-[72px_1fr_170px] border border-black text-center text-[9pt] leading-tight">
      <div className="flex items-center justify-center border-r border-black font-sans text-[9pt] font-bold">UB</div>
      <div className="px-4 py-3">
        <p className="font-bold uppercase">Universitas Bakrie</p>
        <p className="font-bold uppercase">Fakultas Teknologi Informasi</p>
        <p className="mt-1 font-bold uppercase">{title}</p>
      </div>
      <div className="border-l border-black px-2 py-2 text-left text-[8pt]">
        <p>No. Form: {formCode}</p>
        <p>Tgl. Form: 1 April 2026</p>
        <p>Rev. Form: 01</p>
      </div>
    </header>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="border-y border-black py-1.5 text-[10pt] font-bold uppercase">{children}</h2>
}

function Signature({ label, name, position, date }: { label: string; name?: string | null; position: string; date?: string | Date | null }) {
  return (
    <div className="text-center text-[10pt]">
      <p className="whitespace-pre-line">{label}</p>
      <div className="h-20" />
      <p className="font-bold underline underline-offset-2">{name || "(........................................)"}</p>
      <p>{position}</p>
      <p className="mt-1 text-[9pt]">{formatDate(date)}</p>
    </div>
  )
}

export default async function RpsPrintPage({ params }: { params: Promise<{ dosirId: string }> }) {
  const session = await getCurrentSession()
  if (!session?.user) redirect("/login")

  const { dosirId } = await params
  const dosir = await db.query.dosirMk.findFirst({
    where: eq(dosirMk.id, dosirId),
    with: { mk: true, dosen: true, tahunAkademik: true },
  })
  if (!dosir) notFound()
  if (session.user.role === "DOSEN" && dosir.dosen_id !== session.user.id) redirect("/rps")

  const [rpsData, mappedCpls, prerequisites] = await Promise.all([
    db.query.rps.findFirst({
      where: eq(rps.dosir_mk_id, dosirId),
      orderBy: [desc(rps.version)],
      with: {
        cpmks: { with: { cplMappings: { with: { cpl: true } } } },
        komponens: { with: { cpmkMappings: true, subCpmkMappings: { with: { subCpmk: true } }, rubrikKriterias: true } },
        pertemuans: { with: { subCpmkMappings: { with: { subCpmk: true } } } },
        referensis: true,
      },
    }),
    db.query.petaKurikulum.findMany({ where: eq(petaKurikulum.mk_id, dosir.mk_id), with: { cpl: true } }),
    db.query.mkPrasyarat.findMany({ where: eq(mkPrasyarat.mk_id, dosir.mk_id), with: { prasyarat: true } }),
  ])
  if (!rpsData) return <div className="p-20 text-center">RPS belum tersedia untuk dicetak.</div>

  const totalSks = dosir.mk.sks_teori + dosir.mk.sks_praktik
  const totalBobot = Number((rpsData.komponens.reduce((sum, item) => sum + Number(item.bobot || 0), 0)).toFixed(2))
  const courseName = dosir.mk.nama_en ? `${dosir.mk.nama_id} / ${dosir.mk.nama_en}` : dosir.mk.nama_id

  return (
    <div className="min-h-screen bg-slate-100 p-6 font-serif text-[10pt] leading-snug print:bg-white print:p-0">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: A4 portrait; margin: 14mm; }
          @page course-outline { size: A4 landscape; margin: 10mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .print-page { box-shadow: none !important; margin: 0 !important; }
          .course-outline-page { page: course-outline; break-before: page; }
          .avoid-break { break-inside: avoid; }
        }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #000; padding: 5px; vertical-align: top; }
        th { font-weight: 700; text-align: center; }
      `}} />
      <PrintToolbar backHref={`/rps/${dosirId}`} label="RPS" />

      <article className="print-page mx-auto max-w-[210mm] space-y-5 bg-white p-[14mm] shadow-sm print:max-w-none print:p-0">
        <OfficialHeader title="Form Rencana Pembelajaran Semester (RPS)" formCode="F-PPK-09" />

        <table className="text-[9pt]">
          <tbody>
            <tr><td className="w-[26%] font-bold">Course Code / Kode Mata Kuliah</td><td>{dosir.mk.kode}</td><td className="w-[25%] font-bold">Course Name / Nama Mata Kuliah</td><td>{courseName}</td></tr>
            <tr><td className="font-bold">Study Program / Program Studi</td><td>Sistem Informasi / Information System</td><td className="font-bold">Faculty / Fakultas</td><td>Fakultas Teknologi Informasi</td></tr>
            <tr><td className="font-bold">Course Prerequisite / Prasyarat</td><td colSpan={3}>{prerequisites.length ? prerequisites.map((item) => `${item.prasyarat.kode} — ${item.prasyarat.nama_id}`).join("; ") : "Tidak ada"}</td></tr>
            <tr><td className="font-bold">Credit / Kredit</td><td>{totalSks} SKS</td><td className="font-bold">Lecture / Tutorial / Practicum</td><td>{dosir.mk.sks_teori} / 0 / {dosir.mk.sks_praktik} SKS</td></tr>
            <tr><td className="font-bold">Revision Status / Status Revisi</td><td>{rpsData.status_revisi}</td><td className="font-bold">Semester / Tahun Akademik</td><td>{semesterLabel(dosir.tahunAkademik.kode)} / {dosir.tahunAkademik.kode}</td></tr>
            <tr><td className="font-bold">Lecturer’s Name / Dosen Pengampu</td><td colSpan={3}>{dosir.dosen.nama_lengkap}</td></tr>
          </tbody>
        </table>

        <section className="space-y-2 avoid-break">
          <SectionTitle>Course Description / Deskripsi Mata Kuliah</SectionTitle>
          <p className="whitespace-pre-wrap text-justify">{rpsData.deskripsi_mk || "—"}</p>
        </section>

        <section className="space-y-2 avoid-break">
          <SectionTitle>Learning Outcome / Capaian Pembelajaran</SectionTitle>
          <table className="text-[8.5pt]">
            <thead><tr><th>Kode MK</th><th>Nama Mata Kuliah</th><th>SKS</th>{mappedCpls.map((item) => <th key={item.cpl_id}>{item.cpl.kode}</th>)}</tr></thead>
            <tbody><tr><td>{dosir.mk.kode}</td><td>{courseName}</td><td className="text-center">{totalSks}</td>{mappedCpls.map((item) => <td key={item.cpl_id} className="text-center font-bold">{item.cpl.kode}</td>)}</tr></tbody>
          </table>
        </section>

        <section className="space-y-2">
          <SectionTitle>Subject Learning Outcome / Capaian Pembelajaran Mata Kuliah</SectionTitle>
          <table className="text-[8.5pt]">
            <thead><tr><th className="w-16">Kode CPMK</th><th>Uraian CPMK</th><th>CP / CPL</th><th className="w-[20%]">Metode Pencapaian</th></tr></thead>
            <tbody>{rpsData.cpmks.sort((a, b) => a.urutan - b.urutan).map((item) => (
              <tr key={item.id}><td className="text-center font-bold">{item.kode}</td><td className="text-justify">{item.deskripsi}</td><td className="text-justify">{item.cplMappings.map((mapping) => `${mapping.cpl.kode} — ${mapping.cpl.rumusan}`).join("; ") || "—"}</td><td>{item.metode_pencapaian || "—"}</td></tr>
            ))}</tbody>
          </table>
        </section>

        <section className="space-y-2 avoid-break"><SectionTitle>Methods of Instruction / Metode Pembelajaran</SectionTitle><p className="whitespace-pre-wrap text-justify">{rpsData.metode_pembelajaran || "—"}</p></section>
        <section className="space-y-2 avoid-break"><SectionTitle>Attendance Requirement / Persyaratan Kehadiran</SectionTitle><p className="whitespace-pre-wrap text-justify">{rpsData.persyaratan_kehadiran || "—"}</p></section>

        <section className="space-y-2 avoid-break">
          <SectionTitle>Assessment / Penilaian</SectionTitle>
          <table className="text-[9pt]"><thead><tr><th className="w-10">No.</th><th>Komponen Penilaian</th><th className="w-24">Bobot</th></tr></thead><tbody>
            {rpsData.komponens.sort((a, b) => a.urutan - b.urutan).map((item, index) => <tr key={item.id}><td className="text-center">{index + 1}</td><td>{item.nama || item.tipe}</td><td className="text-center">{Number(item.bobot).toFixed(2).replace(/\.00$/, "")}%</td></tr>)}
            <tr className="font-bold"><td colSpan={2} className="text-right">Total</td><td className="text-center">{totalBobot}%</td></tr>
          </tbody></table>
        </section>

        <section className="space-y-2 avoid-break">
          <SectionTitle>Material References / Bahan Referensi</SectionTitle>
          <ol className="list-decimal space-y-1 pl-5">{rpsData.referensis.sort((a, b) => a.urutan - b.urutan).map((item) => <li key={item.id}><strong>[{item.jenis}]</strong> {item.teks}</li>)}</ol>
        </section>

        <section className="grid grid-cols-2 gap-16 pt-8">
          <Signature label="Dipersiapkan oleh" name={dosir.dosen.nama_lengkap} position="Dosen Pengampu" date={rpsData.tanggal_penyusunan} />
          <Signature label="Disahkan oleh" name={rpsData.nama_penyetuju} position={rpsData.jabatan_penyetuju} date={rpsData.tanggal_pengesahan} />
        </section>
      </article>

      <article className="course-outline-page print-page mx-auto mt-6 max-w-[297mm] space-y-5 bg-white p-[10mm] shadow-sm print:mt-0 print:max-w-none print:p-0">
        <OfficialHeader title="Course Outline / Rencana Pembelajaran Mingguan" formCode="F-PPK-09" />
        <table className="text-[7.5pt] leading-tight">
          <thead><tr><th className="w-10">Sesi</th><th className="w-[19%]">Targeted Competencies / Kemampuan Akhir</th><th className="w-[24%]">Topic & Sub-topics / Materi Pembelajaran</th><th className="w-[18%]">Forms of Instruction & Duration</th><th className="w-[14%]">Material References</th><th>Assessment Indicators / Indikator Penilaian</th></tr></thead>
          <tbody>{rpsData.pertemuans.sort((a, b) => a.minggu_ke - b.minggu_ke).map((meeting) => (
            <tr key={meeting.id}>
              <td className="text-center font-bold">{meeting.minggu_ke}</td>
              <td>{meeting.subCpmkMappings.map((mapping) => <p key={mapping.sub_cpmk_id}><strong>{mapping.subCpmk.kode}</strong> — {mapping.subCpmk.deskripsi}</p>)}{!meeting.subCpmkMappings.length && "—"}</td>
              <td className="whitespace-pre-wrap">{meeting.materi || "—"}</td>
              <td><p><strong>Bentuk:</strong> {meeting.bentuk_pembelajaran || "—"}</p><p><strong>Metode:</strong> {meeting.metode || "—"}</p><p><strong>Waktu:</strong> {meeting.estimasi_waktu || "—"}</p></td>
              <td className="whitespace-pre-wrap">{meeting.referensi || "—"}</td>
              <td><p className="whitespace-pre-wrap">{meeting.indikator || "—"}</p>{meeting.kriteria_penilaian && <p className="mt-1 whitespace-pre-wrap"><strong>Penilaian:</strong> {meeting.kriteria_penilaian}</p>}</td>
            </tr>
          ))}</tbody>
        </table>
        <section className="grid grid-cols-2 gap-16 pt-6">
          <Signature label="Dipersiapkan oleh" name={dosir.dosen.nama_lengkap} position="Dosen Pengampu" date={rpsData.tanggal_penyusunan} />
          <Signature label="Disahkan oleh" name={rpsData.nama_penyetuju} position={rpsData.jabatan_penyetuju} date={rpsData.tanggal_pengesahan} />
        </section>
      </article>
    </div>
  )
}
