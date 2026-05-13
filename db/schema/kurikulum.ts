import { pgTable, text, timestamp, serial, integer } from "drizzle-orm/pg-core"
import { profilLulusan } from "./reference"

// CPL (Capaian Pembelajaran Lulusan / Program Learning Outcomes)
export const cpl = pgTable("cpl", {
  id: serial("id").primaryKey(),
  kode: text("kode").notNull().unique(),
  deskripsi: text("deskripsi").notNull(),
  domain: text("domain").notNull(), // SIKAP, PENGETAHUAN, KETERAMPILAN_UMUM, KETERAMPILAN_KHUSUS
  profil_lulusan_id: serial("profil_lulusan_id")
    .references(() => profilLulusan.id),
  created_at: timestamp("created_at", { mode: "date" }).defaultNow(),
  updated_at: timestamp("updated_at", { mode: "date" }).defaultNow(),
})

// Mata Kuliah (Courses)
export const mataKuliah = pgTable("mata_kuliah", {
  id: serial("id").primaryKey(),
  kode: text("kode").notNull().unique(),
  nama: text("nama").notNull(),
  sks_teori: integer("sks_teori").notNull().default(0),
  sks_praktik: integer("sks_praktik").notNull().default(0),
  semester: integer("semester").notNull(),
  jenis: text("jenis").notNull().default("WAJIB"), // WAJIB, PILIHAN
  track: text("track").notNull().default("UMUM"), // UMUM, BIS, DSA
  prasyarat: text("prasyarat"),
  deskripsi: text("deskripsi"),
  created_at: timestamp("created_at", { mode: "date" }).defaultNow(),
  updated_at: timestamp("updated_at", { mode: "date" }).defaultNow(),
})

// Peta Kurikulum (Curriculum Map: CPL ↔ MK)
export const petaKurikulum = pgTable("peta_kurikulum", {
  id: serial("id").primaryKey(),
  cpl_id: serial("cpl_id")
    .notNull()
    .references(() => cpl.id, { onDelete: "cascade" }),
  mk_id: serial("mk_id")
    .notNull()
    .references(() => mataKuliah.id, { onDelete: "cascade" }),
  bobot: integer("bobot").notNull().default(1), // weight/contribution level
  created_at: timestamp("created_at", { mode: "date" }).defaultNow(),
})
