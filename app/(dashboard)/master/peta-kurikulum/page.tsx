import { auth } from "@/lib/auth"
import { db } from "@/db"
import { cpl, mataKuliah } from "@/db/schema"
import { redirect } from "next/navigation"
import { MatrixClient } from "./matrix-client"
import { eq, asc } from "drizzle-orm"

export default async function PetaKurikulumPage() {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  // Fetch active CPLs
  const activeCpls = await db.query.cpl.findMany({
    where: eq(cpl.is_active, true),
    orderBy: [asc(cpl.urutan)],
  })

  // Fetch active MKs
  const activeMks = await db.query.mataKuliah.findMany({
    where: eq(mataKuliah.is_active, true),
    orderBy: [asc(mataKuliah.semester_rekomendasi), asc(mataKuliah.kode)],
  })

  // Fetch all mappings
  const mappings = await db.query.petaKurikulum.findMany()

  // Format initial mappings state { "mkId_cplId": true }
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
