import { pgTable, text, timestamp, integer, unique, boolean } from "drizzle-orm/pg-core"
import { createId } from "@paralleldrive/cuid2"
import { mataKuliah } from "./kurikulum"
import { users } from "./auth"

export const tahunAkademik = pgTable("tahun_akademik", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  kode: text("kode").notNull().unique(),
  nama: text("nama").notNull(),
  semester: integer("semester").notNull(),
  tahun_mulai: integer("tahun_mulai").notNull(),
  is_active: boolean("is_active").notNull().default(false),
  created_at: timestamp("created_at").defaultNow().notNull(),
})

export const dosirMk = pgTable("dosir_mk", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  mk_id: text("mk_id").notNull().references(() => mataKuliah.id),
  dosen_id: text("dosen_id").notNull().references(() => users.id),
  tahun_akademik_id: text("tahun_akademik_id").notNull().references(() => tahunAkademik.id),
  kelas: text("kelas").notNull().default("A"),
  is_active: boolean("is_active").notNull().default(true),
  created_at: timestamp("created_at").defaultNow().notNull(),
}, (t) => [unique().on(t.mk_id, t.dosen_id, t.tahun_akademik_id, t.kelas)])
