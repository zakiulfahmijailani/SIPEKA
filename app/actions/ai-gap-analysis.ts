"use server"

import { db } from "@/db"
import { coursePloMappings, courses, curriculums, plos } from "@/db/schema"
import { and, asc, eq, sql } from "drizzle-orm"
import Anthropic from "@anthropic-ai/sdk"

export async function analyzeCurriculumGaps(): Promise<{
  success: boolean
  analysis?: {
    overallScore: number
    orphanCpls: string[]
    overloadedCourses: string[]
    underloadedSemesters: number[]
    overloadedSemesters: number[]
    recommendations: {
      priority: "high" | "medium" | "low"
      category: "coverage" | "balance" | "distribution" | "redundancy"
      title: string
      description: string
      affectedItems: string[]
    }[]
    summary: string
    generatedAt: string
  }
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
        courseCode: courses.code,
        courseName: courses.name,
        courseSemester: courses.semester,
        ploCode: plos.code,
        contributionLevel: coursePloMappings.contributionLevel,
      })
      .from(coursePloMappings)
      .innerJoin(courses, eq(coursePloMappings.courseId, courses.id))
      .innerJoin(plos, eq(coursePloMappings.ploId, plos.id))
      .where(
        and(
          eq(courses.curriculumId, activeCurriculum.id),
          eq(plos.curriculumId, activeCurriculum.id),
          sql`${coursePloMappings.contributionLevel} IS NOT NULL`
        )
      )

    // Compute Stats locally
    const cplSupportCount = new Map<string, number>()
    curriculumPlos.forEach(p => cplSupportCount.set(p.code, 0))

    const courseCplCount = new Map<string, number>()
    curriculumCourses.forEach(c => courseCplCount.set(c.code, 0))
    
    const courseMappingsData = new Map<string, { code: string, name: string, semester: number, cpls: string[] }>()
    curriculumCourses.forEach(c => {
      courseMappingsData.set(c.code, { code: c.code, name: c.name, semester: c.semester, cpls: [] })
    })

    mappings.forEach(m => {
      if (cplSupportCount.has(m.ploCode)) {
        cplSupportCount.set(m.ploCode, cplSupportCount.get(m.ploCode)! + 1)
      }
      if (courseCplCount.has(m.courseCode)) {
        courseCplCount.set(m.courseCode, courseCplCount.get(m.courseCode)! + 1)
      }
      if (courseMappingsData.has(m.courseCode)) {
        courseMappingsData.get(m.courseCode)!.cpls.push(m.ploCode)
      }
    })

    const orphanCpls = curriculumPlos.filter(p => cplSupportCount.get(p.code) === 0).map(p => p.code)
    const overloadedCourses = curriculumCourses.filter(c => (courseCplCount.get(c.code) || 0) >= 5).map(c => c.code)

    const sksBySemester = new Map<number, { semester: number, sksTeori: number, sksPraktik: number, totalSks: number, courses: string[] }>()
    for (let i = 1; i <= 8; i++) {
      sksBySemester.set(i, { semester: i, sksTeori: 0, sksPraktik: 0, totalSks: 0, courses: [] })
    }
    
    let totalSksAll = 0
    curriculumCourses.forEach(c => {
      if (sksBySemester.has(c.semester)) {
        const sem = sksBySemester.get(c.semester)!
        sem.sksTeori += c.creditsTheory
        sem.sksPraktik += c.creditsPractice
        sem.totalSks += (c.creditsTheory + c.creditsPractice)
        sem.courses.push(c.code)
        totalSksAll += (c.creditsTheory + c.creditsPractice)
      }
    })

    const semesterDist = Array.from(sksBySemester.values())
    const underloadedSemesters = semesterDist.filter(s => s.totalSks > 0 && s.totalSks < 18).map(s => s.semester)
    const overloadedSemesters = semesterDist.filter(s => s.totalSks > 24).map(s => s.semester)

    const cplCoverage = curriculumPlos.map(p => ({
      code: p.code,
      category: p.category,
      supportingCourses: cplSupportCount.get(p.code) || 0
    }))

    // Build context
    const curriculumContext = {
      totalCourses: curriculumCourses.length,
      totalCpls: curriculumPlos.length,
      totalSks: totalSksAll,
      semesterDistribution: semesterDist.filter(s => s.courses.length > 0),
      cplCoverage,
      courseMappings: Array.from(courseMappingsData.values()).filter(c => c.cpls.length > 0),
      issues: {
        orphanCpls,
        overloadedCourses,
        underloadedSemesters,
        overloadedSemesters
      }
    }

    const prompt = `Kamu adalah konsultan kurikulum pendidikan tinggi berbasis OBE (Outcome-Based Education) 
yang ahli dalam standar BAN-PT dan LAM-Infokom Indonesia.

Analisis data pemetaan kurikulum Program Studi Sistem Informasi berikut:

${JSON.stringify(curriculumContext, null, 2)}

Berikan analisis komprehensif dengan format JSON yang PERSIS seperti ini:
{
  "overallScore": <0-100, skor kualitas kurikulum secara keseluruhan>,
  "recommendations": [
    {
      "priority": "<high|medium|low>",
      "category": "<coverage|balance|distribution|redundancy>",
      "title": "<judul rekomendasi dalam Bahasa Indonesia>",
      "description": "<penjelasan detail 2-3 kalimat dalam Bahasa Indonesia>",
      "affectedItems": ["<kode MK atau CPL yang terdampak>"]
    }
  ],
  "summary": "<narasi ringkasan analisis 2-3 paragraf dalam Bahasa Indonesia>"
}

Fokus pada:
1. CPL yang tidak didukung cukup oleh MK (orphan CPL)
2. MK yang terlalu banyak menanggung CPL (overloaded)
3. Ketidakseimbangan distribusi SKS antar semester
4. Redundansi pemetaan yang tidak perlu
5. Kesesuaian dengan standar OBE Permendikbudristek No. 53 Tahun 2023

Balas HANYA dengan JSON valid, tanpa teks lain di luar JSON.`

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    const msg = await anthropic.messages.create({
      model: process.env.CLAUDE_MODEL || "claude-3-5-haiku-20241022",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    })

    let aiOutput = ""
    if (msg.content[0].type === "text") {
      aiOutput = msg.content[0].text
    } else {
      throw new Error("Unexpected response format from Claude.")
    }

    let jsonString = aiOutput.trim()
    if (jsonString.startsWith("```json")) {
      jsonString = jsonString.substring(7)
    } else if (jsonString.startsWith("```")) {
      jsonString = jsonString.substring(3)
    }
    if (jsonString.endsWith("```")) {
      jsonString = jsonString.substring(0, jsonString.length - 3)
    }
    jsonString = jsonString.trim()

    const parsedData = JSON.parse(jsonString)

    return {
      success: true,
      analysis: {
        overallScore: parsedData.overallScore || 0,
        orphanCpls,
        overloadedCourses,
        underloadedSemesters,
        overloadedSemesters,
        recommendations: parsedData.recommendations || [],
        summary: parsedData.summary || "",
        generatedAt: new Date().toISOString()
      }
    }
  } catch (error: any) {
    console.error("AI Analysis Error:", error)
    return { success: false, error: "Gagal memproses analisis AI. Pastikan API Key valid atau coba lagi nanti." }
  }
}
