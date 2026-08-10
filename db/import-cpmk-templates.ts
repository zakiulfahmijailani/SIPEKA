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
import { findRedT15Rows } from "../lib/t15-workbook"

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

const sheetRows = (workbook: XLSX.WorkBook, name: string) => {
  const sheet = workbook.Sheets[name]
  if (!sheet) throw new Error(`Sheet ${name} tidak ditemukan.`)
  return XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: null, raw: true })
}

async function parseWorkbook(filePath: string) {
  const buffer = await (await import("node:fs/promises")).readFile(filePath)
  const workbook = XLSX.read(buffer, { type: "buffer" })
  const redRows = await findRedT15Rows(buffer)
  const cpmkDescriptions = new Map<string, string>()
  for (const row of sheetRows(workbook, "T12b CPL-CPMK-MK").slice(1)) {
    const kode = canonicalCpmk(row[4])
    const deskripsi = text(row[5])
    if (kode && deskripsi) cpmkDescriptions.set(kode, deskripsi)
  }

  const subCpmks: SubCpmk[] = []
  const courseCpmkKeys = new Set<string>()
  const cplByCpmk = new Map<string, string>()
  let currentCpl = ""
  for (const row of sheetRows(workbook, "T12b CPL-CPMK-MK").slice(1)) {
    if (text(row[1])) currentCpl = text(row[1])
    const kodeCpmk = canonicalCpmk(row[4])
    if (currentCpl && kodeCpmk) cplByCpmk.set(kodeCpmk, currentCpl)
  }
  let currentMk = ""
  let currentCpmk = ""
  const removedCpmks = new Set<string>()
  const t15Rows = sheetRows(workbook, "T15 MK-CPMK-SubCPMK-OK").slice(1)
  for (const [index, row] of t15Rows.entries()) {
    const sheetRow = index + 2
    if (text(row[1])) currentMk = text(row[1])
    if (text(row[3])) currentCpmk = canonicalCpmk(row[3])
    const cpmkKey = `${currentMk}:${currentCpmk}`
    if (text(row[3]) && redRows.cpmkRows.has(sheetRow)) removedCpmks.add(cpmkKey)
    if (currentMk && currentCpmk && !removedCpmks.has(cpmkKey)) courseCpmkKeys.add(cpmkKey)
    if (removedCpmks.has(cpmkKey)) continue
    const kodeSubCpmk = canonicalCpmk(row[4])
    const deskripsi = text(row[5])
    if (!redRows.subCpmkRows.has(sheetRow) && currentMk && currentCpmk && kodeSubCpmk && deskripsi) {
      subCpmks.push({ kodeMk: currentMk, kodeCpmk: currentCpmk, kodeSubCpmk, deskripsi })
    }
  }
  const courseCpmks: CourseCpmk[] = [...courseCpmkKeys].flatMap((key) => {
    const [kodeMk, kodeCpmk] = key.split(":")
    const kodeCpl = cplByCpmk.get(kodeCpmk)
    return kodeCpl ? [{ kodeMk, kodeCpl, kodeCpmk }] : []
  })

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
