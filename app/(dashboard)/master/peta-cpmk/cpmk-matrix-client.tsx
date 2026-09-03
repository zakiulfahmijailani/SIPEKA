"use client"

import { useState, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Search,
  BookOpen,
  Target,
  Layers,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Info,
  CheckCircle2,
  ListTree,
  Table as TableIcon,
  HelpCircle,
} from "lucide-react"

import type { Curriculum2026Course } from "@/db/curriculum-2026"
import type { Curriculum2026Cpl } from "@/db/curriculum-2026-reference"
import type {
  Curriculum2026Cpmk,
  Curriculum2026SubCpmk,
  Curriculum2026MkCpmkMapping,
} from "@/db/cpmk-2026-reference"

interface CpmkMatrixClientProps {
  courses: Curriculum2026Course[]
  cpls: Curriculum2026Cpl[]
  cpmks: Curriculum2026Cpmk[]
  subCpmks: Curriculum2026SubCpmk[]
  mappings: Curriculum2026MkCpmkMapping[]
}

const DOMAIN_STYLES: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  SIKAP: {
    bg: "bg-blue-50 border-blue-200 text-blue-800",
    text: "text-blue-700",
    dot: "bg-blue-500",
    label: "Sikap",
  },
  PENGETAHUAN: {
    bg: "bg-emerald-50 border-emerald-200 text-emerald-800",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    label: "Pengetahuan",
  },
  KETERAMPILAN_UMUM: {
    bg: "bg-amber-50 border-amber-200 text-amber-800",
    text: "text-amber-700",
    dot: "bg-amber-500",
    label: "Keterampilan Umum",
  },
  KETERAMPILAN_KHUSUS: {
    bg: "bg-purple-50 border-purple-200 text-purple-800",
    text: "text-purple-700",
    dot: "bg-purple-500",
    label: "Keterampilan Khusus",
  },
}

export function CpmkMatrixClient({
  courses,
  cpls,
  cpmks,
  subCpmks,
  mappings,
}: CpmkMatrixClientProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSemester, setSelectedSemester] = useState<string>("ALL")
  const [selectedTrack, setSelectedTrack] = useState<string>("ALL")
  const [selectedCourseForDetail, setSelectedCourseForDetail] = useState<Curriculum2026Course | null>(null)
  const [expandedCpls, setExpandedCpls] = useState<Record<string, boolean>>({ CPL01: true, CPL03: true })
  const [expandedCpmks, setExpandedCpmks] = useState<Record<string, boolean>>({})

  // Indexing for rapid lookups
  const cpmkByCode = useMemo(() => {
    const map = new Map<string, Curriculum2026Cpmk>()
    for (const c of cpmks) map.set(c.kode, c)
    return map
  }, [cpmks])

  const cplByCode = useMemo(() => {
    const map = new Map<string, Curriculum2026Cpl>()
    for (const c of cpls) map.set(c.kode, c)
    return map
  }, [cpls])

  // Mapping lookup: mk_kode -> cpl_kode -> array of mappings
  const matrixLookup = useMemo(() => {
    const map = new Map<string, Map<string, Curriculum2026MkCpmkMapping[]>>()
    for (const m of mappings) {
      if (!map.has(m.kode_mk)) {
        map.set(m.kode_mk, new Map())
      }
      const courseMap = map.get(m.kode_mk)!
      if (!courseMap.has(m.cpl_kode)) {
        courseMap.set(m.cpl_kode, [])
      }
      courseMap.get(m.cpl_kode)!.push(m)
    }
    return map
  }, [mappings])

  // Mappings per course
  const mappingsByCourse = useMemo(() => {
    const map = new Map<string, Curriculum2026MkCpmkMapping[]>()
    for (const m of mappings) {
      if (!map.has(m.kode_mk)) map.set(m.kode_mk, [])
      map.get(m.kode_mk)!.push(m)
    }
    return map
  }, [mappings])

  // CPMK to courses lookup
  const coursesByCpmk = useMemo(() => {
    const map = new Map<string, Set<string>>()
    for (const m of mappings) {
      if (!map.has(m.cpmk_kode)) map.set(m.cpmk_kode, new Set())
      map.get(m.cpmk_kode)!.add(m.kode_mk)
    }
    return map
  }, [mappings])

  // Filtered courses
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      if (selectedSemester !== "ALL" && c.semester_rekomendasi.toString() !== selectedSemester) {
        return false
      }
      if (selectedTrack !== "ALL") {
        if (selectedTrack === "WAJIB" && c.status !== "WAJIB") return false
        if (selectedTrack === "ISG" && c.track !== "ISG") return false
        if (selectedTrack === "DMS" && c.track !== "DMS") return false
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchesCode = c.kode.toLowerCase().includes(query)
        const matchesName = c.nama_id.toLowerCase().includes(query)
        const courseMaps = mappingsByCourse.get(c.kode) || []
        const matchesCpmk = courseMaps.some(
          (m) =>
            m.cpmk_kode.toLowerCase().includes(query) ||
            m.sub_kode.toLowerCase().includes(query) ||
            m.uraian.toLowerCase().includes(query)
        )
        return matchesCode || matchesName || matchesCpmk
      }
      return true
    })
  }, [courses, selectedSemester, selectedTrack, searchQuery, mappingsByCourse])

  // Statistics
  const stats = useMemo(() => {
    const totalCpl = cpls.length
    const totalCpmk = cpmks.length
    const totalSubCpmk = subCpmks.length
    const mappedMkCodes = new Set(mappings.map((m) => m.kode_mk))
    return {
      totalCpl,
      totalCpmk,
      totalSubCpmk,
      totalMappedMk: mappedMkCodes.size,
    }
  }, [cpls, cpmks, subCpmks, mappings])

  const toggleCplExpand = (cplKode: string) => {
    setExpandedCpls((prev) => ({ ...prev, [cplKode]: !prev[cplKode] }))
  }

  const toggleCpmkExpand = (cpmkKode: string) => {
    setExpandedCpmks((prev) => ({ ...prev, [cpmkKode]: !prev[cpmkKode] }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Peta Capaian Pembelajaran Mata Kuliah (CPMK)
            </h1>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 font-semibold border-blue-200">
              Kurikulum 2026
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Matriks integrasi hierarki CPL, CPMK, dan Sub-CPMK ke dalam seluruh Mata Kuliah Program Studi S1 Sistem Informasi.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="border shadow-xs bg-linear-to-br from-blue-50/50 to-white">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-100 text-blue-700">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Standar CPL</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalCpl} CPL</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-xs bg-linear-to-br from-emerald-50/50 to-white">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-700">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Rumusan CPMK</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalCpmk} CPMK</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-xs bg-linear-to-br from-purple-50/50 to-white">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-purple-100 text-purple-700">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Uraian Sub-CPMK</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalSubCpmk} Sub-CPMK</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-xs bg-linear-to-br from-amber-50/50 to-white">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-100 text-amber-700">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">MK Terpetakan</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalMappedMk} / {courses.length} MK</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="matrix" className="w-full space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <TabsList className="bg-slate-100 dark:bg-slate-900">
            <TabsTrigger value="matrix" className="flex items-center gap-2">
              <TableIcon className="h-4 w-4" />
              <span>Matriks Global (MK × CPL/CPMK)</span>
            </TabsTrigger>
            <TabsTrigger value="taxonomy" className="flex items-center gap-2">
              <ListTree className="h-4 w-4" />
              <span>Pohon Taksonomi CPL–CPMK</span>
            </TabsTrigger>
            <TabsTrigger value="cpmk-list" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>Katalog 34 CPMK</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TAB 1: MATRIKS GLOBAL */}
        <TabsContent value="matrix" className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-lg border">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari Mata Kuliah, CPMK (mis: CPMK6), atau kata kunci..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>

            <select
              className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
            >
              <option value="ALL">Semua Semester</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s.toString()}>
                  Semester {s}
                </option>
              ))}
            </select>

            <select
              className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
              value={selectedTrack}
              onChange={(e) => setSelectedTrack(e.target.value)}
            >
              <option value="ALL">Semua Status & Peminatan</option>
              <option value="WAJIB">Hanya Wajib</option>
              <option value="ISG">Pilihan ISG</option>
              <option value="DMS">Pilihan DMS</option>
            </select>

            {(searchQuery || selectedSemester !== "ALL" || selectedTrack !== "ALL") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("")
                  setSelectedSemester("ALL")
                  setSelectedTrack("ALL")
                }}
                className="text-xs h-9"
              >
                Reset Filter
              </Button>
            )}
          </div>

          {/* Matrix Table */}
          <div className="border rounded-lg bg-white overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b">
                    <th
                      className="p-3 text-left font-semibold text-slate-700 min-w-[260px] sticky left-0 bg-slate-50 z-20 border-r"
                      rowSpan={2}
                    >
                      Mata Kuliah Kurikulum
                    </th>
                    <th className="p-2 text-center font-semibold text-slate-700 w-16 border-r" rowSpan={2}>
                      SKS
                    </th>
                    <th className="p-2 text-center font-semibold text-slate-700 w-14 border-r" rowSpan={2}>
                      Smt
                    </th>
                    <th
                      className="p-2 text-center font-semibold text-slate-700 border-b"
                      colSpan={cpls.length}
                    >
                      Capaian Pembelajaran Lulusan (CPL) &amp; Capaian Pembelajaran Mata Kuliah (CPMK)
                    </th>
                    <th className="p-3 text-center font-semibold text-slate-700 min-w-[90px]" rowSpan={2}>
                      Total Sub
                    </th>
                  </tr>
                  <tr className="bg-slate-50/80 border-b">
                    {cpls.map((cpl) => {
                      const domain = DOMAIN_STYLES[cpl.domain] || { dot: "bg-slate-400" }
                      return (
                        <th
                          key={cpl.kode}
                          className="p-2 text-center border-r min-w-[70px] hover:bg-slate-100 transition-colors"
                          title={`${cpl.kode} (${cpl.kategori}): ${cpl.rumusan}`}
                        >
                          <div className="flex flex-col items-center gap-1">
                            <span className="font-bold text-slate-800">{cpl.kode}</span>
                            <div className={`w-2 h-2 rounded-full ${domain.dot}`} />
                            <span className="text-[10px] text-muted-foreground font-normal">
                              {cpl.kategori}
                            </span>
                          </div>
                        </th>
                      )
                    })}
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.length > 0 ? (
                    filteredCourses.map((mk) => {
                      const courseMap = matrixLookup.get(mk.kode)
                      let totalSubsInMk = 0

                      return (
                        <tr
                          key={mk.kode}
                          className="border-b hover:bg-blue-50/40 transition-colors group cursor-pointer"
                          onClick={() => setSelectedCourseForDetail(mk)}
                        >
                          {/* Course Name & Code */}
                          <td className="p-3 sticky left-0 bg-white group-hover:bg-slate-50 z-10 border-r">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900">{mk.kode}</span>
                                {mk.status === "PILIHAN" && (
                                  <Badge
                                    variant="outline"
                                    className="text-[9px] px-1 py-0 border-amber-300 text-amber-800 bg-amber-50"
                                  >
                                    {mk.track}
                                  </Badge>
                                )}
                              </div>
                              <span
                                className="font-medium text-slate-700 text-xs truncate max-w-[240px]"
                                title={mk.nama_id}
                              >
                                {mk.nama_id}
                              </span>
                            </div>
                          </td>

                          {/* SKS */}
                          <td className="p-2 text-center border-r font-medium text-slate-600">
                            {mk.sks_teori + mk.sks_praktik}
                          </td>

                          {/* Semester */}
                          <td className="p-2 text-center border-r font-medium text-slate-600">
                            {mk.semester_rekomendasi}
                          </td>

                          {/* CPL Columns */}
                          {cpls.map((cpl) => {
                            const mappingsInCell = courseMap?.get(cpl.kode) || []
                            const hasMapping = mappingsInCell.length > 0
                            if (hasMapping) totalSubsInMk += mappingsInCell.length

                            // Unique CPMK in this cell
                            const uniqueCpmkInCell = Array.from(
                              new Set(mappingsInCell.map((m) => m.cpmk_kode))
                            )

                            return (
                              <td
                                key={cpl.kode}
                                className={`p-1.5 text-center border-r align-middle transition-colors ${
                                  hasMapping ? "bg-emerald-50/50" : ""
                                }`}
                              >
                                {hasMapping ? (
                                  <div
                                    className="inline-flex flex-col items-center justify-center p-1 rounded-md bg-emerald-100/80 text-emerald-800 border border-emerald-300/70 hover:bg-emerald-200 transition-colors w-full"
                                    title={`${uniqueCpmkInCell.join(", ")} (${mappingsInCell.length} Sub-CPMK)\nKlik baris untuk rincian`}
                                  >
                                    <span className="font-bold text-[10px]">
                                      {uniqueCpmkInCell.join(",")}
                                    </span>
                                    <span className="text-[9px] text-emerald-700 font-medium">
                                      {mappingsInCell.length} sub
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-slate-300 text-xs">—</span>
                                )}
                              </td>
                            )
                          })}

                          {/* Total Sub in Row */}
                          <td className="p-2 text-center font-bold text-slate-800 bg-slate-50">
                            {totalSubsInMk > 0 ? (
                              <Badge variant="secondary" className="font-bold">
                                {totalSubsInMk}
                              </Badge>
                            ) : (
                              <span className="text-slate-400">0</span>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={cpls.length + 4} className="p-8 text-center text-muted-foreground">
                        Tidak ada mata kuliah yang cocok dengan filter.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-slate-100 border-t font-semibold text-slate-700">
                  <tr>
                    <td className="p-3 sticky left-0 bg-slate-100 z-10 border-r text-right" colSpan={3}>
                      Total Keterkaitan Sub-CPMK:
                    </td>
                    {cpls.map((cpl) => {
                      let colSubTotal = 0
                      for (const mk of filteredCourses) {
                        const cellMappings = matrixLookup.get(mk.kode)?.get(cpl.kode) || []
                        colSubTotal += cellMappings.length
                      }
                      return (
                        <td key={cpl.kode} className="p-2 text-center border-r font-bold text-slate-800">
                          {colSubTotal}
                        </td>
                      )
                    })}
                    <td className="p-2 text-center bg-slate-200 font-bold">
                      {filteredCourses.reduce((acc, mk) => {
                        const mkMaps = mappingsByCourse.get(mk.kode) || []
                        return acc + mkMaps.length
                      }, 0)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-2">
            <span className="font-semibold text-slate-700">Keterangan Domain:</span>
            {Object.entries(DOMAIN_STYLES).map(([key, style]) => (
              <div key={key} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
                <span>{style.label}</span>
              </div>
            ))}
            <div className="ml-auto text-slate-500 italic">
              💡 Klik baris mata kuliah mana saja untuk melihat uraian lengkap CPMK &amp; Sub-CPMK.
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: POHON TAKSONOMI (CPL -> CPMK -> Sub-CPMK -> MK) */}
        <TabsContent value="taxonomy" className="space-y-4">
          <div className="space-y-3">
            {cpls.map((cpl) => {
              const isExpanded = expandedCpls[cpl.kode]
              const cpmksInCpl = cpmks.filter((c) => c.cpl_kode === cpl.kode)
              const domain = DOMAIN_STYLES[cpl.domain] || { dot: "bg-slate-400", bg: "bg-slate-50", text: "text-slate-700" }

              return (
                <Card key={cpl.kode} className="border shadow-xs overflow-hidden">
                  <div
                    className={`p-4 flex items-start justify-between cursor-pointer transition-colors hover:bg-slate-50/80 ${
                      isExpanded ? "border-b bg-slate-50/50" : ""
                    }`}
                    onClick={() => toggleCplExpand(cpl.kode)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 text-muted-foreground">
                        {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-base text-slate-900">{cpl.kode}</span>
                          <Badge variant="outline" className={domain.bg}>
                            {cpl.kategori} &bull; {cpl.domain.replace("_", " ")}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {cpmksInCpl.length} CPMK
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-700 mt-1 font-medium leading-relaxed">
                          {cpl.rumusan}
                        </p>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <CardContent className="p-4 space-y-4 bg-slate-50/30">
                      {cpmksInCpl.map((cpmk) => {
                        const isCpmkExp = expandedCpmks[cpmk.kode]
                        const subsInCpmk = subCpmks.filter((s) => s.cpmk_kode === cpmk.kode)
                        const supportedMkCodes = Array.from(coursesByCpmk.get(cpmk.kode) || [])

                        return (
                          <div
                            key={cpmk.kode}
                            className="border rounded-lg bg-white overflow-hidden shadow-xs"
                          >
                            <div
                              className="p-3 bg-white hover:bg-slate-50 transition-colors cursor-pointer flex items-start justify-between"
                              onClick={() => toggleCpmkExpand(cpmk.kode)}
                            >
                              <div className="flex items-start gap-2.5">
                                <div className="mt-0.5 text-muted-foreground">
                                  {isCpmkExp ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-blue-700 text-sm">{cpmk.kode}</span>
                                    <span className="text-xs text-muted-foreground">
                                      ({subsInCpmk.length} Sub-CPMK &bull; {supportedMkCodes.length} MK terkait)
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-800 font-medium mt-0.5">
                                    {cpmk.rumusan}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {isCpmkExp && (
                              <div className="p-3 border-t bg-slate-50/60 space-y-3">
                                {/* Sub-CPMK list */}
                                <div className="space-y-2">
                                  <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                    Uraian Sub-CPMK:
                                  </p>
                                  <div className="grid gap-1.5 pl-2">
                                    {subsInCpmk.map((sub) => (
                                      <div
                                        key={sub.sub_kode}
                                        className="text-xs p-2 rounded bg-white border flex items-start gap-2"
                                      >
                                        <Badge variant="outline" className="text-[10px] font-mono shrink-0">
                                          Sub-{sub.sub_kode}
                                        </Badge>
                                        <span className="text-slate-700">{sub.uraian}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Supported Courses */}
                                <div className="space-y-1.5 pt-1">
                                  <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                    Mata Kuliah yang Memenuhi CPMK Ini:
                                  </p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {supportedMkCodes.map((code) => {
                                      const mk = courses.find((c) => c.kode === code)
                                      return (
                                        <Badge
                                          key={code}
                                          variant="secondary"
                                          className="cursor-pointer hover:bg-slate-200"
                                          onClick={() => mk && setSelectedCourseForDetail(mk)}
                                        >
                                          {code} {mk ? `- ${mk.nama_id}` : ""}
                                        </Badge>
                                      )
                                    })}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </CardContent>
                  )}
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* TAB 3: KATALOG LENGKAP 34 CPMK */}
        <TabsContent value="cpmk-list" className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {cpmks.map((cpmk) => {
              const parentCpl = cplByCode.get(cpmk.cpl_kode)
              const domain = parentCpl ? DOMAIN_STYLES[parentCpl.domain] : null
              const subs = subCpmks.filter((s) => s.cpmk_kode === cpmk.kode)
              const mks = Array.from(coursesByCpmk.get(cpmk.kode) || [])

              return (
                <Card key={cpmk.kode} className="border shadow-xs hover:border-blue-300 transition-colors">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-600 text-white font-bold">{cpmk.kode}</Badge>
                        <Badge variant="outline" className={domain?.bg}>
                          {cpmk.cpl_kode}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">
                        {subs.length} Sub-CPMK &bull; {mks.length} MK
                      </span>
                    </div>
                    <CardTitle className="text-sm font-semibold leading-snug pt-2 text-slate-900">
                      {cpmk.rumusan}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-2 space-y-2 text-xs">
                    <div className="border-t pt-2 space-y-1">
                      <span className="font-semibold text-slate-700">Sub-CPMK:</span>
                      <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
                        {subs.slice(0, 3).map((s) => (
                          <li key={s.sub_kode} className="line-clamp-2">
                            <span className="font-mono font-medium">Sub-{s.sub_kode}:</span> {s.uraian}
                          </li>
                        ))}
                        {subs.length > 3 && (
                          <li className="text-muted-foreground italic list-none pt-0.5">
                            + {subs.length - 3} Sub-CPMK lainnya...
                          </li>
                        )}
                      </ul>
                    </div>

                    <div className="border-t pt-2 flex flex-wrap gap-1">
                      <span className="font-semibold text-slate-700 mr-1">MK:</span>
                      {mks.slice(0, 5).map((code) => (
                        <Badge key={code} variant="secondary" className="text-[10px] px-1 py-0">
                          {code}
                        </Badge>
                      ))}
                      {mks.length > 5 && (
                        <span className="text-[10px] text-muted-foreground self-center">
                          +{mks.length - 5} lainnya
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* DETAIL MODAL FOR SELECTED COURSE */}
      <Dialog
        open={Boolean(selectedCourseForDetail)}
        onOpenChange={(open) => !open && setSelectedCourseForDetail(null)}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedCourseForDetail && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-sm">
                    {selectedCourseForDetail.kode}
                  </Badge>
                  <Badge variant="secondary">
                    Semester {selectedCourseForDetail.semester_rekomendasi}
                  </Badge>
                  <Badge variant="secondary">
                    {selectedCourseForDetail.sks_teori + selectedCourseForDetail.sks_praktik} SKS
                  </Badge>
                  <Badge
                    variant="outline"
                    className={
                      selectedCourseForDetail.status === "WAJIB"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }
                  >
                    {selectedCourseForDetail.status}
                    {selectedCourseForDetail.status === "PILIHAN" ? ` (${selectedCourseForDetail.track})` : ""}
                  </Badge>
                </div>
                <DialogTitle className="text-xl font-bold mt-2 text-slate-900">
                  {selectedCourseForDetail.nama_id}
                </DialogTitle>
                {selectedCourseForDetail.nama_en && (
                  <DialogDescription className="italic">
                    {selectedCourseForDetail.nama_en}
                  </DialogDescription>
                )}
              </DialogHeader>

              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between border-b pb-2">
                  <h4 className="font-semibold text-sm text-slate-900">
                    CPL &amp; CPMK yang Dibebankan pada Mata Kuliah Ini:
                  </h4>
                  <Badge variant="secondary">
                    {mappingsByCourse.get(selectedCourseForDetail.kode)?.length || 0} Sub-CPMK Terdaftar
                  </Badge>
                </div>

                {(() => {
                  const courseMaps = mappingsByCourse.get(selectedCourseForDetail.kode) || []
                  if (courseMaps.length === 0) {
                    return (
                      <div className="p-6 text-center text-sm text-muted-foreground">
                        Belum ada pemetaan CPMK khusus pada workbook untuk mata kuliah ini.
                      </div>
                    )
                  }

                  // Group mappings by CPL
                  const groupedByCpl = new Map<string, Curriculum2026MkCpmkMapping[]>()
                  for (const m of courseMaps) {
                    if (!groupedByCpl.has(m.cpl_kode)) groupedByCpl.set(m.cpl_kode, [])
                    groupedByCpl.get(m.cpl_kode)!.push(m)
                  }

                  return (
                    <div className="space-y-4">
                      {Array.from(groupedByCpl.entries()).map(([cplCode, items]) => {
                        const cpl = cplByCode.get(cplCode)
                        const domain = cpl ? DOMAIN_STYLES[cpl.domain] : null

                        // Group by CPMK
                        const groupedByCpmk = new Map<string, Curriculum2026MkCpmkMapping[]>()
                        for (const it of items) {
                          if (!groupedByCpmk.has(it.cpmk_kode)) groupedByCpmk.set(it.cpmk_kode, [])
                          groupedByCpmk.get(it.cpmk_kode)!.push(it)
                        }

                        return (
                          <div key={cplCode} className="border rounded-lg p-3.5 bg-slate-50/50 space-y-3">
                            <div className="flex items-start gap-2">
                              <Badge className="bg-slate-800 text-white">{cplCode}</Badge>
                              {domain && (
                                <Badge variant="outline" className={domain.bg}>
                                  {domain.label}
                                </Badge>
                              )}
                              <p className="text-xs text-slate-700 font-medium leading-relaxed">
                                {cpl?.rumusan}
                              </p>
                            </div>

                            <div className="space-y-2 pl-3 border-l-2 border-blue-300 ml-2">
                              {Array.from(groupedByCpmk.entries()).map(([cpmkCode, subItems]) => {
                                const cpmk = cpmkByCode.get(cpmkCode)
                                return (
                                  <div key={cpmkCode} className="space-y-1.5">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-xs text-blue-700">{cpmkCode}:</span>
                                      <span className="text-xs text-slate-800 font-medium">
                                        {cpmk?.rumusan}
                                      </span>
                                    </div>
                                    <div className="grid gap-1 pl-2">
                                      {subItems.map((sub) => (
                                        <div
                                          key={`${sub.cpmk_kode}_${sub.sub_kode}`}
                                          className="text-xs p-2 rounded bg-white border flex items-start gap-2"
                                        >
                                          <Badge variant="outline" className="text-[10px] font-mono shrink-0">
                                            Sub-{sub.sub_kode}
                                          </Badge>
                                          <span className="text-slate-700">{sub.uraian}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })()}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
