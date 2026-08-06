import { redirect } from "next/navigation"
import { and, asc, eq } from "drizzle-orm"

import { db } from "@/db"
import { dosirMk, tahunAkademik } from "@/db/schema"
import { getCurrentSession } from "@/lib/current-session"

import { RpsClientPage } from "./rps-client-page"

export const dynamic = "force-dynamic"

export default async function RpsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>
}) {
  const session = await getCurrentSession()
  if (!session?.user) redirect("/login")

  const filters = await searchParams
  const activeTa = await db.query.tahunAkademik.findFirst({
    where: eq(tahunAkademik.is_active, true),
  })

  const assignments = await db.query.dosirMk.findMany({
    where: and(
      session.user.role === "DOSEN" ? eq(dosirMk.dosen_id, session.user.id) : undefined,
      activeTa ? eq(dosirMk.tahun_akademik_id, activeTa.id) : undefined,
    ),
    with: {
      mk: true,
      dosen: true,
      tahunAkademik: true,
      rps: true,
    },
    orderBy: [asc(dosirMk.kelas)],
  })

  const query = filters.q?.trim().toLowerCase()
  const status = filters.status && filters.status !== "ALL" ? filters.status : null
  const dosirs = assignments
    .map((assignment) => ({
      ...assignment,
      rps: [...assignment.rps].sort((a, b) => b.version - a.version),
    }))
    .filter((assignment) => {
      const matchesQuery = !query || `${assignment.mk.kode} ${assignment.mk.nama_id}`.toLowerCase().includes(query)
      const latestStatus = assignment.rps[0]?.status || "DRAFT"
      return matchesQuery && (!status || latestStatus === status)
    })

  return <RpsClientPage dosirs={dosirs} />
}
