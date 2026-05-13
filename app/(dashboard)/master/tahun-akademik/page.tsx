import { auth } from "@/lib/auth"
import { db } from "@/db"
import { tahunAkademik } from "@/db/schema"
import { redirect } from "next/navigation"
import { TaClientPage } from "./ta-client-page"
import { desc } from "drizzle-orm"

export default async function TahunAkademikPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  
  if (session.user.role !== "SUPER_ADMIN" && session.user.role !== "KAPRODI") {
    redirect("/dashboard")
  }

  const allTas = await db.query.tahunAkademik.findMany({
    orderBy: [desc(tahunAkademik.tahun_mulai), desc(tahunAkademik.semester)],
  })

  return (
    <TaClientPage tas={allTas} role={session.user.role} />
  )
}
