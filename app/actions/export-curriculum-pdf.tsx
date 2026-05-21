"use server"

import { db } from "@/db"
import { coursePloMappings, courses, curriculums, plos } from "@/db/schema"
import { and, asc, eq } from "drizzle-orm"
import React from "react"
import { renderToStream, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"

// PDF Styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 30,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#111827",
    paddingBottom: 10,
  },
  logoText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e3a8a",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    textAlign: "center",
    color: "#4b5563",
    marginBottom: 20,
  },
  table: {
    display: "flex",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row",
  },
  tableRowAlt: {
    backgroundColor: "#f9fafb",
  },
  tableColHeader: {
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: "#f3f4f6",
  },
  tableCol: {
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCellHeader: {
    margin: 5,
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
  tableCell: {
    margin: 5,
    fontSize: 9,
    textAlign: "center",
  },
  tableCellLeft: {
    margin: 5,
    fontSize: 9,
    textAlign: "left",
  },
  cellH: {
    backgroundColor: "#86efac",
  },
  cellM: {
    backgroundColor: "#fde047",
  },
  cellL: {
    backgroundColor: "#d1d5db",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 10,
    color: "#6b7280",
    textAlign: "center",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 10,
  },
})

const PdfDocument = ({ 
  curriculumName, 
  coursesList, 
  plosList, 
  mappingsByCourse 
}: { 
  curriculumName: string, 
  coursesList: any[], 
  plosList: any[], 
  mappingsByCourse: Map<string, Record<string, string | null>> 
}) => {
  const currentDate = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  const colNoWidth = "3%"
  const colCodeWidth = "8%"
  const colNameWidth = "22%"
  const colSksWidth = "5%"
  const colSemWidth = "4%"
  
  const remainingWidth = 100 - (3 + 8 + 22 + 5 + 4)
  const ploColWidth = `${remainingWidth / plosList.length}%`

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.logoText}>SIPEKA — Universitas Bakrie</Text>
        </View>
        
        <Text style={styles.title}>Matriks Pemetaan Kurikulum Program Studi Sistem Informasi</Text>
        <Text style={styles.subtitle}>Kurikulum: {curriculumName}</Text>

        <View style={styles.table}>
          {/* Header Row */}
          <View style={styles.tableRow}>
            <View style={[styles.tableColHeader, { width: colNoWidth }]}><Text style={styles.tableCellHeader}>No</Text></View>
            <View style={[styles.tableColHeader, { width: colCodeWidth }]}><Text style={styles.tableCellHeader}>Kode MK</Text></View>
            <View style={[styles.tableColHeader, { width: colNameWidth }]}><Text style={styles.tableCellHeader}>Nama MK</Text></View>
            <View style={[styles.tableColHeader, { width: colSksWidth }]}><Text style={styles.tableCellHeader}>SKS</Text></View>
            <View style={[styles.tableColHeader, { width: colSemWidth }]}><Text style={styles.tableCellHeader}>Sem</Text></View>
            {plosList.map((plo) => (
              <View key={plo.id} style={[styles.tableColHeader, { width: ploColWidth }]}>
                <Text style={styles.tableCellHeader}>{plo.code}</Text>
              </View>
            ))}
          </View>

          {/* Data Rows */}
          {coursesList.map((course, index) => {
            const courseMap = mappingsByCourse.get(course.id) || {}
            const totalSks = course.creditsTheory + course.creditsPractice
            const isAlt = index % 2 !== 0

            return (
              <View key={course.id} style={[styles.tableRow, isAlt ? styles.tableRowAlt : {}]}>
                <View style={[styles.tableCol, { width: colNoWidth }]}><Text style={styles.tableCell}>{index + 1}</Text></View>
                <View style={[styles.tableCol, { width: colCodeWidth }]}><Text style={styles.tableCell}>{course.code}</Text></View>
                <View style={[styles.tableCol, { width: colNameWidth }]}><Text style={styles.tableCellLeft}>{course.name}</Text></View>
                <View style={[styles.tableCol, { width: colSksWidth }]}><Text style={styles.tableCell}>{totalSks}</Text></View>
                <View style={[styles.tableCol, { width: colSemWidth }]}><Text style={styles.tableCell}>{course.semester}</Text></View>
                
                {plosList.map((plo) => {
                  const val = courseMap[plo.code]
                  let bgStyle = {}
                  if (val === "H") bgStyle = styles.cellH
                  else if (val === "M") bgStyle = styles.cellM
                  else if (val === "L") bgStyle = styles.cellL

                  return (
                    <View key={plo.id} style={[styles.tableCol, { width: ploColWidth }, bgStyle]}>
                      <Text style={styles.tableCell}>{val || ""}</Text>
                    </View>
                  )
                })}
              </View>
            )
          })}
        </View>

        <Text style={styles.footer} fixed>
          Dicetak oleh SIPEKA — {currentDate}
        </Text>
      </Page>
    </Document>
  )
}

export async function exportCurriculumPdf(): Promise<{
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

    const stream = await renderToStream(
      <PdfDocument 
        curriculumName={activeCurriculum.name}
        coursesList={curriculumCourses}
        plosList={curriculumPlos}
        mappingsByCourse={mappingsByCourse}
      /> as any
    )

    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = []
      stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)))
      stream.on("error", (err) => {
        console.error("PDF generation stream error", err)
        reject({ success: false, error: "Terjadi kesalahan saat generate PDF." })
      })
      stream.on("end", () => {
        const base64 = Buffer.concat(chunks).toString("base64")
        resolve({
          success: true,
          data: base64,
          filename: `Pemetaan_Kurikulum_${activeCurriculum.name}.pdf`,
        })
      })
    })
  } catch (error: any) {
    console.error("Export PDF Error:", error)
    return { success: false, error: error.message }
  }
}
