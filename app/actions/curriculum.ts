"use server"

import * as XLSX from "xlsx"
import { and, eq } from "drizzle-orm"
import { db } from "@/db"
import { coursePloMappings, courses, curriculums, plos } from "@/db/schema"
import { CurriculumRowSchema, type CurriculumRow } from "@/lib/validations/curriculum-mapping"

type UploadResult = {
  success: boolean
  message: string
  imported?: { courses: number; mappings: number }
  errors?: string[]
}

type RawRow = Record<string, unknown>
type ContributionLevel = "H" | "M" | "L"
type ParsedContribution = {
  level: ContributionLevel | null
  value: number | null
}

const SUPPORTED_MIME_TYPES = new Set([
  "application/vnd.oasis.opendocument.spreadsheet",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
])

const CONTRIBUTION_VALUES = {
  H: 100,
  M: 60,
  L: 30,
} as const

function getCurrentAcademicYear() {
  const year = new Date().getFullYear()
  return `${year}/${year + 1}`
}

function normalizePloCode(code: string) {
  const match = code.match(/^CPL[_-]?(\d+)$/i)
  return match ? `CPL_${match[1].padStart(2, "0")}` : code.toUpperCase()
}

function parsePrerequisites(value?: string) {
  if (!value) return []
  return value
    .split(/[;,]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function parseContribution(value: unknown): ParsedContribution | null {
  const normalized = String(value ?? "").trim().toUpperCase()
  if (!normalized || normalized === "0") return null
  if (normalized === "1") {
    return { level: "H" as const, value: CONTRIBUTION_VALUES.H }
  }
  if (normalized === "H" || normalized === "M" || normalized === "L") {
    return { level: normalized, value: CONTRIBUTION_VALUES[normalized] }
  }

  const numericValue = Number(normalized)
  return {
    level: null,
    value: Number.isFinite(numericValue) ? numericValue : null,
  }
}

async function findOrCreateCurriculum(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
) {
  const [activeCurriculum] = await tx
    .select()
    .from(curriculums)
    .where(eq(curriculums.isActive, true))
    .limit(1)

  if (activeCurriculum) return activeCurriculum

  const [createdCurriculum] = await tx
    .insert(curriculums)
    .values({
      name: "Kurikulum Aktif",
      year: getCurrentAcademicYear(),
    })
    .returning()

  return createdCurriculum
}

async function findOrCreatePlo(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  curriculumId: string,
  code: string,
) {
  const [existingPlo] = await tx
    .select()
    .from(plos)
    .where(and(eq(plos.curriculumId, curriculumId), eq(plos.code, code)))
    .limit(1)

  if (existingPlo) return existingPlo

  const [createdPlo] = await tx
    .insert(plos)
    .values({
      curriculumId,
      code,
      description: `Deskripsi ${code}`,
      category: "Pengetahuan",
    })
    .returning()

  return createdPlo
}

async function upsertCourse(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  curriculumId: string,
  row: CurriculumRow,
) {
  const [existingCourse] = await tx
    .select()
    .from(courses)
    .where(and(eq(courses.curriculumId, curriculumId), eq(courses.code, row.Kode_MK)))
    .limit(1)

  const courseData = {
    curriculumId,
    code: row.Kode_MK,
    name: row.Nama_MK,
    creditsTheory: row.SKS_Teori,
    creditsPractice: row.SKS_Praktik,
    semester: row.Semester,
    prerequisites: parsePrerequisites(row.Prasyarat),
    studyField: row.Bahan_Kajian || null,
  }

  if (existingCourse) {
    const [updatedCourse] = await tx
      .update(courses)
      .set(courseData)
      .where(eq(courses.id, existingCourse.id))
      .returning()

    return updatedCourse
  }

  const [createdCourse] = await tx.insert(courses).values(courseData).returning()
  return createdCourse
}

export async function uploadCurriculumMapping(formData: FormData): Promise<UploadResult> {
  const file = formData.get("file") as File | null

  if (!file || file.size === 0) {
    return { success: false, message: "File tidak ditemukan" }
  }

  if (!SUPPORTED_MIME_TYPES.has(file.type)) {
    return { success: false, message: "Format file tidak didukung" }
  }

  try {
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: "array" })
    const firstSheetName = workbook.SheetNames[0]

    if (!firstSheetName) {
      return { success: false, message: "Sheet tidak ditemukan" }
    }

    const sheet = workbook.Sheets[firstSheetName]
    const rows = XLSX.utils.sheet_to_json<RawRow>(sheet, { defval: "" })

    if (rows.length === 0) {
      return { success: false, message: "File tidak memiliki data" }
    }

    const headers = Object.keys(rows[0] || {})
    const cplColumns = headers.filter((header) => /^CPL[_-]?\d+$/i.test(header))

    if (cplColumns.length === 0) {
      return { success: false, message: "Kolom CPL tidak ditemukan" }
    }

    const errors: string[] = []
    const validRows: Array<{ row: CurriculumRow; raw: RawRow; rowNumber: number }> = []

    rows.forEach((raw, index) => {
      const parsed = CurriculumRowSchema.safeParse(raw)
      if (parsed.success) {
        validRows.push({ row: parsed.data, raw, rowNumber: index + 2 })
        return
      }

      const message = parsed.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join(", ")
      errors.push(`Baris ${index + 2}: ${message}`)
    })

    if (validRows.length === 0) {
      return {
        success: false,
        message: "Tidak ada data valid untuk diimport",
        errors,
      }
    }

    const imported = await db.transaction(async (tx) => {
      const curriculum = await findOrCreateCurriculum(tx)
      const ploIdByColumn = new Map<string, string>()

      for (const cplColumn of cplColumns) {
        const code = normalizePloCode(cplColumn)
        const plo = await findOrCreatePlo(tx, curriculum.id, code)
        ploIdByColumn.set(cplColumn, plo.id)
      }

      let courseCount = 0
      let mappingCount = 0

      for (const { row, raw } of validRows) {
        const course = await upsertCourse(tx, curriculum.id, row)
        courseCount += 1

        for (const cplColumn of cplColumns) {
          const contribution = parseContribution(raw[cplColumn])
          if (!contribution) continue

          const ploId = ploIdByColumn.get(cplColumn)
          if (!ploId) continue

          await tx
            .insert(coursePloMappings)
            .values({
              courseId: course.id,
              ploId,
              contributionLevel: contribution.level,
              contributionValue: contribution.value,
            })
            .onConflictDoUpdate({
              target: [coursePloMappings.courseId, coursePloMappings.ploId],
              set: {
                contributionLevel: contribution.level,
                contributionValue: contribution.value,
              },
            })

          mappingCount += 1
        }
      }

      return { courses: courseCount, mappings: mappingCount }
    })

    return {
      success: true,
      message: "Import berhasil",
      imported,
      ...(errors.length > 0 ? { errors } : {}),
    }
  } catch (error) {
    console.error("Failed to import curriculum mapping:", error)
    return {
      success: false,
      message: "Import gagal",
      errors: [error instanceof Error ? error.message : "Terjadi kesalahan tidak diketahui"],
    }
  }
}
