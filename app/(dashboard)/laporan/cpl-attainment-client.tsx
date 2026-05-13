"use client"

import { useState, useEffect, useMemo } from "react"
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, FileDown, Filter, Target, Loader2 } from "lucide-react"
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

export default function CplAttainmentClient({ tas }: { tas: any[] }) {
  const [taId, setTaId] = useState(tas.find(t => t.is_active)?.id || tas[0]?.id)
  const [angkatan, setAngkatan] = useState<string>("ALL")
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      const res = await calculateCplAttainment({
        taIds: taId ? [taId] : [],
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
      
      // Sheet 1: Summary
      const summarySheet = workbook.addWorksheet("Ringkasan Attainment")
      summarySheet.columns = [
        { header: "Kode CPL", key: "kode", width: 15 },
        { header: "Rumusan", key: "rumusan", width: 50 },
        { header: "Target (%)", key: "target", width: 15 },
        { header: "Capaian (%)", key: "capaian", width: 15 },
        { header: "Rata-rata Skor", key: "avgScore", width: 15 },
        { header: "Status", key: "status", width: 10 },
      ]
      
      data.tableData.forEach((row: any) => {
        summarySheet.addRow(row)
      })

      // Formatting
      summarySheet.getRow(1).font = { bold: true }
      summarySheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFDEEAF6" } }

      // Sheet 2: MK Contribution
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
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
      saveAs(blob, `laporan-cpl-attainment-${taId}.xlsx`)
      toast.success("Excel berhasil diunduh")
    } catch (error) {
      console.error(error)
      toast.error("Gagal mengekspor Excel")
    } finally {
      setIsExporting(false)
    }
  }

  const angkatanList = [2020, 2021, 2022, 2023, 2024]

  if (isLoading) return <div className="p-8 text-center">Menghitung data ketercapaian...</div>
  if (!data) return <div className="p-8 text-center text-red-500">Gagal memuat data.</div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-blue-900">CPL Attainment Report</h1>
          <p className="text-muted-foreground">Analisis ketercapaian Capaian Pembelajaran Lulusan (OBE)</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" size="sm" className="gap-2" onClick={handleExportExcel} disabled={isExporting}>
             {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
             Excel
           </Button>
           <Button size="sm" className="gap-2" onClick={() => window.print()}>
             <Download className="h-4 w-4" /> PDF
           </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 p-4 bg-white border rounded-lg shadow-sm">
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase text-gray-500">Tahun Akademik</label>
          <Select value={taId} onValueChange={(val) => setTaId(val || "")}>
            <SelectTrigger className="w-[180px]">
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
          <label className="text-[10px] font-bold uppercase text-gray-500">Angkatan</label>
          <Select value={angkatan} onValueChange={(val) => setAngkatan(val || "ALL")}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Pilih Angkatan" />
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <Card className="border-none shadow-md overflow-hidden">
          <CardHeader className="bg-blue-900 text-white pb-6">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5" /> CPL Profile (Radar)
            </CardTitle>
            <CardDescription className="text-blue-100">Distribusi rata-rata nilai per CPL</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data.chartData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar
                  name="Attainment"
                  dataKey="attainment"
                  stroke="#2563eb"
                  fill="#3b82f6"
                  fillOpacity={0.6}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bar Chart % Completion */}
        <Card className="border-none shadow-md overflow-hidden">
          <CardHeader className="bg-white border-b">
            <CardTitle className="text-lg">Persentase Ketercapaian Target</CardTitle>
            <CardDescription>% mahasiswa dengan nilai ≥ 55 (Target: 75%)</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.chartData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="subject" type="category" />
                <Tooltip />
                <Bar 
                   dataKey="passRate" 
                   fill="#10b981" 
                   radius={[0, 4, 4, 0]}
                   label={{ position: 'right', fontSize: 10 }} 
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Attainment Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50 border-b">
            <TableRow>
              <TableHead className="w-[100px]">Kode CPL</TableHead>
              <TableHead>Rumusan</TableHead>
              <TableHead className="text-center w-[120px]">Target (%)</TableHead>
              <TableHead className="text-center w-[120px]">Capaian (%)</TableHead>
              <TableHead className="text-center w-[100px]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.tableData.map((row: any) => (
              <TableRow key={row.id}>
                <TableCell className="font-bold text-blue-700">{row.kode}</TableCell>
                <TableCell className="text-sm text-gray-600 leading-snug">{row.rumusan}</TableCell>
                <TableCell className="text-center font-medium text-gray-400">{row.target}%</TableCell>
                <TableCell className="text-center font-bold text-lg">
                  <span className={row.capaian >= row.target ? "text-green-600" : "text-red-600"}>
                    {row.capaian}%
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <div className="text-2xl">{row.status}</div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
