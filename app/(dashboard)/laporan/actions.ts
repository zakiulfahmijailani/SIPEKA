"use server"

import { db } from "@/db"
import { 
  enrollment, nilai, komponenPenilaian, 
  cpmk, cpl, dosirMk, mataKuliah, rps,
  mahasiswa, tahunAkademik
} from "@/db/schema"
import { eq, and, inArray, sql, avg } from "drizzle-orm"

export async function calculateCplAttainment(filters: {
  taIds?: string[];
  angkatan?: number;
}) {
  try {
    // 1. Fetch relevant enrollments
    const conditions = []
    if (filters.taIds && filters.taIds.length > 0) {
      conditions.push(inArray(dosirMk.tahun_akademik_id, filters.taIds))
    }
    
    const students = await db.query.enrollment.findMany({
      where: conditions.length > 0 ? sql`${enrollment.dosir_mk_id} IN (SELECT id FROM ${dosirMk} WHERE ${and(...conditions)})` : undefined,
      with: {
        mahasiswa: true,
        nilais: true,
        dosirMk: {
          with: {
            mk: true,
            rps: {
              with: {
                komponens: {
                  with: {
                    cpmkMappings: true
                  }
                },
                cpmks: {
                  with: {
                    cplMappings: true
                  }
                }
              }
            }
          }
        }
      }
    })

    // Filter by angkatan in memory for simplicity if needed
    const filteredStudents = filters.angkatan 
      ? students.filter(s => s.mahasiswa.angkatan === filters.angkatan)
      : students

    // 2. Calculation logic
    // We need to map CPL -> Attainment
    const cplAttainmentMap: Record<string, { totalScore: number; count: number; passedCount: number }> = {}
    
    // Also track contribution per MK for drill-down
    const mkContribution: Record<string, Record<string, { avgScore: number; studentCount: number }>> = {}

    for (const student of filteredStudents) {
      const activeRps = student.dosirMk.rps?.[0]
      if (!activeRps) continue

      const mkId = student.dosirMk.mk_id
      if (!mkContribution[mkId]) mkContribution[mkId] = {}

      // Calculate Nilai per CPMK
      const cpmkScores: Record<string, number> = {}
      for (const cp of activeRps.cpmks) {
        // Find components measuring this CPMK
        const measuringComponents = activeRps.komponens.filter(k => 
          k.cpmkMappings.some((m: any) => m.cpmk_id === cp.id)
        )
        
        if (measuringComponents.length === 0) continue

        let totalWeight = measuringComponents.reduce((sum, k) => sum + k.bobot, 0)
        let weightedScore = 0
        
        for (const comp of measuringComponents) {
          const scoreObj = student.nilais.find(n => n.komponen_id === comp.id)
          const score = parseFloat(scoreObj?.nilai || "0")
          weightedScore += (score * comp.bobot)
        }

        const finalCpmkScore = weightedScore / totalWeight
        cpmkScores[cp.id] = finalCpmkScore

        // Map to CPL
        const targetCplId = cp.cplMappings?.[0]?.cpl_id
        if (targetCplId) {
          if (!cplAttainmentMap[targetCplId]) {
            cplAttainmentMap[targetCplId] = { totalScore: 0, count: 0, passedCount: 0 }
          }
          cplAttainmentMap[targetCplId].totalScore += finalCpmkScore
          cplAttainmentMap[targetCplId].count++
          if (finalCpmkScore >= 55) cplAttainmentMap[targetCplId].passedCount++

          // MK Contribution
          if (!mkContribution[mkId][targetCplId]) {
             mkContribution[mkId][targetCplId] = { avgScore: 0, studentCount: 0 }
          }
          mkContribution[mkId][targetCplId].avgScore += finalCpmkScore
          mkContribution[mkId][targetCplId].studentCount++
        }
      }
    }

    // 3. Format results for charts and tables
    const allCpls = await db.query.cpl.findMany({ where: eq(cpl.is_active, true) })
    
    const chartData = allCpls.map(c => {
      const stats = cplAttainmentMap[c.id]
      const attainment = stats ? (stats.totalScore / stats.count) : 0
      const passRate = stats ? (stats.passedCount / stats.count) * 100 : 0
      
      return {
        subject: c.kode,
        attainment: parseFloat(attainment.toFixed(2)),
        passRate: parseFloat(passRate.toFixed(1)),
        fullMark: 100
      }
    })

    const tableData = allCpls.map(c => {
      const stats = cplAttainmentMap[c.id]
      const attainment = stats ? (stats.totalScore / stats.count) : 0
      const passRate = stats ? (stats.passedCount / stats.count) * 100 : 0
      
      return {
        id: c.id,
        kode: c.kode,
        rumusan: c.rumusan,
        target: 75,
        capaian: parseFloat(passRate.toFixed(1)),
        avgScore: parseFloat(attainment.toFixed(2)),
        status: passRate >= 75 ? "✅" : passRate >= 50 ? "⚠️" : "❌"
      }
    })

    return { 
      success: true, 
      data: { 
        chartData, 
        tableData,
        mkContribution 
      } 
    }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Gagal menghitung attainment CPL" }
  }
}

export async function getIs2020Coverage() {
  try {
    // Matrix of KA vs MK
    // MK -> CPL -> KA
    const allMk = await db.query.mataKuliah.findMany({ 
      where: eq(mataKuliah.is_active, true),
      with: {
        petaKurikulum: {
          with: {
            cpl: {
              with: {
                is2020AreaMappings: {
                  with: {
                    is2020Area: {
                      with: {
                        realm: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    const allKa = await db.query.is2020Area.findMany({
      with: { realm: true }
    })

    const matrix: any[] = allKa.map(ka => {
      const row: any = { kaId: ka.id, kaName: ka.nama, realm: ka.realm.nama }
      allMk.forEach(mk => {
        const covers = mk.petaKurikulum.some(p => 
          p.cpl.is2020AreaMappings.some(m => m.is2020_area_id === ka.id)
        )
        row[mk.kode] = covers
      })
      return row
    })

    // Realm summary
    const realms = await db.query.is2020Realm.findMany()
    const realmSummary = realms.map(r => {
      const kaInRealm = allKa.filter(ka => ka.realm_id === r.id)
      const coveredKa = kaInRealm.filter(ka => 
        allMk.some(mk => 
          mk.petaKurikulum.some(p => 
            p.cpl.is2020AreaMappings.some(m => m.is2020_area_id === ka.id)
          )
        )
      )
      return {
        name: r.nama,
        total: kaInRealm.length,
        covered: coveredKa.length,
        percentage: (coveredKa.length / kaInRealm.length) * 100
      }
    })

    return { success: true, data: { matrix, realmSummary, allMkCodes: allMk.map(m => m.kode) } }
  } catch (error) {
    return { success: false, error: "Gagal memuat laporan IS2020" }
  }
}
