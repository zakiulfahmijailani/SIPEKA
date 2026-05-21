import { MOCK_SESSION } from "@/lib/mock-session"
import { db } from "@/db"
import { tahunAkademik } from "@/db/schema"
import { TaClientPage } from "./ta-client-page"
import { desc } from "drizzle-orm"



export const dynamic = "force-dynamic"
export default async function TahunAkademikPage() {
  const session = MOCK_SESSION

  const allTas = await db.query.tahunAkademik.findMany({
    orderBy: [desc(tahunAkademik.tahun_mulai), desc(tahunAkademik.semester)],
  })

  return (
    <TaClientPage tas={allTas} role={session.user.role} />
  )
}
