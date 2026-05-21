import { db } from "@/db"
import { curriculums, courses, plos } from "@/db/schema"
import { eq } from "drizzle-orm"
import { EmptyState } from "@/components/ui/empty-state"
import { Sparkles } from "lucide-react"
import { AiAnalysisClient } from "./client"

export const dynamic = "force-dynamic"

export default async function AiAnalysisPage() {
  const [activeCurriculum] = await db
    .select()
    .from(curriculums)
    .where(eq(curriculums.isActive, true))
    .limit(1)

  if (!activeCurriculum) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-blue-900 dark:text-blue-100 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-indigo-600" />
            Analisis Gap Kurikulum — AI
          </h1>
          <p className="text-muted-foreground">
            Powered by Claude AI · Berdasarkan standar OBE & BAN-PT
          </p>
        </div>
        <EmptyState
          icon={Sparkles}
          title="Belum ada data"
          description="Upload pemetaan kurikulum terlebih dahulu untuk menjalankan analisis."
        />
      </div>
    )
  }

  const curriculumCourses = await db
    .select()
    .from(courses)
    .where(eq(courses.curriculumId, activeCurriculum.id))
    .limit(1)

  const curriculumPlos = await db
    .select()
    .from(plos)
    .where(eq(plos.curriculumId, activeCurriculum.id))
    .limit(1)

  if (curriculumCourses.length === 0 || curriculumPlos.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-blue-900 dark:text-blue-100 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-indigo-600" />
            Analisis Gap Kurikulum — AI
          </h1>
          <p className="text-muted-foreground">
            Powered by Claude AI · Berdasarkan standar OBE & BAN-PT
          </p>
        </div>
        <EmptyState
          icon={Sparkles}
          title="Belum ada pemetaan"
          description="Pastikan data Mata Kuliah dan CPL telah diisi sebelum menjalankan analisis."
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-blue-900 dark:text-blue-100 flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-indigo-600" />
          Analisis Gap Kurikulum — AI
        </h1>
        <p className="text-muted-foreground">
          Powered by Claude AI · Berdasarkan standar OBE & BAN-PT
        </p>
      </div>
      
      <AiAnalysisClient />
    </div>
  )
}
