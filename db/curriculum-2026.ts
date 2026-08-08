// Sumber data kurikulum operasional S1 Sistem Informasi tahun akademik 2026/2027.
// Nama, kode, semester, SKS, dan peminatan mengikuti tabel kurikulum pada SK Rektor.

export type Curriculum2026Course = {
  kode: string
  nama_id: string
  nama_en: string | null
  sks_teori: number
  sks_praktik: number
  semester_rekomendasi: number
  status: "WAJIB" | "PILIHAN"
  track: "UMUM" | "BIS" | "ISG" | "DSA" | "DMS"
  tipe_aktivitas: "TEORI" | "PRAKTIKUM" | "TEORI_PRAKTIKUM" | "SEMINAR" | "PROYEK"
  has_praktikum: boolean
  keterangan_praktikum: string | null
  is_pbl: boolean
  keterangan_pbl: string | null
  keterangan_semester: string | null
}

type CourseInput = Omit<Curriculum2026Course, "tipe_aktivitas" | "keterangan_praktikum" | "keterangan_semester"> & {
  tipe_aktivitas?: Curriculum2026Course["tipe_aktivitas"]
  keterangan_semester?: string | null
}

const practicalCourses = new Set([
  "SIF101", "SIF107", "SIF108", "SIF109", "SIF202", "SIF214", "SIF319",
  "SIF404", "SIF408", "SIF409", "SIF505",
])

const pblCourses = new Set([
  "SIF107", "SIF108", "SIF213", "SIF214", "SIF319", "SIF408", "SIF409",
  "SIF503", "SIF505", "SIF903", "SIF910",
])

const course = (input: Omit<CourseInput, "has_praktikum" | "is_pbl" | "keterangan_pbl">): Curriculum2026Course => {
  const has_praktikum = practicalCourses.has(input.kode)
  const is_pbl = pblCourses.has(input.kode)
  return {
    ...input,
    tipe_aktivitas: input.tipe_aktivitas ?? (has_praktikum ? "TEORI_PRAKTIKUM" : "TEORI"),
    has_praktikum,
    keterangan_praktikum: has_praktikum ? "Termasuk praktikum" : null,
    is_pbl,
    keterangan_pbl: is_pbl ? "PBL" : null,
    keterangan_semester: input.keterangan_semester ?? null,
  }
}

export const CURRICULUM_2026_MATA_KULIAH: Curriculum2026Course[] = [
  // Semester 1
  course({ kode: "UNI104", nama_id: "Bahasa Inggris 1", nama_en: "English 1", sks_teori: 3, sks_praktik: 0, semester_rekomendasi: 1, status: "WAJIB", track: "UMUM" }),
  course({ kode: "SIF101", nama_id: "Pengantar Teknologi Informasi", nama_en: "Introduction to Information Technology", sks_teori: 2, sks_praktik: 1, semester_rekomendasi: 1, status: "WAJIB", track: "UMUM" }),
  course({ kode: "SIF107", nama_id: "Algoritma dan Pemrograman", nama_en: "Algorithm and Programming", sks_teori: 2, sks_praktik: 1, semester_rekomendasi: 1, status: "WAJIB", track: "UMUM" }),
  course({ kode: "SIF108", nama_id: "Sistem Basis Data", nama_en: "Database Systems", sks_teori: 2, sks_praktik: 1, semester_rekomendasi: 1, status: "WAJIB", track: "UMUM" }),
  course({ kode: "SIF109", nama_id: "Jaringan Komputer", nama_en: "Network Fundamental", sks_teori: 2, sks_praktik: 1, semester_rekomendasi: 1, status: "WAJIB", track: "UMUM" }),
  course({ kode: "SIF106", nama_id: "Pengantar Bisnis dan Manajemen", nama_en: "Principles of Business and Management", sks_teori: 3, sks_praktik: 0, semester_rekomendasi: 1, status: "WAJIB", track: "UMUM" }),

  // Semester 2
  course({ kode: "UNI204", nama_id: "Bahasa Inggris 2", nama_en: "English 2", sks_teori: 3, sks_praktik: 0, semester_rekomendasi: 2, status: "WAJIB", track: "UMUM" }),
  course({ kode: "SIF202", nama_id: "Struktur Data", nama_en: "Data Structure", sks_teori: 2, sks_praktik: 1, semester_rekomendasi: 2, status: "WAJIB", track: "UMUM" }),
  course({ kode: "SIF210", nama_id: "Kepemimpinan Dinamis", nama_en: "Dynamic Leadership", sks_teori: 3, sks_praktik: 0, semester_rekomendasi: 2, status: "WAJIB", track: "UMUM" }),
  course({ kode: "SIF212", nama_id: "Pengantar Statistik", nama_en: "Introduction to Statistics", sks_teori: 2, sks_praktik: 0, semester_rekomendasi: 2, status: "WAJIB", track: "UMUM" }),
  course({ kode: "SIF213", nama_id: "Kewirausahaan yang Efektif", nama_en: "Effectual Entrepreneurship", sks_teori: 3, sks_praktik: 0, semester_rekomendasi: 2, status: "WAJIB", track: "UMUM" }),
  course({ kode: "SIF408", nama_id: "Pemrograman Berorientasi Objek", nama_en: "Object Oriented Programming", sks_teori: 2, sks_praktik: 1, semester_rekomendasi: 2, status: "WAJIB", track: "UMUM" }),
  course({ kode: "SIF215", nama_id: "Konsep Sistem Informasi", nama_en: "Concept of Information Systems", sks_teori: 3, sks_praktik: 0, semester_rekomendasi: 2, status: "WAJIB", track: "UMUM" }),

  // Semester 3
  course({ kode: "FTK161", nama_id: "Statistik", nama_en: "Statistics", sks_teori: 3, sks_praktik: 0, semester_rekomendasi: 3, status: "WAJIB", track: "UMUM" }),
  course({ kode: "FTK121", nama_id: "Aljabar Linier", nama_en: "Linear Algebra", sks_teori: 3, sks_praktik: 0, semester_rekomendasi: 3, status: "WAJIB", track: "UMUM" }),
  course({ kode: "SIF307", nama_id: "Sistem Informasi Manajemen", nama_en: "Management Information Systems", sks_teori: 2, sks_praktik: 1, semester_rekomendasi: 3, status: "WAJIB", track: "UMUM" }),
  course({ kode: "SIF311", nama_id: "Sistem Operasi", nama_en: "Operating Systems", sks_teori: 2, sks_praktik: 1, semester_rekomendasi: 3, status: "WAJIB", track: "UMUM" }),
  course({ kode: "SIF317", nama_id: "Manajemen Pengetahuan", nama_en: "Knowledge Management", sks_teori: 3, sks_praktik: 0, semester_rekomendasi: 3, status: "WAJIB", track: "UMUM" }),
  course({ kode: "SIF318", nama_id: "Manajemen Teknologi Informasi", nama_en: "IT Management", sks_teori: 3, sks_praktik: 0, semester_rekomendasi: 3, status: "WAJIB", track: "UMUM" }),
  course({ kode: "SIF319", nama_id: "Pemrograman Bergerak", nama_en: "Mobile Programming", sks_teori: 2, sks_praktik: 1, semester_rekomendasi: 3, status: "WAJIB", track: "UMUM" }),

  // Semester 4
  course({ kode: "SIF404", nama_id: "Pengalihan LAN dan Nirkabel", nama_en: "LAN Switching and Wireless", sks_teori: 2, sks_praktik: 1, semester_rekomendasi: 4, status: "WAJIB", track: "UMUM" }),
  course({ kode: "SIF405", nama_id: "Manajemen Pengetahuan Lanjut", nama_en: "Advanced Knowledge Management", sks_teori: 2, sks_praktik: 0, semester_rekomendasi: 4, status: "WAJIB", track: "UMUM" }),
  course({ kode: "SIF407", nama_id: "Rekayasa Perangkat Lunak", nama_en: "Software Engineering", sks_teori: 3, sks_praktik: 0, semester_rekomendasi: 4, status: "WAJIB", track: "UMUM" }),
  course({ kode: "SIF214", nama_id: "Pemrograman Visual", nama_en: "Visual Programming", sks_teori: 2, sks_praktik: 1, semester_rekomendasi: 4, status: "WAJIB", track: "UMUM" }),
  course({ kode: "SIF409", nama_id: "Analisis Perancangan Sistem Informasi", nama_en: "Information System Analysis and Design", sks_teori: 2, sks_praktik: 1, semester_rekomendasi: 4, status: "WAJIB", track: "UMUM" }),
  course({ kode: "SIF410", nama_id: "Informasi dan Proses Bisnis", nama_en: "Information and Business Process", sks_teori: 3, sks_praktik: 0, semester_rekomendasi: 4, status: "WAJIB", track: "UMUM" }),
  course({ kode: "SIF901", nama_id: "Sistem Informasi Enterprise Terpadu", nama_en: "Integrated Enterprise IS", sks_teori: 3, sks_praktik: 0, semester_rekomendasi: 4, status: "PILIHAN", track: "ISG" }),
  course({ kode: "SIF902", nama_id: "Sistem Basis Data Lanjut", nama_en: "Advanced Database Systems", sks_teori: 2, sks_praktik: 1, semester_rekomendasi: 4, status: "PILIHAN", track: "DMS" }),

  // Semester 5
  course({ kode: "UNI101", nama_id: "Bahasa Indonesia", nama_en: null, sks_teori: 2, sks_praktik: 0, semester_rekomendasi: 5, status: "WAJIB", track: "UMUM" }),
  course({ kode: "FTK221", nama_id: "Kewirausahaan Berbasis Teknologi", nama_en: "Technopreneurship", sks_teori: 3, sks_praktik: 0, semester_rekomendasi: 5, status: "WAJIB", track: "UMUM" }),
  course({ kode: "SIF503", nama_id: "Testing dan Implementasi Sistem Informasi", nama_en: "IS Testing and Implementation", sks_teori: 3, sks_praktik: 0, semester_rekomendasi: 5, status: "WAJIB", track: "UMUM" }),
  course({ kode: "SIF504", nama_id: "Arsitektur Sistem Informasi", nama_en: "IS Architecture", sks_teori: 3, sks_praktik: 0, semester_rekomendasi: 5, status: "WAJIB", track: "UMUM" }),
  course({ kode: "SIF505", nama_id: "Manajemen Proyek Sistem Informasi", nama_en: "IS Project Management", sks_teori: 2, sks_praktik: 1, semester_rekomendasi: 5, status: "WAJIB", track: "UMUM" }),
  course({ kode: "SIF911", nama_id: "Manajemen Hubungan Pelanggan", nama_en: "Customer Relationship Management", sks_teori: 3, sks_praktik: 0, semester_rekomendasi: 5, status: "PILIHAN", track: "ISG" }),
  course({ kode: "SIF912", nama_id: "Manajemen Rantai Pasok", nama_en: "Supply Chain Management", sks_teori: 3, sks_praktik: 0, semester_rekomendasi: 5, status: "PILIHAN", track: "ISG" }),
  course({ kode: "SIF903", nama_id: "Kecerdasan Bisnis", nama_en: "Business Intelligence", sks_teori: 3, sks_praktik: 0, semester_rekomendasi: 5, status: "PILIHAN", track: "DMS" }),
  course({ kode: "SIF906", nama_id: "Pemodelan Data", nama_en: "Data Modelling", sks_teori: 3, sks_praktik: 0, semester_rekomendasi: 5, status: "PILIHAN", track: "DMS" }),

  // Semester 6
  course({ kode: "SIF604", nama_id: "Teknologi Berbasis Awan", nama_en: "Cloud Technology", sks_teori: 3, sks_praktik: 0, semester_rekomendasi: 6, status: "WAJIB", track: "UMUM" }),
  course({ kode: "SIF611", nama_id: "E-Bisnis", nama_en: "E-Business", sks_teori: 2, sks_praktik: 0, semester_rekomendasi: 6, status: "WAJIB", track: "UMUM" }),
  course({ kode: "SIF608", nama_id: "Ekonomi Informasi", nama_en: "Information Economics", sks_teori: 3, sks_praktik: 0, semester_rekomendasi: 6, status: "WAJIB", track: "UMUM" }),
  course({ kode: "SIF609", nama_id: "Audit Sistem Informasi", nama_en: "IS Audit", sks_teori: 3, sks_praktik: 0, semester_rekomendasi: 6, status: "WAJIB", track: "UMUM" }),
  course({ kode: "SIF610", nama_id: "Kapita Selekta Sistem Informasi", nama_en: "IS Topic Selections", sks_teori: 3, sks_praktik: 0, semester_rekomendasi: 6, status: "WAJIB", track: "UMUM" }),
  course({ kode: "SIF907", nama_id: "Tata Kelola Sistem Informasi", nama_en: "IS Governance", sks_teori: 3, sks_praktik: 0, semester_rekomendasi: 6, status: "PILIHAN", track: "ISG" }),
  course({ kode: "SIF908", nama_id: "Manajemen Resiko Teknologi Informasi dan Perubahan", nama_en: "IT Risk and Change Management", sks_teori: 3, sks_praktik: 0, semester_rekomendasi: 6, status: "PILIHAN", track: "ISG" }),
  course({ kode: "SIF909", nama_id: "Maha Data", nama_en: "Big Data", sks_teori: 3, sks_praktik: 0, semester_rekomendasi: 6, status: "PILIHAN", track: "DMS" }),
  course({ kode: "SIF910", nama_id: "Gudang Data & Penambangan Data", nama_en: "Data Warehouse & Data Mining", sks_teori: 3, sks_praktik: 0, semester_rekomendasi: 6, status: "PILIHAN", track: "DMS" }),

  // Semester 7
  course({ kode: "UNI102", nama_id: "Agama", nama_en: "Religion", sks_teori: 2, sks_praktik: 0, semester_rekomendasi: 7, status: "WAJIB", track: "UMUM" }),
  course({ kode: "UNI106", nama_id: "Pendidikan Kewarganegaraan dan Pancasila", nama_en: "Pancasila and Citizenship", sks_teori: 3, sks_praktik: 0, semester_rekomendasi: 7, status: "WAJIB", track: "UMUM" }),
  course({ kode: "SIF701", nama_id: "Magang", nama_en: "Internship", sks_teori: 0, sks_praktik: 3, semester_rekomendasi: 7, status: "WAJIB", track: "UMUM", tipe_aktivitas: "PROYEK", keterangan_semester: "Dilaksanakan antara semester 6 & 7 selama 3 bulan" }),
  course({ kode: "FTK151", nama_id: "Metodologi Penelitian dan Penulisan Ilmiah", nama_en: "Research Methodology and Academic Writing", sks_teori: 2, sks_praktik: 0, semester_rekomendasi: 7, status: "WAJIB", track: "UMUM" }),
  course({ kode: "SIF702", nama_id: "Keamanan Sistem Informasi", nama_en: "IS Security", sks_teori: 3, sks_praktik: 0, semester_rekomendasi: 7, status: "WAJIB", track: "UMUM" }),
  course({ kode: "SIF703", nama_id: "Interaksi Manusia dan Komputer", nama_en: "Human-Computer Interaction", sks_teori: 3, sks_praktik: 0, semester_rekomendasi: 7, status: "WAJIB", track: "UMUM" }),

  // Semester 8
  course({ kode: "SIF801", nama_id: "Etika Komputer dan Hukum", nama_en: "Computer Ethics and Law", sks_teori: 3, sks_praktik: 0, semester_rekomendasi: 8, status: "WAJIB", track: "UMUM" }),
  course({ kode: "SIF802", nama_id: "Tugas Akhir", nama_en: "Thesis", sks_teori: 0, sks_praktik: 6, semester_rekomendasi: 8, status: "WAJIB", track: "UMUM", tipe_aktivitas: "PROYEK" }),
]
