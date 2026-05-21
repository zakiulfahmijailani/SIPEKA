// Run with: npm run db:seed-cpl-mapping (atau npx tsx db/seed-cpl-mapping.ts)
import { config } from "dotenv"
config({ path: ".env.local" })

import { db } from "./index"
import { cpl, mataKuliah, petaKurikulum } from "./schema"
import { eq, ilike } from "drizzle-orm"

const mappingData = [
  { 
    cplKode: "CPL01/S1", 
    mks: ["Pengantar Bisnis dan Manajemen", "Pengantar Statistik", "Etika Komputer dan Hukum", "Keamanan Sistem Informasi", "Interaksi Manusia dan Komputer"] 
  },
  { 
    cplKode: "CPL02/S2", 
    mks: ["Pengantar Bisnis dan Manajemen", "Bahasa Inggris 2", "Kepemimpinan Dinamis", "Kewirausahaan yang Efektif", "Manajemen Teknologi Informasi", "Manajemen Proyek Sistem Informasi", "Etika Komputer dan Hukum", "Keamanan Sistem Informasi", "Interaksi Manusia dan Komputer", "Metodologi Penelitian dan Penulisan Ilmiah", "Agama", "Kewirausahaan Berbasis Teknologi"] 
  },
  { 
    cplKode: "CPL03/P1", 
    mks: ["Pengantar Teknologi Informasi", "Algoritma dan Pemrograman", "Jaringan Komputer", "Struktur Data", "Pengantar Statistik", "Konsep Sistem Informasi", "Statistik", "Aljabar Linier", "Sistem Informasi Manajemen", "Manajemen Pengetahuan", "Manajemen Pengetahuan Lanjut", "Rekayasa Perangkat Lunak", "Pemrograman Berorientasi Objek", "Analisis Perancangan Sistem Informasi", "Sistem Basis Data Lanjut", "Bahasa Indonesia", "Testing dan Implementasi Sistem Informasi", "Arsitektur Sistem Informasi", "Manajemen Proyek Sistem Informasi", "Kecerdasan Bisnis", "Sistem Basis Data Berorientasi Objek", "Pemodelan Data", "Audit Sistem Informasi", "Metodologi Penelitian dan Penulisan Ilmiah", "Tugas Akhir", "Keamanan Sistem Informasi"] 
  },
  { 
    cplKode: "CPL04/P2", 
    mks: ["Algoritma dan Pemrograman", "Struktur Data", "Konsep Sistem Informasi", "Sistem Operasi", "Manajemen Teknologi Informasi", "Pengalihan LAN dan Nirkabel", "Analisis Perancangan Sistem Informasi", "Sistem Basis Data Lanjut", "Testing dan Implementasi Sistem Informasi", "Pemodelan Data", "Teknologi Berbasis Awan", "Audit Sistem Informasi", "Tata Kelola Sistem Informasi", "Manajemen Risiko Teknologi Informasi dan Perubahan", "Maha Data", "Agama", "Keamanan Sistem Informasi", "Interaksi Manusia dan Komputer", "Etika Komputer dan Hukum", "Tugas Akhir"] 
  },
  { 
    cplKode: "CPL05/KU1", 
    mks: ["Bahasa Inggris 1", "Algoritma dan Pemrograman", "Bahasa Inggris 2", "Pengantar Statistik", "Kewirausahaan yang Efektif", "Pemrograman Visual", "Statistik", "Aljabar Linier", "Sistem Informasi Manajemen", "Manajemen Teknologi Informasi", "Pemrograman Bergerak", "Manajemen Pengetahuan Lanjut", "Rekayasa Perangkat Lunak", "Pemrograman Berorientasi Objek", "Analisis Perancangan Sistem Informasi", "Informasi dan Proses Bisnis", "Testing dan Implementasi Sistem Informasi", "Arsitektur Sistem Informasi", "Proposal Bisnis Teknologi Informasi", "Kapita Selekta Sistem Informasi", "Metodologi Penelitian dan Penulisan Ilmiah", "Tugas Akhir", "Keamanan Sistem Informasi"] 
  },
  { 
    cplKode: "CPL06/KU2", 
    mks: ["Bahasa Inggris 1", "Pengantar Teknologi Informasi", "Bahasa Inggris 2", "Kepemimpinan Dinamis", "Kewirausahaan yang Efektif", "Manajemen Teknologi Informasi", "Manajemen Proyek Sistem Informasi", "Testing dan Implementasi Sistem Informasi", "Proposal Bisnis Teknologi Informasi", "Kapita Selekta Sistem Informasi", "Tata Kelola Sistem Informasi", "Agama", "Metodologi Penelitian dan Penulisan Ilmiah", "Interaksi Manusia dan Komputer", "Magang/Internship", "Tugas Akhir"] 
  },
  { 
    cplKode: "CPL07/KU3", 
    mks: ["Bahasa Inggris 1", "Pengantar Teknologi Informasi", "Sistem Basis Data", "Bahasa Inggris 2", "Konsep Sistem Informasi", "Statistik", "Aljabar Linier", "Sistem Informasi Manajemen", "Sistem Operasi", "Pemrograman Bergerak", "Manajemen Pengetahuan Lanjut", "Arsitektur Sistem Informasi", "Kecerdasan Bisnis", "Teknologi Berbasis Awan", "Kapita Selekta Sistem Informasi", "Tata Kelola Sistem Informasi", "Metodologi Penelitian dan Penulisan Ilmiah", "Keamanan Sistem Informasi", "Interaksi Manusia dan Komputer", "Etika Komputer dan Hukum", "Magang/Internship", "Tugas Akhir"] 
  },
  { 
    cplKode: "CPL08/KK1", 
    mks: ["Algoritma dan Pemrograman", "Sistem Basis Data", "Struktur Data", "Pengantar Statistik", "Statistik", "Aljabar Linier", "Manajemen Pengetahuan", "Analisis Perancangan Sistem Informasi", "Sistem Basis Data Lanjut", "Testing dan Implementasi Sistem Informasi", "Pemodelan Data", "Sistem Basis Data Berorientasi Objek", "Gudang Data dan Penambangan Data", "Keamanan Sistem Informasi", "Tugas Akhir"] 
  },
  { 
    cplKode: "CPL09/KK2", 
    mks: ["Sistem Basis Data", "Jaringan Komputer", "Pemrograman Visual", "Sistem Informasi Manajemen", "Sistem Operasi", "Manajemen Pengetahuan", "Manajemen Teknologi Informasi", "Pemrograman Bergerak", "Pengalihan LAN dan Nirkabel", "Manajemen Pengetahuan Lanjut", "Rekayasa Perangkat Lunak", "Pemrograman Berorientasi Objek", "Analisis Perancangan Sistem Informasi", "Informasi dan Proses Bisnis", "Sistem Informasi Enterprise Terpadu", "Sistem Basis Data Lanjut", "Testing dan Implementasi Sistem Informasi", "Arsitektur Sistem Informasi", "Manajemen Proyek Sistem Informasi", "Kecerdasan Bisnis", "Sistem Informasi Akuntansi", "Sistem Basis Data Berorientasi Objek", "Pemodelan Data", "Teknologi Berbasis Awan", "Audit Sistem Informasi", "Tata Kelola Sistem Informasi", "Manajemen Risiko Teknologi Informasi dan Perubahan", "Maha Data", "Gudang Data dan Penambangan Data", "Magang/Internship", "Keamanan Sistem Informasi", "Tugas Akhir"] 
  },
  { 
    cplKode: "CPL10/KK3", 
    mks: ["Jaringan Komputer", "Pengantar Bisnis dan Manajemen", "Kewirausahaan yang Efektif", "Pemrograman Visual", "Sistem Informasi Manajemen", "Pemrograman Bergerak", "Rekayasa Perangkat Lunak", "Informasi dan Proses Bisnis", "Sistem Informasi Enterprise Terpadu", "Testing dan Implementasi Sistem Informasi", "Kecerdasan Bisnis", "Sistem Informasi Akuntansi", "Ekonomi Informasi", "Proposal Bisnis Teknologi Informasi", "Kapita Selekta Sistem Informasi", "Kewirausahaan Berbasis Teknologi", "Tugas Akhir"] 
  }
];

// Helper to normalize strings for better matching
function normalizeText(text: string) {
  return text.toLowerCase()
    .replace(/sistem informasi/g, "si")
    .replace(/manajemen resiko ti/g, "manajemen risiko teknologi informasi dan perubahan")
    .replace(/gudang data dan data mining/g, "gudang data dan penambangan data")
    .replace(/pemograman/g, "pemrograman")
    .replace(/metodologi penelitian/g, "metodologi penelitian dan penulisan ilmiah")
    .replace(/[^a-z0-9]/g, ""); // remove spaces and punctuation
}

async function runSeed() {
  console.log("Mulai sebaran CPL ke Mata Kuliah...");

  // 1. Fetch all CPLs
  const allCpl = await db.select().from(cpl);
  if (allCpl.length === 0) {
    console.log("⚠️ Peringatan: Tabel CPL kosong! Pastikan CPL sudah di-seed sebelumnya.");
  }

  // 2. Fetch all MKs
  const allMk = await db.select().from(mataKuliah);
  
  let inserted = 0;
  let skipped = 0;
  let notFoundMk = new Set<string>();
  let notFoundCpl = new Set<string>();

  // Optional: hapus semua mapping yang ada sebelumnya (reset)
  await db.delete(petaKurikulum);

  for (const mapData of mappingData) {
    // Cari CPL - support pencarian by prefix e.g. "CPL01" matching "CPL01/S1"
    const cplIdStr = mapData.cplKode.split("/")[0]; // "CPL01"
    const foundCpl = allCpl.find(c => c.kode.includes(cplIdStr) || c.kode === mapData.cplKode);
    
    if (!foundCpl) {
      notFoundCpl.add(mapData.cplKode);
      continue;
    }

    for (const mkName of mapData.mks) {
      const normInput = normalizeText(mkName);
      const foundMk = allMk.find(mk => normalizeText(mk.nama_id).includes(normInput) || normInput.includes(normalizeText(mk.nama_id)));
      
      if (!foundMk) {
        // Pengecualian khusus: jika namanya Magang/Internship, abaikan karena di seed sebelumnya tidak kita masukkan
        if (!mkName.includes("Magang")) {
          notFoundMk.add(mkName);
        }
        continue;
      }

      // Insert ke petaKurikulum
      try {
        await db.insert(petaKurikulum).values({
          cpl_id: foundCpl.id,
          mk_id: foundMk.id,
          bobot: 1,
        });
        inserted++;
      } catch (err) {
        // Abaikan error duplicate key
        skipped++;
      }
    }
  }

  console.log("\n=================================================");
  console.log("✅ SUMMARY SEEDING CPL");
  console.log("=================================================");
  console.log(`Berhasil insert    : ${inserted} baris`);
  console.log(`Skipped (duplicate): ${skipped} baris`);

  if (notFoundCpl.size > 0) {
    console.log(`\n❌ CPL tidak ditemukan di database:`);
    notFoundCpl.forEach(c => console.log(`  - ${c}`));
  }

  if (notFoundMk.size > 0) {
    console.log(`\n❌ Mata Kuliah tidak cocok / tidak ditemukan di database:`);
    notFoundMk.forEach(m => console.log(`  - ${m}`));
  }

  process.exit(0);
}

runSeed().catch(err => {
  console.error("Gagal melakukan sebaran CPL:", err);
  process.exit(1);
});
