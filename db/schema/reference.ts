import { pgTable, text, timestamp, integer, pgEnum, boolean } from "drizzle-orm/pg-core"
import { createId } from "@paralleldrive/cuid2"

export const is2020StatusEnum = pgEnum("is2020_status", ["REQUIRED", "ELECTIVE"])

export const is2020Realm = pgTable("is2020_realm", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  kode: text("kode").notNull().unique(),
  nama: text("nama").notNull(),
  deskripsi: text("deskripsi"),
  urutan: integer("urutan").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
})

export const is2020Area = pgTable("is2020_area", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  realm_id: text("realm_id").notNull().references(() => is2020Realm.id),
  kode: text("kode").notNull().unique(),
  nama: text("nama").notNull(),
  deskripsi: text("deskripsi"),
  status: is2020StatusEnum("status").notNull().default("REQUIRED"),
  urutan: integer("urutan").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
})

export const profilLulusan = pgTable("profil_lulusan", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  kode: text("kode").notNull().unique(),
  nama: text("nama").notNull(),
  deskripsi: text("deskripsi"),
  bidang_pekerjaan: text("bidang_pekerjaan"),
  is_active: boolean("is_active").notNull().default(true),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
})
