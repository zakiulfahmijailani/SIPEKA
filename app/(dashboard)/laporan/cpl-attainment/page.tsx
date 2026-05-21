import { MOCK_SESSION } from "@/lib/mock-session"
import { db } from "@/db"
import { tahunAkademik } from "@/db/schema"
import { redirect } from "next/navigation"
import { desc } from "drizzle-orm"
import CplAttainmentClient from "../cpl-attainment-client"


export const dynamic = "force-dynamic"
export default async function CplReportPage() {
  const session = MOCK_SESSION
  if (session.user.role === "DOSEN" || session.user.role === "VIEWER") {
    // Only Admin/Kaprodi can see global attainment
    // redirect("/dashboard")
  }

  const tas = await db.query.tahunAkademik.findMany({
    orderBy: [desc(tahunAkademik.kode)]
  })

  return (
    <CplAttainmentClient tas={tas} />
  )
}
