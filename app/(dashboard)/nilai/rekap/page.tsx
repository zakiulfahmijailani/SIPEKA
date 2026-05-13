import { auth } from "@/lib/auth"
import { db } from "@/db"
import { dosirMk, tahunAkademik, nilai, enrollment, mahasiswa, mataKuliah } from "@/db/schema"
import { redirect } from "next/navigation"
import { eq, and, asc, avg, count, sql } from "drizzle-orm"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, BookOpen, GraduationCap, TrendingUp } from "lucide-react"

export default async function RekapNilaiPage(props: {
  searchParams: Promise<{ ta?: string; mk?: string; angkatan?: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const searchParams = await props.searchParams
  
  // Get active TA if not provided
  const activeTa = await db.query.tahunAkademik.findFirst({
    where: eq(tahunAkademik.is_active, true)
  })

  const taId = searchParams.ta || activeTa?.id
  const mkId = searchParams.mk
  const angkatan = searchParams.angkatan ? parseInt(searchParams.angkatan) : undefined

  if (!taId) return <div className="p-8 text-center">Pilih Tahun Akademik terlebih dahulu.</div>

  // Fetch all enrollments with grades for rekap
  // This is a heavy query, usually we would aggregate in DB
  // But for OBE Rekap, we need fine-grained data
  
  const conditions = [eq(dosirMk.tahun_akademik_id, taId)]
  if (mkId && mkId !== "ALL") conditions.push(eq(dosirMk.mk_id, mkId))
  
  let enrollData: Awaited<ReturnType<typeof db.query.enrollment.findMany>> = []
  try {
    enrollData = await db.query.enrollment.findMany({
      where: sql`${enrollment.dosir_mk_id} IN (SELECT id FROM ${dosirMk} WHERE ${and(...conditions)})`,
      with: {
        mahasiswa: true,
        dosirMk: {
          with: {
            mk: true,
            rps: {
              with: {
                komponens: true
              }
            }
          }
        },
        nilais: true
      }
    })
  } catch (e) {
    console.error("Failed to fetch enrollment data for rekap:", e)
  }

  // Calculate stats
  const studentsFiltered = angkatan 
    ? enrollData.filter(e => e.mahasiswa.angkatan === angkatan)
    : enrollData

  const stats = studentsFiltered.reduce((acc, curr) => {
    // Calculate final score for each enrollment
    let finalScore = 0
    const components = curr.dosirMk.rps?.[0]?.komponens || []
    components.forEach(c => {
      const n = curr.nilais.find(v => v.komponen_id === c.id)
      if (n) finalScore += (parseFloat(n.nilai || "0") * c.bobot) / 100
    })

    acc.totalScore += finalScore
    if (finalScore >= 55) acc.passed++
    
    // Grade distribution
    let grade = "E"
    if (finalScore >= 85) grade = "A"
    else if (finalScore >= 80) grade = "AB"
    else if (finalScore >= 70) grade = "B"
    else if (finalScore >= 65) grade = "BC"
    else if (finalScore >= 55) grade = "C"
    else if (finalScore >= 45) grade = "D"
    
    acc.distribution[grade] = (acc.distribution[grade] || 0) + 1
    
    return { ...acc, finalScores: [...acc.finalScores, finalScore] }
  }, { totalScore: 0, passed: 0, distribution: {} as any, finalScores: [] as number[] })

  const avgScore = stats.finalScores.length > 0 ? stats.totalScore / stats.finalScores.length : 0
  const passRate = stats.finalScores.length > 0 ? (stats.passed / stats.finalScores.length) * 100 : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Rekap Nilai</h1>
        <p className="text-muted-foreground">Laporan ringkasan pencapaian nilai mahasiswa</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600 flex items-center gap-2">
              <Users className="h-4 w-4" /> Total Mahasiswa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{stats.finalScores.length}</div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm bg-purple-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-600 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Rata-rata Nilai
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{avgScore.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> % Kelulusan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{passRate.toFixed(1)}%</div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-amber-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-600 flex items-center gap-2">
              <GraduationCap className="h-4 w-4" /> Grade Terbanyak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900">
              {Object.entries(stats.distribution).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || "-"}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-md border shadow-sm">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-[120px]">NIM</TableHead>
              <TableHead>Nama Mahasiswa</TableHead>
              <TableHead>Mata Kuliah</TableHead>
              <TableHead className="text-center w-[100px]">Nilai Akhir</TableHead>
              <TableHead className="text-center w-[100px]">Grade</TableHead>
              <TableHead className="text-center w-[120px]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {studentsFiltered.length > 0 ? (
              studentsFiltered.map((en, idx) => {
                let finalScore = 0
                const components = en.dosirMk.rps?.[0]?.komponens || []
                components.forEach(c => {
                  const n = en.nilais.find(v => v.komponen_id === c.id)
                  if (n) finalScore += (parseFloat(n.nilai || "0") * c.bobot) / 100
                })
                
                let grade = "E"
                if (finalScore >= 85) grade = "A"
                else if (finalScore >= 80) grade = "AB"
                else if (finalScore >= 70) grade = "B"
                else if (finalScore >= 65) grade = "BC"
                else if (finalScore >= 55) grade = "C"
                else if (finalScore >= 45) grade = "D"

                return (
                  <TableRow key={en.id}>
                    <TableCell className="font-mono text-xs">{en.mahasiswa.nim}</TableCell>
                    <TableCell className="font-medium">{en.mahasiswa.nama_lengkap}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">{en.dosirMk.mk.nama_id}</span>
                        <span className="text-[10px] text-muted-foreground uppercase">{en.dosirMk.kelas}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-bold">{finalScore.toFixed(1)}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="font-bold">{grade}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {finalScore >= 55 
                        ? <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none">LULUS</Badge>
                        : <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-none">TIDAK LULUS</Badge>
                      }
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Tidak ada data nilai yang ditemukan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

import { CheckCircle2 } from "lucide-react"
