import { CalendarDays } from "lucide-react"

import { DocumentCourseList } from "@/components/rps/document-course-list"
import { getCurrentSession } from "@/lib/current-session"
import { listLecturerDocuments } from "@/lib/rps-documents"
import { redirect } from "next/navigation"
import { getAcademicTermContext } from "@/lib/academic-term"

export const dynamic = "force-dynamic"

export default async function RpmPage() {
  const session = await getCurrentSession()
  if (!session?.user) redirect("/login")
  const period = await getAcademicTermContext()
  const courses = await listLecturerDocuments(session.user.id, session.user.role, period.term?.id)

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          <CalendarDays className="h-5 w-5" />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-bold tracking-tight text-blue-950">Rubrik Penilaian Mahasiswa</h1><span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">{period.label}</span></div>
          <p className="text-sm text-muted-foreground">RPM terbentuk otomatis dari asesmen dan rubrik pada RPS.</p>
        </div>
      </div>
      <DocumentCourseList courses={courses} kind="rpm" />
    </div>
  )
}
