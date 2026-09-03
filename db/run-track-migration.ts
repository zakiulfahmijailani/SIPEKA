/**
 * Script runner untuk migrasi track mahasiswa & mata kuliah: BIS -> ISG, DSA -> DMS
 * Jalankan: npx tsx --env-file=.env.local db/run-track-migration.ts
 */
import { config } from "dotenv"
import { neon } from "@neondatabase/serverless"

config({ path: ".env.local" })

const sql = neon(process.env.DATABASE_URL!)

async function main() {
  console.log("▶ Menjalankan migrasi track: BIS -> ISG, DSA -> DMS...")

  const statements = [
    `UPDATE mahasiswa SET track = 'ISG', updated_at = NOW() WHERE track = 'BIS';`,
    `UPDATE mahasiswa SET track = 'DMS', updated_at = NOW() WHERE track = 'DSA';`,
    `UPDATE mata_kuliah SET track = 'ISG', updated_at = NOW() WHERE track = 'BIS';`,
    `UPDATE mata_kuliah SET track = 'DMS', updated_at = NOW() WHERE track = 'DSA';`,
  ]

  for (const stmt of statements) {
    try {
      await sql.query(stmt)
      console.log(`  ✓ ${stmt}`)
    } catch (err: any) {
      console.error(`  ✗ GAGAL: ${stmt}`, err?.message)
    }
  }

  console.log("\n✅ Migrasi track selesai!")
}

main().catch(console.error)
