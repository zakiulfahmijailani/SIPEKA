"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from "recharts"
import {
  Users, BookOpen, Clock, Target, ArrowRight, CheckCircle2,
  AlertCircle, FileText, PenSquare, History
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { RpsDosenEmpty } from "@/components/empty-states"

// KPI icon map — keluarkan dari render agar tidak re-create tiap render
const KPI_ICONS: Record<string, React.ElementType> = {
  blue: Users,
  purple: BookOpen,
  red: Clock,
  green: Target,
}

export function DashboardClient({ stats, role }: { stats: any; role: string }) {
  if (role === "SUPER_ADMIN" || role === "KAPRODI") {
    return (
      <div className="space-y-6 pb-10">

        {/* KPI Cards — surface elevation, tanpa colored border kiri */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.kpi.map((k: any) => {
            const Icon = KPI_ICONS[k.color] ?? Target
            return (
              <Card key={k.label} className="border border-gray-100 shadow-sm bg-white">
                <CardHeader className="pb-1 pt-5 px-5">
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-xs uppercase font-semibold tracking-wider text-gray-400">
                      {k.label}
                    </CardDescription>
                    <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <div className="text-2xl font-bold text-gray-900 tabular-nums">
                    {k.value}
                  </div>
                  {k.badge && (
                    <Badge
                      variant="destructive"
                      className="mt-2 text-xs font-medium"
                    >
                      Perlu Tindakan
                    </Badge>
                  )}
                  <p className="mt-1 text-xs text-gray-400">Update: Hari ini</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border border-gray-100 shadow-sm">
            <CardHeader className="px-5 pt-5 pb-2">
              <CardTitle className="text-sm font-semibold text-gray-700">Distribusi Nilai (Grade)</CardTitle>
              <CardDescription className="text-xs">Seluruh mata kuliah di semester berjalan</CardDescription>
            </CardHeader>
            <CardContent className="h-[260px] px-5 pb-5">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.charts.grades} barCategoryGap="40%">
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="grade" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12 }}
                    cursor={{ fill: "#f9fafb" }}
                  />
                  <Bar dataKey="count" fill="#374151" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border border-gray-100 shadow-sm">
            <CardHeader className="px-5 pt-5 pb-2">
              <CardTitle className="text-sm font-semibold text-gray-700">CPL Attainment Snapshot</CardTitle>
              <CardDescription className="text-xs">Rata-rata ketercapaian kompetensi mahasiswa</CardDescription>
            </CardHeader>
            <CardContent className="h-[260px] px-5 pb-5">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={stats.charts.cplRadar}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: "#d1d5db" }} />
                  <Radar
                    name="Attainment"
                    dataKey="attainment"
                    stroke="#374151"
                    fill="#374151"
                    fillOpacity={0.12}
                    strokeWidth={1.5}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* RPS Pending + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border border-gray-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between px-5 pt-5 pb-3">
              <div>
                <CardTitle className="text-sm font-semibold text-gray-700">RPS Menunggu Approval</CardTitle>
                <CardDescription className="text-xs mt-0.5">Perlu ditinjau sebelum semester berjalan</CardDescription>
              </div>
              <Link
                href="/rps"
                className="text-xs text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1"
              >
                Lihat semua <ArrowRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="space-y-2">
                {stats.recentRps.length > 0 ? stats.recentRps.map((r: any) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between px-4 py-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex gap-3 items-center min-w-0">
                      <div className="h-8 w-8 bg-gray-100 text-gray-500 rounded-md flex items-center justify-center text-xs font-bold shrink-0">
                        {r.dosirMk.mk.kode.substring(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{r.dosirMk.mk.nama_id}</p>
                        <p className="text-xs text-gray-400 truncate">
                          {r.dosirMk.dosen.nama_lengkap} &middot; Kelas {r.dosirMk.kelas}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/rps/${r.dosir_mk_id}`}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "shrink-0 ml-2 text-xs gap-1"
                      )}
                    >
                      Review <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                )) : (
                  <div className="py-10 text-center">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-gray-200" />
                    <p className="text-sm text-gray-400">Semua RPS sudah disetujui.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-100 shadow-sm">
            <CardHeader className="px-5 pt-5 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">Aktivitas Terbaru</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="space-y-5">
                {stats.recentActivity.map((act: any) => (
                  <div key={act.id} className="flex gap-3">
                    <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gray-300 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-700 leading-relaxed">
                        <span className="font-semibold">{act.changedBy.nama_lengkap}</span>{" "}
                        {act.description}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {new Date(act.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // DOSEN DASHBOARD
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.myDosirs.map((d: any) => (
          <Card
            key={d.id}
            className="border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all"
          >
            <CardHeader className="px-5 pt-5 pb-2">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="text-xs text-gray-500 font-normal">
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
                <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                  <span>Progress Input Nilai</span>
                  <span className="font-semibold tabular-nums text-gray-700">{d.progress}%</span>
                </div>
                <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gray-700 rounded-full transition-all duration-500"
                    style={{ width: `${d.progress}%` }}
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
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
