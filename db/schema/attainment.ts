import { pgTable, text, timestamp, serial, real } from "drizzle-orm/pg-core"
import { cpl } from "./kurikulum"
import { cpmk } from "./rps"
import { dosirMk } from "./dosir"
import { mahasiswa } from "./nilai"

// CPMK Attainment (per student per CPMK)
export const cpmkAttainment = pgTable("cpmk_attainment", {
  id: serial("id").primaryKey(),
  mahasiswa_id: serial("mahasiswa_id")
    .notNull()
    .references(() => mahasiswa.id, { onDelete: "cascade" }),
  dosir_mk_id: serial("dosir_mk_id")
    .notNull()
    .references(() => dosirMk.id, { onDelete: "cascade" }),
  cpmk_id: serial("cpmk_id")
    .notNull()
    .references(() => cpmk.id, { onDelete: "cascade" }),
  skor: real("skor").notNull().default(0),
  tercapai: text("tercapai").notNull().default("BELUM"), // TERCAPAI, BELUM
  created_at: timestamp("created_at", { mode: "date" }).defaultNow(),
})

// CPL Attainment (aggregated per student per CPL)
export const cplAttainment = pgTable("cpl_attainment", {
  id: serial("id").primaryKey(),
  mahasiswa_id: serial("mahasiswa_id")
    .notNull()
    .references(() => mahasiswa.id, { onDelete: "cascade" }),
  cpl_id: serial("cpl_id")
    .notNull()
    .references(() => cpl.id, { onDelete: "cascade" }),
  skor_rata_rata: real("skor_rata_rata").notNull().default(0),
  tercapai: text("tercapai").notNull().default("BELUM"),
  created_at: timestamp("created_at", { mode: "date" }).defaultNow(),
})
