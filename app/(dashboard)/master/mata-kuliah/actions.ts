"use server"

import { db } from "@/db"
import { mataKuliah } from "@/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { MOCK_SESSION } from "@/lib/mock-session"

const mkSchema = z.object({
  id: z.string().optional(),
  kode: z.string().min(1, "Kode MK wajib diisi"),
  nama_id: z.string().min(1, "Nama MK wajib diisi"),
  nama_en: z.string().optional(),
  sks_teori: z.coerce.number().min(0).max(6),
  sks_praktik: z.coerce.number().min(0).max(6),
  semester_rekomendasi: z.coerce.number().min(1).max(8),
  status: z.enum(["WAJIB", "PILIHAN"]),
  track: z.enum(["UMUM", "BIS", "DSA"]),
  tipe_aktivitas: z.enum(["TEORI", "PRAKTIKUM", "TEORI_PRAKTIKUM", "SEMINAR", "PROYEK"]),
  deskripsi: z.string().optional(),
})

export async function saveMK(formData: z.infer<typeof mkSchema>) {
  try {
    const session = MOCK_SESSION
    if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "KAPRODI")) {
      return { success: false, error: "Unauthorized" }
    }

    const parsed = mkSchema.safeParse(formData)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }

    const data = parsed.data
    const dbData = {
      kode: data.kode,
      nama_id: data.nama_id,
      nama_en: data.nama_en || null,
      sks_teori: data.sks_teori,
      sks_praktik: data.sks_praktik,
      semester_rekomendasi: data.semester_rekomendasi,
      status: data.status,
      track: data.track,
      tipe_aktivitas: data.tipe_aktivitas,
      deskripsi: data.deskripsi || null,
    }

    if (data.id) {
      await db.update(mataKuliah)
        .set({ ...dbData, updated_at: new Date() })
        .where(eq(mataKuliah.id, data.id))
    } else {
      await db.insert(mataKuliah).values(dbData)
    }

    revalidatePath("/master/mata-kuliah")
    return { success: true }
  } catch (error: any) {
    console.error("Error saving MK:", error)
    if (error.code === "23505") { // unique violation
      return { success: false, error: "Kode Mata Kuliah sudah digunakan" }
    }
    return { success: false, error: "Terjadi kesalahan sistem" }
  }
}
