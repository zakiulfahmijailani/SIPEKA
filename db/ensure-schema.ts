import { sql } from "drizzle-orm"
import { db } from "./index"

export async function ensureOfficialRpsSchema() {
  try {
    await db.execute(sql`
      ALTER TABLE "rps" ADD COLUMN IF NOT EXISTS "sasaran_kompetensi_lulusan" text;
      ALTER TABLE "rps" ADD COLUMN IF NOT EXISTS "perlengkapan_pembelajaran" text;
      ALTER TABLE "rps" ADD COLUMN IF NOT EXISTS "nama_penyusun" text;
      ALTER TABLE "rps" ADD COLUMN IF NOT EXISTS "jabatan_penyusun" text DEFAULT 'Dosen Pengampu';
      ALTER TABLE "rps" ADD COLUMN IF NOT EXISTS "ttd_penyusun" text;
      ALTER TABLE "rps" ADD COLUMN IF NOT EXISTS "ttd_pengesah" text;
      ALTER TABLE "rps" ADD COLUMN IF NOT EXISTS "dosen_pengampu_tambahan" text;
      ALTER TABLE "rps_pertemuan" ADD COLUMN IF NOT EXISTS "tipe" text DEFAULT 'PERTEMUAN';
      ALTER TABLE "rps_pertemuan" ADD COLUMN IF NOT EXISTS "urutan" integer;
      ALTER TABLE "komponen_penilaian" ADD COLUMN IF NOT EXISTS "kategori_resmi" text;
      ALTER TABLE "komponen_penilaian" ADD COLUMN IF NOT EXISTS "urutan" integer DEFAULT 1;
      ALTER TABLE "mata_kuliah" ADD COLUMN IF NOT EXISTS "sks_tutorial" integer DEFAULT 0;
    `)
  } catch (error) {
    console.error("Warning: could not run schema migrations:", error)
  }
}
