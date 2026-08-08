// Seed CPL → Mata Kuliah Mapping (Hardcoded by Kode MK)
// Run with: npx tsx db/seed-cpl-mapping-v2.ts
// Source: Sebaran CPL Kurikulum Resmi Prodi Sistem Informasi Universitas Bakrie

import { config } from "dotenv"
config({ path: ".env.local" })

import { db } from "./index"
import { cpl, mataKuliah, petaKurikulum } from "./schema"
import { eq } from "drizzle-orm"

// ============================================================
// MAPPING HARDCODED: kode_cpl → kode_mk[]
// Berdasarkan dokumen Sebaran CPL kurikulum resmi
// ============================================================
const CPL_MK_MAPPING: Record<string, string[]> = {
  // CPL01 – Sikap & Tata Nilai
  "CPL01": [
    "SIF101", // Bahasa Inggris 1
    "SIF201", // Bahasa Inggris 2
    "SIF203", // Kepemimpinan Dinamis
    "SIF205", // Kewirausahaan yang Efektif
    "SIF501", // Bahasa Indonesia
    "SIF502", // Kewirausahaan Berbasis Teknologi
    "SIF701", // Agama
    "SIF702", // Pendidikan Kewarganegaraan dan Pancasila
    "SIF801", // Etika Komputer dan Hukum
  ],

  // CPL02 – Penguasaan Ilmu Pengetahuan
  "CPL02": [
    "SIF102", // Pengantar Teknologi Informasi
    "SIF104", // Sistem Basis Data
    "SIF105", // Jaringan Komputer
    "SIF106", // Pengantar Bisnis dan Manajemen
    "SIF202", // Struktur Data
    "SIF204", // Pengantar Statistik
    "SIF207", // Konsep Sistem Informasi
    "SIF301", // Statistik
    "SIF302", // Aljabar Linier
    "SIF303", // Sistem Informasi Manajemen
    "SIF304", // Sistem Operasi
    "SIF305", // Manajemen Pengetahuan
    "SIF306", // Manajemen Teknologi Informasi
    "SIF401", // Pengalihan LAN dan Nirkabel
    "SIF402", // Manajemen Pengetahuan Lanjut
    "SIF403", // Rekayasa Perangkat Lunak
    "SIF406", // Informasi dan Proses Bisnis
    "SIF504", // Arsitektur Sistem Informasi
    "SIF601", // Teknologi Berbasis Awan
    "SIF603", // Ekonomi Informasi
    "SIF604", // Audit Sistem Informasi
    "SIF605", // Kapita Selekta Sistem Informasi
    "SIF704", // Metodologi Penelitian dan Penulisan Ilmiah
    "SIF705", // Keamanan Sistem Informasi
    "SIF706", // Interaksi Manusia dan Komputer
  ],

  // CPL03 – Kemampuan Analisis & Perancangan SI
  "CPL03": [
    "SIF103", // Algoritma dan Pemrograman
    "SIF202", // Struktur Data
    "SIF303", // Sistem Informasi Manajemen
    "SIF403", // Rekayasa Perangkat Lunak
    "SIF404", // Pemrograman Berorientasi Objek
    "SIF405", // Analisis Perancangan Sistem Informasi
    "SIF406", // Informasi dan Proses Bisnis
    "SIF503", // Testing dan Implementasi Sistem Informasi
    "SIF504", // Arsitektur Sistem Informasi
    "SIF505", // Manajemen Proyek Sistem Informasi
    "SIF602", // Proposal Bisnis Teknologi Informasi
    "SIF704", // Metodologi Penelitian dan Penulisan Ilmiah
    "SIF802", // Tugas Akhir
  ],

  // CPL04 – Kemampuan Pemrograman & Implementasi
  "CPL04": [
    "SIF103", // Algoritma dan Pemrograman
    "SIF104", // Sistem Basis Data
    "SIF202", // Struktur Data
    "SIF206", // Pemrograman Visual
    "SIF307", // Pemrograman Bergerak
    "SIF404", // Pemrograman Berorientasi Objek
    "SIF405", // Analisis Perancangan Sistem Informasi
    "SIF503", // Testing dan Implementasi Sistem Informasi
    "SIF505", // Manajemen Proyek Sistem Informasi
    "SIF802", // Tugas Akhir
    // Track DSA
    "SIF408", // Sistem Basis Data Lanjut
    "SIF508", // Sistem Basis Data Berorientasi Objek
    "SIF509", // Pemodelan Data
    "SIF608", // Maha Data
    "SIF609", // Gudang Data dan Penambangan Data
  ],

  // CPL05 – Kemampuan Manajemen & Tata Kelola TI
  "CPL05": [
    "SIF106", // Pengantar Bisnis dan Manajemen
    "SIF203", // Kepemimpinan Dinamis
    "SIF205", // Kewirausahaan yang Efektif
    "SIF305", // Manajemen Pengetahuan
    "SIF306", // Manajemen Teknologi Informasi
    "SIF402", // Manajemen Pengetahuan Lanjut
    "SIF502", // Kewirausahaan Berbasis Teknologi
    "SIF505", // Manajemen Proyek Sistem Informasi
    "SIF602", // Proposal Bisnis Teknologi Informasi
    "SIF603", // Ekonomi Informasi
    "SIF604", // Audit Sistem Informasi
    // Track BIS
    "SIF407", // Sistem Informasi Enterprise Terpadu
    "SIF606", // Tata Kelola Sistem Informasi
    "SIF607", // Manajemen Risiko Teknologi Informasi dan Perubahan
  ],

  // CPL06 – Kemampuan Komunikasi & Kolaborasi
  "CPL06": [
    "SIF101", // Bahasa Inggris 1
    "SIF201", // Bahasa Inggris 2
    "SIF203", // Kepemimpinan Dinamis
    "SIF501", // Bahasa Indonesia
    "SIF602", // Proposal Bisnis Teknologi Informasi
    "SIF605", // Kapita Selekta Sistem Informasi
    "SIF704", // Metodologi Penelitian dan Penulisan Ilmiah
    "SIF802", // Tugas Akhir
  ],

  // CPL07 – Kemampuan Riset & Inovasi
  "CPL07": [
    "SIF204", // Pengantar Statistik
    "SIF301", // Statistik
    "SIF302", // Aljabar Linier
    "SIF502", // Kewirausahaan Berbasis Teknologi
    "SIF602", // Proposal Bisnis Teknologi Informasi
    "SIF605", // Kapita Selekta Sistem Informasi
    "SIF704", // Metodologi Penelitian dan Penulisan Ilmiah
    "SIF802", // Tugas Akhir
    // Track DSA / ISG
    "SIF506", // Kecerdasan Bisnis
    "SIF607", // Manajemen Risiko Teknologi Informasi dan Perubahan
    "SIF608", // Maha Data
    "SIF609", // Gudang Data dan Penambangan Data
  ],

  // CPL08 – Etika Profesional
  "CPL08": [
    "SIF701", // Agama
    "SIF702", // Pendidikan Kewarganegaraan dan Pancasila
    "SIF705", // Keamanan Sistem Informasi
    "SIF801", // Etika Komputer dan Hukum
  ],

  // CPL09 – Keamanan & Keandalan Sistem
  "CPL09": [
    "SIF105", // Jaringan Komputer
    "SIF304", // Sistem Operasi
    "SIF401", // Pengalihan LAN dan Nirkabel
    "SIF601", // Teknologi Berbasis Awan
    "SIF604", // Audit Sistem Informasi
    "SIF705", // Keamanan Sistem Informasi
  ],

  // CPL10 – Penerapan Sistem Informasi di Industri
  "CPL10": [
    "SIF303", // Sistem Informasi Manajemen
    "SIF406", // Informasi dan Proses Bisnis
    "SIF503", // Testing dan Implementasi Sistem Informasi
    "SIF504", // Arsitektur Sistem Informasi
    "SIF506", // Kecerdasan Bisnis (ISG)
    "SIF507", // Sistem Informasi Akuntansi (ISG)
    "SIF601", // Teknologi Berbasis Awan
    "SIF706", // Interaksi Manusia dan Komputer
    "SIF802", // Tugas Akhir
    // Track BIS
    "SIF407", // Sistem Informasi Enterprise Terpadu
    "SIF606", // Tata Kelola Sistem Informasi
  ],
}

// Kompatibilitas kode dari mapping CPL lama ke kode kurikulum 2026/2027.
// Mapping CPL tetap berbasis mata kuliah yang sama; hanya kode resminya yang berubah.
const COURSE_CODE_2026: Record<string, string> = {
  SIF101: "UNI104", SIF102: "SIF101", SIF103: "SIF107", SIF104: "SIF108", SIF105: "SIF109",
  SIF201: "UNI204", SIF203: "SIF210", SIF204: "SIF212", SIF205: "SIF213", SIF206: "SIF214", SIF207: "SIF215",
  SIF301: "FTK161", SIF302: "FTK121", SIF303: "SIF307", SIF304: "SIF311", SIF305: "SIF317", SIF306: "SIF318", SIF307: "SIF319",
  SIF401: "SIF404", SIF402: "SIF405", SIF403: "SIF407", SIF404: "SIF408", SIF405: "SIF409", SIF406: "SIF410",
  SIF407: "SIF901", SIF408: "SIF902", SIF501: "UNI101", SIF502: "FTK221", SIF506: "SIF903", SIF509: "SIF906",
  SIF601: "SIF604", SIF602: "SIF611", SIF603: "SIF608", SIF604: "SIF609", SIF605: "SIF610", SIF606: "SIF907", SIF607: "SIF908",
  SIF608: "SIF909", SIF609: "SIF910", SIF701: "UNI102", SIF702: "UNI106", SIF703: "FTK151", SIF704: "SIF702", SIF705: "SIF703", SIF706: "SIF703",
}

async function runSeed() {
  console.log("🚀 Mulai seed CPL-MK Mapping (Hardcoded v2)...\n")

  // 1. Fetch semua CPL dari DB
  const allCpl = await db.select().from(cpl)
  if (allCpl.length === 0) {
    console.error("❌ Tabel CPL kosong! Jalankan seed CPL terlebih dahulu.")
    process.exit(1)
  }
  console.log(`✅ Loaded ${allCpl.length} CPL dari database`)

  // 2. Fetch semua MK dari DB (indexed by kode)
  const allMk = await db.select().from(mataKuliah)
  const mkByKode = new Map(allMk.map(mk => [mk.kode, mk]))
  console.log(`✅ Loaded ${allMk.length} Mata Kuliah dari database`)

  // 3. Reset semua mapping lama
  await db.delete(petaKurikulum)
  console.log("🗑️  Mapping lama dihapus.\n")

  let inserted = 0
  let skippedMk = new Set<string>()
  let skippedCpl = new Set<string>()

  for (const [kodeCpl, kodeMkList] of Object.entries(CPL_MK_MAPPING)) {
    // Cari CPL di DB — support format "CPL01" atau "CPL01/S1"
    const foundCpl = allCpl.find(
      c => c.kode === kodeCpl ||
           c.kode.startsWith(kodeCpl) ||
           c.kode.replace(/\/.*/, "") === kodeCpl
    )

    if (!foundCpl) {
      skippedCpl.add(kodeCpl)
      continue
    }

    for (const kodeMk of kodeMkList) {
      const resolvedKodeMk = COURSE_CODE_2026[kodeMk] ?? kodeMk
      const foundMk = mkByKode.get(resolvedKodeMk)
      if (!foundMk) {
        skippedMk.add(kodeMk)
        continue
      }

      try {
        await db.insert(petaKurikulum).values({
          cpl_id: foundCpl.id,
          mk_id: foundMk.id,
          bobot: 1.00,
        })
        inserted++
        console.log(`  ✅ ${kodeCpl} → [${resolvedKodeMk}] ${foundMk.nama_id}`)
      } catch (err: any) {
        console.error(`  ❌ GAGAL ${kodeCpl} → ${kodeMk}: ${err.message}`)
      }
    }
  }

  console.log("\n=================================================")
  console.log("📊 SUMMARY SEEDING CPL-MK MAPPING (v2 Hardcoded)")
  console.log("=================================================")
  console.log(`✅ Berhasil insert : ${inserted} mapping`)

  if (skippedCpl.size > 0) {
    console.log(`\n⚠️  CPL tidak ditemukan di database (cek kode):`);
    skippedCpl.forEach(c => console.log(`   - ${c}`))
  }

  if (skippedMk.size > 0) {
    console.log(`\n⚠️  Kode MK tidak ditemukan di database (mungkin belum di-seed):`);
    skippedMk.forEach(m => console.log(`   - ${m}`))
  }

  if (skippedCpl.size === 0 && skippedMk.size === 0) {
    console.log("🎉 Semua CPL dan MK berhasil dipetakan tanpa error!")
  }

  process.exit(0)
}

runSeed().catch(err => {
  console.error("❌ Seed gagal:", err)
  process.exit(1)
})
