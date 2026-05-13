"use client"

import { useState, useEffect } from "react"
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Cell, ReferenceLine,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileDown, Loader2, CheckCircle2, XCircle, Target, BarChart2 } from "lucide-react"
import { calculateCplAttainment } from "./actions"
import { toast } from "sonner"
import ExcelJS from "exceljs"
import { saveAs } from "file-saver"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { LaporanEmpty, LaporanNoDataEmpty } from "@/components/empty-states"
import { cn } from "@/lib/utils"

const STATUS_TARGET = 75 // % mahasiswa harus lulus

// Warna berdasarkan apakah passRate >= target
function barColor(passRate: number) {
  return passRate >= STATUS_TARGET ? "#16a34a" : "#ef4444"
}

export default function CplAttainmentClient({ tas }: { tas: any[] }) {
  const [taId, setTaId] = useState(tas.find(t => t.is_active)?.id || tas[0]?.id)
  const [angkatan, setAngkatan] = useState<string>("ALL")
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    if (!taId) return
    const fetchData = async () => {
      setIsLoading(true)
      const res = await calculateCplAttainment({
        taIds: [taId],
        angkatan: angkatan !== "ALL" ? parseInt(angkatan) : undefined
      })
      if (res.success) {
        setData(res.data)
      } else {
        toast.error(res.error)
      }
      setIsLoading(false)
    }
    fetchData()
  }, [taId, angkatan])

  const handleExportExcel = async () => {
    if (!data) return
    setIsExporting(true)
    try {
      const workbook = new ExcelJS.Workbook()
      const summarySheet = workbook.addWorksheet("Ringkasan Attainment")
      summarySheet.columns = [
        { header: "Kode CPL", key: "kode", width: 15 },
        { header: "Rumusan", key: "rumusan", width: 50 },
        { header: "Target (%)", key: "target", width: 15 },
        { header: "Capaian (%)", key: "capaian", width: 15 },
        { header: "Rata-rata Skor", key: "avgScore", width: 15 },
        { header: "Status", key: "status", width: 10 },
      ]
      data.tableData.forEach((row: any) => summarySheet.addRow(row))
      summarySheet.getRow(1).font = { bold: true }
      summarySheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF3F4F6" } }

      const mkSheet = workbook.addWorksheet("Detail per MK")
      mkSheet.columns = [
        { header: "ID MK", key: "mkId", width: 20 },
        { header: "CPL", key: "cplId", width: 15 },
        { header: "Rata-rata Skor", key: "avgScore", width: 20 },
        { header: "Jumlah Mahasiswa", key: "studentCount", width: 20 },
      ]
      Object.entries(data.mkContribution).forEach(([mkId, cpls]: [string, any]) => {
        Object.entries(cpls).forEach(([cplId, stats]: [string, any]) => {
          mkSheet.addRow({
            mkId,
            cplId,
            avgScore: parseFloat((stats.avgScore / stats.studentCount).toFixed(2)),
            studentCount: stats.studentCount
          })
        })
      })

      const buffer = await workbook.xlsx.writeBuffer()
      saveAs(
        new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
        `laporan-cpl-attainment-${taId}.xlsx`
      )
      toast.success("Excel berhasil diunduh")
    } catch (error) {
      console.error(error)
      toast.error("Gagal mengekspor Excel")
    } finally {
      setIsExporting(false)
    }
  }

  const angkatanList = [2020, 2021, 2022, 2023, 2024]

  // ── Loading State ──
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 gap-2 text-gray-400">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Menghitung data ketercapaian...</span>
      </div>
    )
  }

  // ── Empty / Error State ──
  if (!data) return <LaporanNoDataEmpty />

  // Summary numbers untuk mini KPI tiles di atas chart
  const totalCpl = data.tableData.length
  const tercapai = data.tableData.filter((r: any) => r.capaian >= r.target).length
  const avgCapaian = totalCpl > 0
    ? (data.tableData.reduce((a: any, b: any) => a + b.capaian, 0) / totalCpl).toFixed(1)
    : "0.0"

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">CPL Attainment Report</h1>
          <p className="text-sm text-gray-500 mt-0.5">Analisis ketercapaian Capaian Pembelajaran Lulusan (OBE)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={handleExportExcel} disabled={isExporting}>
            {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
            Export Excel
          </Button>
          <Button size="sm" variant="outline" className="gap-2" onClick={() => window.print()}>
            PDF
          </Button>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-4 p-4 bg-white border border-gray-100 rounded-lg shadow-sm">
        <div className="space-y-1">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Tahun Akademik</label>
          <Select value={taId} onValueChange={(val) => setTaId(val || "")}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Pilih TA" />
            </SelectTrigger>
            <SelectContent>
              {tas.map(t => (
                <SelectItem key={t.id} value={t.id}>{t.nama} ({t.kode})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Angkatan</label>
          <Select value={angkatan} onValueChange={(val) => setAngkatan(val || "ALL")}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Angkatan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua</SelectItem>
              {angkatanList.map(a => (
                <SelectItem key={a} value={a.toString()}>{a}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── Mini KPI tiles ── */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border border-gray-100 shadow-sm">
          <CardContent className="px-5 py-4">
            <p className="text-[11px] uppercase font-semibold tracking-wider text-gray-400 mb-1">Total CPL</p>
            <p className="text-2xl font-bold tabular-nums text-gray-900">{totalCpl}</p>
          </CardContent>
        </Card>
        <Card className="border border-gray-100 shadow-sm">
          <CardContent className="px-5 py-4">
            <p className="text-[11px] uppercase font-semibold tracking-wider text-gray-400 mb-1">Tercapai</p>
            <p className="text-2xl font-bold tabular-nums text-green-600">{tercapai}</p>
            <p className="text-[11px] text-gray-400">dari {totalCpl} CPL</p>
          </CardContent>
        </Card>
        <Card className="border border-gray-100 shadow-sm">
          <CardContent className="px-5 py-4">
            <p className="text-[11px] uppercase font-semibold tracking-wider text-gray-400 mb-1">Rata-rata</p>
            <p className={cn("text-2xl font-bold tabular-nums", parseFloat(avgCapaian) >= 75 ? "text-green-600" : "text-red-500")}>
              {avgCapaian}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Charts: Radar + Bar ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Radar */}
        <Card className="border border-gray-100 shadow-sm">
          <CardHeader className="px-5 pt-5 pb-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-gray-400" />
              <CardTitle className="text-sm font-semibold text-gray-700">Profil CPL (Radar)</CardTitle>
            </div>
            <CardDescription className="text-[11px]">Distribusi rata-rata nilai per CPL</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px] px-5 pb-5">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data.chartData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#9ca3af", fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Attainment"
                  dataKey="attainment"
                  stroke="#374151"
                  fill="#374151"
                  fillOpacity={0.1}
                  strokeWidth={1.5}
                />
                <Tooltip
                  contentStyle={{ border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12 }}
                  formatter={(val: any) => [`${val}%`, "Attainment"]}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Horizontal bar — passRate vs target */}
        <Card className="border border-gray-100 shadow-sm">
          <CardHeader className="px-5 pt-5 pb-2">
            <div className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-gray-400" />
              <CardTitle className="text-sm font-semibold text-gray-700">Ketercapaian Target</CardTitle>
            </div>
            <CardDescription className="text-[11px]">% mahasiswa lulus (target: {STATUS_TARGET}%)</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px] px-5 pb-5">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.chartData} layout="vertical" margin={{ left: 8, right: 32 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="#f3f4f6" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis dataKey="subject" type="category" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} width={48} />
                <Tooltip
                  contentStyle={{ border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12 }}
                  formatter={(val: any) => [`${val}%`, "Pass Rate"]}
                />
                {/* Garis target */}
                <ReferenceLine x={STATUS_TARGET} stroke="#d1d5db" strokeDasharray="4 4" label={{ value: `Target ${STATUS_TARGET}%`, position: "insideTopRight", fontSize: 10, fill: "#9ca3af" }} />
                <Bar dataKey="passRate" radius={[0, 3, 3, 0]} label={{ position: "right", fontSize: 10, fill: "#9ca3af", formatter: (v: any) => `${v}%` }}>
                  {data.chartData.map((entry: any) => (
                    <Cell key={entry.subject} fill={barColor(entry.passRate)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── Tabel Detail ── */}
      <Card className="border border-gray-100 shadow-sm overflow-hidden">
        <CardHeader className="px-5 pt-5 pb-3 border-b border-gray-100">
          <CardTitle className="text-sm font-semibold text-gray-700">Rekap per CPL</CardTitle>
          <CardDescription className="text-[11px]">Detail target vs capaian setiap Capaian Pembelajaran Lulusan</CardDescription>
        </CardHeader>
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-[100px] text-xs">Kode CPL</TableHead>
              <TableHead className="text-xs">Rumusan</TableHead>
              <TableHead className="text-center w-[110px] text-xs">Target (%)</TableHead>
              <TableHead className="text-center w-[110px] text-xs">Capaian (%)</TableHead>
              <TableHead className="text-center w-[100px] text-xs">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.tableData.map((row: any) => {
              const tercapai = row.capaian >= row.target
              return (
                <TableRow key={row.id} className="hover:bg-gray-50/50">
                  <TableCell className="font-mono text-sm font-semibold text-gray-700">{row.kode}</TableCell>
                  <TableCell className="text-sm text-gray-600 leading-relaxed max-w-[320px]">{row.rumusan}</TableCell>
                  <TableCell className="text-center text-sm tabular-nums text-gray-400">{row.target}%</TableCell>
                  <TableCell className="text-center">
                    <span className={cn(
                      "text-lg font-bold tabular-nums",
                      tercapai ? "text-green-600" : "text-red-500"
                    )}>
                      {row.capaian}%
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {tercapai
                      ? <Badge className="bg-green-50 text-green-700 border-green-100 gap-1 text-xs">
                          <CheckCircle2 className="h-3 w-3" /> Tercapai
                        </Badge>
                      : <Badge variant="outline" className="text-red-500 border-red-100 gap-1 text-xs">
                          <XCircle className="h-3 w-3" /> Belum
                        </Badge>
                    }
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
