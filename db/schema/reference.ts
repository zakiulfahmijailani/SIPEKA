import { pgTable, text, timestamp, serial } from "drizzle-orm/pg-core"

// IS2020 Realm (Competency Areas)
export const is2020Realm = pgTable("is2020_realm", {
  id: serial("id").primaryKey(),
  kode: text("kode").notNull().unique(),
  nama: text("nama").notNull(),
  deskripsi: text("deskripsi"),
  created_at: timestamp("created_at", { mode: "date" }).defaultNow(),
})

// IS2020 Competency Area
export const is2020Area = pgTable("is2020_area", {
  id: serial("id").primaryKey(),
  realm_id: serial("realm_id")
    .notNull()
    .references(() => is2020Realm.id, { onDelete: "cascade" }),
  kode: text("kode").notNull().unique(),
  nama: text("nama").notNull(),
  deskripsi: text("deskripsi"),
  created_at: timestamp("created_at", { mode: "date" }).defaultNow(),
})

// Profil Lulusan (Graduate Profile)
export const profilLulusan = pgTable("profil_lulusan", {
  id: serial("id").primaryKey(),
  kode: text("kode").notNull().unique(),
  profil: text("profil").notNull(),
  deskripsi: text("deskripsi"),
  created_at: timestamp("created_at", { mode: "date" }).defaultNow(),
  updated_at: timestamp("updated_at", { mode: "date" }).defaultNow(),
})
