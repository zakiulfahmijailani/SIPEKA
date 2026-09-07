export type RpsAssignmentHeader = {
  id?: string
  status?: string | null
  version?: number | null
  updated_at?: Date | string | null
}

export type RpsAssignmentLike = {
  id: string
  mk_id: string
  dosen_id: string
  tahun_akademik_id: string
  kelas: string
  mk?: { kode?: string | null } | null
  rps?: RpsAssignmentHeader[] | null
}

const STATUS_PRIORITY: Record<string, number> = {
  APPROVED: 5,
  SUBMITTED: 4,
  REVISION_REQUIRED: 3,
  DRAFT: 2,
  ARCHIVED: 1,
}

function timestamp(value: Date | string | null | undefined) {
  if (!value) return 0
  const parsed = value instanceof Date ? value.getTime() : new Date(value).getTime()
  return Number.isFinite(parsed) ? parsed : 0
}

export function sortedRps<T extends RpsAssignmentHeader>(items: T[] | null | undefined) {
  return [...(items ?? [])].sort((a, b) => {
    const versionDiff = (b.version ?? 0) - (a.version ?? 0)
    if (versionDiff !== 0) return versionDiff

    const updatedDiff = timestamp(b.updated_at) - timestamp(a.updated_at)
    if (updatedDiff !== 0) return updatedDiff

    return (STATUS_PRIORITY[b.status ?? ""] ?? 0) - (STATUS_PRIORITY[a.status ?? ""] ?? 0)
  })
}

function compareAssignments<T extends RpsAssignmentLike>(a: T, b: T) {
  const aRps = sortedRps(a.rps)[0]
  const bRps = sortedRps(b.rps)[0]

  if (Boolean(aRps) !== Boolean(bRps)) return aRps ? -1 : 1

  if (aRps && bRps) {
    const statusDiff = (STATUS_PRIORITY[bRps.status ?? ""] ?? 0) - (STATUS_PRIORITY[aRps.status ?? ""] ?? 0)
    if (statusDiff !== 0) return statusDiff

    const versionDiff = (bRps.version ?? 0) - (aRps.version ?? 0)
    if (versionDiff !== 0) return versionDiff

    const updatedDiff = timestamp(bRps.updated_at) - timestamp(aRps.updated_at)
    if (updatedDiff !== 0) return updatedDiff
  }

  const classDiff = a.kelas.localeCompare(b.kelas, "id", { numeric: true })
  return classDiff !== 0 ? classDiff : a.id.localeCompare(b.id)
}

function assignmentGroupKey(item: RpsAssignmentLike) {
  const courseKey = item.mk?.kode?.trim().toUpperCase() || item.mk_id
  return `${courseKey}::${item.dosen_id}::${item.tahun_akademik_id}`
}

export function pickCanonicalRpsAssignment<T extends RpsAssignmentLike>(assignments: T[]) {
  if (assignments.length === 0) return null
  const selected = [...assignments].sort(compareAssignments)[0]
  return {
    ...selected,
    rps: sortedRps(selected.rps),
  } as T
}

export function collapseRpsAssignments<T extends RpsAssignmentLike>(assignments: T[]) {
  const groups = new Map<string, T[]>()

  for (const assignment of assignments) {
    const key = assignmentGroupKey(assignment)
    const group = groups.get(key) ?? []
    group.push(assignment)
    groups.set(key, group)
  }

  return [...groups.values()].map((group) => {
    const canonical = pickCanonicalRpsAssignment(group)!
    const kelasList = [...new Set(group.map((item) => item.kelas).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, "id", { numeric: true }))

    return {
      ...canonical,
      kelas: kelasList.join(", "),
      kelasList,
    }
  })
}
