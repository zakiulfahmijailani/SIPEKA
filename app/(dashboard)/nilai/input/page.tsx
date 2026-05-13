import { auth } from "@/lib/auth"
import { db } from "@/db"
import { dosirMk, tahunAkademik, nilai } from "@/db/schema"
import { redirect } from "next/navigation"
import { InputNilaiClient } from "./input-nilai-client"
import { eq, and } from "drizzle-orm"

export default async function InputNilaiPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  // Get active TA
  const activeTa = await db.query.tahunAkademik.findFirst({
    where: eq(tahunAkademik.is_active, true)
  })

  if (!activeTa) {
    return (
      <div className="p-8 text-center bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-amber-800 font-semibold">Tahun Akademik Aktif tidak ditemukan.</p>
        <p className="text-sm text-amber-700 mt-1">Silakan aktifkan Tahun Akademik di menu Master Data.</p>
      </div>
    )
  }

  // Fetch Dosirs based on role
  const whereCondition = session.user.role === "DOSEN" 
    ? and(eq(dosirMk.tahun_akademik_id, activeTa.id), eq(dosirMk.dosen_id, session.user.id))
    : eq(dosirMk.tahun_akademik_id, activeTa.id)

  let myDosirs: Awaited<ReturnType<typeof db.query.dosirMk.findMany>> = []
  try {
    myDosirs = await db.query.dosirMk.findMany({
      where: whereCondition,
      with: {
        mk: true,
        dosen: true,
        tahunAkademik: true,
        rps: {
          with: {
            komponens: true
          }
        },
        enrollments: {
          with: {
            mahasiswa: true
          }
        }
      }
    })
  } catch (e) {
    console.error("Failed to fetch dosirs:", e)
  }

  // Fetch all existing grades for these enrollments to pre-populate
  const enrollmentIds = myDosirs.flatMap(d => d.enrollments.map(e => e.id))
  
  let existingGrades: Awaited<ReturnType<typeof db.query.nilai.findMany>> = []
  if (enrollmentIds.length > 0) {
    try {
      const { inArray } = require("drizzle-orm")
      existingGrades = await db.query.nilai.findMany({
        where: inArray(nilai.enrollment_id, enrollmentIds)
      })
    } catch (e) {
      console.error("Failed to fetch existing grades:", e)
    }
  }

  return (
    <InputNilaiClient 
      dosirs={myDosirs} 
      initialGrades={existingGrades} 
    />
  )
}
