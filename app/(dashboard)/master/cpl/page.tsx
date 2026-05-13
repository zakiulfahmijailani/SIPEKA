import { auth } from "@/lib/auth"
import { db } from "@/db"
import { cpl } from "@/db/schema"
import { redirect } from "next/navigation"
import { CplClientPage } from "./cpl-client-page"
import { asc } from "drizzle-orm"

export default async function MasterCPLPage() {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  // Fetch all CPLs ordered by urutan
  const allCpls = await db.query.cpl.findMany({
    orderBy: [asc(cpl.urutan)],
  })

  return (
    <CplClientPage cpls={allCpls} role={session.user.role} />
  )
}
