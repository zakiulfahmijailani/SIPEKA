import "server-only"

import type { Session } from "next-auth"
import { cookies } from "next/headers"
import { eq } from "drizzle-orm"

import { auth } from "@/lib/auth"
import { MOCK_SESSION } from "@/lib/mock-session"
import { db } from "@/db"
import { users } from "@/db/schema"

export const IMPERSONATION_COOKIE = "sipeka_impersonated_dosen"

export async function getCurrentSession(): Promise<Session | null> {
  const session = await auth()
  if (session?.user) {
    if (session.user.role !== "SUPER_ADMIN") return session

    const targetId = (await cookies()).get(IMPERSONATION_COOKIE)?.value
    if (!targetId) return session

    const target = await db.query.users.findFirst({
      where: eq(users.id, targetId),
      columns: {
        id: true,
        email: true,
        nama_lengkap: true,
        role: true,
        is_active: true,
      },
    })

    if (!target || target.role !== "DOSEN" || !target.is_active) return session

    return {
      ...session,
      user: {
        id: target.id,
        name: target.nama_lengkap,
        email: target.email,
        role: "DOSEN",
      },
      impersonator: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: "SUPER_ADMIN",
      },
    }
  }

  if (process.env.ALLOW_DEMO_MODE === "true") {
    return MOCK_SESSION as Session
  }

  return null
}
