"use client"

import { useState, useMemo, useEffect } from "react"
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
import { Save, Info, CheckCircle2 } from "lucide-react"
import { saveGrades } from "./actions"
import { toast } from "sonner"

export function InputNilaiClient({ 
  dosirs,
  initialGrades 
}: { 
  dosirs: any[],
  initialGrades: any[] 
}) {
  const [selectedDosirId, setSelectedDosirId] = useState<string | null>(null)
  const [grades, setGrades] = useState<Record<string, Record<string, number>>>({})
  const [isSaving, setIsSaving] = useState(false)

  // Find selected dosir data
  const dosir = useMemo(() => dosirs.find(d => d.id === selectedDosirId), [selectedDosirId, dosirs])
  
  // Get assessment components from RPS (using the first one found)
  const components = useMemo(() => {
    if (!dosir?.rps || dosir.rps.length === 0) return []
    return dosir.rps[0].komponens.sort((a: any, b: any) => a.urutan - b.urutan)
  }, [dosir])

  // Initialize grades from DB
  useEffect(() => {
    const g: Record<string, Record<string, number>> = {}
    initialGrades.forEach(item => {
      if (!g[item.enrollment_id]) g[item.enrollment_id] = {}
      g[item.enrollment_id][item.komponen_id] = parseFloat(item.nilai)
    })
    setGrades(g)
  }, [initialGrades])

  const handleGradeChange = (enrollmentId: string, komponenId: string, value: string) => {
    const num = parseFloat(value) || 0
    if (num < 0 || num > 100) return
    
    setGrades(prev => ({
      ...prev,
      [enrollmentId]: {
        ...prev[enrollmentId],
        [komponenId]: num
      }
    }))
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

  const getGradePoint = (score: number) => {
    if (score >= 85) return { grade: "A", point: 4.0, color: "bg-green-500" }
    if (score >= 80) return { grade: "AB", point: 3.5, color: "bg-green-400" }
    if (score >= 70) return { grade: "B", point: 3.0, color: "bg-blue-500" }
    if (score >= 65) return { grade: "BC", point: 2.5, color: "bg-blue-400" }
    if (score >= 55) return { grade: "C", point: 2.0, color: "bg-amber-500" }
    if (score >= 45) return { grade: "D", point: 1.0, color: "bg-orange-500" }
    return { grade: "E", point: 0.0, color: "bg-red-500" }
  }

  const handleSave = async () => {
    if (!selectedDosirId) return

    setIsSaving(true)
    const flatData: any[] = []
    Object.entries(grades).forEach(([enId, comps]) => {
      Object.entries(comps).forEach(([compId, val]) => {
        flatData.push({ enrollmentId: enId, komponenId: compId, value: val })
      })
    })

    try {
      const res = await saveGrades(selectedDosirId, flatData)
      if (res.success) {
        toast.success("Nilai berhasil disimpan")
      } else {
        toast.error(res.error || "Gagal menyimpan")
      }
    } catch (error) {
      toast.error("Kesalahan sistem")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Input Nilai</h1>
          <p className="text-muted-foreground">Pilih kelas dan masukkan nilai komponen mahasiswa</p>
        </div>
        {selectedDosirId && dosir?.enrollments?.length > 0 && (
          <Button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            {isSaving ? "Menyimpan..." : "Simpan Nilai"}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Pilih Kelas</CardTitle>
            <CardDescription>Daftar mata kuliah yang Anda ampu</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {dosirs.length > 0 ? (
              dosirs.map((d) => (
                <div 
                  key={d.id}
                  onClick={() => setSelectedDosirId(d.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedDosirId === d.id 
                      ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500" 
                      : "hover:bg-gray-50 border-gray-100"
                  }`}
                >
                  <p className="font-semibold text-sm">{d.mk.nama_id}</p>
                  <div className="flex justify-between items-center mt-1">
                    <Badge variant="outline" className="text-[10px]">{d.kelas}</Badge>
                    <span className="text-[10px] text-gray-500">{d.tahunAkademik.kode}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground italic">Tidak ada kelas aktif.</p>
            )}
          </CardContent>
        </Card>

        <div className="md:col-span-3 space-y-6">
          {!selectedDosirId ? (
            <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed rounded-lg bg-gray-50">
              <Info className="h-8 w-8 text-gray-300 mb-2" />
              <p className="text-muted-foreground">Pilih kelas di sebelah kiri untuk mulai menginput nilai.</p>
            </div>
          ) : !dosir?.rps || dosir.rps.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed rounded-lg bg-red-50">
              <AlertCircle className="h-8 w-8 text-red-300 mb-2" />
              <p className="text-red-800 font-semibold">RPS belum tersedia!</p>
              <p className="text-sm text-red-600 mt-1">Silakan buat/approve RPS untuk mata kuliah ini terlebih dahulu.</p>
            </div>
          ) : (
            <Card>
              <CardHeader className="bg-gray-50/50">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{dosir.mk.nama_id}</CardTitle>
                    <CardDescription>
                      {dosir.mk.kode} • {dosir.mk.sks_teori + dosir.mk.sks_praktik} SKS • Kelas {dosir.kelas}
                    </CardDescription>
                  </div>
                  <Badge className="bg-blue-600">AKTIF</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-100/50">
                        <TableHead className="w-10 text-center">No</TableHead>
                        <TableHead className="w-[120px]">NIM</TableHead>
                        <TableHead className="min-w-[150px]">Nama Mahasiswa</TableHead>
                        {components.map((c: any) => (
                          <TableHead key={c.id} className="text-center w-[80px]">
                            <div className="flex flex-col items-center">
                              <span className="text-[10px] font-bold uppercase">{c.nama}</span>
                              <span className="text-[9px] text-muted-foreground font-normal">({c.bobot}%)</span>
                            </div>
                          </TableHead>
                        ))}
                        <TableHead className="w-[80px] text-center font-bold">NA</TableHead>
                        <TableHead className="w-[80px] text-center">GRADE</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dosir.enrollments.length > 0 ? (
                        dosir.enrollments.map((en: any, idx: number) => {
                          const finalScore = calculateFinalGrade(en.id)
                          const { grade, point, color } = getGradePoint(finalScore)
                          
                          return (
                            <TableRow key={en.id} className="hover:bg-gray-50/50 transition-colors">
                              <TableCell className="text-center text-xs text-muted-foreground">{idx + 1}</TableCell>
                              <TableCell className="font-mono text-xs">{en.mahasiswa.nim}</TableCell>
                              <TableCell className="text-sm font-medium">{en.mahasiswa.nama_lengkap}</TableCell>
                              {components.map((c: any) => (
                                <TableCell key={c.id} className="p-1">
                                  <Input 
                                    type="number"
                                    className="h-8 text-center text-xs focus-visible:ring-blue-500"
                                    value={grades[en.id]?.[c.id] || ""}
                                    onChange={(e) => handleGradeChange(en.id, c.id, e.target.value)}
                                    min="0"
                                    max="100"
                                  />
                                </TableCell>
                              ))}
                              <TableCell className="text-center font-bold text-sm">
                                {finalScore.toFixed(1)}
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge className={`${color} text-white border-none min-w-[32px] justify-center`}>
                                  {grade}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          )
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={components.length + 5} className="text-center py-12 text-muted-foreground">
                            <GraduationCapIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                            Belum ada mahasiswa yang terdaftar di kelas ini.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

import { AlertCircle, GraduationCap as GraduationCapIcon } from "lucide-react"
