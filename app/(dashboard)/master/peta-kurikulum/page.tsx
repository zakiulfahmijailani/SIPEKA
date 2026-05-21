import { db } from "@/db"
import { cpl, mataKuliah } from "@/db/schema"
import { MatrixClient } from "./matrix-client"
import { eq, asc } from "drizzle-orm"

const MOCK_SESSION = { user: { id: "guest", name: "Guest", email: "guest@sipeka.local", role: "SUPER_ADMIN" as const } }

export default async function PetaKurikulumPage() {
  const session = MOCK_SESSION

  const activeCpls = await db.query.cpl.findMany({
    where: eq(cpl.is_active, true),
    orderBy: [asc(cpl.urutan)],
  })

  const activeMks = await db.query.mataKuliah.findMany({
    where: eq(mataKuliah.is_active, true),
    orderBy: [asc(mataKuliah.semester_rekomendasi), asc(mataKuliah.kode)],
  })

  const mappings = await db.query.petaKurikulum.findMany()

  const initialMappings: Record<string, boolean> = {}
  mappings.forEach(map => {
    initialMappings[`${map.mk_id}_${map.cpl_id}`] = true
  })

  return (
    <MatrixClient
      mks={activeMks}
      cpls={activeCpls}
      initialMappings={initialMappings}
      role={session.user.role}
    />
  )
}
