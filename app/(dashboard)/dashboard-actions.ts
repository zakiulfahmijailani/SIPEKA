"use server"

import { db } from "@/db"
import { 
  mahasiswa, dosirMk, rps, nilai, cpl, 
  tahunAkademik, auditLog 
} from "@/db/schema"
import { eq, and, count, sql, desc } from "drizzle-orm"
import { calculateCplAttainment } from "./laporan/actions"

export async function getDashboardStats(role: string, userId: string) {
  try {
    const activeTa = await db.query.tahunAkademik.findFirst({
      where: eq(tahunAkademik.is_active, true)
    })

    if (role === "SUPER_ADMIN" || role === "KAPRODI") {
      const [
        totalMahasiswa,
        totalMk,
        pendingRps,
        cplStats
      ] = await Promise.all([
        db.select({ count: count() }).from(mahasiswa).then(res => res[0].count),
        db.select({ count: count() }).from(dosirMk).where(activeTa ? eq(dosirMk.tahun_akademik_id, activeTa.id) : undefined).then(res => res[0].count),
        db.select({ count: count() }).from(rps).where(eq(rps.status, "SUBMITTED")).then(res => res[0].count),
        calculateCplAttainment({ taIds: activeTa ? [activeTa.id] : [] })
      ])

      const recentRps = await db.query.rps.findMany({
        where: eq(rps.status, "SUBMITTED"),
        limit: 5,
        with: {
          dosirMk: {
            with: {
              mk: true,
              dosen: true
            }
          }
        }
      })

      const recentActivity = await db.query.auditLog.findMany({
        limit: 5,
        orderBy: [desc(auditLog.created_at)],
        with: {
          changedBy: true
        }
      })

      // Calculate Grade Distribution (A-E)
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

      return {
        success: true,
        data: {
          kpi: [
            { label: "Total Mahasiswa", value: totalMahasiswa, color: "blue" },
            { label: "MK Berjalan", value: totalMk, color: "purple" },
            { label: "RPS Pending", value: pendingRps, color: "red", badge: pendingRps > 0 },
            { label: "Avg CPL Attainment", value: `${((cplStats.data?.chartData?.reduce((a, b) => a + b.attainment, 0) || 0) / (cplStats.data?.chartData?.length || 1)).toFixed(1)}%`, color: "green" }
          ],
          charts: {
            grades: gradeDistribution,
            cplRadar: cplStats.data?.chartData || []
          },
          recentRps,
          recentActivity
        }
      }
    } else if (role === "DOSEN") {
      const myDosirs = await db.query.dosirMk.findMany({
        where: and(
          eq(dosirMk.dosen_id, userId),
          activeTa ? eq(dosirMk.tahun_akademik_id, activeTa.id) : undefined
        ),
        with: {
          mk: true,
          rps: true,
          enrollments: {
            with: {
              nilais: true
            }
          }
        }
      })

      const processedDosirs = myDosirs.map(d => {
        const totalStudents = d.enrollments.length
        const studentsWithGrades = d.enrollments.filter(e => e.nilais.length > 0).length
        const progress = totalStudents > 0 ? (studentsWithGrades / totalStudents) * 100 : 0
        
        return {
          id: d.id,
          mk: d.mk.nama_id,
          kelas: d.kelas,
          students: totalStudents,
          statusRps: d.rps?.[0]?.status || "DRAFT",
          progress: progress.toFixed(0)
        }
      })

      return {
        success: true,
        data: {
          myDosirs: processedDosirs
        }
      }
    }

    return { success: false, error: "Role tidak dikenali" }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Gagal memuat statistik dashboard" }
  }
}
