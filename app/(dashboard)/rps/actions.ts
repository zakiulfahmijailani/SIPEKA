"use server"

import { db } from "@/db"
import { 
  rps, cpmk, cpmkCpl, subCpmk, 
  komponenPenilaian, komponenCpmk, 
  rpsPertemuan, rpsReferensi,
  rpsStatusLog, dosirMk
} from "@/db/schema"
import { eq, and, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { MOCK_SESSION } from "@/lib/mock-session"
import { createNotification } from "@/lib/notifications"
import { users } from "@/db/schema"
import { inArray } from "drizzle-orm"

// --- RPS Core Actions ---

export async function createOrGetRps(dosirMkId: string) {
  try {
    const session = MOCK_SESSION
    if (!session?.user) return { success: false, error: "Unauthorized" }

    let existing = await db.query.rps.findFirst({
      where: eq(rps.dosir_mk_id, dosirMkId),
      orderBy: (rps, { desc }) => [desc(rps.version)]
    })

    if (!existing) {
      const [newRps] = await db.insert(rps).values({
        dosir_mk_id: dosirMkId,
        status: "DRAFT",
        version: 1,
      }).returning()
      existing = newRps
    }

    return { success: true, data: existing }
  } catch (error) {
    return { success: false, error: "Gagal memuat RPS" }
  }
}

export async function updateRpsStatus(id: string, status: any, catatan?: string) {
  try {
    const session = MOCK_SESSION
    if (!session?.user) return { success: false, error: "Unauthorized" }

    const [current] = await db.select().from(rps).where(eq(rps.id, id))
    
    await db.transaction(async (tx) => {
      await tx.update(rps).set({
        status,
        catatan_reviewer: catatan || null,
        submitted_at: status === "SUBMITTED" ? new Date() : current.submitted_at,
        approved_at: status === "APPROVED" ? new Date() : current.approved_at,
        approved_by: status === "APPROVED" ? session.user.id : current.approved_by,
        updated_at: new Date(),
      }).where(eq(rps.id, id))

      await tx.insert(rpsStatusLog).values({
        rps_id: id,
        status_from: current.status,
        status_to: status,
        changed_by: session.user.id,
        catatan: catatan || null,
      })

      // Send Notifications
      const fullRps = await tx.query.rps.findFirst({
        where: eq(rps.id, id),
        with: { dosirMk: { with: { mk: true } } }
      })

      if (status === "SUBMITTED") {
        // Notify Kaprodi & Super Admin
        const reviewers = await tx.query.users.findMany({
          where: inArray(users.role, ["KAPRODI", "SUPER_ADMIN"])
        })
        for (const reviewer of reviewers) {
          await createNotification({
            user_id: reviewer.id,
            message: `RPS ${fullRps?.dosirMk.mk.nama_id} menunggu approval.`,
            link: `/rps/${fullRps?.dosir_mk_id}`
          })
        }
      } else if (status === "APPROVED" || status === "REVISION_REQUIRED") {
        // Notify Dosen
        await createNotification({
          user_id: fullRps!.dosirMk.dosen_id,
          message: status === "APPROVED" 
            ? `RPS ${fullRps?.dosirMk.mk.nama_id} telah disetujui.` 
            : `RPS ${fullRps?.dosirMk.mk.nama_id} memerlukan revisi: ${catatan}`,
          link: `/rps/${fullRps?.dosir_mk_id}`
        })
      }
    })

    revalidatePath("/rps")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Gagal merubah status RPS" }
  }
}

// --- Section 3: CPMK Actions ---

export async function saveCpmks(rpsId: string, data: any[]) {
  try {
    await db.transaction(async (tx) => {
      // For simplicity in auto-save, we'll clear and re-insert or use upsert
      // But clearing might break foreign keys if children exist. 
      // Better to upsert individual ones or handle carefully.
      // For this implementation, we'll use a more robust approach:
      
      for (const item of data) {
        const cpmkId = item.id || undefined
        const dbData = {
          rps_id: rpsId,
          kode: item.kode,
          deskripsi: item.deskripsi,
          urutan: item.urutan,
        }

        let id: string
        if (cpmkId) {
          await tx.update(cpmk).set(dbData).where(eq(cpmk.id, cpmkId))
          id = cpmkId
        } else {
          const [inserted] = await tx.insert(cpmk).values(dbData).returning()
          id = inserted.id
        }

        // Handle CPL mapping (one CPL per CPMK as per user request)
        await tx.delete(cpmkCpl).where(eq(cpmkCpl.cpmk_id, id))
        if (item.cpl_id) {
          await tx.insert(cpmkCpl).values({
            cpmk_id: id,
            cpl_id: item.cpl_id
          })
        }
      }
    })
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Gagal menyimpan CPMK" }
  }
}

export async function deleteCpmk(id: string) {
  try {
    await db.delete(cpmk).where(eq(cpmk.id, id))
    return { success: true }
  } catch (error) {
    return { success: false, error: "Gagal menghapus CPMK" }
  }
}

// --- Section 4: Assessment Actions ---

export async function saveKomponens(rpsId: string, data: any[]) {
  try {
    await db.transaction(async (tx) => {
      for (const item of data) {
        const compId = item.id || undefined
        const dbData = {
          rps_id: rpsId,
          nama: item.nama,
          tipe: item.tipe || "TUGAS",
          bobot: item.bobot,
          urutan: item.urutan,
        }

        let id: string
        if (compId) {
          await tx.update(komponenPenilaian).set(dbData).where(eq(komponenPenilaian.id, compId))
          id = compId
        } else {
          const [inserted] = await tx.insert(komponenPenilaian).values(dbData).returning()
          id = inserted.id
        }

        // Handle CPMK mapping (multi-select)
        await tx.delete(komponenCpmk).where(eq(komponenCpmk.komponen_id, id))
        if (item.cpmk_ids && item.cpmk_ids.length > 0) {
          await tx.insert(komponenCpmk).values(
            item.cpmk_ids.map((cid: string) => ({ komponen_id: id, cpmk_id: cid }))
          )
        }
      }
    })
    return { success: true }
  } catch (error) {
    return { success: false, error: "Gagal menyimpan komponen penilaian" }
  }
}

// --- Section 5: Meetings Actions ---

export async function saveMeetings(rpsId: string, data: any[]) {
  try {
    await db.transaction(async (tx) => {
      for (const item of data) {
        await tx.insert(rpsPertemuan).values({
          rps_id: rpsId,
          minggu_ke: item.minggu_ke,
          materi: item.materi,
          metode: item.metode,
          media: item.media,
          estimasi_waktu: item.estimasi_waktu,
        }).onConflictDoUpdate({
          target: [rpsPertemuan.rps_id, rpsPertemuan.minggu_ke],
          set: {
            materi: item.materi,
            metode: item.metode,
            media: item.media,
            estimasi_waktu: item.estimasi_waktu,
          }
        })
      }
    })
    return { success: true }
  } catch (error) {
    return { success: false, error: "Gagal menyimpan rencana pertemuan" }
  }
}

// --- Section 6: References Actions ---

export async function saveReferences(rpsId: string, data: any[]) {
  try {
    await db.transaction(async (tx) => {
      // Clear all and re-insert for simple references
      await tx.delete(rpsReferensi).where(eq(rpsReferensi.rps_id, rpsId))
      if (data.length > 0) {
        await tx.insert(rpsReferensi).values(data.map((r, i) => ({
          rps_id: rpsId,
          jenis: r.jenis,
          teks: r.teks,
          urutan: i + 1
        })))
      }
    })
    return { success: true }
  } catch (error) {
    return { success: false, error: "Gagal menyimpan referensi" }
  }
}
