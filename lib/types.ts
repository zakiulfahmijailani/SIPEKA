// TypeScript interfaces inferred from Drizzle schema
// Usage: import { type User, type MataKuliah } from "@/lib/types"

import type { InferSelectModel, InferInsertModel } from "drizzle-orm"
import {
  users,
  cpl,
  mataKuliah,
  petaKurikulum,
  tahunAkademik,
  dosirMk,
  rps,
  cpmk,
  subCpmk,
  pertemuan,
  komponenPenilaian,
  mahasiswa,
  enrollment,
  nilai,
  cpmkAttainment,
  cplAttainment,
  profilLulusan,
  is2020Realm,
  is2020Area,
  auditLog,
} from "@/db/schema"

// Select types (read from DB)
export type User = InferSelectModel<typeof users>
export type CPL = InferSelectModel<typeof cpl>
export type MataKuliah = InferSelectModel<typeof mataKuliah>
export type PetaKurikulum = InferSelectModel<typeof petaKurikulum>
export type TahunAkademik = InferSelectModel<typeof tahunAkademik>
export type DosirMK = InferSelectModel<typeof dosirMk>
export type RPS = InferSelectModel<typeof rps>
export type CPMK = InferSelectModel<typeof cpmk>
export type SubCPMK = InferSelectModel<typeof subCpmk>
export type Pertemuan = InferSelectModel<typeof pertemuan>
export type KomponenPenilaian = InferSelectModel<typeof komponenPenilaian>
export type Mahasiswa = InferSelectModel<typeof mahasiswa>
export type Enrollment = InferSelectModel<typeof enrollment>
export type Nilai = InferSelectModel<typeof nilai>
export type CPMKAttainment = InferSelectModel<typeof cpmkAttainment>
export type CPLAttainment = InferSelectModel<typeof cplAttainment>
export type ProfilLulusan = InferSelectModel<typeof profilLulusan>
export type IS2020Realm = InferSelectModel<typeof is2020Realm>
export type IS2020Area = InferSelectModel<typeof is2020Area>
export type AuditLog = InferSelectModel<typeof auditLog>

// Insert types (write to DB)
export type NewUser = InferInsertModel<typeof users>
export type NewCPL = InferInsertModel<typeof cpl>
export type NewMataKuliah = InferInsertModel<typeof mataKuliah>
export type NewRPS = InferInsertModel<typeof rps>
export type NewCPMK = InferInsertModel<typeof cpmk>
export type NewMahasiswa = InferInsertModel<typeof mahasiswa>
export type NewNilai = InferInsertModel<typeof nilai>
