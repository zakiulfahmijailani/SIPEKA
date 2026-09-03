// Seed mata kuliah kurikulum 2026/2027 dari sumber kanonis.
// Run with: npm run db:seed-mk

import { config } from "dotenv"
import { eq } from "drizzle-orm"

config({ path: ".env.local" })

import { CURRICULUM_2026_MATA_KULIAH } from "./curriculum-2026"
import { db } from "./index"
import { mataKuliah } from "./schema"

async function seedMataKuliah() {
  const currentCourses = await db.select().from(mataKuliah)
  let inserted = 0
  let updated = 0

  for (const course of CURRICULUM_2026_MATA_KULIAH) {
    const existing = currentCourses.find(
      (item) => item.kode === course.kode || item.nama_id === course.nama_id
    )

    if (existing) {
      await db
        .update(mataKuliah)
        .set({ ...course, updated_at: new Date() })
        .where(eq(mataKuliah.id, existing.id))
      updated += 1
    } else {
      await db.insert(mataKuliah).values(course)
      inserted += 1
    }
  }

  console.log(`Selesai: ${inserted} MK ditambahkan dan ${updated} MK diperbarui.`)
}

seedMataKuliah().catch((error) => {
  console.error("Seed gagal:", error)
  process.exitCode = 1
})
