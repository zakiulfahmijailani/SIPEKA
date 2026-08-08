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
  CalendarDays, ClipboardList, BellRing, Database, Layers3, Send,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
function DosenDashboard({ stats, academicTerms }: { stats: any; academicTerms: any[] }) {
  const router = useRouter()
  const selectedYear = stats.selectedYear || academicTerms[0]?.year || ""
  const selectedSemester = String(stats.selectedSemester || academicTerms[0]?.semester || 1)
  const availableYears = [...new Set(academicTerms.map((term) => term.year))]
  const availableSemesters = academicTerms
    .filter((term) => term.year === selectedYear)
    .sort((a, b) => a.semester - b.semester)

  const changePeriod = (year: string, semester: string) => {
    const params = new URLSearchParams()
    params.set("tahun", year)
    params.set("semester", semester)
    router.push(`/dashboard?${params.toString()}`)
  }

  const summaryCards = [
    { label: "RPS Aktif", value: stats.summary?.active || 0, icon: FileText, color: "text-blue-700", bg: "bg-blue-50" },
    { label: "Perlu Revisi", value: stats.summary?.revision || 0, icon: AlertTriangle, color: "text-amber-700", bg: "bg-amber-50" },
    { label: "Menunggu Persetujuan", value: stats.summary?.submitted || 0, icon: Clock, color: "text-violet-700", bg: "bg-violet-50" },
    { label: "Disetujui", value: stats.summary?.approved || 0, icon: CheckCircle2, color: "text-emerald-700", bg: "bg-emerald-50" },
  ]
  const attentionCount = stats.myDosirs.filter((item: any) => item.issues.length > 0 || item.statusRps === "REVISION_REQUIRED").length

  return (
    <div className="space-y-5 pb-10">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-blue-950">Dashboard Dosen</h1>
            <Badge variant="outline" className="border-blue-100 bg-blue-50 text-blue-700">{stats.academicTerm}</Badge>
          </div>
          <p className="mt-1 text-sm text-gray-500">Kelola dokumen pembelajaran dari satu sumber data.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex gap-2 rounded-2xl border border-blue-100 bg-white p-2 shadow-sm">
            <label className="flex min-w-[150px] flex-col gap-1 px-2">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Tahun Ajaran</span>
              <select
                value={selectedYear}
                onChange={(event) => {
                  const year = event.target.value
                  const firstSemester = academicTerms.find((term) => term.year === year)?.semester ?? 1
                  changePeriod(year, String(firstSemester))
                }}
                className="h-8 rounded-lg border-0 bg-blue-50 px-2 text-xs font-semibold text-blue-800 outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {availableYears.map((year) => <option key={year} value={year}>{year}</option>)}
              </select>
            </label>
            <label className="flex min-w-[105px] flex-col gap-1 border-l border-slate-100 px-2">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Semester</span>
              <select
                value={selectedSemester}
                onChange={(event) => changePeriod(selectedYear, event.target.value)}
                className="h-8 rounded-lg border-0 bg-blue-50 px-2 text-xs font-semibold text-blue-800 outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {availableSemesters.map((term) => <option key={term.id} value={term.semester}>{term.semester === 1 ? "Ganjil" : "Genap"}</option>)}
              </select>
            </label>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <BellRing className="h-4 w-4" />
            <strong>{attentionCount}</strong> dokumen perlu perhatian Anda
          </div>
        </div>
      </div>

      <Card className="border-blue-100 bg-white shadow-sm">
        <CardContent className="flex items-center justify-between gap-4 px-6 py-5">
          <div>
            <p className="text-lg font-semibold text-blue-950">Selamat datang kembali</p>
            <p className="text-sm text-gray-500">Lanjutkan dokumen mata kuliah yang sedang Anda ampu.</p>
          </div>
          <div className="hidden rounded-full bg-blue-50 p-3 text-blue-700 sm:block"><GraduationCap className="h-6 w-6" /></div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.label} className="border-gray-100 shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", card.bg, card.color)}><card.icon className="h-5 w-5" /></div>
              <div>
                <p className="text-xs text-gray-500">{card.label}</p>
                <p className={cn("mt-0.5 text-2xl font-bold tabular-nums", card.color)}><AnimatedNumber value={card.value} duration={600} /></p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-blue-950">Mata Kuliah Saya</CardTitle>
            <CardDescription>Progres RPS sekaligus sumber otomatis untuk RPM dan RTM.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
        {stats.myDosirs.map((d: any) => {
          const progress = parseFloat(d.progress) || 0
          const isApproved = d.statusRps === "APPROVED"
          const progressColor =
            progress >= 100 ? "bg-emerald-500" :
            progress >= 50  ? "bg-blue-500" :
            progress > 0    ? "bg-amber-400" :
                              "bg-gray-200"

          return (
            <div
              key={d.id}
              className="rounded-xl border border-gray-100 bg-white p-4 transition-all hover:border-blue-100 hover:shadow-sm"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><BookOpen className="h-5 w-5" /></div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-blue-700">{d.kode} · Kelas {d.kelas}</p>
                    <p className="truncate font-semibold text-gray-900">{d.mk}</p>
                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-gray-500">
                      <SectionCheck done={d.sections.cpmk && d.sections.subCpmk} label="CPL & CPMK" />
                      <SectionCheck done={d.sections.meetings} label="Rencana Mingguan" />
                      <SectionCheck done={d.sections.assessments} label="Asesmen" />
                    </div>
                  </div>
                </div>
                <div className="w-full md:w-44">
                  <div className="mb-2 flex justify-between text-xs"><span className="text-gray-500">RPS</span><strong>{progress}%</strong></div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-100"><div className={cn("h-full rounded-full", progressColor)} style={{ width: `${Math.min(progress, 100)}%` }} /></div>
                  <div className={cn("mt-2 flex items-center gap-1 text-[11px]", isApproved ? "text-emerald-600" : d.statusRps === "REVISION_REQUIRED" ? "text-red-600" : "text-amber-600")}>
                    {isApproved ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                    {isApproved ? "Disetujui" : d.statusRps === "REVISION_REQUIRED" ? "Perlu revisi" : d.statusRps === "SUBMITTED" ? "Menunggu persetujuan" : "Draf"}
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Link
                    href={`/rps/${d.id}`}
                    className={cn(
                      buttonVariants({ variant: "default", size: "sm" }),
                      "gap-1.5 text-xs"
                    )}
                  >
                    <FileText className="h-3.5 w-3.5" /> {progress > 0 ? "Lanjutkan" : "Mulai RPS"}
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
            {stats.myDosirs.length === 0 && <RpsDosenEmpty />}
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card className="border-gray-100 shadow-sm">
            <CardHeader className="pb-3"><CardTitle className="text-base text-blue-950">Prioritas Saya</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {stats.priorities?.length > 0 ? stats.priorities.map((item: any) => (
                <div key={item.id} className="rounded-lg border border-amber-100 bg-amber-50/50 p-3">
                  <p className="text-sm font-semibold text-gray-900">{item.kode} · {item.mk}</p>
                  <p className="mt-1 text-xs text-gray-600">{item.statusRps === "REVISION_REQUIRED" ? "Catatan Kaprodi tersedia" : item.issues[0]}</p>
                  <Link href={`/rps/${item.id}`} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline">Lanjutkan RPS <ArrowRight className="h-3 w-3" /></Link>
                </div>
              )) : (
                <div className="py-5 text-center text-sm text-gray-500"><CheckCircle2 className="mx-auto mb-2 h-6 w-6 text-emerald-500" />Semua dokumen terkendali.</div>
              )}
            </CardContent>
          </Card>

          <Card className="border-gray-100 shadow-sm">
            <CardHeader className="pb-3"><CardTitle className="text-base text-blue-950">Dokumen Otomatis</CardTitle><CardDescription>Terbentuk dari satu sumber data RPS.</CardDescription></CardHeader>
            <CardContent className="grid grid-cols-3 gap-2">
              <DocumentTile href="/rps" label="RPS" icon={FileText} color="text-blue-700 bg-blue-50" />
              <DocumentTile href="/rpm" label="RPM" icon={CalendarDays} color="text-teal-700 bg-teal-50" />
              <DocumentTile href="/rtm" label="RTM" icon={ClipboardList} color="text-violet-700 bg-violet-50" />
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-gray-100 shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-base text-blue-950">Alur Penyelesaian</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-5 gap-2 py-5">
          {[
            [Database, "Data MK"],
            [Target, "CPMK"],
            [CalendarDays, "16 Minggu"],
            [ClipboardList, "Asesmen"],
            [Send, "Ajukan"],
          ].map(([Icon, label], index) => {
            const StepIcon = Icon as React.ElementType
            return (
              <div key={String(label)} className="relative flex flex-col items-center text-center">
                {index < 4 && <div className="absolute left-[58%] top-5 hidden h-px w-[84%] border-t border-dashed border-blue-200 sm:block" />}
                <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-700"><StepIcon className="h-4 w-4" /></div>
                <p className="mt-2 text-xs font-medium text-gray-700">{String(label)}</p>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}

function SectionCheck({ done, label }: { done: boolean; label: string }) {
  return <span className="flex items-center gap-1">{done ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <AlertCircle className="h-3.5 w-3.5 text-amber-500" />}{label}</span>
}

function DocumentTile({ href, label, icon: Icon, color }: { href: string; label: string; icon: React.ElementType; color: string }) {
  return (
    <Link href={href} className="rounded-lg border p-3 text-center transition-colors hover:bg-gray-50">
      <div className={cn("mx-auto flex h-9 w-9 items-center justify-center rounded-lg", color)}><Icon className="h-4 w-4" /></div>
      <p className="mt-2 text-xs font-bold text-gray-800">{label}</p>
    </Link>
  )
}

// ---------------------------------------------------------------------------
// Ekspor utama
// ---------------------------------------------------------------------------
export function DashboardClient({ stats, role, academicTerms = [] }: { stats: any; role: string; academicTerms?: any[] }) {
  if (role === "SUPER_ADMIN" || role === "KAPRODI") {
    return <AdminDashboard stats={stats} />
  }
  return <DosenDashboard stats={stats} academicTerms={academicTerms} />
}
