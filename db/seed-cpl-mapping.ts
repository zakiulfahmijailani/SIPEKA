// Run with: npm run db:seed-cpl-mapping (atau npx tsx db/seed-cpl-mapping.ts)
import { config } from "dotenv"
config({ path: ".env.local" })

import path from "path"
import * as XLSX from "xlsx"
import { db } from "./index"
import { cpl, mataKuliah, petaKurikulum } from "./schema"

// Helper to normalize strings for better matching
function normalizeText(text: string) {
  return text.toLowerCase()
    .replace(/sistem informasi/g, "si")
    .replace(/manajemen resiko/g, "manajemen risiko")
    .replace(/gudang data & penambangan data/g, "gudang data dan penambangan data")
    .replace(/gudang data dan data mining/g, "gudang data dan penambangan data")
    .replace(/pemograman/g, "pemrograman")
    .replace(/infomasi/g, "informasi")
    .replace(/metodologi penelitian/g, "metodologi penelitian dan penulisan ilmiah")
    .replace(/[^a-z0-9]/g, ""); // remove spaces and punctuation
}

async function runSeed() {
  console.log("Mulai sebaran CPL ke Mata Kuliah dari Excel...");

  const excelPath = path.join(process.cwd(), "public", "Sebaran CPL.xlsx");
  let workbook;
  try {
    workbook = XLSX.readFile(excelPath);
  } catch (error) {
    console.error("Gagal membaca file Excel:", error);
    process.exit(1);
  }

  const mainSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[mainSheetName];
  const rows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });

  // 1. Fetch all CPLs
  const allCpl = await db.select().from(cpl);
  if (allCpl.length === 0) {
    console.log("⚠️ Peringatan: Tabel CPL kosong! Pastikan CPL sudah di-seed sebelumnya.");
  }

  // 2. Fetch all MKs
  const allMk = await db.select().from(mataKuliah);

  // Row 1 contains Course Names
  const courseHeaders = rows[1];
  const courses: { index: number; name: string; cleanName: string }[] = [];
  
  for (let i = 1; i < courseHeaders.length; i++) {
    const rawName = courseHeaders[i];
    if (rawName) {
      // Clean name: take the Indonesian part (before the slash '/') and trim footnotes like '1)'
      const idName = rawName.split('/')[0].trim().replace(/\d+\)$/, "").trim();
      courses.push({ index: i, name: rawName, cleanName: idName });
    }
  }

  let inserted = 0;
  let skipped = 0;
  let notFoundMk = new Set<string>();
  let notFoundCpl = new Set<string>();

  // Reset semua mapping
  await db.delete(petaKurikulum);
  console.log("Menghapus pemetaan CPL sebelumnya...");

  for (let r = 2; r <= 11; r++) {
    const row = rows[r];
    if (!row) continue;
    const cplText = row[0];
    if (!cplText) continue;

    // Extract CPL Code (e.g., CPL01/S1)
    const match = cplText.match(/\((CPL\d{2}\/[A-Z0-9]+)\)/);
    const cplCode = match ? match[1] : cplText;
    const cplIdStr = cplCode.split("/")[0]; // "CPL01"

    const foundCpl = allCpl.find(c => c.kode.includes(cplIdStr) || c.kode === cplCode);
    if (!foundCpl) {
      notFoundCpl.add(cplCode);
      continue;
    }

    for (let c = 1; c < row.length; c++) {
      const cell = row[c];
      const cellStr = String(cell).trim().toLowerCase();
      const isChecked = cell === true || cellStr === '✓' || cellStr === 'v' || cellStr === 'x';
      
      if (isChecked) {
        const course = courses.find((x) => x.index === c);
        if (!course) continue;
        
        const mkName = course.cleanName;
        const normInput = normalizeText(mkName);
        const foundMk = allMk.find(mk => 
            normalizeText(mk.nama_id).includes(normInput) || 
            normInput.includes(normalizeText(mk.nama_id))
        );

        if (!foundMk) {
          if (!mkName.toLowerCase().includes("magang")) {
            notFoundMk.add(mkName);
          }
          continue;
        }

        try {
          await db.insert(petaKurikulum).values({
            cpl_id: foundCpl.id,
            mk_id: foundMk.id,
            bobot: 1.00,
          });
          inserted++;
          console.log(`[BERHASIL] ${cplCode} -> ${mkName}`);
        } catch (err: any) {
          skipped++;
          console.error(`[GAGAL INSERT] ${cplCode} -> ${mkName}:`, err.message);
        }
      }
    }
  }

  console.log("\n=================================================");
  console.log("✅ SUMMARY SEEDING CPL (DARI EXCEL)");
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
