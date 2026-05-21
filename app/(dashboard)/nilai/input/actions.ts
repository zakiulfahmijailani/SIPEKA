"use server"

import { db } from "@/db"
import { nilai, enrollment, dosirMk } from "@/db/schema"
import { eq, and, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { MOCK_SESSION } from "@/lib/mock-session"

export async function saveGrades(dosirId: string, gradeData: { enrollmentId: string, komponenId: string, value: number }[]) {
  try {
    const session = MOCK_SESSION
    if (!session?.user) return { success: false, error: "Unauthorized" }

    // Check if Dosen is authorized for this dosir
    if (session.user.role === "DOSEN") {
      const dosir = await db.query.dosirMk.findFirst({
        where: and(eq(dosirMk.id, dosirId), eq(dosirMk.dosen_id, session.user.id))
      })
      if (!dosir) return { success: false, error: "Anda tidak memiliki akses ke kelas ini" }
    } else if (session.user.role !== "SUPER_ADMIN" && session.user.role !== "KAPRODI") {
      return { success: false, error: "Unauthorized" }
    }

    // Bulk upsert using transaction
    await db.transaction(async (tx) => {
      for (const item of gradeData) {
        await tx.insert(nilai).values({
          enrollment_id: item.enrollmentId,
          komponen_id: item.komponenId,
          nilai: String(item.value),
        }).onConflictDoUpdate({
          target: [nilai.enrollment_id, nilai.komponen_id],
          set: {
            nilai: String(item.value),
            updated_at: new Date(),
          }
        })
      }
    })

    revalidatePath("/nilai/input")
    return { success: true }
  } catch (error) {
    console.error("Error saving grades:", error)
    return { success: false, error: "Gagal menyimpan nilai" }
  }
}
