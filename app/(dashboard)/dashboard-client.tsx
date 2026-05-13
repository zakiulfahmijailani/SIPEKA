"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  Cell,
} from "recharts"
import {
  Users, BookOpen, Clock, Target, ArrowRight, CheckCircle2,
  AlertCircle, FileText, PenSquare, TrendingUp, History,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { RpsDosenEmpty } from "@/components/empty-states"

const KPI_ICONS: Record<string, React.ElementType> = {
  blue: Users,
  purple: BookOpen,
  red: Clock,
  green: Target,
}

// Bar chart color berdasarkan grade
const GRADE_COLORS: Record<string, string> = {
  A: "#16a34a",
  AB: "#22c55e",
  B: "#3b82f6",
  BC: "#60a5fa",
  C: "#f59e0b",
  D: "#f97316",
  E: "#ef4444",
}

export function DashboardClient({ stats, role }: { stats: any; role: string }) {
  if (role === "SUPER_ADMIN" || role === "KAPRODI") {
    const pendingKpi = stats.kpi.find((k: any) => k.color === "red")
    const hasPendingRps = pendingKpi?.badge

    return (
      <div className="space-y-5 pb-10">

        {/* ── Bento Grid ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 auto-rows-auto">

          {/* KPI 1: Mahasiswa — tall tile */}
          {stats.kpi.map((k: any, i: number) => {
            const Icon = KPI_ICONS[k.color] ?? Target
            const isTall = i === 0 // Tile pertama sedikit lebih besar
            return (
              <Card
                key={k.label}
                className={cn(
                  "border border-gray-100 shadow-sm bg-white flex flex-col justify-between",
                  isTall && "row-span-1" // bisa diubah row-span-2 jika layout 2-col
                )}
              >
                <CardHeader className="pb-0 pt-5 px-5">
                  <div className="flex items-start justify-between">
                    <CardDescription className="text-[11px] uppercase font-semibold tracking-wider text-gray-400">
                      {k.label}
                    </CardDescription>
                    <div className="h-7 w-7 rounded-md bg-gray-50 flex items-center justify-center shrink-0">
                      <Icon className="h-3.5 w-3.5 text-gray-400" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-5 pb-5 pt-2">
                  <div className="text-3xl font-bold text-gray-900 tabular-nums leading-none">
                    {k.value}
                  </div>
                  {k.badge ? (
                    <Badge variant="destructive" className="mt-2 text-[11px]">
                      Perlu Tindakan
                    </Badge>
                  ) : (
                    <p className="mt-1.5 text-[11px] text-gray-400">Semester berjalan</p>
                  )}
                </CardContent>
              </Card>
            )
          })}

          {/* Bento tile: Grade Distribution — lebar 2 kolom di desktop */}
          <Card className="col-span-2 border border-gray-100 shadow-sm bg-white">
            <CardHeader className="px-5 pt-5 pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold text-gray-700">Distribusi Nilai</CardTitle>
                  <CardDescription className="text-[11px] mt-0.5">Semester berjalan</CardDescription>
                </div>
                <TrendingUp className="h-4 w-4 text-gray-300" />
              </div>
            </CardHeader>
            <CardContent className="h-[180px] px-5 pb-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.charts.grades} barCategoryGap="35%">
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis
                    dataKey="grade"
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{ border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
                    cursor={{ fill: "#f9fafb" }}
                  />
                  <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                    {stats.charts.grades.map((entry: any) => (
                      <Cell key={entry.grade} fill={GRADE_COLORS[entry.grade] ?? "#9ca3af"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Bento tile: CPL Radar — lebar 2 kolom */}
          <Card className="col-span-2 border border-gray-100 shadow-sm bg-white">
            <CardHeader className="px-5 pt-5 pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold text-gray-700">CPL Attainment</CardTitle>
                  <CardDescription className="text-[11px] mt-0.5">Rata-rata capaian per kompetensi</CardDescription>
                </div>
                <Link
                  href="/laporan/cpl-attainment"
                  className="text-[11px] text-gray-400 hover:text-gray-700 flex items-center gap-1 transition-colors"
                >
                  Detail <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="h-[180px] px-5 pb-4">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={stats.charts.cplRadar}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#9ca3af" }} />
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
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* ── Baris bawah: RPS Pending + Aktivitas ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* RPS pending — 2 kolom */}
          <Card className="lg:col-span-2 border border-gray-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between px-5 pt-5 pb-3">
              <div>
                <CardTitle className="text-sm font-semibold text-gray-700">RPS Menunggu Approval</CardTitle>
                <CardDescription className="text-[11px] mt-0.5">
                  {hasPendingRps ? "Perlu ditinjau sebelum semester berjalan" : "Semua sudah disetujui"}
                </CardDescription>
              </div>
              <Link
                href="/rps"
                className="text-[11px] text-gray-400 hover:text-gray-700 flex items-center gap-1 transition-colors"
              >
                Lihat semua <ArrowRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="space-y-1.5">
                {stats.recentRps.length > 0 ? stats.recentRps.map((r: any) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex gap-3 items-center min-w-0">
                      <div className="h-7 w-7 bg-gray-100 text-gray-500 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0">
                        {r.dosirMk.mk.kode.substring(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{r.dosirMk.mk.nama_id}</p>
                        <p className="text-[11px] text-gray-400 truncate">
                          {r.dosirMk.dosen.nama_lengkap} &middot; Kelas {r.dosirMk.kelas}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/rps/${r.dosir_mk_id}`}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "sm" }),
                        "shrink-0 ml-2 text-[11px] text-gray-500 hover:text-gray-900 gap-1"
                      )}
                    >
                      Review <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                )) : (
                  <div className="py-8 text-center">
                    <CheckCircle2 className="h-7 w-7 mx-auto mb-2 text-gray-200" />
                    <p className="text-sm text-gray-400">Tidak ada RPS yang menunggu persetujuan.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Aktivitas */}
          <Card className="border border-gray-100 shadow-sm">
            <CardHeader className="px-5 pt-5 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-700">Aktivitas</CardTitle>
                <History className="h-4 w-4 text-gray-300" />
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="space-y-4">
                {stats.recentActivity.length > 0 ? stats.recentActivity.map((act: any) => (
                  <div key={act.id} className="flex gap-3">
                    <div className="mt-2 h-1.5 w-1.5 rounded-full bg-gray-300 shrink-0" />
                    <div>
                      <p className="text-[12px] text-gray-700 leading-relaxed">
                        <span className="font-semibold">{act.changedBy.nama_lengkap}</span>{" "}
                        {act.description}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {new Date(act.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                )) : (
                  <p className="text-[12px] text-gray-400 text-center py-6">Belum ada aktivitas.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // ── DOSEN DASHBOARD ──
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.myDosirs.map((d: any) => (
          <Card
            key={d.id}
            className="border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all"
          >
            <CardHeader className="px-5 pt-5 pb-2">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="text-[11px] text-gray-500 font-normal">
                  Kelas {d.kelas}
                </Badge>
                {d.statusRps === "APPROVED"
                  ? <CheckCircle2 className="h-4 w-4 text-green-500" />
                  : <AlertCircle className="h-4 w-4 text-amber-400" />}
              </div>
              <CardTitle className="text-base font-semibold text-gray-800 leading-snug">{d.mk}</CardTitle>
              <CardDescription className="text-xs font-mono">{d.statusRps}</CardDescription>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-4">
              <div>
                <div className="flex justify-between text-[11px] text-gray-500 mb-1.5">
                  <span>Progress Input Nilai</span>
                  <span className="font-semibold tabular-nums text-gray-700">{d.progress}%</span>
                </div>
                <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      d.progress >= 100 ? "bg-green-500" : d.progress >= 50 ? "bg-gray-600" : "bg-gray-300"
                    )}
                    style={{ width: `${d.progress}%` }}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  href="/nilai/input"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "flex-1 gap-1.5 text-xs"
                  )}
                >
                  <PenSquare className="h-3.5 w-3.5" /> Nilai
                </Link>
                <Link
                  href={`/rps/${d.id}`}
                  className={cn(
                    buttonVariants({ variant: "default", size: "sm" }),
                    "flex-1 gap-1.5 text-xs"
                  )}
                >
                  <FileText className="h-3.5 w-3.5" /> Edit RPS
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {stats.myDosirs.length === 0 && <RpsDosenEmpty />}
    </div>
  )
}
