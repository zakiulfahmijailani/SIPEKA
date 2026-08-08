import { getCurrentSession } from "@/lib/current-session"
import { db } from "@/db"
import { tahunAkademik } from "@/db/schema"
import { desc } from "drizzle-orm"
import { redirect } from "next/navigation"
import { getDashboardStats } from "../dashboard-actions"
import { DashboardClient } from "../dashboard-client"



export const dynamic = "force-dynamic"
export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tahun?: string; semester?: string }>
}) {
  const session = await getCurrentSession()
  if (!session?.user) redirect("/login")

  const filters = await searchParams
  const allTas = await db.query.tahunAkademik.findMany({
    orderBy: [desc(tahunAkademik.tahun_mulai), desc(tahunAkademik.semester)],
  })
  const activeTa = allTas.find((ta) => ta.is_active) ?? allTas[0]
  const selectedTa = allTas.find((ta) => {
    const year = `${ta.tahun_mulai}/${ta.tahun_mulai + 1}`
    return year === filters.tahun && String(ta.semester) === filters.semester
  }) ?? activeTa

  const academicTerms = allTas.map((ta) => ({
    id: ta.id,
    year: `${ta.tahun_mulai}/${ta.tahun_mulai + 1}`,
    semester: ta.semester,
    label: `${ta.tahun_mulai}/${ta.tahun_mulai + 1} · ${ta.semester === 1 ? "Ganjil" : "Genap"}`,
  }))

  const res = await getDashboardStats(session.user.role, session.user.id, selectedTa?.id)

  if (!res.success) {
    return <div className="p-8 text-center text-red-500">{res.error}</div>
  }

  if (session.user.role === "DOSEN") {
    return <DashboardClient stats={res.data} role={session.user.role} academicTerms={academicTerms} />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-blue-900">Dashboard</h1>
        <p className="text-muted-foreground">Selamat datang, {session.user.name}</p>
      </div>

      <DashboardClient stats={res.data} role={session.user.role} academicTerms={academicTerms} />
    </div>
  )
}
