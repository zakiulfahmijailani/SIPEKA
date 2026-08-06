import "server-only"

import { sql } from "drizzle-orm"

import { db } from "@/db"

const statements = [
  `DO $$ BEGIN CREATE TYPE "public"."contribution_level" AS ENUM('H', 'M', 'L'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE TYPE "public"."plo_category" AS ENUM('Sikap', 'Keterampilan Umum', 'Keterampilan Khusus', 'Pengetahuan'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE TYPE "public"."mahasiswa_status" AS ENUM('AKTIF', 'CUTI', 'LULUS', 'DO'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE TYPE "public"."bloom_level" AS ENUM('C1', 'C2', 'C3', 'C4', 'C5', 'C6'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `ALTER TYPE "public"."mk_track" ADD VALUE IF NOT EXISTS 'ISG'`,
  `ALTER TYPE "public"."mk_track" ADD VALUE IF NOT EXISTS 'DMS'`,
  `ALTER TABLE "mahasiswa" ADD COLUMN IF NOT EXISTS "status" "mahasiswa_status" DEFAULT 'AKTIF' NOT NULL`,
  `ALTER TABLE "mahasiswa" ADD COLUMN IF NOT EXISTS "email" text`,
  `ALTER TABLE "komponen_penilaian" ALTER COLUMN "bobot" SET DATA TYPE real USING "bobot"::real`,
  `ALTER TABLE "komponen_penilaian" ADD COLUMN IF NOT EXISTS "instruksi" text`,
  `ALTER TABLE "komponen_penilaian" ADD COLUMN IF NOT EXISTS "bentuk" text`,
  `ALTER TABLE "komponen_penilaian" ADD COLUMN IF NOT EXISTS "luaran" text`,
  `ALTER TABLE "komponen_penilaian" ADD COLUMN IF NOT EXISTS "kriteria_penilaian" text`,
  `ALTER TABLE "komponen_penilaian" ADD COLUMN IF NOT EXISTS "minggu_pemberian" integer`,
  `ALTER TABLE "komponen_penilaian" ADD COLUMN IF NOT EXISTS "minggu_pengumpulan" integer`,
  `ALTER TABLE "komponen_penilaian" ADD COLUMN IF NOT EXISTS "is_kelompok" boolean DEFAULT false NOT NULL`,
  `ALTER TABLE "komponen_penilaian" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now() NOT NULL`,
  `ALTER TABLE "rps_pertemuan" ADD COLUMN IF NOT EXISTS "indikator" text`,
  `ALTER TABLE "rps_pertemuan" ADD COLUMN IF NOT EXISTS "bentuk_pembelajaran" text`,
  `ALTER TABLE "rps_pertemuan" ADD COLUMN IF NOT EXISTS "aktivitas_dosen" text`,
  `ALTER TABLE "rps_pertemuan" ADD COLUMN IF NOT EXISTS "aktivitas_mahasiswa" text`,
  `ALTER TABLE "rps_pertemuan" ADD COLUMN IF NOT EXISTS "kriteria_penilaian" text`,
  `CREATE TABLE IF NOT EXISTS "curriculums" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "name" varchar(100) NOT NULL,
    "year" varchar(9) NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS "plos" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "curriculum_id" uuid NOT NULL REFERENCES "curriculums"("id") ON DELETE cascade,
    "code" varchar(20) NOT NULL,
    "description" text NOT NULL,
    "category" "plo_category" NOT NULL,
    "created_at" timestamp DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS "courses" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "curriculum_id" uuid NOT NULL REFERENCES "curriculums"("id") ON DELETE cascade,
    "code" varchar(20) NOT NULL,
    "name" varchar(200) NOT NULL,
    "credits_theory" integer DEFAULT 0 NOT NULL,
    "credits_practice" integer DEFAULT 0 NOT NULL,
    "semester" integer NOT NULL,
    "is_mandatory" boolean DEFAULT true NOT NULL,
    "prerequisites" text[] DEFAULT '{}',
    "study_field" varchar(100),
    "created_at" timestamp DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS "course_plo_mappings" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "course_id" uuid NOT NULL REFERENCES "courses"("id") ON DELETE cascade,
    "plo_id" uuid NOT NULL REFERENCES "plos"("id") ON DELETE cascade,
    "contribution_level" "contribution_level",
    "contribution_value" real,
    "created_at" timestamp DEFAULT now()
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "course_plo_mappings_course_id_plo_id_unique" ON "course_plo_mappings" ("course_id", "plo_id")`,
  `CREATE INDEX IF NOT EXISTS "course_plo_mappings_course_id_idx" ON "course_plo_mappings" ("course_id")`,
  `CREATE INDEX IF NOT EXISTS "course_plo_mappings_plo_id_idx" ON "course_plo_mappings" ("plo_id")`,
  `CREATE INDEX IF NOT EXISTS "course_plo_mappings_course_id_plo_id_idx" ON "course_plo_mappings" ("course_id", "plo_id")`,
  `CREATE TABLE IF NOT EXISTS "cpmk_template" (
    "id" text PRIMARY KEY NOT NULL,
    "mk_id" text NOT NULL REFERENCES "mata_kuliah"("id") ON DELETE cascade,
    "cpl_id" text REFERENCES "cpl"("id"),
    "kode" text NOT NULL,
    "deskripsi" text NOT NULL,
    "urutan" integer NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "cpmk_template_mk_id_kode_unique" UNIQUE("mk_id", "kode")
  )`,
  `CREATE TABLE IF NOT EXISTS "sub_cpmk_template" (
    "id" text PRIMARY KEY NOT NULL,
    "cpmk_template_id" text NOT NULL REFERENCES "cpmk_template"("id") ON DELETE cascade,
    "kode" text NOT NULL,
    "deskripsi" text NOT NULL,
    "level_bloom" "bloom_level" DEFAULT 'C3' NOT NULL,
    "urutan" integer NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "sub_cpmk_template_cpmk_template_id_kode_unique" UNIQUE("cpmk_template_id", "kode")
  )`,
  `CREATE TABLE IF NOT EXISTS "assessment_template" (
    "id" text PRIMARY KEY NOT NULL,
    "mk_id" text NOT NULL REFERENCES "mata_kuliah"("id") ON DELETE cascade,
    "cpmk_template_id" text REFERENCES "cpmk_template"("id") ON DELETE set null,
    "sub_cpmk_template_id" text REFERENCES "sub_cpmk_template"("id") ON DELETE set null,
    "nama" text NOT NULL,
    "tipe" text NOT NULL,
    "bobot" real NOT NULL,
    "kriteria_penilaian" text,
    "urutan" integer NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "assessment_template_mk_id_urutan_unique" UNIQUE("mk_id", "urutan")
  )`,
  `CREATE TABLE IF NOT EXISTS "komponen_sub_cpmk" (
    "id" text PRIMARY KEY NOT NULL,
    "komponen_id" text NOT NULL REFERENCES "komponen_penilaian"("id") ON DELETE cascade,
    "sub_cpmk_id" text NOT NULL REFERENCES "sub_cpmk"("id") ON DELETE cascade,
    CONSTRAINT "komponen_sub_cpmk_komponen_id_sub_cpmk_id_unique" UNIQUE("komponen_id", "sub_cpmk_id")
  )`,
  `CREATE TABLE IF NOT EXISTS "rubrik_kriteria" (
    "id" text PRIMARY KEY NOT NULL,
    "komponen_id" text NOT NULL REFERENCES "komponen_penilaian"("id") ON DELETE cascade,
    "kriteria" text NOT NULL,
    "bobot" real DEFAULT 100 NOT NULL,
    "sangat_baik" text,
    "baik" text,
    "cukup" text,
    "kurang" text,
    "sangat_kurang" text,
    "urutan" integer NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "rubrik_kriteria_komponen_id_urutan_unique" UNIQUE("komponen_id", "urutan")
  )`,
]

export async function repairProductionSchema() {
  for (const statement of statements) {
    await db.execute(sql.raw(statement))
  }
}
