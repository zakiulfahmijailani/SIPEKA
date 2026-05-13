import { auth } from "@/lib/auth"
import { db } from "@/db"
import { profilLulusan } from "@/db/schema"
import { redirect } from "next/navigation"
import { ProfilLulusanClientPage } from "./profil-lulusan-client-page"
import { asc } from "drizzle-orm"

export default async function MasterProfilLulusanPage() {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  const allData = await db.query.profilLulusan.findMany({
    orderBy: [asc(profilLulusan.kode)],
  })

  return (
    <ProfilLulusanClientPage data={allData} role={session.user.role} />
  )
}
