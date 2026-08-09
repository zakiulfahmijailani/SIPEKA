import React from "react"
import {
  AlignmentType,
  Document as DocxDocument,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx"
import { Document, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer"

export type ExportDocumentType = "rps" | "rtm" | "rpm"

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

const dash = (value?: string | null) => value?.trim() || "-"
const percentage = (value: number | string | null | undefined) => `${Number(value || 0).toFixed(2).replace(/\.00$/, "")}%`
const totalSks = (data: any) => data.dosir.mk.sks_teori + data.dosir.mk.sks_praktik
const courseName = (data: any) => data.dosir.mk.nama_en ? `${data.dosir.mk.nama_id} / ${data.dosir.mk.nama_en}` : data.dosir.mk.nama_id
const assessments = (data: any) => [...(data.rps?.komponens ?? [])].sort((a, b) => a.urutan - b.urutan)
const cpmks = (data: any) => [...(data.rps?.cpmks ?? [])].sort((a, b) => a.urutan - b.urutan)
const meetings = (data: any) => [...(data.rps?.pertemuans ?? [])].sort((a, b) => a.minggu_ke - b.minggu_ke)

function docxCell(value: string, bold = false) {
  return new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: value || "-", bold, size: 18 })] })] })
}

function docxTable(rows: string[][], header = false) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map((row, rowIndex) => new TableRow({ children: row.map((value) => docxCell(value, header && rowIndex === 0)) })),
  })
}

function docxTitle(text: string) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_2, spacing: { before: 180, after: 80 } })
}

function docxHeader(title: string, formCode: string) {
  return docxTable([["UB", `UNIVERSITAS BAKRIE\nFAKULTAS TEKNOLOGI INFORMASI\n${title.toUpperCase()}`, `No. Form: ${formCode}\nTgl. Form: 1 April 2026\nRev. Form: 01`]])
}

function docxSignature(data: any) {
  return docxTable([
    ["Dipersiapkan oleh", "Disahkan oleh"],
    ["\n\n\n" + data.dosir.dosen.nama_lengkap + "\nDosen Pengampu", "\n\n\n" + (data.rps?.nama_penyetuju || "(........................................)") + "\n" + (data.rps?.jabatan_penyetuju || "Ketua Program Studi")],
  ])
}

function rpsChildren(data: any) {
  const rps = data.rps
  const cplCodes = Array.from(new Map(cpmks(data).flatMap((item: any) => item.cplMappings.map((mapping: any) => [mapping.cpl.id, mapping.cpl]))).values()) as any[]
  const assessmentRows = assessments(data).map((item: any, index: number) => [String(index + 1), item.nama || item.tipe, percentage(item.bobot)])
  const outlineRows = meetings(data).map((item: any) => [String(item.minggu_ke), item.subCpmkMappings.map((mapping: any) => `${mapping.subCpmk.kode}: ${mapping.subCpmk.deskripsi}`).join("\n") || "-", dash(item.materi), `Bentuk: ${dash(item.bentuk_pembelajaran)}\nMetode: ${dash(item.metode)}\nWaktu: ${dash(item.estimasi_waktu)}`, dash(item.referensi), `${dash(item.indikator)}\n${item.kriteria_penilaian ? `Penilaian: ${item.kriteria_penilaian}` : ""}`])

  return [
    docxHeader("Form Rencana Pembelajaran Semester (RPS)", "F-PPK-09"),
    docxTable([
      ["Course Code / Kode Mata Kuliah", data.dosir.mk.kode, "Course Name / Nama Mata Kuliah", courseName(data)],
      ["Study Program / Program Studi", "Sistem Informasi / Information System", "Faculty / Fakultas", "Fakultas Teknologi Informasi"],
      ["Credit / Kredit", `${totalSks(data)} SKS`, "Semester / Tahun Akademik", `${data.dosir.mk.semester_rekomendasi} / ${data.dosir.tahunAkademik.kode}`],
      ["Lecturer's Name / Dosen Pengampu", data.dosir.dosen.nama_lengkap, "Kelas", data.dosir.kelas],
    ]),
    docxTitle("Course Description / Deskripsi Mata Kuliah"), new Paragraph({ text: dash(rps?.deskripsi_mk) }),
    docxTitle("Learning Outcome / Capaian Pembelajaran"), docxTable([["Kode MK", "Nama Mata Kuliah", "SKS", ...cplCodes.map((item: any) => item.kode)], [data.dosir.mk.kode, courseName(data), String(totalSks(data)), ...cplCodes.map((item: any) => item.kode)]], true),
    docxTitle("Subject Learning Outcome / Capaian Pembelajaran Mata Kuliah"), docxTable([["Kode CPMK", "Uraian CPMK", "CP / CPL", "Metode Pencapaian"], ...cpmks(data).map((item: any) => [item.kode, item.deskripsi, item.cplMappings.map((mapping: any) => `${mapping.cpl.kode} - ${mapping.cpl.rumusan}`).join("; ") || "-", dash(item.metode_pencapaian)])], true),
    docxTitle("Methods of Instruction / Metode Pembelajaran"), new Paragraph({ text: dash(rps?.metode_pembelajaran) }),
    docxTitle("Attendance Requirement / Persyaratan Kehadiran"), new Paragraph({ text: dash(rps?.persyaratan_kehadiran) }),
    docxTitle("Assessment / Penilaian"), docxTable([["No.", "Komponen Penilaian", "Bobot"], ...assessmentRows, ["", "Total", percentage(assessments(data).reduce((sum: number, item: any) => sum + Number(item.bobot || 0), 0))]], true),
    docxTitle("Material References / Bahan Referensi"), ...(rps?.referensis ?? []).sort((a: any, b: any) => a.urutan - b.urutan).map((item: any) => new Paragraph({ text: `[${item.jenis}] ${item.teks}`, numbering: { reference: "references", level: 0 } })),
    docxSignature(data),
    new Paragraph({ text: "Course Outline / Rencana Pembelajaran Mingguan", pageBreakBefore: true, heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER }),
    docxTable([["Sesi", "Kemampuan Akhir", "Materi", "Bentuk Pembelajaran & Durasi", "Referensi", "Indikator Penilaian"], ...outlineRows], true),
    docxSignature(data),
  ]
}

function rtmChildren(data: any) {
  const byId = new Map(cpmks(data).map((item: any) => [item.id, item.kode]))
  return assessments(data).flatMap((item: any, index: number) => [
    ...(index ? [new Paragraph({ text: "", pageBreakBefore: true })] : []),
    docxHeader("Form Rencana Tugas Mahasiswa", "F-EHB-02"),
    new Paragraph({ text: "RENCANA TUGAS MAHASISWA", heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER }),
    docxTable([["Mata Kuliah", data.dosir.mk.nama_id, "Kode Mata Kuliah", data.dosir.mk.kode], ["Tugas ke", `${index + 1} dari ${assessments(data).length}`, "SKS", `${totalSks(data)} SKS`], ["Semester / Tahun Akademik", `${data.dosir.mk.semester_rekomendasi} / ${data.dosir.tahunAkademik.kode}`, "Dosen Pengampu", data.dosir.dosen.nama_lengkap]]),
    docxTitle("Judul Tugas"), new Paragraph({ text: item.nama || item.tipe }),
    docxTitle("CPMK / Sub-CPMK yang Ditargetkan"), new Paragraph({ text: `${item.cpmkMappings.map((map: any) => byId.get(map.cpmk_id)).filter(Boolean).join(", ") || "-"}${item.subCpmkMappings.length ? `; ${item.subCpmkMappings.map((map: any) => map.subCpmk.kode).join(", ")}` : ""}` }),
    docxTitle("Deskripsi, Metode, dan Instruksi Tugas"), new Paragraph({ text: `${dash(item.deskripsi)}\n\nInstruksi: ${dash(item.instruksi)}` }),
    docxTitle("Format Luaran"), new Paragraph({ text: dash(item.bentuk || item.luaran) }),
    docxTitle("Indikator, Kriteria Penilaian, dan Bobot"), new Paragraph({ text: `${dash(item.kriteria_penilaian)}\n\nBobot: ${percentage(item.bobot)}` }),
    docxTitle("Referensi"), new Paragraph({ text: dash(item.referensi_tugas) }),
    docxTitle("Lain-lain"), new Paragraph({ text: dash(item.lain_lain) }),
    docxSignature(data),
  ])
}

function rpmChildren(data: any) {
  const byId = new Map(cpmks(data).map((item: any) => [item.id, item.kode]))
  return assessments(data).flatMap((item: any, index: number) => [
    ...(index ? [new Paragraph({ text: "", pageBreakBefore: true })] : []),
    docxHeader("Form Rubrik Penilaian Mahasiswa", "F-EHB-03"),
    new Paragraph({ text: "RUBRIK PENILAIAN MAHASISWA", heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER }),
    docxTable([["Mata Kuliah", `${data.dosir.mk.kode} - ${data.dosir.mk.nama_id}`, "SKS", `${totalSks(data)} SKS`], ["Dosen Pengampu", data.dosir.dosen.nama_lengkap, "Bobot", percentage(item.bobot)], ["Komponen Penilaian", item.nama || item.tipe, "CPMK", item.cpmkMappings.map((map: any) => byId.get(map.cpmk_id)).filter(Boolean).join(", ") || "-"]]),
    docxTitle("Rubrik Penilaian"), docxTable([["Kriteria", "Bobot", "Sangat Baik (81-100)", "Baik (61-80)", "Cukup (41-60)", "Kurang (21-40)", "Sangat Kurang (0-20)"], ...item.rubrikKriterias.sort((a: any, b: any) => a.urutan - b.urutan).map((rubric: any) => [rubric.kriteria, percentage(rubric.bobot), dash(rubric.sangat_baik), dash(rubric.baik), dash(rubric.cukup), dash(rubric.kurang), dash(rubric.sangat_kurang)])], true),
    docxTitle("Skala Penilaian"), docxTable([["Kualitas", "Nilai", "Nilai Mutu", "Deskripsi / Indikator"], ...gradeScale], true),
    docxSignature(data),
  ])
}

export async function createDocxExport(type: ExportDocumentType, data: any) {
  const children = type === "rps" ? rpsChildren(data) : type === "rtm" ? rtmChildren(data) : rpmChildren(data)
  const document = new DocxDocument({
    numbering: { config: [{ reference: "references", levels: [{ level: 0, format: "decimal", text: "%1.", alignment: AlignmentType.START }] }] },
    sections: [{ properties: { page: { margin: { top: 700, right: 700, bottom: 700, left: 700 } } }, children }],
  })
  return Packer.toBuffer(document)
}

const pdfStyles = StyleSheet.create({
  page: { padding: 30, fontSize: 8, fontFamily: "Helvetica", color: "#111" },
  header: { borderWidth: 1, borderColor: "#111", padding: 6, marginBottom: 10, textAlign: "center", fontFamily: "Helvetica-Bold" },
  title: { fontSize: 12, fontFamily: "Helvetica-Bold", textAlign: "center", marginBottom: 10 },
  section: { marginTop: 8 }, sectionTitle: { fontFamily: "Helvetica-Bold", borderBottomWidth: 1, borderTopWidth: 1, paddingVertical: 3, marginBottom: 4 },
  table: { borderWidth: 1, borderColor: "#111", marginTop: 3 }, row: { flexDirection: "row" }, cell: { borderRightWidth: 1, borderBottomWidth: 1, borderColor: "#111", padding: 3, flexGrow: 1, flexBasis: 0 }, head: { fontFamily: "Helvetica-Bold", textAlign: "center", backgroundColor: "#eee" },
  small: { fontSize: 6.5 }, signature: { flexDirection: "row", justifyContent: "space-between", marginTop: 24, textAlign: "center" }, signatureBox: { width: "42%" },
})

const PdfTable = ({ rows, header = false, small = false }: { rows: string[][]; header?: boolean; small?: boolean }) => React.createElement(View, { style: [pdfStyles.table, small ? pdfStyles.small : {}] }, rows.map((row, rowIndex) => React.createElement(View, { style: pdfStyles.row, key: rowIndex }, row.map((cell, cellIndex) => React.createElement(Text, { style: [pdfStyles.cell, header && rowIndex === 0 ? pdfStyles.head : {}], key: `${rowIndex}-${cellIndex}` }, cell || "-")))))
const PdfSection = ({ title, text }: { title: string; text?: string }) => React.createElement(View, { style: pdfStyles.section }, React.createElement(Text, { style: pdfStyles.sectionTitle }, title), text ? React.createElement(Text, null, text) : null)
const PdfHeader = ({ title, formCode }: { title: string; formCode: string }) => React.createElement(View, { style: pdfStyles.header }, React.createElement(Text, null, "UNIVERSITAS BAKRIE"), React.createElement(Text, null, "FAKULTAS TEKNOLOGI INFORMASI"), React.createElement(Text, null, title), React.createElement(Text, { style: pdfStyles.small }, `No. Form: ${formCode} | Rev. Form: 01`))
const PdfSignature = ({ data }: { data: any }) => React.createElement(View, { style: pdfStyles.signature }, React.createElement(View, { style: pdfStyles.signatureBox }, React.createElement(Text, null, "Dipersiapkan oleh"), React.createElement(Text, { style: { marginTop: 42, fontFamily: "Helvetica-Bold" } }, data.dosir.dosen.nama_lengkap), React.createElement(Text, null, "Dosen Pengampu")), React.createElement(View, { style: pdfStyles.signatureBox }, React.createElement(Text, null, "Disahkan oleh"), React.createElement(Text, { style: { marginTop: 42, fontFamily: "Helvetica-Bold" } }, data.rps?.nama_penyetuju || "(........................................)"), React.createElement(Text, null, data.rps?.jabatan_penyetuju || "Ketua Program Studi")))

function rpsPdfPages(data: any) {
  const rps = data.rps
  const body = [
    React.createElement(PdfHeader, { title: "FORM RENCANA PEMBELAJARAN SEMESTER (RPS)", formCode: "F-PPK-09", key: "header" }),
    React.createElement(PdfTable, { key: "identity", rows: [["Kode Mata Kuliah", data.dosir.mk.kode, "Nama Mata Kuliah", courseName(data)], ["Program Studi", "Sistem Informasi", "SKS", `${totalSks(data)} SKS`], ["Dosen Pengampu", data.dosir.dosen.nama_lengkap, "Tahun Akademik", data.dosir.tahunAkademik.kode]] }),
    React.createElement(PdfSection, { key: "description", title: "Course Description / Deskripsi Mata Kuliah", text: dash(rps?.deskripsi_mk) }),
    React.createElement(PdfSection, { key: "method", title: "Methods of Instruction / Metode Pembelajaran", text: dash(rps?.metode_pembelajaran) }),
    React.createElement(PdfSection, { key: "attendance", title: "Attendance Requirement / Persyaratan Kehadiran", text: dash(rps?.persyaratan_kehadiran) }),
    React.createElement(PdfSection, { key: "cpmk-title", title: "Capaian Pembelajaran Mata Kuliah" }),
    React.createElement(PdfTable, { key: "cpmk", small: true, header: true, rows: [["CPMK", "Uraian", "CPL", "Metode"], ...cpmks(data).map((item: any) => [item.kode, item.deskripsi, item.cplMappings.map((mapping: any) => mapping.cpl.kode).join(", "), dash(item.metode_pencapaian)])] }),
    React.createElement(PdfSection, { key: "assessment-title", title: "Penilaian" }),
    React.createElement(PdfTable, { key: "assessment", header: true, rows: [["No.", "Komponen", "Bobot"], ...assessments(data).map((item: any, index: number) => [String(index + 1), item.nama || item.tipe, percentage(item.bobot)])] }),
    React.createElement(PdfSection, { key: "reference", title: "Bahan Referensi", text: (rps?.referensis ?? []).sort((a: any, b: any) => a.urutan - b.urutan).map((item: any, index: number) => `${index + 1}. [${item.jenis}] ${item.teks}`).join("\n") || "-" }),
    React.createElement(PdfSignature, { key: "signature", data }),
  ]
  const outline = React.createElement(Page, { size: "A4", orientation: "landscape", style: pdfStyles.page, key: "outline" }, React.createElement(PdfHeader, { title: "COURSE OUTLINE / RENCANA PEMBELAJARAN MINGGUAN", formCode: "F-PPK-09" }), React.createElement(PdfTable, { header: true, small: true, rows: [["Sesi", "Kemampuan Akhir", "Materi", "Bentuk & Durasi", "Referensi", "Indikator"], ...meetings(data).map((item: any) => [String(item.minggu_ke), item.subCpmkMappings.map((mapping: any) => mapping.subCpmk.kode).join(", ") || "-", dash(item.materi), `${dash(item.metode)}\n${dash(item.estimasi_waktu)}`, dash(item.referensi), dash(item.indikator)])] }), React.createElement(PdfSignature, { data }))
  return [React.createElement(Page, { size: "A4", style: pdfStyles.page, key: "rps" }, ...body), outline]
}

function assessmentPdfPages(type: "rtm" | "rpm", data: any) {
  const byId = new Map(cpmks(data).map((item: any) => [item.id, item.kode]))
  return assessments(data).map((item: any, index: number) => React.createElement(Page, { size: "A4", style: pdfStyles.page, key: item.id },
    React.createElement(PdfHeader, { title: type === "rtm" ? "FORM RENCANA TUGAS MAHASISWA" : "FORM RUBRIK PENILAIAN MAHASISWA", formCode: type === "rtm" ? "F-EHB-02" : "F-EHB-03" }),
    React.createElement(Text, { style: pdfStyles.title }, type === "rtm" ? "RENCANA TUGAS MAHASISWA" : "RUBRIK PENILAIAN MAHASISWA"),
    React.createElement(PdfTable, { rows: [["Mata Kuliah", `${data.dosir.mk.kode} - ${data.dosir.mk.nama_id}`], ["Dosen Pengampu", data.dosir.dosen.nama_lengkap], ["Komponen", item.nama || item.tipe], ["Bobot", percentage(item.bobot)]] }),
    type === "rtm" ? React.createElement(React.Fragment, null,
      React.createElement(PdfSection, { title: "CPMK / Sub-CPMK yang Ditargetkan", text: item.cpmkMappings.map((map: any) => byId.get(map.cpmk_id)).filter(Boolean).join(", ") || "-" }),
      React.createElement(PdfSection, { title: "Deskripsi, Metode, dan Instruksi Tugas", text: `${dash(item.deskripsi)}\n\nInstruksi: ${dash(item.instruksi)}` }),
      React.createElement(PdfSection, { title: "Format Luaran", text: dash(item.bentuk || item.luaran) }),
      React.createElement(PdfSection, { title: "Indikator, Kriteria Penilaian, dan Bobot", text: `${dash(item.kriteria_penilaian)}\n\nBobot: ${percentage(item.bobot)}` }),
      React.createElement(PdfSection, { title: "Referensi", text: dash(item.referensi_tugas) }),
    ) : React.createElement(React.Fragment, null,
      React.createElement(PdfSection, { title: "Rubrik Penilaian" }),
      React.createElement(PdfTable, { header: true, small: true, rows: [["Kriteria", "Bobot", "Sangat Baik", "Baik", "Cukup", "Kurang", "Sangat Kurang"], ...item.rubrikKriterias.sort((a: any, b: any) => a.urutan - b.urutan).map((rubric: any) => [rubric.kriteria, percentage(rubric.bobot), dash(rubric.sangat_baik), dash(rubric.baik), dash(rubric.cukup), dash(rubric.kurang), dash(rubric.sangat_kurang)])] }),
      React.createElement(PdfSection, { title: "Skala Penilaian" }),
      React.createElement(PdfTable, { header: true, rows: [["Kualitas", "Nilai", "Nilai Mutu", "Deskripsi"], ...gradeScale] }),
    ),
    React.createElement(PdfSignature, { data }),
    React.createElement(Text, { style: [pdfStyles.small, { marginTop: 10, textAlign: "right" }] }, `${index + 1} dari ${assessments(data).length}`),
  ))
}

export async function createPdfExport(type: ExportDocumentType, data: any) {
  const pages = type === "rps" ? rpsPdfPages(data) : assessmentPdfPages(type, data)
  return renderToBuffer(React.createElement(Document, null, ...pages))
}
