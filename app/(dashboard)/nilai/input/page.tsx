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

  const myDosirs = await db.query.dosirMk.findMany({
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

  // Fetch all existing grades for these enrollments to pre-populate
  const enrollmentIds = myDosirs.flatMap(d => d.enrollments.map(e => e.id))
  
  let existingGrades: any[] = []
  if (enrollmentIds.length > 0) {
    // Note: Drizzle in() operator needs a non-empty array
    // We'll use a transaction or similar if needed, but for now simple query
    existingGrades = await db.query.nilai.findMany({
      // We can filter by enrollmentIds if we want to be precise, or just fetch all
      // For simplicity and since it's a specific page, we'll fetch what we need
    })
    
    // Actually, filter by enrollmentIds to be efficient
    const { inArray } = require("drizzle-orm")
    existingGrades = await db.query.nilai.findMany({
      where: inArray(nilai.enrollment_id, enrollmentIds)
    })
  }

  return (
    <InputNilaiClient 
      dosirs={myDosirs} 
      initialGrades={existingGrades} 
    />
  )
}
