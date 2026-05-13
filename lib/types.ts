import { InferSelectModel, InferInsertModel } from "drizzle-orm"
import * as schema from "@/db/schema"

// === Select types (for reading from DB) ===

// Auth
export type User = InferSelectModel<typeof schema.users>
export type Account = InferSelectModel<typeof schema.accounts>
export type Session = InferSelectModel<typeof schema.sessions>

// Reference
export type IS2020Realm = InferSelectModel<typeof schema.is2020Realm>
export type IS2020Area = InferSelectModel<typeof schema.is2020Area>
export type ProfilLulusan = InferSelectModel<typeof schema.profilLulusan>

// Kurikulum
export type CPL = InferSelectModel<typeof schema.cpl>
export type CplProfilLulusan = InferSelectModel<typeof schema.cplProfilLulusan>
export type CplIs2020Area = InferSelectModel<typeof schema.cplIs2020Area>
export type MataKuliah = InferSelectModel<typeof schema.mataKuliah>
export type MkPrasyarat = InferSelectModel<typeof schema.mkPrasyarat>
export type MkIs2020Area = InferSelectModel<typeof schema.mkIs2020Area>
export type PetaKurikulum = InferSelectModel<typeof schema.petaKurikulum>

// Dosir
export type TahunAkademik = InferSelectModel<typeof schema.tahunAkademik>
export type DosirMk = InferSelectModel<typeof schema.dosirMk>

// RPS
export type RPS = InferSelectModel<typeof schema.rps>
export type RpsStatusLog = InferSelectModel<typeof schema.rpsStatusLog>
export type CPMK = InferSelectModel<typeof schema.cpmk>
export type CpmkCpl = InferSelectModel<typeof schema.cpmkCpl>
export type SubCPMK = InferSelectModel<typeof schema.subCpmk>
export type RpsPertemuan = InferSelectModel<typeof schema.rpsPertemuan>
export type PertemuanSubCpmk = InferSelectModel<typeof schema.pertemuanSubCpmk>
export type KomponenPenilaian = InferSelectModel<typeof schema.komponenPenilaian>
export type KomponenCpmk = InferSelectModel<typeof schema.komponenCpmk>
export type RpsReferensi = InferSelectModel<typeof schema.rpsReferensi>

// Nilai
export type Mahasiswa = InferSelectModel<typeof schema.mahasiswa>
export type Enrollment = InferSelectModel<typeof schema.enrollment>
export type Nilai = InferSelectModel<typeof schema.nilai>

// Attainment
export type CpmkAttainment = InferSelectModel<typeof schema.cpmkAttainment>
export type CplAttainment = InferSelectModel<typeof schema.cplAttainment>

// Audit
export type AuditLog = InferSelectModel<typeof schema.auditLog>

// === Insert types (for creating records) ===

export type NewUser = InferInsertModel<typeof schema.users>
export type NewIS2020Realm = InferInsertModel<typeof schema.is2020Realm>
export type NewIS2020Area = InferInsertModel<typeof schema.is2020Area>
export type NewProfilLulusan = InferInsertModel<typeof schema.profilLulusan>
export type NewCPL = InferInsertModel<typeof schema.cpl>
export type NewMataKuliah = InferInsertModel<typeof schema.mataKuliah>
export type NewPetaKurikulum = InferInsertModel<typeof schema.petaKurikulum>
export type NewTahunAkademik = InferInsertModel<typeof schema.tahunAkademik>
export type NewDosirMk = InferInsertModel<typeof schema.dosirMk>
export type NewRPS = InferInsertModel<typeof schema.rps>
export type NewCPMK = InferInsertModel<typeof schema.cpmk>
export type NewSubCPMK = InferInsertModel<typeof schema.subCpmk>
export type NewRpsPertemuan = InferInsertModel<typeof schema.rpsPertemuan>
export type NewKomponenPenilaian = InferInsertModel<typeof schema.komponenPenilaian>
export type NewMahasiswa = InferInsertModel<typeof schema.mahasiswa>
export type NewEnrollment = InferInsertModel<typeof schema.enrollment>
export type NewNilai = InferInsertModel<typeof schema.nilai>
export type NewAuditLog = InferInsertModel<typeof schema.auditLog>
