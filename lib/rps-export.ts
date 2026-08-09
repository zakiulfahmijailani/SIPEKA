import React from "react"
import { readFile } from "node:fs/promises"
import path from "node:path"
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
import JSZip from "jszip"

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

const escapeXml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

function replaceTextInXml(element: string, value: string) {
  let hasWritten = false
  const text = escapeXml(value).replace(/\n/g, "</w:t><w:br/><w:t xml:space=\"preserve\">")
  return element.replace(/<w:t([^>]*)>[\s\S]*?<\/w:t>/g, (_match, attributes) => {
    if (hasWritten) return `<w:t${attributes}></w:t>`
    hasWritten = true
    return `<w:t${attributes}>${text}</w:t>`
  })
}

function replaceNthSegment(xml: string, pattern: RegExp, index: number, update: (segment: string) => string) {
  let current = 0
  return xml.replace(pattern, (segment) => current++ === index ? update(segment) : segment)
}

function replaceCell(tableXml: string, rowIndex: number, cellIndex: number, value: string) {
  return replaceNthSegment(tableXml, /<w:tr(?:\s[^>]*)?>[\s\S]*?<\/w:tr>/g, rowIndex, (row) =>
    replaceNthSegment(row, /<w:tc(?:\s[^>]*)?>[\s\S]*?<\/w:tc>/g, cellIndex, (cell) => replaceTextInXml(cell, value)),
  )
}

function replaceParagraphContaining(xml: string, needle: string, value: string) {
  return xml.replace(/<w:p(?:\s[^>]*)?>[\s\S]*?<\/w:p>/g, (paragraph) => paragraph.includes(needle) ? replaceTextInXml(paragraph, value) : paragraph)
}

function topLevelTables(xml: string) {
  const tables: Array<{ start: number; end: number; xml: string }> = []
  const opening = /<w:tbl(?:\s[^>]*)?>/g
  let match: RegExpExecArray | null
  while ((match = opening.exec(xml))) {
    const end = xml.indexOf("</w:tbl>", match.index)
    if (end < 0) break
    tables.push({ start: match.index, end: end + "</w:tbl>".length, xml: xml.slice(match.index, end + "</w:tbl>".length) })
    opening.lastIndex = end + "</w:tbl>".length
  }
  return tables
}

function cplGroups(data: any) {
  const cpls = Array.from(new Map(cpmks(data).flatMap((item: any) => item.cplMappings.map((mapping: any) => [mapping.cpl.id, mapping.cpl]))).values()) as any[]
  return [cpls.slice(0, 2), cpls.slice(2, 4), cpls.slice(4)]
}

function updateTemplateRpsTables(xml: string, data: any) {
  const rps = data.rps
  const templateTables = topLevelTables(xml)
  const updated = templateTables.map((item) => item.xml)
  const semesterLabel = data.dosir.tahunAkademik.semester === 1 ? "Ganjil" : "Genap"
  const period = `${data.dosir.tahunAkademik.kode} - ${semesterLabel}`
  const prereq = "Tidak ada"

  updated[0] = replaceCell(updated[0], 0, 1, `SYLLABUS (RENCANA PEMBELAJARAN SEMESTER) [${data.dosir.mk.kode}] Pg. 1/10`)
  updated[1] = replaceCell(updated[1], 0, 0, `Course Code (Kode Matakuliah): ${data.dosir.mk.kode}`)
  updated[1] = replaceCell(updated[1], 0, 1, `Course Name (Nama Matakuliah): ${courseName(data)}`)
  updated[1] = replaceCell(updated[1], 1, 0, "Study Program (Program Studi): Sistem Informasi / Information System")
  updated[1] = replaceCell(updated[1], 1, 1, "Faculty (Fakultas): FTIK")
  updated[1] = replaceCell(updated[1], 2, 0, `Course Prerequisite (Matakuliah Prasyarat): ${prereq}`)
  updated[1] = replaceCell(updated[1], 2, 1, `Credit (Kredit): ${totalSks(data)} SKS`)
  updated[1] = replaceCell(updated[1], 3, 1, `Lecture (Kuliah): ${data.dosir.mk.sks_teori} SKS`)
  updated[1] = replaceCell(updated[1], 3, 2, "Tutorial: 0")
  updated[1] = replaceCell(updated[1], 3, 3, `Practicum (Praktikum): ${data.dosir.mk.sks_praktik} SKS`)
  updated[1] = replaceCell(updated[1], 4, 0, `Revision Status (Status Revisi): ${rps?.status_revisi || "R-1"}`)
  updated[1] = replaceCell(updated[1], 4, 1, `Odd / Even Semester (${semesterLabel})\nAcademic Year: ${data.dosir.tahunAkademik.kode}`)
  updated[1] = replaceCell(updated[1], 5, 0, `Lecturer's Name: ${data.dosir.dosen.nama_lengkap}`)
  updated[1] = replaceCell(updated[1], 6, 0, `Dipersiapkan oleh (Prepared by)\nNama: ${data.dosir.dosen.nama_lengkap}\nJabatan: Dosen Pengampu\nTanggal: ${rps?.tanggal_penyusunan || "-"}`)
  updated[1] = replaceCell(updated[1], 6, 1, `Disahkan oleh (Certified by)\nNama: ${rps?.nama_penyetuju || "-"}\nJabatan: ${rps?.jabatan_penyetuju || "Ketua Program Studi"}\nTanggal: ${rps?.tanggal_pengesahan || "-"}`)

  const groups = cplGroups(data)
  groups.forEach((group, index) => {
    const codes = group.map((item: any) => item.kode).join(", ") || "-"
    updated[2] = replaceCell(updated[2], 0, index + 3, codes)
    updated[2] = replaceCell(updated[2], 1, index + 3, codes)
    updated[2] = replaceCell(updated[2], 2, index + 3, codes)
  })
  updated[2] = replaceCell(updated[2], 2, 0, data.dosir.mk.kode)
  updated[2] = replaceCell(updated[2], 2, 1, courseName(data))
  updated[2] = replaceCell(updated[2], 2, 2, String(totalSks(data)))

  const outcomeRows = cpmks(data)
  for (let index = 0; index < 5; index++) {
    const item = outcomeRows[index]
    updated[3] = replaceCell(updated[3], index + 1, 0, item?.kode || "")
    updated[3] = replaceCell(updated[3], index + 1, 1, item?.deskripsi || "")
    updated[3] = replaceCell(updated[3], index + 1, 2, item ? item.cplMappings.map((mapping: any) => `${mapping.cpl.rumusan} [${mapping.cpl.kode}]`).join("; ") : "")
    updated[3] = replaceCell(updated[3], index + 1, 3, item?.metode_pencapaian || "")
  }

  const sessionRows = meetings(data)
  for (let index = 0; index < 16; index++) {
    const item = sessionRows[index]
    updated[4] = replaceCell(updated[4], index + 1, 0, item ? String(item.minggu_ke) : String(index + 1))
    updated[4] = replaceCell(updated[4], index + 1, 1, item ? item.subCpmkMappings.map((mapping: any) => `${mapping.subCpmk.kode}: ${mapping.subCpmk.deskripsi}`).join("\n") : "")
    updated[4] = replaceCell(updated[4], index + 1, 2, item?.materi || "")
    updated[4] = replaceCell(updated[4], index + 1, 3, item ? `${item.bentuk_pembelajaran || ""}\n${item.metode || ""}\n${item.estimasi_waktu || ""}`.trim() : "")
    updated[4] = replaceCell(updated[4], index + 1, 4, item?.referensi || "")
    updated[4] = replaceCell(updated[4], index + 1, 5, item ? `${item.indikator || ""}${item.kriteria_penilaian ? `\n${item.kriteria_penilaian}` : ""}`.trim() : "")
  }

  const assessment = assessments(data)[0]
  if (assessment) {
    updated[5] = replaceCell(updated[5], 3, 2, `: ${period}`)
    updated[5] = replaceCell(updated[5], 5, 1, courseName(data))
    updated[5] = replaceCell(updated[5], 6, 1, `Tugas ke-1 dari ${assessments(data).length}`)
    updated[5] = replaceCell(updated[5], 7, 1, data.dosir.mk.kode)
    updated[5] = replaceCell(updated[5], 7, 3, String(totalSks(data)))
    updated[5] = replaceCell(updated[5], 7, 5, String(data.dosir.mk.semester_rekomendasi))
    updated[5] = replaceCell(updated[5], 8, 1, data.dosir.dosen.nama_lengkap)
    updated[5] = replaceCell(updated[5], 12, 0, assessment.is_kelompok ? "Tugas Kelompok" : "Tugas Individu")
    updated[5] = replaceCell(updated[5], 12, 1, `Minggu ${assessment.minggu_pemberian || "-"} s.d. ${assessment.minggu_pengumpulan || "-"}`)
    updated[5] = replaceCell(updated[5], 14, 0, assessment.nama || assessment.tipe)
    updated[5] = replaceCell(updated[5], 16, 0, `${assessment.cpmkMappings.map((mapping: any) => cpmks(data).find((item: any) => item.id === mapping.cpmk_id)?.kode).filter(Boolean).join(", ")} ${assessment.subCpmkMappings.map((mapping: any) => mapping.subCpmk.kode).join(", ")}`.trim())
    updated[5] = replaceCell(updated[5], 18, 0, `${assessment.deskripsi || ""}\n${assessment.instruksi || ""}`.trim())
    updated[5] = replaceCell(updated[5], 20, 0, assessment.bentuk || assessment.luaran || "")
    updated[5] = replaceCell(updated[5], 22, 0, `${assessment.kriteria_penilaian || ""}\nBobot: ${percentage(assessment.bobot)}`.trim())
    updated[5] = replaceCell(updated[5], 24, 0, assessment.lain_lain || "")
    updated[5] = replaceCell(updated[5], 26, 0, assessment.referensi_tugas || "")
    updated[6] = replaceCell(updated[6], 3, 2, `: ${period}`)
  }

  let result = xml
  for (let index = templateTables.length - 1; index >= 0; index--) result = `${result.slice(0, templateTables[index].start)}${updated[index]}${result.slice(templateTables[index].end)}`
  return result
}

async function createTemplateRpsDocxExport(data: any) {
  const templatePath = path.join(process.cwd(), "assets", "templates", "rps-kapita-selekta-gis-template.docx")
  const template = await readFile(templatePath)
  const archive = await JSZip.loadAsync(template)
  const documentFile = archive.file("word/document.xml")
  if (!documentFile) throw new Error("Template RPS tidak memiliki word/document.xml")
  let xml = await documentFile.async("string")
  xml = updateTemplateRpsTables(xml, data)

  xml = replaceParagraphContaining(xml, "This course exposes students", dash(data.rps?.deskripsi_mk))
  xml = replaceParagraphContaining(xml, "Through the lecturing and mentoring", dash(data.rps?.metode_pembelajaran))
  xml = replaceParagraphContaining(xml, "Punctuality and regular attendance", dash(data.rps?.persyaratan_kehadiran))
  xml = replaceParagraphContaining(xml, "Coursework evaluation will be weighted as follows:", "Coursework evaluation will be weighted as follows:")
  const assessmentRows = assessments(data)
  ;["Mid-Semester Examination", "Final Examination", "Others Case / Assignment / Discussion Group"].forEach((needle, index) => {
    const assessment = assessmentRows[index]
    xml = replaceParagraphContaining(xml, needle, assessment ? `${assessment.nama || assessment.tipe}\t${percentage(assessment.bobot)}` : "")
  })
  ;["[T1]", "[T2]", "[T3]"].forEach((needle, index) => {
    const reference = [...(data.rps?.referensis ?? [])].sort((a: any, b: any) => a.urutan - b.urutan)[index]
    if (reference) xml = replaceParagraphContaining(xml, needle, `[${reference.jenis}] ${reference.teks}`)
  })
  xml = xml.replaceAll("SIF212", data.dosir.mk.kode).replaceAll("Kapita Selekta", data.dosir.mk.nama_id).replaceAll("Capita Selecta", data.dosir.mk.nama_en || data.dosir.mk.nama_id)
  archive.file("word/document.xml", xml)
  return archive.generateAsync({ type: "nodebuffer", compression: "DEFLATE" })
}

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
  if (type === "rps") return createTemplateRpsDocxExport(data)
  const children = type === "rtm" ? rtmChildren(data) : rpmChildren(data)
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
