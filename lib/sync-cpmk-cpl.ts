import { and, asc, eq, inArray, notInArray } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"
import { db } from "@/db"
import {
  cpmk,
  cpmkCpl,
  cpmkTemplate,
  dosirMk,
  petaKurikulum,
  rps,
  subCpmk,
} from "@/db/schema"

export interface RpsSyncResult {
  rpsId: string
  mkKode?: string
  updatedCpmks: Array<{
    cpmkKode: string
    cpmkId: string
    addedCpls: string[]
    removedCpls: string[]
  }>
  removedInvalidCpls: string[]
  addedMissingCpmks: string[]
  success: boolean
}

/**
 * Synchronize CPMK-CPL mappings for a single RPS against the master `cpmk_template`
 * and course `peta_kurikulum`.
 *
 * Rules:
 * 1. Master `cpmk_template` is the source of truth for CPMK-to-CPL mappings.
 * 2. Course `peta_kurikulum` is the source of truth for valid CPLs of that course.
 * 3. Any CPMK-CPL mapping referencing a CPL not in the course's `peta_kurikulum`
 *    is invalid and must be removed (e.g. CPL04 on FTK121).
 * 4. Existing CPMK descriptions, sub-CPMKs, meetings, and assessment links are preserved.
 * 5. Unique constraint on `cpmk_cpl(cpmk_id, cpl_id)` is strictly respected.
 */
export async function syncRpsCpmkCpl(
  rpsId: string,
  customDb?: typeof db
): Promise<RpsSyncResult> {
  const client = customDb || db

  const result: RpsSyncResult = {
    rpsId,
    updatedCpmks: [],
    removedInvalidCpls: [],
    addedMissingCpmks: [],
    success: false,
  }

  // 1. Fetch RPS with dosir and course
  const targetRps = await client.query.rps.findFirst({
    where: eq(rps.id, rpsId),
    with: {
      dosirMk: {
        with: {
          mk: true,
        },
      },
    },
  })

  if (!targetRps || !targetRps.dosirMk?.mk_id) {
    return result
  }

  const mkId = targetRps.dosirMk.mk_id
  const mkKode = targetRps.dosirMk.mk.kode
  result.mkKode = mkKode

  // 2. Fetch valid CPLs for this course from peta_kurikulum
  const coursePeta = await client.query.petaKurikulum.findMany({
    where: eq(petaKurikulum.mk_id, mkId),
    with: { cpl: true },
  })
  const validCourseCplIds = new Set(coursePeta.map((p) => p.cpl_id))
  const courseCplById = new Map(coursePeta.map((p) => [p.cpl.id, p.cpl]))

  // 3. Fetch active master CPMK templates for this course
  const templates = await client.query.cpmkTemplate.findMany({
    where: and(eq(cpmkTemplate.mk_id, mkId), eq(cpmkTemplate.is_active, true)),
    orderBy: [asc(cpmkTemplate.urutan)],
    with: { subCpmks: true, cpl: true },
  })

  // Map template kode -> template row
  const templateByKode = new Map(templates.map((t) => [t.kode, t]))

  // 4. Fetch existing CPMKs in the RPS with their cpmk_cpl mappings
  const existingCpmks = await client.query.cpmk.findMany({
    where: eq(cpmk.rps_id, rpsId),
    orderBy: [asc(cpmk.urutan)],
    with: {
      cplMappings: { with: { cpl: true } },
      subCpmks: true,
    },
  })

  // 5. If RPS is completely empty of CPMKs, populate from templates
  if (existingCpmks.length === 0 && templates.length > 0) {
    for (const tmpl of templates) {
      const newCpmkId = createId()
      await client.insert(cpmk).values({
        id: newCpmkId,
        rps_id: rpsId,
        kode: tmpl.kode,
        deskripsi: tmpl.deskripsi,
        metode_pencapaian: tmpl.metode_pencapaian || "Tatap muka, diskusi, dan latihan terstruktur",
        urutan: tmpl.urutan,
      })

      if (tmpl.cpl_id && validCourseCplIds.has(tmpl.cpl_id)) {
        await client
          .insert(cpmkCpl)
          .values({ cpmk_id: newCpmkId, cpl_id: tmpl.cpl_id })
          .onConflictDoNothing()
      }

      if (tmpl.subCpmks?.length) {
        await client.insert(subCpmk).values(
          tmpl.subCpmks.map((s) => ({
            id: createId(),
            cpmk_id: newCpmkId,
            kode: s.kode,
            deskripsi: s.deskripsi,
            level_bloom: s.level_bloom,
            urutan: s.urutan,
          }))
        ).onConflictDoNothing()
      }

      result.addedMissingCpmks.push(tmpl.kode)
    }

    result.success = true
    return result
  }

  // 6. For each existing CPMK in the RPS, synchronize its CPL mapping
  for (const cpmkRow of existingCpmks) {
    const tmpl = templateByKode.get(cpmkRow.kode)
    const currentMappings = cpmkRow.cplMappings || []
    const currentCplIds = new Set(currentMappings.map((m) => m.cpl_id))

    // Determine target CPL ID:
    // If master template exists and specifies a cpl_id that is valid for this course, that is the target.
    let targetCplId: string | null = null
    if (tmpl?.cpl_id && validCourseCplIds.has(tmpl.cpl_id)) {
      targetCplId = tmpl.cpl_id
    }

    const added: string[] = []
    const removed: string[] = []

    // A. Remove mappings that are NOT valid for this course or NOT matching the master template target
    for (const mapping of currentMappings) {
      const isInvalidForCourse = !validCourseCplIds.has(mapping.cpl_id)
      const isDifferentFromMaster = targetCplId !== null && mapping.cpl_id !== targetCplId

      if (isInvalidForCourse || isDifferentFromMaster) {
        await client
          .delete(cpmkCpl)
          .where(
            and(
              eq(cpmkCpl.cpmk_id, cpmkRow.id),
              eq(cpmkCpl.cpl_id, mapping.cpl_id)
            )
          )
        removed.push(mapping.cpl?.kode || mapping.cpl_id)
      }
    }

    // B. Ensure the target CPL from master template is inserted
    if (targetCplId && !currentCplIds.has(targetCplId)) {
      await client
        .insert(cpmkCpl)
        .values({
          cpmk_id: cpmkRow.id,
          cpl_id: targetCplId,
        })
        .onConflictDoNothing()

      const targetCpl = courseCplById.get(targetCplId)
      added.push(targetCpl?.kode || targetCplId)
    }

    if (added.length > 0 || removed.length > 0) {
      result.updatedCpmks.push({
        cpmkKode: cpmkRow.kode,
        cpmkId: cpmkRow.id,
        addedCpls: added,
        removedCpls: removed,
      })
    }
  }

  // 7. Cleanup any stray cpmk_cpl records for this RPS where cpl_id is not in validCourseCplIds
  const cpmkIds = existingCpmks.map((c) => c.id)
  if (cpmkIds.length > 0) {
    if (validCourseCplIds.size > 0) {
      const strayMappings = await client.query.cpmkCpl.findMany({
        where: and(
          inArray(cpmkCpl.cpmk_id, cpmkIds),
          notInArray(cpmkCpl.cpl_id, Array.from(validCourseCplIds))
        ),
        with: { cpl: true },
      })

      if (strayMappings.length > 0) {
        await client
          .delete(cpmkCpl)
          .where(
            and(
              inArray(cpmkCpl.cpmk_id, cpmkIds),
              notInArray(cpmkCpl.cpl_id, Array.from(validCourseCplIds))
            )
          )
        result.removedInvalidCpls = strayMappings.map((s) => s.cpl?.kode || s.cpl_id)
      }
    }
  }

  result.success = true
  return result
}

/**
 * Synchronize all RPS records associated with a specific course (mk_id).
 */
export async function syncCourseRps(
  mkId: string,
  customDb?: typeof db
): Promise<RpsSyncResult[]> {
  const client = customDb || db

  const assignments = await client.query.dosirMk.findMany({
    where: eq(dosirMk.mk_id, mkId),
    with: {
      rps: true,
    },
  })

  const results: RpsSyncResult[] = []

  for (const assignment of assignments) {
    for (const rpsRecord of assignment.rps || []) {
      const res = await syncRpsCpmkCpl(rpsRecord.id, client)
      results.push(res)
    }
  }

  return results
}

/**
 * Audit and synchronize ALL existing RPS across all courses in the database.
 */
export async function auditAndSyncAllRps(
  customDb?: typeof db
): Promise<{
  totalRpsChecked: number
  totalRpsFixed: number
  results: RpsSyncResult[]
}> {
  const client = customDb || db

  const allRps = await client.query.rps.findMany({
    columns: { id: true },
  })

  const results: RpsSyncResult[] = []
  let totalFixed = 0

  for (const rpsRecord of allRps) {
    const res = await syncRpsCpmkCpl(rpsRecord.id, client)
    results.push(res)
    if (res.updatedCpmks.length > 0 || res.removedInvalidCpls.length > 0 || res.addedMissingCpmks.length > 0) {
      totalFixed++
    }
  }

  return {
    totalRpsChecked: allRps.length,
    totalRpsFixed: totalFixed,
    results,
  }
}
