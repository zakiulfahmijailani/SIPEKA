"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Save,
  CheckCircle2,
  MousePointerClick,
  FileX2,
  AlertTriangle,
  GraduationCap,
  Loader2,
} from "lucide-react"
import { saveGrades } from "./actions"
import { toast } from "sonner"
import { EmptyState } from "@/components/ui/empty-state"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Animated number hook — counts up from previous to next value
// ---------------------------------------------------------------------------
function useCountUp(target: number, duration = 600) {
  const [display, setDisplay] = useState(target)
  const rafRef = useRef<number | null>(null)
  const prevRef = useRef(target)

  useEffect(() => {
    const from = prevRef.current
    const to = target
    if (from === to) return
    const start = performance.now()
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(parseFloat((from + (to - from) * eased).toFixed(1)))
      if (progress < 1) rafRef.current = requestAnimationFrame(tick)
      else prevRef.current = to
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [target, duration])

  return display
}

// ---------------------------------------------------------------------------
// Animated final score cell
// ---------------------------------------------------------------------------
function AnimatedScore({ value }: { value: number }) {
  const displayed = useCountUp(value)
  return <span className="tabular-nums">{displayed.toFixed(1)}</span>
}

// ---------------------------------------------------------------------------
// Grade config
// ---------------------------------------------------------------------------
type GradeInfo = { grade: string; point: number; cls: string; inputCls: string }

function getGradePoint(score: number): GradeInfo {
  if (score >= 85) return { grade: "A",  point: 4.0, cls: "bg-emerald-500 text-white", inputCls: "border-emerald-400 ring-emerald-200 bg-emerald-50/40" }
  if (score >= 80) return { grade: "AB", point: 3.5, cls: "bg-emerald-400 text-white", inputCls: "border-emerald-300 ring-emerald-100 bg-emerald-50/30" }
  if (score >= 70) return { grade: "B",  point: 3.0, cls: "bg-blue-500 text-white",    inputCls: "border-blue-400 ring-blue-200 bg-blue-50/40" }
  if (score >= 65) return { grade: "BC", point: 2.5, cls: "bg-blue-400 text-white",    inputCls: "border-blue-300 ring-blue-100 bg-blue-50/30" }
  if (score >= 55) return { grade: "C",  point: 2.0, cls: "bg-amber-500 text-white",   inputCls: "border-amber-400 ring-amber-200 bg-amber-50/40" }
  if (score >= 45) return { grade: "D",  point: 1.0, cls: "bg-orange-500 text-white",  inputCls: "border-orange-400 ring-orange-200 bg-orange-50/40" }
  return                  { grade: "E",  point: 0.0, cls: "bg-red-500 text-white",     inputCls: "border-red-400 ring-red-200 bg-red-50/40" }
}

// ---------------------------------------------------------------------------
// Animated Grade Badge — pops when grade letter changes
// ---------------------------------------------------------------------------
function AnimatedGradeBadge({ grade, cls }: { grade: string; cls: string }) {
  const [pop, setPop] = useState(false)
  const prevGrade = useRef(grade)

  useEffect(() => {
    if (grade !== prevGrade.current) {
      setPop(true)
      prevGrade.current = grade
      const t = setTimeout(() => setPop(false), 350)
      return () => clearTimeout(t)
    }
  }, [grade])

  return (
    <Badge
      className={cn(
        cls,
        "border-none min-w-[32px] justify-center transition-colors duration-300 select-none",
        pop && "animate-grade-pop"
      )}
    >
      {grade}
    </Badge>
  )
}

// ---------------------------------------------------------------------------
// Per-row saved checkmark — flashes briefly after save
// ---------------------------------------------------------------------------
function RowSavedIndicator({ visible }: { visible: boolean }) {
  if (!visible) return null
  return (
    <CheckCircle2
      className="h-3.5 w-3.5 text-emerald-500 animate-in fade-in zoom-in-50 duration-300"
    />
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export function InputNilaiClient({
  dosirs,
  initialGrades,
}: {
  dosirs: any[]
  initialGrades: any[]
}) {
  const [selectedDosirId, setSelectedDosirId] = useState<string | null>(null)
  const [grades, setGrades] = useState<Record<string, Record<string, number>>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  // Track which enrollment IDs were included in the last save for per-row indicator
  const [savedRows, setSavedRows] = useState<Set<string>>(new Set())

  const dosir = useMemo(
    () => dosirs.find((d) => d.id === selectedDosirId),
    [selectedDosirId, dosirs]
  )

  const components = useMemo(() => {
    if (!dosir?.rps || dosir.rps.length === 0) return []
    return dosir.rps[0].komponens.sort((a: any, b: any) => a.urutan - b.urutan)
  }, [dosir])

  // Pre-populate grades from DB
  useEffect(() => {
    const g: Record<string, Record<string, number>> = {}
    initialGrades.forEach((item) => {
      if (!g[item.enrollment_id]) g[item.enrollment_id] = {}
      g[item.enrollment_id][item.komponen_id] = parseFloat(item.nilai)
    })
    setGrades(g)
  }, [initialGrades])

  const handleGradeChange = (
    enrollmentId: string,
    komponenId: string,
    value: string
  ) => {
    const num = parseFloat(value) || 0
    if (num < 0 || num > 100) return
    setGrades((prev) => ({
      ...prev,
      [enrollmentId]: { ...prev[enrollmentId], [komponenId]: num },
    }))
    setSavedAt(null)
    // Clear per-row saved indicator for edited row
    setSavedRows((prev) => {
      const next = new Set(prev)
      next.delete(enrollmentId)
      return next
    })
  }

  const calculateFinalGrade = (enrollmentId: string) => {
    if (components.length === 0) return 0
    const studentGrades = grades[enrollmentId] || {}
    let total = 0
    components.forEach((c: any) => {
      const val = studentGrades[c.id] || 0
      total += (val * c.bobot) / 100
    })
    return total
  }

  const handleSave = async () => {
    if (!selectedDosirId) return
    setIsSaving(true)

    const flatData: any[] = []
    const enrollmentIds = new Set<string>()
    Object.entries(grades).forEach(([enId, comps]) => {
      Object.entries(comps).forEach(([compId, val]) => {
        flatData.push({ enrollmentId: enId, komponenId: compId, value: val })
        enrollmentIds.add(enId)
      })
    })

    try {
      const res = await saveGrades(selectedDosirId, flatData)
      if (res.success) {
        setSavedAt(new Date())
        // Flash per-row indicators
        setSavedRows(enrollmentIds)
        setTimeout(() => setSavedRows(new Set()), 2500)
        toast.success("Nilai berhasil disimpan", {
          description: `${flatData.length} entri tersimpan untuk ${dosir?.mk?.nama_id}`,
          icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
        })
      } else {
        toast.error(res.error || "Gagal menyimpan nilai")
      }
    } catch {
      toast.error("Terjadi kesalahan sistem, coba lagi.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      {/* Inject keyframe for grade badge pop animation */}
      <style>{`
        @keyframes grade-pop {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.35); }
          70%  { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        .animate-grade-pop {
          animation: grade-pop 350ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
      `}</style>

      <div className="space-y-6">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Input Nilai</h1>
            <p className="text-muted-foreground text-sm">
              Pilih kelas dan masukkan nilai komponen mahasiswa
            </p>
          </div>

          {selectedDosirId && dosir?.enrollments?.length > 0 && (
            <div className="flex items-center gap-3">
              {savedAt && (
                <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium animate-in fade-in slide-in-from-right-2 duration-300">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Tersimpan {savedAt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
              <Button
                onClick={handleSave}
                disabled={isSaving}
                size="sm"
                className="flex items-center gap-2"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isSaving ? "Menyimpan..." : "Simpan Nilai"}
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar: Pilih Kelas */}
          <Card className="md:col-span-1 h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Pilih Kelas</CardTitle>
              <CardDescription className="text-xs">
                Mata kuliah yang Anda ampu semester ini
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1.5 pt-0">
              {dosirs.length > 0 ? (
                dosirs.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => { setSelectedDosirId(d.id); setSavedAt(null); setSavedRows(new Set()) }}
                    className={cn(
                      "w-full text-left p-3 rounded-lg border transition-all duration-150",
                      selectedDosirId === d.id
                        ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                        : "hover:bg-gray-50 border-gray-100 hover:border-gray-200"
                    )}
                  >
                    <p className="font-semibold text-sm leading-tight">{d.mk.nama_id}</p>
                    <div className="flex justify-between items-center mt-1.5">
                      <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                        {d.kelas}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {d.tahunAkademik.kode}
                      </span>
                    </div>
                  </button>
                ))
              ) : (
                <EmptyState
                  icon={GraduationCap}
                  title="Belum ada kelas aktif"
                  description="Anda belum ditugaskan ke kelas manapun di semester ini."
                  className="py-8"
                />
              )}
            </CardContent>
          </Card>

          {/* Main area */}
          <div className="md:col-span-3 space-y-6">
            {!selectedDosirId && (
              <EmptyState
                icon={MousePointerClick}
                title="Pilih kelas terlebih dahulu"
                description="Klik salah satu kelas di panel kiri untuk mulai menginput nilai komponen mahasiswa."
                className="h-64"
              />
            )}

            {selectedDosirId && (!dosir?.rps || dosir.rps.length === 0) && (
              <EmptyState
                icon={FileX2}
                title="RPS belum tersedia"
                description="Silakan buat dan approve RPS untuk mata kuliah ini sebelum menginput nilai."
                variant="warning"
                className="h-64"
              />
            )}

            {selectedDosirId && dosir?.rps?.length > 0 && (
              <Card>
                <CardHeader className="bg-gray-50/50 border-b border-gray-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{dosir.mk.nama_id}</CardTitle>
                      <CardDescription className="text-xs mt-0.5">
                        {dosir.mk.kode} &bull;{" "}
                        {dosir.mk.sks_teori + dosir.mk.sks_praktik} SKS &bull; Kelas{" "}
                        {dosir.kelas}
                      </CardDescription>
                    </div>
                    <Badge className="bg-blue-600 text-white text-[10px]">AKTIF</Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  {dosir.enrollments.length === 0 ? (
                    <EmptyState
                      icon={GraduationCap}
                      title="Belum ada mahasiswa terdaftar"
                      description="Belum ada mahasiswa yang melakukan enrollment ke kelas ini."
                      className="m-6 border-dashed border-2 border-gray-200 bg-gray-50/50"
                    />
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-100/50 hover:bg-gray-100/50">
                            <TableHead className="w-10 text-center text-xs">No</TableHead>
                            <TableHead className="w-[120px] text-xs">NIM</TableHead>
                            <TableHead className="min-w-[150px] text-xs">Nama Mahasiswa</TableHead>
                            {components.map((c: any) => (
                              <TableHead
                                key={c.id}
                                className="text-center w-[80px]"
                              >
                                <div className="flex flex-col items-center">
                                  <span className="text-[10px] font-bold uppercase">
                                    {c.nama}
                                  </span>
                                  <span className="text-[9px] text-muted-foreground font-normal">
                                    ({c.bobot}%)
                                  </span>
                                </div>
                              </TableHead>
                            ))}
                            <TableHead className="w-[80px] text-center text-xs font-bold">
                              NA
                            </TableHead>
                            <TableHead className="w-[80px] text-center text-xs">
                              GRADE
                            </TableHead>
                            {/* Extra thin column for per-row saved icon */}
                            <TableHead className="w-6" />
                          </TableRow>
                        </TableHeader>

                        <TableBody>
                          {dosir.enrollments.map((en: any, idx: number) => {
                            const finalScore = calculateFinalGrade(en.id)
                            const { grade, cls, inputCls } = getGradePoint(finalScore)
                            const hasScore = finalScore > 0

                            return (
                              <TableRow
                                key={en.id}
                                className="hover:bg-gray-50/50 transition-colors"
                              >
                                <TableCell className="text-center text-xs text-muted-foreground">
                                  {idx + 1}
                                </TableCell>
                                <TableCell className="font-mono text-xs">
                                  {en.mahasiswa.nim}
                                </TableCell>
                                <TableCell className="text-sm font-medium">
                                  {en.mahasiswa.nama_lengkap}
                                </TableCell>

                                {components.map((c: any) => (
                                  <TableCell key={c.id} className="p-1">
                                    <Input
                                      type="number"
                                      className={cn(
                                        "h-8 text-center text-xs tabular-nums transition-colors duration-200",
                                        "focus-visible:ring-blue-500",
                                        hasScore && inputCls
                                      )}
                                      value={grades[en.id]?.[c.id] ?? ""}
                                      onChange={(e) =>
                                        handleGradeChange(en.id, c.id, e.target.value)
                                      }
                                      min="0"
                                      max="100"
                                    />
                                  </TableCell>
                                ))}

                                {/* Animated final score */}
                                <TableCell className="text-center font-bold text-sm">
                                  <AnimatedScore value={finalScore} />
                                </TableCell>

                                {/* Animated grade badge */}
                                <TableCell className="text-center">
                                  <AnimatedGradeBadge grade={grade} cls={cls} />
                                </TableCell>

                                {/* Per-row saved indicator */}
                                <TableCell className="text-center px-1">
                                  <RowSavedIndicator visible={savedRows.has(en.id)} />
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
