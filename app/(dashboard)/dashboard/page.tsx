import { MOCK_SESSION } from "@/lib/mock-session"
import { getDashboardStats } from "../dashboard-actions"
import { DashboardClient } from "../dashboard-client"



export const dynamic = "force-dynamic"
export default async function DashboardPage() {
  const session = MOCK_SESSION

  const res = await getDashboardStats(session.user.role, session.user.id)

  if (!res.success) {
    return <div className="p-8 text-center text-red-500">{res.error}</div>
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
