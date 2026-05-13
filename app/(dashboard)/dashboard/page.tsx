import { auth } from "@/lib/auth"
import { db } from "@/db"
import { 
  mataKuliah, cpl, rps, dosirMk, tahunAkademik 
} from "@/db/schema"
import { eq, inArray, and, count } from "drizzle-orm"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Target, FileText, FileCheck, CheckCircle2 } from "lucide-react"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const role = session.user.role
  const userId = session.user.id

  const isSuperAdminOrKaprodi = role === "SUPER_ADMIN" || role === "KAPRODI"
  const isDosen = role === "DOSEN"

  // Fetch active academic year
  const activeTa = await db.query.tahunAkademik.findFirst({
    where: eq(tahunAkademik.is_active, true)
  })

  // === KAPRODI / SUPER ADMIN KPIs ===
  let totalMk = 0, totalCpl = 0, rpsApproved = 0, rpsDraft = 0

  if (isSuperAdminOrKaprodi) {
    const mkCount = await db.select({ value: count() }).from(mataKuliah)
    totalMk = mkCount[0].value

    const cplCount = await db.select({ value: count() }).from(cpl).where(eq(cpl.is_active, true))
    totalCpl = cplCount[0].value

    const approvedRpsCount = await db.select({ value: count() }).from(rps).where(eq(rps.status, "APPROVED"))
    rpsApproved = approvedRpsCount[0].value

    const draftRpsCount = await db.select({ value: count() }).from(rps).where(inArray(rps.status, ["DRAFT", "SUBMITTED", "REVISION_REQUIRED"]))
    rpsDraft = draftRpsCount[0].value
  }

  // === DOSEN KPIs ===
  let mkDiampu = 0, dosenRpsDraft = 0, dosenRpsApproved = 0

  if (isDosen && activeTa) {
    const mkDiampuCount = await db.select({ value: count() })
      .from(dosirMk)
      .where(and(eq(dosirMk.dosen_id, userId), eq(dosirMk.tahun_akademik_id, activeTa.id)))
    mkDiampu = mkDiampuCount[0].value

    const rpsDraftCount = await db.select({ value: count() })
      .from(rps)
      .innerJoin(dosirMk, eq(rps.dosir_mk_id, dosirMk.id))
      .where(
        and(
          eq(dosirMk.dosen_id, userId),
          inArray(rps.status, ["DRAFT", "SUBMITTED", "REVISION_REQUIRED"])
        )
      )
    dosenRpsDraft = rpsDraftCount[0].value

    const rpsApprCount = await db.select({ value: count() })
      .from(rps)
      .innerJoin(dosirMk, eq(rps.dosir_mk_id, dosirMk.id))
      .where(
        and(
          eq(dosirMk.dosen_id, userId),
          eq(rps.status, "APPROVED")
        )
      )
    dosenRpsApproved = rpsApprCount[0].value
  }

  // === DATA TABLE ===
  let courses: any[] = []
  if (activeTa) {
    const condition = isDosen 
      ? and(eq(dosirMk.tahun_akademik_id, activeTa.id), eq(dosirMk.dosen_id, userId))
      : eq(dosirMk.tahun_akademik_id, activeTa.id)

    courses = await db.query.dosirMk.findMany({
      where: condition,
      with: {
        mk: true,
        rps: {
          orderBy: (rps, { desc }) => [desc(rps.version)],
          limit: 1,
        }
      }
    })
  }

  const getStatusBadge = (status: string | undefined) => {
    switch (status) {
      case "APPROVED":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none">Approved</Badge>
      case "SUBMITTED":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-none">Menunggu Review</Badge>
      case "REVISION_REQUIRED":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 border-none">Perlu Revisi</Badge>
      case "DRAFT":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 border-none">Draft</Badge>
      default:
        return <Badge variant="outline" className="text-gray-500">Belum Ada RPS</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-gray-500">
          Selamat datang, {session.user.name}.
          {activeTa ? ` Tahun Akademik Aktif: ${activeTa.nama}` : " Belum ada Tahun Akademik aktif."}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isSuperAdminOrKaprodi && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Mata Kuliah</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalMk}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CPL Aktif</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalCpl}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">RPS Approved</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{rpsApproved}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">RPS Perlu Review/Draft</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{rpsDraft}</div>
              </CardContent>
            </Card>
          </>
        )}

        {isDosen && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">MK Diampu (Semester Ini)</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mkDiampu}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">RPS Approved</CardTitle>
                <FileCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dosenRpsApproved}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">RPS Draft / Review</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dosenRpsDraft}</div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="pt-6">
        <h2 className="text-xl font-semibold mb-4">Mata Kuliah Semester Ini</h2>
        <Card className="overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead>Kode MK</TableHead>
                <TableHead>Nama MK</TableHead>
                <TableHead>SKS</TableHead>
                <TableHead>Kelas</TableHead>
                <TableHead>Status RPS</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.length > 0 ? (
                courses.map((course) => {
                  const rpsStatus = course.rps?.[0]?.status
                  return (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">{course.mk.kode}</TableCell>
                      <TableCell>{course.mk.nama_id}</TableCell>
                      <TableCell>{course.mk.sks_teori + course.mk.sks_praktik}</TableCell>
                      <TableCell>{course.kelas}</TableCell>
                      <TableCell>{getStatusBadge(rpsStatus)}</TableCell>
                      <TableCell className="text-right">
                        <a href={`/rps/${course.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-800">
                          Lihat Detail
                        </a>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    {activeTa ? "Tidak ada mata kuliah yang diampu semester ini." : "Tahun akademik aktif belum diatur."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  )
}
