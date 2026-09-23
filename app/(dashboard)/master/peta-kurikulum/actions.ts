"use server"

import { db } from "@/db"
import { petaKurikulum } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { MOCK_SESSION } from "@/lib/mock-session"
import { syncCourseRps } from "@/lib/sync-cpmk-cpl"

export async function togglePetaKurikulum(mk_id: string, cpl_id: string) {
  try {
    const session = MOCK_SESSION
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

    // Auto-sync all RPS associated with this course
    try {
      await syncCourseRps(mk_id)
    } catch (syncErr) {
      console.error("Auto-sync error in togglePetaKurikulum:", syncErr)
    }

    revalidatePath("/master/peta-kurikulum")
    revalidatePath("/rps")
    return { success: true, isAdded: !existing }
  } catch (error) {
    console.error("Error toggling peta kurikulum:", error)
    return { success: false, error: "Terjadi kesalahan sistem" }
  }
}
