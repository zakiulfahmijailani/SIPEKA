"use server"

import * as XLSX from "xlsx"
import { inArray } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import { db } from "@/db"
import {
  assessmentTemplate,
  cpl,
  cpmkTemplate,
  mataKuliah,
  petaKurikulum,
  subCpmkTemplate,
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

const REQUIRED_SHEETS = [
  "T2 CPL",
  "T9 MK",
  "T12b CPL-CPMK-MK",
  "T14 CPL-MK-CPMK-OK",
  "T15 MK-CPMK-SubCPMK-OK",
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

function domainFromCategory(category: string) {
  if (category.startsWith("S")) return "SIKAP" as const
  if (category.startsWith("P")) return "PENGETAHUAN" as const
  if (category.startsWith("KU")) return "KETERAMPILAN_UMUM" as const
  return "KETERAMPILAN_KHUSUS" as const
}

function parseWorkbook(buffer: ArrayBuffer): ParsedWorkbook {
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

  const courseCpmks: CourseCpmkInput[] = []
  const t14 = rows(workbook, "T14 CPL-MK-CPMK-OK")
  const cplHeaders = (t14[1] || []).slice(2, 12).map((value) => text(value))
  for (const row of t14.slice(2)) {
    const kodeMk = text(row[0])
    if (!kodeMk) continue
    cplHeaders.forEach((kodeCpl, index) => {
      const codes = text(row[index + 2]).split(",").map(canonicalCpmk).filter(Boolean)
      for (const kodeCpmk of codes) courseCpmks.push({ kodeMk, kodeCpl, kodeCpmk })
    })
  }

  const subCpmks: SubCpmkInput[] = []
  let currentMk = ""
  let currentCpmk = ""
  for (const row of rows(workbook, "T15 MK-CPMK-SubCPMK-OK").slice(1)) {
    if (text(row[1])) currentMk = text(row[1])
    if (text(row[3])) currentCpmk = canonicalCpmk(row[3])
    const kodeSubCpmk = canonicalCpmk(row[4])
    const deskripsi = text(row[5])
    if (currentMk && currentCpmk && kodeSubCpmk && deskripsi) {
      subCpmks.push({ kodeMk: currentMk, kodeCpmk: currentCpmk, kodeSubCpmk, deskripsi })
    }
  }

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
    if (text(row[4])) currentSubCpmk = canonicalCpmk(row[4])
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

  return { cpls, courses, cpmkDescriptions, courseCpmks, subCpmks, assessments, warnings }
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
    const parsed = parseWorkbook(await file.arrayBuffer())
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

    await db.transaction(async (tx) => {
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

        if (scope === "full") {
          await tx.insert(petaKurikulum).values({ mk_id: mkId, cpl_id: cplId, bobot: 1 })
            .onConflictDoNothing()
        }

        const [saved] = await tx.insert(cpmkTemplate).values({
          mk_id: mkId,
          cpl_id: cplId,
          kode: item.kodeCpmk,
          deskripsi: description,
          urutan: order,
          is_active: true,
          updated_at: new Date(),
        }).onConflictDoUpdate({
          target: [cpmkTemplate.mk_id, cpmkTemplate.kode],
          set: { cpl_id: cplId, deskripsi: description, urutan: order, is_active: true, updated_at: new Date() },
        }).returning()
        cpmkTemplateByKey.set(`${item.kodeMk}:${item.kodeCpmk}`, saved.id)
      }

      const subTemplateByKey = new Map<string, string>()
      const subOrderByCpmk = new Map<string, number>()
      for (const item of parsed.subCpmks) {
        const templateId = cpmkTemplateByKey.get(`${item.kodeMk}:${item.kodeCpmk}`)
        if (!templateId) continue
        const orderKey = `${item.kodeMk}:${item.kodeCpmk}`
        const order = (subOrderByCpmk.get(orderKey) ?? 0) + 1
        subOrderByCpmk.set(orderKey, order)
        const [saved] = await tx.insert(subCpmkTemplate).values({
          cpmk_template_id: templateId,
          kode: item.kodeSubCpmk,
          deskripsi: item.deskripsi,
          level_bloom: "C3",
          urutan: order,
          updated_at: new Date(),
        }).onConflictDoUpdate({
          target: [subCpmkTemplate.cpmk_template_id, subCpmkTemplate.kode],
          set: { deskripsi: item.deskripsi, updated_at: new Date() },
        }).returning()
        subTemplateByKey.set(`${item.kodeMk}:${item.kodeSubCpmk}`, saved.id)
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
    })

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
