"use server"

import * as XLSX from "xlsx"
import { and, eq, inArray } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import { db } from "@/db"
import {
  assessmentTemplate,
  cpl,
  cpmkTemplate,
  mataKuliah,
  petaKurikulum,
  subCpmkTemplate,
  dosirMk,
  tahunAkademik,
  users,
} from "@/db/schema"
import { getCurrentSession } from "@/lib/current-session"

type CourseInput = {
  kode: string
  nama_id: string
  nama_en: string | null
  sks_teori: number
  sks_praktik: number
  semester: number
  status: "WAJIB" | "PILIHAN"
  isPbl: boolean
}

type CplInput = {
  kode: string
  kategori: string
  rumusan: string
}

type CourseCpmkInput = {
  kodeMk: string
  kodeCpl: string
  kodeCpmk: string
}

type CpmkAssessmentMethodInput = { kodeMk: string; kodeCpmk: string; metode: string }

type SubCpmkInput = {
  kodeMk: string
  kodeCpmk: string
  kodeSubCpmk: string
  deskripsi: string
}

type AssessmentInput = {
  kodeMk: string
  kodeCpmk: string
  kodeSubCpmk: string
  nama: string
  bobot: number
  kriteria: string
}

type ParsedWorkbook = {
  cpls: CplInput[]
  courses: CourseInput[]
  cpmkDescriptions: Map<string, string>
  courseCpmks: CourseCpmkInput[]
  cpmkAssessmentMethods: CpmkAssessmentMethodInput[]
  subCpmks: SubCpmkInput[]
  assessments: AssessmentInput[]
  warnings: string[]
}

export type OperationalImportResult = {
  success: boolean
  message: string
  summary?: {
    cpls: number
    courses: number
    courseCpmks: number
    subCpmks: number
    assessments: number
  }
  warnings?: string[]
}

type ImportScope = "templates" | "full"

type PlottingAssignment = {
  kodeMk: string
  namaMk: string
  kodeKelas: string
  namaDosen: string
  semester: number
}

const REQUIRED_SHEETS = [
  "T2 CPL",
  "T9 MK",
  "T12b CPL-CPMK-MK",
  "T14 CPL-MK-CPMK-OK",
  "T15 MK-CPMK-SubCPMK-OK",
  "T17 PenilaianCPMK",
  "T18a BobotPen",
]

const text = (value: unknown) => String(value ?? "").trim()
const number = (value: unknown) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function rows(workbook: XLSX.WorkBook, name: string): unknown[][] {
  const worksheet = workbook.Sheets[name]
  if (!worksheet) return []
  return XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1, defval: null, raw: true })
}

function parsePlottingWorkbook(workbook: XLSX.WorkBook): PlottingAssignment[] | null {
  const sheetName = workbook.SheetNames.length === 1 ? workbook.SheetNames[0] : ""
  const sheet = sheetName ? workbook.Sheets[sheetName] : undefined
  if (!sheet) return null
  const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: null, raw: true })
  const first = data[0]
  if (!first || !("Kode Kelas" in first) || !("Pengajar" in first) || !("Mata Kuliah" in first)) return null
  return data.flatMap((row) => {
    const pengajar = text(row["Pengajar"]).replace(/\s*\([^)]*\)\s*$/, "").trim()
    const kodeKelas = text(row["Kode Kelas"])
    const kodeMk = kodeKelas.split(" - ")[0].trim()
    if (!kodeMk || !pengajar) return []
    return [{ kodeMk, namaMk: text(row["Mata Kuliah"]), kodeKelas, namaDosen: pengajar, semester: number(row["Smt."]) }]
  })
}

function plottingClass(value: string) {
  const base = value.split("/")[0].replace(/-+$/, "")
  const semester = value.includes("-P") ? "P" : "W"
  return `${base}-${semester}`.slice(0, 10)
}

function cleanCourseName(value: string) {
  return value
    .replace(/[¹²³]\)/g, "")
    .replace(/\(PBL[^)]*\)/gi, "")
    .replace(/\[[^\]]*\]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

function canonicalCpmk(value: unknown) {
  const normalized = text(value).toUpperCase().replace(/\s+/g, "")
  if (!normalized) return ""
  return normalized.startsWith("CPMK") ? normalized : `CPMK${normalized}`
}

function canonicalSubCpmk(value: unknown) {
  const normalized = text(value).replace(/\s+/g, "")
  if (!normalized) return ""
  return normalized.replace(/^CPMK/i, "")
}

function domainFromCategory(category: string) {
  if (category.startsWith("S")) return "SIKAP" as const
  if (category.startsWith("P")) return "PENGETAHUAN" as const
  if (category.startsWith("KU")) return "KETERAMPILAN_UMUM" as const
  return "KETERAMPILAN_KHUSUS" as const
}

async function parseWorkbook(buffer: ArrayBuffer): Promise<ParsedWorkbook> {
  const workbook = XLSX.read(buffer, { type: "array" })
  const missingSheets = REQUIRED_SHEETS.filter((name) => !workbook.SheetNames.includes(name))
  if (missingSheets.length > 0) throw new Error(`Sheet wajib tidak ditemukan: ${missingSheets.join(", ")}`)

  const warnings: string[] = []

  const cpls = rows(workbook, "T2 CPL").slice(1).map((row) => ({
    kode: text(row[0]),
    kategori: text(row[1]),
    rumusan: text(row[2]),
  })).filter((item) => /^CPL\d+$/i.test(item.kode) && item.rumusan)

  const courses = rows(workbook, "T9 MK").slice(2).map((row) => {
    const kode = text(row[1])
    const rawName = text(row[2])
    const [namaIdRaw, ...englishParts] = rawName.split("/")
    const hasPracticum = /¹/.test(rawName)
    const totalSks = Math.round(number(row[4]))
    const semesterIndex = row.slice(5, 13).findIndex((value) => number(value) > 0)
    return {
      kode,
      nama_id: cleanCourseName(namaIdRaw),
      nama_en: englishParts.length > 0 ? cleanCourseName(englishParts.join("/")) : null,
      sks_teori: Math.max(0, totalSks - (hasPracticum ? 1 : 0)),
      sks_praktik: hasPracticum ? 1 : 0,
      semester: semesterIndex >= 0 ? semesterIndex + 1 : 0,
      status: /pilihan/i.test(text(row[3])) ? "PILIHAN" as const : "WAJIB" as const,
      isPbl: /PBL/i.test(rawName),
    }
  }).filter((item) => item.kode && item.nama_id && item.semester > 0)

  const cpmkDescriptions = new Map<string, string>()
  for (const row of rows(workbook, "T12b CPL-CPMK-MK").slice(1)) {
    const kode = canonicalCpmk(row[4])
    const deskripsi = text(row[5])
    if (kode && deskripsi) cpmkDescriptions.set(kode, deskripsi)
  }

  const EMPTY_COURSES = new Set(["SIF911", "SIF912", "SIF906", "SIF611", "UNI102"])

  // Parse T14 CPL-MK-CPMK-OK for accurate Course -> CPL -> CPMK mappings
  const courseCpmks: CourseCpmkInput[] = []
  const validCpmkByCourse = new Map<string, Set<string>>()
  const seenCourseCpmk = new Set<string>()

  const t14Rows = rows(workbook, "T14 CPL-MK-CPMK-OK")
  const cplHeaders = t14Rows[1] as unknown[] | undefined

  if (cplHeaders && t14Rows.length > 2) {
    for (let i = 2; i < t14Rows.length; i++) {
      const row = t14Rows[i]
      const kodeMk = text(row[0]).toUpperCase()
      if (!kodeMk || EMPTY_COURSES.has(kodeMk)) continue

      for (let c = 2; c < cplHeaders.length; c++) {
        const kodeCpl = text(cplHeaders[c]).toUpperCase()
        const cellValue = text(row[c])
        if (!kodeCpl || !cellValue) continue

        const rawCpmks = cellValue.split(/[,;\n]+/).map((s) => canonicalCpmk(s)).filter(Boolean)
        for (const kodeCpmk of rawCpmks) {
          const key = `${kodeMk}:${kodeCpl}:${kodeCpmk}`
          if (seenCourseCpmk.has(key)) continue
          seenCourseCpmk.add(key)

          courseCpmks.push({ kodeMk, kodeCpl, kodeCpmk })
          if (!validCpmkByCourse.has(kodeMk)) validCpmkByCourse.set(kodeMk, new Set())
          validCpmkByCourse.get(kodeMk)!.add(kodeCpmk)
        }
      }
    }
  }

  // Parse T15 MK-CPMK-SubCPMK-OK for Sub-CPMKs, respecting T14 and filtering anomalies
  const subCpmks: SubCpmkInput[] = []
  const seenSub = new Set<string>()
  let currentMk = ""
  let currentCpmk = ""
  const t15Rows = rows(workbook, "T15 MK-CPMK-SubCPMK-OK").slice(1)
  for (const row of t15Rows) {
    if (text(row[1])) currentMk = text(row[1]).toUpperCase()
    if (text(row[3])) currentCpmk = canonicalCpmk(row[3])
    if (!currentMk || !currentCpmk || EMPTY_COURSES.has(currentMk)) continue

    // Validate CPMK against T14 matrix for this MK
    const validCpmks = validCpmkByCourse.get(currentMk)
    if (!validCpmks || !validCpmks.has(currentCpmk)) continue

    const kodeSubCpmk = canonicalSubCpmk(row[4])
    const deskripsi = text(row[5])
    if (!kodeSubCpmk || !deskripsi) continue

    // Clean anomalies
    if (currentCpmk === "CPMK21" && kodeSubCpmk === "34.3") continue
    if (currentMk === "SIF318" && currentCpmk === "CPMK33" && kodeSubCpmk === "34.3") continue

    const subKey = `${currentMk}:${currentCpmk}:${kodeSubCpmk}`
    if (seenSub.has(subKey)) continue
    seenSub.add(subKey)

    subCpmks.push({ kodeMk: currentMk, kodeCpmk: currentCpmk, kodeSubCpmk, deskripsi })
  }

  const courseByName = new Map(courses.map((item) => [item.nama_id.toLowerCase(), item.kode]))
  const methodNames = ["Kuis", "Tugas Teori (Individu)", "Unjuk Kerja (Presentasi)", "Tes Tulis (UTS)", "Tes Tulis (UAS)", "Tugas Teori (Kelompok)", "Tugas Praktikum", "Responsi", "Partisipasi"]
  const methodMap = new Map<string, Set<string>>()
  for (const row of rows(workbook, "T17 PenilaianCPMK").slice(2)) {
    const kodeMk = courseByName.get(cleanCourseName(text(row[1]).split("/")[0]).toLowerCase())
    const kodeCpmk = canonicalCpmk(row[2])
    if (!kodeMk || !kodeCpmk) continue
    const key = `${kodeMk}:${kodeCpmk}`
    const methods = methodMap.get(key) ?? new Set<string>()
    methodNames.forEach((name, index) => { if (text(row[3 + index]) === "✓") methods.add(name) })
    methodMap.set(key, methods)
  }
  const cpmkAssessmentMethods = [...methodMap.entries()].map(([key, methods]) => {
    const [kodeMk, kodeCpmk] = key.split(":")
    return { kodeMk, kodeCpmk, metode: [...methods].join(", ") }
  }).filter((item) => item.metode)

  const assessments: AssessmentInput[] = []
  currentMk = ""
  currentCpmk = ""
  let currentSubCpmk = ""
  for (const row of rows(workbook, "T18a BobotPen").slice(1)) {
    const possibleMk = text(row[0])
    if (/^TOTAL/i.test(possibleMk)) {
      currentMk = ""
      currentCpmk = ""
      currentSubCpmk = ""
      continue
    }
    if (possibleMk) {
      currentMk = possibleMk
      currentCpmk = ""
      currentSubCpmk = ""
    }
    if (text(row[3])) currentCpmk = canonicalCpmk(row[3])
    if (text(row[4])) currentSubCpmk = canonicalSubCpmk(row[4])
    const nama = text(row[5])
    const bobot = number(row[6])
    if (currentMk && currentCpmk && currentSubCpmk && nama && bobot > 0) {
      assessments.push({
        kodeMk: currentMk,
        kodeCpmk: currentCpmk,
        kodeSubCpmk: currentSubCpmk,
        nama,
        bobot,
        kriteria: text(row[7]),
      })
    }
  }

  const courseCodes = new Set(courses.map((item) => item.kode))
  const orphanMappings = courseCpmks.filter((item) => !courseCodes.has(item.kodeMk))
  if (orphanMappings.length > 0) warnings.push(`${orphanMappings.length} pemetaan CPMK merujuk kode MK yang tidak ditemukan di T9.`)
  const orphanSubs = subCpmks.filter((item) => !courseCodes.has(item.kodeMk))
  if (orphanSubs.length > 0) warnings.push(`${orphanSubs.length} Sub-CPMK merujuk kode MK yang tidak ditemukan di T9.`)
  const missingCpmkDescriptions = courseCpmks.filter((item) => !cpmkDescriptions.has(item.kodeCpmk))
  if (missingCpmkDescriptions.length > 0) {
    warnings.push(`${missingCpmkDescriptions.length} pemetaan CPMK belum memiliki rumusan pada T12b.`)
  }
  const orphanAssessments = assessments.filter((item) => !courseCodes.has(item.kodeMk))
  if (orphanAssessments.length > 0) {
    warnings.push(`${orphanAssessments.length} rincian asesmen merujuk kode MK yang tidak ditemukan di T9.`)
  }

  if (cpls.length === 0 || courses.length === 0 || courseCpmks.length === 0) {
    throw new Error("Struktur workbook terbaca, tetapi data inti CPL, mata kuliah, atau pemetaan CPMK kosong.")
  }

  const assessmentCourseCodes = new Set(assessments.map((item) => item.kodeMk))
  const coursesWithoutAssessments = courses.filter((item) => !assessmentCourseCodes.has(item.kode))
  if (coursesWithoutAssessments.length > 0) {
    warnings.push(`${coursesWithoutAssessments.length} mata kuliah belum memiliki rincian bobot penilaian pada T18a.`)
  }

  return { cpls, courses, cpmkDescriptions, courseCpmks, cpmkAssessmentMethods, subCpmks, assessments, warnings }
}

export async function importOperationalWorkbook(formData: FormData): Promise<OperationalImportResult> {
  const session = await getCurrentSession()
  if (!session?.user || !["SUPER_ADMIN", "KAPRODI"].includes(session.user.role)) {
    return { success: false, message: "Hanya Kaprodi atau Super Admin yang dapat mengimpor kurikulum." }
  }

  const file = formData.get("file") as File | null
  const commit = formData.get("mode") === "commit"
  const scope: ImportScope = formData.get("scope") === "full" ? "full" : "templates"
  if (!file || file.size === 0) return { success: false, message: "Pilih file workbook terlebih dahulu." }

  try {
    const workbookBuffer = await file.arrayBuffer()
    const workbook = XLSX.read(workbookBuffer, { type: "array", cellDates: true })
    const plotting = parsePlottingWorkbook(workbook)
    if (plotting) {
      const uniqueCourses = new Set(plotting.map((item) => item.kodeMk))
      const uniqueLecturers = new Set(plotting.map((item) => item.namaDosen))
      const summary = { cpls: 0, courses: uniqueCourses.size, courseCpmks: plotting.length, subCpmks: uniqueLecturers.size, assessments: 0 }
      const warnings: string[] = []
      const termCode = "2026/2027-1"
      const term = await db.query.tahunAkademik.findFirst({ where: eq(tahunAkademik.kode, termCode) })
      if (!term) return { success: false, message: `Tahun akademik ${termCode} belum tersedia di SIPEKA.` }
      const allCourses = await db.select({ id: mataKuliah.id, kode: mataKuliah.kode }).from(mataKuliah)
      const courseByCode = new Map(allCourses.map((item) => [item.kode, item.id]))
      const allUsers = await db.select({ id: users.id, email: users.email, nama: users.nama_lengkap, role: users.role }).from(users)
      const userByName = new Map(allUsers.map((item) => [item.nama.toLowerCase(), item]))
      const emailByName: Record<string, string> = {
        "Haris Rafi": "haris.rafi@bakrie.ac.id",
        "Kenny Badjora Lubis": "kenny.lubis@bakrie.ac.id",
        "Zakiul Fahmi Jailani": "zakiul.jailani@bakrie.ac.id",
        "Siti Rohajawati": "siti.rohajawati@bakrie.ac.id",
        "Dewi Fatmawati Surianto": "dewi.surianto@bakrie.ac.id",
        "Dita Nurmadewi": "dita.nurmadewi@bakrie.ac.id",
        "Shidiq Al Hakim": "shidiq.alhakim@bakrie.ac.id",
        "Elin Cahyaningsih": "elin.cahyaningsih@bakrie.ac.id",
        "Hoga Saragih": "hoga.saragih@bakrie.ac.id",
        "Benrahman": "benrahman@bakrie.ac.id",
        "Albert A. Sembiring": "albert.sembiring@bakrie.ac.id",
      }
      const userByPlotName = new Map<string, string>()
      for (const name of uniqueLecturers) {
        const existing = [...allUsers].find((item) => item.nama.toLowerCase().includes(name.toLowerCase()))
        if (existing) {
          await db.update(users).set({ nama_lengkap: name, is_active: true, updated_at: new Date() }).where(eq(users.id, existing.id))
          userByPlotName.set(name, existing.id)
          continue
        }
        const email = emailByName[name] ?? `${name.toLowerCase().replace(/[^a-z0-9]+/g, ".")}@bakrie.ac.id`
        const [created] = await db.insert(users).values({ email, nama_lengkap: name, role: "DOSEN", is_active: true, updated_at: new Date() }).onConflictDoUpdate({ target: users.email, set: { nama_lengkap: name, role: "DOSEN", is_active: true, updated_at: new Date() } }).returning({ id: users.id })
        userByPlotName.set(name, created.id)
      }
      const missingCourses = new Set<string>()
      for (const item of plotting) {
        const mkId = courseByCode.get(item.kodeMk)
        const dosenId = userByPlotName.get(item.namaDosen)
        if (!mkId || !dosenId) { if (!mkId) missingCourses.add(item.kodeMk); continue }
        const kelas = plottingClass(item.kodeKelas.split(" - ")[1] || "A")
        const existingAssignments = await db.query.dosirMk.findMany({ where: and(eq(dosirMk.mk_id, mkId), eq(dosirMk.tahun_akademik_id, term.id)) })
        const existingAssignment = existingAssignments.find((assignment) => assignment.kelas === kelas) ?? existingAssignments[0]
        if (existingAssignment) {
          await db.update(dosirMk).set({ dosen_id: dosenId, is_active: true }).where(eq(dosirMk.id, existingAssignment.id))
        } else {
          const legacyAssignment = await db.query.dosirMk.findFirst({ where: eq(dosirMk.mk_id, mkId) })
          if (legacyAssignment) {
            await db.update(dosirMk).set({ dosen_id: dosenId, tahun_akademik_id: term.id, is_active: true }).where(eq(dosirMk.id, legacyAssignment.id))
          } else {
            warnings.push(`Penugasan ${item.kodeMk} (${kelas}) belum dapat dibuat karena constraint lama pada database.`)
          }
        }
      }
      if (missingCourses.size > 0) warnings.push(`Kode MK belum ditemukan: ${[...missingCourses].join(", ")}.`)
      revalidatePath("/master/users")
      revalidatePath("/master/dosir-mk")
      revalidatePath("/dashboard")
      return { success: true, message: `Data plotting berhasil diperbarui: ${uniqueLecturers.size} dosen dan ${plotting.length - missingCourses.size} penugasan untuk Ganjil 2026/2027.`, summary, warnings }
    }

    const parsed = await parseWorkbook(workbookBuffer)
    const summary = {
      cpls: parsed.cpls.length,
      courses: parsed.courses.length,
      courseCpmks: parsed.courseCpmks.length,
      subCpmks: parsed.subCpmks.length,
      assessments: parsed.assessments.length,
    }

    if (!commit) {
      return {
        success: true,
        message: scope === "templates"
          ? "Workbook berhasil divalidasi. Siap mengimpor template CPMK dan Sub-CPMK tanpa mengubah master mata kuliah."
          : "Workbook berhasil divalidasi. Belum ada data yang disimpan.",
        summary,
        warnings: parsed.warnings,
      }
    }

    // neon-http does not support Drizzle transactions; keep the import on the same
    // database facade so it also works in the deployed server action.
    await (async (tx: typeof db) => {
      const cplByCode = new Map<string, string>()
      if (scope === "templates") {
        const existingCpls = await tx.select({ id: cpl.id, kode: cpl.kode }).from(cpl)
        existingCpls.forEach((item) => cplByCode.set(item.kode, item.id))
      } else {
        for (const [index, item] of parsed.cpls.entries()) {
          const [saved] = await tx.insert(cpl).values({
            kode: item.kode,
            slug: item.kode.toLowerCase(),
            domain: domainFromCategory(item.kategori),
            rumusan: item.rumusan,
            urutan: index + 1,
            is_active: true,
            updated_at: new Date(),
          }).onConflictDoUpdate({
            target: cpl.kode,
            set: {
              domain: domainFromCategory(item.kategori),
              rumusan: item.rumusan,
              urutan: index + 1,
              is_active: true,
              updated_at: new Date(),
            },
          }).returning()
          cplByCode.set(item.kode, saved.id)
        }
      }

      const courseByCode = new Map<string, string>()
      if (scope === "templates") {
        const existingCourses = await tx.select({ id: mataKuliah.id, kode: mataKuliah.kode }).from(mataKuliah)
        existingCourses.forEach((item) => courseByCode.set(item.kode, item.id))
      } else {
        for (const item of parsed.courses) {
          const [saved] = await tx.insert(mataKuliah).values({
            kode: item.kode,
            nama_id: item.nama_id,
            nama_en: item.nama_en,
            sks_teori: item.sks_teori,
            sks_praktik: item.sks_praktik,
            semester_rekomendasi: item.semester,
            status: item.status,
            track: "UMUM",
            tipe_aktivitas: item.sks_praktik > 0 ? "TEORI_PRAKTIKUM" : "TEORI",
            has_praktikum: item.sks_praktik > 0,
            is_pbl: item.isPbl,
            is_active: true,
            updated_at: new Date(),
          }).onConflictDoUpdate({
            target: mataKuliah.kode,
            set: {
              nama_id: item.nama_id,
              nama_en: item.nama_en,
              sks_teori: item.sks_teori,
              sks_praktik: item.sks_praktik,
              semester_rekomendasi: item.semester,
              status: item.status,
              tipe_aktivitas: item.sks_praktik > 0 ? "TEORI_PRAKTIKUM" : "TEORI",
              has_praktikum: item.sks_praktik > 0,
              is_pbl: item.isPbl,
              is_active: true,
              updated_at: new Date(),
            },
          }).returning()
          courseByCode.set(item.kode, saved.id)
        }
      }

      const importedMkIds = [...new Set(parsed.courseCpmks.map((item) => courseByCode.get(item.kodeMk)).filter(Boolean))] as string[]
      if (importedMkIds.length > 0) {
        if (scope === "full") {
          await tx.delete(assessmentTemplate).where(inArray(assessmentTemplate.mk_id, importedMkIds))
        }
        await tx.delete(cpmkTemplate).where(inArray(cpmkTemplate.mk_id, importedMkIds))
        if (scope === "full") {
          await tx.delete(petaKurikulum).where(inArray(petaKurikulum.mk_id, importedMkIds))
        }
      }

      const cpmkTemplateByKey = new Map<string, string>()
      const cpmkOrderByCourse = new Map<string, number>()
      const seenCpmkByCourse = new Set<string>()
      const cpmkRows: Array<typeof cpmkTemplate.$inferInsert> = []
      const cpmkKeys: string[] = []
      for (const item of parsed.courseCpmks) {
        const mkId = courseByCode.get(item.kodeMk)
        const cplId = cplByCode.get(item.kodeCpl)
        const description = parsed.cpmkDescriptions.get(item.kodeCpmk)
        if (!mkId || !cplId || !description) continue
        const templateKey = `${item.kodeMk}:${item.kodeCpmk}`
        if (seenCpmkByCourse.has(templateKey)) continue
        seenCpmkByCourse.add(templateKey)
        const order = (cpmkOrderByCourse.get(item.kodeMk) ?? 0) + 1
        cpmkOrderByCourse.set(item.kodeMk, order)
        cpmkKeys.push(templateKey)
        cpmkRows.push({ mk_id: mkId, cpl_id: cplId, kode: item.kodeCpmk, deskripsi: description, metode_pencapaian: parsed.cpmkAssessmentMethods.find((method) => method.kodeMk === item.kodeMk && method.kodeCpmk === item.kodeCpmk)?.metode || null, urutan: order, is_active: true, updated_at: new Date() })
        if (scope === "full") await tx.insert(petaKurikulum).values({ mk_id: mkId, cpl_id: cplId, bobot: 1 }).onConflictDoNothing()
      }

      const savedCpmks = cpmkRows.length > 0
        ? await tx.insert(cpmkTemplate).values(cpmkRows).returning()
        : []
      savedCpmks.forEach((saved, index) => cpmkTemplateByKey.set(cpmkKeys[index], saved.id))

      const subOrderByCpmk = new Map<string, number>()
      const subRows: Array<typeof subCpmkTemplate.$inferInsert> = []
      const subKeys: string[] = []
      const subTemplateByKey = new Map<string, string>()
      for (const item of parsed.subCpmks) {
        const templateId = cpmkTemplateByKey.get(`${item.kodeMk}:${item.kodeCpmk}`)
        if (!templateId) continue
        const orderKey = `${item.kodeMk}:${item.kodeCpmk}`
        const order = (subOrderByCpmk.get(orderKey) ?? 0) + 1
        subKeys.push(`${item.kodeMk}:${item.kodeSubCpmk}`)
        subOrderByCpmk.set(orderKey, order)
        subRows.push({ cpmk_template_id: templateId, kode: item.kodeSubCpmk, deskripsi: item.deskripsi, level_bloom: "C3", urutan: order, updated_at: new Date() })
      }
      if (subRows.length > 0) {
        const savedSubs = await tx.insert(subCpmkTemplate).values(subRows).returning()
        savedSubs.forEach((saved, index) => subTemplateByKey.set(subKeys[index], saved.id))
      }

      if (scope === "full") {
        const assessmentGroups = new Map<string, AssessmentInput[]>()
        for (const item of parsed.assessments) {
          const group = assessmentGroups.get(item.kodeMk) ?? []
          group.push(item)
          assessmentGroups.set(item.kodeMk, group)
        }
        for (const [kodeMk, items] of assessmentGroups) {
          const mkId = courseByCode.get(kodeMk)
          if (!mkId) continue
          for (const [index, item] of items.entries()) {
            await tx.insert(assessmentTemplate).values({
              mk_id: mkId,
              cpmk_template_id: cpmkTemplateByKey.get(`${kodeMk}:${item.kodeCpmk}`) || null,
              sub_cpmk_template_id: subTemplateByKey.get(`${kodeMk}:${item.kodeSubCpmk}`) || null,
              nama: item.nama,
              tipe: item.nama,
              bobot: item.bobot,
              kriteria_penilaian: item.kriteria || null,
              urutan: index + 1,
              is_active: true,
            })
          }
        }
      }
    })(db)

    revalidatePath("/dashboard")
    revalidatePath("/rps")
    revalidatePath("/master/mata-kuliah")
    revalidatePath("/master/cpl")

    return {
      success: true,
      message: scope === "templates"
        ? "Template CPMK dan Sub-CPMK berhasil diimpor tanpa mengubah master mata kuliah atau CPL."
        : "Kurikulum operasional berhasil diimpor sebagai master dan template RPS.",
      summary,
      warnings: parsed.warnings,
    }
  } catch (error) {
    console.error(error)
    return { success: false, message: error instanceof Error ? error.message : "Import workbook gagal." }
  }
}
