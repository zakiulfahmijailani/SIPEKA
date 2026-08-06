import { pgTable, text, timestamp, integer, pgEnum, unique, boolean, real } from "drizzle-orm/pg-core"
import { createId } from "@paralleldrive/cuid2"
import { dosirMk } from "./dosir"
import { users } from "./auth"
import { cpl, mataKuliah } from "./kurikulum"

export const rpsStatusEnum = pgEnum("rps_status", [
  "DRAFT", "SUBMITTED", "APPROVED", "REVISION_REQUIRED", "ARCHIVED"
])
export const bloomLevelEnum = pgEnum("bloom_level", [
  "C1", "C2", "C3", "C4", "C5", "C6"
])

export const cpmkTemplate = pgTable("cpmk_template", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  mk_id: text("mk_id").notNull().references(() => mataKuliah.id, { onDelete: "cascade" }),
  cpl_id: text("cpl_id").references(() => cpl.id),
  kode: text("kode").notNull(),
  deskripsi: text("deskripsi").notNull(),
  urutan: integer("urutan").notNull(),
  is_active: boolean("is_active").notNull().default(true),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [unique().on(t.mk_id, t.kode)])

export const subCpmkTemplate = pgTable("sub_cpmk_template", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  cpmk_template_id: text("cpmk_template_id").notNull().references(() => cpmkTemplate.id, { onDelete: "cascade" }),
  kode: text("kode").notNull(),
  deskripsi: text("deskripsi").notNull(),
  level_bloom: bloomLevelEnum("level_bloom").notNull().default("C3"),
  urutan: integer("urutan").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [unique().on(t.cpmk_template_id, t.kode)])

export const assessmentTemplate = pgTable("assessment_template", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  mk_id: text("mk_id").notNull().references(() => mataKuliah.id, { onDelete: "cascade" }),
  cpmk_template_id: text("cpmk_template_id").references(() => cpmkTemplate.id, { onDelete: "set null" }),
  sub_cpmk_template_id: text("sub_cpmk_template_id").references(() => subCpmkTemplate.id, { onDelete: "set null" }),
  nama: text("nama").notNull(),
  tipe: text("tipe").notNull(),
  bobot: real("bobot").notNull(),
  kriteria_penilaian: text("kriteria_penilaian"),
  urutan: integer("urutan").notNull(),
  is_active: boolean("is_active").notNull().default(true),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [unique().on(t.mk_id, t.urutan)])

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
  indikator: text("indikator"),
  bentuk_pembelajaran: text("bentuk_pembelajaran"),
  aktivitas_dosen: text("aktivitas_dosen"),
  aktivitas_mahasiswa: text("aktivitas_mahasiswa"),
  kriteria_penilaian: text("kriteria_penilaian"),
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
  bobot: real("bobot").notNull(),
  deskripsi: text("deskripsi"),
  instruksi: text("instruksi"),
  bentuk: text("bentuk"),
  luaran: text("luaran"),
  kriteria_penilaian: text("kriteria_penilaian"),
  minggu_pemberian: integer("minggu_pemberian"),
  minggu_pengumpulan: integer("minggu_pengumpulan"),
  is_kelompok: boolean("is_kelompok").notNull().default(false),
  urutan: integer("urutan").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
})

export const komponenCpmk = pgTable("komponen_cpmk", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  komponen_id: text("komponen_id").notNull().references(() => komponenPenilaian.id, { onDelete: "cascade" }),
  cpmk_id: text("cpmk_id").notNull().references(() => cpmk.id, { onDelete: "cascade" }),
}, (t) => [unique().on(t.komponen_id, t.cpmk_id)])

export const komponenSubCpmk = pgTable("komponen_sub_cpmk", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  komponen_id: text("komponen_id").notNull().references(() => komponenPenilaian.id, { onDelete: "cascade" }),
  sub_cpmk_id: text("sub_cpmk_id").notNull().references(() => subCpmk.id, { onDelete: "cascade" }),
}, (t) => [unique().on(t.komponen_id, t.sub_cpmk_id)])

export const rubrikKriteria = pgTable("rubrik_kriteria", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  komponen_id: text("komponen_id").notNull().references(() => komponenPenilaian.id, { onDelete: "cascade" }),
  kriteria: text("kriteria").notNull(),
  bobot: real("bobot").notNull().default(100),
  sangat_baik: text("sangat_baik"),
  baik: text("baik"),
  cukup: text("cukup"),
  kurang: text("kurang"),
  sangat_kurang: text("sangat_kurang"),
  urutan: integer("urutan").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [unique().on(t.komponen_id, t.urutan)])

export const rpsReferensi = pgTable("rps_referensi", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  rps_id: text("rps_id").notNull().references(() => rps.id, { onDelete: "cascade" }),
  jenis: text("jenis").notNull(),
  teks: text("teks").notNull(),
  urutan: integer("urutan").notNull(),
})
