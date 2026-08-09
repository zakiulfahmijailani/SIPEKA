import Link from "next/link"
import { ArrowRight, CalendarDays, CheckCircle2, ClipboardList, FileWarning } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

type DocumentCourse = {
  id: string
  kode: string
  nama: string
  kelas: string
  dosen: string
  tahunAkademik: string
  status: string
  readiness: {
    progress: number
    issues: string[]
  }
}

export function DocumentCourseList({
  courses,
  kind,
}: {
  courses: DocumentCourse[]
  kind: "rpm" | "rtm"
}) {
  const isRpm = kind === "rpm"
  const Icon = isRpm ? CalendarDays : ClipboardList
  const label = isRpm ? "RPM" : "RTM"

  if (courses.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed bg-white py-16 text-center">
        <Icon className="mx-auto mb-3 h-9 w-9 text-gray-300" />
        <p className="font-medium text-gray-700">Belum ada mata kuliah yang diampu.</p>
        <p className="mt-1 text-sm text-gray-500">Penugasan dosen akan muncul pada periode yang dipilih di Dashboard.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {courses.map((course) => (
        <Card key={course.id} className="border-gray-100 shadow-sm">
          <CardContent className="space-y-4 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-blue-700">{course.kode} · Kelas {course.kelas}</p>
                  <h2 className="truncate font-semibold text-gray-900">{course.nama}</h2>
                  <p className="mt-0.5 truncate text-xs text-gray-500">{course.dosen} · {course.tahunAkademik}</p>
                </div>
              </div>
              <Badge variant="outline" className={course.status === "APPROVED" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}>
                {course.status === "APPROVED" ? "Disetujui" : "Draf"}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Kelengkapan sumber data</span>
                <span className="font-semibold tabular-nums">{course.readiness.progress}%</span>
              </div>
              <Progress value={course.readiness.progress} className="h-2" />
              <p className="flex items-center gap-1.5 text-xs text-gray-500">
                {course.readiness.issues.length === 0 ? (
                  <><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Dokumen siap digunakan</>
                ) : (
                  <><FileWarning className="h-3.5 w-3.5 text-amber-600" /> {course.readiness.issues[0]}</>
                )}
              </p>
            </div>

            <div className="flex justify-end">
              <Button render={<Link href={`/${kind}/${course.id}`} />} size="sm" className="gap-2">
                Buka {label} <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
