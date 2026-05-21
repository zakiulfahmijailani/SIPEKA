import { db } from "@/db"
import { mahasiswa } from "@/db/schema"
import { MahasiswaClientPage } from "./mahasiswa-client-page"
import { eq, and, asc, like, or } from "drizzle-orm"

const MOCK_SESSION = { user: { id: "guest", name: "Guest", email: "guest@sipeka.local", role: "SUPER_ADMIN" as const } }

export default async function MahasiswaPage(props: {
  searchParams: Promise<{ q?: string; status?: string; angkatan?: string }>
}) {
  const session = MOCK_SESSION

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
  }).catch((e) => {
    console.error("Failed to fetch students:", e)
    return []
  })

  return (
    <MahasiswaClientPage students={allStudents} />
  )
}
