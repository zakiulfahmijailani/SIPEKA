import { relations } from "drizzle-orm"
import { users, accounts, sessions } from "./auth"
import { is2020Realm, is2020Area, profilLulusan } from "./reference"
import {
  cpl, cplProfilLulusan, cplIs2020Area,
  mataKuliah, mkPrasyarat, mkIs2020Area, petaKurikulum,
} from "./kurikulum"
import { tahunAkademik, dosirMk } from "./dosir"
import {
  rps, rpsStatusLog, cpmk, cpmkCpl, subCpmk,
  rpsPertemuan, pertemuanSubCpmk,
  komponenPenilaian, komponenCpmk, rpsReferensi,
} from "./rps"
import { mahasiswa, enrollment, nilai } from "./nilai"
import { cpmkAttainment, cplAttainment } from "./attainment"
import { auditLog } from "./audit"

// ── Auth relations ──
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  dosirMk: many(dosirMk),
  auditLogs: many(auditLog),
}))

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}))

// ── Reference relations ──
export const is2020RealmRelations = relations(is2020Realm, ({ many }) => ({
  areas: many(is2020Area),
}))

export const is2020AreaRelations = relations(is2020Area, ({ one, many }) => ({
  realm: one(is2020Realm, { fields: [is2020Area.realm_id], references: [is2020Realm.id] }),
  cplMappings: many(cplIs2020Area),
  mkMappings: many(mkIs2020Area),
}))

export const profilLulusanRelations = relations(profilLulusan, ({ many }) => ({
  cplMappings: many(cplProfilLulusan),
}))

// ── Kurikulum relations ──
export const cplRelations = relations(cpl, ({ many }) => ({
  profilLulusanMappings: many(cplProfilLulusan),
  is2020AreaMappings: many(cplIs2020Area),
  petaKurikulum: many(petaKurikulum),
  cpmkCpl: many(cpmkCpl),
}))

export const cplProfilLulusanRelations = relations(cplProfilLulusan, ({ one }) => ({
  cpl: one(cpl, { fields: [cplProfilLulusan.cpl_id], references: [cpl.id] }),
  profilLulusan: one(profilLulusan, { fields: [cplProfilLulusan.profil_lulusan_id], references: [profilLulusan.id] }),
}))

export const cplIs2020AreaRelations = relations(cplIs2020Area, ({ one }) => ({
  cpl: one(cpl, { fields: [cplIs2020Area.cpl_id], references: [cpl.id] }),
  is2020Area: one(is2020Area, { fields: [cplIs2020Area.is2020_area_id], references: [is2020Area.id] }),
}))

export const mataKuliahRelations = relations(mataKuliah, ({ many }) => ({
  petaKurikulum: many(petaKurikulum),
  prasyaratDari: many(mkPrasyarat, { relationName: "mk_main" }),
  prasyaratUntuk: many(mkPrasyarat, { relationName: "mk_prasyarat" }),
  is2020AreaMappings: many(mkIs2020Area),
  dosirMk: many(dosirMk),
}))

export const mkPrasyaratRelations = relations(mkPrasyarat, ({ one }) => ({
  mk: one(mataKuliah, { fields: [mkPrasyarat.mk_id], references: [mataKuliah.id], relationName: "mk_main" }),
  prasyarat: one(mataKuliah, { fields: [mkPrasyarat.prasyarat_mk_id], references: [mataKuliah.id], relationName: "mk_prasyarat" }),
}))

export const mkIs2020AreaRelations = relations(mkIs2020Area, ({ one }) => ({
  mk: one(mataKuliah, { fields: [mkIs2020Area.mk_id], references: [mataKuliah.id] }),
  is2020Area: one(is2020Area, { fields: [mkIs2020Area.is2020_area_id], references: [is2020Area.id] }),
}))

export const petaKurikulumRelations = relations(petaKurikulum, ({ one }) => ({
  mk: one(mataKuliah, { fields: [petaKurikulum.mk_id], references: [mataKuliah.id] }),
  cpl: one(cpl, { fields: [petaKurikulum.cpl_id], references: [cpl.id] }),
}))

// ── Dosir relations ──
export const tahunAkademikRelations = relations(tahunAkademik, ({ many }) => ({
  dosirMk: many(dosirMk),
}))

export const dosirMkRelations = relations(dosirMk, ({ one, many }) => ({
  mk: one(mataKuliah, { fields: [dosirMk.mk_id], references: [mataKuliah.id] }),
  dosen: one(users, { fields: [dosirMk.dosen_id], references: [users.id] }),
  tahunAkademik: one(tahunAkademik, { fields: [dosirMk.tahun_akademik_id], references: [tahunAkademik.id] }),
  rps: many(rps),
  enrollments: many(enrollment),
}))

// ── RPS relations ──
export const rpsRelations = relations(rps, ({ one, many }) => ({
  dosirMk: one(dosirMk, { fields: [rps.dosir_mk_id], references: [dosirMk.id] }),
  approver: one(users, { fields: [rps.approved_by], references: [users.id] }),
  statusLogs: many(rpsStatusLog),
  cpmks: many(cpmk),
  pertemuans: many(rpsPertemuan),
  komponens: many(komponenPenilaian),
  referensis: many(rpsReferensi),
}))

export const rpsStatusLogRelations = relations(rpsStatusLog, ({ one }) => ({
  rps: one(rps, { fields: [rpsStatusLog.rps_id], references: [rps.id] }),
  changedBy: one(users, { fields: [rpsStatusLog.changed_by], references: [users.id] }),
}))

export const cpmkRelations = relations(cpmk, ({ one, many }) => ({
  rps: one(rps, { fields: [cpmk.rps_id], references: [rps.id] }),
  cplMappings: many(cpmkCpl),
  subCpmks: many(subCpmk),
  komponenMappings: many(komponenCpmk),
  attainments: many(cpmkAttainment),
}))

export const cpmkCplRelations = relations(cpmkCpl, ({ one }) => ({
  cpmk: one(cpmk, { fields: [cpmkCpl.cpmk_id], references: [cpmk.id] }),
  cpl: one(cpl, { fields: [cpmkCpl.cpl_id], references: [cpl.id] }),
}))

export const subCpmkRelations = relations(subCpmk, ({ one, many }) => ({
  cpmk: one(cpmk, { fields: [subCpmk.cpmk_id], references: [cpmk.id] }),
  pertemuanMappings: many(pertemuanSubCpmk),
}))

export const rpsPertemuanRelations = relations(rpsPertemuan, ({ one, many }) => ({
  rps: one(rps, { fields: [rpsPertemuan.rps_id], references: [rps.id] }),
  subCpmkMappings: many(pertemuanSubCpmk),
}))

export const pertemuanSubCpmkRelations = relations(pertemuanSubCpmk, ({ one }) => ({
  pertemuan: one(rpsPertemuan, { fields: [pertemuanSubCpmk.pertemuan_id], references: [rpsPertemuan.id] }),
  subCpmk: one(subCpmk, { fields: [pertemuanSubCpmk.sub_cpmk_id], references: [subCpmk.id] }),
}))

export const komponenPenilaianRelations = relations(komponenPenilaian, ({ one, many }) => ({
  rps: one(rps, { fields: [komponenPenilaian.rps_id], references: [rps.id] }),
  cpmkMappings: many(komponenCpmk),
  nilais: many(nilai),
}))

export const komponenCpmkRelations = relations(komponenCpmk, ({ one }) => ({
  komponen: one(komponenPenilaian, { fields: [komponenCpmk.komponen_id], references: [komponenPenilaian.id] }),
  cpmk: one(cpmk, { fields: [komponenCpmk.cpmk_id], references: [cpmk.id] }),
}))

export const rpsReferensiRelations = relations(rpsReferensi, ({ one }) => ({
  rps: one(rps, { fields: [rpsReferensi.rps_id], references: [rps.id] }),
}))

// ── Nilai relations ──
export const mahasiswaRelations = relations(mahasiswa, ({ many }) => ({
  enrollments: many(enrollment),
  cplAttainments: many(cplAttainment),
}))

export const enrollmentRelations = relations(enrollment, ({ one, many }) => ({
  mahasiswa: one(mahasiswa, { fields: [enrollment.mahasiswa_id], references: [mahasiswa.id] }),
  dosirMk: one(dosirMk, { fields: [enrollment.dosir_mk_id], references: [dosirMk.id] }),
  nilais: many(nilai),
  cpmkAttainments: many(cpmkAttainment),
}))

export const nilaiRelations = relations(nilai, ({ one }) => ({
  enrollment: one(enrollment, { fields: [nilai.enrollment_id], references: [enrollment.id] }),
  komponen: one(komponenPenilaian, { fields: [nilai.komponen_id], references: [komponenPenilaian.id] }),
}))

// ── Attainment relations ──
export const cpmkAttainmentRelations = relations(cpmkAttainment, ({ one }) => ({
  enrollment: one(enrollment, { fields: [cpmkAttainment.enrollment_id], references: [enrollment.id] }),
  cpmk: one(cpmk, { fields: [cpmkAttainment.cpmk_id], references: [cpmk.id] }),
}))

export const cplAttainmentRelations = relations(cplAttainment, ({ one }) => ({
  mahasiswa: one(mahasiswa, { fields: [cplAttainment.mahasiswa_id], references: [mahasiswa.id] }),
  cpl: one(cpl, { fields: [cplAttainment.cpl_id], references: [cpl.id] }),
  dosirMk: one(dosirMk, { fields: [cplAttainment.dosir_mk_id], references: [dosirMk.id] }),
}))

// ── Audit relations ──
export const auditLogRelations = relations(auditLog, ({ one }) => ({
  changedBy: one(users, { fields: [auditLog.changed_by], references: [users.id] }),
}))
