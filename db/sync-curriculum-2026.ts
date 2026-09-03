import { config } from "dotenv"
import { eq, inArray } from "drizzle-orm"

config({ path: ".env.local" })

import { db } from "./index"
import { CURRICULUM_2026_MATA_KULIAH } from "./curriculum-2026"
import {
  CURRICULUM_2026_CPL,
  CURRICULUM_2026_CPL_TO_MK,
  CURRICULUM_2026_PL_TO_CPL,
  CURRICULUM_2026_PROFIL_LULUSAN,
} from "./curriculum-2026-reference"
import {
  cpl,
  cplProfilLulusan,
  mahasiswa,
  mataKuliah,
  petaKurikulum,
  profilLulusan,
} from "./schema"

const baseCplCode = (code: string) => code.match(/CPL\d{2}/i)?.[0].toUpperCase() ?? code

async function syncCourses() {
  const currentCourses = await db.select().from(mataKuliah)

  for (const course of CURRICULUM_2026_MATA_KULIAH) {
    const existing = currentCourses.find(
      (item) => item.kode === course.kode || item.nama_id === course.nama_id
    )

    if (existing) {
      await db
        .update(mataKuliah)
        .set({ ...course, updated_at: new Date() })
        .where(eq(mataKuliah.id, existing.id))
    } else {
      await db.insert(mataKuliah).values(course)
    }
  }
}

async function syncCpl() {
  const currentCpl = await db.select().from(cpl)

  for (const item of CURRICULUM_2026_CPL) {
    const existing = currentCpl.find((row) => baseCplCode(row.kode) === item.kode)
    const values = {
      kode: item.kode,
      slug: existing?.slug ?? item.kode.toLowerCase(),
      domain: item.domain,
      rumusan: item.rumusan,
      is_active: true,
      urutan: item.urutan,
      updated_at: new Date(),
    }

    if (existing) {
      await db.update(cpl).set(values).where(eq(cpl.id, existing.id))
    } else {
      await db.insert(cpl).values(values)
    }
  }
}

async function syncGraduateProfiles() {
  const currentProfiles = await db.select().from(profilLulusan)

  for (const profile of CURRICULUM_2026_PROFIL_LULUSAN) {
    const existing = currentProfiles.find((row) => row.kode === profile.kode)
    const values = {
      ...profile,
      is_active: true,
      updated_at: new Date(),
    }

    if (existing) {
      await db
        .update(profilLulusan)
        .set(values)
        .where(eq(profilLulusan.id, existing.id))
    } else {
      await db.insert(profilLulusan).values(values)
    }
  }
}

async function syncMappings() {
  const [allCourses, allCpl, allProfiles, currentCurriculumMappings, currentProfileMappings] = await Promise.all([
    db.select().from(mataKuliah),
    db.select().from(cpl),
    db.select().from(profilLulusan),
    db.select().from(petaKurikulum),
    db.select().from(cplProfilLulusan),
  ])

  const courseByCode = new Map(allCourses.map((item) => [item.kode, item]))
  const cplByCode = new Map(allCpl.map((item) => [baseCplCode(item.kode), item]))
  const profileByCode = new Map(allProfiles.map((item) => [item.kode, item]))

  const missingCourses = new Set<string>()
  const missingCpl = new Set<string>()
  const missingProfiles = new Set<string>()

  const curriculumMappings = Object.entries(CURRICULUM_2026_CPL_TO_MK).flatMap(
    ([cplCode, courseCodes]) => {
      const cplRow = cplByCode.get(cplCode)
      if (!cplRow) missingCpl.add(cplCode)

      return courseCodes.flatMap((courseCode) => {
        const courseRow = courseByCode.get(courseCode)
        if (!courseRow) missingCourses.add(courseCode)
        if (!cplRow || !courseRow) return []

        return [{ cpl_id: cplRow.id, mk_id: courseRow.id, bobot: 1 }]
      })
    }
  )

  const profileMappings = Object.entries(CURRICULUM_2026_PL_TO_CPL).flatMap(
    ([profileCode, cplCodes]) => {
      const profileRow = profileByCode.get(profileCode)
      if (!profileRow) missingProfiles.add(profileCode)

      return cplCodes.flatMap((cplCode) => {
        const cplRow = cplByCode.get(cplCode)
        if (!cplRow) missingCpl.add(cplCode)
        if (!profileRow || !cplRow) return []

        return [{ profil_lulusan_id: profileRow.id, cpl_id: cplRow.id }]
      })
    }
  )

  if (missingCourses.size || missingCpl.size || missingProfiles.size) {
    throw new Error([
      missingCourses.size ? `MK tidak ditemukan: ${Array.from(missingCourses).join(", ")}` : "",
      missingCpl.size ? `CPL tidak ditemukan: ${Array.from(missingCpl).join(", ")}` : "",
      missingProfiles.size ? `PL tidak ditemukan: ${Array.from(missingProfiles).join(", ")}` : "",
    ].filter(Boolean).join("; "))
  }

  if (curriculumMappings.length !== 165) {
    throw new Error(`Jumlah pemetaan CPL-MK harus 165, ditemukan ${curriculumMappings.length}`)
  }

  const curriculumKey = (item: { cpl_id: string; mk_id: string }) => `${item.cpl_id}:${item.mk_id}`
  const targetCurriculumKeys = new Set(curriculumMappings.map(curriculumKey))
  const currentCurriculumKeys = new Set(currentCurriculumMappings.map(curriculumKey))
  const curriculumMappingsToInsert = curriculumMappings.filter(
    (item) => !currentCurriculumKeys.has(curriculumKey(item))
  )
  const curriculumMappingIdsToDelete = currentCurriculumMappings
    .filter((item) => !targetCurriculumKeys.has(curriculumKey(item)))
    .map((item) => item.id)

  if (curriculumMappingsToInsert.length > 0) {
    await db.insert(petaKurikulum).values(curriculumMappingsToInsert)
  }
  if (curriculumMappingIdsToDelete.length > 0) {
    await db
      .delete(petaKurikulum)
      .where(inArray(petaKurikulum.id, curriculumMappingIdsToDelete))
  }

  const profileKey = (item: { cpl_id: string; profil_lulusan_id: string }) =>
    `${item.cpl_id}:${item.profil_lulusan_id}`
  const targetProfileKeys = new Set(profileMappings.map(profileKey))
  const currentProfileKeys = new Set(currentProfileMappings.map(profileKey))
  const profileMappingsToInsert = profileMappings.filter(
    (item) => !currentProfileKeys.has(profileKey(item))
  )
  const profileMappingIdsToDelete = currentProfileMappings
    .filter((item) => !targetProfileKeys.has(profileKey(item)))
    .map((item) => item.id)

  if (profileMappingsToInsert.length > 0) {
    await db.insert(cplProfilLulusan).values(profileMappingsToInsert)
  }
  if (profileMappingIdsToDelete.length > 0) {
    await db
      .delete(cplProfilLulusan)
      .where(inArray(cplProfilLulusan.id, profileMappingIdsToDelete))
  }
}

async function syncMahasiswaTracks() {
  await db
    .update(mahasiswa)
    .set({ track: "ISG", updated_at: new Date() })
    .where(eq(mahasiswa.track, "BIS" as any))
  await db
    .update(mahasiswa)
    .set({ track: "DMS", updated_at: new Date() })
    .where(eq(mahasiswa.track, "DSA" as any))
}

export async function syncCurriculum2026() {
  console.log("Menyinkronkan kurikulum 2026 dari Simulasi SIF1 R2...")
  await syncCourses()
  await syncCpl()
  await syncGraduateProfiles()
  await syncMappings()
  await syncMahasiswaTracks()
  console.log("Selesai: 54 MK, 10 CPL, 5 PL, 165 pemetaan CPL-MK, pemetaan PL-CPL, dan migrasi track mahasiswa.")
  return {
    mataKuliah: 54,
    cpl: 10,
    profilLulusan: 5,
    pemetaanCplMk: 165,
    pemetaanPlCpl: 21,
  }
}

if (process.argv[1]?.replaceAll("\\", "/").endsWith("/db/sync-curriculum-2026.ts")) {
  syncCurriculum2026().catch((error) => {
    console.error("Sinkronisasi gagal:", error)
    process.exitCode = 1
  })
}
