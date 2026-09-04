const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const workbookPath = path.join(__dirname, '../document reference/Simulasi SIF1 R3 T14.xlsx');
const wb = XLSX.readFile(workbookPath);

// 1. Parse T2 CPL for CPL metadata
const sT2 = wb.Sheets['T2 CPL'];
const rowsT2 = XLSX.utils.sheet_to_json(sT2, { header: 1 });
const cplMeta = new Map(); // CPL01 -> { kode, domain, rumusan }
for (let i = 1; i < rowsT2.length; i++) {
  const row = rowsT2[i];
  const kode = row[0] ? String(row[0]).trim().toUpperCase() : '';
  const domain = row[1] ? String(row[1]).trim() : '';
  const rumusan = row[2] ? String(row[2]).trim() : '';
  if (kode && rumusan) {
    cplMeta.set(kode, { kode, domain, rumusan });
  }
}

// 2. Parse T12b CPL-CPMK-MK for CPMK rumusan
const sT12b = wb.Sheets['T12b CPL-CPMK-MK'];
const rowsT12b = XLSX.utils.sheet_to_json(sT12b, { header: 1 });
const cpmkDefinitions = new Map(); // CPMK1 -> { kode, cplKode, rumusan }
let lastCpl = '';
for (let i = 1; i < rowsT12b.length; i++) {
  const row = rowsT12b[i];
  if (row[1]) lastCpl = String(row[1]).trim().toUpperCase();
  const cpmkRaw = row[4] ? String(row[4]).trim().toUpperCase().replace(/\s+/g, '') : '';
  const rumusan = row[5] ? String(row[5]).trim() : '';
  if (cpmkRaw) {
    const kode = cpmkRaw.startsWith('CPMK') ? cpmkRaw : 'CPMK' + cpmkRaw;
    if (!cpmkDefinitions.has(kode) || rumusan) {
      cpmkDefinitions.set(kode, { kode, defaultCpl: lastCpl, rumusan });
    }
  }
}

// 3. Parse T14 CPL-MK-CPMK-OK for MK -> CPL -> CPMK mapping
const sT14 = wb.Sheets['T14 CPL-MK-CPMK-OK'];
const rowsT14 = XLSX.utils.sheet_to_json(sT14, { header: 1 });
const cplHeaders = rowsT14[1]; // [null, null, 'CPL01', 'CPL02', ...]

const t14Relations = new Map(); // mkKode -> Map(cplKode -> Set(cpmkKode))
const mkInfo = new Map();

for (let i = 2; i < rowsT14.length; i++) {
  const row = rowsT14[i];
  const mkKode = row[0] ? String(row[0]).trim().toUpperCase() : '';
  const mkNama = row[1] ? String(row[1]).trim() : '';
  if (!mkKode) continue;
  mkInfo.set(mkKode, mkNama);

  if (!t14Relations.has(mkKode)) t14Relations.set(mkKode, new Map());
  const mkMap = t14Relations.get(mkKode);

  for (let c = 2; c < cplHeaders.length; c++) {
    const cplKode = cplHeaders[c] ? String(cplHeaders[c]).trim().toUpperCase() : '';
    const val = row[c] ? String(row[c]).trim() : '';
    if (cplKode && val) {
      if (!mkMap.has(cplKode)) mkMap.set(cplKode, new Set());
      const rawCpmks = val.split(/[,;\n]+/).map(s => s.trim().toUpperCase().replace(/\s+/g, '')).filter(Boolean);
      for (const cpmk of rawCpmks) {
        const canon = cpmk.startsWith('CPMK') ? cpmk : 'CPMK' + cpmk;
        mkMap.get(cplKode).add(canon);
      }
    }
  }
}

// 4. Parse T15 MK-CPMK-SubCPMK-OK
const sT15 = wb.Sheets['T15 MK-CPMK-SubCPMK-OK'];
const rowsT15 = XLSX.utils.sheet_to_json(sT15, { header: 1 });

const t15SubCpmks = new Map(); // mkKode -> Map(cpmkKode -> Array({ subKode, uraian }))
let curMk = '';
let curCpmk = '';

for (let i = 1; i < rowsT15.length; i++) {
  const row = rowsT15[i];
  if (row[1]) curMk = String(row[1]).trim().toUpperCase();
  if (row[3]) {
    const raw = String(row[3]).trim().toUpperCase().replace(/\s+/g, '');
    curCpmk = raw.startsWith('CPMK') ? raw : 'CPMK' + raw;
  }
  const subKode = row[4] ? String(row[4]).trim() : '';
  const uraian = row[5] ? String(row[5]).trim() : '';

  if (curMk && curCpmk) {
    if (!t15SubCpmks.has(curMk)) t15SubCpmks.set(curMk, new Map());
    const cpmkMap = t15SubCpmks.get(curMk);
    if (!cpmkMap.has(curCpmk)) cpmkMap.set(curCpmk, []);
    if (subKode && uraian) {
      cpmkMap.get(curCpmk).push({ subKode, uraian });
    }
  }
}

// 5. The 5 intentionally empty courses
const EMPTY_COURSES = new Set(['SIF911', 'SIF912', 'SIF906', 'SIF611', 'UNI102']);

// 6. Build the clean, corrected mappings:
// Array of Curriculum2026MkCpmkMapping: { kode_mk, cpl_kode, cpmk_kode, sub_kode, uraian }
const finalMappings = [];
const allSubCpmksMaster = new Map(); // `${cpmkKode}:${subKode}` -> { cpmk_kode, sub_kode, uraian }

// Iterate over all courses in T14
const allMkCodes = [...new Set([...t14Relations.keys(), ...t15SubCpmks.keys()])].sort();

for (const mkKode of allMkCodes) {
  if (EMPTY_COURSES.has(mkKode)) {
    continue; // Leave intentionally empty
  }

  const cplMap = t14Relations.get(mkKode);
  if (!cplMap || cplMap.size === 0) {
    continue; // No valid CPL mapping in T14
  }

  const t15MkMap = t15SubCpmks.get(mkKode) || new Map();

  // For each CPL mapped to this MK in T14
  for (const [cplKode, cpmkSet] of cplMap.entries()) {
    for (const cpmkKode of cpmkSet) {
      // Get sub-CPMKs for this course and CPMK from T15
      let subs = t15MkMap.get(cpmkKode) || [];

      // Clean anomalies:
      // Anomaly 1: 34.3 under CPMK21 in SIF214, SIF319, SIF407, SIF503, SIF609, SIF703
      if (cpmkKode === 'CPMK21') {
        subs = subs.filter(s => s.subKode !== '34.3');
      }

      // Anomaly 2: 34.3 under CPMK33 in SIF318
      if (mkKode === 'SIF318' && cpmkKode === 'CPMK33') {
        subs = subs.filter(s => s.subKode !== '34.3');
      }

      // Deduplicate subs by subKode
      const seenSubCodes = new Set();
      const uniqueSubs = [];
      for (const s of subs) {
        if (!seenSubCodes.has(s.subKode)) {
          seenSubCodes.add(s.subKode);
          uniqueSubs.push(s);
        }
      }

      // If there are unique sub-CPMKs from T15
      if (uniqueSubs.length > 0) {
        for (const s of uniqueSubs) {
          finalMappings.push({
            kode_mk: mkKode,
            cpl_kode: cplKode,
            cpmk_kode: cpmkKode,
            sub_kode: s.subKode,
            uraian: s.uraian,
          });

          const masterKey = `${cpmkKode}:${s.subKode}`;
          if (!allSubCpmksMaster.has(masterKey)) {
            allSubCpmksMaster.set(masterKey, {
              cpmk_kode: cpmkKode,
              sub_kode: s.subKode,
              uraian: s.uraian,
            });
          }
        }
      } else {
        // In case T14 has a CPMK that has no specific Sub-CPMK in T15,
        // create a default sub-CPMK entry using CPMK description
        const cpmkDef = cpmkDefinitions.get(cpmkKode);
        const subNum = cpmkKode.replace('CPMK', '');
        const fallbackSubKode = `${subNum}.1`;
        const fallbackUraian = cpmkDef?.rumusan || `Menguasai capaian ${cpmkKode}`;

        finalMappings.push({
          kode_mk: mkKode,
          cpl_kode: cplKode,
          cpmk_kode: cpmkKode,
          sub_kode: fallbackSubKode,
          uraian: fallbackUraian,
        });

        const masterKey = `${cpmkKode}:${fallbackSubKode}`;
        if (!allSubCpmksMaster.has(masterKey)) {
          allSubCpmksMaster.set(masterKey, {
            cpmk_kode: cpmkKode,
            sub_kode: fallbackSubKode,
            uraian: fallbackUraian,
          });
        }
      }
    }
  }
}

// 7. Sort mappings logically by MK, CPL, CPMK, Sub-CPMK
finalMappings.sort((a, b) => {
  if (a.kode_mk !== b.kode_mk) return a.kode_mk.localeCompare(b.kode_mk);
  if (a.cpl_kode !== b.cpl_kode) return a.cpl_kode.localeCompare(b.cpl_kode);
  const cpmkNumA = parseInt(a.cpmk_kode.replace(/\D/g, ''), 10) || 0;
  const cpmkNumB = parseInt(b.cpmk_kode.replace(/\D/g, ''), 10) || 0;
  if (cpmkNumA !== cpmkNumB) return cpmkNumA - cpmkNumB;
  return a.sub_kode.localeCompare(b.sub_kode, undefined, { numeric: true });
});

// Master CPMKs list (1..34)
const finalCpmks = [];
for (let i = 1; i <= 34; i++) {
  const code = `CPMK${i}`;
  const def = cpmkDefinitions.get(code);
  finalCpmks.push({
    kode: code,
    cpl_kode: def?.defaultCpl || 'CPL01',
    rumusan: def?.rumusan || '',
  });
}

// Master Sub-CPMKs sorted
const finalSubCpmks = [...allSubCpmksMaster.values()].sort((a, b) => {
  const numA = parseInt(a.cpmk_kode.replace(/\D/g, ''), 10) || 0;
  const numB = parseInt(b.cpmk_kode.replace(/\D/g, ''), 10) || 0;
  if (numA !== numB) return numA - numB;
  return a.sub_kode.localeCompare(b.sub_kode, undefined, { numeric: true });
});

console.log('=== GENERATION SUMMARY ===');
console.log('Total Master CPMK:', finalCpmks.length);
console.log('Total Master Unique Sub-CPMK:', finalSubCpmks.length);
console.log('Total Matrix Mapping Entries:', finalMappings.length);

const uniqueMks = new Set(finalMappings.map(m => m.kode_mk));
console.log('Total Courses with Mappings:', uniqueMks.size);
console.log('Empty Courses (as requested):', [...EMPTY_COURSES].join(', '));

// Verify SIF101 specifically
const sif101 = finalMappings.filter(m => m.kode_mk === 'SIF101');
console.log('\nVerification SIF101 mappings count:', sif101.length);
const sif101Cpmks = [...new Set(sif101.map(m => `${m.cpl_kode}-${m.cpmk_kode}`))];
console.log('SIF101 CPL-CPMK:', sif101Cpmks);
console.log('SIF101 Sub-CPMKs:', sif101.map(m => m.sub_kode));

// Verify that no 34.3 exists under CPMK21 or CPMK33
const anomalyCheck = finalMappings.filter(m => (m.cpmk_kode === 'CPMK21' || m.cpmk_kode === 'CPMK33') && m.sub_kode === '34.3');
console.log('\nAnomaly 34.3 in CPMK21/CPMK33 count (should be 0):', anomalyCheck.length);

// Generate TypeScript code
const tsContent = `// Referensi Kanonis Capaian Pembelajaran Mata Kuliah (CPMK) dan Sub-CPMK Kurikulum 2026
// Disinkronkan secara presisi dari: Simulasi SIF1 R3 T14.xlsx (T14 CPL-MK-CPMK-OK & T15 MK-CPMK-SubCPMK-OK)
// Memperbaiki anomali Sub-CPMK 34.3 dan menyelesaikan diskrepansi T14 vs T15

export type Curriculum2026Cpmk = {
  kode: string
  cpl_kode: string
  rumusan: string
}

export type Curriculum2026SubCpmk = {
  cpmk_kode: string
  sub_kode: string
  uraian: string
}

export type Curriculum2026MkCpmkMapping = {
  kode_mk: string
  cpl_kode: string
  cpmk_kode: string
  sub_kode: string
  uraian: string
}

export const CURRICULUM_2026_CPMK: Curriculum2026Cpmk[] = ${JSON.stringify(finalCpmks, null, 2)};

export const CURRICULUM_2026_SUB_CPMK: Curriculum2026SubCpmk[] = ${JSON.stringify(finalSubCpmks, null, 2)};

export const CURRICULUM_2026_MK_CPMK_MAPPINGS: Curriculum2026MkCpmkMapping[] = ${JSON.stringify(finalMappings, null, 2)};

// Helper: Matrix agregat jumlah Sub-CPMK / CPMK per (Mata Kuliah x CPL)
export function getCpmkMatrixSummary() {
  const summary: Record<string, Record<string, { cpmkCount: number; subCount: number; cpmks: string[] }>> = {}

  for (const m of CURRICULUM_2026_MK_CPMK_MAPPINGS) {
    if (!summary[m.kode_mk]) summary[m.kode_mk] = {}
    if (!summary[m.kode_mk][m.cpl_kode]) {
      summary[m.kode_mk][m.cpl_kode] = { cpmkCount: 0, subCount: 0, cpmks: [] }
    }
    const entry = summary[m.kode_mk][m.cpl_kode]
    entry.subCount += 1
    if (!entry.cpmks.includes(m.cpmk_kode)) {
      entry.cpmks.push(m.cpmk_kode)
      entry.cpmkCount += 1
    }
  }

  return summary
}
`;

fs.writeFileSync(path.join(__dirname, '../db/cpmk-2026-reference.ts'), tsContent, 'utf8');
console.log('Successfully updated db/cpmk-2026-reference.ts!');
