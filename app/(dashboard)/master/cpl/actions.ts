"use server"

import { db } from "@/db"
import { cpl } from "@/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { auth } from "@/lib/auth"

const cplSchema = z.object({
  id: z.string().optional(),
  kode: z.string().min(1, "Kode CPL wajib diisi"),
  slug: z.string().min(1, "Slug wajib diisi"),
  domain: z.enum(["SIKAP", "PENGETAHUAN", "KETERAMPILAN_UMUM", "KETERAMPILAN_KHUSUS"], {
    message: "Domain wajib dipilih",
  }),
  urutan: z.coerce.number().min(1, "Urutan harus > 0"),
  rumusan: z.string().min(20, "Rumusan minimal 20 karakter"),
  is_active: z.boolean().default(true),
})

export async function saveCPL(formData: z.infer<typeof cplSchema>) {
  try {
    const session = await auth()
    if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "KAPRODI")) {
      return { success: false, error: "Unauthorized" }
    }

    const parsed = cplSchema.safeParse(formData)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }

    const data = parsed.data
    const dbData = {
      kode: data.kode,
      slug: data.slug,
      domain: data.domain,
      urutan: data.urutan,
      rumusan: data.rumusan,
      is_active: data.is_active,
      // assuming program_id is required, we can hardcode for now or use a default if it's not strictly checked, wait!
      // In db/schema/kurikulum.ts, program_id is not null? Let's check schema.
    }

    if (data.id) {
      await db.update(cpl)
        .set({ ...dbData, updated_at: new Date() })
        .where(eq(cpl.id, data.id))
    } else {
      await db.insert(cpl).values(dbData)
    }

    revalidatePath("/master/cpl")
    return { success: true }
  } catch (error: any) {
    console.error("Error saving CPL:", error)
    if (error.code === "23505") { // unique violation in Postgres
      return { success: false, error: "Kode CPL sudah digunakan" }
    }
    return { success: false, error: "Terjadi kesalahan sistem" }
  }
}

export async function toggleCPLActive(id: string, currentStatus: boolean) {
  try {
    const session = await auth()
    if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "KAPRODI")) {
      return { success: false, error: "Unauthorized" }
    }

    const newStatus = !currentStatus
    
    await db.update(cpl)
      .set({ is_active: newStatus, updated_at: new Date() })
      .where(eq(cpl.id, id))

    revalidatePath("/master/cpl")
    return { success: true }
  } catch (error) {
    console.error("Error toggling CPL status:", error)
    return { success: false, error: "Gagal mengubah status CPL" }
  }
}
