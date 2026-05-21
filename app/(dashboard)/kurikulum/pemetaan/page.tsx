import { and, asc, eq } from "drizzle-orm"

import { db } from "@/db"
import { coursePloMappings, courses, curriculums, plos } from "@/db/schema"
import { Separator } from "@/components/ui/separator"
import { MappingTable } from "./mapping-table"
import { UploadForm } from "./upload-form"

export const dynamic = "force-dynamic"

type MappingLevel = "H" | "M" | "L" | null

export default async function PemetaanKurikulumPage() {
  const [activeCurriculum] = await db
    .select()
    .from(curriculums)
    .where(eq(curriculums.isActive, true))
    .limit(1)

  const curriculumPlos = activeCurriculum
    ? await db
        .select({
          id: plos.id,
          code: plos.code,
          description: plos.description,
          category: plos.category,
        })
        .from(plos)
        .where(eq(plos.curriculumId, activeCurriculum.id))
        .orderBy(asc(plos.code))
    : []

  const curriculumCourses = activeCurriculum
    ? await db
        .select({
          id: courses.id,
          code: courses.code,
          name: courses.name,
          creditsTheory: courses.creditsTheory,
          creditsPractice: courses.creditsPractice,
          semester: courses.semester,
        })
        .from(courses)
        .where(eq(courses.curriculumId, activeCurriculum.id))
        .orderBy(asc(courses.semester), asc(courses.code))
    : []

  const rows = activeCurriculum
    ? await db
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
    : []

  const mappingsByCourseId = rows.reduce<Map<string, { ploCode: string; contributionLevel: MappingLevel }[]>>(
    (groups, row) => {
      const group = groups.get(row.courseId) ?? []
      group.push({
        ploCode: row.ploCode,
        contributionLevel: row.contributionLevel,
      })
      groups.set(row.courseId, group)
      return groups
    },
    new Map()
  )

  const tableCourses = curriculumCourses.map((course) => ({
    ...course,
    mappings: mappingsByCourseId.get(course.id) ?? [],
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-blue-900 dark:text-blue-100">
          Pemetaan Kurikulum
        </h1>
        <p className="text-muted-foreground">
          Matriks korelasi Mata Kuliah dengan Capaian Pembelajaran Lulusan (CPL)
        </p>
      </div>

      <UploadForm />

      <Separator />

      <MappingTable courses={tableCourses} plos={curriculumPlos} />
    </div>
  )
}
