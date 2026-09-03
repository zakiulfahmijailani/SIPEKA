"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface MappingTableProps {
  officialCreditsBySemester: Record<number, number>
  courses: {
    id: string
    code: string
    name: string
    nameEn: string | null
    creditsTheory: number
    creditsPractice: number
    semester: number
    track: string
    mappings: {
      ploCode: string
      contributionLevel: "H" | "M" | "L" | null
    }[]
  }[]
  plos: {
    id: string
    code: string
    description: string
    category: string
  }[]
}

const TRACK_STYLES: Record<string, { header: string; text: string }> = {
  UMUM: {
    header: "bg-amber-50/90 dark:bg-amber-950/20 border-amber-200/60 dark:border-amber-900/40",
    text: "text-amber-900 dark:text-amber-200",
  },
  ISG: {
    header: "bg-indigo-50/90 dark:bg-indigo-950/20 border-indigo-200/60 dark:border-indigo-900/40",
    text: "text-indigo-900 dark:text-indigo-200",
  },
  DMS: {
    header: "bg-purple-50/90 dark:bg-purple-950/20 border-purple-200/60 dark:border-purple-900/40",
    text: "text-purple-900 dark:text-purple-200",
  },
}

export function MappingTable({ courses, plos, officialCreditsBySemester }: MappingTableProps) {
  if (courses.length === 0 || plos.length === 0) {
    return (
      <Card className="rounded-lg">
        <CardContent className="flex min-h-44 items-center justify-center text-center text-sm text-muted-foreground">
          Belum ada data pemetaan. Upload file ODS untuk memulai.
        </CardContent>
      </Card>
    )
  }

  // Group courses by semester
  const coursesBySemester = courses.reduce<Map<number, MappingTableProps["courses"]>>((groups, course) => {
    const group = groups.get(course.semester) ?? []
    group.push(course)
    groups.set(course.semester, group)
    return groups
  }, new Map())

  const sortedSemesters = Array.from(coursesBySemester.keys()).sort((a, b) => a - b)
  
  // Create a flat array of courses ordered by semester and code
  const orderedCourses = sortedSemesters.flatMap((sem) => coursesBySemester.get(sem) ?? [])

  return (
    <Card className="rounded-lg border shadow-sm">
      <CardContent className="p-0">
        <div className="overflow-x-auto scroll-smooth rounded-lg">
          <table className="w-full min-w-max border-collapse text-sm">
            <thead>
              {/* Row 1: Semester Headers */}
              <tr className="h-9">
                <th
                  rowSpan={2}
                  className="sticky left-0 top-0 z-30 w-96 min-w-[24rem] max-w-[24rem] border-b border-r border-gray-200 bg-gray-100 px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wider text-gray-700 shadow-[1px_0_0_0_#e5e7eb] dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:shadow-[1px_0_0_0_#1f2937]"
                >
                  Mata Kuliah / CPL
                </th>
                {sortedSemesters.map((semester) => {
                  const semCourses = coursesBySemester.get(semester) ?? []
                  if (semCourses.length === 0) return null
                  const offeredCredits = semCourses.reduce(
                    (sum, c) => sum + c.creditsTheory + c.creditsPractice,
                    0
                  )
                  const officialCredits = officialCreditsBySemester[semester] ?? offeredCredits
                  return (
                    <th
                      key={`sem-header-${semester}`}
                      colSpan={semCourses.length}
                      className="sticky top-0 z-20 border-b border-r border-blue-100 bg-blue-50/90 px-3 py-1.5 text-center text-xs font-bold text-blue-900 uppercase tracking-wider dark:border-blue-950/40 dark:bg-blue-950/40 dark:text-blue-200"
                    >
                      Semester {semester} ({officialCredits} SKS
                      {offeredCredits > officialCredits ? ` · ${offeredCredits} SKS ditawarkan` : ""})
                    </th>
                  )
                })}
              </tr>
              {/* Row 2: Course Column Headers */}
              <tr>
                {orderedCourses.map((course) => {
                  const styles = TRACK_STYLES[course.track] ?? {
                    header: "bg-muted border-border",
                    text: "text-muted-foreground",
                  }
                  return (
                    <th
                      key={course.id}
                      className={cn(
                        "sticky top-9 z-20 w-44 min-w-[11rem] max-w-[11rem] border-b border-r px-3 py-3 text-center font-medium transition-colors",
                        styles.header
                      )}
                    >
                      <div className={cn("text-[9px] font-bold tracking-wider uppercase opacity-85", styles.text)}>
                        {course.code}
                      </div>
                      <div className="mt-1 text-xs font-bold leading-snug text-gray-900 dark:text-gray-100 line-clamp-2 min-h-[2rem]" title={course.name}>
                        {course.name}
                      </div>
                      {course.nameEn && (
                        <div className="mt-0.5 text-[9px] italic leading-tight text-gray-500 dark:text-gray-400 line-clamp-1" title={course.nameEn}>
                          {course.nameEn}
                        </div>
                      )}
                      <div className={cn("mt-1.5 text-[9px] font-semibold opacity-75", styles.text)}>
                        {course.creditsTheory + course.creditsPractice} SKS ({course.creditsTheory}T · {course.creditsPractice}P)
                      </div>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {plos.map((plo) => {
                return (
                  <tr key={plo.id} className="group hover:bg-muted/30">
                    {/* Sticky Column: CPL Info */}
                    <td className="sticky left-0 z-10 w-96 min-w-[24rem] max-w-[24rem] border-b border-r border-gray-200 bg-white px-4 py-4 shadow-[1px_0_0_0_#e5e7eb] group-hover:bg-gray-50/80 dark:border-gray-800 dark:bg-slate-950 dark:shadow-[1px_0_0_0_#1f2937] dark:group-hover:bg-slate-900/80">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/10 dark:bg-emerald-950/40 dark:text-emerald-400 dark:ring-emerald-500/20">
                          {plo.code}
                        </span>
                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 ring-1 ring-inset ring-blue-600/10 dark:bg-blue-950/40 dark:text-blue-400 dark:ring-blue-500/20">
                          {plo.category}
                        </span>
                      </div>
                      <div className="mt-2 text-xs leading-relaxed text-gray-600 dark:text-gray-300 font-medium whitespace-normal">
                        {plo.description}
                      </div>
                    </td>

                    {/* Mapped cells */}
                    {orderedCourses.map((course) => {
                      const isMapped = course.mappings.some((m) => m.ploCode === plo.code)
                      return (
                        <td
                          key={`${plo.id}-${course.id}`}
                          className={cn(
                            "border-b border-r border-border px-3 py-4 text-center transition-colors w-44 min-w-[11rem] max-w-[11rem]",
                            isMapped
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                              : "bg-transparent text-muted-foreground/20"
                          )}
                        >
                          {isMapped ? (
                            <span className="text-base font-bold">✓</span>
                          ) : (
                            <span className="text-[10px] opacity-20">—</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
