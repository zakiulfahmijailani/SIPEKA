"use server"

import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { getCurrentSession } from "@/lib/current-session"
import bcrypt from "bcryptjs"

const userSchema = z.object({
  id: z.string().optional(),
  email: z.string().email("Email tidak valid"),
  nama_lengkap: z.string().min(1, "Nama lengkap wajib diisi"),
  nidn: z.string().optional(),
  role: z.enum(["SUPER_ADMIN", "KAPRODI", "DOSEN", "VIEWER"]),
  password: z.string().min(8, "Password minimal 8 karakter").optional(),
  is_active: z.boolean().default(true),
})

export async function saveUser(formData: z.infer<typeof userSchema>) {
  try {
    const session = await getCurrentSession()
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    const parsed = userSchema.safeParse(formData)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }

    const data = parsed.data
    const dbData = {
      email: data.email,
      nama_lengkap: data.nama_lengkap,
      nidn: data.nidn || null,
      role: data.role,
      is_active: data.is_active,
      updated_at: new Date(),
    }

    if (data.id) {
      // Update
      await db.update(users).set(dbData).where(eq(users.id, data.id))
    } else {
      // Create
      if (!data.password) {
        return { success: false, error: "Password wajib diisi untuk user baru" }
      }
      await db.insert(users).values({
        ...dbData,
        password: await bcrypt.hash(data.password, 12),
      })
    }

    revalidatePath("/master/users")
    return { success: true }
  } catch (error: unknown) {
    console.error("Error saving user:", error)
    if (typeof error === "object" && error !== null && "code" in error && error.code === "23505") {
      return { success: false, error: "Email sudah digunakan" }
    }
    return { success: false, error: "Terjadi kesalahan sistem" }
  }
}

export async function toggleUserActive(id: string, currentStatus: boolean) {
  try {
    const session = await getCurrentSession()
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    const newStatus = !currentStatus
    await db.update(users).set({ is_active: newStatus }).where(eq(users.id, id))

    revalidatePath("/master/users")
    return { success: true }
  } catch (error) {
    console.error("Error toggling user status:", error)
    return { success: false, error: "Gagal mengubah status user" }
  }
}

export async function resetUserPassword(id: string, password: string) {
  try {
    const session = await getCurrentSession()
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    if (password.length < 8) {
      return { success: false, error: "Password minimal 8 karakter" }
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    await db.update(users).set({ password: hashedPassword }).where(eq(users.id, id))

    return { success: true }
  } catch (error) {
    console.error("Error resetting password:", error)
    return { success: false, error: "Gagal reset password" }
  }
}
