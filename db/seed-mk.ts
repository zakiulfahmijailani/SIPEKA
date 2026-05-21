// Seed Mata Kuliah
// Run with: npm run db:seed-mk
// Source: Kurikulum Resmi Prodi Sistem Informasi

import { config } from "dotenv"
config({ path: ".env.local" })

import { db } from "./index"
import { mataKuliah } from "./schema"
import { eq, notInArray } from "drizzle-orm"

type MkStatus = "WAJIB" | "PILIHAN"
type MkTrack = "UMUM" | "BIS" | "ISG" | "DSA" | "DMS"
type TipeAktivitas = "TEORI" | "PRAKTIKUM" | "TEORI_PRAKTIKUM" | "SEMINAR" | "PROYEK"

interface MkData {
  nama_id: string
  nama_en: string | null
  sks_teori: number
  sks_praktik: number
  semester_rekomendasi: number
  status: MkStatus
  track: MkTrack
  tipe_aktivitas: TipeAktivitas
  has_praktikum: boolean
  keterangan_praktikum: string | null
  is_pbl: boolean
  keterangan_semester: string | null
}

// Extend MkData with kode for database upsert
type MkSeedData = MkData & { kode: string }

const mataKuliahData: MkSeedData[] = [
  // ── SEMESTER 1 ─────────────────────────────────────────────────────
  {
    kode: "SIF101",
    nama_id: "Bahasa Inggris 1",
    nama_en: "English 1",
    sks_teori: 2, sks_praktik: 0,
    semester_rekomendasi: 1,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI",
    has_praktikum: false, keterangan_praktikum: null,
    is_pbl: false, keterangan_semester: null,
  },
  {
    kode: "SIF102",
    nama_id: "Pengantar Teknologi Informasi",
    nama_en: "Introduction to Information Technology",
    sks_teori: 2, sks_praktik: 1,
    semester_rekomendasi: 1,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI_PRAKTIKUM",
    has_praktikum: true, keterangan_praktikum: "Termasuk praktikum",
    is_pbl: false, keterangan_semester: null,
  },
  {
    kode: "SIF103",
    nama_id: "Algoritma dan Pemrograman",
    nama_en: "Algorithm and Programming",
    sks_teori: 2, sks_praktik: 1,
    semester_rekomendasi: 1,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI_PRAKTIKUM",
    has_praktikum: true, keterangan_praktikum: "Termasuk praktikum",
    is_pbl: true, keterangan_semester: null,
  },
  {
    kode: "SIF104",
    nama_id: "Sistem Basis Data",
    nama_en: "Database Systems",
    sks_teori: 2, sks_praktik: 1,
    semester_rekomendasi: 1,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI_PRAKTIKUM",
    has_praktikum: true, keterangan_praktikum: "Termasuk praktikum",
    is_pbl: true, keterangan_semester: null,
  },
  {
    kode: "SIF105",
    nama_id: "Jaringan Komputer",
    nama_en: "Network Fundamental",
    sks_teori: 2, sks_praktik: 1,
    semester_rekomendasi: 1,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI_PRAKTIKUM",
    has_praktikum: true, keterangan_praktikum: "Termasuk praktikum",
    is_pbl: false, keterangan_semester: null,
  },
  {
    kode: "SIF106",
    nama_id: "Pengantar Bisnis dan Manajemen",
    nama_en: "Principles of Business and Management",
    sks_teori: 3, sks_praktik: 0,
    semester_rekomendasi: 1,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI",
    has_praktikum: false, keterangan_praktikum: null,
    is_pbl: false, keterangan_semester: null,
  },

  // ── SEMESTER 2 ─────────────────────────────────────────────────────
  {
    kode: "SIF201",
    nama_id: "Bahasa Inggris 2",
    nama_en: "English 2",
    sks_teori: 2, sks_praktik: 0,
    semester_rekomendasi: 2,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI",
    has_praktikum: false, keterangan_praktikum: null,
    is_pbl: false, keterangan_semester: null,
  },
  {
    kode: "SIF202",
    nama_id: "Struktur Data",
    nama_en: "Data Structure",
    sks_teori: 2, sks_praktik: 1,
    semester_rekomendasi: 2,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI_PRAKTIKUM",
    has_praktikum: true, keterangan_praktikum: "Termasuk praktikum",
    is_pbl: false, keterangan_semester: null,
  },
  {
    kode: "SIF203",
    nama_id: "Kepemimpinan Dinamis",
    nama_en: "Dynamic Leadership",
    sks_teori: 3, sks_praktik: 0,
    semester_rekomendasi: 2,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI",
    has_praktikum: false, keterangan_praktikum: null,
    is_pbl: false, keterangan_semester: null,
  },
  {
    kode: "SIF204",
    nama_id: "Pengantar Statistik",
    nama_en: "Introduction to Statistics",
    sks_teori: 3, sks_praktik: 0,
    semester_rekomendasi: 2,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI",
    has_praktikum: false, keterangan_praktikum: null,
    is_pbl: false, keterangan_semester: null,
  },
  {
    kode: "SIF205",
    nama_id: "Kewirausahaan yang Efektif",
    nama_en: "Effectual Entrepreneurship",
    sks_teori: 3, sks_praktik: 0,
    semester_rekomendasi: 2,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI",
    has_praktikum: false, keterangan_praktikum: null,
    is_pbl: true, keterangan_semester: null,
  },
  {
    kode: "SIF206",
    nama_id: "Pemrograman Visual",
    nama_en: "Visual Programming",
    sks_teori: 2, sks_praktik: 1,
    semester_rekomendasi: 2,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI_PRAKTIKUM",
    has_praktikum: true, keterangan_praktikum: "Termasuk praktikum",
    is_pbl: true, keterangan_semester: null,
  },
  {
    kode: "SIF207",
    nama_id: "Konsep Sistem Informasi",
    nama_en: "Concept of Information Systems",
    sks_teori: 3, sks_praktik: 0,
    semester_rekomendasi: 2,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI",
    has_praktikum: false, keterangan_praktikum: null,
    is_pbl: false, keterangan_semester: null,
  },

  // ── SEMESTER 3 ─────────────────────────────────────────────────────
  {
    kode: "SIF301",
    nama_id: "Statistik",
    nama_en: "Statistics",
    sks_teori: 3, sks_praktik: 0,
    semester_rekomendasi: 3,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI",
    has_praktikum: false, keterangan_praktikum: null,
    is_pbl: false, keterangan_semester: null,
  },
  {
    kode: "SIF302",
    nama_id: "Aljabar Linier",
    nama_en: "Linear Algebra",
    sks_teori: 3, sks_praktik: 0,
    semester_rekomendasi: 3,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI",
    has_praktikum: false, keterangan_praktikum: null,
    is_pbl: false, keterangan_semester: null,
  },
  {
    kode: "SIF303",
    nama_id: "Sistem Informasi Manajemen",
    nama_en: "Management Information Systems",
    sks_teori: 2, sks_praktik: 1,
    semester_rekomendasi: 3,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI_PRAKTIKUM",
    has_praktikum: true, keterangan_praktikum: "Termasuk praktikum",
    is_pbl: false, keterangan_semester: null,
  },
  {
    kode: "SIF304",
    nama_id: "Sistem Operasi",
    nama_en: "Operating Systems",
    sks_teori: 2, sks_praktik: 1,
    semester_rekomendasi: 3,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI_PRAKTIKUM",
    has_praktikum: true, keterangan_praktikum: "Termasuk praktikum",
    is_pbl: false, keterangan_semester: null,
  },
  {
    kode: "SIF305",
    nama_id: "Manajemen Pengetahuan",
    nama_en: "Knowledge Management",
    sks_teori: 3, sks_praktik: 0,
    semester_rekomendasi: 3,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI",
    has_praktikum: false, keterangan_praktikum: null,
    is_pbl: false, keterangan_semester: null,
  },
  {
    kode: "SIF306",
    nama_id: "Manajemen Teknologi Informasi",
    nama_en: "IT Management",
    sks_teori: 3, sks_praktik: 0,
    semester_rekomendasi: 3,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI",
    has_praktikum: false, keterangan_praktikum: null,
    is_pbl: false, keterangan_semester: null,
  },
  {
    kode: "SIF307",
    nama_id: "Pemrograman Bergerak",
    nama_en: "Mobile Programming",
    sks_teori: 2, sks_praktik: 1,
    semester_rekomendasi: 3,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI_PRAKTIKUM",
    has_praktikum: false, keterangan_praktikum: null,
    is_pbl: true, keterangan_semester: null,
  },

  // ── SEMESTER 4 ─────────────────────────────────────────────────────
  {
    kode: "SIF401",
    nama_id: "Pengalihan LAN dan Nirkabel",
    nama_en: "LAN Switching and Wireless",
    sks_teori: 2, sks_praktik: 1,
    semester_rekomendasi: 4,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI_PRAKTIKUM",
    has_praktikum: true, keterangan_praktikum: "Termasuk praktikum",
    is_pbl: false, keterangan_semester: null,
  },
  {
    kode: "SIF402",
    nama_id: "Manajemen Pengetahuan Lanjut",
    nama_en: "Advanced Knowledge Management",
    sks_teori: 3, sks_praktik: 0,
    semester_rekomendasi: 4,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI",
    has_praktikum: false, keterangan_praktikum: null,
    is_pbl: false, keterangan_semester: null,
  },
  {
    kode: "SIF403",
    nama_id: "Rekayasa Perangkat Lunak",
    nama_en: "Software Engineering",
    sks_teori: 3, sks_praktik: 0,
    semester_rekomendasi: 4,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI",
    has_praktikum: false, keterangan_praktikum: null,
    is_pbl: false, keterangan_semester: null,
  },
  {
    kode: "SIF404",
    nama_id: "Pemrograman Berorientasi Objek",
    nama_en: "Object Oriented Programming",
    sks_teori: 2, sks_praktik: 1,
    semester_rekomendasi: 4,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI_PRAKTIKUM",
    has_praktikum: true, keterangan_praktikum: "Termasuk praktikum",
    is_pbl: true, keterangan_semester: null,
  },
  {
    kode: "SIF405",
    nama_id: "Analisis Perancangan Sistem Informasi",
    nama_en: "Information System Analysis and Design",
    sks_teori: 2, sks_praktik: 1,
    semester_rekomendasi: 4,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI_PRAKTIKUM",
    has_praktikum: true, keterangan_praktikum: "Termasuk praktikum",
    is_pbl: true, keterangan_semester: null,
  },
  {
    kode: "SIF406",
    nama_id: "Informasi dan Proses Bisnis",
    nama_en: "Information and Business Process",
    sks_teori: 3, sks_praktik: 0,
    semester_rekomendasi: 4,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI",
    has_praktikum: false, keterangan_praktikum: null,
    is_pbl: false, keterangan_semester: null,
  },
  {
    kode: "SIF407",
    nama_id: "Sistem Informasi Enterprise Terpadu",
    nama_en: "Integrated Enterprise Information Systems",
    sks_teori: 3, sks_praktik: 0,
    semester_rekomendasi: 4,
    status: "PILIHAN", track: "BIS", tipe_aktivitas: "TEORI",
    has_praktikum: false, keterangan_praktikum: null,
    is_pbl: false, keterangan_semester: null,
  },
  {
    kode: "SIF408",
    nama_id: "Sistem Basis Data Lanjut",
    nama_en: "Advanced Database Systems",
    sks_teori: 2, sks_praktik: 1,
    semester_rekomendasi: 4,
    status: "PILIHAN", track: "DSA", tipe_aktivitas: "TEORI_PRAKTIKUM",
    has_praktikum: true, keterangan_praktikum: "Termasuk praktikum",
    is_pbl: false, keterangan_semester: null,
  },

  // ── SEMESTER 5 ─────────────────────────────────────────────────────
  {
    kode: "SIF501",
    nama_id: "Bahasa Indonesia",
    nama_en: null,
    sks_teori: 2, sks_praktik: 0,
    semester_rekomendasi: 5,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI",
    has_praktikum: false, keterangan_praktikum: null,
    is_pbl: false, keterangan_semester: null,
  },
  {
    kode: "SIF502",
    nama_id: "Kewirausahaan Berbasis Teknologi",
    nama_en: "Technopreneurship",
    sks_teori: 3, sks_praktik: 0,
    semester_rekomendasi: 5,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI",
    has_praktikum: false, keterangan_praktikum: null,
    is_pbl: false, keterangan_semester: null,
  },
  {
    kode: "SIF503",
    nama_id: "Testing dan Implementasi Sistem Informasi",
    nama_en: "IS Testing and Implementation",
    sks_teori: 3, sks_praktik: 0,
    semester_rekomendasi: 5,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI",
    has_praktikum: false, keterangan_praktikum: null,
    is_pbl: true, keterangan_semester: null,
  },
  {
    kode: "SIF504",
    nama_id: "Arsitektur Sistem Informasi",
    nama_en: "IS Architecture",
    sks_teori: 3, sks_praktik: 0,
    semester_rekomendasi: 5,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI",
    has_praktikum: false, keterangan_praktikum: null,
    is_pbl: false, keterangan_semester: null,
  },
  {
    kode: "SIF505",
    nama_id: "Manajemen Proyek Sistem Informasi",
    nama_en: "IS Project Management",
    sks_teori: 2, sks_praktik: 1,
    semester_rekomendasi: 5,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI_PRAKTIKUM",
    has_praktikum: true, keterangan_praktikum: "Termasuk praktikum",
    is_pbl: true, keterangan_semester: null,
  },
  {
    kode: "SIF506",
    nama_id: "Kecerdasan Bisnis",
    nama_en: "Business Intelligence",
    sks_teori: 3, sks_praktik: 0,
    semester_rekomendasi: 5,
    status: "PILIHAN", track: "ISG", tipe_aktivitas: "TEORI",
    has_praktikum: false, keterangan_praktikum: null,
    is_pbl: true, keterangan_semester: null,
  },
  {
    kode: "SIF507",
    nama_id: "Sistem Informasi Akuntansi",
    nama_en: "Accounting Information Systems",
    sks_teori: 3, sks_praktik: 0,
    semester_rekomendasi: 5,
    status: "PILIHAN", track: "ISG", tipe_aktivitas: "TEORI",
    has_praktikum: false, keterangan_praktikum: null,
    is_pbl: false, keterangan_semester: null,
  },
  {
    kode: "SIF508",
    nama_id: "Sistem Basis Data Berorientasi Objek",
    nama_en: "Object Oriented Database",
    sks_teori: 2, sks_praktik: 1,
    semester_rekomendasi: 5,
    status: "PILIHAN", track: "DMS", tipe_aktivitas: "TEORI_PRAKTIKUM",
    has_praktikum: true, keterangan_praktikum: "Termasuk praktikum",
    is_pbl: false, keterangan_semester: null,
  },
  {
    kode: "SIF509",
    nama_id: "Pemodelan Data",
    nama_en: "Data Modelling",
    sks_teori: 3, sks_praktik: 0,
    semester_rekomendasi: 5,
    status: "PILIHAN", track: "DMS", tipe_aktivitas: "TEORI",
    has_praktikum: false, keterangan_praktikum: null,
    is_pbl: false, keterangan_semester: null,
  },

  // ── SEMESTER 6 ─────────────────────────────────────────────────────
  {
    kode: "SIF601",
    nama_id: "Teknologi Berbasis Awan",
    nama_en: "Cloud Technology",
    sks_teori: 3, sks_praktik: 0,
    semester_rekomendasi: 6,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI",
    has_praktikum: false, keterangan_praktikum: null,
    is_pbl: false, keterangan_semester: null,
  },
  {
    kode: "SIF602",
    nama_id: "Proposal Bisnis Teknologi Informasi",
    nama_en: "IT Business Proposal",
    sks_teori: 3, sks_praktik: 0,
    semester_rekomendasi: 6,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "PROYEK",
    has_praktikum: false, keterangan_praktikum: null,
    is_pbl: false, keterangan_semester: null,
  },
  {
    kode: "SIF603",
    nama_id: "Ekonomi Informasi",
    nama_en: "Information Economics",
    sks_teori: 3, sks_praktik: 0,
    semester_rekomendasi: 6,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI",
    has_praktikum: false, keterangan_praktikum: null,
    is_pbl: false, keterangan_semester: null,
  },
  {
    kode: "SIF604",
    nama_id: "Audit Sistem Informasi",
    nama_en: "IS Audit",
    sks_teori: 3, sks_praktik: 0,
    semester_rekomendasi: 6,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI",
    has_praktikum: false, keterangan_praktikum: null,
    is_pbl: false, keterangan_semester: null,
  },
  {
    kode: "SIF605",
    nama_id: "Kapita Selekta Sistem Informasi",
    nama_en: "IS Topic Selections",
    sks_teori: 3, sks_praktik: 0,
    semester_rekomendasi: 6,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "SEMINAR",
    has_praktikum: false, keterangan_praktikum: null,
    is_pbl: false, keterangan_semester: null,
  },
  {
    kode: "SIF606",
    nama_id: "Tata Kelola Sistem Informasi",
    nama_en: "IS Governance",
    sks_teori: 3, sks_praktik: 0,
    semester_rekomendasi: 6,
    status: "PILIHAN", track: "BIS", tipe_aktivitas: "TEORI",
    has_praktikum: false, keterangan_praktikum: null,
    is_pbl: false, keterangan_semester: null,
  },
  {
    kode: "SIF607",
    nama_id: "Manajemen Risiko Teknologi Informasi dan Perubahan",
    nama_en: "IT Risk and Change Management",
    sks_teori: 3, sks_praktik: 0,
    semester_rekomendasi: 6,
    status: "PILIHAN", track: "BIS", tipe_aktivitas: "TEORI",
    has_praktikum: false, keterangan_praktikum: null,
    is_pbl: false, keterangan_semester: null,
  },
  {
    kode: "SIF608",
    nama_id: "Maha Data",
    nama_en: "Big Data",
    sks_teori: 2, sks_praktik: 1,
    semester_rekomendasi: 6,
    status: "PILIHAN", track: "DSA", tipe_aktivitas: "TEORI_PRAKTIKUM",
    has_praktikum: false, keterangan_praktikum: null,
    is_pbl: false, keterangan_semester: null,
  },
  {
    kode: "SIF609",
    nama_id: "Gudang Data dan Penambangan Data",
    nama_en: "Data Warehouse and Data Mining",
    sks_teori: 2, sks_praktik: 1,
    semester_rekomendasi: 6,
    status: "PILIHAN", track: "DSA", tipe_aktivitas: "TEORI_PRAKTIKUM",
    has_praktikum: false, keterangan_praktikum: null,
    is_pbl: true, keterangan_semester: null,
  },

  // ── SEMESTER 7 (tanpa Magang — bukan MK reguler) ──────────────────
  {
    kode: "SIF701",
    nama_id: "Agama",
    nama_en: "Religion",
    sks_teori: 2, sks_praktik: 0,
    semester_rekomendasi: 7,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI",
    has_praktikum: false, keterangan_praktikum: null,
    is_pbl: false, keterangan_semester: null,
  },
  {
    kode: "SIF702",
    nama_id: "Pendidikan Kewarganegaraan dan Pancasila",
    nama_en: "Pancasila and Citizenship",
    sks_teori: 2, sks_praktik: 0,
    semester_rekomendasi: 7,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI",
    has_praktikum: false, keterangan_praktikum: null,
    is_pbl: false, keterangan_semester: null,
  },
  {
    kode: "SIF704",
    nama_id: "Metodologi Penelitian dan Penulisan Ilmiah",
    nama_en: "Research Methodology and Academic Writing",
    sks_teori: 3, sks_praktik: 0,
    semester_rekomendasi: 7,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI",
    has_praktikum: false, keterangan_praktikum: null,
    is_pbl: false, keterangan_semester: null,
  },
  {
    kode: "SIF705",
    nama_id: "Keamanan Sistem Informasi",
    nama_en: "IS Security",
    sks_teori: 3, sks_praktik: 0,
    semester_rekomendasi: 7,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI",
    has_praktikum: false, keterangan_praktikum: null,
    is_pbl: false, keterangan_semester: null,
  },
  {
    kode: "SIF706",
    nama_id: "Interaksi Manusia dan Komputer",
    nama_en: "Human-Computer Interaction",
    sks_teori: 3, sks_praktik: 0,
    semester_rekomendasi: 7,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI",
    has_praktikum: false, keterangan_praktikum: null,
    is_pbl: false, keterangan_semester: null,
  },

  // ── SEMESTER 8 ─────────────────────────────────────────────────────
  {
    kode: "SIF801",
    nama_id: "Etika Komputer dan Hukum",
    nama_en: "Computer Ethics and Law",
    sks_teori: 3, sks_praktik: 0,
    semester_rekomendasi: 8,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "TEORI",
    has_praktikum: false, keterangan_praktikum: null,
    is_pbl: false, keterangan_semester: null,
  },
  {
    kode: "SIF802",
    nama_id: "Tugas Akhir",
    nama_en: "Thesis",
    sks_teori: 0, sks_praktik: 6,
    semester_rekomendasi: 8,
    status: "WAJIB", track: "UMUM", tipe_aktivitas: "PROYEK",
    has_praktikum: false, keterangan_praktikum: null,
    is_pbl: false, keterangan_semester: null,
  },
]

async function seedMataKuliah() {
  console.log("📚 Seeding mata kuliah...")

  const validNamaIds = mataKuliahData.map((mk) => mk.nama_id)

  // 1. Hapus MK lama yang tidak ada di daftar baru
  const deleted = await db
    .delete(mataKuliah)
    .where(notInArray(mataKuliah.nama_id, validNamaIds))
    .returning({ kode: mataKuliah.kode, nama_id: mataKuliah.nama_id })

  for (const d of deleted) {
    console.log(`🗑️  Deleted: [${d.kode}] ${d.nama_id}`)
  }
  console.log(`🗑️  Total dihapus: ${deleted.length}`)

  // 2. Upsert berdasarkan nama_id
  let inserted = 0
  let updated = 0

  for (const mk of mataKuliahData) {
    const existing = await db.query.mataKuliah.findFirst({
      where: eq(mataKuliah.nama_id, mk.nama_id),
    })

    if (existing) {
      await db
        .update(mataKuliah)
        .set({
          kode: mk.kode,
          nama_en: mk.nama_en,
          sks_teori: mk.sks_teori,
          sks_praktik: mk.sks_praktik,
          semester_rekomendasi: mk.semester_rekomendasi,
          status: mk.status,
          track: mk.track,
          tipe_aktivitas: mk.tipe_aktivitas,
          has_praktikum: mk.has_praktikum,
          keterangan_praktikum: mk.keterangan_praktikum,
          is_pbl: mk.is_pbl,
          keterangan_semester: mk.keterangan_semester,
          updated_at: new Date(),
        })
        .where(eq(mataKuliah.nama_id, mk.nama_id))
      console.log(`🔄 Updated: [${mk.kode}] ${mk.nama_id}`)
      updated++
    } else {
      await db.insert(mataKuliah).values(mk)
      console.log(`✅ Inserted: [${mk.kode}] ${mk.nama_id} (SEM ${mk.semester_rekomendasi})`)
      inserted++
    }
  }

  console.log(`\n📊 Selesai: ${inserted} ditambahkan, ${updated} diperbarui, ${deleted.length} dihapus.`)
  console.log(`📋 Total: ${mataKuliahData.length} mata kuliah (SEM 1-8)`)
  process.exit(0)
}

seedMataKuliah().catch((err) => {
  console.error("❌ Seed gagal:", err)
  process.exit(1)
})
