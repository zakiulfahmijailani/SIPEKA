# Product Requirements Document (PRD)
## Sistem Manajemen Kurikulum OBE — Prodi Sistem Informasi
**Standar Acuan:** ACM/AIS IS2020, SN-DIKTI/Permendikbud 53/2023, KKNI Level 6
**Versi:** 1.0 | **Tanggal:** April 2026
**Tujuan Dokumen:** Menjadi single source of truth bagi AI Agents dalam membangun sistem kurikulum berbasis OBE yang fungsional, tidak perlu estetika berlebihan, prioritas utama adalah data integrity dan kemudahan pengisian oleh dosen.

---

## 1. Latar Belakang & Tujuan

Program Studi S1 Sistem Informasi sedang menyusun kurikulum baru berbasis OBE (Outcome-Based Education) dengan standar internasional IS2020 dari ACM/AIS. Proses ini melibatkan banyak dosen yang perlu:
- Memahami mapping CPL (Capaian Pembelajaran Lulusan) ke mata kuliah masing-masing
- Menyusun RPS (Rencana Pembelajaran Semester) yang konsisten dan terhubung ke CPL
- Melacak capaian CPL mahasiswa secara otomatis dari nilai yang diinput

**Masalah saat ini:** Semua proses di atas dilakukan manual, tidak konsisten antar dosen, sulit diaudit, dan tidak terhubung ke standar IS2020.

**Solusi:** Platform web kolaboratif berbasis peran (role-based) yang memungkinkan:
1. Admin/Kaprodi mengelola master data (CPL, MK, peta kurikulum, IS2020 referensi)
2. Dosen mengisi RPS dengan form terstruktur — tidak perlu tahu detail teknis CPL, sistem yang auto-link
3. Sistem otomatis menghitung capaian CPL dari nilai mahasiswa
4. Dashboard visualisasi coverage IS2020 dan attainment CPL per cohort

---

## 2. User Roles & Hak Akses

| Role | Deskripsi | Entitas yang Dikelola |
|------|-----------|----------------------|
| **Super Admin** | IT/admin teknis sistem | Semua entitas, konfigurasi sistem, import/export data |
| **Kaprodi / Tim Kurikulum** | Ketua prodi dan tim penyusun kurikulum | CPL, PL, Peta Kurikulum, MK master, IS2020 mapping, laporan |
| **Dosen Pengampu** | Dosen pemegang mata kuliah | RPS MK yang diampu, CPMK, Sub-CPMK, komponen penilaian, input nilai |
| **Viewer** | Asesor internal / penjaminan mutu | Read-only: semua laporan, RPS approved, dashboard CPL |

Aturan akses:
- Dosen hanya bisa melihat dan mengedit MK yang ditugaskan kepada mereka
- RPS hanya bisa disubmit (bukan approve) oleh Dosen
- Approval RPS dilakukan oleh Kaprodi
- Perubahan pada CPL dan Peta Kurikulum hanya bisa dilakukan oleh Kaprodi/Super Admin
- Semua perubahan data dicatat di audit log (who, what, when)

---

## 3. Scope

### 3.1 In Scope (Versi 1.0)

**Modul 1 — Master Data & Referensi**
- CRUD Profil Lulusan (PL)
- CRUD CPL dengan domain (Sikap/KU/KK/Pengetahuan) dan mapping ke PL + IS2020
- Tabel referensi IS2020 Competency Realm & Area (read-only, pre-loaded)
- CRUD Katalog Mata Kuliah (kode, nama, SKS, semester, track/peminatan, status wajib/pilihan)
- Import data dari Excel/CSV untuk seed awal

**Modul 2 — Peta Kurikulum**
- Matriks MK × CPL (siapa mengcover CPL apa)
- Bobot kontribusi MK ke setiap CPL yang di-cover (default: equal weight)
- Mapping MK ke IS2020 Competency Area
- Visualisasi peta kurikulum per semester

**Modul 3 — RPS Builder**
- Form RPS terstruktur untuk setiap MK
- Auto-populate: header MK, daftar CPL terkait, template struktur minggu-per-minggu
- Dosen mengisi: CPMK, Sub-CPMK, materi per pertemuan, metode pembelajaran, komponen penilaian + bobot, referensi
- Status workflow: Draft → Submitted → Approved / Revision Required
- Export RPS ke PDF dan DOCX

**Modul 4 — Penilaian & Tracking CPL**
- Definisi komponen penilaian per MK (nama, tipe, bobot, mapping ke CPMK)
- Input nilai mahasiswa per komponen (manual atau import CSV)
- Perhitungan otomatis: nilai CPMK → attainment CPL per mahasiswa
- Dashboard capaian CPL: per mahasiswa, per MK, per cohort/angkatan

**Modul 5 — Laporan & Dashboard**
- Dashboard IS2020 Coverage: heatmap realm/area yang tercover oleh kurikulum
- Dashboard CPL Attainment: grafik rata-rata per CPL per angkatan
- Laporan profil kompetensi per mahasiswa (radar chart CPL)
- Export laporan ke PDF/Excel
- Identifikasi CPL dan IS2020 area yang underperforming

### 3.2 Out of Scope (Versi 1.0)

- Tidak mengelola KRS/KHS penuh — hanya import daftar mahasiswa + nilai per komponen penilaian
- Tidak mengelola absensi, jadwal kuliah, keuangan
- Tidak terintegrasi dengan SIAKAD (integrasi direncanakan untuk versi berikutnya)
- Tidak ada fitur LMS (upload materi, forum diskusi, dsb.)
- Tidak ada aplikasi mobile — cukup responsive web

---

## 4. Functional Requirements

### FR-01: Autentikasi & Otorisasi
- Sistem mendukung login dengan email/password
- Setiap user memiliki role yang menentukan akses (lihat bagian 2)
- Session timeout setelah 2 jam tidak aktif
- Super Admin dapat mengelola akun dan role pengguna

### FR-02: Master CPL
- Sistem menyimpan CPL dengan field: kode (misal CPL01), slug (S1, S2, P1, P2, KU1, KK1, dst.), domain (Sikap/KU/KK/Pengetahuan), rumusan teks lengkap, status aktif
- CPL dapat di-mapping ke: satu atau lebih PL, satu atau lebih IS2020 Competency Area
- Kaprodi dapat tambah, edit, nonaktifkan CPL (soft delete — tidak boleh hard delete jika sudah ada RPS/penilaian terkait)
- Perubahan CPL yang sudah ada tidak langsung mempengaruhi RPS yang sudah approved (perlu trigger review)

### FR-03: Master IS2020 (Read-Only Reference)
- Sistem memuat 6 IS2020 Competency Realm dengan 18–19 Competency Area
- Data IS2020 pre-loaded saat setup, tidak bisa diubah oleh user biasa
- Setiap area memiliki: kode internal, nama resmi, realm induk, status (Required/Elective), deskripsi singkat
- IS2020 digunakan sebagai referensi untuk mapping CPL dan MK

**Daftar IS2020 Realm & Area yang harus di-load:**

| Realm | Area | Status |
|-------|------|--------|
| FOUND — Foundations | IS Foundations (IS_FND) | Required |
| DATA — Data/Information | Data & Information Management (DATA_DIM) | Required |
| DATA | Data & Business Analytics (DATA_DBA) | Elective |
| DATA | Data & Information Visualization (DATA_DIV) | Elective |
| TECH — Technology | IT Infrastructure (TECH_ITI) | Required |
| TECH | Secure Computing (TECH_SEC) | Required |
| TECH | Emerging Technologies (TECH_EMG) | Elective |
| DEVP — Development | Systems Analysis & Design (DEVP_SAD) | Required |
| DEVP | Application Development (DEVP_APPD) | Required |
| DEVP | Web Development (DEVP_WEBD) | Elective |
| DEVP | Mobile Development (DEVP_MOBD) | Elective |
| DEVP | User Interface Design (DEVP_USID) | Elective |
| ORGD — Organizational Domain | Ethics, Use & Implications (ORGD_ETHS) | Required |
| ORGD | IS Management & Strategy (ORGD_ISMS) | Required |
| ORGD | Digital Innovation (ORGD_DIGI) | Elective |
| ORGD | Business Process Management (ORGD_BPM) | Elective |
| INTG — Integration | IS Project Management (INTG_ISPM) | Required |
| INTG | IS Practicum (INTG_PRAC) | Required |

### FR-04: Katalog Mata Kuliah
- Field per MK: kode MK, nama Indonesia, nama Inggris, SKS total, SKS teori, SKS praktik, semester rekomendasi, jenis (wajib/pilihan), track peminatan (null/BIS/DSA), tipe aktivitas (kuliah/praktikum/lapangan), prasyarat (list kode MK), status aktif
- MK dapat di-mapping ke satu atau lebih IS2020 Competency Area (primary + secondary)
- Import MK dari CSV/Excel

### FR-05: Peta Kurikulum (Matriks MK × CPL)
- Kaprodi dapat mengatur MK mana yang berkontribusi ke CPL mana
- Setiap pasangan (MK, CPL) memiliki bobot kontribusi (default: 1, skala 1–3 atau persentase)
- Peta kurikulum divisualisasikan sebagai matriks tabel: baris = MK (dikelompokkan per semester), kolom = CPL
- Export matriks ke Excel

### FR-06: RPS Builder
- Dosen memilih MK yang diampu → sistem menampilkan CPL yang terkait MK tersebut (dari Peta Kurikulum)
- Form RPS terdiri dari bagian berikut (semua bagian ini harus ada, tidak bisa submit jika kosong):

  **Bagian A — Header (auto-filled dari master data):**
  - Nama Prodi, Nama MK, Kode MK, SKS, Semester, Tahun Akademik, Nama Dosen Pengampu, Prasyarat

  **Bagian B — CPL & CPMK:**
  - Daftar CPL yang dibebankan ke MK ini (read-only, dari Peta Kurikulum)
  - Dosen mengisi CPMK: minimal 1, maksimal 6 per MK
  - Setiap CPMK: kode otomatis (CPMK1, CPMK2, ...), deskripsi, CPL yang diturunkan (dropdown CPL terkait)
  - Setiap CPMK memiliki Sub-CPMK: minimal 1 per CPMK
  - Setiap Sub-CPMK: kode otomatis (CPMK1.1, CPMK1.2, ...), deskripsi, level Bloom (pilih dari dropdown C1–C6)

  **Bagian C — Rencana Pertemuan (16 minggu):**
  - Tabel 16 baris (1 per minggu/pertemuan)
  - Kolom: Minggu ke, Sub-CPMK yang dicapai (multi-select), Materi Pembelajaran, Metode Pembelajaran, Media/Tools, Estimasi Waktu

  **Bagian D — Komponen Penilaian:**
  - Nama komponen (misal: Quiz 1, Tugas Besar, UTS, UAS)
  - Bobot (%) — total harus 100%
  - CPMK/Sub-CPMK yang diukur (multi-select)
  - Tipe (Formatif/Sumatif)

  **Bagian E — Referensi:**
  - Referensi utama (minimal 1)
  - Referensi tambahan

- Status RPS: `DRAFT` → `SUBMITTED` → `APPROVED` / `REVISION_REQUIRED`
- Jika Kaprodi set `REVISION_REQUIRED`, harus ada catatan revisi yang tampil di dashboard dosen
- RPS yang sudah `APPROVED` bisa di-export sebagai PDF/DOCX dengan format resmi prodi

### FR-07: Input Nilai & Kalkulasi Capaian CPL
- Dosen input nilai mahasiswa per komponen penilaian (0–100)
- Import nilai dari CSV dengan template yang disediakan sistem
- Sistem menghitung nilai CPMK:
  ```
  Nilai_CPMK_n = Σ (nilai_komponen_i × bobot_komponen_i) untuk semua komponen yang map ke CPMK_n
  ```
- Sistem menghitung attainment CPL per mahasiswa:
  ```
  Attainment_CPL_x (mahasiswa m) = Σ (Nilai_CPMK_n × bobot_mk_di_peta_kurikulum) / Σ bobot_mk
  untuk semua MK yang telah ditempuh mahasiswa m dan mem-cover CPL_x
  ```
- Threshold capaian CPL: konfigurabel oleh Kaprodi (default: 60% = tercapai)

### FR-08: Dashboard & Laporan
- **Dashboard Kaprodi:**
  - Status RPS per MK: berapa yang masih Draft/Submitted/Approved
  - Coverage IS2020: tabel realm/area dengan indikator hijau/kuning/merah berdasarkan jumlah MK yang cover area tersebut
  - Rata-rata attainment CPL per angkatan (bar chart)
  - CPL yang attainment-nya di bawah threshold (alert/warning)

- **Dashboard Dosen:**
  - Daftar MK yang diampu + status RPS
  - Distribusi nilai CPMK mahasiswa untuk MK yang diampu (histogram)
  - Notifikasi RPS yang perlu direvisi

- **Laporan Mahasiswa:**
  - Radar chart 10 CPL per mahasiswa
  - Tabel nilai CPMK per MK yang sudah ditempuh
  - Status capaian CPL (Tercapai / Belum Tercapai)

- **Laporan IS2020 Coverage:**
  - Matriks: baris = IS2020 Competency Area, kolom = Mata Kuliah
  - Highlight area mandatory yang belum ter-cover

### FR-09: Audit Log
- Setiap perubahan pada entitas utama (CPL, MK, PetaKurikulum, RPS, nilai) disimpan dengan: user, timestamp, field yang berubah, nilai sebelum/sesudah
- Kaprodi/Super Admin dapat melihat audit log

### FR-10: Import/Export
- Import MK dari CSV/Excel (template disediakan)
- Import data CPL dari CSV/Excel
- Import nilai mahasiswa dari CSV
- Export matriks CPL × MK ke Excel
- Export RPS ke PDF dan DOCX
- Export laporan attainment CPL ke Excel

---

## 5. Non-Functional Requirements

| Aspek | Requirement |
|-------|-------------|
| **Performance** | Halaman dashboard load < 3 detik untuk cohort 200 mahasiswa |
| **Concurrency** | Mendukung 50 pengguna aktif bersamaan |
| **Security** | HTTPS, password hashing (bcrypt), RBAC ketat, input sanitization |
| **Usability** | Dosen non-teknis bisa mengisi RPS tanpa training > 30 menit |
| **Reliability** | Uptime 99% saat semester aktif |
| **Portability** | Berjalan di browser modern (Chrome, Firefox, Edge, Safari) tanpa instalasi |
| **Data Integrity** | Tidak ada hard delete pada data yang sudah direferensi; soft delete saja |
| **Audit** | Semua perubahan data utama tercatat di audit log |
| **Export** | Export PDF/DOCX RPS harus siap pakai (format resmi prodi, bukan raw data) |

---

## 6. Seed Data Awal

Saat pertama kali sistem di-setup, data berikut harus sudah tersedia:

### 6.1 CPL (dari Matriks_CPL_20260311.xlsx)

| Kode | Slug | Domain | Rumusan |
|------|------|--------|---------|
| CPL01 | S1 | Sikap | Lulusan mampu mendemonstrasikan pemahaman mendalamnya mengenai konsep kepedulian dan seluruh dimensinya dalam implikasi yang etis serta penerapan praktis dalam hubungan interpersonal, profesional dan interaksi dengan masyarakat. |
| CPL02 | S2 | Sikap | Lulusan mampu menunjukkan sikap dan tindakan yang berintegritas dengan mengedepankan kejujuran, tanggung jawab, dan etika dalam setiap aspek akademik, dunia professional, dan interaksi sosial di tengah masyarakat. |
| CPL03 | P1 | Pengetahuan | Mampu menjelaskan konsep dasar komputasi dan sistem informasi, menganalisis permasalahan organisasi yang kompleks, memahami siklus pengelolaan data menjadi informasi/pengetahuan, serta menyusun dasar argumentasi rekomendasi pengambilan keputusan berbasis sistem informasi dalam konteks organisasi. |
| CPL04 | P2 | Pengetahuan | Mampu menjelaskan prinsip etika profesi, tata kelola informasi dan data, privasi, keamanan, serta aspek kepatuhan dalam perancangan dan implementasi sistem informasi; termasuk memahami dampak sosial/organisasional dari pemanfaatan teknologi dan data. |
| CPL05 | KU1 | Keterampilan Umum | Lulusan mampu menerapkan design thinking untuk memecahkan masalah secara inovatif, memahami prinsip keberlanjutan dalam lingkungan dan kehidupan sosial, serta memiliki komitmen lifelong learning untuk terus berkembang dalam pengetahuan dalam setiap aspek akademik dan kehidupan profesional mereka. |
| CPL06 | KU2 | Keterampilan Umum | Lulusan mampu menunjukkan keterampilan kolaborasi, sehingga mereka mampu bekerja secara efektif dalam tim dengan menghargai beragam perspektif dan kompetensi, berkomunikasi dengan jelas serta berkontribusi secara konstruktif dalam mencapai tujuan bersama. |
| CPL07 | KU3 | Keterampilan Umum | Lulusan mampu menunjukkan sikap kritis dalam mengakses, mengevaluasi, dan memanfaatkan informasi digital dan teknologi dengan efektif dan etis dalam konteks akademik dan profesional. |
| CPL08 | KK1 | Keterampilan Khusus | Mampu merancang dan mengelola basis data, melakukan integrasi serta transformasi data, dan menerapkan teknik serta perangkat analisis data untuk menghasilkan informasi dan insight yang relevan bagi kebutuhan operasional maupun pengambilan keputusan. |
| CPL09 | KK2 | Keterampilan Khusus | Mampu merencanakan, membangun/menerapkan, mengoperasikan, memelihara, mengevaluasi, dan meningkatkan sistem informasi organisasi secara berkelanjutan untuk mendukung proses bisnis dan pencapaian sasaran strategis, dengan memperhatikan kualitas, keamanan, dan kesesuaian kebutuhan pengguna/organisasi. |
| CPL10 | KK3 | Keterampilan Khusus | Mampu merancang, membangun, dan mengevaluasi solusi e-business berbasis teknologi informasi meliputi perumusan model bisnis, validasi pasar sederhana, strategi pemasaran digital, serta perancangan proses operasional digital untuk mendukung inovasi dan pengembangan usaha di era ekonomi digital. |

### 6.2 Mata Kuliah (dari Matriks_CPL_20260311.xlsx)

Terlampir sebagai file terpisah `seed-matakuliah.csv`. Ringkasan:
- Total: ~45 mata kuliah
- 2 track peminatan: **BIS** (Business & Information Systems), **DSA** (Data Science & Analytics)
- Semester 1–8, beberapa MK memiliki komponen praktikum

### 6.3 Peta Kurikulum (Matriks MK × CPL)

Terlampir dalam file `Matriks_CPL_20260311.xlsx` — setiap tanda ✓ berarti MK tersebut berkontribusi ke CPL tersebut dengan bobot default = 1.

### 6.4 IS2020 Reference Data

Pre-loaded sesuai tabel di FR-03. Sumber: `is2020.pdf` Appendix 2 dan 3.

---

## 7. Technical Stack Suggestions (tidak memaksa, sesuai preferensi builder)

- **Frontend:** Next.js / React dengan TypeScript — atau framework apapun yang dikuasai builder
- **Backend:** Node.js / Python (FastAPI) — sesuaikan
- **Database:** PostgreSQL atau Supabase (sudah ada infrastruktur Supabase di tim)
- **Auth:** NextAuth / Supabase Auth / JWT
- **Export PDF/DOCX:** Puppeteer (PDF) + docx library (DOCX)
- **Deployment:** Vercel (frontend) + Supabase (DB + auth) — sudah familiar di tim

---

## 8. Prioritas Feature (MoSCoW)

| Modul | Priority | Notes |
|-------|----------|-------|
| Auth & Role Management | Must Have | |
| Master CPL, MK, IS2020 | Must Have | |
| Peta Kurikulum | Must Have | |
| RPS Builder (form + export PDF) | Must Have | Core use case |
| Input Nilai + Kalkulasi CPL | Must Have | |
| Dashboard IS2020 Coverage | Should Have | |
| Dashboard CPL Attainment | Should Have | |
| Laporan per Mahasiswa | Should Have | |
| Import CSV/Excel | Should Have | Mempercepat setup awal |
| Audit Log | Should Have | Untuk akreditasi |
| Notifikasi (email/in-app) | Could Have | |
| Integrasi SIAKAD | Won't Have (v1) | |

