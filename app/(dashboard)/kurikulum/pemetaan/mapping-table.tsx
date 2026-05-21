"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface MappingTableProps {
  courses: {
    id: string
    code: string
    name: string
    creditsTheory: number
    creditsPractice: number
    semester: number
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

const LEVEL_STYLES = {
  H: "border-emerald-500/30 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  M: "border-amber-500/30 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  L: "border-muted-foreground/20 bg-muted text-muted-foreground",
} as const

const DOT_STYLES = {
  H: "bg-emerald-500",
  M: "bg-amber-500",
  L: "bg-muted-foreground",
} as const

export function MappingTable({ courses, plos }: MappingTableProps) {
  if (courses.length === 0 || plos.length === 0) {
    return (
      <Card className="rounded-lg">
        <CardContent className="flex min-h-44 items-center justify-center text-center text-sm text-muted-foreground">
          Belum ada data pemetaan. Upload file ODS untuk memulai.
        </CardContent>
      </Card>
    )
  }

  const coursesBySemester = courses.reduce<Map<number, MappingTableProps["courses"]>>((groups, course) => {
    const group = groups.get(course.semester) ?? []
    group.push(course)
    groups.set(course.semester, group)
    return groups
  }, new Map())

  const sortedSemesters = Array.from(coursesBySemester.keys()).sort((a, b) => a - b)
  const columnCount = plos.length + 3

  return (
    <Card className="rounded-lg">
      <CardContent>
        <div className="overflow-x-auto scroll-smooth rounded-lg border border-border">
          <table className="w-full min-w-max border-collapse text-sm">
            <thead>
              <tr className="bg-muted/80 text-left text-xs uppercase text-muted-foreground">
                <th className="sticky left-0 top-0 z-30 min-w-28 border-b border-r border-border bg-muted px-3 py-3">
                  Kode MK
                </th>
                <th className="sticky top-0 z-20 min-w-72 border-b border-r border-border bg-muted px-3 py-3">
                  Mata Kuliah
                </th>
                <th className="sticky top-0 z-20 min-w-20 border-b border-r border-border bg-muted px-3 py-3 text-center">
                  SKS
                </th>
                {plos.map((plo) => (
                  <th
                    key={plo.id}
                    className="sticky top-0 z-20 min-w-24 border-b border-r border-border bg-muted px-3 py-3 text-center"
                    title={plo.description}
                  >
                    <div className="font-semibold text-foreground">{plo.code}</div>
                    <div className="mt-1 max-w-24 truncate normal-case text-muted-foreground">{plo.category}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedSemesters.map((semester) => {
                const group = coursesBySemester.get(semester) ?? []
                const totalCredits = group.reduce(
                  (total, course) => total + course.creditsTheory + course.creditsPractice,
                  0
                )

                return (
                  <>
                    <tr key={`semester-${semester}`} className="bg-card">
                      <td
                        colSpan={columnCount}
                        className="border-b border-border bg-secondary/70 px-3 py-2 font-medium text-secondary-foreground dark:bg-secondary/40"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <span>Semester {semester}</span>
                          <span className="text-sm text-muted-foreground">Total SKS: {totalCredits}</span>
                        </div>
                      </td>
                    </tr>
                    {group.map((course) => {
                      const mappingByPlo = new Map(
                        course.mappings.map((mapping) => [mapping.ploCode, mapping.contributionLevel])
                      )
                      const credits = course.creditsTheory + course.creditsPractice

                      return (
                        <tr key={course.id} className="bg-card hover:bg-muted/40">
                          <td className="sticky left-0 z-10 border-b border-r border-border bg-card px-3 py-3 font-medium text-foreground group-hover:bg-muted">
                            {course.code}
                          </td>
                          <td className="max-w-80 border-b border-r border-border px-3 py-3">
                            <div className="font-medium text-foreground">{course.name}</div>
                            <div className="text-xs text-muted-foreground">
                              Teori {course.creditsTheory} · Praktik {course.creditsPractice}
                            </div>
                          </td>
                          <td className="border-b border-r border-border px-3 py-3 text-center font-medium">
                            {credits}
                          </td>
                          {plos.map((plo) => {
                            const level = mappingByPlo.get(plo.code) ?? null
                            return (
                              <td
                                key={`${course.id}-${plo.id}`}
                                className="border-b border-r border-border px-3 py-3 text-center"
                              >
                                {level ? (
                                  <Badge
                                    variant="outline"
                                    className={cn("gap-1.5 border", LEVEL_STYLES[level])}
                                  >
                                    <span className={cn("size-2 rounded-full", DOT_STYLES[level])} />
                                    {level}
                                  </Badge>
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )}
                              </td>
                            )
                          })}
                        </tr>
                      )
                    })}
                  </>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
