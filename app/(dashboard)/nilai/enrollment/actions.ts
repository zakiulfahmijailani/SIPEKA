"use server"

import { db } from "@/db"
import { enrollment, mahasiswa, dosirMk } from "@/db/schema"
import { eq, and, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"

export async function enrollMahasiswa(dosirMkId: string, mahasiswaId: string) {
  try {
    const session = await auth()
    if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "KAPRODI")) {
      return { success: false, error: "Unauthorized" }
    }

    await db.insert(enrollment).values({
      mahasiswa_id: mahasiswaId,
      dosir_mk_id: dosirMkId,
    })

    revalidatePath("/nilai/enrollment")
    return { success: true }
  } catch (error: any) {
    if (error.code === "23505") {
      return { success: false, error: "Mahasiswa sudah terdaftar di kelas ini" }
    }
    return { success: false, error: "Gagal mendaftarkan mahasiswa" }
  }
}

export async function unenrollMahasiswa(id: string) {
  try {
    const session = await auth()
    if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "KAPRODI")) {
      return { success: false, error: "Unauthorized" }
    }

    await db.delete(enrollment).where(eq(enrollment.id, id))

    revalidatePath("/nilai/enrollment")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Gagal membatalkan pendaftaran" }
  }
}

export async function bulkEnrollMahasiswa(dosirMkId: string, nims: string[]) {
  try {
    const session = await auth()
    if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "KAPRODI")) {
      return { success: false, error: "Unauthorized" }
    }

    // Find students by NIM
    const students = await db.query.mahasiswa.findMany({
      where: sql`${mahasiswa.nim} IN ${nims}`
    })

    if (students.length === 0) {
      return { success: false, error: "Tidak ada NIM yang ditemukan di basis data" }
    }

    const toInsert = students.map(s => ({
      mahasiswa_id: s.id,
      dosir_mk_id: dosirMkId,
    }))

    await db.insert(enrollment).values(toInsert).onConflictDoNothing()

    revalidatePath("/nilai/enrollment")
    return { success: true, count: students.length }
  } catch (error) {
    return { success: false, error: "Gagal import enrollment massal" }
  }
}
