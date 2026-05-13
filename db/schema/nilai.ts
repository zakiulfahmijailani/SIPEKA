import { pgTable, text, timestamp, integer, numeric, unique } from "drizzle-orm/pg-core"
import { createId } from "@paralleldrive/cuid2"
import { mkTrackEnum } from "./kurikulum"
import { dosirMk } from "./dosir"
import { komponenPenilaian } from "./rps"

export const mahasiswa = pgTable("mahasiswa", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  nim: text("nim").notNull().unique(),
  nama_lengkap: text("nama_lengkap").notNull(),
  angkatan: integer("angkatan").notNull(),
  track: mkTrackEnum("track").notNull().default("UMUM"),
  is_active: text("is_active").notNull().default("true"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
})

export const enrollment = pgTable("enrollment", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  mahasiswa_id: text("mahasiswa_id").notNull().references(() => mahasiswa.id),
  dosir_mk_id: text("dosir_mk_id").notNull().references(() => dosirMk.id),
  created_at: timestamp("created_at").defaultNow().notNull(),
}, (t) => [unique().on(t.mahasiswa_id, t.dosir_mk_id)])

export const nilai = pgTable("nilai", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  enrollment_id: text("enrollment_id").notNull().references(() => enrollment.id, { onDelete: "cascade" }),
  komponen_id: text("komponen_id").notNull().references(() => komponenPenilaian.id),
  nilai: numeric("nilai", { precision: 5, scale: 2 }),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [unique().on(t.enrollment_id, t.komponen_id)])
