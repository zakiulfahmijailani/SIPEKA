"use server"

import { db } from "@/db"
import { 
  mahasiswa, dosirMk, rps, nilai, cpl, 
  tahunAkademik, auditLog 
} from "@/db/schema"
import { eq, and, count, sql, desc } from "drizzle-orm"
import { calculateCplAttainment } from "./laporan/actions"
import { calculateRpsReadiness } from "@/lib/rps-readiness"

export async function getDashboardStats(role: string, userId: string, selectedTaId?: string) {
  try {
    const activeTa = selectedTaId
      ? await db.query.tahunAkademik.findFirst({ where: eq(tahunAkademik.id, selectedTaId) })
      : await db.query.tahunAkademik.findFirst({ where: eq(tahunAkademik.is_active, true) })

    if (role === "SUPER_ADMIN" || role === "KAPRODI") {
      const [
        totalMahasiswaRes,
        totalMkRes,
        pendingRpsRes,
        cplStats
      ] = await Promise.all([
        db.select({ count: count() }).from(mahasiswa).catch(() => [{ count: 0 }]),
        db.select({ count: count() }).from(dosirMk).where(activeTa ? eq(dosirMk.tahun_akademik_id, activeTa.id) : undefined).catch(() => [{ count: 0 }]),
        db.select({ count: count() }).from(rps).where(eq(rps.status, "SUBMITTED")).catch(() => [{ count: 0 }]),
        calculateCplAttainment({ taIds: activeTa ? [activeTa.id] : [] })
      ])

      const totalMahasiswa = totalMahasiswaRes[0].count
      const totalMk = totalMkRes[0].count
      const pendingRps = pendingRpsRes[0].count

      const recentRps = await db.query.rps.findMany({
        where: eq(rps.status, "SUBMITTED"),
        limit: 6,
        with: {
          dosirMk: {
            with: { mk: true, dosen: true }
          }
        }
      }).catch(() => [])

      const recentActivity = await db.query.auditLog.findMany({
        limit: 6,
        orderBy: [desc(auditLog.created_at)],
        with: { changedBy: true }
      }).catch(() => [])

      // Grade distribution
      const gradeDistribution = await db.select({
        grade: sql<string>`CASE 
          WHEN nilai >= 80 THEN 'A'
          WHEN nilai >= 75 THEN 'AB'
          WHEN nilai >= 70 THEN 'B'
          WHEN nilai >= 65 THEN 'BC'
          WHEN nilai >= 60 THEN 'C'
          WHEN nilai >= 45 THEN 'D'
          ELSE 'E'
        END`,
        count: count()
      })
      .from(nilai)
      .groupBy(sql`grade`)
      .catch(() => [])

      const chartData = cplStats.data?.chartData || []
      // Return avgAttainment as number (not string) for AnimatedNumber
      const avgAttainment = chartData.length > 0
        ? parseFloat(
            (chartData.reduce((a: any, b: any) => a + b.attainment, 0) / chartData.length).toFixed(1)
          )
        : 0

      return {
        success: true,
        data: {
          kpi: [
            { label: "Total Mahasiswa",   value: totalMahasiswa, color: "blue" },
            { label: "MK Berjalan",        value: totalMk,        color: "purple" },
            { label: "RPS Pending",        value: pendingRps,     color: "red",   badge: pendingRps > 0 },
            { label: "Avg CPL Attainment", value: avgAttainment,  color: "green" },
          ],
          charts: { grades: gradeDistribution, cplRadar: chartData },
          recentRps,
          recentActivity,
        }
      }
    }

    if (role === "DOSEN") {
      const myDosirs = await db.query.dosirMk.findMany({
        where: and(
          eq(dosirMk.dosen_id, userId),
          activeTa ? eq(dosirMk.tahun_akademik_id, activeTa.id) : undefined
        ),
        with: {
          mk: true,
          tahunAkademik: true,
          rps: {
            with: {
              cpmks: { with: { cplMappings: true, subCpmks: true } },
              pertemuans: { with: { subCpmkMappings: true } },
              komponens: { with: { cpmkMappings: true, subCpmkMappings: true } },
              referensis: true,
            }
          },
          enrollments: { with: { nilais: true } }
        }
      })

      const processedDosirs = myDosirs.map(d => {
        const latestRps = [...d.rps].sort((a, b) => b.version - a.version)[0] ?? null
        const readiness = calculateRpsReadiness(latestRps)
        const totalStudents = d.enrollments.length
        const studentsWithGrades = d.enrollments.filter(e => e.nilais.length > 0).length
        const gradeProgress = totalStudents > 0 ? (studentsWithGrades / totalStudents) * 100 : 0
        return {
          id: d.id,
          kode: d.mk.kode,
          mk: d.mk.nama_id,
          kelas: d.kelas,
          tahunAkademik: d.tahunAkademik.kode,
          students: totalStudents,
          rpsId: latestRps?.id ?? null,
          statusRps: latestRps?.status || "DRAFT",
          progress: readiness.progress,
          gradeProgress: parseFloat(gradeProgress.toFixed(1)),
          totalBobot: readiness.totalBobot,
          issues: readiness.issues,
          sections: readiness.sections,
        }
      })

      const summary = {
        active: processedDosirs.length,
        revision: processedDosirs.filter(item => item.statusRps === "REVISION_REQUIRED").length,
        submitted: processedDosirs.filter(item => item.statusRps === "SUBMITTED").length,
        approved: processedDosirs.filter(item => item.statusRps === "APPROVED").length,
      }
      const priorities = processedDosirs
        .filter(item => item.statusRps === "REVISION_REQUIRED" || item.issues.length > 0)
        .sort((a, b) => {
          if (a.statusRps === "REVISION_REQUIRED" && b.statusRps !== "REVISION_REQUIRED") return -1
          if (b.statusRps === "REVISION_REQUIRED" && a.statusRps !== "REVISION_REQUIRED") return 1
          return a.progress - b.progress
        })
        .slice(0, 3)

      return {
        success: true,
        data: {
          myDosirs: processedDosirs,
          summary,
          priorities,
          academicTerm: activeTa?.nama || activeTa?.kode || "Semester aktif",
          selectedYear: activeTa ? `${activeTa.tahun_mulai}/${activeTa.tahun_mulai + 1}` : "",
          selectedSemester: activeTa?.semester ?? 1,
        },
      }
    }

    return { success: false, error: "Role tidak dikenali" }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Gagal memuat statistik dashboard" }
  }
}
