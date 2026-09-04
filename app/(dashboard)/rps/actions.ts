"use server"

import { db } from "@/db"
import { createId } from "@paralleldrive/cuid2"
import {
  cpmk,
  cpmkCpl,
  cpmkTemplate,
  assessmentTemplate,
  dosirMk,
  komponenCpmk,
  komponenPenilaian,
  komponenSubCpmk,
  pertemuanSubCpmk,
  rps,
  rpsPertemuan,
  rpsReferensi,
  rpsStatusLog,
  rubrikKriteria,
  subCpmk,
  users,
} from "@/db/schema"
import { and, asc, eq, inArray } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { getCurrentSession } from "@/lib/current-session"
import { createNotification } from "@/lib/notifications"
import { calculateRpsReadiness } from "@/lib/rps-readiness"

export type RpsStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "REVISION_REQUIRED" | "ARCHIVED"
type BloomLevel = "C1" | "C2" | "C3" | "C4" | "C5" | "C6"

type SubCpmkInput = {
  id?: string
  kode: string
  deskripsi: string
  level_bloom?: BloomLevel
  urutan: number
}

type CpmkInput = {
  id?: string
  kode: string
  deskripsi: string
  metode_pencapaian?: string
  cpl_id?: string
  urutan: number
  subCpmks?: SubCpmkInput[]
}

type RubrikInput = {
  kriteria: string
  bobot?: number
  sangat_baik?: string
  baik?: string
  cukup?: string
  kurang?: string
  sangat_kurang?: string
  urutan: number
}

type KomponenInput = {
  id?: string
  nama: string
  tipe?: string
  bobot: number
  deskripsi?: string
  instruksi?: string
  bentuk?: string
  luaran?: string
  kriteria_penilaian?: string
  minggu_pemberian?: number | null
  minggu_pengumpulan?: number | null
  is_kelompok?: boolean
  referensi_tugas?: string
  lain_lain?: string
  urutan: number
  cpmk_ids?: string[]
  sub_cpmk_ids?: string[]
  rubrik_kriterias?: RubrikInput[]
}

type MeetingInput = {
  minggu_ke: number
  materi: string
  metode?: string
  media?: string
  estimasi_waktu?: string
  indikator?: string
  bentuk_pembelajaran?: string
  aktivitas_dosen?: string
  aktivitas_mahasiswa?: string
  kriteria_penilaian?: string
  referensi?: string
  sub_cpmk_ids?: string[]
}

type RpsFormalitiesInput = {
  deskripsi_mk?: string
  metode_pembelajaran?: string
  persyaratan_kehadiran?: string
  status_revisi?: string
  tanggal_penyusunan?: string | null
  nama_penyetuju?: string
  jabatan_penyetuju?: string
  tanggal_pengesahan?: string | null
}

async function resolveActorId() {
  const session = await getCurrentSession()
  if (!session?.user) throw new Error("Unauthorized")
  const sessionId = session.user.id
  const current = await db.query.users.findFirst({ where: eq(users.id, sessionId) })
  if (current) return current.id

  const fallback = await db.query.users.findFirst({
    where: inArray(users.role, ["SUPER_ADMIN", "KAPRODI", "DOSEN"]),
    orderBy: [asc(users.created_at)],
  })
  if (!fallback) throw new Error("Belum ada pengguna aktif untuk mencatat perubahan")
  return fallback.id
}

async function assertCanEditRps(rpsId: string) {
  const session = await getCurrentSession()
  if (!session?.user) throw new Error("Unauthorized")
  if (session.user.role !== "DOSEN") return session

  const target = await db.query.rps.findFirst({
    where: eq(rps.id, rpsId),
    with: { dosirMk: true },
  })
  if (!target || target.dosirMk.dosen_id !== session.user.id) throw new Error("Forbidden")
  if (!['DRAFT', 'REVISION_REQUIRED'].includes(target.status)) {
    throw new Error("RPS yang sudah diajukan atau disetujui tidak dapat diubah")
  }
  return session
}

async function copyCpmkTemplateToRps(rpsId: string, mkId: string) {
  const templates = await db.query.cpmkTemplate.findMany({
    where: and(eq(cpmkTemplate.mk_id, mkId), eq(cpmkTemplate.is_active, true)),
    orderBy: [asc(cpmkTemplate.urutan)],
    with: { subCpmks: true },
  })

  for (const template of templates) {
    const [createdCpmk] = await db
      .insert(cpmk)
      .values({
        rps_id: rpsId,
        kode: template.kode,
        deskripsi: template.deskripsi,
        metode_pencapaian: template.metode_pencapaian || "Tatap muka, diskusi, dan latihan terstruktur",
        urutan: template.urutan,
      })
      .onConflictDoUpdate({
        target: [cpmk.rps_id, cpmk.kode],
        set: { deskripsi: template.deskripsi, metode_pencapaian: template.metode_pencapaian || "Tatap muka, diskusi, dan latihan terstruktur", urutan: template.urutan },
      })
      .returning()

    if (template.cpl_id) {
      await db
        .insert(cpmkCpl)
        .values({ cpmk_id: createdCpmk.id, cpl_id: template.cpl_id })
        .onConflictDoNothing()
    }

    if (template.subCpmks.length > 0) {
      await db.insert(subCpmk).values(
        template.subCpmks.map((item) => ({
          cpmk_id: createdCpmk.id,
          kode: item.kode,
          deskripsi: item.deskripsi,
          level_bloom: item.level_bloom,
          urutan: item.urutan,
        })),
      ).onConflictDoNothing()
    }
  }
}

async function copyAssessmentTemplateToRps(rpsId: string, mkId: string) {
  const assessmentTemplates = await db.query.assessmentTemplate.findMany({
    where: and(eq(assessmentTemplate.mk_id, mkId), eq(assessmentTemplate.is_active, true)),
    orderBy: [asc(assessmentTemplate.urutan)],
    with: { cpmkTemplate: true, subCpmkTemplate: true },
  })
  if (assessmentTemplates.length === 0) return

  const copiedCpmks = await db.query.cpmk.findMany({
    where: eq(cpmk.rps_id, rpsId),
    with: { subCpmks: true },
  })
  const copiedCpmkByCode = new Map(copiedCpmks.map((item) => [item.kode, item]))
  const copiedSubCpmkByCode = new Map(copiedCpmks.flatMap((item) => item.subCpmks.map((sub) => [sub.kode, sub] as const)))

  for (const template of assessmentTemplates) {
    const [component] = await db.insert(komponenPenilaian).values({
      rps_id: rpsId,
      nama: template.nama,
      tipe: template.tipe,
      bobot: template.bobot,
      kriteria_penilaian: template.kriteria_penilaian,
      urutan: template.urutan,
    }).returning()

    const copiedCpmk = template.cpmkTemplate ? copiedCpmkByCode.get(template.cpmkTemplate.kode) : null
    if (copiedCpmk) {
      await db.insert(komponenCpmk).values({ komponen_id: component.id, cpmk_id: copiedCpmk.id })
    }
    const copiedSubCpmk = template.subCpmkTemplate ? copiedSubCpmkByCode.get(template.subCpmkTemplate.kode) : null
    if (copiedSubCpmk) {
      await db.insert(komponenSubCpmk).values({ komponen_id: component.id, sub_cpmk_id: copiedSubCpmk.id })
    }

    await db.insert(rubrikKriteria).values({
      komponen_id: component.id,
      kriteria: template.kriteria_penilaian || "Kualitas pencapaian tugas",
      bobot: 100,
      sangat_baik: "Sangat baik menunjukkan analisis, implementasi, pengujian, dokumentasi, sikap, dan pemahaman.",
      baik: "Baik menunjukkan analisis, implementasi, pengujian, dokumentasi, sikap, dan pemahaman.",
      cukup: "Cukup menunjukkan analisis, implementasi, pengujian, dokumentasi, sikap, dan pemahaman.",
      kurang: "Kurang menunjukkan analisis, implementasi, pengujian, dokumentasi, sikap, dan pemahaman.",
      sangat_kurang: "Sangat kurang menunjukkan pencapaian pada aspek yang dinilai.",
      urutan: 1,
    })
  }
}

async function copyCourseTemplateToRps(rpsId: string, mkId: string) {
  await copyCpmkTemplateToRps(rpsId, mkId)
  await copyAssessmentTemplateToRps(rpsId, mkId)
}

export async function hydrateBlankRpsFromTemplate(dosirMkId: string) {
  try {
    const session = await getCurrentSession()
    if (!session?.user) return { success: false, hydrated: false, error: "Unauthorized" }

    const dosir = await db.query.dosirMk.findFirst({ where: eq(dosirMk.id, dosirMkId), with: { mk: true } })
    if (!dosir) return { success: false, hydrated: false, error: "Penugasan mata kuliah tidak ditemukan" }
    if (session.user.role === "DOSEN" && dosir.dosen_id !== session.user.id) {
      return { success: false, hydrated: false, error: "Anda tidak ditugaskan pada mata kuliah ini" }
    }

    const targetRps = await db.query.rps.findFirst({
      where: eq(rps.dosir_mk_id, dosirMkId),
      orderBy: (table, { desc }) => [desc(table.version)],
      with: { cpmks: true },
    })
    if (!targetRps || !["DRAFT", "REVISION_REQUIRED"].includes(targetRps.status)) {
      return { success: true, hydrated: false }
    }

    const isBlank = targetRps.cpmks.length === 0 || targetRps.cpmks.every((item) => !item.deskripsi.trim())
    if (!isBlank) return { success: true, hydrated: false }

    const hasTemplate = await db.query.cpmkTemplate.findFirst({
      where: and(eq(cpmkTemplate.mk_id, dosir.mk_id), eq(cpmkTemplate.is_active, true)),
      columns: { id: true },
    })
    if (!hasTemplate) return { success: true, hydrated: false }

    await db.delete(cpmk).where(eq(cpmk.rps_id, targetRps.id))
    await copyCpmkTemplateToRps(targetRps.id, dosir.mk_id)
    revalidatePath(`/rps/${dosirMkId}`)
    return { success: true, hydrated: true }
  } catch (error) {
    console.error(error)
    return { success: false, hydrated: false, error: "Gagal mengisi CPMK dari template prodi" }
  }
}

export async function initializeRpsForDosir(dosirMkId: string) {
  const startTime = performance.now()
  try {
    const existing = await db.query.rps.findFirst({
      where: eq(rps.dosir_mk_id, dosirMkId),
      orderBy: (table, { desc }) => [desc(table.version)],
    })
    if (existing) {
      return { success: true, data: existing, durationMs: Math.round(performance.now() - startTime) }
    }

    const dosir = await db.query.dosirMk.findFirst({
      where: eq(dosirMk.id, dosirMkId),
      with: { mk: true },
    })
    if (!dosir) {
      return { success: false, error: "Penugasan mata kuliah tidak ditemukan" }
    }

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

    const [insertedRps] = await db
      .insert(rps)
      .values({
        id: rpsId,
        dosir_mk_id: dosirMkId,
        status: "DRAFT",
        version: 1,
        deskripsi_mk: dosir.mk.deskripsi || null,
        status_revisi: "R-1",
        tanggal_penyusunan: new Date().toISOString().slice(0, 10),
        jabatan_penyetuju: "Ketua Program Studi",
      })
      .returning()

    // Batch CPMK & Sub-CPMK
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

    // Batch Assessment & Rubrik
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

    const durationMs = Math.round(performance.now() - startTime)
    console.log(`[RPS Batch Init] Initialized RPS ${insertedRps.id} for dosir ${dosirMkId} in ${durationMs}ms`)
    revalidatePath(`/rps/${dosirMkId}`)
    return { success: true, data: insertedRps, durationMs }
  } catch (error) {
    console.error("[RPS Batch Init Error]", error)
    return { success: false, error: "Gagal menginisialisasi RPS untuk penugasan ini" }
  }
}

export async function backfillAllMissingRps() {
  const startTime = performance.now()
  try {
    const allDosirs = await db.query.dosirMk.findMany({
      columns: { id: true, mk_id: true },
      with: {
        rps: { columns: { id: true } },
      },
    })

    const missingDosirs = allDosirs.filter((d) => !d.rps || d.rps.length === 0)
    console.log(`[RPS Backfill] Found ${missingDosirs.length} dosirs without RPS out of ${allDosirs.length} total`)

    const results = []
    for (const d of missingDosirs) {
      const res = await initializeRpsForDosir(d.id)
      results.push({ dosirId: d.id, ...res })
    }

    const durationMs = Math.round(performance.now() - startTime)
    console.log(`[RPS Backfill] Completed backfill for ${missingDosirs.length} dosirs in ${durationMs}ms`)
    return {
      success: true,
      totalDosirs: allDosirs.length,
      backfilledCount: missingDosirs.length,
      durationMs,
      results,
    }
  } catch (error) {
    console.error("[RPS Backfill Error]", error)
    return { success: false, error: "Gagal menjalankan backfill RPS" }
  }
}

export async function createOrGetRps(dosirMkId: string) {
  return initializeRpsForDosir(dosirMkId)
}

export async function getRpsCpmks(rpsId: string) {
  const startTime = performance.now()
  try {
    const data = await db.query.cpmk.findMany({
      where: eq(cpmk.rps_id, rpsId),
      orderBy: [asc(cpmk.urutan)],
      with: {
        cplMappings: { with: { cpl: true } },
        subCpmks: { orderBy: [asc(subCpmk.urutan)] },
      },
    })
    const durationMs = Math.round(performance.now() - startTime)
    console.log(`[RPS LazyLoad] getRpsCpmks(${rpsId}) took ${durationMs}ms (${data.length} CPMK)`)
    return { success: true, data, durationMs }
  } catch (error) {
    console.error("[RPS LazyLoad Error] getRpsCpmks:", error)
    return { success: false, error: "Gagal memuat data CPMK & Sub-CPMK", data: [] }
  }
}

export async function getRpsMeetings(rpsId: string) {
  const startTime = performance.now()
  try {
    const data = await db.query.rpsPertemuan.findMany({
      where: eq(rpsPertemuan.rps_id, rpsId),
      orderBy: [asc(rpsPertemuan.minggu_ke)],
      with: {
        subCpmkMappings: true,
      },
    })
    const durationMs = Math.round(performance.now() - startTime)
    console.log(`[RPS LazyLoad] getRpsMeetings(${rpsId}) took ${durationMs}ms (${data.length} pertemuan)`)
    return { success: true, data, durationMs }
  } catch (error) {
    console.error("[RPS LazyLoad Error] getRpsMeetings:", error)
    return { success: false, error: "Gagal memuat rencana mingguan", data: [] }
  }
}

export async function getRpsAssessments(rpsId: string) {
  const startTime = performance.now()
  try {
    const data = await db.query.komponenPenilaian.findMany({
      where: eq(komponenPenilaian.rps_id, rpsId),
      orderBy: [asc(komponenPenilaian.urutan)],
      with: {
        cpmkMappings: true,
        subCpmkMappings: true,
        rubrikKriterias: { orderBy: [asc(rubrikKriteria.urutan)] },
      },
    })
    const durationMs = Math.round(performance.now() - startTime)
    console.log(`[RPS LazyLoad] getRpsAssessments(${rpsId}) took ${durationMs}ms (${data.length} komponen)`)
    return { success: true, data, durationMs }
  } catch (error) {
    console.error("[RPS LazyLoad Error] getRpsAssessments:", error)
    return { success: false, error: "Gagal memuat komponen asesmen & rubrik", data: [] }
  }
}

export async function getRpsReferences(rpsId: string) {
  const startTime = performance.now()
  try {
    const data = await db.query.rpsReferensi.findMany({
      where: eq(rpsReferensi.rps_id, rpsId),
      orderBy: [asc(rpsReferensi.urutan)],
    })
    const durationMs = Math.round(performance.now() - startTime)
    console.log(`[RPS LazyLoad] getRpsReferences(${rpsId}) took ${durationMs}ms (${data.length} referensi)`)
    return { success: true, data, durationMs }
  } catch (error) {
    console.error("[RPS LazyLoad Error] getRpsReferences:", error)
    return { success: false, error: "Gagal memuat referensi", data: [] }
  }
}

export async function getRpsPreviewData(rpsId: string) {
  const startTime = performance.now()
  try {
    const [statusLogsData, rpsRecord, cpmksData, komponensData, pertemuansData, referensisData] = await Promise.all([
      db.query.rpsStatusLog.findMany({
        where: eq(rpsStatusLog.rps_id, rpsId),
        orderBy: (table, { desc }) => [desc(table.created_at)],
        with: { changedBy: true },
      }),
      db.query.rps.findFirst({
        where: eq(rps.id, rpsId),
      }),
      db.query.cpmk.findMany({
        where: eq(cpmk.rps_id, rpsId),
        orderBy: [asc(cpmk.urutan)],
        with: { cplMappings: { with: { cpl: true } }, subCpmks: { orderBy: [asc(subCpmk.urutan)] } },
      }),
      db.query.komponenPenilaian.findMany({
        where: eq(komponenPenilaian.rps_id, rpsId),
        orderBy: [asc(komponenPenilaian.urutan)],
        with: { cpmkMappings: true, subCpmkMappings: true, rubrikKriterias: { orderBy: [asc(rubrikKriteria.urutan)] } },
      }),
      db.query.rpsPertemuan.findMany({
        where: eq(rpsPertemuan.rps_id, rpsId),
        orderBy: [asc(rpsPertemuan.minggu_ke)],
        with: { subCpmkMappings: { with: { subCpmk: true } } },
      }),
      db.query.rpsReferensi.findMany({
        where: eq(rpsReferensi.rps_id, rpsId),
        orderBy: [asc(rpsReferensi.urutan)],
      }),
    ])

    const combinedRps = rpsRecord ? {
      ...rpsRecord,
      cpmks: cpmksData,
      komponens: komponensData,
      pertemuans: pertemuansData,
      referensis: referensisData,
      statusLogs: statusLogsData,
    } : null

    const durationMs = Math.round(performance.now() - startTime)
    console.log(`[RPS LazyLoad] getRpsPreviewData(${rpsId}) took ${durationMs}ms`)
    return { success: true, data: combinedRps, durationMs }
  } catch (error) {
    console.error("[RPS LazyLoad Error] getRpsPreviewData:", error)
    return { success: false, error: "Gagal memuat pratinjau lengkap RPS", data: null }
  }
}

export async function getOfficialRpsDataAction(dosirId: string) {
  try {
    const { getOfficialRpsExportData } = await import("@/lib/rps-export-official")
    const data = await getOfficialRpsExportData(dosirId)
    if (!data) return { success: false, error: "Data RPS tidak ditemukan" }
    return { success: true, data }
  } catch (error: any) {
    console.error("[getOfficialRpsDataAction error]", error)
    return { success: false, error: error?.message || "Gagal memuat format resmi RPS" }
  }
}

export async function updateRpsStatus(id: string, status: RpsStatus, catatan?: string) {
  try {
    const session = await getCurrentSession()
    if (!session?.user) return { success: false, error: "Unauthorized" }
    const current = await db.query.rps.findFirst({
      where: eq(rps.id, id),
      with: {
        dosirMk: true,
        cpmks: { with: { cplMappings: true, subCpmks: true } },
        pertemuans: { with: { subCpmkMappings: true } },
        komponens: { with: { cpmkMappings: true, subCpmkMappings: true } },
        referensis: true,
      },
    })
    if (!current) return { success: false, error: "RPS tidak ditemukan" }

    if (session.user.role === "DOSEN" && current.dosirMk.dosen_id !== session.user.id) {
      return { success: false, error: "Anda tidak ditugaskan pada mata kuliah ini" }
    }
    if (session.user.role === "DOSEN") {
      const maySubmit = ["DRAFT", "REVISION_REQUIRED"].includes(current.status) && status === "SUBMITTED"
      const mayWithdraw = current.status === "SUBMITTED" && status === "DRAFT"
      if (!maySubmit && !mayWithdraw) {
        return { success: false, error: "Perubahan status RPS tidak diizinkan" }
      }
    }

    if (status === "SUBMITTED" || status === "APPROVED") {
      const readiness = calculateRpsReadiness(current)
      if (readiness.issues.length > 0) {
        return { success: false, error: readiness.issues[0] }
      }
    }

    const actorId = await resolveActorId()

    await db.update(rps).set({
      status,
      catatan_reviewer: catatan || null,
      submitted_at: status === "SUBMITTED" ? new Date() : current.submitted_at,
      approved_at: status === "APPROVED" ? new Date() : current.approved_at,
      approved_by: status === "APPROVED" ? actorId : current.approved_by,
      updated_at: new Date(),
    }).where(eq(rps.id, id))

    await db.insert(rpsStatusLog).values({
      rps_id: id,
      status_from: current.status,
      status_to: status,
      changed_by: actorId,
      catatan: catatan || null,
    })

    const fullRps = await db.query.rps.findFirst({
      where: eq(rps.id, id),
      with: { dosirMk: { with: { mk: true } } },
    })
    if (!fullRps) return

      if (status === "SUBMITTED") {
        const reviewers = await db.query.users.findMany({
          where: inArray(users.role, ["KAPRODI", "SUPER_ADMIN"]),
        })
        for (const reviewer of reviewers) {
          await createNotification({
            user_id: reviewer.id,
            message: `RPS ${fullRps.dosirMk.mk.nama_id} menunggu persetujuan.`,
            link: `/rps/${fullRps.dosir_mk_id}`,
          })
        }
      } else if (status === "APPROVED" || status === "REVISION_REQUIRED") {
        await createNotification({
          user_id: fullRps.dosirMk.dosen_id,
          message: status === "APPROVED"
            ? `RPS ${fullRps.dosirMk.mk.nama_id} telah disetujui.`
            : `RPS ${fullRps.dosirMk.mk.nama_id} memerlukan revisi: ${catatan ?? ""}`,
          link: `/rps/${fullRps.dosir_mk_id}`,
        })
      }

    revalidatePath("/dashboard")
    revalidatePath("/rps")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Gagal mengubah status RPS" }
  }
}

export async function saveRpsFormalities(rpsId: string, data: RpsFormalitiesInput) {
  try {
    await assertCanEditRps(rpsId)
    await db.update(rps).set({
      deskripsi_mk: data.deskripsi_mk?.trim() || null,
      metode_pembelajaran: data.metode_pembelajaran?.trim() || null,
      persyaratan_kehadiran: data.persyaratan_kehadiran?.trim() || null,
      status_revisi: data.status_revisi?.trim() || "R-1",
      tanggal_penyusunan: data.tanggal_penyusunan || null,
      nama_penyetuju: data.nama_penyetuju?.trim() || null,
      jabatan_penyetuju: data.jabatan_penyetuju?.trim() || "Ketua Program Studi",
      tanggal_pengesahan: data.tanggal_pengesahan || null,
      updated_at: new Date(),
    }).where(eq(rps.id, rpsId))
    revalidatePath(`/rps`)
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Gagal menyimpan kelengkapan dokumen RPS" }
  }
}

export async function saveMeetings(rpsId: string, data: MeetingInput[]) {
  try {
    await assertCanEditRps(rpsId)
    for (const item of data) {
      const cleanMateri = item.materi?.trim() ? item.materi.trim() : `Minggu ${item.minggu_ke}`
      const cleanMetode = item.metode?.trim() || null
      const cleanMedia = item.media?.trim() || null
      const cleanEstimasi = item.estimasi_waktu?.trim() || null
      const cleanIndikator = item.indikator?.trim() || null
      const cleanBentuk = item.bentuk_pembelajaran?.trim() || null
      const cleanAktDosen = item.aktivitas_dosen?.trim() || null
      const cleanAktMhs = item.aktivitas_mahasiswa?.trim() || null
      const cleanKriteria = item.kriteria_penilaian?.trim() || null
      const cleanReferensi = item.referensi?.trim() || null

      const [meeting] = await db.insert(rpsPertemuan).values({
        id: createId(),
        rps_id: rpsId,
        minggu_ke: item.minggu_ke,
        materi: cleanMateri,
        metode: cleanMetode,
        media: cleanMedia,
        estimasi_waktu: cleanEstimasi,
        indikator: cleanIndikator,
        bentuk_pembelajaran: cleanBentuk,
        aktivitas_dosen: cleanAktDosen,
        aktivitas_mahasiswa: cleanAktMhs,
        kriteria_penilaian: cleanKriteria,
        referensi: cleanReferensi,
      }).onConflictDoUpdate({
        target: [rpsPertemuan.rps_id, rpsPertemuan.minggu_ke],
        set: {
          materi: cleanMateri,
          metode: cleanMetode,
          media: cleanMedia,
          estimasi_waktu: cleanEstimasi,
          indikator: cleanIndikator,
          bentuk_pembelajaran: cleanBentuk,
          aktivitas_dosen: cleanAktDosen,
          aktivitas_mahasiswa: cleanAktMhs,
          kriteria_penilaian: cleanKriteria,
          referensi: cleanReferensi,
        },
      }).returning()

      await db.delete(pertemuanSubCpmk).where(eq(pertemuanSubCpmk.pertemuan_id, meeting.id))
      if (item.sub_cpmk_ids && item.sub_cpmk_ids.length > 0) {
        const validSubCpmks = await db.query.subCpmk.findMany({
          where: inArray(subCpmk.id, item.sub_cpmk_ids),
          columns: { id: true },
        })
        const validIds = new Set(validSubCpmks.map((s) => s.id))
        const validToInsert = item.sub_cpmk_ids.filter((id) => validIds.has(id))

        if (validToInsert.length > 0) {
          await db.insert(pertemuanSubCpmk).values(
            validToInsert.map((subCpmkId) => ({
              id: createId(),
              pertemuan_id: meeting.id,
              sub_cpmk_id: subCpmkId,
            })),
          )
        }
      }
    }
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error: any) {
    console.error("Error saveMeetings:", error)
    return { success: false, error: error?.message || "Gagal menyimpan rencana pertemuan" }
  }
}

export async function saveRpsProgress(rpsId: string) {
  try {
    await assertCanEditRps(rpsId)

    const [saved] = await db
      .update(rps)
      .set({ updated_at: new Date() })
      .where(eq(rps.id, rpsId))
      .returning({
        savedAt: rps.updated_at,
        dosirMkId: rps.dosir_mk_id,
      })

    if (!saved) return { success: false, error: "RPS tidak ditemukan" }

    revalidatePath(`/rps/${saved.dosirMkId}`)
    return { success: true, savedAt: saved.savedAt.toISOString() }
  } catch (error) {
    console.error(error)
    return { success: false, error: error instanceof Error ? error.message : "Gagal menyimpan progres RPS" }
  }
}

export async function saveCpmks(rpsId: string, data: CpmkInput[]) {
  try {
    await assertCanEditRps(rpsId)
    
      for (const item of data) {
        const [saved] = await db.insert(cpmk).values({
          rps_id: rpsId,
          kode: item.kode,
          deskripsi: item.deskripsi,
          metode_pencapaian: item.metode_pencapaian || null,
          urutan: item.urutan,
        }).onConflictDoUpdate({
          target: [cpmk.rps_id, cpmk.kode],
          set: { deskripsi: item.deskripsi, metode_pencapaian: item.metode_pencapaian || null, urutan: item.urutan },
        }).returning()

        await db.delete(cpmkCpl).where(eq(cpmkCpl.cpmk_id, saved.id))
        if (item.cpl_id) {
          await db.insert(cpmkCpl).values({ cpmk_id: saved.id, cpl_id: item.cpl_id })
        }

        for (const sub of item.subCpmks ?? []) {
          await db.insert(subCpmk).values({
            cpmk_id: saved.id,
            kode: sub.kode,
            deskripsi: sub.deskripsi,
            level_bloom: sub.level_bloom ?? "C3",
            urutan: sub.urutan,
          }).onConflictDoUpdate({
            target: [subCpmk.cpmk_id, subCpmk.kode],
            set: {
              deskripsi: sub.deskripsi,
              level_bloom: sub.level_bloom ?? "C3",
              urutan: sub.urutan,
            },
          })
        }
      }
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Gagal menyimpan CPMK" }
  }
}

export async function deleteCpmk(id: string) {
  try {
    const target = await db.query.cpmk.findFirst({ where: eq(cpmk.id, id) })
    if (!target) return { success: false, error: "CPMK tidak ditemukan" }
    await assertCanEditRps(target.rps_id)
    await db.delete(cpmk).where(eq(cpmk.id, id))
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Gagal menghapus CPMK" }
  }
}

export async function deleteSubCpmk(id: string) {
  try {
    const target = await db.query.subCpmk.findFirst({
      where: eq(subCpmk.id, id),
      with: { cpmk: true },
    })
    if (!target) return { success: false, error: "Sub-CPMK tidak ditemukan" }
    await assertCanEditRps(target.cpmk.rps_id)
    await db.delete(subCpmk).where(eq(subCpmk.id, id))
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Gagal menghapus Sub-CPMK" }
  }
}

export async function saveKomponens(rpsId: string, data: KomponenInput[]) {
  try {
    await assertCanEditRps(rpsId)
    
      for (const item of data) {
        let componentId = item.id
        const values = {
          rps_id: rpsId,
          nama: item.nama,
          tipe: item.tipe || "TUGAS",
          bobot: Number(item.bobot) || 0,
          deskripsi: item.deskripsi || null,
          instruksi: item.instruksi || null,
          bentuk: item.bentuk || null,
          luaran: item.luaran || null,
          kriteria_penilaian: item.kriteria_penilaian || null,
          minggu_pemberian: item.minggu_pemberian || null,
          minggu_pengumpulan: item.minggu_pengumpulan || null,
          is_kelompok: Boolean(item.is_kelompok),
          referensi_tugas: item.referensi_tugas || null,
          lain_lain: item.lain_lain || null,
          urutan: item.urutan,
          updated_at: new Date(),
        }

        if (!componentId) {
          const existing = await db.query.komponenPenilaian.findFirst({
            where: and(
              eq(komponenPenilaian.rps_id, rpsId),
              eq(komponenPenilaian.urutan, item.urutan),
            ),
          })
          componentId = existing?.id
        }

        if (componentId) {
          await db.update(komponenPenilaian).set(values).where(eq(komponenPenilaian.id, componentId))
        } else {
          const [created] = await db.insert(komponenPenilaian).values(values).returning()
          componentId = created.id
        }

        await db.delete(komponenCpmk).where(eq(komponenCpmk.komponen_id, componentId))
        if (item.cpmk_ids?.length) {
          await db.insert(komponenCpmk).values(
            item.cpmk_ids.map((cpmkId) => ({ komponen_id: componentId!, cpmk_id: cpmkId })),
          )
        }

        await db.delete(komponenSubCpmk).where(eq(komponenSubCpmk.komponen_id, componentId))
        if (item.sub_cpmk_ids?.length) {
          await db.insert(komponenSubCpmk).values(
            item.sub_cpmk_ids.map((subCpmkId) => ({ komponen_id: componentId!, sub_cpmk_id: subCpmkId })),
          )
        }

        await db.delete(rubrikKriteria).where(eq(rubrikKriteria.komponen_id, componentId))
        if (item.rubrik_kriterias?.length) {
          await db.insert(rubrikKriteria).values(
            item.rubrik_kriterias.map((rubrik, index) => ({
              komponen_id: componentId!,
              kriteria: rubrik.kriteria,
              bobot: Number(rubrik.bobot) || 0,
              sangat_baik: rubrik.sangat_baik || null,
              baik: rubrik.baik || null,
              cukup: rubrik.cukup || null,
              kurang: rubrik.kurang || null,
              sangat_kurang: rubrik.sangat_kurang || null,
              urutan: rubrik.urutan || index + 1,
            })),
          )
        }
      }
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Gagal menyimpan komponen penilaian" }
  }
}

export async function deleteKomponen(id: string) {
  try {
    const target = await db.query.komponenPenilaian.findFirst({
      where: eq(komponenPenilaian.id, id),
    })
    if (!target) return { success: false, error: "Komponen penilaian tidak ditemukan" }
    await assertCanEditRps(target.rps_id)
    await db.delete(komponenPenilaian).where(eq(komponenPenilaian.id, id))
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Gagal menghapus komponen penilaian" }
  }
}

export async function saveReferences(rpsId: string, data: Array<{ jenis: string; teks: string }>) {
  try {
    await assertCanEditRps(rpsId)
    
      await db.delete(rpsReferensi).where(eq(rpsReferensi.rps_id, rpsId))
      if (data.length > 0) {
        await db.insert(rpsReferensi).values(data.map((item, index) => ({
          rps_id: rpsId,
          jenis: item.jenis,
          teks: item.teks,
          urutan: index + 1,
        })))
      }
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Gagal menyimpan referensi" }
  }
}
