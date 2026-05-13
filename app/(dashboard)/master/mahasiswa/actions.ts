"use server"

import { db } from "@/db"
import { mahasiswa } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { auth } from "@/lib/auth"

const mahasiswaSchema = z.object({
  id: z.string().optional(),
  nim: z.string().min(1, "NIM wajib diisi"),
  nama_lengkap: z.string().min(1, "Nama lengkap wajib diisi"),
  angkatan: z.coerce.number().min(2000, "Angkatan tidak valid"),
  track: z.enum(["UMUM", "BIS", "DSA"]),
  status: z.enum(["AKTIF", "CUTI", "LULUS", "DO"]),
  email: z.string().email("Email tidak valid").optional().or(z.literal("")),
})

export async function saveMahasiswa(formData: z.infer<typeof mahasiswaSchema>) {
  try {
    const session = await auth()
    if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "KAPRODI")) {
      return { success: false, error: "Unauthorized" }
    }

    const parsed = mahasiswaSchema.safeParse(formData)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }

    const data = parsed.data
    const dbData = {
      nim: data.nim,
      nama_lengkap: data.nama_lengkap,
      angkatan: data.angkatan,
      track: data.track,
      status: data.status,
      email: data.email || null,
      updated_at: new Date(),
    }

    if (data.id) {
      await db.update(mahasiswa).set(dbData).where(eq(mahasiswa.id, data.id))
    } else {
      await db.insert(mahasiswa).values(dbData)
    }

    revalidatePath("/master/mahasiswa")
    return { success: true }
  } catch (error: any) {
    console.error("Error saving mahasiswa:", error)
    if (error.code === "23505") {
      return { success: false, error: "NIM sudah digunakan" }
    }
    return { success: false, error: "Terjadi kesalahan sistem" }
  }
}

export async function deleteMahasiswa(id: string) {
  try {
    const session = await auth()
    if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "KAPRODI")) {
      return { success: false, error: "Unauthorized" }
    }

    await db.delete(mahasiswa).where(eq(mahasiswa.id, id))
    
    revalidatePath("/master/mahasiswa")
    return { success: true }
  } catch (error) {
    console.error("Error deleting mahasiswa:", error)
    return { success: false, error: "Gagal menghapus mahasiswa (mungkin data sudah digunakan di nilai/enrollment)" }
  }
}

export async function bulkImportMahasiswa(data: any[]) {
  try {
    const session = await auth()
    if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "KAPRODI")) {
      return { success: false, error: "Unauthorized" }
    }

    // Basic validation and formatting
    const toInsert = data.map(item => ({
      nim: String(item.nim),
      nama_lengkap: String(item.nama_lengkap),
      angkatan: parseInt(item.angkatan),
      status: (item.status || "AKTIF").toUpperCase() as any,
      track: (item.track || "UMUM").toUpperCase() as any,
      email: item.email || null,
    }))

    // We use a transaction or just bulk insert. Neon/Postgres supports values([...])
    await db.insert(mahasiswa).values(toInsert).onConflictDoUpdate({
      target: mahasiswa.nim,
      set: {
        nama_lengkap: sql`excluded.nama_lengkap`,
        angkatan: sql`excluded.angkatan`,
        status: sql`excluded.status`,
        track: sql`excluded.track`,
        email: sql`excluded.email`,
        updated_at: new Date(),
      }
    })

    revalidatePath("/master/mahasiswa")
    return { success: true, count: toInsert.length }
  } catch (error) {
    console.error("Error bulk importing mahasiswa:", error)
    return { success: false, error: "Gagal import data. Pastikan format kolom sesuai: nim, nama_lengkap, angkatan, status, track" }
  }
}

import { sql } from "drizzle-orm"
