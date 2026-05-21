import { MOCK_SESSION } from "@/lib/mock-session"
import { db } from "@/db"
import { profilLulusan } from "@/db/schema"
import { ProfilLulusanClientPage } from "./profil-lulusan-client-page"
import { asc } from "drizzle-orm"



export const dynamic = "force-dynamic"
export default async function MasterProfilLulusanPage() {
  const session = MOCK_SESSION

  const allData = await db.query.profilLulusan.findMany({
    orderBy: [asc(profilLulusan.kode)],
  })

  return (
    <ProfilLulusanClientPage data={allData} role={session.user.role} />
  )
}
