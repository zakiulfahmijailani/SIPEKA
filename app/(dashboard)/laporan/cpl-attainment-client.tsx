"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Cell, ReferenceLine, LabelList,
  ComposedChart, Line, Area,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  FileDown, Loader2, CheckCircle2, XCircle,
  Target, BarChart2, ChevronRight, BookOpen,
  TrendingUp, TrendingDown, Minus, AlertTriangle,
  Activity,
} from "lucide-react"
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
import { LaporanNoDataEmpty } from "@/components/empty-states"
import { cn } from "@/lib/utils"
import { AnimatedNumber } from "@/components/animated-number"
import { CplAttainmentSkeleton } from "@/components/skeletons"

const STATUS_TARGET = 75

// ─── Pembantu warna ────────────────────────────────────────────────────────────
function barColor(v: number, target = STATUS_TARGET) {
  if (v >= target)       return "#16a34a"
  if (v >= target * 0.8) return "#f59e0b"
  return "#ef4444"
}

function gapColor(gap: number) {
  if (gap >= 0)   return "#16a34a"
  if (gap >= -10) return "#f59e0b"
  return "#ef4444"
}

// ─── Dot radar kustom ─────────────────────────────────────────────────────────
function RadarDot(props: any) {
  const { cx, cy, payload } = props
  const pass = payload?.passRate >= STATUS_TARGET
  return (
    <circle cx={cx} cy={cy} r={4}
      fill={pass ? "#16a34a" : "#ef4444"}
      stroke="white" strokeWidth={1.5} />
  )
}

// ─── Mini progres di dalam tabel ───────────────────────────────────────────────
function MiniBar({ value, target }: { value: number; target: number }) {
  const pct = Math.min(value, 100)
  const color = barColor(value, target)
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
        <div className="h-1.5 rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className={cn("text-sm font-bold tabular-nums w-[46px] text-right", value >= target ? "text-green-600" : value >= target * 0.8 ? "text-amber-500" : "text-red-500")}>
        {value}%
      </span>
    </div>
  )
}

// ─── Telusur kontribusi MK ────────────────────────────────────────────────────
function MkDrillDown({
  cplId,
  mkContribution,
}: {
  cplId: string
  mkContribution: Record<string, Record<string, { avgScore: number; studentCount: number }>>
}) {
  const rows = Object.entries(mkContribution)
    .filter(([, cpls]) => cpls[cplId])
    .map(([mkId, cpls]) => {
      const s = cpls[cplId]
      const avg = s.studentCount > 0 ? s.avgScore / s.studentCount : 0
      return { mkId, avg: parseFloat(avg.toFixed(1)), students: s.studentCount }
    })
    .sort((a, b) => b.avg - a.avg)

  if (rows.length === 0) {
    return (
      <div className="flex items-center gap-2 py-3 px-6 text-xs text-gray-400">
        <BookOpen className="h-3.5 w-3.5 shrink-0" />
        Tidak ada data MK yang berkontribusi pada CPL ini.
      </div>
    )
  }

  return (
    <div className="px-6 py-4 bg-gray-50/80 border-t border-dashed border-gray-200">
      <p className="text-[10px] uppercase font-semibold tracking-wider text-gray-400 mb-3">
        Kontribusi per Mata Kuliah
      </p>
      <div className="space-y-2">
        {rows.map(({ mkId, avg, students }) => {
          const pct = Math.min(avg, 100)
          const isPass = avg >= 55
          const gradFrom = isPass ? "#86efac" : "#fca5a5"
          const gradTo   = isPass ? "#16a34a" : "#dc2626"
          return (
            <div key={mkId} className="flex items-center gap-3">
              <span className="font-mono text-[11px] font-semibold text-gray-600 w-[92px] shrink-0 truncate" title={mkId}>
                {mkId}
              </span>
              <div className="relative flex-1 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                  style={{
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, ${gradFrom}, ${gradTo})`
                  }}
                />
              </div>
              <span className={cn(
                "text-xs font-bold tabular-nums w-[44px] text-right shrink-0",
                isPass ? "text-green-700" : "text-red-500"
              )}>
                {avg}
              </span>
              <span className="text-[10px] text-gray-400 w-[54px] shrink-0">{students} mhs</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Pembangun data analisis kesenjangan ────────────────────────────────────────
function buildGapData(tableData: any[]) {
  return tableData.map(r => ({
    kode:   r.kode,
    gap:    parseFloat((r.capaian - r.target).toFixed(1)),
    target: r.target,
    capaian: r.capaian,
  })).sort((a, b) => a.gap - b.gap)
}

// ─── Tooltip kustom untuk grafik kesenjangan ────────────────────────────────────
function GapTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md p-3 text-xs">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      <p className="text-gray-500">Target: <span className="font-bold text-gray-700">{d.target}%</span></p>
      <p className="text-gray-500">Capaian: <span className="font-bold text-gray-700">{d.capaian}%</span></p>
      <p className={cn("font-bold mt-1", d.gap >= 0 ? "text-green-600" : "text-red-500")}>
        Kesenjangan: {d.gap >= 0 ? "+" : ""}{d.gap}%
      </p>
    </div>
  )
}

// ─── Tile IKU dengan ikon tren ─────────────────────────────────────────────────
function KpiTile({ label, value, suffix = "", sub, trend, color = "gray", decimals }: {
  label: string; value: number; suffix?: string; sub?: string
  trend?: "up" | "down" | "neutral"; color?: string; decimals?: number
}) {
  const colorMap: Record<string, string> = {
    green: "text-green-600",
    red:   "text-red-500",
    amber: "text-amber-500",
    blue:  "text-blue-600",
    gray:  "text-gray-800",
  }
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus
  const trendColor = trend === "up" ? "text-green-500" : trend === "down" ? "text-red-400" : "text-gray-400"
  return (
    <Card className="border border-gray-100 shadow-sm">
      <CardContent className="px-5 py-4">
        <div className="flex items-start justify-between">
          <p className="text-[11px] uppercase font-semibold tracking-wider text-gray-400">{label}</p>
          {trend && <TrendIcon className={cn("h-3.5 w-3.5 mt-0.5", trendColor)} />}
        </div>
        <p className={cn("text-2xl font-bold tabular-nums mt-1", colorMap[color])}>
          <AnimatedNumber value={value} decimals={decimals !== undefined ? decimals : (suffix === "%" ? 1 : 0)} suffix={suffix} />
        </p>
        {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  )
}

// ─── Komponen utama ───────────────────────────────────────────────────────────
export default function CplAttainmentClient({ tas }: { tas: any[] }) {
  const [taId, setTaId]           = useState(tas.find(t => t.is_active)?.id || tas[0]?.id)
  const [angkatan, setAngkatan]   = useState<string>("ALL")
  const [data, setData]           = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [expandedCpl, setExpandedCpl] = useState<string | null>(null)
  const [activeChart, setActiveChart] = useState<"bar" | "radar" | "gap">("bar")

  const fetchData = useCallback(async () => {
    if (!taId) return
    setIsLoading(true)
    setExpandedCpl(null)
    const res = await calculateCplAttainment({
      taIds: [taId],
      angkatan: angkatan !== "ALL" ? parseInt(angkatan) : undefined
    })
    if (res.success) setData(res.data)
    else toast.error(res.error)
    setIsLoading(false)
  }, [taId, angkatan])

  useEffect(() => { fetchData() }, [fetchData])

  const handleExportExcel = async () => {
    if (!data) return
    setIsExporting(true)
    try {
      const workbook = new ExcelJS.Workbook()
      const summarySheet = workbook.addWorksheet("Ringkasan Ketercapaian")
      summarySheet.columns = [
        { header: "Kode CPL",        key: "kode",     width: 15 },
        { header: "Rumusan",         key: "rumusan",   width: 50 },
        { header: "Target (%)",      key: "target",   width: 15 },
        { header: "Capaian (%)",     key: "capaian",  width: 15 },
        { header: "Rata-rata Nilai", key: "avgScore", width: 15 },
        { header: "Status",          key: "status",   width: 10 },
      ]
      data.tableData.forEach((row: any) => summarySheet.addRow(row))
      summarySheet.getRow(1).font = { bold: true }
      summarySheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF3F4F6" } }

      const mkSheet = workbook.addWorksheet("Detail per MK")
      mkSheet.columns = [
        { header: "ID MK",            key: "mkId",         width: 20 },
        { header: "CPL",              key: "cplId",        width: 15 },
        { header: "Rata-rata Nilai",  key: "avgScore",     width: 20 },
        { header: "Jumlah Mahasiswa", key: "studentCount", width: 20 },
      ]
      Object.entries(data.mkContribution).forEach(([mkId, cpls]: [string, any]) => {
        Object.entries(cpls).forEach(([cplId, stats]: [string, any]) => {
          mkSheet.addRow({
            mkId, cplId,
            avgScore: parseFloat((stats.avgScore / stats.studentCount).toFixed(2)),
            studentCount: stats.studentCount
          })
        })
      })

      const buffer = await workbook.xlsx.writeBuffer()
      saveAs(
        new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
        `laporan-ketercapaian-cpl-${taId}.xlsx`
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

  if (isLoading) return <CplAttainmentSkeleton />
  if (!data)     return <LaporanNoDataEmpty />

  // ── Statistik turunan ──────────────────────────────────────────────
  const totalCpl   = data.tableData.length
  const tercapai   = data.tableData.filter((r: any) => r.capaian >= r.target).length
  const belum      = totalCpl - tercapai
  const nearMiss   = data.tableData.filter((r: any) => r.capaian < r.target && r.capaian >= r.target * 0.8).length
  const avgCapaian = totalCpl > 0
    ? data.tableData.reduce((a: any, b: any) => a + b.capaian, 0) / totalCpl
    : 0
  const gapData = buildGapData(data.tableData)

  const overallTrend: "up" | "down" | "neutral" =
    avgCapaian >= STATUS_TARGET ? "up" : avgCapaian >= STATUS_TARGET * 0.8 ? "neutral" : "down"

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Laporan Ketercapaian Capaian Pembelajaran Lulusan</h1>
          <p className="text-sm text-gray-500 mt-0.5">Analisis ketercapaian Capaian Pembelajaran Lulusan (OBE)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={handleExportExcel} disabled={isExporting}>
            {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
            Unduh Excel
          </Button>
          <Button size="sm" variant="outline" className="gap-2" onClick={() => window.print()}>
            PDF
          </Button>
        </div>
      </div>

      {/* ── Filter ── */}
      <div className="flex flex-wrap gap-4 p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
        <div className="space-y-1">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Tahun Akademik</label>
          <Select value={taId} onValueChange={(v) => setTaId(v || "")}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Pilih TA" /></SelectTrigger>
            <SelectContent>{tas.map(t => <SelectItem key={t.id} value={t.id}>{t.nama} ({t.kode})</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Angkatan</label>
          <Select value={angkatan} onValueChange={(v) => setAngkatan(v || "ALL")}>
            <SelectTrigger className="w-[130px]"><SelectValue placeholder="Angkatan" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua</SelectItem>
              {angkatanList.map(a => <SelectItem key={a} value={a.toString()}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── Tile IKU ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiTile label="Total CPL"       value={totalCpl}  color="gray" />
        <KpiTile label="Tercapai"        value={tercapai}   color="green" sub={`dari ${totalCpl} CPL`} trend="up" />
        <KpiTile label="Hampir Tercapai" value={nearMiss}   color="amber" sub="dalam 20% dari target" trend="neutral" />
        <KpiTile label="Rata-rata"       value={avgCapaian} suffix="%" decimals={1}
          color={avgCapaian >= STATUS_TARGET ? "green" : avgCapaian >= STATUS_TARGET * 0.8 ? "amber" : "red"}
          trend={overallTrend} sub={`target ${STATUS_TARGET}%`} />
      </div>

      {/* ── Banner peringatan CPL belum tercapai ── */}
      {belum > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100">
          <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-700">
              {belum} CPL belum mencapai target {STATUS_TARGET}%
            </p>
            <p className="text-xs text-red-500 mt-0.5">
              Scroll ke tabel di bawah untuk melihat detail dan kontribusi MK masing-masing.
            </p>
          </div>
        </div>
      )}

      {/* ── Tab grafik ── */}
      <div>
        <div className="flex gap-1 mb-4 p-1 bg-gray-100 rounded-lg w-fit">
          {(["bar", "radar", "gap"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveChart(tab)}
              className={cn(
                "px-4 py-1.5 rounded-md text-xs font-semibold transition-all",
                activeChart === tab
                  ? "bg-white shadow-sm text-gray-800"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              {tab === "bar" ? "Tingkat Kelulusan CPL" : tab === "radar" ? "Radar Profil" : "Analisis Kesenjangan"}
            </button>
          ))}
        </div>

        {/* ── Grafik Batang: Tingkat Kelulusan per CPL ── */}
        {activeChart === "bar" && (
          <Card className="border border-gray-100 shadow-sm">
            <CardHeader className="px-5 pt-5 pb-2">
              <div className="flex items-center gap-2">
                <BarChart2 className="h-4 w-4 text-gray-400" />
                <CardTitle className="text-sm font-semibold text-gray-700">Tingkat Kelulusan per CPL</CardTitle>
              </div>
              <CardDescription className="text-[11px]">
                % mahasiswa ≥55 · garis merah = target {STATUS_TARGET}% · warna: 🟢 tercapai · 🟡 mendekati · 🔴 perlu perhatian
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[320px] px-5 pb-5">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data.chartData} layout="vertical" margin={{ left: 8, right: 48 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} unit="%" />
                  <YAxis dataKey="subject" type="category" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} width={52} />
                  <Tooltip content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null
                    const d = payload[0]?.payload
                    return (
                      <div className="bg-white border border-gray-200 rounded-lg shadow-md p-3 text-xs">
                        <p className="font-semibold mb-1">{label}</p>
                        <p>Tingkat Kelulusan: <span className="font-bold">{d?.passRate}%</span></p>
                        <p>Rata-rata Nilai: <span className="font-bold">{d?.attainment}</span></p>
                      </div>
                    )
                  }} />
                  <ReferenceLine x={STATUS_TARGET} stroke="#fca5a5" strokeWidth={1.5} strokeDasharray="4 3"
                    label={{ value: `${STATUS_TARGET}%`, position: "insideTopRight", fontSize: 10, fill: "#ef4444" }} />
                  <Bar dataKey="passRate" radius={[0, 4, 4, 0]} maxBarSize={22}>
                    <LabelList dataKey="passRate" position="right" fontSize={10} fill="#9ca3af" formatter={(v: any) => `${v}%`} />
                    {data.chartData.map((entry: any) => (
                      <Cell key={entry.subject} fill={barColor(entry.passRate)} fillOpacity={0.85} />
                    ))}
                  </Bar>
                  <Line dataKey="attainment" stroke="#6366f1" strokeWidth={0} dot={{ r: 3, fill: "#6366f1", strokeWidth: 0 }}
                    tooltipType="none" legendType="none" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* ── Grafik Radar ── */}
        {activeChart === "radar" && (
          <Card className="border border-gray-100 shadow-sm">
            <CardHeader className="px-5 pt-5 pb-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-gray-400" />
                <CardTitle className="text-sm font-semibold text-gray-700">Profil CPL (Radar)</CardTitle>
              </div>
              <CardDescription className="text-[11px]">Distribusi rata-rata nilai per CPL · dot merah = belum tercapai</CardDescription>
            </CardHeader>
            <CardContent className="h-[360px] px-5 pb-5">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="72%" data={data.chartData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "#9ca3af", fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Target" dataKey={() => STATUS_TARGET}
                    stroke="#fca5a5" fill="#fee2e2" fillOpacity={0.25} strokeWidth={1} strokeDasharray="4 3" dot={false} />
                  <Radar name="Capaian" dataKey="attainment"
                    stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} strokeWidth={2}
                    dot={<RadarDot />} />
                  <Tooltip
                    contentStyle={{ border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12 }}
                    formatter={(val: any, name: any) => [`${val}%`, name === "Target" ? "Target" : "Capaian"]}
                  />
                </RadarChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-5 -mt-2">
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="w-3 h-0.5 bg-blue-500 inline-block" /> Capaian
                </span>
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="w-3 h-0.5 bg-red-300 inline-block border-dashed" /> Target {STATUS_TARGET}%
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Grafik Analisis Kesenjangan ── */}
        {activeChart === "gap" && (
          <Card className="border border-gray-100 shadow-sm">
            <CardHeader className="px-5 pt-5 pb-2">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-gray-400" />
                <CardTitle className="text-sm font-semibold text-gray-700">Analisis Kesenjangan (Capaian − Target)</CardTitle>
              </div>
              <CardDescription className="text-[11px]">
                Nilai positif = melampaui target · negatif = kekurangan · urut dari terburuk
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[320px] px-5 pb-5">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gapData} layout="vertical" margin={{ left: 8, right: 56 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                  <XAxis type="number" domain={['auto', 'auto']}
                    tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} unit="%" />
                  <YAxis dataKey="kode" type="category" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} width={52} />
                  <Tooltip content={<GapTooltip />} />
                  <ReferenceLine x={0} stroke="#d1d5db" strokeWidth={1.5} />
                  <Bar dataKey="gap" radius={[0, 4, 4, 0]} maxBarSize={20}>
                    <LabelList dataKey="gap" position="right" fontSize={10} fill="#9ca3af"
                      formatter={(v: any) => `${v >= 0 ? "+" : ""}${v}%`} />
                    {gapData.map((entry) => (
                      <Cell key={entry.kode} fill={gapColor(entry.gap)} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ── Tabel detail per CPL ── */}
      <Card className="border border-gray-100 shadow-sm overflow-hidden">
        <CardHeader className="px-5 pt-5 pb-3 border-b border-gray-100">
          <CardTitle className="text-sm font-semibold text-gray-700">Rekap per CPL</CardTitle>
          <CardDescription className="text-[11px]">
            Klik baris untuk melihat kontribusi Mata Kuliah · progress bar = % capaian terhadap target
          </CardDescription>
        </CardHeader>
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-8" />
              <TableHead className="w-[100px] text-xs">Kode CPL</TableHead>
              <TableHead className="text-xs">Rumusan</TableHead>
              <TableHead className="text-center w-[90px] text-xs">Target</TableHead>
              <TableHead className="w-[200px] text-xs">Capaian</TableHead>
              <TableHead className="text-center w-[100px] text-xs">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.tableData.map((row: any) => {
              const isTercapai = row.capaian >= row.target
              const isNearMiss = !isTercapai && row.capaian >= row.target * 0.8
              const isExpanded = expandedCpl === row.id
              return (
                <>
                  <TableRow
                    key={row.id}
                    className={cn(
                      "cursor-pointer select-none transition-colors",
                      isExpanded ? "bg-gray-50/80" : "hover:bg-gray-50/60"
                    )}
                    onClick={() => setExpandedCpl(isExpanded ? null : row.id)}
                  >
                    <TableCell className="pr-0 pl-4 w-8">
                      <ChevronRight className={cn("h-4 w-4 text-gray-300 transition-transform duration-200", isExpanded && "rotate-90")} />
                    </TableCell>
                    <TableCell className="font-mono text-sm font-semibold text-gray-700">{row.kode}</TableCell>
                    <TableCell className="text-sm text-gray-600 leading-relaxed max-w-[280px]">{row.rumusan}</TableCell>
                    <TableCell className="text-center text-sm tabular-nums text-gray-400">{row.target}%</TableCell>
                    <TableCell className="min-w-[180px]">
                      <MiniBar value={row.capaian} target={row.target} />
                    </TableCell>
                    <TableCell className="text-center">
                      {isTercapai
                        ? <Badge className="bg-green-50 text-green-700 border-green-100 gap-1 text-xs"><CheckCircle2 className="h-3 w-3" /> Tercapai</Badge>
                        : isNearMiss
                          ? <Badge className="bg-amber-50 text-amber-700 border-amber-100 gap-1 text-xs"><Minus className="h-3 w-3" /> Hampir Tercapai</Badge>
                          : <Badge variant="outline" className="text-red-500 border-red-100 gap-1 text-xs"><XCircle className="h-3 w-3" /> Perlu Tindakan</Badge>
                      }
                    </TableCell>
                  </TableRow>
                  {isExpanded && (
                    <TableRow key={`${row.id}-drill`} className="hover:bg-transparent">
                      <TableCell colSpan={6} className="p-0">
                        <MkDrillDown cplId={row.id} mkContribution={data.mkContribution} />
                      </TableCell>
                    </TableRow>
                  )}
                </>
              )
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
