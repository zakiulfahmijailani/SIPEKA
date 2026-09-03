// Seed pemetaan CPL-MK terbaru dari workbook "Simulasi SIF1 R2".
// Run with: npm run db:seed-cpl-mapping-v2

import { config } from "dotenv"

config({ path: ".env.local" })

import { db } from "./index"
import { CURRICULUM_2026_CPL_TO_MK } from "./curriculum-2026-reference"
import { cpl, mataKuliah, petaKurikulum } from "./schema"

const baseCplCode = (code: string) => code.match(/CPL\d{2}/i)?.[0].toUpperCase() ?? code

async function runSeed() {
  const [allCpl, allCourses] = await Promise.all([
    db.select().from(cpl),
    db.select().from(mataKuliah),
  ])

  const cplByCode = new Map(allCpl.map((item) => [baseCplCode(item.kode), item]))
  const courseByCode = new Map(allCourses.map((item) => [item.kode, item]))
  const missing = new Set<string>()

  const values = Object.entries(CURRICULUM_2026_CPL_TO_MK).flatMap(
    ([cplCode, courseCodes]) => {
      const cplRow = cplByCode.get(cplCode)
      if (!cplRow) missing.add(cplCode)

      return courseCodes.flatMap((courseCode) => {
        const courseRow = courseByCode.get(courseCode)
        if (!courseRow) missing.add(courseCode)
        if (!cplRow || !courseRow) return []

        return [{ cpl_id: cplRow.id, mk_id: courseRow.id, bobot: 1 }]
      })
    }
  )

  if (missing.size > 0) {
    throw new Error(`Data belum lengkap: ${Array.from(missing).join(", ")}`)
  }
  if (values.length !== 165) {
    throw new Error(`Jumlah mapping harus 165, ditemukan ${values.length}`)
  }

  await db.delete(petaKurikulum)
  await db.insert(petaKurikulum).values(values)

  console.log(`Selesai: ${values.length} pemetaan CPL-MK tersimpan.`)
}

runSeed().catch((error) => {
  console.error("Seed gagal:", error)
  process.exitCode = 1
})
