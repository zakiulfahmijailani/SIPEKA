// Seed Mata Kuliah
// Run with: npm run db:seed-mk
// Source: Matriks_CPL_Lama.xlsx

import { config } from "dotenv"
config({ path: ".env.local" })

import { db } from "./index"
import { mataKuliah } from "./schema"
import { eq } from "drizzle-orm"

type MkStatus = "WAJIB" | "PILIHAN"
type MkTrack = "UMUM" | "BIS" | "DSA"
type TipeAktivitas = "TEORI" | "PRAKTIKUM" | "TEORI_PRAKTIKUM" | "SEMINAR" | "PROYEK"

interface MkData {
  kode: string
  nama_id: string
  nama_en: string | null
  sks_teori: number
  sks_praktik: number
  semester_rekomendasi: number
  status: MkStatus
  track: MkTrack
  tipe_aktivitas: TipeAktivitas
}

// Kode MK dibuat berdasarkan pola SIF (Sistem Informasi) + 3 digit
// Catatan: kode bisa disesuaikan dengan kode resmi prodi
const mataKuliahData: MkData[] = [
  // ── SEMESTER 1 ─────────────────────────────────────────────────────
  {
    kode: "SIF101",
    nama_id: "Bahasa Inggris 1",
    nama_en: "English 1",
    sks_teori: 2, sks_praktik: 0,
    semester_rekomendasi: 1,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI",
  },
  {
    kode: "SIF102",
    nama_id: "Pengantar Teknologi Informasi",
    nama_en: "Introduction to Information Technology",
    sks_teori: 2, sks_praktik: 1,
    semester_rekomendasi: 1,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI_PRAKTIKUM",
  },
  {
    kode: "SIF103",
    nama_id: "Algoritma dan Pemrograman",
    nama_en: "Algorithm and Programming",
    sks_teori: 2, sks_praktik: 1,
    semester_rekomendasi: 1,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI_PRAKTIKUM",
  },
  {
    kode: "SIF104",
    nama_id: "Sistem Basis Data",
    nama_en: "Database Systems",
    sks_teori: 2, sks_praktik: 1,
    semester_rekomendasi: 1,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI_PRAKTIKUM",
  },
  {
    kode: "SIF105",
    nama_id: "Jaringan Komputer",
    nama_en: "Network Fundamental",
    sks_teori: 2, sks_praktik: 1,
    semester_rekomendasi: 1,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI_PRAKTIKUM",
  },
  {
    kode: "SIF106",
    nama_id: "Pengantar Bisnis dan Manajemen",
    nama_en: "Principles of Business and Management",
    sks_teori: 3, sks_praktik: 0,
    semester_rekomendasi: 1,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI",
  },

  // ── SEMESTER 2 ─────────────────────────────────────────────────────
  {
    kode: "SIF201",
    nama_id: "Bahasa Inggris 2",
    nama_en: "English 2",
    sks_teori: 2, sks_praktik: 0,
    semester_rekomendasi: 2,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI",
  },
  {
    kode: "SIF202",
    nama_id: "Struktur Data",
    nama_en: "Data Structure",
    sks_teori: 2, sks_praktik: 1,
    semester_rekomendasi: 2,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI_PRAKTIKUM",
  },
  {
    kode: "SIF203",
    nama_id: "Kepemimpinan Dinamis",
    nama_en: "Dynamic Leadership",
    sks_teori: 3, sks_praktik: 0,
    semester_rekomendasi: 2,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI",
  },
  {
    kode: "SIF204",
    nama_id: "Pengantar Statistik",
    nama_en: "Introduction to Statistics",
    sks_teori: 3, sks_praktik: 0,
    semester_rekomendasi: 2,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI",
  },
  {
    kode: "SIF205",
    nama_id: "Kewirausahaan yang Efektif",
    nama_en: "Effectual Entrepreneurship",
    sks_teori: 3, sks_praktik: 0,
    semester_rekomendasi: 2,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI",
  },
  {
    kode: "SIF206",
    nama_id: "Pemrograman Visual",
    nama_en: "Visual Programming",
    sks_teori: 2, sks_praktik: 1,
    semester_rekomendasi: 2,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI_PRAKTIKUM",
  },
  {
    kode: "SIF207",
    nama_id: "Konsep Sistem Informasi",
    nama_en: "Concept of Information Systems",
    sks_teori: 3, sks_praktik: 0,
    semester_rekomendasi: 2,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI",
  },

  // ── SEMESTER 3 ─────────────────────────────────────────────────────
  {
    kode: "SIF301",
    nama_id: "Statistik",
    nama_en: "Statistics",
    sks_teori: 3, sks_praktik: 0,
    semester_rekomendasi: 3,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI",
  },
  {
    kode: "SIF302",
    nama_id: "Aljabar Linier",
    nama_en: "Linear Algebra",
    sks_teori: 3, sks_praktik: 0,
    semester_rekomendasi: 3,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI",
  },
  {
    kode: "SIF303",
    nama_id: "Sistem Informasi Manajemen",
    nama_en: "Management Information Systems",
    sks_teori: 2, sks_praktik: 1,
    semester_rekomendasi: 3,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI_PRAKTIKUM",
  },
  {
    kode: "SIF304",
    nama_id: "Sistem Operasi",
    nama_en: "Operating Systems",
    sks_teori: 2, sks_praktik: 1,
    semester_rekomendasi: 3,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI_PRAKTIKUM",
  },
  {
    kode: "SIF305",
    nama_id: "Manajemen Pengetahuan",
    nama_en: "Knowledge Management",
    sks_teori: 3, sks_praktik: 0,
    semester_rekomendasi: 3,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI",
  },
  {
    kode: "SIF306",
    nama_id: "Manajemen Teknologi Informasi",
    nama_en: "IT Management",
    sks_teori: 3, sks_praktik: 0,
    semester_rekomendasi: 3,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI",
  },
  {
    kode: "SIF307",
    nama_id: "Pemrograman Bergerak",
    nama_en: "Mobile Programming",
    sks_teori: 2, sks_praktik: 1,
    semester_rekomendasi: 3,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI_PRAKTIKUM",
  },

  // ── SEMESTER 4 ─────────────────────────────────────────────────────
  {
    kode: "SIF401",
    nama_id: "Pengalihan LAN dan Nirkabel",
    nama_en: "LAN Switching and Wireless",
    sks_teori: 2, sks_praktik: 1,
    semester_rekomendasi: 4,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI_PRAKTIKUM",
  },
  {
    kode: "SIF402",
    nama_id: "Manajemen Pengetahuan Lanjut",
    nama_en: "Advanced Knowledge Management",
    sks_teori: 3, sks_praktik: 0,
    semester_rekomendasi: 4,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI",
  },
  {
    kode: "SIF403",
    nama_id: "Rekayasa Perangkat Lunak",
    nama_en: "Software Engineering",
    sks_teori: 3, sks_praktik: 0,
    semester_rekomendasi: 4,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI",
  },
  {
    kode: "SIF404",
    nama_id: "Pemrograman Berorientasi Objek",
    nama_en: "Object Oriented Programming",
    sks_teori: 2, sks_praktik: 1,
    semester_rekomendasi: 4,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI_PRAKTIKUM",
  },
  {
    kode: "SIF405",
    nama_id: "Analisis Perancangan Sistem Informasi",
    nama_en: "Information System Analysis and Design",
    sks_teori: 2, sks_praktik: 1,
    semester_rekomendasi: 4,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI_PRAKTIKUM",
  },
  {
    kode: "SIF406",
    nama_id: "Informasi dan Proses Bisnis",
    nama_en: "Information and Business Process",
    sks_teori: 3, sks_praktik: 0,
    semester_rekomendasi: 4,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI",
  },
  {
    kode: "SIF407",
    nama_id: "Sistem Informasi Enterprise Terpadu",
    nama_en: "Integrated Enterprise Information Systems",
    sks_teori: 3, sks_praktik: 0,
    semester_rekomendasi: 4,
    status: "PILIHAN", track: "BIS", tipe_aktivitas: "TEORI",
  },
  {
    kode: "SIF408",
    nama_id: "Sistem Basis Data Lanjut",
    nama_en: "Advanced Database Systems",
    sks_teori: 2, sks_praktik: 1,
    semester_rekomendasi: 4,
    status: "PILIHAN", track: "DSA", tipe_aktivitas: "TEORI_PRAKTIKUM",
  },

  // ── SEMESTER 5 ─────────────────────────────────────────────────────
  {
    kode: "SIF501",
    nama_id: "Bahasa Indonesia",
    nama_en: null,
    sks_teori: 2, sks_praktik: 0,
    semester_rekomendasi: 5,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI",
  },
  {
    kode: "SIF502",
    nama_id: "Kewirausahaan Berbasis Teknologi",
    nama_en: "Technopreneurship",
    sks_teori: 3, sks_praktik: 0,
    semester_rekomendasi: 5,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI",
  },
  {
    kode: "SIF503",
    nama_id: "Testing dan Implementasi Sistem Informasi",
    nama_en: "IS Testing and Implementation",
    sks_teori: 3, sks_praktik: 0,
    semester_rekomendasi: 5,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI",
  },
  {
    kode: "SIF504",
    nama_id: "Arsitektur Sistem Informasi",
    nama_en: "IS Architecture",
    sks_teori: 3, sks_praktik: 0,
    semester_rekomendasi: 5,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI",
  },
  {
    kode: "SIF505",
    nama_id: "Manajemen Proyek Sistem Informasi",
    nama_en: "IS Project Management",
    sks_teori: 2, sks_praktik: 1,
    semester_rekomendasi: 5,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI_PRAKTIKUM",
  },
  {
    kode: "SIF506",
    nama_id: "Kecerdasan Bisnis",
    nama_en: "Business Intelligence",
    sks_teori: 3, sks_praktik: 0,
    semester_rekomendasi: 5,
    status: "PILIHAN", track: "BIS", tipe_aktivitas: "TEORI",
  },
  {
    kode: "SIF507",
    nama_id: "Sistem Informasi Akuntansi",
    nama_en: "Accounting Information Systems",
    sks_teori: 3, sks_praktik: 0,
    semester_rekomendasi: 5,
    status: "PILIHAN", track: "BIS", tipe_aktivitas: "TEORI",
  },
  {
    kode: "SIF508",
    nama_id: "Sistem Basis Data Berorientasi Objek",
    nama_en: "Object Oriented Database",
    sks_teori: 2, sks_praktik: 1,
    semester_rekomendasi: 5,
    status: "PILIHAN", track: "DSA", tipe_aktivitas: "TEORI_PRAKTIKUM",
  },
  {
    kode: "SIF509",
    nama_id: "Pemodelan Data",
    nama_en: "Data Modelling",
    sks_teori: 3, sks_praktik: 0,
    semester_rekomendasi: 5,
    status: "PILIHAN", track: "DSA", tipe_aktivitas: "TEORI",
  },

  // ── SEMESTER 6 ─────────────────────────────────────────────────────
  {
    kode: "SIF601",
    nama_id: "Teknologi Berbasis Awan",
    nama_en: "Cloud Technology",
    sks_teori: 3, sks_praktik: 0,
    semester_rekomendasi: 6,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI",
  },
  {
    kode: "SIF602",
    nama_id: "Proposal Bisnis Teknologi Informasi",
    nama_en: "IT Business Proposal",
    sks_teori: 3, sks_praktik: 0,
    semester_rekomendasi: 6,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "PROYEK",
  },
  {
    kode: "SIF603",
    nama_id: "Ekonomi Informasi",
    nama_en: "Information Economics",
    sks_teori: 3, sks_praktik: 0,
    semester_rekomendasi: 6,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI",
  },
  {
    kode: "SIF604",
    nama_id: "Audit Sistem Informasi",
    nama_en: "IS Audit",
    sks_teori: 3, sks_praktik: 0,
    semester_rekomendasi: 6,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI",
  },
  {
    kode: "SIF605",
    nama_id: "Kapita Selekta Sistem Informasi",
    nama_en: "IS Topic Selections",
    sks_teori: 3, sks_praktik: 0,
    semester_rekomendasi: 6,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "SEMINAR",
  },
  {
    kode: "SIF606",
    nama_id: "Tata Kelola Sistem Informasi",
    nama_en: "IS Governance",
    sks_teori: 3, sks_praktik: 0,
    semester_rekomendasi: 6,
    status: "PILIHAN", track: "BIS", tipe_aktivitas: "TEORI",
  },
  {
    kode: "SIF607",
    nama_id: "Manajemen Risiko Teknologi Informasi dan Perubahan",
    nama_en: "IT Risk and Change Management",
    sks_teori: 3, sks_praktik: 0,
    semester_rekomendasi: 6,
    status: "PILIHAN", track: "BIS", tipe_aktivitas: "TEORI",
  },
  {
    kode: "SIF608",
    nama_id: "Maha Data",
    nama_en: "Big Data",
    sks_teori: 2, sks_praktik: 1,
    semester_rekomendasi: 6,
    status: "PILIHAN", track: "DSA", tipe_aktivitas: "TEORI_PRAKTIKUM",
  },
  {
    kode: "SIF609",
    nama_id: "Gudang Data dan Penambangan Data",
    nama_en: "Data Warehouse and Data Mining",
    sks_teori: 2, sks_praktik: 1,
    semester_rekomendasi: 6,
    status: "PILIHAN", track: "DSA", tipe_aktivitas: "TEORI_PRAKTIKUM",
  },

  // ── SEMESTER 7 ─────────────────────────────────────────────────────
  {
    kode: "SIF701",
    nama_id: "Agama",
    nama_en: "Religion",
    sks_teori: 2, sks_praktik: 0,
    semester_rekomendasi: 7,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI",
  },
  {
    kode: "SIF702",
    nama_id: "Pendidikan Kewarganegaraan dan Pancasila",
    nama_en: "Pancasila and Citizenship",
    sks_teori: 2, sks_praktik: 0,
    semester_rekomendasi: 7,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI",
  },
  {
    kode: "SIF703",
    nama_id: "Magang",
    nama_en: "Internship",
    sks_teori: 0, sks_praktik: 20,
    semester_rekomendasi: 7,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "PRAKTIKUM",
  },
  {
    kode: "SIF704",
    nama_id: "Metodologi Penelitian dan Penulisan Ilmiah",
    nama_en: "Research Methodology and Academic Writing",
    sks_teori: 3, sks_praktik: 0,
    semester_rekomendasi: 7,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI",
  },
  {
    kode: "SIF705",
    nama_id: "Keamanan Sistem Informasi",
    nama_en: "IS Security",
    sks_teori: 3, sks_praktik: 0,
    semester_rekomendasi: 7,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI",
  },
  {
    kode: "SIF706",
    nama_id: "Interaksi Manusia dan Komputer",
    nama_en: "Human-Computer Interaction",
    sks_teori: 3, sks_praktik: 0,
    semester_rekomendasi: 7,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI",
  },

  // ── SEMESTER 8 ─────────────────────────────────────────────────────
  {
    kode: "SIF801",
    nama_id: "Etika Komputer dan Hukum",
    nama_en: "Computer Ethics and Law",
    sks_teori: 3, sks_praktik: 0,
    semester_rekomendasi: 8,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI",
  },
  {
    kode: "SIF802",
    nama_id: "Tugas Akhir",
    nama_en: "Thesis",
    sks_teori: 0, sks_praktik: 6,
    semester_rekomendasi: 8,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "PROYEK",
  },
]

async function seedMataKuliah() {
  console.log("📚 Seeding mata kuliah...")
  let inserted = 0
  let skipped = 0

  for (const mk of mataKuliahData) {
    const existing = await db.query.mataKuliah.findFirst({
      where: eq(mataKuliah.kode, mk.kode),
    })

    if (existing) {
      console.log(`⏭️  Skip (sudah ada): [${mk.kode}] ${mk.nama_id}`)
      skipped++
      continue
    }

    await db.insert(mataKuliah).values(mk)
    console.log(`✅ Inserted: [${mk.kode}] ${mk.nama_id} (SEM ${mk.semester_rekomendasi})`)
    inserted++
  }

  console.log(`\n📊 Selesai: ${inserted} mata kuliah ditambahkan, ${skipped} dilewati.`)
  console.log(`📋 Total: ${mataKuliahData.length} mata kuliah (SEM 1-8)`)
  process.exit(0)
}

seedMataKuliah().catch((err) => {
  console.error("❌ Seed gagal:", err)
  process.exit(1)
})
