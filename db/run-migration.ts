/**
 * One-time migration runner — jalankan dengan: npx tsx db/run-migration.ts
 * Menggunakan Neon HTTP driver yang kompatibel dengan environment lokal.
 */
import { config } from "dotenv"
import { neon } from "@neondatabase/serverless"

config({ path: ".env.local" })

const sql = neon(process.env.DATABASE_URL!)

async function main() {
  console.log("▶ Menjalankan migration 0003...")

  const statements = [
    `ALTER TABLE "cpmk" ADD COLUMN IF NOT EXISTS "metode_pencapaian" text`,
    `ALTER TABLE "komponen_penilaian" ADD COLUMN IF NOT EXISTS "referensi_tugas" text`,
    `ALTER TABLE "komponen_penilaian" ADD COLUMN IF NOT EXISTS "lain_lain" text`,
    `ALTER TABLE "rps" ADD COLUMN IF NOT EXISTS "deskripsi_mk" text`,
    `ALTER TABLE "rps" ADD COLUMN IF NOT EXISTS "metode_pembelajaran" text`,
    `ALTER TABLE "rps" ADD COLUMN IF NOT EXISTS "persyaratan_kehadiran" text`,
    `ALTER TABLE "rps" ADD COLUMN IF NOT EXISTS "status_revisi" text DEFAULT 'R-1' NOT NULL`,
    `ALTER TABLE "rps" ADD COLUMN IF NOT EXISTS "tanggal_penyusunan" date`,
    `ALTER TABLE "rps" ADD COLUMN IF NOT EXISTS "nama_penyetuju" text`,
    `ALTER TABLE "rps" ADD COLUMN IF NOT EXISTS "jabatan_penyetuju" text DEFAULT 'Ketua Program Studi' NOT NULL`,
    `ALTER TABLE "rps" ADD COLUMN IF NOT EXISTS "tanggal_pengesahan" date`,
    `ALTER TABLE "rps_pertemuan" ADD COLUMN IF NOT EXISTS "referensi" text`,
  ]

  for (const stmt of statements) {
    try {
      await sql.query(stmt)
      console.log(`  ✓ ${stmt.slice(0, 70)}`)
    } catch (err: any) {
      if (err?.message?.includes("already exists")) {
        console.log(`  ~ (sudah ada) ${stmt.slice(0, 70)}`)
      } else {
        console.error(`  ✗ GAGAL: ${stmt}`)
        console.error(err?.message)
        process.exit(1)
      }
    }
  }

  console.log("\n✅ Migration selesai!")
  process.exit(0)
}

main()
