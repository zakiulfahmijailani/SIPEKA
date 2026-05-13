import { auth } from "@/lib/auth"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { redirect } from "next/navigation"
import ProfilClient from "./profil-client"

export default async function ProfilPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id)
  })

  if (!user) redirect("/login")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profil Pengguna</h1>
        <p className="text-muted-foreground">Kelola informasi akun dan keamanan Anda</p>
      </div>
      <ProfilClient user={user} />
    </div>
  )
}
