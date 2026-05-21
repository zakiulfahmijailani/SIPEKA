import { MOCK_SESSION } from "@/lib/mock-session"
import { db } from "@/db"
import { mataKuliah } from "@/db/schema"
import { MkClientPage } from "./mk-client-page"
import { eq, and, asc } from "drizzle-orm"



export const dynamic = "force-dynamic"
export default async function MasterMKPage(props: {
  searchParams: Promise<{ semester?: string; status?: string; track?: string }>
}) {
  const session = MOCK_SESSION

  const searchParams = await props.searchParams
  const semester = searchParams.semester && searchParams.semester !== "ALL" ? parseInt(searchParams.semester) : undefined
  const status = searchParams.status && searchParams.status !== "ALL" ? searchParams.status as any : undefined
  const track = searchParams.track && searchParams.track !== "ALL" ? searchParams.track as any : undefined

  const conditions = []
  if (semester) conditions.push(eq(mataKuliah.semester_rekomendasi, semester))
  if (status) conditions.push(eq(mataKuliah.status, status))
  if (track) conditions.push(eq(mataKuliah.track, track))

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  const mkList = await db.query.mataKuliah.findMany({
    where: whereClause,
    orderBy: [asc(mataKuliah.semester_rekomendasi), asc(mataKuliah.kode)],
    with: { petaKurikulum: true },
  })

  const formattedMkList = mkList.map(mk => ({
    ...mk,
    cplCount: mk.petaKurikulum.length
  }))

  return (
    <MkClientPage mks={formattedMkList} role={session.user.role} />
  )
}
