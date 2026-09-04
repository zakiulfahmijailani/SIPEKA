import { inArray } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"
import { db } from "./index"
import { cpl, cpmkTemplate, mataKuliah, subCpmkTemplate } from "./schema"
import {
  CURRICULUM_2026_CPMK,
  CURRICULUM_2026_MK_CPMK_MAPPINGS,
} from "./cpmk-2026-reference"

export async function syncCpmkTemplates() {
  console.log("=== Memulai Sinkronisasi Template CPMK dan Sub-CPMK ===")
  const startTime = performance.now()

  // 1. Ambil data master MK dan CPL
  const [allCourses, allCpls] = await Promise.all([
    db.select({ id: mataKuliah.id, kode: mataKuliah.kode }).from(mataKuliah),
    db.select({ id: cpl.id, kode: cpl.kode }).from(cpl),
  ])

  const courseByCode = new Map(allCourses.map((c) => [c.kode, c.id]))
  const cplByCode = new Map(allCpls.map((c) => [c.kode, c.id]))
  const cpmkDescByCode = new Map(CURRICULUM_2026_CPMK.map((c) => [c.kode, c.rumusan]))

  // 2. Kumpulkan seluruh MK yang ada di mapping baru + MK yang dikosongkan
  const mappedCourseCodes = [...new Set(CURRICULUM_2026_MK_CPMK_MAPPINGS.map((m) => m.kode_mk))]
  const emptyCourseCodes = ["SIF911", "SIF912", "SIF906", "SIF611", "UNI102"]
  const allTargetCourseCodes = [...mappedCourseCodes, ...emptyCourseCodes]

  const targetMkIds = allTargetCourseCodes
    .map((code) => courseByCode.get(code))
    .filter(Boolean) as string[]

  // 3. Bersihkan template lama untuk mata kuliah target
  if (targetMkIds.length > 0) {
    await db.delete(cpmkTemplate).where(inArray(cpmkTemplate.mk_id, targetMkIds))
  }

  // 4. Bangun data insert untuk cpmk_template & sub_cpmk_template
  type GroupedCpmk = {
    mk_id: string
    cpl_id: string
    kode: string
    deskripsi: string
    urutan: number
    subs: Array<{ kode: string; deskripsi: string; urutan: number }>
  }

  const groupedByCourse = new Map<string, Map<string, GroupedCpmk>>()

  for (const m of CURRICULUM_2026_MK_CPMK_MAPPINGS) {
    const mkId = courseByCode.get(m.kode_mk)
    const cplId = cplByCode.get(m.cpl_kode)
    if (!mkId || !cplId) continue

    if (!groupedByCourse.has(m.kode_mk)) {
      groupedByCourse.set(m.kode_mk, new Map())
    }
    const cpmkMap = groupedByCourse.get(m.kode_mk)!

    if (!cpmkMap.has(m.cpmk_kode)) {
      cpmkMap.set(m.cpmk_kode, {
        mk_id: mkId,
        cpl_id: cplId,
        kode: m.cpmk_kode,
        deskripsi: cpmkDescByCode.get(m.cpmk_kode) || `Mampu menguasai capaian ${m.cpmk_kode}`,
        urutan: cpmkMap.size + 1,
        subs: [],
      })
    }

    const cpmkEntry = cpmkMap.get(m.cpmk_kode)!
    cpmkEntry.subs.push({
      kode: m.sub_kode,
      deskripsi: m.uraian,
      urutan: cpmkEntry.subs.length + 1,
    })
  }

  // 5. Lakukan batch insert secara bertahap
  let totalCpmkInserted = 0
  let totalSubInserted = 0

  for (const [, cpmkMap] of groupedByCourse.entries()) {
    const cpmkInserts: (typeof cpmkTemplate.$inferInsert)[] = []
    const subInserts: (typeof subCpmkTemplate.$inferInsert)[] = []

    for (const item of cpmkMap.values()) {
      const templateId = createId()
      cpmkInserts.push({
        id: templateId,
        mk_id: item.mk_id,
        cpl_id: item.cpl_id,
        kode: item.kode,
        deskripsi: item.deskripsi,
        urutan: item.urutan,
        is_active: true,
      })

      for (const sub of item.subs) {
        subInserts.push({
          id: createId(),
          cpmk_template_id: templateId,
          kode: sub.kode,
          deskripsi: sub.deskripsi,
          level_bloom: "C3",
          urutan: sub.urutan,
        })
      }
    }

    if (cpmkInserts.length > 0) {
      await db.insert(cpmkTemplate).values(cpmkInserts)
      totalCpmkInserted += cpmkInserts.length
    }

    if (subInserts.length > 0) {
      const CHUNK_SIZE = 50
      for (let i = 0; i < subInserts.length; i += CHUNK_SIZE) {
        await db.insert(subCpmkTemplate).values(subInserts.slice(i, i + CHUNK_SIZE))
      }
      totalSubInserted += subInserts.length
    }
  }

  const durationMs = Math.round(performance.now() - startTime)
  console.log(`=== Selesai Sinkronisasi Template CPMK (${durationMs}ms) ===`)
  console.log(`Mata Kuliah Diperbarui: ${groupedByCourse.size}`)
  console.log(`Mata Kuliah Dikosongkan: ${emptyCourseCodes.length}`)
  console.log(`Total Template CPMK: ${totalCpmkInserted}`)
  console.log(`Total Template Sub-CPMK: ${totalSubInserted}`)

  return {
    success: true,
    coursesUpdated: groupedByCourse.size,
    coursesEmpty: emptyCourseCodes.length,
    totalCpmk: totalCpmkInserted,
    totalSubCpmk: totalSubInserted,
    durationMs,
  }
}
