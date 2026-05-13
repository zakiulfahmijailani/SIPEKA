"use server"

import { db } from "@/db"
import { petaKurikulum } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"

export async function togglePetaKurikulum(mk_id: string, cpl_id: string) {
  try {
    const session = await auth()
    if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "KAPRODI")) {
      return { success: false, error: "Unauthorized" }
    }

    // Check if exists
    const existing = await db.query.petaKurikulum.findFirst({
      where: and(
        eq(petaKurikulum.mk_id, mk_id),
        eq(petaKurikulum.cpl_id, cpl_id)
      )
    })

    if (existing) {
      // Delete if exists
      await db.delete(petaKurikulum)
        .where(eq(petaKurikulum.id, existing.id))
    } else {
      // Insert if doesn't exist
      await db.insert(petaKurikulum).values({
        mk_id,
        cpl_id,
        bobot: 1, // Default weight
      })
    }

    revalidatePath("/master/peta-kurikulum")
    return { success: true, isAdded: !existing }
  } catch (error) {
    console.error("Error toggling peta kurikulum:", error)
    return { success: false, error: "Terjadi kesalahan sistem" }
  }
}
