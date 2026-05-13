import { auth } from "@/lib/auth"
import { db } from "@/db"
import { mahasiswa } from "@/db/schema"
import { redirect } from "next/navigation"
import { MahasiswaClientPage } from "./mahasiswa-client-page"
import { eq, and, asc, like, or } from "drizzle-orm"

export default async function MahasiswaPage(props: {
  searchParams: Promise<{ q?: string; status?: string; angkatan?: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")
  
  if (session.user.role !== "SUPER_ADMIN" && session.user.role !== "KAPRODI") {
    redirect("/dashboard")
  }

  const searchParams = await props.searchParams
  const q = searchParams.q
  const status = searchParams.status && searchParams.status !== "ALL" ? searchParams.status as any : undefined
  const angkatan = searchParams.angkatan && searchParams.angkatan !== "ALL" ? parseInt(searchParams.angkatan) : undefined

  const conditions = []
  if (status) conditions.push(eq(mahasiswa.status, status))
  if (angkatan) conditions.push(eq(mahasiswa.angkatan, angkatan))
  
  if (q) {
    conditions.push(or(
      like(mahasiswa.nim, `%${q}%`),
      like(mahasiswa.nama_lengkap, `%${q}%`)
    ))
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  const allStudents = await db.query.mahasiswa.findMany({
    where: whereClause,
    orderBy: [asc(mahasiswa.angkatan), asc(mahasiswa.nim)],
  })

  return (
    <MahasiswaClientPage students={allStudents} />
  )
}
