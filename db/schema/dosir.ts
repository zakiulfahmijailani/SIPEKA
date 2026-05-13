import { pgTable, text, timestamp, serial, boolean } from "drizzle-orm/pg-core"
import { mataKuliah } from "./kurikulum"
import { users } from "./auth"

// Tahun Akademik (Academic Year)
export const tahunAkademik = pgTable("tahun_akademik", {
  id: serial("id").primaryKey(),
  kode: text("kode").notNull().unique(), // e.g., "2024/2025-1"
  nama: text("nama").notNull(),
  is_active: boolean("is_active").notNull().default(false),
  created_at: timestamp("created_at", { mode: "date" }).defaultNow(),
})

// Dosir MK (Course Dossier per academic year)
export const dosirMk = pgTable("dosir_mk", {
  id: serial("id").primaryKey(),
  mk_id: serial("mk_id")
    .notNull()
    .references(() => mataKuliah.id, { onDelete: "cascade" }),
  tahun_akademik_id: serial("tahun_akademik_id")
    .notNull()
    .references(() => tahunAkademik.id, { onDelete: "cascade" }),
  dosen_id: text("dosen_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  kelas: text("kelas").notNull().default("A"),
  created_at: timestamp("created_at", { mode: "date" }).defaultNow(),
  updated_at: timestamp("updated_at", { mode: "date" }).defaultNow(),
})
