import { db } from "@/db"
import { tahunAkademik } from "@/db/schema"
import { TaClientPage } from "./ta-client-page"
import { desc } from "drizzle-orm"

const MOCK_SESSION = { user: { id: "guest", name: "Guest", email: "guest@sipeka.local", role: "SUPER_ADMIN" as const } }

export default async function TahunAkademikPage() {
  const session = MOCK_SESSION

  const allTas = await db.query.tahunAkademik.findMany({
    orderBy: [desc(tahunAkademik.tahun_mulai), desc(tahunAkademik.semester)],
  })

  return (
    <TaClientPage tas={allTas} role={session.user.role} />
  )
}
