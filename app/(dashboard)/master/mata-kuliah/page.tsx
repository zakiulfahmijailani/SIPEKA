import { auth } from "@/lib/auth"
import { db } from "@/db"
import { mataKuliah, petaKurikulum } from "@/db/schema"
import { redirect } from "next/navigation"
import { MkClientPage } from "./mk-client-page"
import { eq, and, asc } from "drizzle-orm"

export default async function MasterMKPage(props: {
  searchParams: Promise<{ semester?: string; status?: string; track?: string }>
}) {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }
  
  // Await the promise for searchParams in Next.js 15
  const searchParams = await props.searchParams;

  const semester = searchParams.semester && searchParams.semester !== "ALL" ? parseInt(searchParams.semester) : undefined
  const status = searchParams.status && searchParams.status !== "ALL" ? searchParams.status as any : undefined
  const track = searchParams.track && searchParams.track !== "ALL" ? searchParams.track as any : undefined

  // Build where conditions
  const conditions = []
  if (semester) conditions.push(eq(mataKuliah.semester_rekomendasi, semester))
  if (status) conditions.push(eq(mataKuliah.status, status))
  if (track) conditions.push(eq(mataKuliah.track, track))

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  // Fetch MK with CPL mappings
  const mkList = await db.query.mataKuliah.findMany({
    where: whereClause,
    orderBy: [asc(mataKuliah.semester_rekomendasi), asc(mataKuliah.kode)],
    with: {
      petaKurikulum: true,
    }
  })

  // Format with cplCount
  const formattedMkList = mkList.map(mk => ({
    ...mk,
    cplCount: mk.petaKurikulum.length
  }))

  return (
    <MkClientPage mks={formattedMkList} role={session.user.role} />
  )
}
