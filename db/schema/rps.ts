import {
  pgTable,
  text,
  timestamp,
  serial,
  integer,
  real,
} from "drizzle-orm/pg-core"
import { dosirMk } from "./dosir"
import { cpl } from "./kurikulum"

// RPS (Rencana Pembelajaran Semester / Semester Learning Plan)
export const rps = pgTable("rps", {
  id: serial("id").primaryKey(),
  dosir_mk_id: serial("dosir_mk_id")
    .notNull()
    .references(() => dosirMk.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("DRAFT"), // DRAFT, SUBMITTED, APPROVED, REVISION_REQUIRED, ARCHIVED
  catatan_revisi: text("catatan_revisi"),
  approved_by: text("approved_by"),
  approved_at: timestamp("approved_at", { mode: "date" }),
  created_at: timestamp("created_at", { mode: "date" }).defaultNow(),
  updated_at: timestamp("updated_at", { mode: "date" }).defaultNow(),
})

// CPMK (Capaian Pembelajaran Mata Kuliah / Course Learning Outcomes)
export const cpmk = pgTable("cpmk", {
  id: serial("id").primaryKey(),
  rps_id: serial("rps_id")
    .notNull()
    .references(() => rps.id, { onDelete: "cascade" }),
  cpl_id: serial("cpl_id")
    .notNull()
    .references(() => cpl.id),
  kode: text("kode").notNull(),
  deskripsi: text("deskripsi").notNull(),
  bobot: real("bobot").notNull().default(1),
  created_at: timestamp("created_at", { mode: "date" }).defaultNow(),
})

// Sub-CPMK
export const subCpmk = pgTable("sub_cpmk", {
  id: serial("id").primaryKey(),
  cpmk_id: serial("cpmk_id")
    .notNull()
    .references(() => cpmk.id, { onDelete: "cascade" }),
  kode: text("kode").notNull(),
  deskripsi: text("deskripsi").notNull(),
  bloom_level: text("bloom_level").notNull(), // C1-C6
  created_at: timestamp("created_at", { mode: "date" }).defaultNow(),
})

// Pertemuan (Meeting/Session Plan)
export const pertemuan = pgTable("pertemuan", {
  id: serial("id").primaryKey(),
  rps_id: serial("rps_id")
    .notNull()
    .references(() => rps.id, { onDelete: "cascade" }),
  minggu_ke: integer("minggu_ke").notNull(),
  topik: text("topik").notNull(),
  sub_cpmk_id: serial("sub_cpmk_id")
    .references(() => subCpmk.id),
  metode_pembelajaran: text("metode_pembelajaran"),
  metode_asesmen: text("metode_asesmen"),
  estimasi_waktu: text("estimasi_waktu"),
  referensi: text("referensi"),
  created_at: timestamp("created_at", { mode: "date" }).defaultNow(),
})

// Komponen Penilaian (Assessment Components)
export const komponenPenilaian = pgTable("komponen_penilaian", {
  id: serial("id").primaryKey(),
  rps_id: serial("rps_id")
    .notNull()
    .references(() => rps.id, { onDelete: "cascade" }),
  nama: text("nama").notNull(),
  bobot: real("bobot").notNull(),
  cpmk_id: serial("cpmk_id")
    .references(() => cpmk.id),
  created_at: timestamp("created_at", { mode: "date" }).defaultNow(),
})
