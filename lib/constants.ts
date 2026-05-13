export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  KAPRODI: "KAPRODI",
  DOSEN: "DOSEN",
  VIEWER: "VIEWER",
} as const

export const RPS_STATUS = {
  DRAFT: "DRAFT",
  SUBMITTED: "SUBMITTED",
  APPROVED: "APPROVED",
  REVISION_REQUIRED: "REVISION_REQUIRED",
  ARCHIVED: "ARCHIVED",
} as const

export const MK_STATUS = {
  WAJIB: "WAJIB",
  PILIHAN: "PILIHAN",
} as const

export const TRACK = {
  UMUM: "UMUM",
  BIS: "BIS",
  DSA: "DSA",
} as const

export const BLOOM_LEVELS = [
  { value: "C1", label: "C1 – Mengingat (Remember)" },
  { value: "C2", label: "C2 – Memahami (Understand)" },
  { value: "C3", label: "C3 – Menerapkan (Apply)" },
  { value: "C4", label: "C4 – Menganalisis (Analyze)" },
  { value: "C5", label: "C5 – Mengevaluasi (Evaluate)" },
  { value: "C6", label: "C6 – Mencipta (Create)" },
] as const

export const CPL_DOMAIN = {
  SIKAP: "SIKAP",
  PENGETAHUAN: "PENGETAHUAN",
  KETERAMPILAN_UMUM: "KETERAMPILAN_UMUM",
  KETERAMPILAN_KHUSUS: "KETERAMPILAN_KHUSUS",
} as const

export const ATTAINMENT_THRESHOLD = 75 // percent, default
export const MAX_PERTEMUAN = 16
