import { pgTable, text, timestamp, serial, real } from "drizzle-orm/pg-core"
import { dosirMk } from "./dosir"
import { komponenPenilaian } from "./rps"

// Mahasiswa (Students)
export const mahasiswa = pgTable("mahasiswa", {
  id: serial("id").primaryKey(),
  nim: text("nim").notNull().unique(),
  nama: text("nama").notNull(),
  angkatan: text("angkatan"),
  track: text("track").default("UMUM"),
  created_at: timestamp("created_at", { mode: "date" }).defaultNow(),
})

// Enrollment (Student enrollment per course dossier)
export const enrollment = pgTable("enrollment", {
  id: serial("id").primaryKey(),
  mahasiswa_id: serial("mahasiswa_id")
    .notNull()
    .references(() => mahasiswa.id, { onDelete: "cascade" }),
  dosir_mk_id: serial("dosir_mk_id")
    .notNull()
    .references(() => dosirMk.id, { onDelete: "cascade" }),
  created_at: timestamp("created_at", { mode: "date" }).defaultNow(),
})

// Nilai (Scores per assessment component)
export const nilai = pgTable("nilai", {
  id: serial("id").primaryKey(),
  enrollment_id: serial("enrollment_id")
    .notNull()
    .references(() => enrollment.id, { onDelete: "cascade" }),
  komponen_id: serial("komponen_id")
    .notNull()
    .references(() => komponenPenilaian.id, { onDelete: "cascade" }),
  skor: real("skor").notNull().default(0),
  created_at: timestamp("created_at", { mode: "date" }).defaultNow(),
  updated_at: timestamp("updated_at", { mode: "date" }).defaultNow(),
})
