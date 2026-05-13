"use server"

import { db } from "@/db"
import { tahunAkademik } from "@/db/schema"
import { eq, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { auth } from "@/lib/auth"

const taSchema = z.object({
  id: z.string().optional(),
  kode: z.string().min(1, "Kode TA wajib diisi"),
  nama: z.string().min(1, "Nama TA wajib diisi"),
  semester: z.coerce.number().min(1).max(2),
  tahun_mulai: z.coerce.number().min(2000),
})

export async function saveTahunAkademik(formData: z.infer<typeof taSchema>) {
  try {
    const session = await auth()
    if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "KAPRODI")) {
      return { success: false, error: "Unauthorized" }
    }

    const parsed = taSchema.safeParse(formData)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }

    const data = parsed.data
    const dbData = {
      kode: data.kode,
      nama: data.nama,
      semester: data.semester,
      tahun_mulai: data.tahun_mulai,
    }

    if (data.id) {
      await db.update(tahunAkademik)
        .set(dbData)
        .where(eq(tahunAkademik.id, data.id))
    } else {
      await db.insert(tahunAkademik).values(dbData)
    }

    revalidatePath("/master/tahun-akademik")
    return { success: true }
  } catch (error: any) {
    console.error("Error saving TA:", error)
    if (error.code === "23505") {
      return { success: false, error: "Kode TA sudah digunakan" }
    }
    return { success: false, error: "Terjadi kesalahan sistem" }
  }
}

export async function setAktifTahunAkademik(id: string) {
  try {
    const session = await auth()
    if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "KAPRODI")) {
      return { success: false, error: "Unauthorized" }
    }

    // Atomic transaction to set all is_active=false, then selected=true
    await db.transaction(async (tx) => {
      await tx.update(tahunAkademik).set({ is_active: "false" })
      await tx.update(tahunAkademik).set({ is_active: "true" }).where(eq(tahunAkademik.id, id))
    })

    revalidatePath("/master/tahun-akademik")
    revalidatePath("/dashboard") // Because dashboard uses active TA
    return { success: true }
  } catch (error) {
    console.error("Error setting active TA:", error)
    return { success: false, error: "Gagal mengaktifkan Tahun Akademik" }
  }
}
