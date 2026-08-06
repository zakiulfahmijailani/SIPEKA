"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"

import { db } from "@/db"
import { auditLog, users } from "@/db/schema"
import { auth } from "@/lib/auth"
import { IMPERSONATION_COOKIE } from "@/lib/current-session"

type ImpersonationResult = {
  success: boolean
  error?: string
}

export async function startDosenImpersonation(targetUserId: string): Promise<ImpersonationResult> {
  const administrator = await auth()
  if (!administrator?.user || administrator.user.role !== "SUPER_ADMIN") {
    return { success: false, error: "Hanya Super Admin yang dapat masuk sebagai dosen." }
  }

  const target = await db.query.users.findFirst({
    where: eq(users.id, targetUserId),
    columns: {
      id: true,
      email: true,
      nama_lengkap: true,
      role: true,
      is_active: true,
    },
  })

  if (!target || target.role !== "DOSEN") {
    return { success: false, error: "Akun dosen tidak ditemukan." }
  }
  if (!target.is_active) {
    return { success: false, error: "Akun dosen sedang nonaktif." }
  }

  await db.insert(auditLog).values({
    entity_type: "SESSION_IMPERSONATION",
    entity_id: target.id,
    action: "STATUS_CHANGE",
    changed_by: administrator.user.id,
    old_values: {
      mode: "SUPER_ADMIN",
      user_id: administrator.user.id,
    },
    new_values: {
      mode: "DOSEN",
      user_id: target.id,
      email: target.email,
    },
  })

  const cookieStore = await cookies()
  cookieStore.set(IMPERSONATION_COOKIE, target.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 4,
    priority: "high",
  })

  revalidatePath("/", "layout")
  return { success: true }
}

export async function stopDosenImpersonation(): Promise<ImpersonationResult> {
  const administrator = await auth()
  const cookieStore = await cookies()
  const targetUserId = cookieStore.get(IMPERSONATION_COOKIE)?.value
  cookieStore.delete(IMPERSONATION_COOKIE)

  if (administrator?.user?.role === "SUPER_ADMIN" && targetUserId) {
    try {
      await db.insert(auditLog).values({
        entity_type: "SESSION_IMPERSONATION",
        entity_id: targetUserId,
        action: "STATUS_CHANGE",
        changed_by: administrator.user.id,
        old_values: { mode: "DOSEN", user_id: targetUserId },
        new_values: { mode: "SUPER_ADMIN", user_id: administrator.user.id },
      })
    } catch (error) {
      console.error("Gagal mencatat akhir impersonasi:", error)
    }
  }

  revalidatePath("/", "layout")
  return { success: true }
}
