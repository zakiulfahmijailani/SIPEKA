import { and, asc, eq } from "drizzle-orm"
import { BarChart2 } from "lucide-react"

import { CplCoverageCards } from "./cpl-coverage-cards"
import { ExportButtons } from "./export-buttons"
import { ObeRadarChart } from "./obe-radar-chart"
import { SksBarChart } from "./sks-bar-chart"
import { EmptyState } from "@/components/ui/empty-state"
import { db } from "@/db"
import { CURRICULUM_2026_OFFICIAL_SKS_BY_SEMESTER } from "@/db/curriculum-2026"
import { cpl, mataKuliah, petaKurikulum } from "@/db/schema"

export const dynamic = "force-dynamic"

const DOMAIN_LABELS: Record<string, string> = {
  SIKAP: "Sikap",
  PENGETAHUAN: "Pengetahuan",
  KETERAMPILAN_UMUM: "Keterampilan Umum",
  KETERAMPILAN_KHUSUS: "Keterampilan Khusus",
}
export default async function AnalitikKurikulumPage() {
  const cplQuery = db
    .select({
      id: cpl.id,
      code: cpl.kode,
      description: cpl.rumusan,
      domain: cpl.domain,
    })
    .from(cpl)
    .where(eq(cpl.is_active, true))
    .orderBy(asc(cpl.urutan))

  const coursesQuery = db
    .select({
      id: mataKuliah.id,
      semester: mataKuliah.semester_rekomendasi,
      creditsTheory: mataKuliah.sks_teori,
      creditsPractice: mataKuliah.sks_praktik,
      status: mataKuliah.status,
    })
    .from(mataKuliah)
    .where(eq(mataKuliah.is_active, true))

  const mappingsQuery = db
    .select({
      courseId: mataKuliah.id,
      cplCode: cpl.kode,
      courseCreditsTheory: mataKuliah.sks_teori,
      courseCreditsPractice: mataKuliah.sks_praktik,
    })
    .from(petaKurikulum)
    .innerJoin(mataKuliah, eq(petaKurikulum.mk_id, mataKuliah.id))
    .innerJoin(cpl, eq(petaKurikulum.cpl_id, cpl.id))
    .where(and(eq(mataKuliah.is_active, true), eq(cpl.is_active, true)))

  const [curriculumPlos, curriculumCourses, mappings] = await Promise.all([
    cplQuery,
    coursesQuery,
    mappingsQuery,
  ])

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
          description="Lengkapi data mata kuliah dan CPL terlebih dahulu."
        />
      </div>
    )
  }

  const sksBySemester = new Map<number, {
    semester: number
    sksWajib: number
    sksPilihanDitawarkan: number
    bebanResmi: number
  }>()

  for (let semester = 1; semester <= 8; semester++) {
    sksBySemester.set(semester, {
      semester,
      sksWajib: 0,
      sksPilihanDitawarkan: 0,
      bebanResmi: CURRICULUM_2026_OFFICIAL_SKS_BY_SEMESTER[semester] ?? 0,
    })
  }

  curriculumCourses.forEach((course) => {
    const semesterData = sksBySemester.get(course.semester)
    if (!semesterData) return

    const credits = course.creditsTheory + course.creditsPractice
    if (course.status === "PILIHAN") {
      semesterData.sksPilihanDitawarkan += credits
    } else {
      semesterData.sksWajib += credits
    }
  })

  const sksChartData = Array.from(sksBySemester.values()).sort(
    (a, b) => a.semester - b.semester
  )

  const cplStats = new Map<string, { supportingCourses: number; totalSks: number }>()
  curriculumPlos.forEach((item) => {
    cplStats.set(item.code, { supportingCourses: 0, totalSks: 0 })
  })

  mappings.forEach((mapping) => {
    const stat = cplStats.get(mapping.cplCode)
    if (!stat) return

    stat.supportingCourses += 1
    stat.totalSks += mapping.courseCreditsTheory + mapping.courseCreditsPractice
  })

  const maxSupporting = Math.max(
    1,
    ...Array.from(cplStats.values()).map((item) => item.supportingCourses)
  )

  const cplCoverageData = curriculumPlos.map((item) => {
    const stats = cplStats.get(item.code) ?? { supportingCourses: 0, totalSks: 0 }
    return {
      code: item.code,
      description: item.description,
      category: DOMAIN_LABELS[item.domain] ?? item.domain,
      supportingCourses: stats.supportingCourses,
      totalSks: stats.totalSks,
      coveragePercent: (stats.supportingCourses / maxSupporting) * 100,
    }
  })

  const categoryStats = new Map<string, { totalPlos: number; coveredPlos: number }>()
  const categories = ["Sikap", "Pengetahuan", "Keterampilan Umum", "Keterampilan Khusus"]
  categories.forEach((category) => {
    categoryStats.set(category, { totalPlos: 0, coveredPlos: 0 })
  })

  curriculumPlos.forEach((item) => {
    const category = DOMAIN_LABELS[item.domain] ?? item.domain
    const stat = categoryStats.get(category)
    if (!stat) return

    stat.totalPlos += 1
    if ((cplStats.get(item.code)?.supportingCourses ?? 0) > 0) {
      stat.coveredPlos += 1
    }
  })

  const radarChartData = categories.map((category) => {
    const stat = categoryStats.get(category)!
    return {
      category,
      percentage: stat.totalPlos > 0 ? (stat.coveredPlos / stat.totalPlos) * 100 : 0,
      fullMark: 100,
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-4 text-card-foreground shadow-sm">
          <h3 className="mb-1 text-center font-semibold">Distribusi SKS per Semester</h3>
          <p className="mb-4 text-center text-xs text-muted-foreground">
            Garis menunjukkan beban resmi; batang mencakup seluruh MK pilihan yang ditawarkan.
          </p>
          <SksBarChart data={sksChartData} />
        </div>
        <div className="rounded-xl border bg-card p-4 text-card-foreground shadow-sm">
          <h3 className="mb-4 text-center font-semibold">Cakupan Kategori CPL</h3>
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
