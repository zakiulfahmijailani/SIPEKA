import React from "react"
import { readFile } from "node:fs/promises"
import path from "node:path"
import {
  AlignmentType,
  BorderStyle,
  Document as DocxDocument,
  Footer,
  Header,
  HeightRule,
  ImageRun,
  Packer,
  PageBreak,
  PageNumber,
  PageOrientation,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from "docx"
import {
  Document as PdfDocument,
  Image as PdfImage,
  Page as PdfPage,
  StyleSheet,
  Text as PdfText,
  View as PdfView,
  renderToBuffer,
} from "@react-pdf/renderer"
import { and, asc, desc, eq } from "drizzle-orm"

import { db } from "@/db"
import {
  cpl,
  dosirMk,
  mkPrasyarat,
  petaKurikulum,
  programSettings,
  rps,
  users,
} from "@/db/schema"

export type OfficialRpsData = {
  dosir: any
  mk: any
  tahunAkademik: any
  rps: any
  dosenList: string[]
  institution: {
    universitas: string
    fakultas: string
    prodi: string
  }
  prasyaratText: string
  allCpls: Array<{ id: string; kode: string; rumusan: string }>
  mappedCplCodes: string[]
  cpmkRows: Array<{
    kode: string
    deskripsi: string
    cplCodes: string
    metode: string
  }>
  assessmentSummary: {
    uts: number
    uas: number
    tugas: number
    lainnya: number
    total: number
    items: Array<{ nama: string; bobot: number; kategori: string }>
  }
  isWeightValid: boolean
  isDraft: boolean
  outlineRows: Array<{
    type: "SESSION" | "UTS" | "UAS"
    sessionNum?: number
    competency: string
    topic: string
    formAndDuration: string
    references: string
    indicators: string
  }>
  references: Array<{ jenis: string; teks: string }>
  perlengkapan: string
}

const dash = (val?: string | null) => (val && val.trim() ? val.trim() : "—")
const cleanStr = (val?: string | null) => (val && val.trim() ? val.trim() : "")

export async function getOfficialRpsExportData(dosirId: string): Promise<OfficialRpsData | null> {
  const dosir = await db.query.dosirMk.findFirst({
    where: eq(dosirMk.id, dosirId),
    with: {
      mk: true,
      dosen: true,
      tahunAkademik: true,
    },
  })
  if (!dosir) return null

  // Resolve all assigned lecturers for this course & class (team teaching)
  const coLecturers = await db.query.dosirMk.findMany({
    where: and(
      eq(dosirMk.mk_id, dosir.mk_id),
      eq(dosirMk.tahun_akademik_id, dosir.tahun_akademik_id),
      eq(dosirMk.kelas, dosir.kelas),
    ),
    with: { dosen: true },
  })

  const lecturerNames = new Set<string>()
  if (dosir.dosen?.nama_lengkap) lecturerNames.add(dosir.dosen.nama_lengkap)
  coLecturers.forEach((item) => {
    if (item.dosen?.nama_lengkap) lecturerNames.add(item.dosen.nama_lengkap)
  })

  // Program / Institution Settings
  const settingsRows = await db.select().from(programSettings)
  const settingsMap = new Map(settingsRows.map((s) => [s.key, s.value]))
  const institution = {
    universitas: settingsMap.get("nama_universitas") || "Universitas Bakrie",
    fakultas: settingsMap.get("nama_fakultas") || "Fakultas Teknik dan Ilmu Komputer",
    prodi: settingsMap.get("nama_prodi") || "Sistem Informasi",
  }

  // Course Prerequisites
  const prereqRows = await db.query.mkPrasyarat.findMany({
    where: eq(mkPrasyarat.mk_id, dosir.mk_id),
    with: { prasyarat: true },
  })
  const prasyaratText = prereqRows.length > 0
    ? prereqRows.map((p) => `${p.prasyarat.kode} - ${p.prasyarat.nama_id}`).join("; ")
    : "Tidak ada"

  // CPL Master and Course CPL mappings
  const [allMasterCpls, coursePetaCpls] = await Promise.all([
    db.query.cpl.findMany({
      where: eq(cpl.is_active, true),
      orderBy: [asc(cpl.urutan)],
    }),
    db.query.petaKurikulum.findMany({
      where: eq(petaKurikulum.mk_id, dosir.mk_id),
      with: { cpl: true },
    }),
  ])
  const mappedCplCodes = new Set(coursePetaCpls.map((p) => p.cpl.kode))

  // RPS details
  const rpsData = await db.query.rps.findFirst({
    where: eq(rps.dosir_mk_id, dosirId),
    orderBy: [desc(rps.version)],
    with: {
      cpmks: {
        orderBy: [asc(rps.version)],
        with: {
          cplMappings: { with: { cpl: true } },
          subCpmks: { orderBy: [asc(cpl.urutan)] },
        },
      },
      komponens: {
        orderBy: [asc(rps.version)],
        with: {
          cpmkMappings: true,
          subCpmkMappings: { with: { subCpmk: true } },
          rubrikKriterias: true,
        },
      },
      pertemuans: {
        orderBy: [asc(rps.version)],
        with: {
          subCpmkMappings: { with: { subCpmk: true } },
        },
      },
      referensis: {
        orderBy: [asc(rps.version)],
      },
    },
  })

  // Additional lecturers from rps column if provided
  if (rpsData && (rpsData as any).dosen_pengampu_tambahan) {
    String((rpsData as any).dosen_pengampu_tambahan)
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((name) => lecturerNames.add(name))
  }

  // Build CPMK rows
  const sortedCpmks = [...(rpsData?.cpmks ?? [])].sort((a, b) => a.urutan - b.urutan)
  const cpmkRows = sortedCpmks.map((c) => {
    const cpls = c.cplMappings.map((m) => m.cpl.kode).join(", ")
    return {
      kode: c.kode,
      deskripsi: c.deskripsi,
      cplCodes: cpls || "—",
      metode: c.metode_pencapaian || "Tatap muka, diskusi, dan latihan terstruktur",
    }
  })

  // Ensure mapped CPLs from CPMK mappings are also reflected in mappedCplCodes
  sortedCpmks.forEach((c) => {
    c.cplMappings.forEach((m) => mappedCplCodes.add(m.cpl.kode))
  })

  // Assessment summary & categorization
  const sortedKomponens = [...(rpsData?.komponens ?? [])].sort((a, b) => a.urutan - b.urutan)
  let utsBobot = 0
  let uasBobot = 0
  let tugasBobot = 0
  let lainnyaBobot = 0

  const items = sortedKomponens.map((k) => {
    const bobot = Number(k.bobot || 0)
    const nameUpper = (k.nama || k.tipe || "").toUpperCase()
    const kat = (k as any).kategori_resmi || ""

    if (kat === "UTS" || nameUpper.includes("UTS") || nameUpper.includes("TENGAH SEMESTER")) {
      utsBobot += bobot
      return { nama: k.nama || k.tipe, bobot, kategori: "UTS" }
    } else if (kat === "UAS" || nameUpper.includes("UAS") || nameUpper.includes("AKHIR SEMESTER")) {
      uasBobot += bobot
      return { nama: k.nama || k.tipe, bobot, kategori: "UAS" }
    } else if (kat === "TUGAS" || nameUpper.includes("TUGAS") || nameUpper.includes("PROYEK") || nameUpper.includes("PROJECT")) {
      tugasBobot += bobot
      return { nama: k.nama || k.tipe, bobot, kategori: "TUGAS" }
    } else {
      lainnyaBobot += bobot
      return { nama: k.nama || k.tipe, bobot, kategori: "LAINNYA" }
    }
  })

  const totalBobot = Number((utsBobot + uasBobot + tugasBobot + lainnyaBobot).toFixed(2))
  const isWeightValid = Math.abs(totalBobot - 100) < 0.05
  const isDraft = rpsData?.status === "DRAFT" || rpsData?.status === "REVISION_REQUIRED" || !isWeightValid

  // Build Course Outline (Sessions 1-7, UTS, 8-14, UAS)
  const sortedMeetings = [...(rpsData?.pertemuans ?? [])].sort((a, b) => a.minggu_ke - b.minggu_ke)
  const outlineRows: OfficialRpsData["outlineRows"] = []

  // Split into sessions 1-7, UTS, sessions 8-14, UAS
  const getMeetingData = (m: any) => {
    const subCpmkList = m.subCpmkMappings
      .map((map: any) => `${map.subCpmk.kode} — ${map.subCpmk.deskripsi}`)
      .join("\n")
    const forms = [m.bentuk_pembelajaran, m.metode, m.estimasi_waktu].filter(Boolean).join("\n")
    const indicators = [m.indikator, m.kriteria_penilaian ? `Kriteria: ${m.kriteria_penilaian}` : ""].filter(Boolean).join("\n")
    return {
      competency: subCpmkList || "Mampu memahami materi pembelajaran sesi ini",
      topic: m.materi || `Materi Sesi`,
      formAndDuration: forms || "Kuliah & Diskusi (TM: 2x50\")",
      references: m.referensi || "Bahan ajar & modul",
      indicators: indicators || "Ketepatan penjelasan dan partisipasi aktif",
    }
  }

  // 1 to 7
  for (let s = 1; s <= 7; s++) {
    const m = sortedMeetings.find((item) => item.minggu_ke === s)
    if (m) {
      outlineRows.push({ type: "SESSION", sessionNum: s, ...getMeetingData(m) })
    } else {
      outlineRows.push({
        type: "SESSION",
        sessionNum: s,
        competency: "—",
        topic: `Materi Perkuliahan Sesi ${s}`,
        formAndDuration: "Kuliah & Diskusi (2x50\")",
        references: "Bahan ajar perkuliahan",
        indicators: "Partisipasi kelas dan latihan",
      })
    }
  }

  // UTS row
  const utsMeeting = sortedMeetings.find((item) => item.minggu_ke === 8 || (item as any).tipe === "UTS" || (item.materi || "").toUpperCase().includes("UTS"))
  outlineRows.push({
    type: "UTS",
    competency: utsMeeting ? getMeetingData(utsMeeting).competency : "Mengevaluasi penguasaan materi pembelajaran sesi 1 sampai 7",
    topic: "UJIAN TENGAH SEMESTER (MID-SEMESTER EXAMINATION)",
    formAndDuration: utsMeeting ? getMeetingData(utsMeeting).formAndDuration : "Tes Tertulis / Unjuk Kerja (100-120\")",
    references: utsMeeting ? getMeetingData(utsMeeting).references : "Materi Sesi 1 s.d. 7",
    indicators: utsMeeting ? getMeetingData(utsMeeting).indicators : "Kebenaran jawaban dan ketepatan metode",
  })

  // 8 to 14
  for (let s = 8; s <= 14; s++) {
    // Note: In 16-week model, sessions 8..14 map to meeting minggu_ke 9..15
    const meetingWeek = s + 1
    const m = sortedMeetings.find((item) => item.minggu_ke === meetingWeek) ?? sortedMeetings.find((item) => item.minggu_ke === s)
    if (m) {
      outlineRows.push({ type: "SESSION", sessionNum: s, ...getMeetingData(m) })
    } else {
      outlineRows.push({
        type: "SESSION",
        sessionNum: s,
        competency: "—",
        topic: `Materi Perkuliahan Sesi ${s}`,
        formAndDuration: "Kuliah & Diskusi (2x50\")",
        references: "Bahan ajar perkuliahan",
        indicators: "Partisipasi kelas dan latihan",
      })
    }
  }

  // UAS row
  const uasMeeting = sortedMeetings.find((item) => item.minggu_ke === 16 || (item as any).tipe === "UAS" || (item.materi || "").toUpperCase().includes("UAS"))
  outlineRows.push({
    type: "UAS",
    competency: uasMeeting ? getMeetingData(uasMeeting).competency : "Mengevaluasi penguasaan materi komprehensif semester",
    topic: "UJIAN AKHIR SEMESTER (FINAL EXAMINATION)",
    formAndDuration: uasMeeting ? getMeetingData(uasMeeting).formAndDuration : "Tes Tertulis / Proyek Akhir (100-120\")",
    references: uasMeeting ? getMeetingData(uasMeeting).references : "Seluruh materi pembelajaran semester",
    indicators: uasMeeting ? getMeetingData(uasMeeting).indicators : "Kesesuaian luaran proyek dan penguasaan konsep",
  })

  // References
  const references = [...(rpsData?.referensis ?? [])].sort((a, b) => a.urutan - b.urutan).map((r) => ({
    jenis: r.jenis || "Pustaka",
    teks: r.teks,
  }))

  return {
    dosir,
    mk: dosir.mk,
    tahunAkademik: dosir.tahunAkademik,
    rps: rpsData,
    dosenList: Array.from(lecturerNames),
    institution,
    prasyaratText,
    allCpls: allMasterCpls.map((c) => ({ id: c.id, kode: c.kode, rumusan: c.rumusan })),
    mappedCplCodes: Array.from(mappedCplCodes),
    cpmkRows,
    assessmentSummary: {
      uts: utsBobot,
      uas: uasBobot,
      tugas: tugasBobot,
      lainnya: lainnyaBobot,
      total: totalBobot,
      items,
    },
    isWeightValid,
    isDraft,
    outlineRows,
    references,
    perlengkapan: cleanStr((rpsData as any)?.perlengkapan_pembelajaran) || "Laptop / PC, Proyektor, Akses Internet, Perangkat Lunak / CASE Tools yang relevan",
  }
}

// ---------------------------------------------------------------------------
// HELPER DOCX BUILDERS
// ---------------------------------------------------------------------------

const BORDER_SINGLE = {
  style: BorderStyle.SINGLE,
  size: 4,
  color: "000000",
}
const TABLE_BORDERS_ALL = {
  top: BORDER_SINGLE,
  bottom: BORDER_SINGLE,
  left: BORDER_SINGLE,
  right: BORDER_SINGLE,
  insideHorizontal: BORDER_SINGLE,
  insideVertical: BORDER_SINGLE,
}

function p(text: string, options: { bold?: boolean; size?: number; align?: (typeof AlignmentType)[keyof typeof AlignmentType]; font?: string; color?: string; before?: number; after?: number } = {}) {
  const { bold = false, size = 18, align = AlignmentType.LEFT, font = "Calibri", color, before = 20, after = 20 } = options
  return new Paragraph({
    alignment: align,
    spacing: { before, after, line: 240 },
    children: [
      new TextRun({
        text: text,
        bold,
        size, // size in half-points: 18 = 9pt, 20 = 10pt, 24 = 12pt, 28 = 14pt
        font,
        color,
      }),
    ],
  })
}

function sectionTitle(titleEn: string, titleId: string) {
  return new Paragraph({
    spacing: { before: 120, after: 40 },
    children: [
      new TextRun({ text: titleEn.toUpperCase(), bold: true, size: 20, font: "Calibri" }),
      new TextRun({ text: `\n${titleId}`, bold: true, size: 18, font: "Calibri" }),
    ],
  })
}

function createOfficialDocxHeader(logoBuffer: Buffer, kodeMk: string, isLandscape = false) {
  const rightWidth = isLandscape ? 13680 : 7560
  return new Header({
    children: [
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: TABLE_BORDERS_ALL,
        rows: [
          new TableRow({
            height: { value: 980, rule: HeightRule.ATLEAST },
            tableHeader: true,
            children: [
              new TableCell({
                width: { size: 1530, type: WidthType.DXA },
                verticalAlign: VerticalAlign.CENTER,
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 20, after: 20 },
                    children: [
                      new ImageRun({
                        data: logoBuffer,
                        transformation: { width: 88, height: 63 },
                        type: "jpg",
                      }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                width: { size: rightWidth, type: WidthType.DXA },
                verticalAlign: VerticalAlign.CENTER,
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 20, after: 10 },
                    children: [
                      new TextRun({ text: "SYLLABUS", bold: true, size: 28, font: "Cambria" }),
                    ],
                  }),
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 10, after: 20 },
                    children: [
                      new TextRun({ text: "(RENCANA PEMBELAJARAN SEMESTER)", bold: true, size: 20, font: "Cambria" }),
                    ],
                  }),
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    spacing: { before: 10, after: 10 },
                    children: [
                      new TextRun({ text: `[${kodeMk}]   Pg. `, size: 16, font: "Calibri" }),
                      new TextRun({ children: [PageNumber.CURRENT], bold: true, size: 16, font: "Calibri" }),
                      new TextRun({ text: " / ", size: 16, font: "Calibri" }),
                      new TextRun({ children: [PageNumber.TOTAL_PAGES], bold: true, size: 16, font: "Calibri" }),
                      new TextRun({ text: "   ", size: 16, font: "Calibri" }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  })
}

function createOfficialDocxFooter() {
  return new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 40, after: 20 },
        children: [
          new TextRun({ text: "F-PPK-09-r1", size: 16, font: "Calibri" }),
        ],
      }),
    ],
  })
}

// ---------------------------------------------------------------------------
// OFFICIAL DOCX GENERATOR
// ---------------------------------------------------------------------------

export async function generateOfficialRpsDocx(data: OfficialRpsData): Promise<Buffer> {
  const logoPath = path.join(process.cwd(), "public", "images", "rps", "image1.jpeg")
  const logoBuffer = await readFile(logoPath)

  const semesterStr = data.tahunAkademik.semester === 1 ? "Ganjil" : "Genap"
  const academicYearStr = `TA ${data.tahunAkademik.kode}`
  const totalSksNum = (data.mk.sks_teori || 0) + (data.mk.sks_praktik || 0) + (data.mk.sks_tutorial || 0)
  const lecturerNamesStr = data.dosenList.join("; ") || data.dosir.dosen?.nama_lengkap || "—"

  // PAGE 1: Table 0 (Course Identity)
  const t0Rows: TableRow[] = [
    // Row 0
    new TableRow({
      children: [
        new TableCell({
          columnSpan: 2,
          width: { size: 4590, type: WidthType.DXA },
          children: [
            p("Course Code (Kode Matakuliah) :", { bold: true, size: 16 }),
            p(data.mk.kode, { size: 18 }),
          ],
        }),
        new TableCell({
          columnSpan: 3,
          width: { size: 4500, type: WidthType.DXA },
          children: [
            p("Course Name (Nama Matakuliah):", { bold: true, size: 16 }),
            p(`${data.mk.nama_id}${data.mk.nama_en ? ` / ${data.mk.nama_en}` : ""}`, { size: 18 }),
          ],
        }),
      ],
    }),
    // Row 1
    new TableRow({
      children: [
        new TableCell({
          columnSpan: 2,
          width: { size: 4590, type: WidthType.DXA },
          children: [
            p("Study Program (Program Studi) :", { bold: true, size: 16 }),
            p(`${data.institution.prodi}`, { size: 18 }),
          ],
        }),
        new TableCell({
          columnSpan: 3,
          width: { size: 4500, type: WidthType.DXA },
          children: [
            p("Faculty (Fakultas) :", { bold: true, size: 16 }),
            p(`${data.institution.fakultas}`, { size: 18 }),
          ],
        }),
      ],
    }),
    // Row 2
    new TableRow({
      children: [
        new TableCell({
          columnSpan: 2,
          width: { size: 4590, type: WidthType.DXA },
          children: [
            p("Course Prerequisite (Matakuliah Prasyarat) :", { bold: true, size: 16 }),
            p(data.prasyaratText, { size: 18 }),
          ],
        }),
        new TableCell({
          columnSpan: 3,
          width: { size: 4500, type: WidthType.DXA },
          children: [
            p("Credit (Kredit) :", { bold: true, size: 16 }),
            p(`${totalSksNum} SKS (total kredit = kuliah + tutorial + praktikum)`, { size: 18 }),
          ],
        }),
      ],
    }),
    // Row 3
    new TableRow({
      children: [
        new TableCell({
          columnSpan: 2,
          width: { size: 4590, type: WidthType.DXA },
          children: [p("Rincian SKS Perkuliahan :", { bold: true, size: 16 })],
        }),
        new TableCell({
          width: { size: 1440, type: WidthType.DXA },
          children: [
            p("Lecture (Kuliah) :", { bold: true, size: 16 }),
            p(`${data.mk.sks_teori || 0} SKS`, { size: 18 }),
          ],
        }),
        new TableCell({
          width: { size: 1260, type: WidthType.DXA },
          children: [
            p("Tutorial :", { bold: true, size: 16 }),
            p(`${data.mk.sks_tutorial || 0} SKS`, { size: 18 }),
          ],
        }),
        new TableCell({
          width: { size: 1800, type: WidthType.DXA },
          children: [
            p("Practicum (Praktikum) :", { bold: true, size: 16 }),
            p(`${data.mk.sks_praktik || 0} SKS`, { size: 18 }),
          ],
        }),
      ],
    }),
    // Row 4
    new TableRow({
      children: [
        new TableCell({
          columnSpan: 2,
          width: { size: 4590, type: WidthType.DXA },
          children: [
            p("Revision Status (Status Revisi) :", { bold: true, size: 16 }),
            p(data.rps?.status_revisi || "R-1", { size: 18 }),
          ],
        }),
        new TableCell({
          columnSpan: 3,
          width: { size: 4500, type: WidthType.DXA },
          children: [
            p("Semester & Academic Year :", { bold: true, size: 16 }),
            p(`Semester ${semesterStr} - ${academicYearStr}`, { size: 18 }),
          ],
        }),
      ],
    }),
    // Row 5
    new TableRow({
      children: [
        new TableCell({
          columnSpan: 5,
          width: { size: 9090, type: WidthType.DXA },
          children: [
            p("Lecturer's name (Dosen Pengampu) :", { bold: true, size: 16 }),
            p(lecturerNamesStr, { size: 18 }),
          ],
        }),
      ],
    }),
    // Row 6: Signatures
    new TableRow({
      children: [
        new TableCell({
          columnSpan: 2,
          width: { size: 4590, type: WidthType.DXA },
          children: [
            p("Dipersiapkan oleh (Prepared by) :", { bold: true, size: 16 }),
            p(`Nama (Name)       : ${(data.rps as any)?.nama_penyusun || data.dosir.dosen?.nama_lengkap || "—"}`, { size: 16 }),
            p(`Jabatan (Position): ${(data.rps as any)?.jabatan_penyusun || "Dosen Pengampu"}`, { size: 16 }),
            p(`Tanggal (Date)     : ${data.rps?.tanggal_penyusunan || "—"}`, { size: 16 }),
            p("\n\n\n(                                                         )", { size: 16 }),
          ],
        }),
        new TableCell({
          columnSpan: 3,
          width: { size: 4500, type: WidthType.DXA },
          children: [
            p("Disahkan oleh (Certified by) :", { bold: true, size: 16 }),
            p(`Nama (Name)       : ${data.rps?.nama_penyetuju || "—"}`, { size: 16 }),
            p(`Jabatan (Position): ${data.rps?.jabatan_penyetuju || "Ketua Program Studi"}`, { size: 16 }),
            p(`Tanggal (Date)     : ${data.rps?.tanggal_pengesahan || "—"}`, { size: 16 }),
            p("\n\n\n(                                                         )", { size: 16 }),
          ],
        }),
      ],
    }),
  ]

  const table0 = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: TABLE_BORDERS_ALL,
    rows: t0Rows,
  })

  // Table 1: Learning Outcome (CPL Matrix)
  const cplHeaderCols: TableCell[] = [
    new TableCell({ width: { size: 1000, type: WidthType.DXA }, children: [p("Kode MK", { bold: true, size: 16, align: AlignmentType.CENTER })] }),
    new TableCell({ width: { size: 2800, type: WidthType.DXA }, children: [p("Nama Mata Kuliah", { bold: true, size: 16, align: AlignmentType.CENTER })] }),
    new TableCell({ width: { size: 790, type: WidthType.DXA }, children: [p("sks", { bold: true, size: 16, align: AlignmentType.CENTER })] }),
  ]
  const cplSubCols: TableCell[] = [
    new TableCell({ width: { size: 1000, type: WidthType.DXA }, children: [p("", { size: 16 })] }),
    new TableCell({ width: { size: 2800, type: WidthType.DXA }, children: [p("", { size: 16 })] }),
    new TableCell({ width: { size: 790, type: WidthType.DXA }, children: [p("", { size: 16 })] }),
  ]
  const cplDataCols: TableCell[] = [
    new TableCell({ width: { size: 1000, type: WidthType.DXA }, children: [p(data.mk.kode, { size: 16, align: AlignmentType.CENTER })] }),
    new TableCell({ width: { size: 2800, type: WidthType.DXA }, children: [p(data.mk.nama_id, { size: 16 })] }),
    new TableCell({ width: { size: 790, type: WidthType.DXA }, children: [p(String(totalSksNum), { size: 16, align: AlignmentType.CENTER })] }),
  ]

  const colWidth = Math.floor(4500 / Math.max(1, data.allCpls.length))
  data.allCpls.forEach((c, idx) => {
    cplHeaderCols.push(
      new TableCell({
        width: { size: colWidth, type: WidthType.DXA },
        children: [p(`CPL ${idx + 1}`, { bold: true, size: 15, align: AlignmentType.CENTER })],
      }),
    )
    cplSubCols.push(
      new TableCell({
        width: { size: colWidth, type: WidthType.DXA },
        children: [p(`(${c.kode})`, { size: 14, align: AlignmentType.CENTER })],
      }),
    )
    const isChecked = Array.isArray(data.mappedCplCodes) ? data.mappedCplCodes.includes(c.kode) : false
    cplDataCols.push(
      new TableCell({
        width: { size: colWidth, type: WidthType.DXA },
        children: [p(isChecked ? "✓" : "", { bold: true, size: 18, align: AlignmentType.CENTER })],
      }),
    )
  })

  const table1Cpl = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: TABLE_BORDERS_ALL,
    rows: [
      new TableRow({ tableHeader: true, children: cplHeaderCols }),
      new TableRow({ children: cplSubCols }),
      new TableRow({ children: cplDataCols }),
    ],
  })

  // PAGE 2: Table 2 (Subject Learning Outcome / CPMK)
  const table2CpmkRows: TableRow[] = [
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({ width: { size: 1100, type: WidthType.DXA }, shading: { fill: "EAEAEA", type: ShadingType.CLEAR }, children: [p("Kode CPMK", { bold: true, size: 16, align: AlignmentType.CENTER })] }),
        new TableCell({ width: { size: 3690, type: WidthType.DXA }, shading: { fill: "EAEAEA", type: ShadingType.CLEAR }, children: [p("Uraian CPMK", { bold: true, size: 16, align: AlignmentType.CENTER })] }),
        new TableCell({ width: { size: 1800, type: WidthType.DXA }, shading: { fill: "EAEAEA", type: ShadingType.CLEAR }, children: [p("CP / CPL Terkait", { bold: true, size: 16, align: AlignmentType.CENTER })] }),
        new TableCell({ width: { size: 2500, type: WidthType.DXA }, shading: { fill: "EAEAEA", type: ShadingType.CLEAR }, children: [p("Metode Pencapaian", { bold: true, size: 16, align: AlignmentType.CENTER })] }),
      ],
    }),
  ]

  data.cpmkRows.forEach((row) => {
    table2CpmkRows.push(
      new TableRow({
        children: [
          new TableCell({ width: { size: 1100, type: WidthType.DXA }, children: [p(row.kode, { bold: true, size: 16, align: AlignmentType.CENTER })] }),
          new TableCell({ width: { size: 3690, type: WidthType.DXA }, children: [p(row.deskripsi, { size: 16 })] }),
          new TableCell({ width: { size: 1800, type: WidthType.DXA }, children: [p(row.cplCodes, { size: 16, align: AlignmentType.CENTER })] }),
          new TableCell({ width: { size: 2500, type: WidthType.DXA }, children: [p(row.metode, { size: 16 })] }),
        ],
      }),
    )
  })

  const table2Cpmk = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: TABLE_BORDERS_ALL,
    rows: table2CpmkRows,
  })

  // PAGE 3: Table 3 (Course Outline - Landscape)
  const table3OutlineRows: TableRow[] = [
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({ width: { size: 990, type: WidthType.DXA }, shading: { fill: "EAEAEA", type: ShadingType.CLEAR }, children: [p("Session\n(Sesi)", { bold: true, size: 15, align: AlignmentType.CENTER })] }),
        new TableCell({ width: { size: 2610, type: WidthType.DXA }, shading: { fill: "EAEAEA", type: ShadingType.CLEAR }, children: [p("Targeted Competencies\n(Kemampuan Akhir)", { bold: true, size: 15, align: AlignmentType.CENTER })] }),
        new TableCell({ width: { size: 2880, type: WidthType.DXA }, shading: { fill: "EAEAEA", type: ShadingType.CLEAR }, children: [p("Topic & Sub-topics\n(Materi Pembelajaran)", { bold: true, size: 15, align: AlignmentType.CENTER })] }),
        new TableCell({ width: { size: 3510, type: WidthType.DXA }, shading: { fill: "EAEAEA", type: ShadingType.CLEAR }, children: [p("Forms of Instruction & Duration\n(Bentuk & Waktu Pembelajaran)", { bold: true, size: 15, align: AlignmentType.CENTER })] }),
        new TableCell({ width: { size: 2610, type: WidthType.DXA }, shading: { fill: "EAEAEA", type: ShadingType.CLEAR }, children: [p("Material References\n(Sumber Pembelajaran)", { bold: true, size: 15, align: AlignmentType.CENTER })] }),
        new TableCell({ width: { size: 2610, type: WidthType.DXA }, shading: { fill: "EAEAEA", type: ShadingType.CLEAR }, children: [p("Assessment Indicators\n(Indikator Penilaian)", { bold: true, size: 15, align: AlignmentType.CENTER })] }),
      ],
    }),
  ]

  data.outlineRows.forEach((row) => {
    if (row.type === "UTS" || row.type === "UAS") {
      table3OutlineRows.push(
        new TableRow({
          children: [
            new TableCell({
              columnSpan: 6,
              width: { size: 15210, type: WidthType.DXA },
              shading: { fill: "F3F4F6", type: ShadingType.CLEAR },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 80, after: 80 },
                  children: [
                    new TextRun({ text: row.topic, bold: true, size: 18, font: "Calibri" }),
                  ],
                }),
              ],
            }),
          ],
        }),
      )
    } else {
      table3OutlineRows.push(
        new TableRow({
          children: [
            new TableCell({ width: { size: 990, type: WidthType.DXA }, children: [p(String(row.sessionNum), { bold: true, size: 16, align: AlignmentType.CENTER })] }),
            new TableCell({ width: { size: 2610, type: WidthType.DXA }, children: [p(row.competency, { size: 15 })] }),
            new TableCell({ width: { size: 2880, type: WidthType.DXA }, children: [p(row.topic, { size: 15 })] }),
            new TableCell({ width: { size: 3510, type: WidthType.DXA }, children: [p(row.formAndDuration, { size: 15 })] }),
            new TableCell({ width: { size: 2610, type: WidthType.DXA }, children: [p(row.references, { size: 15 })] }),
            new TableCell({ width: { size: 2610, type: WidthType.DXA }, children: [p(row.indicators, { size: 15 })] }),
          ],
        }),
      )
    }
  })

  const table3Outline = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: TABLE_BORDERS_ALL,
    rows: table3OutlineRows,
  })

  // SECTION 1 (Portrait - Pages 1 & 2)
  const section1Children = [
    table0,
    sectionTitle("COURSE DESCRIPTION", "Deskripsi Matakuliah"),
    p(dash(data.rps?.deskripsi_mk), { size: 18 }),
    sectionTitle("COURSE OBJECTIVES", "Sasaran Kompetensi Lulusan yang Dibebankan Pada Matakuliah"),
    p(dash((data.rps as any)?.sasaran_kompetensi_lulusan || "Menguasai kompetensi dasar, analisis, perancangan, dan implementasi sesuai bidang keilmuan mata kuliah ini."), { size: 18 }),
    sectionTitle("LEARNING OUTCOME", "Capaian Pembelajaran*"),
    table1Cpl,
    p("*beri tanda pada CP yang dibebankan pada MK", { size: 14, font: "Calibri", after: 60 }),
    new Paragraph({ children: [new PageBreak()] }),

    // PAGE 2
    sectionTitle("SUBJECT LEARNING OUTCOME", "Capaian Pembelajaran Mata Kuliah"),
    table2Cpmk,
    sectionTitle("METHODS OF INSTRUCTION", "Metode Pembelajaran"),
    p(dash(data.rps?.metode_pembelajaran || "Diskusi kelompok, simulasi, studi kasus, pembelajaran kolaboratif, dan pembelajaran berbasis proyek (PBL)."), { size: 18 }),
    sectionTitle("ATTENDANCE REQUIREMENT", "Syarat Kehadiran"),
    p(dash(data.rps?.persyaratan_kehadiran || "Sesuai dengan peraturan akademik Universitas Bakrie (kehadiran minimal 75% dari total tatap muka untuk dapat mengikuti Ujian Akhir Semester)."), { size: 18 }),
    sectionTitle("ASSESSMENT", "Penilaian dan Pembobotannya"),
    p("Coursework evaluation will be weighted as follows:", { size: 16, bold: true }),
    p(`• Mid-Semester Examination (UTS) : ${data.assessmentSummary.uts}%`, { size: 16 }),
    p(`• Final Examination (UAS)        : ${data.assessmentSummary.uas}%`, { size: 16 }),
    p(`• Assignment (Tugas)             : ${data.assessmentSummary.tugas}%`, { size: 16 }),
    p(`• Others (Partisipasi, Kuis, dll) : ${data.assessmentSummary.lainnya}%`, { size: 16 }),
    p(`Total : ${data.assessmentSummary.total}%`, { size: 18, bold: true }),
    ...(!data.isWeightValid
      ? [p("PERINGATAN: Total bobot penilaian belum 100% (Status Dokumen: DRAFT)", { bold: true, color: "DC2626", size: 16 })]
      : []),
    sectionTitle("MATERIAL REFERENCES AND REQUIRED SUPPLIES", "Daftar Referensi dan Perlengkapan yang Digunakan"),
    p("Referensi Pembelajaran:", { bold: true, size: 16 }),
    ...(data.references.length > 0
      ? data.references.map((r, idx) => p(`${idx + 1}. [${r.jenis}] ${r.teks}`, { size: 16 }))
      : [p("— Belum ada daftar referensi —", { size: 16 })]),
    p("\nPerlengkapan / Supplies:", { bold: true, size: 16, before: 60 }),
    p(data.perlengkapan, { size: 16 }),
  ]

  // SECTION 2 (Landscape - Page 3)
  const section2Children = [
    sectionTitle("COURSE OUTLINE", "Rencana Pembelajaran Semester"),
    p("This section shows the targeted competencies, topics, sub-topics, specific method of instruction/delivery, material references, and assessment indicators for each session.", { size: 15, after: 60 }),
    table3Outline,
  ]

  const doc = new DocxDocument({
    sections: [
      {
        properties: {
          page: {
            size: { width: 11909, height: 16834 },
            margin: { top: 1728, right: 1440, bottom: 719, left: 1440, header: 450, footer: 720 },
          },
        },
        headers: { default: createOfficialDocxHeader(logoBuffer, data.mk.kode, false) },
        footers: { default: createOfficialDocxFooter() },
        children: section1Children,
      },
      {
        properties: {
          page: {
            size: { width: 16834, height: 11909, orientation: PageOrientation.LANDSCAPE },
            margin: { top: 720, right: 821, bottom: 720, left: 720, header: 446, footer: 720 },
          },
        },
        headers: { default: createOfficialDocxHeader(logoBuffer, data.mk.kode, true) },
        footers: { default: createOfficialDocxFooter() },
        children: section2Children,
      },
    ],
  })

  return Packer.toBuffer(doc)
}

// ---------------------------------------------------------------------------
// OFFICIAL PDF GENERATOR (React-PDF)
// ---------------------------------------------------------------------------

const pdfStyles = StyleSheet.create({
  pagePortrait: {
    paddingTop: 36,
    paddingBottom: 28,
    paddingLeft: 36,
    paddingRight: 36,
    fontSize: 7.5,
    fontFamily: "Helvetica",
    color: "#111827",
  },
  pageLandscape: {
    paddingTop: 24,
    paddingBottom: 24,
    paddingLeft: 24,
    paddingRight: 24,
    fontSize: 7,
    fontFamily: "Helvetica",
    color: "#111827",
  },
  headerTable: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#000",
    marginBottom: 8,
  },
  headerLogoCol: {
    width: 75,
    borderRightWidth: 1,
    borderColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    padding: 3,
  },
  headerTitleCol: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 3,
  },
  headerTitleMain: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    textAlign: "center",
  },
  headerTitleSub: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    textAlign: "center",
  },
  headerCourseCode: {
    fontSize: 7,
    marginTop: 2,
    alignSelf: "flex-end",
    marginRight: 6,
  },
  footerText: {
    position: "absolute",
    bottom: 12,
    right: 36,
    fontSize: 7,
    color: "#4B5563",
  },
  footerTextLandscape: {
    position: "absolute",
    bottom: 10,
    right: 24,
    fontSize: 6.5,
    color: "#4B5563",
  },
  sectionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    marginTop: 6,
    marginBottom: 2,
    textTransform: "uppercase",
  },
  sectionSubTitle: {
    fontSize: 7,
    fontFamily: "Helvetica-Oblique",
    marginBottom: 3,
    color: "#374151",
  },
  table: {
    borderWidth: 1,
    borderColor: "#000",
    marginTop: 2,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#000",
  },
  tableCell: {
    padding: 3,
    borderRightWidth: 1,
    borderColor: "#000",
    fontSize: 7,
  },
  tableCellHeader: {
    fontFamily: "Helvetica-Bold",
    backgroundColor: "#F3F4F6",
    textAlign: "center",
  },
  watermark: {
    position: "absolute",
    top: 300,
    left: 80,
    fontSize: 64,
    fontFamily: "Helvetica-Bold",
    color: "rgba(220, 38, 38, 0.08)",
    transform: "rotate(-30deg)",
  },
})

export async function generateOfficialRpsPdf(data: OfficialRpsData): Promise<Buffer> {
  const logoPath = path.join(process.cwd(), "public", "images", "rps", "image1.jpeg")
  const logoBuffer = await readFile(logoPath).catch(() => null)
  const logoSrc = logoBuffer ? `data:image/jpeg;base64,${logoBuffer.toString("base64")}` : logoPath
  const semesterStr = data.tahunAkademik.semester === 1 ? "Ganjil" : "Genap"
  const academicYearStr = `TA ${data.tahunAkademik.kode}`
  const totalSksNum = (data.mk.sks_teori || 0) + (data.mk.sks_praktik || 0) + (data.mk.sks_tutorial || 0)
  const lecturerNamesStr = data.dosenList.join("; ") || data.dosir.dosen?.nama_lengkap || "—"

  // PDF Page 1
  const page1 = React.createElement(
    PdfPage,
    { size: "A4", style: pdfStyles.pagePortrait, key: "p1" },
    data.isDraft ? React.createElement(PdfText, { style: pdfStyles.watermark }, "DRAFT") : null,
    // Header
    React.createElement(
      PdfView,
      { style: pdfStyles.headerTable },
      React.createElement(
        PdfView,
        { style: pdfStyles.headerLogoCol },
        React.createElement(PdfImage, { src: logoSrc, style: { width: 50, height: 35 } }),
      ),
      React.createElement(
        PdfView,
        { style: pdfStyles.headerTitleCol },
        React.createElement(PdfText, { style: pdfStyles.headerTitleMain }, "SYLLABUS"),
        React.createElement(PdfText, { style: pdfStyles.headerTitleSub }, "(RENCANA PEMBELAJARAN SEMESTER)"),
        React.createElement(PdfText, { style: pdfStyles.headerCourseCode }, `[${data.mk.kode}]   Pg. 1/3`),
      ),
    ),
    // Table 0 (Course Identity)
    React.createElement(
      PdfView,
      { style: pdfStyles.table },
      React.createElement(
        PdfView,
        { style: pdfStyles.tableRow },
        React.createElement(PdfView, { style: [pdfStyles.tableCell, { width: "50%" }] },
          React.createElement(PdfText, { style: { fontFamily: "Helvetica-Bold" } }, "Course Code (Kode Matakuliah) :"),
          React.createElement(PdfText, null, data.mk.kode),
        ),
        React.createElement(PdfView, { style: [pdfStyles.tableCell, { width: "50%", borderRightWidth: 0 }] },
          React.createElement(PdfText, { style: { fontFamily: "Helvetica-Bold" } }, "Course Name (Nama Matakuliah) :"),
          React.createElement(PdfText, null, `${data.mk.nama_id}${data.mk.nama_en ? ` / ${data.mk.nama_en}` : ""}`),
        ),
      ),
      React.createElement(
        PdfView,
        { style: pdfStyles.tableRow },
        React.createElement(PdfView, { style: [pdfStyles.tableCell, { width: "50%" }] },
          React.createElement(PdfText, { style: { fontFamily: "Helvetica-Bold" } }, "Study Program (Program Studi) :"),
          React.createElement(PdfText, null, data.institution.prodi),
        ),
        React.createElement(PdfView, { style: [pdfStyles.tableCell, { width: "50%", borderRightWidth: 0 }] },
          React.createElement(PdfText, { style: { fontFamily: "Helvetica-Bold" } }, "Faculty (Fakultas) :"),
          React.createElement(PdfText, null, data.institution.fakultas),
        ),
      ),
      React.createElement(
        PdfView,
        { style: pdfStyles.tableRow },
        React.createElement(PdfView, { style: [pdfStyles.tableCell, { width: "50%" }] },
          React.createElement(PdfText, { style: { fontFamily: "Helvetica-Bold" } }, "Course Prerequisite (Matakuliah Prasyarat) :"),
          React.createElement(PdfText, null, data.prasyaratText),
        ),
        React.createElement(PdfView, { style: [pdfStyles.tableCell, { width: "50%", borderRightWidth: 0 }] },
          React.createElement(PdfText, { style: { fontFamily: "Helvetica-Bold" } }, "Credit (Kredit) :"),
          React.createElement(PdfText, null, `${totalSksNum} SKS (total kredit = kuliah + tutorial + praktikum)`),
        ),
      ),
      React.createElement(
        PdfView,
        { style: pdfStyles.tableRow },
        React.createElement(PdfView, { style: [pdfStyles.tableCell, { width: "50%" }] },
          React.createElement(PdfText, { style: { fontFamily: "Helvetica-Bold" } }, "Rincian SKS Perkuliahan :"),
        ),
        React.createElement(PdfView, { style: [pdfStyles.tableCell, { width: "16.6%" }] },
          React.createElement(PdfText, { style: { fontFamily: "Helvetica-Bold" } }, "Kuliah:"),
          React.createElement(PdfText, null, `${data.mk.sks_teori || 0} SKS`),
        ),
        React.createElement(PdfView, { style: [pdfStyles.tableCell, { width: "16.6%" }] },
          React.createElement(PdfText, { style: { fontFamily: "Helvetica-Bold" } }, "Tutorial:"),
          React.createElement(PdfText, null, `${data.mk.sks_tutorial || 0} SKS`),
        ),
        React.createElement(PdfView, { style: [pdfStyles.tableCell, { width: "16.8%", borderRightWidth: 0 }] },
          React.createElement(PdfText, { style: { fontFamily: "Helvetica-Bold" } }, "Praktikum:"),
          React.createElement(PdfText, null, `${data.mk.sks_praktik || 0} SKS`),
        ),
      ),
      React.createElement(
        PdfView,
        { style: pdfStyles.tableRow },
        React.createElement(PdfView, { style: [pdfStyles.tableCell, { width: "50%" }] },
          React.createElement(PdfText, { style: { fontFamily: "Helvetica-Bold" } }, "Revision Status (Status Revisi) :"),
          React.createElement(PdfText, null, data.rps?.status_revisi || "R-1"),
        ),
        React.createElement(PdfView, { style: [pdfStyles.tableCell, { width: "50%", borderRightWidth: 0 }] },
          React.createElement(PdfText, { style: { fontFamily: "Helvetica-Bold" } }, "Semester & Tahun Akademik :"),
          React.createElement(PdfText, null, `Semester ${semesterStr} - ${academicYearStr}`),
        ),
      ),
      React.createElement(
        PdfView,
        { style: pdfStyles.tableRow },
        React.createElement(PdfView, { style: [pdfStyles.tableCell, { width: "100%", borderRightWidth: 0 }] },
          React.createElement(PdfText, { style: { fontFamily: "Helvetica-Bold" } }, "Lecturer's Name (Dosen Pengampu) :"),
          React.createElement(PdfText, null, lecturerNamesStr),
        ),
      ),
      React.createElement(
        PdfView,
        { style: [pdfStyles.tableRow, { borderBottomWidth: 0 }] },
        React.createElement(PdfView, { style: [pdfStyles.tableCell, { width: "50%" }] },
          React.createElement(PdfText, { style: { fontFamily: "Helvetica-Bold" } }, "Dipersiapkan oleh (Prepared by) :"),
          React.createElement(PdfText, null, `Nama: ${(data.rps as any)?.nama_penyusun || data.dosir.dosen?.nama_lengkap || "—"}`),
          React.createElement(PdfText, null, `Jabatan: ${(data.rps as any)?.jabatan_penyusun || "Dosen Pengampu"}`),
          React.createElement(PdfText, null, `Tanggal: ${data.rps?.tanggal_penyusunan || "—"}`),
          React.createElement(PdfText, { style: { marginTop: 24 } }, "(                                                         )"),
        ),
        React.createElement(PdfView, { style: [pdfStyles.tableCell, { width: "50%", borderRightWidth: 0 }] },
          React.createElement(PdfText, { style: { fontFamily: "Helvetica-Bold" } }, "Disahkan oleh (Certified by) :"),
          React.createElement(PdfText, null, `Nama: ${data.rps?.nama_penyetuju || "—"}`),
          React.createElement(PdfText, null, `Jabatan: ${data.rps?.jabatan_penyetuju || "Ketua Program Studi"}`),
          React.createElement(PdfText, null, `Tanggal: ${data.rps?.tanggal_pengesahan || "—"}`),
          React.createElement(PdfText, { style: { marginTop: 24 } }, "(                                                         )"),
        ),
      ),
    ),
    // Course Description
    React.createElement(PdfText, { style: pdfStyles.sectionTitle }, "COURSE DESCRIPTION / Deskripsi Matakuliah"),
    React.createElement(PdfText, { style: { lineHeight: 1.3, marginBottom: 4 } }, dash(data.rps?.deskripsi_mk)),
    // Course Objectives
    React.createElement(PdfText, { style: pdfStyles.sectionTitle }, "COURSE OBJECTIVES / Sasaran Kompetensi Lulusan pada MK"),
    React.createElement(PdfText, { style: { lineHeight: 1.3, marginBottom: 4 } }, dash((data.rps as any)?.sasaran_kompetensi_lulusan || "Menguasai kompetensi dasar, analisis, perancangan, dan implementasi sesuai bidang keilmuan mata kuliah ini.")),
    // Learning Outcome (CPL Matrix)
    React.createElement(PdfText, { style: pdfStyles.sectionTitle }, "LEARNING OUTCOME / Capaian Pembelajaran*"),
    React.createElement(
      PdfView,
      { style: pdfStyles.table },
      React.createElement(
        PdfView,
        { style: pdfStyles.tableRow },
        React.createElement(PdfText, { style: [pdfStyles.tableCell, pdfStyles.tableCellHeader, { width: "12%" }] }, "Kode MK"),
        React.createElement(PdfText, { style: [pdfStyles.tableCell, pdfStyles.tableCellHeader, { width: "32%" }] }, "Nama Mata Kuliah"),
        React.createElement(PdfText, { style: [pdfStyles.tableCell, pdfStyles.tableCellHeader, { width: "8%" }] }, "sks"),
        ...data.allCpls.map((c, idx) =>
          React.createElement(PdfText, { style: [pdfStyles.tableCell, pdfStyles.tableCellHeader, { flex: 1 }], key: c.id }, `CPL ${idx + 1}\n(${c.kode})`),
        ),
      ),
      React.createElement(
        PdfView,
        { style: [pdfStyles.tableRow, { borderBottomWidth: 0 }] },
        React.createElement(PdfText, { style: [pdfStyles.tableCell, { width: "12%", textAlign: "center" }] }, data.mk.kode),
        React.createElement(PdfText, { style: [pdfStyles.tableCell, { width: "32%" }] }, data.mk.nama_id),
        React.createElement(PdfText, { style: [pdfStyles.tableCell, { width: "8%", textAlign: "center" }] }, String(totalSksNum)),
        ...data.allCpls.map((c) =>
          React.createElement(
            PdfText,
            { style: [pdfStyles.tableCell, { flex: 1, textAlign: "center", fontFamily: "Helvetica-Bold" }], key: `val-${c.id}` },
            Array.isArray(data.mappedCplCodes) && data.mappedCplCodes.includes(c.kode) ? "✓" : "",
          ),
        ),
      ),
    ),
    React.createElement(PdfText, { style: [pdfStyles.sectionSubTitle, { fontSize: 6 }] }, "*beri tanda pada CP yang dibebankan pada MK"),
    React.createElement(PdfText, { style: pdfStyles.footerText }, "F-PPK-09-r1"),
  )

  // PDF Page 2
  const page2 = React.createElement(
    PdfPage,
    { size: "A4", style: pdfStyles.pagePortrait, key: "p2" },
    data.isDraft ? React.createElement(PdfText, { style: pdfStyles.watermark }, "DRAFT") : null,
    // Header
    React.createElement(
      PdfView,
      { style: pdfStyles.headerTable },
      React.createElement(
        PdfView,
        { style: pdfStyles.headerLogoCol },
        React.createElement(PdfImage, { src: logoSrc, style: { width: 50, height: 35 } }),
      ),
      React.createElement(
        PdfView,
        { style: pdfStyles.headerTitleCol },
        React.createElement(PdfText, { style: pdfStyles.headerTitleMain }, "SYLLABUS"),
        React.createElement(PdfText, { style: pdfStyles.headerTitleSub }, "(RENCANA PEMBELAJARAN SEMESTER)"),
        React.createElement(PdfText, { style: pdfStyles.headerCourseCode }, `[${data.mk.kode}]   Pg. 2/3`),
      ),
    ),
    // CPMK Table
    React.createElement(PdfText, { style: pdfStyles.sectionTitle }, "SUBJECT LEARNING OUTCOME / Capaian Pembelajaran Mata Kuliah"),
    React.createElement(
      PdfView,
      { style: pdfStyles.table },
      React.createElement(
        PdfView,
        { style: pdfStyles.tableRow },
        React.createElement(PdfText, { style: [pdfStyles.tableCell, pdfStyles.tableCellHeader, { width: "15%" }] }, "Kode CPMK"),
        React.createElement(PdfText, { style: [pdfStyles.tableCell, pdfStyles.tableCellHeader, { width: "45%" }] }, "Uraian CPMK"),
        React.createElement(PdfText, { style: [pdfStyles.tableCell, pdfStyles.tableCellHeader, { width: "18%" }] }, "CP / CPL Terkait"),
        React.createElement(PdfText, { style: [pdfStyles.tableCell, pdfStyles.tableCellHeader, { width: "22%", borderRightWidth: 0 }] }, "Metode Pencapaian"),
      ),
      ...data.cpmkRows.map((cpmk, idx) =>
        React.createElement(
          PdfView,
          { style: [pdfStyles.tableRow, idx === data.cpmkRows.length - 1 ? { borderBottomWidth: 0 } : {}], key: cpmk.kode },
          React.createElement(PdfText, { style: [pdfStyles.tableCell, { width: "15%", textAlign: "center", fontFamily: "Helvetica-Bold" }] }, cpmk.kode),
          React.createElement(PdfText, { style: [pdfStyles.tableCell, { width: "45%" }] }, cpmk.deskripsi),
          React.createElement(PdfText, { style: [pdfStyles.tableCell, { width: "18%", textAlign: "center" }] }, cpmk.cplCodes),
          React.createElement(PdfText, { style: [pdfStyles.tableCell, { width: "22%", borderRightWidth: 0 }] }, cpmk.metode),
        ),
      ),
    ),
    // Methods of Instruction
    React.createElement(PdfText, { style: pdfStyles.sectionTitle }, "METHODS OF INSTRUCTION / Metode Pembelajaran"),
    React.createElement(PdfText, { style: { lineHeight: 1.3, marginBottom: 4 } }, dash(data.rps?.metode_pembelajaran || "Diskusi kelompok, simulasi, studi kasus, pembelajaran kolaboratif, dan pembelajaran berbasis proyek (PBL).")),
    // Attendance Requirement
    React.createElement(PdfText, { style: pdfStyles.sectionTitle }, "ATTENDANCE REQUIREMENT / Syarat Kehadiran"),
    React.createElement(PdfText, { style: { lineHeight: 1.3, marginBottom: 4 } }, dash(data.rps?.persyaratan_kehadiran || "Sesuai dengan peraturan akademik Universitas Bakrie (kehadiran minimal 75% dari total tatap muka untuk dapat mengikuti Ujian Akhir Semester).")),
    // Assessment
    React.createElement(PdfText, { style: pdfStyles.sectionTitle }, "ASSESSMENT / Penilaian dan Pembobotannya"),
    React.createElement(PdfText, { style: { fontFamily: "Helvetica-Bold", marginBottom: 2 } }, "Coursework evaluation will be weighted as follows:"),
    React.createElement(PdfText, null, `• Mid-Semester Examination (UTS) : ${data.assessmentSummary.uts}%`),
    React.createElement(PdfText, null, `• Final Examination (UAS)        : ${data.assessmentSummary.uas}%`),
    React.createElement(PdfText, null, `• Assignment (Tugas)             : ${data.assessmentSummary.tugas}%`),
    React.createElement(PdfText, null, `• Others (Partisipasi, Kuis, dll) : ${data.assessmentSummary.lainnya}%`),
    React.createElement(PdfText, { style: { fontFamily: "Helvetica-Bold", marginTop: 2, marginBottom: 2 } }, `Total : ${data.assessmentSummary.total}%`),
    !data.isWeightValid
      ? React.createElement(PdfText, { style: { color: "#DC2626", fontFamily: "Helvetica-Bold", fontSize: 6.5, marginBottom: 4 } }, "PERINGATAN: Total bobot penilaian belum 100% (Status: DRAFT)")
      : null,
    // References
    React.createElement(PdfText, { style: pdfStyles.sectionTitle }, "MATERIAL REFERENCES AND REQUIRED SUPPLIES / Daftar Referensi & Perlengkapan"),
    React.createElement(PdfText, { style: { fontFamily: "Helvetica-Bold" } }, "Daftar Referensi:"),
    ...(data.references.length > 0
      ? data.references.map((r, idx) => React.createElement(PdfText, { key: idx, style: { fontSize: 6.5 } }, `${idx + 1}. [${r.jenis}] ${r.teks}`))
      : [React.createElement(PdfText, { key: "none", style: { fontSize: 6.5 } }, "— Belum ada daftar referensi —")]),
    React.createElement(PdfText, { style: { fontFamily: "Helvetica-Bold", marginTop: 4 } }, "Perlengkapan / Required Supplies:"),
    React.createElement(PdfText, { style: { fontSize: 6.5 } }, data.perlengkapan),
    React.createElement(PdfText, { style: pdfStyles.footerText }, "F-PPK-09-r1"),
  )

  // PDF Page 3 (Landscape - Course Outline)
  const page3 = React.createElement(
    PdfPage,
    { size: "A4", orientation: "landscape", style: pdfStyles.pageLandscape, key: "p3" },
    data.isDraft ? React.createElement(PdfText, { style: [pdfStyles.watermark, { top: 180, left: 240 }] }, "DRAFT") : null,
    // Header Landscape
    React.createElement(
      PdfView,
      { style: pdfStyles.headerTable },
      React.createElement(
        PdfView,
        { style: pdfStyles.headerLogoCol },
        React.createElement(PdfImage, { src: logoSrc, style: { width: 50, height: 35 } }),
      ),
      React.createElement(
        PdfView,
        { style: pdfStyles.headerTitleCol },
        React.createElement(PdfText, { style: pdfStyles.headerTitleMain }, "SYLLABUS"),
        React.createElement(PdfText, { style: pdfStyles.headerTitleSub }, "(RENCANA PEMBELAJARAN SEMESTER)"),
        React.createElement(PdfText, { style: pdfStyles.headerCourseCode }, `[${data.mk.kode}]   Pg. 3/3`),
      ),
    ),
    React.createElement(PdfText, { style: [pdfStyles.sectionTitle, { fontSize: 9 }] }, "COURSE OUTLINE / Rencana Pembelajaran Mingguan"),
    React.createElement(
      PdfView,
      { style: pdfStyles.table },
      // Header Table 3
      React.createElement(
        PdfView,
        { style: pdfStyles.tableRow },
        React.createElement(PdfText, { style: [pdfStyles.tableCell, pdfStyles.tableCellHeader, { width: "6%" }] }, "Session\n(Sesi)"),
        React.createElement(PdfText, { style: [pdfStyles.tableCell, pdfStyles.tableCellHeader, { width: "18%" }] }, "Targeted Competencies\n(Kemampuan Akhir)"),
        React.createElement(PdfText, { style: [pdfStyles.tableCell, pdfStyles.tableCellHeader, { width: "20%" }] }, "Topic & Sub-topics\n(Materi Pembelajaran)"),
        React.createElement(PdfText, { style: [pdfStyles.tableCell, pdfStyles.tableCellHeader, { width: "22%" }] }, "Forms & Duration\n(Bentuk & Waktu)"),
        React.createElement(PdfText, { style: [pdfStyles.tableCell, pdfStyles.tableCellHeader, { width: "17%" }] }, "Material References\n(Sumber Pembelajaran)"),
        React.createElement(PdfText, { style: [pdfStyles.tableCell, pdfStyles.tableCellHeader, { width: "17%", borderRightWidth: 0 }] }, "Assessment Indicators\n(Indikator Penilaian)"),
      ),
      // Rows Table 3
      ...data.outlineRows.map((row, idx) => {
        const isExam = row.type === "UTS" || row.type === "UAS"
        if (isExam) {
          return React.createElement(
            PdfView,
            { style: [pdfStyles.tableRow, { backgroundColor: "#F3F4F6" }], key: `exam-${idx}` },
            React.createElement(
              PdfText,
              { style: [pdfStyles.tableCell, { width: "100%", textAlign: "center", fontFamily: "Helvetica-Bold", padding: 3, borderRightWidth: 0 }] },
              row.topic,
            ),
          )
        }
        return React.createElement(
          PdfView,
          { style: [pdfStyles.tableRow, idx === data.outlineRows.length - 1 ? { borderBottomWidth: 0 } : {}], key: `session-${idx}` },
          React.createElement(PdfText, { style: [pdfStyles.tableCell, { width: "6%", textAlign: "center", fontFamily: "Helvetica-Bold" }] }, String(row.sessionNum)),
          React.createElement(PdfText, { style: [pdfStyles.tableCell, { width: "18%" }] }, row.competency),
          React.createElement(PdfText, { style: [pdfStyles.tableCell, { width: "20%" }] }, row.topic),
          React.createElement(PdfText, { style: [pdfStyles.tableCell, { width: "22%" }] }, row.formAndDuration),
          React.createElement(PdfText, { style: [pdfStyles.tableCell, { width: "17%" }] }, row.references),
          React.createElement(PdfText, { style: [pdfStyles.tableCell, { width: "17%", borderRightWidth: 0 }] }, row.indicators),
        )
      }),
    ),
    React.createElement(PdfText, { style: pdfStyles.footerTextLandscape }, "F-PPK-09-r1"),
  )

  const doc = React.createElement(PdfDocument, null, page1, page2, page3)
  return renderToBuffer(doc)
}
