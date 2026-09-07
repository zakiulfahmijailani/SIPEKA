import "server-only"

import { and, eq } from "drizzle-orm"

import { db } from "@/db"
import { dosirMk } from "@/db/schema"
import { pickCanonicalRpsAssignment } from "@/lib/rps-assignment-canonical"

export async function resolveCanonicalRpsAssignment(dosirMkId: string) {
  const requested = await db.query.dosirMk.findFirst({
    where: eq(dosirMk.id, dosirMkId),
    with: {
      mk: true,
      dosen: true,
      tahunAkademik: true,
      rps: true,
    },
  })
  if (!requested) return null

  const activeAssignments = await db.query.dosirMk.findMany({
    where: and(
      eq(dosirMk.dosen_id, requested.dosen_id),
      eq(dosirMk.tahun_akademik_id, requested.tahun_akademik_id),
      eq(dosirMk.is_active, true),
      eq(dosirMk.mk_id, requested.mk_id),
    ),
    with: {
      mk: true,
      dosen: true,
      tahunAkademik: true,
      rps: true,
    },
  })

  const candidates = activeAssignments.length > 0 ? activeAssignments : [requested]
  const canonical = pickCanonicalRpsAssignment(candidates)!
  const classNames = [...new Set(candidates.map((item) => item.kelas).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "id", { numeric: true }))

  return {
    requested,
    canonical: {
      ...canonical,
      kelas: classNames.join(", "),
    },
    classNames,
  }
}
