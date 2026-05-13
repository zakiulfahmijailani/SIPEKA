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
  GraduationCap, AlertTriangle,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { RpsDosenEmpty } from "@/components/empty-states"
import { AnimatedNumber } from "@/components/animated-number"

// ---------------------------------------------------------------------------
// Grade color map
// ---------------------------------------------------------------------------
const GRADE_COLORS: Record<string, string> = {
  A: "#16a34a", AB: "#22c55e", B: "#3b82f6",
  BC: "#60a5fa", C: "#f59e0b", D: "#f97316", E: "#ef4444",
}

// ---------------------------------------------------------------------------
// Konfigurasi tile Indikator Kinerja Utama
// ---------------------------------------------------------------------------
type KpiStyle = {
  icon: React.ElementType
  accent: string
  bg: string
  ring: string
  hero: boolean
}

const KPI_STYLES: Record<string, KpiStyle> = {
  blue:   { icon: GraduationCap, accent: "text-blue-600",   bg: "bg-blue-50",   ring: "border-blue-100",   hero: true },
  purple: { icon: BookOpen,      accent: "text-violet-600", bg: "bg-violet-50", ring: "border-violet-100", hero: false },
  red:    { icon: AlertTriangle, accent: "text-rose-600",   bg: "bg-rose-50",   ring: "border-rose-100",   hero: false },
  green:  { icon: Target,        accent: "text-emerald-600",bg: "bg-emerald-50",ring: "border-emerald-100",hero: false },
}

// ---------------------------------------------------------------------------
// Komponen tile IKU
// ---------------------------------------------------------------------------
function KpiTile({ k, isHero = false }: { k: any; isHero?: boolean }) {
  const style = KPI_STYLES[k.color] ?? KPI_STYLES.blue
  const Icon = style.icon
  const numericValue = typeof k.value === "number"
    ? k.value
    : parseFloat(String(k.value).replace("%", "")) || 0
  const isPercent = String(k.value).includes("%")
  const isDecimal = !Number.isInteger(numericValue)

  return (
    <Card
      className={cn(
        "border shadow-sm flex flex-col justify-between overflow-hidden transition-shadow hover:shadow-md",
        style.ring,
        isHero ? "row-span-2" : ""
      )}
    >
      <div className={cn("h-0.5 w-full", style.bg.replace("bg-", "bg-").replace("50", "200"))} />

      <CardHeader className="pb-0 pt-5 px-5">
        <div className="flex items-start justify-between">
          <CardDescription className="text-[11px] uppercase font-semibold tracking-wider text-gray-400">
            {k.label}
          </CardDescription>
          <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0", style.bg)}>
            <Icon className={cn("h-4 w-4", style.accent)} />
          </div>
        </div>
      </CardHeader>

      <CardContent className={cn("px-5 pb-5", isHero ? "pt-4" : "pt-2")}>
        <div className={cn(
          "font-bold text-gray-900 leading-none tabular-nums",
          isHero ? "text-5xl" : "text-3xl"
        )}>
          <AnimatedNumber
            value={numericValue}
            decimals={isDecimal ? 1 : 0}
            suffix={isPercent ? "%" : ""}
            duration={900}
          />
        </div>

        {k.badge ? (
          <Badge className="mt-3 text-[11px] bg-rose-100 text-rose-700 border-rose-200 border hover:bg-rose-100">
            Perlu Tindakan
          </Badge>
        ) : (
          <p className="mt-2 text-[11px] text-gray-400">Semester berjalan</p>
        )}

        {isHero && (
          <Link
            href="/master/mahasiswa"
            className="mt-4 inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-700 transition-colors"
          >
            Lihat semua <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Dashboard Admin / Kaprodi
// ---------------------------------------------------------------------------
function AdminDashboard({ stats }: { stats: any }) {
  const pendingKpi = stats.kpi.find((k: any) => k.color === "red")
  const hasPendingRps = pendingKpi?.badge

  return (
    <div className="space-y-5 pb-10">

      {/* ─── Baris 1: Grid Bento ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3" style={{ gridAutoRows: "auto" }}>

        {/* Tile IKU Hero: Total Mahasiswa */}
        <div className="col-span-1 lg:row-span-2">
          <KpiTile k={stats.kpi[0]} isHero />
        </div>

        {/* 3 tile IKU kecil */}
        {stats.kpi.slice(1).map((k: any) => (
          <div key={k.label} className="col-span-1">
            <KpiTile k={k} />
          </div>
        ))}

        {/* Distribusi Nilai — 2 kolom */}
        <Card className="col-span-2 border border-gray-100 shadow-sm bg-white lg:row-span-1">
          <CardHeader className="px-5 pt-5 pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-gray-700">Distribusi Nilai</CardTitle>
                <CardDescription className="text-[11px] mt-0.5">Semua MK semester berjalan</CardDescription>
              </div>
              <TrendingUp className="h-4 w-4 text-gray-300" />
            </div>
          </CardHeader>
          <CardContent className="h-[160px] px-3 pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.charts.grades} barCategoryGap="35%">
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis
                  dataKey="grade"
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false} tickLine={false}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    border: "1px solid #e5e7eb", borderRadius: 8,
                    fontSize: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
                  }}
                  cursor={{ fill: "#f9fafb" }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {stats.charts.grades.map((entry: any) => (
                    <Cell key={entry.grade} fill={GRADE_COLORS[entry.grade] ?? "#9ca3af"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ─── Baris 2: Radar Ketercapaian CPL + Aktivitas ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Radar Ketercapaian CPL — 2 kolom lebar */}
        <Card className="lg:col-span-2 border border-gray-100 shadow-sm bg-white">
          <CardHeader className="px-5 pt-5 pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-gray-700">Ketercapaian CPL</CardTitle>
                <CardDescription className="text-[11px] mt-0.5">Rata-rata capaian per kompetensi lulusan</CardDescription>
              </div>
              <Link
                href="/laporan/cpl-attainment"
                className="text-[11px] text-gray-400 hover:text-gray-700 flex items-center gap-1 transition-colors"
              >
                Detail <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="h-[220px] px-5 pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="72%" data={stats.charts.cplRadar}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#9ca3af" }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Capaian"
                  dataKey="attainment"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.12}
                  strokeWidth={2}
                />
                <Tooltip
                  contentStyle={{
                    border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Aktivitas — 1 kolom */}
        <Card className="border border-gray-100 shadow-sm">
          <CardHeader className="px-5 pt-5 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-gray-700">Aktivitas Terkini</CardTitle>
              <History className="h-4 w-4 text-gray-300" />
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="space-y-4">
              {stats.recentActivity.length > 0
                ? stats.recentActivity.map((act: any) => (
                    <div key={act.id} className="flex gap-3">
                      <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-300 shrink-0" />
                      <div>
                        <p className="text-[12px] text-gray-700 leading-relaxed">
                          <span className="font-semibold">{act.changedBy.nama_lengkap}</span>{" "}
                          {act.description}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {new Date(act.created_at).toLocaleTimeString("id-ID", {
                            hour: "2-digit", minute: "2-digit"
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                : (
                  <p className="text-[12px] text-gray-400 text-center py-6">Belum ada aktivitas.</p>
                )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── Baris 3: RPS Menunggu Persetujuan ─── */}
      <Card className="border border-gray-100 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between px-5 pt-5 pb-3">
          <div>
            <CardTitle className="text-sm font-semibold text-gray-700">RPS Menunggu Persetujuan</CardTitle>
            <CardDescription className="text-[11px] mt-0.5">
              {hasPendingRps ? "Perlu ditinjau sebelum semester berjalan" : "Semua RPS sudah disetujui ✓"}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {stats.recentRps.length > 0
              ? stats.recentRps.map((r: any) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex gap-3 items-center min-w-0">
                      <div className="h-8 w-8 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0">
                        {r.dosirMk.mk.kode.substring(0, 3)}
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
                      Tinjau <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                ))
              : (
                <div className="col-span-full py-8 text-center">
                  <CheckCircle2 className="h-7 w-7 mx-auto mb-2 text-emerald-400" />
                  <p className="text-sm text-gray-400">Tidak ada RPS yang menunggu persetujuan.</p>
                </div>
              )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Dashboard Dosen
// ---------------------------------------------------------------------------
function DosenDashboard({ stats }: { stats: any }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {stats.myDosirs.map((d: any) => {
          const progress = parseFloat(d.progress) || 0
          const isApproved = d.statusRps === "APPROVED"
          const progressColor =
            progress >= 100 ? "bg-emerald-500" :
            progress >= 50  ? "bg-blue-500" :
            progress > 0    ? "bg-amber-400" :
                              "bg-gray-200"

          return (
            <Card
              key={d.id}
              className="border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all flex flex-col"
            >
              <CardHeader className="px-5 pt-5 pb-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge
                    variant="outline"
                    className="text-[11px] text-gray-500 font-normal border-gray-200"
                  >
                    Kelas {d.kelas}
                  </Badge>
                  <div className={cn(
                    "flex items-center gap-1 text-[11px] font-medium",
                    isApproved ? "text-emerald-600" : "text-amber-500"
                  )}>
                    {isApproved
                      ? <><CheckCircle2 className="h-3.5 w-3.5" /> RPS Aktif</>
                      : <><AlertCircle className="h-3.5 w-3.5" /> Menunggu Persetujuan</>}
                  </div>
                </div>
                <CardTitle className="text-base font-semibold text-gray-800 leading-snug">
                  {d.mk}
                </CardTitle>
              </CardHeader>

              <CardContent className="px-5 pb-5 flex flex-col gap-4 flex-1 justify-between">
                {/* Bagian progres input nilai */}
                <div>
                  <div className="flex justify-between text-[11px] mb-2">
                    <span className="text-gray-500">Input Nilai</span>
                    <span className="font-semibold tabular-nums text-gray-700">
                      <AnimatedNumber value={progress} decimals={0} suffix="%" duration={700} />
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-700", progressColor)}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-300 mt-1">
                    <span>0%</span>
                    <span>{d.students} mahasiswa</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Tombol aksi */}
                <div className="flex gap-2">
                  <Link
                    href="/nilai/input"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "flex-1 gap-1.5 text-xs"
                    )}
                  >
                    <PenSquare className="h-3.5 w-3.5" /> Input Nilai
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
          )
        })}
      </div>
      {stats.myDosirs.length === 0 && <RpsDosenEmpty />}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Ekspor utama
// ---------------------------------------------------------------------------
export function DashboardClient({ stats, role }: { stats: any; role: string }) {
  if (role === "SUPER_ADMIN" || role === "KAPRODI") {
    return <AdminDashboard stats={stats} />
  }
  return <DosenDashboard stats={stats} />
}
