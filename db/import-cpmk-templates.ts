/**
 * Import template CPMK dan Sub-CPMK dari workbook kurikulum operasional.
 *
 * Pemakaian:
 *   npx tsx db/import-cpmk-templates.ts "C:\\path\\workbook.xlsx" --dry-run
 *   npx tsx db/import-cpmk-templates.ts "C:\\path\\workbook.xlsx" --commit
 *
 * Hanya tabel cpmk_template dan sub_cpmk_template yang diubah. Master CPL,
 * mata kuliah, peta kurikulum, dan template asesmen tidak disentuh.
 */
import * as XLSX from "xlsx"
import { inArray } from "drizzle-orm"

import { cpl, cpmkTemplate, mataKuliah, subCpmkTemplate } from "./schema"

type CourseCpmk = {
  kodeMk: string
  kodeCpl: string
  kodeCpmk: string
}

type SubCpmk = {
  kodeMk: string
  kodeCpmk: string
  kodeSubCpmk: string
  deskripsi: string
}

const text = (value: unknown) => String(value ?? "").trim()

const canonicalCpmk = (value: unknown) => {
  const normalized = text(value).toUpperCase().replace(/\s+/g, "")
  if (!normalized) return ""
  return normalized.startsWith("CPMK") ? normalized : `CPMK${normalized}`
}

const canonicalSubCpmk = (value: unknown) => {
  const normalized = text(value).replace(/\s+/g, "")
  if (!normalized) return ""
  return normalized.replace(/^CPMK/i, "")
}

const sheetRows = (workbook: XLSX.WorkBook, name: string) => {
  const sheet = workbook.Sheets[name]
  if (!sheet) throw new Error(`Sheet ${name} tidak ditemukan.`)
  return XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: null, raw: true })
}

const EMPTY_COURSES = new Set(["SIF911", "SIF912", "SIF906", "SIF611", "UNI102"])

async function parseWorkbook(filePath: string) {
  const buffer = await (await import("node:fs/promises")).readFile(filePath)
  const workbook = XLSX.read(buffer, { type: "buffer" })
  const cpmkDescriptions = new Map<string, string>()
  for (const row of sheetRows(workbook, "T12b CPL-CPMK-MK").slice(1)) {
    const kode = canonicalCpmk(row[4])
    const deskripsi = text(row[5])
    if (kode && deskripsi) cpmkDescriptions.set(kode, deskripsi)
  }

  // Parse T14 CPL-MK-CPMK-OK for accurate Course -> CPL -> CPMK mappings
  const courseCpmks: CourseCpmk[] = []
  const validCpmkByCourse = new Map<string, Set<string>>()
  const seenCourseCpmk = new Set<string>()

  const t14Rows = sheetRows(workbook, "T14 CPL-MK-CPMK-OK")
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
  const subCpmks: SubCpmk[] = []
  const seenSub = new Set<string>()
  let currentMk = ""
  let currentCpmk = ""
  const t15Rows = sheetRows(workbook, "T15 MK-CPMK-SubCPMK-OK").slice(1)
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

  return { cpmkDescriptions, courseCpmks, subCpmks }
}

async function main() {
  const [filePath, mode] = process.argv.slice(2)
  if (!filePath || !["--dry-run", "--commit"].includes(mode)) {
    throw new Error("Gunakan: npx tsx db/import-cpmk-templates.ts <workbook.xlsx> --dry-run|--commit")
  }

  const parsed = await parseWorkbook(filePath)
  const cpmkWithDescriptions = parsed.courseCpmks.filter((item) => parsed.cpmkDescriptions.has(item.kodeCpmk))
  const mappedCourseCodes = [...new Set(cpmkWithDescriptions.map((item) => item.kodeMk))]
  const pti = cpmkWithDescriptions.filter((item) => item.kodeMk === "SIF101")
  const ptiSubs = parsed.subCpmks.filter((item) => item.kodeMk === "SIF101" && pti.some((cpmk) => cpmk.kodeCpmk === item.kodeCpmk))

  console.info(JSON.stringify({
    mode,
    source: { cpmkMappings: parsed.courseCpmks.length, subCpmks: parsed.subCpmks.length },
    target: { courses: mappedCourseCodes.length, cpmkTemplates: cpmkWithDescriptions.length },
    sif101: { cpmk: pti.map((item) => item.kodeCpmk), subCpmkCount: ptiSubs.length },
  }, null, 2))

  if (mode === "--dry-run") return

  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL belum tersedia untuk impor produksi.")

  const { db } = await import("./index")

  const [existingCourses, existingCpls] = await Promise.all([
    db.select({ id: mataKuliah.id, kode: mataKuliah.kode }).from(mataKuliah),
    db.select({ id: cpl.id, kode: cpl.kode }).from(cpl),
  ])
  const courseByCode = new Map(existingCourses.map((item) => [item.kode, item.id]))
  const cplByCode = new Map(existingCpls.map((item) => [item.kode, item.id]))
  const importable = cpmkWithDescriptions.filter((item) => courseByCode.has(item.kodeMk) && cplByCode.has(item.kodeCpl))
  const importCourseCodes = [...new Set(importable.map((item) => item.kodeMk))]
  const missingCourses = [...new Set(cpmkWithDescriptions.filter((item) => !courseByCode.has(item.kodeMk)).map((item) => item.kodeMk))]
  const missingCpls = [...new Set(cpmkWithDescriptions.filter((item) => !cplByCode.has(item.kodeCpl)).map((item) => item.kodeCpl))]

  await (async (tx: typeof db) => {
    const importedMkIds = importCourseCodes.map((kode) => courseByCode.get(kode)!).filter(Boolean)
    if (importedMkIds.length) await tx.delete(cpmkTemplate).where(inArray(cpmkTemplate.mk_id, importedMkIds))

    const templateByKey = new Map<string, string>()
    const orderByCourse = new Map<string, number>()
    const seen = new Set<string>()
    for (const item of importable) {
      const key = `${item.kodeMk}:${item.kodeCpmk}`
      if (seen.has(key)) continue
      seen.add(key)
      const order = (orderByCourse.get(item.kodeMk) ?? 0) + 1
      orderByCourse.set(item.kodeMk, order)
      const [saved] = await tx.insert(cpmkTemplate).values({
        mk_id: courseByCode.get(item.kodeMk)!,
        cpl_id: cplByCode.get(item.kodeCpl)!,
        kode: item.kodeCpmk,
        deskripsi: parsed.cpmkDescriptions.get(item.kodeCpmk)!,
        urutan: order,
        is_active: true,
        updated_at: new Date(),
      }).returning({ id: cpmkTemplate.id })
      templateByKey.set(key, saved.id)
    }

    const subOrderByCpmk = new Map<string, number>()
    let insertedSubCpmks = 0
    for (const item of parsed.subCpmks) {
      const templateId = templateByKey.get(`${item.kodeMk}:${item.kodeCpmk}`)
      if (!templateId) continue
      const orderKey = `${item.kodeMk}:${item.kodeCpmk}`
      const order = (subOrderByCpmk.get(orderKey) ?? 0) + 1
      subOrderByCpmk.set(orderKey, order)
      await tx.insert(subCpmkTemplate).values({
        cpmk_template_id: templateId,
        kode: item.kodeSubCpmk,
        deskripsi: item.deskripsi,
        level_bloom: "C3",
        urutan: order,
        updated_at: new Date(),
      })
      insertedSubCpmks += 1
    }

    console.info(JSON.stringify({
      imported: { courses: importCourseCodes.length, cpmkTemplates: templateByKey.size, subCpmkTemplates: insertedSubCpmks },
      skipped: { coursesMissingFromMaster: missingCourses, cplsMissingFromMaster: missingCpls },
    }, null, 2))
  })(db)
}

main().catch((error) => {
  const details = error instanceof Error ? error : new Error(String(error))
  const cause = details.cause as { name?: string, message?: string, code?: string } | undefined
  console.error(JSON.stringify({
    message: details.message,
    cause: cause ? { name: cause.name, message: cause.message, code: cause.code } : null,
  }, null, 2))
  process.exitCode = 1
})
