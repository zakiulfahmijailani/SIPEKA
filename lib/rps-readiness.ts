export type ReadinessSubCpmk = {
  id?: string
  kode?: string
  deskripsi?: string | null
}

export type ReadinessCpmk = {
  id?: string
  kode?: string
  deskripsi?: string | null
  metode_pencapaian?: string | null
  cplMappings?: unknown[]
  subCpmks?: ReadinessSubCpmk[]
}

export type ReadinessMeeting = {
  minggu_ke?: number
  materi?: string | null
  metode?: string | null
  indikator?: string | null
  referensi?: string | null
  subCpmkMappings?: unknown[]
}

export type ReadinessAssessment = {
  nama?: string | null
  bobot?: number | string | null
  kriteria_penilaian?: string | null
  cpmkMappings?: unknown[]
  subCpmkMappings?: unknown[]
}

export type ReadinessRps = {
  status?: string
  deskripsi_mk?: string | null
  metode_pembelajaran?: string | null
  persyaratan_kehadiran?: string | null
  nama_penyetuju?: string | null
  cpmks?: ReadinessCpmk[]
  pertemuans?: ReadinessMeeting[]
  komponens?: ReadinessAssessment[]
  referensis?: unknown[]
}

export type RpsReadiness = {
  progress: number
  totalBobot: number
  issues: string[]
  sections: {
    cpmk: boolean
    subCpmk: boolean
    meetings: boolean
    assessments: boolean
    references: boolean
    formalities: boolean
  }
}

const asNumber = (value: number | string | null | undefined) => {
  const parsed = Number(value ?? 0)
  return Number.isFinite(parsed) ? parsed : 0
}

export function calculateRpsReadiness(rps?: ReadinessRps | null): RpsReadiness {
  const cpmks = rps?.cpmks ?? []
  const meetings = rps?.pertemuans ?? []
  const assessments = rps?.komponens ?? []
  const references = rps?.referensis ?? []
  const subCpmks = cpmks.flatMap((item) => item.subCpmks ?? [])
  const totalBobot = Number(
    assessments.reduce((sum, item) => sum + asNumber(item.bobot), 0).toFixed(2),
  )

  const sections = {
    cpmk:
      cpmks.length > 0 &&
      cpmks.every((item) => Boolean(item.deskripsi?.trim()) && Boolean(item.metode_pencapaian?.trim()) && (item.cplMappings?.length ?? 0) > 0),
    subCpmk:
      subCpmks.length > 0 &&
      cpmks.every((item) => (item.subCpmks?.length ?? 0) > 0),
    meetings:
      meetings.filter((item) => Boolean(item.materi?.trim()) && Boolean(item.metode?.trim()) && Boolean(item.referensi?.trim())).length >= 14,
    assessments:
      assessments.length > 0 &&
      Math.abs(totalBobot - 100) < 0.01 &&
      assessments.every(
        (item) =>
          Boolean(item.nama?.trim()) &&
          ((item.subCpmkMappings?.length ?? 0) > 0 || (item.cpmkMappings?.length ?? 0) > 0),
      ),
    references: references.length > 0,
    formalities: Boolean(rps?.deskripsi_mk?.trim()) && Boolean(rps?.metode_pembelajaran?.trim()) && Boolean(rps?.persyaratan_kehadiran?.trim()) && Boolean(rps?.nama_penyetuju?.trim()),
  }

  const weightedSections = [
    { done: sections.formalities, weight: 10 },
    { done: sections.cpmk, weight: 18 },
    { done: sections.subCpmk, weight: 12 },
    { done: sections.meetings, weight: 28 },
    { done: sections.assessments, weight: 22 },
    { done: sections.references, weight: 10 },
  ]
  const progress = weightedSections.reduce((sum, section) => sum + (section.done ? section.weight : 0), 0)

  const issues: string[] = []
  if (!sections.formalities) issues.push("Lengkapi deskripsi, metode, kehadiran, dan data pengesah pada Dokumen RPS")
  if (!sections.cpmk) issues.push("Lengkapi CPMK, metode pencapaian, dan keterkaitannya dengan CPL")
  if (!sections.subCpmk) issues.push("Setiap CPMK perlu memiliki minimal satu Sub-CPMK")
  if (!sections.meetings) issues.push("Lengkapi materi, metode, dan referensi minimal 14 minggu pembelajaran")
  if (assessments.length === 0) {
    issues.push("Tambahkan komponen asesmen")
  } else if (Math.abs(totalBobot - 100) >= 0.01) {
    issues.push(`Total bobot asesmen ${totalBobot}% dan harus menjadi 100%`)
  } else if (!sections.assessments) {
    issues.push("Hubungkan setiap asesmen dengan CPMK atau Sub-CPMK")
  }
  if (!sections.references) issues.push("Tambahkan minimal satu referensi")

  return { progress, totalBobot, issues, sections }
}
