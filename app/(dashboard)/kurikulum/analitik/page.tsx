import { db } from "@/db"
import { coursePloMappings, courses, curriculums, plos } from "@/db/schema"
import { and, asc, eq, sql } from "drizzle-orm"
import { EmptyState } from "@/components/ui/empty-state"
import { BarChart2 } from "lucide-react"
import { ExportButtons } from "./export-buttons"
import { SksBarChart } from "./sks-bar-chart"
import { ObeRadarChart } from "./obe-radar-chart"
import { CplCoverageCards } from "./cpl-coverage-cards"

export const dynamic = "force-dynamic"

export default async function AnalitikKurikulumPage() {
  const [activeCurriculum] = await db
    .select()
    .from(curriculums)
    .where(eq(curriculums.isActive, true))
    .limit(1)

  if (!activeCurriculum) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-blue-900 dark:text-blue-100">
            Analitik Kurikulum
          </h1>
          <p className="text-muted-foreground">
            Distribusi beban SKS dan ketercapaian Capaian Pembelajaran Lulusan (CPL)
          </p>
        </div>
        <EmptyState
          icon={BarChart2}
          title="Belum ada data"
          description="Upload pemetaan kurikulum terlebih dahulu."
        />
      </div>
    )
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

  const mappings = await db
    .select({
      courseId: courses.id,
      ploId: plos.id,
      ploCode: plos.code,
      contributionLevel: coursePloMappings.contributionLevel,
      courseCredits: sql<number>`${courses.creditsTheory} + ${courses.creditsPractice}`,
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

  if (curriculumCourses.length === 0 || curriculumPlos.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-blue-900 dark:text-blue-100">
            Analitik Kurikulum
          </h1>
          <p className="text-muted-foreground">
            Distribusi beban SKS dan ketercapaian Capaian Pembelajaran Lulusan (CPL)
          </p>
        </div>
        <EmptyState
          icon={BarChart2}
          title="Belum ada data"
          description="Upload pemetaan kurikulum terlebih dahulu."
        />
      </div>
    )
  }

  // 1. SKS per semester
  const sksBySemester = new Map<number, { semester: number, sksTeori: number, sksPraktik: number }>()
  for (let i = 1; i <= 8; i++) {
    sksBySemester.set(i, { semester: i, sksTeori: 0, sksPraktik: 0 })
  }

  curriculumCourses.forEach((c) => {
    const sem = c.semester
    if (sksBySemester.has(sem)) {
      const data = sksBySemester.get(sem)!
      data.sksTeori += c.creditsTheory
      data.sksPraktik += c.creditsPractice
    }
  })
  const sksChartData = Array.from(sksBySemester.values()).sort((a, b) => a.semester - b.semester)

  // 2. CPL coverage per code
  const cplStats = new Map<string, { supportingCourses: number, totalSks: number }>()
  curriculumPlos.forEach(p => cplStats.set(p.code, { supportingCourses: 0, totalSks: 0 }))
  
  mappings.forEach(m => {
    if (cplStats.has(m.ploCode)) {
      const stat = cplStats.get(m.ploCode)!
      stat.supportingCourses += 1
      stat.totalSks += Number(m.courseCredits) || 0
    }
  })

  const maxSupporting = Math.max(1, ...Array.from(cplStats.values()).map(s => s.supportingCourses))
  
  const cplCoverageData = curriculumPlos.map(plo => {
    const stats = cplStats.get(plo.code) || { supportingCourses: 0, totalSks: 0 }
    return {
      code: plo.code,
      description: plo.description,
      category: plo.category,
      supportingCourses: stats.supportingCourses,
      totalSks: stats.totalSks,
      coveragePercent: (stats.supportingCourses / maxSupporting) * 100
    }
  })

  // 3. CPL Category Coverage (Radar Chart)
  const categoryStats = new Map<string, { totalPlos: number, coveredPlos: number }>()
  const categories = ["Sikap", "Keterampilan Umum", "Keterampilan Khusus", "Pengetahuan"]
  categories.forEach(cat => categoryStats.set(cat, { totalPlos: 0, coveredPlos: 0 }))

  curriculumPlos.forEach(plo => {
    if (categoryStats.has(plo.category)) {
      const cat = categoryStats.get(plo.category)!
      cat.totalPlos += 1
      const stats = cplStats.get(plo.code)
      if (stats && stats.supportingCourses > 0) {
        cat.coveredPlos += 1
      }
    }
  })

  const radarChartData = categories.map(cat => {
    const stat = categoryStats.get(cat)!
    return {
      category: cat,
      percentage: stat.totalPlos > 0 ? (stat.coveredPlos / stat.totalPlos) * 100 : 0,
      fullMark: 100
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-blue-900 dark:text-blue-100">
            Analitik Kurikulum
          </h1>
          <p className="text-muted-foreground">
            Distribusi beban SKS dan ketercapaian Capaian Pembelajaran Lulusan (CPL)
          </p>
        </div>
        <ExportButtons />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border rounded-xl p-4 bg-card text-card-foreground shadow-sm">
          <h3 className="font-semibold mb-4 text-center">Distribusi SKS per Semester</h3>
          <SksBarChart data={sksChartData} />
        </div>
        <div className="border rounded-xl p-4 bg-card text-card-foreground shadow-sm">
          <h3 className="font-semibold mb-4 text-center">Cakupan Kategori CPL</h3>
          <ObeRadarChart data={radarChartData} />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Detail Cakupan per CPL</h3>
        <CplCoverageCards cpls={cplCoverageData} />
      </div>
    </div>
  )
}
