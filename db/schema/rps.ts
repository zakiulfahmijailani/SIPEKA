import { pgTable, text, timestamp, integer, pgEnum, unique } from "drizzle-orm/pg-core"
import { createId } from "@paralleldrive/cuid2"
import { dosirMk } from "./dosir"
import { users } from "./auth"
import { cpl } from "./kurikulum"

export const rpsStatusEnum = pgEnum("rps_status", [
  "DRAFT", "SUBMITTED", "APPROVED", "REVISION_REQUIRED", "ARCHIVED"
])
export const bloomLevelEnum = pgEnum("bloom_level", [
  "C1", "C2", "C3", "C4", "C5", "C6"
])

export const rps = pgTable("rps", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  dosir_mk_id: text("dosir_mk_id").notNull().references(() => dosirMk.id),
  version: integer("version").notNull().default(1),
  status: rpsStatusEnum("status").notNull().default("DRAFT"),
  catatan_reviewer: text("catatan_reviewer"),
  submitted_at: timestamp("submitted_at"),
  approved_at: timestamp("approved_at"),
  approved_by: text("approved_by").references(() => users.id),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [unique().on(t.dosir_mk_id, t.version)])

export const rpsStatusLog = pgTable("rps_status_log", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  rps_id: text("rps_id").notNull().references(() => rps.id, { onDelete: "cascade" }),
  status_from: rpsStatusEnum("status_from"),
  status_to: rpsStatusEnum("status_to").notNull(),
  changed_by: text("changed_by").notNull().references(() => users.id),
  catatan: text("catatan"),
  created_at: timestamp("created_at").defaultNow().notNull(),
})

export const cpmk = pgTable("cpmk", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  rps_id: text("rps_id").notNull().references(() => rps.id, { onDelete: "cascade" }),
  kode: text("kode").notNull(),
  deskripsi: text("deskripsi").notNull(),
  urutan: integer("urutan").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
}, (t) => [unique().on(t.rps_id, t.kode)])

export const cpmkCpl = pgTable("cpmk_cpl", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  cpmk_id: text("cpmk_id").notNull().references(() => cpmk.id, { onDelete: "cascade" }),
  cpl_id: text("cpl_id").notNull().references(() => cpl.id),
}, (t) => [unique().on(t.cpmk_id, t.cpl_id)])

export const subCpmk = pgTable("sub_cpmk", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  cpmk_id: text("cpmk_id").notNull().references(() => cpmk.id, { onDelete: "cascade" }),
  kode: text("kode").notNull(),
  deskripsi: text("deskripsi").notNull(),
  level_bloom: bloomLevelEnum("level_bloom").notNull(),
  urutan: integer("urutan").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
}, (t) => [unique().on(t.cpmk_id, t.kode)])

export const rpsPertemuan = pgTable("rps_pertemuan", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  rps_id: text("rps_id").notNull().references(() => rps.id, { onDelete: "cascade" }),
  minggu_ke: integer("minggu_ke").notNull(),
  materi: text("materi").notNull(),
  metode: text("metode"),
  media: text("media"),
  estimasi_waktu: text("estimasi_waktu"),
  created_at: timestamp("created_at").defaultNow().notNull(),
}, (t) => [unique().on(t.rps_id, t.minggu_ke)])

export const pertemuanSubCpmk = pgTable("pertemuan_sub_cpmk", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  pertemuan_id: text("pertemuan_id").notNull().references(() => rpsPertemuan.id, { onDelete: "cascade" }),
  sub_cpmk_id: text("sub_cpmk_id").notNull().references(() => subCpmk.id, { onDelete: "cascade" }),
}, (t) => [unique().on(t.pertemuan_id, t.sub_cpmk_id)])

export const komponenPenilaian = pgTable("komponen_penilaian", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  rps_id: text("rps_id").notNull().references(() => rps.id, { onDelete: "cascade" }),
  nama: text("nama").notNull(),
  tipe: text("tipe").notNull(),
  bobot: integer("bobot").notNull(),
  deskripsi: text("deskripsi"),
  urutan: integer("urutan").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
})

export const komponenCpmk = pgTable("komponen_cpmk", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  komponen_id: text("komponen_id").notNull().references(() => komponenPenilaian.id, { onDelete: "cascade" }),
  cpmk_id: text("cpmk_id").notNull().references(() => cpmk.id, { onDelete: "cascade" }),
}, (t) => [unique().on(t.komponen_id, t.cpmk_id)])

export const rpsReferensi = pgTable("rps_referensi", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  rps_id: text("rps_id").notNull().references(() => rps.id, { onDelete: "cascade" }),
  jenis: text("jenis").notNull(),
  teks: text("teks").notNull(),
  urutan: integer("urutan").notNull(),
})
