import { redirect } from "next/navigation"

import { SUPER_ADMIN_EMAIL } from "@/lib/constants"
import { getCurrentSession } from "@/lib/current-session"

export default async function SuperAdminContinuePage() {
  const session = await getCurrentSession()
  const email = session?.user?.email?.trim().toLowerCase()

  if (!session?.user) redirect("/super-admin/login")
  if (session.user.role !== "SUPER_ADMIN" || email !== SUPER_ADMIN_EMAIL) {
    redirect("/super-admin/login")
  }

  redirect("/dashboard")
}
