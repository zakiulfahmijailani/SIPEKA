# Agent Specification — Sistem Manajemen Kurikulum OBE
## Workflow, Roles & Task Decomposition for AI Agents
**Versi:** 1.0 | **Tanggal:** April 2026

---

## 1. System Overview untuk Agent

Kamu membangun sistem web berbasis Next.js + Supabase (atau stack setara) untuk mengelola kurikulum OBE (Outcome-Based Education) Prodi Sistem Informasi S1. Sistem ini diakses oleh 4 role pengguna. Prioritas: **fungsionalitas & data integrity** di atas estetika.

Referensi utama:
- `prd-kurikulum-si-is2020.md` → fitur lengkap, seed data, scope
- `domain-model-kurikulum-si.md` → schema database & business logic
- `claude-prompts-kurikulum-si.md` → prompt templates untuk fitur AI assist

---

## 2. Pembagian Task per Agent

### Agent 1: Database & API Agent
**Tanggung jawab:**
- Setup database schema sesuai domain model (Section 2, domain-model file)
- Buat semua API endpoints / server actions
- Implementasi semua business logic kalkulasi (Section 3, domain-model file)
- Seed data awal: IS2020 realms/areas, CPL, MK, PetaKurikulum

**Task list:**
1. Create all database tables dengan constraints dan indexes
2. Seed IS2020Realm (6 realm) dan IS2020Area (18 area) — data statis, tidak bisa diubah user
3. Seed CPL (10 CPL dari PRD Section 6.1)
4. Seed MataKuliah (~45 MK dari CPL matrix)
5. Seed PetaKurikulum (matriks MK × CPL dari file `Matriks_CPL_20260311.xlsx`)
6. CRUD endpoints: Program, ProfilLulusan, CPL, MataKuliah, PetaKurikulum
7. CRUD endpoints: User, DosirMK
8. RPS endpoints: create, update, submit, approve, request-revision, get-by-dosir-mk
9. CPMK + SubCPMK + Pertemuan + KomponenPenilaian CRUD (scoped ke RPS)
10. Nilai endpoint: input nilai, import CSV, recalculate
11. Calculation endpoint: trigger rekalkulasi CPLAttainment
12. Report endpoints: IS2020 coverage, CPL attainment per cohort, profil per mahasiswa
13. Import endpoints: CSV upload untuk MK, CPL, nilai mahasiswa
14. Export endpoints: RPS ke PDF/DOCX, laporan ke Excel
15. Audit log middleware

**Aturan penting:**
- Semua write operations harus mencatat ke AuditLog
- Soft delete: set `is_active = false`, bukan hapus row
- Validasi bobot total komponen = 100 sebelum RPS bisa disubmit
- Kalkulasi CPLAttainment harus bisa di-trigger manual oleh Kaprodi (bukan hanya otomatis)

---

### Agent 2: Auth & Role Management Agent
**Tanggung jawab:**
- Setup autentikasi (Supabase Auth atau NextAuth)
- Implementasi RBAC: 4 role (SUPER_ADMIN, KAPRODI, DOSEN, VIEWER)
- Guard semua routes dan API endpoints berdasarkan role
- UI manajemen pengguna untuk Super Admin

**Task list:**
1. Setup auth provider (email/password)
2. Buat middleware role guard untuk semua routes
3. Halaman login
4. Halaman manajemen user (Super Admin only): list users, tambah user, assign role, activate/deactivate
5. Halaman profil pengguna (self-service: ganti password, update nama)

**Permission matrix (implementasikan sebagai constants/enum):**

```
Entity              | SUPER_ADMIN | KAPRODI | DOSEN        | VIEWER
--------------------|-------------|---------|--------------|--------
Program             | CRUD        | R       | R            | R
ProfilLulusan       | CRUD        | CRUD    | R            | R
CPL                 | CRUD        | CRUD    | R            | R
IS2020Area          | R           | R       | R            | R
MataKuliah          | CRUD        | CRUD    | R            | R
PetaKurikulum       | CRUD        | CRUD    | R            | R
DosirMK             | CRUD        | CRUD    | R (own only) | R
RPS                 | CRUD        | CRU+Approve | CRU (own)| R
CPMK/SubCPMK        | CRUD        | CRUD    | CRUD (own RPS)| R
KomponenPenilaian   | CRUD        | CRUD    | CRUD (own RPS)| R
Nilai               | CRUD        | R       | CRUD (own MK)| R
Mahasiswa           | CRUD        | CRUD    | R            | R
User                | CRUD        | R       | R (self)     | R
AuditLog            | R           | R       | -            | -
Reports/Dashboard   | ALL         | ALL     | OWN          | ALL
```

---

### Agent 3: Master Data UI Agent
**Tanggung jawab:**
- Semua halaman CRUD untuk master data
- Halaman peta kurikulum (matriks interaktif)
- Import/export master data

**Halaman yang harus dibuat:**

**3.1 Dashboard Kaprodi** (`/dashboard`)
- Summary cards: jumlah MK, CPL, mahasiswa aktif
- Status RPS: bar chart (DRAFT / SUBMITTED / APPROVED / REVISION)
- IS2020 Required coverage: heatmap kecil (merah = belum cover, hijau = sudah cover)
- CPL attainment alert: list CPL yang < threshold

**3.2 Manajemen CPL** (`/master/cpl`)
- Tabel list CPL: kode, domain, rumusan (truncated), mapping PL, mapping IS2020
- Form tambah/edit CPL:
  - Kode (text), Slug (text), Domain (dropdown 4 pilihan), Rumusan (textarea)
  - Checkboxes multi-select: PL (dari master PL)
  - Checkboxes multi-select: IS2020 Area (dikelompokkan per realm)
- Toggle aktif/nonaktif (bukan delete)

**3.3 Manajemen Mata Kuliah** (`/master/matakuliah`)
- Tabel list dengan filter: semester, track, jenis, status
- Form tambah/edit MK: semua field dari entity MataKuliah
- Multi-select IS2020 Area mapping (primary/secondary)
- Multi-select prasyarat

**3.4 Peta Kurikulum** (`/kurikulum/peta`)
- Matriks interaktif: baris = MK dikelompokkan per semester, kolom = CPL (CPL01–CPL10)
- Setiap cell: checkbox (aktif/nonaktif) + dropdown bobot (1/2/3)
- Row highlight saat hover
- Summary di bawah: berapa CPL yang ter-cover per MK (bar mini)
- Export ke Excel button

**3.5 Manajemen Profil Lulusan** (`/master/profil-lulusan`)
- List PL dengan form sederhana

**3.6 Referensi IS2020** (`/referensi/is2020`)
- Read-only. Tampilan: accordion per realm, tiap area bisa expand untuk lihat deskripsi
- Visual indicator Required vs Elective

**3.7 Import Data** (`/import`)
- Upload CSV/Excel untuk: MK, CPL, nilai mahasiswa
- Preview sebelum import (tabel 10 rows pertama)
- Error report jika ada row yang gagal validasi

---

### Agent 4: RPS Builder Agent
**Tanggung jawab:**
- Form RPS multi-section (wizard atau single-page dengan accordion)
- Export PDF dan DOCX
- Status workflow

**Halaman yang harus dibuat:**

**4.1 Daftar RPS Dosen** (`/rps`)
- Dosen: list MK yang diampu + status RPS per tahun akademik
- Kaprodi: semua MK + filter by status, dosen, semester

**4.2 RPS Form** (`/rps/[id]/edit`)

Tampilan: single-page dengan 5 section accordion/tab:

**Section A — Identitas (read-only, dari master data):**
- Nama Prodi, Nama MK, Kode, SKS (teori+praktik), Semester, Tahun Akademik
- Dosen Pengampu (nama), Prasyarat MK

**Section B — CPL & CPMK:**
- List CPL yang dibebankan (read-only chips/badges)
- Form dinamis CPMK:
  - Tombol "Tambah CPMK"
  - Per CPMK: input deskripsi + multi-select CPL (hanya dari list CPL yang ter-assign)
  - Per CPMK: sub-form Sub-CPMK dengan tombol "Tambah Sub-CPMK"
  - Per Sub-CPMK: input deskripsi + dropdown level Bloom (C1–C6 dengan label verba)
  - Drag-and-drop untuk reorder (opsional, bisa skip untuk v1)

**Section C — Rencana Pertemuan:**
- Tabel 16 baris (satu per minggu)
- Kolom: Minggu, Sub-CPMK (multi-select checkbox), Materi, Metode, Media/Tools, Waktu
- "Copy dari minggu sebelumnya" button untuk efisiensi

**Section D — Penilaian:**
- Form dinamis komponen:
  - Tombol "Tambah Komponen"
  - Per komponen: nama, tipe (Formatif/Sumatif), bobot (%), CPMK yang diukur (multi-select)
- Live counter total bobot (harus = 100% untuk bisa submit)
- Warning jika total ≠ 100

**Section E — Referensi:**
- List referensi dengan type (Utama/Tambahan) dan teks bebas
- Tombol tambah/hapus referensi

**Footer action bar (sticky):**
- "Simpan Draft" (save tanpa validasi penuh)
- "Submit ke Kaprodi" (validasi penuh, ubah status ke SUBMITTED)
- Status badge saat ini

**4.3 RPS View (Kaprodi)** (`/rps/[id]/review`)
- Tampilan read-only versi preview format resmi
- Tombol: "Setujui", "Minta Revisi" (+ textarea catatan revisi)

**4.4 RPS Export:**
- Button "Export PDF" dan "Export Word (.docx)"
- Format output mengikuti template resmi RPS prodi (lihat bagian template di bawah)

**Template Format RPS (untuk PDF/DOCX output):**
```
RENCANA PEMBELAJARAN SEMESTER (RPS)
=====================================
Program Studi    : [nama prodi]
Mata Kuliah      : [nama MK] / [nama MK english]
Kode Mata Kuliah : [kode MK]
Bobot            : [sks] SKS (Teori [sks_teori] SKS + Praktik [sks_praktik] SKS)
Semester         : [semester rekomendasi]
Tahun Akademik   : [tahun akademik]
Dosen Pengampu   : [nama dosen]
Prasyarat        : [daftar prasyarat, atau "-"]

A. CAPAIAN PEMBELAJARAN LULUSAN (CPL) YANG DIBEBANKAN:
   [tabel: Kode CPL | Domain | Rumusan]

B. CAPAIAN PEMBELAJARAN MATA KULIAH (CPMK):
   [tabel: Kode CPMK | Deskripsi | CPL yang Diturunkan]

C. SUB-CAPAIAN PEMBELAJARAN MATA KULIAH (Sub-CPMK):
   [tabel: Kode | Deskripsi | Level Bloom | CPMK Induk]

D. RENCANA PEMBELAJARAN:
   [tabel 16 baris: Minggu | Sub-CPMK | Materi | Metode | Media | Waktu]

E. PENILAIAN:
   [tabel: Komponen | Tipe | Bobot | CPMK yang Diukur]

F. REFERENSI:
   Utama:
   [numbered list referensi utama]
   Tambahan:
   [numbered list referensi tambahan]
```

---

### Agent 5: Nilai & Tracking CPL Agent
**Tanggung jawab:**
- Input nilai mahasiswa
- Kalkulasi otomatis CPL attainment
- Dashboard & laporan

**Halaman yang harus dibuat:**

**5.1 Input Nilai** (`/nilai/[dosir_mk_id]`)
- Tampilkan daftar mahasiswa yang enrolled
- Tabel: kolom = komponen penilaian (dari RPS yang sudah approved), baris = mahasiswa
- Inline edit nilai per cell (0–100)
- Import nilai dari CSV (template downloadable)
- Tombol "Hitung Ulang CPL" setelah semua nilai terisi
- Summary di bawah: distribusi nilai per komponen (histogram mini)

**5.2 Dashboard CPL Attainment** (`/laporan/cpl-attainment`)
- Filter: angkatan, tahun akademik
- Bar chart: rata-rata attainment per CPL untuk cohort yang dipilih
- Tabel detail: baris = mahasiswa, kolom = CPL (kode), cell = nilai attainment
  - Color-coding: ≥ threshold = hijau, < threshold = merah
- Tombol export Excel

**5.3 Profil CPL per Mahasiswa** (`/laporan/mahasiswa/[id]`)
- Header: NIM, nama, angkatan, track
- Radar chart 10 CPL (nilai 0–100)
- Tabel detail per CPL: nilai attainment, status (Tercapai/Belum), kontribusi dari MK mana saja
- Accordion per MK: nilai per CPMK yang berkontribusi ke CPL

**5.4 Dashboard IS2020 Coverage** (`/laporan/is2020-coverage`)
- Heatmap/matriks: baris = IS2020 Area (dikelompokkan per realm), kolom = MataKuliah
- Cell hijau = MK di-mapping ke area ini, kosong = tidak
- Summary per area: total MK yang cover, status ADEQUATE/MINIMAL/UNCOVERED
- Required areas yang UNCOVERED diberi label merah + warning message

---

## 3. Routing Structure

```
/                         → redirect ke /dashboard
/login                    → halaman login
/dashboard                → dashboard utama (Kaprodi) atau RPS list (Dosen)

/master/
  cpl                     → CRUD CPL
  matakuliah              → CRUD MK
  profil-lulusan          → CRUD PL
  mahasiswa               → CRUD mahasiswa
  dosen                   → CRUD pengguna (Super Admin only)

/kurikulum/
  peta                    → matriks MK × CPL (peta kurikulum)
  peta/import             → import dari excel

/referensi/
  is2020                  → referensi IS2020 (read-only)

/rps                      → daftar RPS
/rps/new                  → pilih MK untuk buat RPS baru
/rps/[id]                 → view RPS
/rps/[id]/edit            → edit RPS (dosen)
/rps/[id]/review          → review RPS (kaprodi)

/nilai/
  [dosir_mk_id]           → input nilai mahasiswa

/laporan/
  cpl-attainment          → dashboard attainment CPL
  mahasiswa/[id]          → profil CPL per mahasiswa
  is2020-coverage         → dashboard IS2020 coverage

/import                   → import data (MK, CPL, nilai)
/settings                 → konfigurasi (threshold CPL, tahun akademik aktif)
/audit                    → audit log (Super Admin + Kaprodi)
```

---

## 4. Key UX Rules (Fungsional, Bukan Estetis)

1. **Auto-save draft:** RPS form auto-save setiap 30 detik atau saat user berpindah section
2. **Validation inline:** error muncul langsung di bawah field, bukan hanya saat submit
3. **Konfirmasi destruktif:** soft delete dan status change harus ada konfirmasi dialog
4. **Loading state:** setiap operasi async (simpan, hitung, export) harus ada loading indicator
5. **Empty state:** setiap halaman tabel yang kosong harus ada pesan dan tombol aksi
6. **Breadcrumb navigasi:** agar dosen tidak tersesat antar halaman
7. **Sticky action bar di form RPS:** tombol save dan submit harus selalu terlihat saat scroll

---

## 5. API Endpoint Reference

### Auth
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Master Data
- `GET/POST /api/cpl`
- `GET/PATCH/DELETE /api/cpl/[id]`
- `GET/POST /api/matakuliah`
- `GET/PATCH/DELETE /api/matakuliah/[id]`
- `GET/POST/DELETE /api/peta-kurikulum` (bulk upsert)
- `GET /api/is2020-realm` (read-only)
- `GET /api/is2020-area` (read-only)

### RPS
- `GET /api/rps` (with filter: dosir_mk_id, status, dosen_id)
- `POST /api/rps` (create RPS untuk dosir_mk)
- `GET /api/rps/[id]`
- `PATCH /api/rps/[id]` (update fields)
- `POST /api/rps/[id]/submit`
- `POST /api/rps/[id]/approve` (Kaprodi only)
- `POST /api/rps/[id]/request-revision` (Kaprodi only, + body: catatan)
- `GET /api/rps/[id]/export/pdf`
- `GET /api/rps/[id]/export/docx`
- `GET/POST/DELETE /api/rps/[id]/cpmk`
- `GET/POST/DELETE /api/rps/[id]/cpmk/[cpmk_id]/sub-cpmk`
- `GET/POST/DELETE /api/rps/[id]/pertemuan`
- `GET/POST/DELETE /api/rps/[id]/komponen-penilaian`

### Nilai & Kalkulasi
- `GET /api/nilai/[dosir_mk_id]` (semua nilai untuk MK ini)
- `POST /api/nilai/[dosir_mk_id]/input` (batch upsert nilai)
- `POST /api/nilai/[dosir_mk_id]/import-csv`
- `POST /api/nilai/[dosir_mk_id]/calculate` (trigger kalkulasi CPL attainment)
- `GET /api/template/nilai-csv/[dosir_mk_id]` (download template CSV)

### Laporan
- `GET /api/laporan/cpl-attainment?angkatan=&tahun_akademik=`
- `GET /api/laporan/mahasiswa/[mahasiswa_id]/cpl-profile`
- `GET /api/laporan/is2020-coverage`
- `GET /api/laporan/rps-status-summary`

### Import
- `POST /api/import/matakuliah`
- `POST /api/import/cpl`
- `POST /api/import/peta-kurikulum`

