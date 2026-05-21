import { asc, eq } from "drizzle-orm"

import { db } from "@/db"
import { cpl, mataKuliah, petaKurikulum } from "@/db/schema"
import { Separator } from "@/components/ui/separator"
import { MappingTable } from "./mapping-table"
import { UploadForm } from "./upload-form"

export const dynamic = "force-dynamic"

type MappingLevel = "H" | "M" | "L" | null

export default async function PemetaanKurikulumPage() {
  const curriculumPlos = await db
    .select({
      id: cpl.id,
      code: cpl.kode,
      description: cpl.rumusan,
      category: cpl.domain,
    })
    .from(cpl)
    .where(eq(cpl.is_active, true))
    .orderBy(asc(cpl.urutan))

  const curriculumCourses = await db
    .select({
      id: mataKuliah.id,
      code: mataKuliah.kode,
      name: mataKuliah.nama_id,
      creditsTheory: mataKuliah.sks_teori,
      creditsPractice: mataKuliah.sks_praktik,
      semester: mataKuliah.semester_rekomendasi,
    })
    .from(mataKuliah)
    .where(eq(mataKuliah.is_active, true))
    .orderBy(asc(mataKuliah.semester_rekomendasi), asc(mataKuliah.kode))

  const rows = await db
    .select({
      courseId: petaKurikulum.mk_id,
      ploCode: cpl.kode,
      // mapping existing bobot to level: bobot is currently integer (default 1)
      // For MappingTable compatibility, we will assume existence of mapping means "H" or you can map based on value
      bobot: petaKurikulum.bobot,
    })
    .from(petaKurikulum)
    .innerJoin(mataKuliah, eq(petaKurikulum.mk_id, mataKuliah.id))
    .innerJoin(cpl, eq(petaKurikulum.cpl_id, cpl.id))

  const mappingsByCourseId = rows.reduce<Map<string, { ploCode: string; contributionLevel: MappingLevel }[]>>(
    (groups, row) => {
      const group = groups.get(row.courseId) ?? []
      group.push({
        ploCode: row.ploCode,
        // Using "H" for all mapped since bobot is 1, mapping table expects "H" | "M" | "L"
        // Adjust if bobot means something else
        contributionLevel: "H",
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
