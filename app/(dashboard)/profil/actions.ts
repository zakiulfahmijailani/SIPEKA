"use server"

import { db } from "@/db"
import { users, programSettings } from "@/db/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

export async function updateProfile(data: { nama_lengkap: string; email: string; nidn?: string }) {
  const session = await auth()
  if (!session?.user) return { success: false, error: "Unauthorized" }

  try {
    await db.update(users)
      .set({
        nama_lengkap: data.nama_lengkap,
        email: data.email,
        nidn: data.nidn,
      })
      .where(eq(users.id, session.user.id))

    revalidatePath("/profil")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Gagal memperbarui profil" }
  }
}

export async function changePassword(data: { current: string; new: string }) {
  const session = await auth()
  if (!session?.user) return { success: false, error: "Unauthorized" }

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id)
    })

    if (!user || !user.password) return { success: false, error: "User tidak ditemukan" }

    const isMatch = await bcrypt.compare(data.current, user.password)
    if (!isMatch) return { success: false, error: "Password lama salah" }

    const hashed = await bcrypt.hash(data.new, 12)
    await db.update(users)
      .set({ password: hashed })
      .where(eq(users.id, session.user.id))

    return { success: true }
  } catch (error) {
    return { success: false, error: "Gagal mengganti password" }
  }
}

export async function updateProgramSettings(settings: Record<string, string>) {
  const session = await auth()
  if (session?.user.role !== "SUPER_ADMIN" && session?.user.role !== "KAPRODI") {
    return { success: false, error: "Unauthorized" }
  }

  try {
    const promises = Object.entries(settings).map(([key, value]) => 
      db.insert(programSettings)
        .values({ key, value, updated_at: new Date() })
        .onConflictDoUpdate({ target: programSettings.key, set: { value, updated_at: new Date() } })
    )
    await Promise.all(promises)
    revalidatePath("/pengaturan")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Gagal menyimpan pengaturan" }
  }
}
