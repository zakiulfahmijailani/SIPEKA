import { ClipboardList } from "lucide-react"

import { DocumentCourseList } from "@/components/rps/document-course-list"
import { getCurrentSession } from "@/lib/current-session"
import { listLecturerDocuments } from "@/lib/rps-documents"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function RtmPage() {
  const session = await getCurrentSession()
  if (!session?.user) redirect("/login")
  const courses = await listLecturerDocuments(session.user.id, session.user.role)

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
          <ClipboardList className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-blue-950">Rencana Tugas Mahasiswa</h1>
          <p className="text-sm text-muted-foreground">RTM terbentuk otomatis dari asesmen, Sub-CPMK, dan rubrik pada RPS.</p>
        </div>
      </div>
      <DocumentCourseList courses={courses} kind="rtm" />
    </div>
  )
}
