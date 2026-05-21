import { MOCK_SESSION } from "@/lib/mock-session"
import { db } from "@/db"
import { cpl } from "@/db/schema"
import { CplClientPage } from "./cpl-client-page"
import { asc } from "drizzle-orm"



export const dynamic = "force-dynamic"
export default async function MasterCPLPage() {
  const session = MOCK_SESSION

  const allCpls = await db.query.cpl.findMany({
    orderBy: [asc(cpl.urutan)],
  })

  return (
    <CplClientPage cpls={allCpls} role={session.user.role} />
  )
}
