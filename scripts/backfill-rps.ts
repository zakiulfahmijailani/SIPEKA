import { config } from "dotenv"
import fs from "fs"

if (fs.existsSync(".env.production.local")) {
  config({ path: ".env.production.local" })
} else {
  config({ path: ".env.local" })
}

if (process.env.DATABASE_URL) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace(/^["']|["']$/g, "").trim()
}

import {
  dosirMk,
  rps,
  cpmk,
  cpmkCpl,
  subCpmk,
  komponenPenilaian,
  komponenCpmk,
  komponenSubCpmk,
  rubrikKriteria,
  cpmkTemplate,
  assessmentTemplate,
} from "../db/schema"
import { eq, and, asc } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"

async function runBackfill() {
  const { db } = await import("../db")
  console.log("=== Memulai Backfill RPS untuk Seluruh Penugasan Dosen ===")
  const startTime = performance.now()

  // 1. Ambil semua penugasan (dosirMk) beserta MK dan RPS yang sudah ada
  const allDosirs = await db.query.dosirMk.findMany({
    with: {
      mk: true,
      dosen: true,
      rps: {
        columns: { id: true, status: true, version: true },
      },
    },
  })

  console.log(`Ditemukan total ${allDosirs.length} penugasan mata kuliah (dosir_mk).`)

  const missingRpsDosirs = allDosirs.filter((d) => !d.rps || d.rps.length === 0)
  console.log(`Ditemukan ${missingRpsDosirs.length} penugasan yang BELUM memiliki RPS.`)

  if (missingRpsDosirs.length === 0) {
    console.log("Semua penugasan sudah memiliki RPS. Tidak ada yang perlu di-backfill.")
    process.exit(0)
  }

  let successCount = 0
  let failCount = 0

  for (let i = 0; i < missingRpsDosirs.length; i++) {
    const dosir = missingRpsDosirs[i]
    const prefix = `[${i + 1}/${missingRpsDosirs.length}] ${dosir.mk?.kode || "MK"} - ${dosir.dosen?.nama_lengkap || "Dosen"}`
    console.log(`Memproses ${prefix}...`)

    try {
      const [cpmkTemplates, assessmentTemplates] = await Promise.all([
        db.query.cpmkTemplate.findMany({
          where: and(eq(cpmkTemplate.mk_id, dosir.mk_id), eq(cpmkTemplate.is_active, true)),
          orderBy: [asc(cpmkTemplate.urutan)],
          with: { subCpmks: true },
        }),
        db.query.assessmentTemplate.findMany({
          where: and(eq(assessmentTemplate.mk_id, dosir.mk_id), eq(assessmentTemplate.is_active, true)),
          orderBy: [asc(assessmentTemplate.urutan)],
          with: { cpmkTemplate: true, subCpmkTemplate: true },
        }),
      ])

      const rpsId = createId()

      // 1. Insert RPS Header
      const [insertedRps] = await db
        .insert(rps)
        .values({
          id: rpsId,
          dosir_mk_id: dosir.id,
          status: "DRAFT",
          version: 1,
          deskripsi_mk: dosir.mk?.deskripsi || null,
          status_revisi: "R-1",
          tanggal_penyusunan: new Date().toISOString().slice(0, 10),
          jabatan_penyetuju: "Ketua Program Studi",
        })
        .returning()

      // 2. Batch CPMK & Sub-CPMK
      const cpmkInserts: (typeof cpmk.$inferInsert)[] = []
      const cpmkCplInserts: (typeof cpmkCpl.$inferInsert)[] = []
      const subCpmkInserts: (typeof subCpmk.$inferInsert)[] = []
      const templateCodeToNewCpmkId = new Map<string, string>()
      const templateSubCodeToNewSubId = new Map<string, string>()

      for (const tmpl of cpmkTemplates) {
        const newCpmkId = createId()
        templateCodeToNewCpmkId.set(tmpl.kode, newCpmkId)

        cpmkInserts.push({
          id: newCpmkId,
          rps_id: rpsId,
          kode: tmpl.kode,
          deskripsi: tmpl.deskripsi,
          metode_pencapaian: tmpl.metode_pencapaian || "Tatap muka, diskusi, dan latihan terstruktur",
          urutan: tmpl.urutan,
        })

        if (tmpl.cpl_id) {
          cpmkCplInserts.push({
            cpmk_id: newCpmkId,
            cpl_id: tmpl.cpl_id,
          })
        }

        if (tmpl.subCpmks?.length) {
          for (const sub of tmpl.subCpmks) {
            const newSubId = createId()
            templateSubCodeToNewSubId.set(sub.kode, newSubId)
            subCpmkInserts.push({
              id: newSubId,
              cpmk_id: newCpmkId,
              kode: sub.kode,
              deskripsi: sub.deskripsi,
              level_bloom: sub.level_bloom,
              urutan: sub.urutan,
            })
          }
        }
      }

      if (cpmkInserts.length > 0) {
        await db.insert(cpmk).values(cpmkInserts)
      }
      if (cpmkCplInserts.length > 0) {
        await db.insert(cpmkCpl).values(cpmkCplInserts).onConflictDoNothing()
      }
      if (subCpmkInserts.length > 0) {
        await db.insert(subCpmk).values(subCpmkInserts).onConflictDoNothing()
      }

      // 3. Batch Assessment & Rubrik
      const komponenInserts: (typeof komponenPenilaian.$inferInsert)[] = []
      const komponenCpmkInserts: (typeof komponenCpmk.$inferInsert)[] = []
      const komponenSubCpmkInserts: (typeof komponenSubCpmk.$inferInsert)[] = []
      const rubrikInserts: (typeof rubrikKriteria.$inferInsert)[] = []

      for (const tmpl of assessmentTemplates) {
        const newKompId = createId()
        komponenInserts.push({
          id: newKompId,
          rps_id: rpsId,
          nama: tmpl.nama,
          tipe: tmpl.tipe,
          bobot: tmpl.bobot,
          kriteria_penilaian: tmpl.kriteria_penilaian,
          urutan: tmpl.urutan,
        })

        if (tmpl.cpmkTemplate?.kode) {
          const targetCpmkId = templateCodeToNewCpmkId.get(tmpl.cpmkTemplate.kode)
          if (targetCpmkId) {
            komponenCpmkInserts.push({ komponen_id: newKompId, cpmk_id: targetCpmkId })
          }
        }

        if (tmpl.subCpmkTemplate?.kode) {
          const targetSubId = templateSubCodeToNewSubId.get(tmpl.subCpmkTemplate.kode)
          if (targetSubId) {
            komponenSubCpmkInserts.push({ komponen_id: newKompId, sub_cpmk_id: targetSubId })
          }
        }

        rubrikInserts.push({
          komponen_id: newKompId,
          kriteria: tmpl.kriteria_penilaian || "Kualitas pencapaian tugas",
          bobot: 100,
          sangat_baik: "Sangat baik menunjukkan analisis, implementasi, pengujian, dokumentasi, sikap, dan pemahaman.",
          baik: "Baik menunjukkan analisis, implementasi, pengujian, dokumentasi, sikap, dan pemahaman.",
          cukup: "Cukup menunjukkan analisis, implementasi, pengujian, dokumentasi, sikap, dan pemahaman.",
          kurang: "Kurang menunjukkan analisis, implementasi, pengujian, dokumentasi, sikap, dan pemahaman.",
          sangat_kurang: "Sangat kurang menunjukkan pencapaian pada aspek yang dinilai.",
          urutan: 1,
        })
      }

      if (komponenInserts.length > 0) {
        await db.insert(komponenPenilaian).values(komponenInserts)
      }
      if (komponenCpmkInserts.length > 0) {
        await db.insert(komponenCpmk).values(komponenCpmkInserts)
      }
      if (komponenSubCpmkInserts.length > 0) {
        await db.insert(komponenSubCpmk).values(komponenSubCpmkInserts)
      }
      if (rubrikInserts.length > 0) {
        await db.insert(rubrikKriteria).values(rubrikInserts)
      }

      console.log(`✓ Berhasil membuat RPS ${insertedRps.id} (${cpmkInserts.length} CPMK, ${komponenInserts.length} Asesmen)`)
      successCount++
    } catch (err) {
      console.error(`✗ Gagal membuat RPS untuk ${dosir.id}:`, err)
      failCount++
    }
  }

  const durationSec = ((performance.now() - startTime) / 1000).toFixed(2)
  console.log("\n=== Ringkasan Backfill ===")
  console.log(`Waktu: ${durationSec} detik`)
  console.log(`Berhasil: ${successCount}`)
  console.log(`Gagal: ${failCount}`)
  process.exit(failCount > 0 ? 1 : 0)
}

runBackfill().catch((err) => {
  console.error("Fatal backfill error:", err)
  process.exit(1)
})
