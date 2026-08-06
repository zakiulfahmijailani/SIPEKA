import { getCurrentSession } from "@/lib/current-session"
import { redirect } from "next/navigation"
import { getDashboardStats } from "../dashboard-actions"
import { DashboardClient } from "../dashboard-client"



export const dynamic = "force-dynamic"
export default async function DashboardPage() {
  const session = await getCurrentSession()
  if (!session?.user) redirect("/login")

  const res = await getDashboardStats(session.user.role, session.user.id)

  if (!res.success) {
    return <div className="p-8 text-center text-red-500">{res.error}</div>
  }

  if (session.user.role === "DOSEN") {
    return <DashboardClient stats={res.data} role={session.user.role} />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-blue-900">Dashboard</h1>
        <p className="text-muted-foreground">Selamat datang, {session.user.name}</p>
      </div>

      <DashboardClient stats={res.data} role={session.user.role} />
    </div>
  )
}
