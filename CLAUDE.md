# CLAUDE.md — AI Agent Behavior Guide
## Sistem Manajemen Kurikulum OBE — Prodi Sistem Informasi

Dokumen ini mendefinisikan bagaimana AI agent (Claude/Antigravity) harus berperilaku saat membangun sistem ini.

---

## Project Identity

Kamu sedang membangun **Sistem Manajemen Kurikulum OBE** untuk Program Studi S1 Sistem Informasi.
Sistem ini adalah platform web yang digunakan oleh dosen dan kaprodi untuk mengelola kurikulum berbasis OBE
dengan standar internasional ACM/AIS IS2020.

**Prioritas mutlak:**
1. Data integrity — schema dan business logic harus benar
2. Functional completeness — semua fitur di PRD harus bisa berjalan
3. Role-based access — setiap endpoint harus diproteksi sesuai role
4. Kemudahan penggunaan — form yang mudah diisi dosen non-teknis

**Estetika/tampilan adalah prioritas rendah.** Fungsi dulu, tampil oke cukup.

---

## Dokumen Referensi

Baca semua dokumen ini sebelum mulai:

| File | Isi | Prioritas Baca |
|------|-----|----------------|
| `prd-kurikulum-si-is2020.md` | Functional requirements, seed data, scope | PERTAMA |
| `domain-model-kurikulum-si.md` | Database schema, entities, calculation rules | KEDUA |
| `agents-spec-kurikulum-si.md` | Task breakdown per agent, routing, API reference | KETIGA |
| `claude-prompts-kurikulum-si.md` | AI assist feature prompts | Saat implement fitur AI |

---

## Tech Stack yang Direkomendasikan

```
Frontend:   Next.js 15 (App Router) + TypeScript
Backend:    Next.js API Routes / Server Actions
Database:   Supabase (PostgreSQL)
Auth:       Supabase Auth
ORM:        Prisma atau Supabase SDK langsung
Styling:    Tailwind CSS (minimal, fungsional)
PDF Export: Puppeteer atau @react-pdf/renderer
DOCX:       docx npm package
Charts:     Chart.js atau Recharts
Deployment: Vercel + Supabase
```

Jika stack di atas tidak memungkinkan, gunakan stack yang paling dikuasai.
Yang tidak boleh berubah: PostgreSQL sebagai database, TypeScript sebagai bahasa.

---

## Coding Standards

### Naming Conventions
- Database tables: snake_case (`peta_kurikulum`, `cpl_attainment`)
- API routes: kebab-case (`/api/peta-kurikulum`, `/api/cpl-attainment`)
- TypeScript interfaces: PascalCase sesuai entity (`PetaKurikulum`, `CPLAttainment`)
- React components: PascalCase (`RpsForm`, `CPLMatrix`)
- Files: kebab-case (`rps-form.tsx`, `cpl-matrix.tsx`)

### Error Handling
- Setiap API route harus return error yang konsisten:
  ```json
  { "success": false, "error": "Pesan error yang jelas", "code": "ERROR_CODE" }
  ```
- Success response:
  ```json
  { "success": true, "data": {...} }
  ```

### Validation
- Gunakan Zod untuk schema validation di semua input API
- Validasi di server-side WAJIB, meskipun ada validasi di client-side

### Database Rules (PENTING)
- JANGAN hard-delete entitas yang sudah memiliki relasi (gunakan `is_active = false`)
- SELALU catat ke AuditLog untuk perubahan pada: CPL, MataKuliah, PetaKurikulum, RPS status
- Kalkulasi CPLAttainment TIDAK boleh berjalan real-time per request — gunakan background job atau trigger manual

### Security Rules
- Setiap API endpoint HARUS cek role sebelum eksekusi
- Dosen HANYA bisa akses resource miliknya (DosirMK yang di-assign kepadanya)
- Input mahasiswa/nilai HANYA bisa dilakukan oleh Dosen pengampu atau Admin
- Tidak ada endpoint publik (semua harus authenticated)

---

## Build Order (Rekomendasi)

Bangun dalam urutan ini untuk menghindari blocking:

1. **Database setup** — buat semua tables, seed IS2020 data
2. **Auth & middleware** — login, session, role guard
3. **Master data API** — CPL, MK, IS2020 CRUD
4. **Peta Kurikulum** — matriks MK × CPL
5. **RPS Builder** — form + CPMK/SubCPMK + Pertemuan + Komponen
6. **RPS Workflow** — submit → approve → revision
7. **RPS Export** — PDF dan DOCX
8. **Nilai & Kalkulasi** — input nilai, formula CPL attainment
9. **Dashboard & Laporan** — IS2020 coverage, CPL attainment, profil mahasiswa
10. **Import/Export** — CSV upload
11. **AI Assist features** — integrasi Claude API (opsional, implement terakhir)

---

## Seed Data yang Harus Ada Sejak Awal

1. **IS2020 Realm (6)** dan **IS2020 Area (18)** — lihat tabel di PRD FR-03
2. **CPL (10 CPL)** — lihat PRD Section 6.1 (data dari `Matriks_CPL_20260311.xlsx`)
3. **MataKuliah (~45 MK)** — dari matriks CPL, semua semester 1–8 + track peminatan
4. **PetaKurikulum** — semua tanda ✓ dari `Matriks_CPL_20260311.xlsx` sebagai bobot = 1
5. **1 Super Admin account** — email: admin@prodi.ac.id, password: Change_Me_123!

---

## Known Constraints & Gotchas

1. **Bobot total komponen penilaian = 100** — ini harus divalidasi sebelum RPS bisa submit. JANGAN lewatkan.
2. **CPL yang ter-assign ke CPMK harus valid** — CPMK hanya boleh referensi CPL yang ada di PetaKurikulum untuk MK tersebut. Validasi ini penting.
3. **RPS versioning** — saat Kaprodi minta revisi dan dosen submit ulang, version RPS harus naik. History status harus tersimpan di RPSStatusLog.
4. **Kalkulasi CPL hanya untuk MK yang sudah selesai** — jangan ikutkan MK yang nilainya belum diinput.
5. **Track peminatan** — mahasiswa track BIS tidak mengambil MK DSA dan sebaliknya. Saat kalkulasi CPL, filter MK sesuai track mahasiswa.
6. **Magang & Tugas Akhir** — kedua MK ini di-map ke SEMUA CPL (lihat matriks). Bobot defaultnya = 1 seperti MK lain, kecuali nanti dikonfigurasi berbeda oleh Kaprodi.

---

## Testing Minimal yang Harus Lulus

Sebelum deliver, pastikan skenario berikut bisa dilakukan end-to-end:

1. Kaprodi dapat login dan melihat dashboard
2. Kaprodi dapat menambah MK baru dan set mapping ke CPL + IS2020
3. Kaprodi dapat assign dosen ke MK untuk semester tertentu
4. Dosen dapat login dan melihat MK yang diampu
5. Dosen dapat membuat RPS dari scratch (semua 5 section) dan submit
6. Kaprodi dapat approve RPS dan dosen bisa export ke PDF
7. Dosen dapat input nilai mahasiswa dan sistem menghitung CPMK
8. Kaprodi dapat melihat dashboard CPL attainment dengan data yang benar
9. Kaprodi dapat melihat IS2020 coverage dan tahu area mana yang belum ter-cover
10. Super Admin dapat tambah user baru dengan role Dosen

