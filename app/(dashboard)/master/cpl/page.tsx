import { db } from "@/db"
import { cpl } from "@/db/schema"
import { CplClientPage } from "./cpl-client-page"
import { asc } from "drizzle-orm"

const MOCK_SESSION = { user: { id: "guest", name: "Guest", email: "guest@sipeka.local", role: "SUPER_ADMIN" as const } }

export default async function MasterCPLPage() {
  const session = MOCK_SESSION

  const allCpls = await db.query.cpl.findMany({
    orderBy: [asc(cpl.urutan)],
  })

  return (
    <CplClientPage cpls={allCpls} role={session.user.role} />
  )
}
