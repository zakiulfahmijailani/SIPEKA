import { notFound, redirect } from "next/navigation"

import { PrintToolbar } from "@/components/rps/print-toolbar"
import { getCurrentSession } from "@/lib/current-session"
import { getOfficialRpsExportData } from "@/lib/rps-export-official"

export const dynamic = "force-dynamic"

export default async function RpsPrintPage({
  params,
}: {
  params: Promise<{ dosirId: string }>
}) {
  const session = await getCurrentSession()
  if (!session?.user) redirect("/login")

  const { dosirId } = await params
  const data = await getOfficialRpsExportData(dosirId)
  if (!data) notFound()

  // Authorization check
  if (session.user.role === "DOSEN") {
    const isAssigned =
      data.dosir.dosen_id === session.user.id ||
      (session.user.name && data.dosenList.includes(session.user.name))
    if (!isAssigned) redirect("/rps")
  }

  const {
    dosir,
    mk,
    tahunAkademik,
    rps: rpsData,
    dosenList,
    institution,
    prasyaratText,
    allCpls,
    mappedCplCodes,
    cpmkRows,
    assessmentSummary,
    isWeightValid,
    isDraft,
    outlineRows,
    references,
    perlengkapan,
  } = data

  const totalSks = (mk.sks_teori || 0) + (mk.sks_praktik || 0)
  const lecturerNames = dosenList.join(", ") || dosir.dosen?.nama_lengkap || "—"
  const preparedByName = (rpsData as any)?.nama_penyusun || dosir.dosen?.nama_lengkap || "—"
  const preparedByPosition = (rpsData as any)?.jabatan_penyusun || "Dosen Pengampu"
  const certifiedByName = rpsData?.nama_penyetuju || "—"
  const certifiedByPosition = rpsData?.jabatan_penyetuju || "Ketua Program Studi"

  return (
    <div className="min-h-screen bg-slate-100 p-6 font-serif text-[9pt] leading-snug print:bg-white print:p-0">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm 10mm 10mm 10mm;
          }
          @page landscape-sheet {
            size: A4 landscape;
            margin: 8mm 8mm 8mm 8mm;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
          .print-sheet {
            box-shadow: none !important;
            margin: 0 !important;
            max-width: 100% !important;
            padding: 0 !important;
            border: none !important;
          }
          .page-break {
            break-before: page;
            page-break-before: always;
          }
          .landscape-page {
            page: landscape-sheet;
            break-before: page;
            page-break-before: always;
          }
          .avoid-break {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
        table {
          border-collapse: collapse;
          width: 100%;
        }
        th, td {
          border: 1px solid #000;
          padding: 4px;
          vertical-align: top;
        }
        th {
          font-weight: 700;
          text-align: center;
        }
      `,
        }}
      />

      <PrintToolbar
        backHref={`/rps/${dosirId}`}
        label="RPS"
        documentType="rps"
        dosirId={dosirId}
      />

      {/* PAGE 1: PORTRAIT */}
      <article className="print-sheet mx-auto max-w-[210mm] space-y-4 bg-white p-[12mm] shadow-sm mb-8 print:mb-0">
        {/* Header Page 1 */}
        <header className="grid grid-cols-[80px_1fr_160px] border border-black text-center leading-tight">
          <div className="flex items-center justify-center border-r border-black p-2">
            <img
              src="/images/rps/image1.jpeg"
              alt="Logo Universitas Bakrie"
              className="max-h-12 w-auto object-contain"
            />
          </div>
          <div className="p-2 flex flex-col justify-center">
            <p className="text-[12pt] font-bold tracking-wide">SYLLABUS</p>
            <p className="text-[10pt] font-semibold">(RENCANA PEMBELAJARAN SEMESTER)</p>
          </div>
          <div className="border-l border-black p-2 flex flex-col justify-center text-left text-[8.5pt] font-semibold">
            <p>[{mk.kode}]</p>
            <p className="text-slate-500 font-normal">Pg. 1/3</p>
          </div>
        </header>

        {/* Table 1: Identitas Mata Kuliah */}
        <table className="text-[8.5pt]">
          <tbody>
            <tr>
              <td className="w-[28%] font-bold">Course Code (Kode Mata Kuliah)</td>
              <td className="w-[22%] font-mono">{mk.kode}</td>
              <td className="w-[25%] font-bold">Course Name (Nama Mata Kuliah)</td>
              <td className="w-[25%] font-bold">{mk.nama_id}{mk.nama_en ? ` / ${mk.nama_en}` : ""}</td>
            </tr>
            <tr>
              <td className="font-bold">Study Program (Program Studi)</td>
              <td>{institution.prodi}</td>
              <td className="font-bold">Faculty (Fakultas)</td>
              <td>{institution.fakultas}</td>
            </tr>
            <tr>
              <td className="font-bold">Course Prerequisite (Prasyarat)</td>
              <td colSpan={3}>{prasyaratText}</td>
            </tr>
            <tr>
              <td className="font-bold">Credit (Kredit)</td>
              <td>{totalSks} SKS</td>
              <td className="font-bold">Lecture / Tutorial / Practicum</td>
              <td>{mk.sks_teori || 0} / {(mk as any).sks_tutorial || 0} / {mk.sks_praktik || 0} SKS</td>
            </tr>
            <tr>
              <td className="font-bold">Revision Status (Status Revisi)</td>
              <td>{rpsData?.status_revisi || "R-1"}</td>
              <td className="font-bold">Semester & Academic Year</td>
              <td>Semester {mk.semester_rekomendasi || 1} - {tahunAkademik.kode}</td>
            </tr>
            <tr>
              <td className="font-bold">Lecturer's name (Dosen Pengampu)</td>
              <td colSpan={3} className="font-bold">{lecturerNames}</td>
            </tr>
            <tr>
              <td colSpan={2} className="align-top">
                <p className="font-bold text-[8.5pt]">Dipersiapkan oleh (Prepared by) :</p>
                <p className="mt-1">Nama (Name) : {preparedByName}</p>
                <p>Jabatan (Position) : {preparedByPosition}</p>
                <p>Tanggal (Date) : {rpsData?.tanggal_penyusunan || "—"}</p>
                <div className="h-12" />
                <p className="text-center font-mono text-[8pt] text-slate-400">( Tanda Tangan )</p>
              </td>
              <td colSpan={2} className="align-top">
                <p className="font-bold text-[8.5pt]">Disahkan oleh (Certified by) :</p>
                <p className="mt-1">Nama (Name) : {certifiedByName}</p>
                <p>Jabatan (Position) : {certifiedByPosition}</p>
                <p>Tanggal (Date) : {rpsData?.tanggal_pengesahan || "—"}</p>
                <div className="h-12" />
                <p className="text-center font-mono text-[8pt] text-slate-400">( Tanda Tangan )</p>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Course Description */}
        <section className="avoid-break space-y-1">
          <h2 className="font-bold text-[9pt] uppercase">COURSE DESCRIPTION / Deskripsi Matakuliah</h2>
          <p className="text-justify text-[8.5pt] whitespace-pre-wrap">{rpsData?.deskripsi_mk || "—"}</p>
        </section>

        {/* Course Objectives */}
        <section className="avoid-break space-y-1">
          <h2 className="font-bold text-[9pt] uppercase">COURSE OBJECTIVES / Sasaran Kompetensi Lulusan</h2>
          <p className="text-justify text-[8.5pt] whitespace-pre-wrap">
            {(rpsData as any)?.sasaran_kompetensi_lulusan ||
              "Menguasai kompetensi dasar, analisis, perancangan, dan implementasi sesuai bidang keilmuan mata kuliah ini."}
          </p>
        </section>

        {/* Learning Outcome (Table 2: CPL Matrix) */}
        <section className="avoid-break space-y-1">
          <h2 className="font-bold text-[9pt] uppercase">LEARNING OUTCOME / Capaian Pembelajaran*</h2>
          <table className="text-[8pt] text-center">
            <thead>
              <tr className="bg-slate-50 font-bold">
                <th className="w-[14%]">Course Code</th>
                <th className="w-[30%]">Course Name</th>
                <th className="w-[10%]">Credit</th>
                {allCpls.map((c) => (
                  <th key={c.id} className="p-1 text-[7.5pt]">CP<br />({c.kode})</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-mono">{mk.kode}</td>
                <td className="text-left font-medium">{mk.nama_id}</td>
                <td>{totalSks}</td>
                {allCpls.map((c) => (
                  <td key={c.id} className="font-bold">
                    {mappedCplCodes.includes(c.kode) ? "✓" : ""}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
          <p className="text-[7.5pt] italic text-slate-600">*beri tanda pada CP yang dibebankan pada MK</p>
        </section>

        <div className="pt-2 text-right text-[8pt] text-slate-500 font-mono">F-PPK-09-r1</div>
      </article>

      {/* PAGE 2: PORTRAIT */}
      <article className="print-sheet page-break mx-auto max-w-[210mm] space-y-4 bg-white p-[12mm] shadow-sm mb-8 print:mb-0">
        {/* Header Page 2 */}
        <header className="grid grid-cols-[80px_1fr_160px] border border-black text-center leading-tight">
          <div className="flex items-center justify-center border-r border-black p-2">
            <img
              src="/images/rps/image1.jpeg"
              alt="Logo Universitas Bakrie"
              className="max-h-12 w-auto object-contain"
            />
          </div>
          <div className="p-2 flex flex-col justify-center">
            <p className="text-[12pt] font-bold tracking-wide">SYLLABUS</p>
            <p className="text-[10pt] font-semibold">(RENCANA PEMBELAJARAN SEMESTER)</p>
          </div>
          <div className="border-l border-black p-2 flex flex-col justify-center text-left text-[8.5pt] font-semibold">
            <p>[{mk.kode}]</p>
            <p className="text-slate-500 font-normal">Pg. 2/3</p>
          </div>
        </header>

        {/* Subject Learning Outcome (CPMK Table) */}
        <section className="space-y-1">
          <h2 className="font-bold text-[9pt] uppercase">SUBJECT LEARNING OUTCOME / Capaian Pembelajaran Mata Kuliah</h2>
          <table className="text-[8pt]">
            <thead>
              <tr className="bg-slate-50 font-bold text-center">
                <th className="w-[12%]">Course LO (CPMK)</th>
                <th className="w-[42%]">Learning Outcome / Deskripsi</th>
                <th className="w-[20%]">Program LO (CPL)</th>
                <th className="w-[26%]">Methods of Instruction</th>
              </tr>
            </thead>
            <tbody>
              {cpmkRows.map((c) => (
                <tr key={c.kode}>
                  <td className="text-center font-bold font-mono">{c.kode}</td>
                  <td className="text-justify">{c.deskripsi}</td>
                  <td className="text-center">{c.cplCodes}</td>
                  <td className="text-justify">{c.metode}</td>
                </tr>
              ))}
              {cpmkRows.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center p-3 text-slate-400 italic">Belum ada data CPMK</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {/* Methods of Instruction */}
        <section className="avoid-break space-y-1">
          <h2 className="font-bold text-[9pt] uppercase">METHODS OF INSTRUCTION / Metode Pembelajaran</h2>
          <p className="text-justify text-[8.5pt]">
            {rpsData?.metode_pembelajaran ||
              "Diskusi kelompok, simulasi, studi kasus, pembelajaran kolaboratif, dan pembelajaran berbasis proyek (PBL)."}
          </p>
        </section>

        {/* Attendance Requirement */}
        <section className="avoid-break space-y-1">
          <h2 className="font-bold text-[9pt] uppercase">ATTENDANCE REQUIREMENT / Syarat Kehadiran</h2>
          <p className="text-justify text-[8.5pt]">
            {rpsData?.persyaratan_kehadiran ||
              "Sesuai dengan peraturan akademik Universitas Bakrie (kehadiran minimal 75% dari total tatap muka untuk dapat mengikuti Ujian Akhir Semester)."}
          </p>
        </section>

        {/* Assessment */}
        <section className="avoid-break space-y-1">
          <h2 className="font-bold text-[9pt] uppercase">ASSESSMENT / Penilaian dan Pembobotannya</h2>
          <div className="border border-black p-2 text-[8.5pt] space-y-1">
            <p className="font-bold">Coursework evaluation will be weighted as follows:</p>
            <div className="grid grid-cols-2 gap-x-4">
              <p>• Mid-Semester Examination (UTS) : {assessmentSummary.uts}%</p>
              <p>• Final Examination (UAS) : {assessmentSummary.uas}%</p>
              <p>• Assignment (Tugas) : {assessmentSummary.tugas}%</p>
              <p>• Others (Partisipasi, Kuis, dll) : {assessmentSummary.lainnya}%</p>
            </div>
            <p className="font-bold pt-1 border-t border-slate-300">Total : {assessmentSummary.total}%</p>
            {!isWeightValid && (
              <p className="text-red-600 font-bold text-[8pt]">
                PERINGATAN: Total bobot penilaian belum 100% (Status: DRAFT).
              </p>
            )}
          </div>
        </section>

        {/* Material References & Supplies */}
        <section className="avoid-break space-y-1">
          <h2 className="font-bold text-[9pt] uppercase">MATERIAL REFERENCES AND REQUIRED SUPPLIES / Daftar Referensi & Perlengkapan</h2>
          <div className="text-[8pt] space-y-1">
            <p className="font-bold">Daftar Referensi:</p>
            <ol className="list-decimal pl-4 space-y-0.5">
              {references.map((r, idx) => (
                <li key={idx}><strong>[{r.jenis}]</strong> {r.teks}</li>
              ))}
              {references.length === 0 && <li className="text-slate-400 italic">Belum ada daftar referensi</li>}
            </ol>
            <p className="font-bold pt-1">Perlengkapan / Required Supplies:</p>
            <p>{perlengkapan}</p>
          </div>
        </section>

        <div className="pt-2 text-right text-[8pt] text-slate-500 font-mono">F-PPK-09-r1</div>
      </article>

      {/* PAGE 3: LANDSCAPE (Course Outline) */}
      <article className="print-sheet landscape-page mx-auto max-w-[297mm] space-y-3 bg-white p-[10mm] shadow-sm print:max-w-none">
        {/* Header Page 3 Landscape */}
        <header className="grid grid-cols-[80px_1fr_180px] border border-black text-center leading-tight">
          <div className="flex items-center justify-center border-r border-black p-2">
            <img
              src="/images/rps/image1.jpeg"
              alt="Logo Universitas Bakrie"
              className="max-h-12 w-auto object-contain"
            />
          </div>
          <div className="p-2 flex flex-col justify-center">
            <p className="text-[12pt] font-bold tracking-wide">SYLLABUS</p>
            <p className="text-[10pt] font-semibold">(RENCANA PEMBELAJARAN SEMESTER)</p>
          </div>
          <div className="border-l border-black p-2 flex flex-col justify-center text-left text-[8.5pt] font-semibold">
            <p>[{mk.kode}]</p>
            <p className="text-slate-500 font-normal">Pg. 3/3</p>
          </div>
        </header>

        <section className="space-y-1">
          <h2 className="font-bold text-[9.5pt] uppercase">COURSE OUTLINE / Rencana Pembelajaran Mingguan</h2>
          <table className="text-[7.5pt] leading-tight">
            <thead>
              <tr className="bg-slate-100 font-bold text-center">
                <th className="w-[6%]">Session<br />(Sesi)</th>
                <th className="w-[19%]">Targeted Competencies<br />(Kemampuan Akhir)</th>
                <th className="w-[22%]">Topic & Sub-topics<br />(Materi Pembelajaran)</th>
                <th className="w-[21%]">Forms of Instruction & Duration<br />(Bentuk & Waktu)</th>
                <th className="w-[16%]">Material References<br />(Sumber Pembelajaran)</th>
                <th className="w-[16%]">Assessment Indicators<br />(Indikator Penilaian)</th>
              </tr>
            </thead>
            <tbody>
              {outlineRows.map((row, idx) => {
                if (row.type === "UTS" || row.type === "UAS") {
                  return (
                    <tr key={`outline-${idx}`} className="bg-slate-100 font-bold">
                      <td colSpan={6} className="text-center p-2 text-[8.5pt] uppercase tracking-wider">
                        {row.topic}
                      </td>
                    </tr>
                  )
                }
                return (
                  <tr key={`outline-${idx}`}>
                    <td className="text-center font-bold font-mono">{row.sessionNum}</td>
                    <td>{row.competency}</td>
                    <td className="whitespace-pre-wrap font-medium">{row.topic}</td>
                    <td>{row.formAndDuration}</td>
                    <td>{row.references}</td>
                    <td>{row.indicators}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </section>

        <div className="pt-2 text-right text-[8pt] text-slate-500 font-mono">F-PPK-09-r1</div>
      </article>
    </div>
  )
}
