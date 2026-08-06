import { CalendarDays } from "lucide-react"

import { DocumentCourseList } from "@/components/rps/document-course-list"
import { getCurrentSession } from "@/lib/current-session"
import { listLecturerDocuments } from "@/lib/rps-documents"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function RpmPage() {
  const session = await getCurrentSession()
  if (!session?.user) redirect("/login")
  const courses = await listLecturerDocuments(session.user.id, session.user.role)

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          <CalendarDays className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-blue-950">Rencana Pembelajaran Mingguan</h1>
          <p className="text-sm text-muted-foreground">RPM terbentuk otomatis dari rencana 16 minggu pada RPS.</p>
        </div>
      </div>
      <DocumentCourseList courses={courses} kind="rpm" />
    </div>
  )
}
