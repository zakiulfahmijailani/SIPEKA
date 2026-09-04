import { pgTable, text, timestamp, integer, pgEnum, unique, boolean, uuid, varchar, real, index, uniqueIndex } from "drizzle-orm/pg-core"
import { createId } from "@paralleldrive/cuid2"
import { is2020Area, profilLulusan } from "./reference"

export const cplDomainEnum = pgEnum("cpl_domain", [
  "SIKAP", "PENGETAHUAN", "KETERAMPILAN_UMUM", "KETERAMPILAN_KHUSUS"
])

export const mkStatusEnum = pgEnum("mk_status", ["WAJIB", "PILIHAN"])
export const mkTrackEnum = pgEnum("mk_track", ["UMUM", "BIS", "DSA", "ISG", "DMS"])
export const tipeAktivitasEnum = pgEnum("tipe_aktivitas", [
  "TEORI", "PRAKTIKUM", "TEORI_PRAKTIKUM", "SEMINAR", "PROYEK"
])
export const ploCategoryEnum = pgEnum("plo_category", [
  "Sikap", "Keterampilan Umum", "Keterampilan Khusus", "Pengetahuan"
])
export const contributionLevelEnum = pgEnum("contribution_level", ["H", "M", "L"])

export const cpl = pgTable("cpl", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  kode: text("kode").notNull().unique(),
  slug: text("slug").notNull().unique(),
  domain: cplDomainEnum("domain").notNull(),
  rumusan: text("rumusan").notNull(),
  is_active: boolean("is_active").notNull().default(true),
  urutan: integer("urutan").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
})

export const cplProfilLulusan = pgTable("cpl_profil_lulusan", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  cpl_id: text("cpl_id").notNull().references(() => cpl.id, { onDelete: "cascade" }),
  profil_lulusan_id: text("profil_lulusan_id").notNull().references(() => profilLulusan.id, { onDelete: "cascade" }),
}, (t) => [unique().on(t.cpl_id, t.profil_lulusan_id)])

export const cplIs2020Area = pgTable("cpl_is2020_area", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  cpl_id: text("cpl_id").notNull().references(() => cpl.id, { onDelete: "cascade" }),
  is2020_area_id: text("is2020_area_id").notNull().references(() => is2020Area.id, { onDelete: "cascade" }),
}, (t) => [unique().on(t.cpl_id, t.is2020_area_id)])

export const mataKuliah = pgTable("mata_kuliah", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  kode: text("kode").notNull().unique(),
  nama_id: text("nama_id").notNull(),
  nama_en: text("nama_en"),
  sks_teori: integer("sks_teori").notNull().default(2),
  sks_praktik: integer("sks_praktik").notNull().default(0),
  sks_tutorial: integer("sks_tutorial").notNull().default(0),
  semester_rekomendasi: integer("semester_rekomendasi").notNull(),
  status: mkStatusEnum("status").notNull().default("WAJIB"),
  track: mkTrackEnum("track").notNull().default("UMUM"),
  tipe_aktivitas: tipeAktivitasEnum("tipe_aktivitas").notNull().default("TEORI"),
  has_praktikum: boolean("has_praktikum").notNull().default(false),
  keterangan_praktikum: text("keterangan_praktikum"),
  is_pbl: boolean("is_pbl").notNull().default(false),
  keterangan_pbl: text("keterangan_pbl"),
  keterangan_semester: text("keterangan_semester"),
  deskripsi: text("deskripsi"),
  bahasa: text("bahasa").default("Indonesia"),
  is_active: boolean("is_active").notNull().default(true),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
})

export const mkPrasyarat = pgTable("mk_prasyarat", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  mk_id: text("mk_id").notNull().references(() => mataKuliah.id, { onDelete: "cascade" }),
  prasyarat_mk_id: text("prasyarat_mk_id").notNull().references(() => mataKuliah.id, { onDelete: "cascade" }),
}, (t) => [unique().on(t.mk_id, t.prasyarat_mk_id)])

export const mkIs2020Area = pgTable("mk_is2020_area", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  mk_id: text("mk_id").notNull().references(() => mataKuliah.id, { onDelete: "cascade" }),
  is2020_area_id: text("is2020_area_id").notNull().references(() => is2020Area.id, { onDelete: "cascade" }),
  is_primary: boolean("is_primary").notNull().default(false),
}, (t) => [unique().on(t.mk_id, t.is2020_area_id)])

export const petaKurikulum = pgTable("peta_kurikulum", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  mk_id: text("mk_id").notNull().references(() => mataKuliah.id, { onDelete: "cascade" }),
  cpl_id: text("cpl_id").notNull().references(() => cpl.id, { onDelete: "cascade" }),
  bobot: integer("bobot").notNull().default(1),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [unique().on(t.mk_id, t.cpl_id)])

export const curriculums = pgTable("curriculums", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  year: varchar("year", { length: 9 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
})

export const plos = pgTable("plos", {
  id: uuid("id").primaryKey().defaultRandom(),
  curriculumId: uuid("curriculum_id").notNull().references(() => curriculums.id, { onDelete: "cascade" }),
  code: varchar("code", { length: 20 }).notNull(),
  description: text("description").notNull(),
  category: ploCategoryEnum("category").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
})

export const courses = pgTable("courses", {
  id: uuid("id").primaryKey().defaultRandom(),
  curriculumId: uuid("curriculum_id").notNull().references(() => curriculums.id, { onDelete: "cascade" }),
  code: varchar("code", { length: 20 }).notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  creditsTheory: integer("credits_theory").notNull().default(0),
  creditsPractice: integer("credits_practice").notNull().default(0),
  semester: integer("semester").notNull(),
  isMandatory: boolean("is_mandatory").notNull().default(true),
  prerequisites: text("prerequisites").array().default([]),
  studyField: varchar("study_field", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
})

export const coursePloMappings = pgTable("course_plo_mappings", {
  id: uuid("id").primaryKey().defaultRandom(),
  courseId: uuid("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  ploId: uuid("plo_id").notNull().references(() => plos.id, { onDelete: "cascade" }),
  contributionLevel: contributionLevelEnum("contribution_level"),
  contributionValue: real("contribution_value"),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => [
  uniqueIndex("course_plo_mappings_course_id_plo_id_unique").on(t.courseId, t.ploId),
  index("course_plo_mappings_course_id_idx").on(t.courseId),
  index("course_plo_mappings_plo_id_idx").on(t.ploId),
  index("course_plo_mappings_course_id_plo_id_idx").on(t.courseId, t.ploId),
])
