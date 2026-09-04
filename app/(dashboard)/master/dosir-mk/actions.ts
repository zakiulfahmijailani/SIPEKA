"use server"

import { db } from "@/db"
import { dosirMk } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { MOCK_SESSION } from "@/lib/mock-session"

import { initializeRpsForDosir } from "@/app/(dashboard)/rps/actions"

const dosirSchema = z.object({
  id: z.string().optional(),
  mk_id: z.string().min(1, "Mata Kuliah wajib dipilih"),
  dosen_id: z.string().min(1, "Dosen wajib dipilih"),
  tahun_akademik_id: z.string().min(1, "Tahun Akademik wajib dipilih"),
  kelas: z.string().min(1).max(2).toUpperCase(),
  is_active: z.boolean().default(true),
})

export async function saveDosirMk(formData: z.infer<typeof dosirSchema>) {
  try {
    const session = MOCK_SESSION
    if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "KAPRODI")) {
      return { success: false, error: "Unauthorized" }
    }

    const parsed = dosirSchema.safeParse(formData)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }

    const data = parsed.data
    const dbData = {
      mk_id: data.mk_id,
      dosen_id: data.dosen_id,
      tahun_akademik_id: data.tahun_akademik_id,
      kelas: data.kelas,
      is_active: data.is_active,
    }

    if (data.id) {
      await db.update(dosirMk).set(dbData).where(eq(dosirMk.id, data.id))
    } else {
      const [inserted] = await db.insert(dosirMk).values(dbData).returning()
      // Siapkan RPS + template prodi sekaligus saat penugasan dibuat
      if (inserted?.id) {
        await initializeRpsForDosir(inserted.id)
      }
    }

    revalidatePath("/master/dosir-mk")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error: any) {
    console.error("Error saving dosir:", error)
    if (error.code === "23505") {
      return { success: false, error: "Penugasan (MK + Dosen + TA + Kelas) sudah ada" }
    }
    return { success: false, error: "Terjadi kesalahan sistem" }
  }
}

export async function deleteDosirMk(id: string) {
  try {
    const session = MOCK_SESSION
    if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "KAPRODI")) {
      return { success: false, error: "Unauthorized" }
    }

    await db.delete(dosirMk).where(eq(dosirMk.id, id))

    revalidatePath("/master/dosir-mk")
    return { success: true }
  } catch (error) {
    console.error("Error deleting dosir:", error)
    return { success: false, error: "Gagal menghapus penugasan" }
  }
}
