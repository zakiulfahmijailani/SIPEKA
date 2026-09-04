import { redirect } from "next/navigation"
import { and, asc, eq } from "drizzle-orm"

import { db } from "@/db"
import { dosirMk, tahunAkademik } from "@/db/schema"
import { getCurrentSession } from "@/lib/current-session"
import { getAcademicTermContext } from "@/lib/academic-term"

import { RpsClientPage } from "./rps-client-page"

export const dynamic = "force-dynamic"

export default async function RpsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; tahun?: string; semester?: string }>
}) {
  const session = await getCurrentSession()
  if (!session?.user) redirect("/login")

  const filters = await searchParams
  const period = await getAcademicTermContext(filters)

  const assignments = await db.query.dosirMk.findMany({
    where: and(
      eq(dosirMk.is_active, true),
      session.user.role === "DOSEN" ? eq(dosirMk.dosen_id, session.user.id) : undefined,
      period.term ? eq(dosirMk.tahun_akademik_id, period.term.id) : undefined,
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

  const STATUS_PRIORITY: Record<string, number> = {
    APPROVED: 4, SUBMITTED: 3, REVISION_REQUIRED: 2, DRAFT: 1,
  }

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
    // Deduplikasi: dalam satu profil dosen, 1 MK hanya tampil 1 kali.
    // Prioritaskan dosir yang statusnya paling maju; jika sama, ambil kelas pertama (abjad).
    .reduce<typeof assignments>((acc, curr) => {
      const existing = acc.find((d) => d.mk_id === curr.mk_id)
      if (!existing) {
        acc.push(curr)
      } else {
        const existingPriority = STATUS_PRIORITY[existing.rps[0]?.status ?? "DRAFT"] ?? 0
        const currPriority = STATUS_PRIORITY[curr.rps[0]?.status ?? "DRAFT"] ?? 0
        if (currPriority > existingPriority) {
          acc[acc.indexOf(existing)] = curr
        }
      }
      return acc
    }, [])

  const canBackfill = Boolean(session?.user?.role && ["SUPER_ADMIN", "KAPRODI"].includes(session.user.role))

  return <RpsClientPage dosirs={dosirs} academicTerm={period.label} canBackfill={canBackfill} />
}
