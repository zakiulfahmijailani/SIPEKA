import { auth } from "@/lib/auth"
import { db } from "@/db"
import { tahunAkademik } from "@/db/schema"
import { redirect } from "next/navigation"
import { desc } from "drizzle-orm"
import CplAttainmentClient from "../cpl-attainment-client"

export default async function CplReportPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
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
