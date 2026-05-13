import { auth } from "@/lib/auth"
import { db } from "@/db"
import { dosirMk, tahunAkademik, mahasiswa } from "@/db/schema"
import { redirect } from "next/navigation"
import { EnrollmentClientPage } from "./enrollment-client-page"
import { eq, desc } from "drizzle-orm"

export default async function EnrollmentPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  
  if (session.user.role !== "SUPER_ADMIN" && session.user.role !== "KAPRODI") {
    redirect("/dashboard")
  }

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

  // Fetch Dosirs for active TA with enrollments
  const allDosirs = await db.query.dosirMk.findMany({
    where: eq(dosirMk.tahun_akademik_id, activeTa.id),
    with: {
      mk: true,
      dosen: true,
      tahunAkademik: true,
      enrollments: {
        with: {
          mahasiswa: true
        }
      }
    }
  }).catch((e) => {
    console.error("Failed to fetch dosirs:", e)
    return []
  })

  // Fetch all active students for search
  const allStudents = await db.query.mahasiswa.findMany({
    where: eq(mahasiswa.is_active, true),
    orderBy: [desc(mahasiswa.nim)]
  }).catch((e) => {
    console.error("Failed to fetch students:", e)
    return []
  })

  return (
    <EnrollmentClientPage 
      dosirs={allDosirs} 
      allStudents={allStudents} 
    />
  )
}
