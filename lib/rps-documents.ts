import { db } from "@/db"
import { dosirMk, rps, tahunAkademik } from "@/db/schema"
import { and, desc, eq } from "drizzle-orm"
import { calculateRpsReadiness } from "@/lib/rps-readiness"
import { collapseRpsAssignments } from "@/lib/rps-assignment-canonical"
import { resolveCanonicalRpsAssignment } from "@/lib/rps-assignment-server"

export async function getRpsDocumentData(dosirId: string) {
  const resolved = await resolveCanonicalRpsAssignment(dosirId)
  if (!resolved) return null
  const dosir = resolved.canonical

  const rpsData = await db.query.rps.findFirst({
    where: eq(rps.dosir_mk_id, dosir.id),
    orderBy: [desc(rps.version)],
    with: {
      cpmks: {
        with: {
          cplMappings: { with: { cpl: true } },
          subCpmks: true,
        },
      },
      komponens: {
        with: {
          cpmkMappings: true,
          subCpmkMappings: { with: { subCpmk: true } },
          rubrikKriterias: true,
        },
      },
      pertemuans: {
        with: {
          subCpmkMappings: { with: { subCpmk: true } },
        },
      },
      referensis: true,
    },
  })

  return { dosir, rps: rpsData }
}

export async function listLecturerDocuments(userId: string, role: string, tahunAkademikId?: string | null) {
  const activeTa = tahunAkademikId
    ? await db.query.tahunAkademik.findFirst({ where: eq(tahunAkademik.id, tahunAkademikId) })
    : await db.query.tahunAkademik.findFirst({ where: eq(tahunAkademik.is_active, true) })

  const assignments = await db.query.dosirMk.findMany({
    where: and(
      eq(dosirMk.is_active, true),
      role === "DOSEN" ? eq(dosirMk.dosen_id, userId) : undefined,
      activeTa ? eq(dosirMk.tahun_akademik_id, activeTa.id) : undefined,
    ),
    with: {
      mk: true,
      dosen: true,
      tahunAkademik: true,
      rps: {
        with: {
          cpmks: { with: { cplMappings: true, subCpmks: true } },
          komponens: { with: { cpmkMappings: true, subCpmkMappings: true } },
          pertemuans: { with: { subCpmkMappings: true } },
          referensis: true,
        },
      },
    },
  })

  return collapseRpsAssignments(assignments).map((assignment) => {
    const latest = [...assignment.rps].sort((a, b) => b.version - a.version)[0] ?? null
    return {
      id: assignment.id,
      kode: assignment.mk.kode,
      nama: assignment.mk.nama_id,
      kelas: assignment.kelas,
      dosen: assignment.dosen.nama_lengkap,
      tahunAkademik: assignment.tahunAkademik.kode,
      status: latest?.status ?? "DRAFT",
      readiness: calculateRpsReadiness(latest),
    }
  })
}
