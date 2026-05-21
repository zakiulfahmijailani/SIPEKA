"use client"

import React, { useMemo } from "react"
import { Check } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface SebaranCplClientProps {
  cpls: any[]
  mks: any[]
  mappings: any[]
  summaries: any[]
}

export function SebaranCplClient({ cpls, mks, mappings, summaries }: SebaranCplClientProps) {
  // Helpers
  const getDomainStyle = (domain: string) => {
    switch (domain) {
      case "SIKAP":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "PENGETAHUAN":
        return "bg-green-50 text-green-700 border-green-200"
      case "KETERAMPILAN_UMUM":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case "KETERAMPILAN_KHUSUS":
        return "bg-orange-50 text-orange-700 border-orange-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const getDomainLabel = (domain: string) => {
    switch (domain) {
      case "SIKAP": return "Sikap"
      case "PENGETAHUAN": return "Pengetahuan"
      case "KETERAMPILAN_UMUM": return "Keterampilan Umum"
      case "KETERAMPILAN_KHUSUS": return "Keterampilan Khusus"
      default: return domain
    }
  }

  // Pre-compute maps
  const mappingMap = useMemo(() => {
    const map = new Map<string, boolean>()
    for (const m of mappings) {
      map.set(`${m.mk_id}-${m.cpl_id}`, true)
    }
    return map
  }, [mappings])

  const summaryMap = useMemo(() => {
    const map = new Map<string, number>()
    for (const s of summaries) {
      map.set(s.cpl_id, Number(s.jumlahMK))
    }
    return map
  }, [summaries])

  // Group MKs by semester
  const mksBySemester = useMemo(() => {
    const map = new Map<number, any[]>()
    for (const mk of mks) {
      const sem = mk.semester_rekomendasi
      if (!map.has(sem)) map.set(sem, [])
      map.get(sem)?.push(mk)
    }
    return map
  }, [mks])

  const semesters = Array.from(mksBySemester.keys()).sort((a, b) => a - b)

  return (
    <Tabs defaultValue="heatmap" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="heatmap">Heatmap Matriks</TabsTrigger>
        <TabsTrigger value="ringkasan">Ringkasan per CPL</TabsTrigger>
        <TabsTrigger value="semester">Sebaran per Semester</TabsTrigger>
      </TabsList>

      {/* TAB 1: HEATMAP MATRIKS */}
      <TabsContent value="heatmap" className="mt-0">
        <Card className="rounded-lg shadow-sm border-gray-200">
          <CardContent className="p-0">
            <div className="overflow-x-auto scroll-smooth rounded-lg max-h-[700px] overflow-y-auto">
              <table className="w-full min-w-max border-collapse text-sm">
                <thead className="sticky top-0 z-20 shadow-sm">
                  <tr className="bg-white">
                    <th className="sticky left-0 z-30 min-w-[250px] border-b border-r border-gray-200 bg-white px-4 py-3 text-left font-semibold text-gray-700 shadow-[1px_0_0_0_#e5e7eb]">
                      Mata Kuliah
                    </th>
                    {cpls.map((c) => (
                      <th 
                        key={c.id}
                        className={cn(
                          "border-b border-r border-gray-200 px-3 py-3 text-center min-w-[60px]",
                          getDomainStyle(c.domain).replace('border-', '') // keep bg and text color
                        )}
                        title={c.rumusan}
                      >
                        <div className="font-bold">{c.kode.split("/")[0]}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {semesters.map((sem) => (
                    <React.Fragment key={`sem-${sem}`}>
                      <tr className="bg-gray-50/80">
                        <td 
                          colSpan={cpls.length + 1} 
                          className="border-b border-gray-200 px-4 py-2 font-semibold text-gray-700 sticky left-0 z-10"
                        >
                          Semester {sem}
                        </td>
                      </tr>
                      {mksBySemester.get(sem)?.map((mk) => (
                        <tr key={mk.id} className="hover:bg-gray-50/50">
                          <td className="sticky left-0 z-10 border-b border-r border-gray-200 bg-white px-4 py-2 font-medium text-gray-800 shadow-[1px_0_0_0_#e5e7eb] group-hover:bg-gray-50">
                            {mk.nama_id}
                          </td>
                          {cpls.map((c) => {
                            const isMapped = mappingMap.has(`${mk.id}-${c.id}`)
                            return (
                              <td 
                                key={`${mk.id}-${c.id}`} 
                                className="border-b border-r border-gray-200 px-2 py-2 text-center"
                              >
                                {isMapped ? (
                                  <Check className="h-5 w-5 mx-auto text-green-600" />
                                ) : null}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* TAB 2: RINGKASAN PER CPL */}
      <TabsContent value="ringkasan" className="mt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cpls.map((c) => {
            const count = summaryMap.get(c.id) || 0
            const percentage = mks.length > 0 ? Math.round((count / mks.length) * 100) : 0
            
            return (
              <Card key={c.id} className="shadow-sm border-gray-200">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start gap-4">
                    <CardTitle className="text-lg font-bold">{c.kode}</CardTitle>
                    <Badge variant="outline" className={cn(getDomainStyle(c.domain))}>
                      {getDomainLabel(c.domain)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4" title={c.rumusan}>
                    {c.rumusan}
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Mata Kuliah Pendukung</span>
                      <span className="font-medium">{count} / {mks.length} MK</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </TabsContent>

      {/* TAB 3: SEBARAN PER SEMESTER */}
      <TabsContent value="semester" className="mt-0">
        <div className="space-y-6">
          {semesters.map((sem) => (
            <Card key={`tab3-sem-${sem}`} className="shadow-sm border-gray-200">
              <CardHeader className="bg-gray-50/50 pb-3 border-b">
                <CardTitle className="text-lg">Semester {sem}</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {mksBySemester.get(sem)?.map((mk) => {
                  // Find supported CPLs for this MK
                  const supportedCpls = cpls.filter(c => mappingMap.has(`${mk.id}-${c.id}`))
                  
                  return (
                    <div key={`tab3-mk-${mk.id}`} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 pb-4 border-b last:border-0 last:pb-0">
                      <div className="w-full sm:w-1/3 md:w-1/4 font-medium text-gray-800">
                        {mk.nama_id}
                      </div>
                      <div className="flex-1 flex flex-wrap gap-1.5">
                        {supportedCpls.length > 0 ? (
                          supportedCpls.map(c => (
                            <Badge 
                              key={c.id} 
                              variant="outline" 
                              className={cn("text-xs font-normal", getDomainStyle(c.domain))}
                              title={c.rumusan}
                            >
                              {c.kode.split("/")[0]}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-gray-400 italic">Belum dipetakan</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  )
}
