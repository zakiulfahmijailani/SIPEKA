"use server"

import { db } from "@/db"
import { coursePloMappings, courses, curriculums, plos } from "@/db/schema"
import { and, asc, eq } from "drizzle-orm"
import ExcelJS from "exceljs"

export async function exportCurriculumToExcel(): Promise<{
  success: boolean
  data?: string
  filename?: string
  error?: string
}> {
  try {
    const [activeCurriculum] = await db
      .select()
      .from(curriculums)
      .where(eq(curriculums.isActive, true))
      .limit(1)

    if (!activeCurriculum) {
      return { success: false, error: "Tidak ada kurikulum aktif." }
    }

    const curriculumPlos = await db
      .select()
      .from(plos)
      .where(eq(plos.curriculumId, activeCurriculum.id))
      .orderBy(asc(plos.code))

    const curriculumCourses = await db
      .select()
      .from(courses)
      .where(eq(courses.curriculumId, activeCurriculum.id))
      .orderBy(asc(courses.semester), asc(courses.code))

    const mappings = await db
      .select({
        courseId: courses.id,
        ploCode: plos.code,
        contributionLevel: coursePloMappings.contributionLevel,
      })
      .from(coursePloMappings)
      .innerJoin(courses, eq(coursePloMappings.courseId, courses.id))
      .innerJoin(plos, eq(coursePloMappings.ploId, plos.id))
      .where(
        and(
          eq(courses.curriculumId, activeCurriculum.id),
          eq(plos.curriculumId, activeCurriculum.id)
        )
      )

    const mappingsByCourse = new Map<string, Record<string, string | null>>()
    mappings.forEach((m) => {
      const courseMappings = mappingsByCourse.get(m.courseId) || {}
      courseMappings[m.ploCode] = m.contributionLevel
      mappingsByCourse.set(m.courseId, courseMappings)
    })

    const workbook = new ExcelJS.Workbook()
    workbook.creator = "SIPEKA"

    // Sheet 1: Pemetaan MK-CPL
    const sheet1 = workbook.addWorksheet("Pemetaan MK-CPL", {
      views: [{ state: "frozen", xSplit: 5, ySplit: 1 }]
    })

    const ploCodes = curriculumPlos.map((p) => p.code)
    const headerRow = ["Kode MK", "Nama MK", "SKS T", "SKS P", "Semester", ...ploCodes]
    sheet1.addRow(headerRow)

    const headerFormat = sheet1.getRow(1)
    headerFormat.font = { bold: true }
    headerFormat.alignment = { horizontal: "center", vertical: "middle" }

    curriculumCourses.forEach((course) => {
      const courseMap = mappingsByCourse.get(course.id) || {}
      const rowData: any[] = [
        course.code,
        course.name,
        course.creditsTheory,
        course.creditsPractice,
        course.semester,
      ]

      ploCodes.forEach((code) => {
        rowData.push(courseMap[code] || "")
      })

      const row = sheet1.addRow(rowData)

      // Styling H/M/L
      ploCodes.forEach((_, idx) => {
        const cell = row.getCell(6 + idx)
        cell.alignment = { horizontal: "center", vertical: "middle" }
        const val = cell.value
        if (val === "H") {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF86EFAC" } } // green-300
        } else if (val === "M") {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFDE047" } } // yellow-300
        } else if (val === "L") {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD1D5DB" } } // gray-300
        }
      })
    })

    sheet1.columns.forEach((column, i) => {
      if (i === 1) column.width = 40
      else if (i === 0) column.width = 15
      else column.width = 10
    })

    // Sheet 2: Daftar CPL
    const sheet2 = workbook.addWorksheet("Daftar CPL")
    sheet2.addRow(["Kode", "Deskripsi", "Kategori", "Jumlah MK Pendukung"])
    sheet2.getRow(1).font = { bold: true }

    const ploSupportCount: Record<string, number> = {}
    ploCodes.forEach((code) => (ploSupportCount[code] = 0))
    mappings.forEach((m) => {
      if (m.contributionLevel) {
        ploSupportCount[m.ploCode]++
      }
    })

    curriculumPlos.forEach((plo) => {
      sheet2.addRow([
        plo.code,
        plo.description,
        plo.category,
        ploSupportCount[plo.code] || 0
      ])
    })
    sheet2.getColumn(1).width = 15
    sheet2.getColumn(2).width = 60
    sheet2.getColumn(3).width = 25
    sheet2.getColumn(4).width = 25

    const buffer = await workbook.xlsx.writeBuffer()
    const base64 = Buffer.from(buffer).toString("base64")

    return {
      success: true,
      data: base64,
      filename: `Pemetaan_Kurikulum_${activeCurriculum.name}.xlsx`,
    }
  } catch (error: any) {
    console.error("Export Excel Error:", error)
    return { success: false, error: error.message }
  }
}
