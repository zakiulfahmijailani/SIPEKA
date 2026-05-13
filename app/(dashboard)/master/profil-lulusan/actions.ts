"use server"

import { db } from "@/db"
import { profilLulusan } from "@/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { auth } from "@/lib/auth"

const profilLulusanSchema = z.object({
  id: z.string().optional(),
  kode: z.string().min(1, "Kode profil lulusan wajib diisi"),
  nama: z.string().min(3, "Nama profil lulusan minimal 3 karakter"),
  deskripsi: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
})

export async function saveProfilLulusan(formData: z.infer<typeof profilLulusanSchema>) {
  try {
    const session = await auth()
    if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "KAPRODI")) {
      return { success: false, error: "Tidak memiliki akses" }
    }

    const parsed = profilLulusanSchema.safeParse(formData)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }

    const data = parsed.data
    const dbData = {
      kode: data.kode,
      nama: data.nama,
      deskripsi: data.deskripsi ?? null,
      is_active: data.is_active,
    }

    if (data.id) {
      await db.update(profilLulusan)
        .set({ ...dbData, updated_at: new Date() })
        .where(eq(profilLulusan.id, data.id))
    } else {
      await db.insert(profilLulusan).values(dbData)
    }

    revalidatePath("/master/profil-lulusan")
    return { success: true }
  } catch (error: any) {
    console.error("Error saving profil lulusan:", error)
    if (error.code === "23505") {
      return { success: false, error: "Kode profil lulusan sudah digunakan" }
    }
    return { success: false, error: "Terjadi kesalahan sistem" }
  }
}

export async function toggleProfilLulusanActive(id: string, currentStatus: boolean) {
  try {
    const session = await auth()
    if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "KAPRODI")) {
      return { success: false, error: "Tidak memiliki akses" }
    }

    await db.update(profilLulusan)
      .set({ is_active: !currentStatus, updated_at: new Date() })
      .where(eq(profilLulusan.id, id))

    revalidatePath("/master/profil-lulusan")
    return { success: true }
  } catch (error) {
    console.error("Error toggling profil lulusan status:", error)
    return { success: false, error: "Gagal mengubah status profil lulusan" }
  }
}

export async function deleteProfilLulusan(id: string) {
  try {
    const session = await auth()
    if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "KAPRODI")) {
      return { success: false, error: "Tidak memiliki akses" }
    }

    await db.delete(profilLulusan).where(eq(profilLulusan.id, id))

    revalidatePath("/master/profil-lulusan")
    return { success: true }
  } catch (error: any) {
    console.error("Error deleting profil lulusan:", error)
    if (error.code === "23503") {
      return { success: false, error: "Profil lulusan tidak dapat dihapus karena sudah terhubung ke data CPL" }
    }
    return { success: false, error: "Terjadi kesalahan sistem" }
  }
}
