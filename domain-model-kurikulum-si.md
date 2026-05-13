# Domain Model & Data Schema
## Sistem Manajemen Kurikulum OBE — Prodi Sistem Informasi
**Versi:** 1.0 | **Tanggal:** April 2026

---

## 1. Entity Relationship Overview

```
Program
  └─── ProfilLulusan (PL) [1:N]
  └─── CPL [1:N]
            └─── CPL_IS2020_Area (junction) → IS2020Area
            └─── CPL_PL (junction) → ProfilLulusan

IS2020Realm [1:N] IS2020Area

MataKuliah
  └─── PetaKurikulum (junction: MK × CPL + bobot)
  └─── MK_IS2020Area (junction: MK → IS2020Area, primary/secondary)
  └─── Prasyarat (self-referencing: MK → MK[])
  └─── DosirMK (MK + Dosen + TahunAkademik)

RPS (1:1 per DosirMK per TahunAkademik)
  └─── CPMK [1:N]
            └─── SubCPMK [1:N]
            └─── CPMK_CPL (junction: CPMK → CPL)
  └─── Pertemuan [1:16]
            └─── Pertemuan_SubCPMK (junction)
  └─── KomponenPenilaian [1:N]
            └─── KomponenPenilaian_CPMK (junction: komponen → CPMK[])
  └─── ReferensiRPS [1:N]
  └─── RPSStatusLog [1:N]

Mahasiswa
  └─── Enrollment (Mahasiswa × MK × Semester) [N:M]
  └─── NilaiKomponen (Mahasiswa × KomponenPenilaian) [N:M]
  └─── CPLAttainment (Mahasiswa × CPL × Semester) — computed/cached

User
  └─── UserRole
  └─── AuditLog
```

---

## 2. Entity Definitions

### 2.1 Program

```typescript
interface Program {
  id: string;                    // UUID
  name: string;                  // "Sistem Informasi"
  degree: string;                // "S1"
  faculty: string;               // "Fakultas ..."
  institution: string;           // Nama universitas
  accreditation: string | null;  // "Unggul", "Baik Sekali", dst.
  total_sks_required: number;    // Total SKS wajib lulus
  active_curriculum_year: string; // "2026"
  created_at: Date;
  updated_at: Date;
}
```

### 2.2 ProfilLulusan (PL)

```typescript
interface ProfilLulusan {
  id: string;               // UUID
  program_id: string;       // FK → Program.id
  kode: string;             // "PL1", "PL2", dst.
  nama: string;             // "Analis Sistem Informasi"
  deskripsi: string;        // Deskripsi peran, konteks kerja, tanggung jawab
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}
```

### 2.3 IS2020Realm

```typescript
interface IS2020Realm {
  id: string;               // "FOUND", "DATA", "TECH", "DEVP", "ORGD", "INTG"
  name: string;             // "Foundations", "Data/Information", dst.
  description: string;
  sort_order: number;
}
```

### 2.4 IS2020Area

```typescript
interface IS2020Area {
  id: string;               // "IS_FND", "DATA_DIM", "TECH_ITI", dst.
  realm_id: string;         // FK → IS2020Realm.id
  name: string;             // Nama resmi dari IS2020
  short_name: string;       // Singkatan untuk UI
  status: "REQUIRED" | "ELECTIVE";
  description: string;      // Ringkasan outcome kompetensi
  sort_order: number;
}
```

**Data seed wajib (18 area):**

| id | realm_id | name | status |
|----|----------|------|--------|
| IS_FND | FOUND | IS Foundations | REQUIRED |
| DATA_DIM | DATA | Data & Information Management | REQUIRED |
| DATA_DBA | DATA | Data & Business Analytics | ELECTIVE |
| DATA_DIV | DATA | Data & Information Visualization | ELECTIVE |
| TECH_ITI | TECH | IT Infrastructure | REQUIRED |
| TECH_SEC | TECH | Secure Computing | REQUIRED |
| TECH_EMG | TECH | Emerging Technologies | ELECTIVE |
| DEVP_SAD | DEVP | Systems Analysis & Design | REQUIRED |
| DEVP_APPD | DEVP | Application Development | REQUIRED |
| DEVP_WEBD | DEVP | Web Development | ELECTIVE |
| DEVP_MOBD | DEVP | Mobile Development | ELECTIVE |
| DEVP_USID | DEVP | User Interface Design | ELECTIVE |
| ORGD_ETHS | ORGD | Ethics, Use & Implications for Society | REQUIRED |
| ORGD_ISMS | ORGD | IS Management & Strategy | REQUIRED |
| ORGD_DIGI | ORGD | Digital Innovation | ELECTIVE |
| ORGD_BPM | ORGD | Business Process Management | ELECTIVE |
| INTG_ISPM | INTG | IS Project Management | REQUIRED |
| INTG_PRAC | INTG | IS Practicum | REQUIRED |

### 2.5 CPL

```typescript
interface CPL {
  id: string;               // UUID
  program_id: string;       // FK → Program.id
  kode: string;             // "CPL01"
  slug: string;             // "S1", "S2", "P1", "P2", "KU1", "KU2", "KU3", "KK1", "KK2", "KK3"
  domain: "SIKAP" | "PENGETAHUAN" | "KETERAMPILAN_UMUM" | "KETERAMPILAN_KHUSUS";
  rumusan: string;          // Teks lengkap rumusan CPL
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  // Relations (via junction tables):
  // pl_ids: ProfilLulusan[]
  // is2020_area_ids: IS2020Area[]
}
```

### 2.6 CPL_PL (Junction)

```typescript
interface CPL_PL {
  cpl_id: string;           // FK → CPL.id
  pl_id: string;            // FK → ProfilLulusan.id
  // PK: (cpl_id, pl_id)
}
```

### 2.7 CPL_IS2020Area (Junction)

```typescript
interface CPL_IS2020Area {
  cpl_id: string;           // FK → CPL.id
  is2020_area_id: string;   // FK → IS2020Area.id
  // PK: (cpl_id, is2020_area_id)
}
```

### 2.8 MataKuliah

```typescript
interface MataKuliah {
  id: string;               // UUID
  program_id: string;       // FK → Program.id
  kode: string;             // "SI101", "SI201", dst. — UNIQUE
  nama_id: string;          // Nama bahasa Indonesia
  nama_en: string;          // Nama bahasa Inggris
  sks_total: number;        // Total SKS
  sks_teori: number;
  sks_praktik: number;
  semester_rekomendasi: number; // 1–8
  jenis: "WAJIB" | "PILIHAN";
  track: null | "BIS" | "DSA"; // null = semua mahasiswa
  tipe_aktivitas: "KULIAH" | "PRAKTIKUM" | "KERJA_LAPANGAN" | "PENELITIAN";
  deskripsi: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  // Relations:
  // prasyarat: MataKuliah[] (via junction MK_Prasyarat)
  // is2020_areas: IS2020Area[] (via junction MK_IS2020Area)
}
```

### 2.9 MK_IS2020Area (Junction)

```typescript
interface MK_IS2020Area {
  mk_id: string;            // FK → MataKuliah.id
  is2020_area_id: string;   // FK → IS2020Area.id
  type: "PRIMARY" | "SECONDARY";
  // PK: (mk_id, is2020_area_id)
}
```

### 2.10 PetaKurikulum (Matriks MK × CPL)

```typescript
interface PetaKurikulum {
  id: string;               // UUID
  program_id: string;       // FK → Program.id
  mk_id: string;            // FK → MataKuliah.id
  cpl_id: string;           // FK → CPL.id
  bobot: number;            // 1, 2, atau 3 (default: 1)
                            // Atau persentase (0.0–1.0) — pilih satu konvensi, tetap konsisten
  // UNIQUE: (program_id, mk_id, cpl_id)
}
```

### 2.11 DosirMK (Assignment Dosen ke MK per Semester)

```typescript
interface DosirMK {
  id: string;               // UUID
  mk_id: string;            // FK → MataKuliah.id
  dosen_id: string;         // FK → User.id (dosen)
  tahun_akademik: string;   // "2026/2027"
  semester: "GANJIL" | "GENAP";
  kelas: string | null;     // "A", "B", null jika tidak ada kelas
  created_at: Date;
  // UNIQUE: (mk_id, dosen_id, tahun_akademik, semester, kelas)
}
```

### 2.12 RPS

```typescript
interface RPS {
  id: string;               // UUID
  dosir_mk_id: string;      // FK → DosirMK.id (1:1)
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "REVISION_REQUIRED";
  catatan_revisi: string | null; // Diisi Kaprodi jika REVISION_REQUIRED
  submitted_at: Date | null;
  approved_at: Date | null;
  approved_by: string | null; // FK → User.id
  version: number;          // Auto-increment per approval
  created_at: Date;
  updated_at: Date;
}
```

### 2.13 CPMK

```typescript
interface CPMK {
  id: string;               // UUID
  rps_id: string;           // FK → RPS.id
  kode: string;             // "CPMK1", "CPMK2", ... (auto-generated, scoped to RPS)
  deskripsi: string;        // Rumusan CPMK (kalimat lengkap)
  sort_order: number;
  // Relations:
  // cpl_ids: CPL[] (via junction CPMK_CPL)
  // sub_cpmks: SubCPMK[]
}
```

### 2.14 CPMK_CPL (Junction)

```typescript
interface CPMK_CPL {
  cpmk_id: string;          // FK → CPMK.id
  cpl_id: string;           // FK → CPL.id
  // PK: (cpmk_id, cpl_id)
  // CONSTRAINT: cpl_id harus termasuk dalam CPL yang ter-assign ke MK ini via PetaKurikulum
}
```

### 2.15 SubCPMK

```typescript
interface SubCPMK {
  id: string;               // UUID
  cpmk_id: string;          // FK → CPMK.id
  kode: string;             // "CPMK1.1", "CPMK1.2", ... (auto-generated)
  deskripsi: string;        // Rumusan Sub-CPMK
  level_bloom: "C1" | "C2" | "C3" | "C4" | "C5" | "C6";
  sort_order: number;
}
```

### 2.16 Pertemuan

```typescript
interface Pertemuan {
  id: string;               // UUID
  rps_id: string;           // FK → RPS.id
  minggu_ke: number;        // 1–16
  materi: string;           // Topik/materi pembelajaran
  metode: string;           // "Ceramah", "Diskusi", "Proyek", "Praktikum", dst.
  media_tools: string | null;
  estimasi_waktu: string | null; // "2 x 50 menit"
  // Relations:
  // sub_cpmks: SubCPMK[] (via junction Pertemuan_SubCPMK)
}
```

### 2.17 Pertemuan_SubCPMK (Junction)

```typescript
interface Pertemuan_SubCPMK {
  pertemuan_id: string;     // FK → Pertemuan.id
  sub_cpmk_id: string;      // FK → SubCPMK.id
  // PK: (pertemuan_id, sub_cpmk_id)
}
```

### 2.18 KomponenPenilaian

```typescript
interface KomponenPenilaian {
  id: string;               // UUID
  rps_id: string;           // FK → RPS.id
  nama: string;             // "Quiz 1", "Tugas Besar", "UTS", "UAS", dst.
  tipe: "FORMATIF" | "SUMATIF";
  bobot: number;            // Persentase (0–100). Total semua komponen per RPS = 100
  sort_order: number;
  // Relations:
  // cpmk_ids: CPMK[] (via junction KomponenPenilaian_CPMK)
}
```

### 2.19 KomponenPenilaian_CPMK (Junction)

```typescript
interface KomponenPenilaian_CPMK {
  komponen_id: string;      // FK → KomponenPenilaian.id
  cpmk_id: string;          // FK → CPMK.id
  // PK: (komponen_id, cpmk_id)
}
```

### 2.20 ReferensiRPS

```typescript
interface ReferensiRPS {
  id: string;               // UUID
  rps_id: string;           // FK → RPS.id
  tipe: "UTAMA" | "TAMBAHAN";
  teks: string;             // Format bebas: "Penulis (Tahun). Judul. Penerbit."
  sort_order: number;
}
```

### 2.21 RPSStatusLog

```typescript
interface RPSStatusLog {
  id: string;               // UUID
  rps_id: string;           // FK → RPS.id
  status_from: string;
  status_to: string;
  user_id: string;          // FK → User.id
  catatan: string | null;
  created_at: Date;
}
```

### 2.22 Mahasiswa

```typescript
interface Mahasiswa {
  id: string;               // UUID
  nim: string;              // UNIQUE
  nama: string;
  angkatan: number;         // 2022, 2023, 2024, dst.
  track: null | "BIS" | "DSA";
  status: "AKTIF" | "CUTI" | "LULUS" | "DO";
  program_id: string;       // FK → Program.id
}
```

### 2.23 Enrollment

```typescript
interface Enrollment {
  id: string;               // UUID
  mahasiswa_id: string;     // FK → Mahasiswa.id
  dosir_mk_id: string;      // FK → DosirMK.id
  tahun_akademik: string;
  semester: "GANJIL" | "GENAP";
  // UNIQUE: (mahasiswa_id, dosir_mk_id)
}
```

### 2.24 NilaiKomponen

```typescript
interface NilaiKomponen {
  id: string;               // UUID
  enrollment_id: string;    // FK → Enrollment.id
  komponen_id: string;      // FK → KomponenPenilaian.id
  nilai: number;            // 0.00 – 100.00
  created_at: Date;
  updated_at: Date;
  // UNIQUE: (enrollment_id, komponen_id)
}
```

### 2.25 CPLAttainment (Computed/Cached)

```typescript
interface CPLAttainment {
  id: string;               // UUID
  mahasiswa_id: string;     // FK → Mahasiswa.id
  cpl_id: string;           // FK → CPL.id
  tahun_akademik: string;   // Periode kapan dihitung
  nilai: number;            // 0.00 – 100.00 (hasil kalkulasi)
  status: "TERCAPAI" | "BELUM_TERCAPAI"; // berdasarkan threshold
  last_computed_at: Date;
  // UNIQUE: (mahasiswa_id, cpl_id, tahun_akademik)
}
```

### 2.26 User

```typescript
interface User {
  id: string;               // UUID
  email: string;            // UNIQUE
  nama: string;
  nidn: string | null;      // NIDN dosen
  role: "SUPER_ADMIN" | "KAPRODI" | "DOSEN" | "VIEWER";
  program_id: string;       // FK → Program.id
  is_active: boolean;
  created_at: Date;
  last_login_at: Date | null;
}
```

### 2.27 AuditLog

```typescript
interface AuditLog {
  id: string;               // UUID
  user_id: string;          // FK → User.id
  entity_type: string;      // "CPL", "MataKuliah", "RPS", "PetaKurikulum", dst.
  entity_id: string;        // ID dari entitas yang berubah
  action: "CREATE" | "UPDATE" | "DELETE" | "STATUS_CHANGE";
  changes: JSON;            // { field: { before: any, after: any } }
  created_at: Date;
  ip_address: string | null;
}
```

---

## 3. Calculation Rules (Business Logic)

### 3.1 Nilai CPMK per Mahasiswa per MK

```
Nilai_CPMK_n = Σ (nilai_komponen_i × bobot_komponen_i / 100)
               untuk setiap komponen i yang mapped ke CPMK_n
```

- Bobot komponen sudah dalam satuan persen (total semua komponen = 100)
- Jika satu komponen di-map ke 2 CPMK, komponen tersebut berkontribusi penuh ke **kedua** CPMK
- Jika mahasiswa tidak punya nilai untuk suatu komponen, nilai = 0 (bukan dikecualikan)

**Contoh:**
- CPMK1 diukur oleh: Quiz1 (bobot 20%), Tugas1 (bobot 30%)
- Mahasiswa dapat Quiz1=80, Tugas1=70
- Nilai_CPMK1 = (80 × 0.20) + (70 × 0.30) = 16 + 21 = 37 dari 50 poin yang bisa
- Konversi ke skala 100: Nilai_CPMK1 = 37 / (0.20+0.30) × 1 = 74

**Formula yang dipakai (normalized):**
```
Nilai_CPMK_n = Σ (nilai_komponen_i × bobot_i) / Σ bobot_i
               untuk semua komponen i yang map ke CPMK_n
```

### 3.2 Nilai CPL per Mahasiswa per MK

```
CPL_via_MK_x(mahasiswa, mk) = Σ (Nilai_CPMK_j) / count(CPMK yang map ke CPL_x di MK ini)
```

Ini adalah rata-rata sederhana nilai semua CPMK dalam satu MK yang mapped ke CPL_x.

### 3.3 Attainment CPL per Mahasiswa (Agregat Lintas MK)

```
Attainment_CPL_x(mahasiswa) =
  Σ [ CPL_via_MK_x(mahasiswa, mk_i) × bobot_mk_di_peta_kurikulum(mk_i, CPL_x) ]
  ─────────────────────────────────────────────────────────────────────────────
  Σ bobot_mk_di_peta_kurikulum(mk_i, CPL_x)
  
  untuk semua MK yang:
    1. Ada dalam PetaKurikulum untuk CPL_x, AND
    2. Mahasiswa sudah punya nilai akhir di MK tersebut
```

- Gunakan **bobot** dari tabel PetaKurikulum sebagai timbangan
- MK yang belum ditempuh mahasiswa **tidak diikutsertakan** dalam perhitungan
- MK Magang dan Tugas Akhir memiliki bobot yang sama dengan MK lain kecuali dikonfigurasi berbeda

### 3.4 Status Capaian

```
Status_CPL_x(mahasiswa) = 
  "TERCAPAI" if Attainment_CPL_x >= threshold_program
  "BELUM_TERCAPAI" otherwise
```

- `threshold_program` adalah nilai konfigurasi di level Program (default: 60.0)
- Kaprodi bisa mengubah threshold ini

### 3.5 IS2020 Coverage Score per MK

```
IS2020_Coverage_Area_y = count(MK yang memiliki mapping ke IS2020Area y)

IS2020_Coverage_Score_y =
  "ADEQUATE"    if IS2020_Coverage_Area_y >= 2
  "MINIMAL"     if IS2020_Coverage_Area_y == 1
  "UNCOVERED"   if IS2020_Coverage_Area_y == 0
```

Required areas yang "UNCOVERED" harus menghasilkan warning di dashboard Kaprodi.

---

## 4. Database Indexes (Rekomendasi)

```sql
-- Performance indexes
CREATE INDEX idx_peta_kurikulum_mk ON peta_kurikulum(mk_id);
CREATE INDEX idx_peta_kurikulum_cpl ON peta_kurikulum(cpl_id);
CREATE INDEX idx_rps_dosir_mk ON rps(dosir_mk_id);
CREATE INDEX idx_rps_status ON rps(status);
CREATE INDEX idx_cpmk_rps ON cpmk(rps_id);
CREATE INDEX idx_nilai_enrollment ON nilai_komponen(enrollment_id);
CREATE INDEX idx_nilai_komponen ON nilai_komponen(komponen_id);
CREATE INDEX idx_enrollment_mahasiswa ON enrollment(mahasiswa_id);
CREATE INDEX idx_cpl_attainment_mahasiswa ON cpl_attainment(mahasiswa_id);
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_dosir_mk_ta ON dosir_mk(tahun_akademik, semester);
```

---

## 5. Constraints & Validation Rules

1. **Bobot KomponenPenilaian:** SUM(bobot) per RPS HARUS = 100 (enforce di application layer, warning di UI)
2. **CPMK harus referensi CPL yang valid:** CPMK_CPL.cpl_id harus ada di PetaKurikulum untuk MK yang bersangkutan
3. **Soft delete only:** CPL, MataKuliah, ProfilLulusan tidak boleh hard-deleted jika sudah ada referensi
4. **RPS immutable setelah APPROVED:** Perubahan hanya bisa dilakukan dengan reset ke DRAFT + increment version
5. **Nilai valid:** NilaiKomponen.nilai ∈ [0, 100]
6. **Bobot PetaKurikulum:** bobot ∈ {1, 2, 3}
7. **Level Bloom valid:** SubCPMK.level_bloom ∈ {C1, C2, C3, C4, C5, C6}

