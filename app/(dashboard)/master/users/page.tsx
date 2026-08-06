import { getCurrentSession } from "@/lib/current-session"
import { db } from "@/db"
import { users } from "@/db/schema"
import { UserClientPage } from "./user-client-page"
import { eq, and, asc } from "drizzle-orm"
import { redirect } from "next/navigation"



export const dynamic = "force-dynamic"
type UserRole = (typeof users.$inferSelect)["role"]

export default async function UsersPage(props: {
  searchParams: Promise<{ role?: string; status?: string }>
}) {
  const session = await getCurrentSession()
  if (!session?.user) redirect("/login")
  if (session.user.role !== "SUPER_ADMIN") redirect("/dashboard")

  const searchParams = await props.searchParams
  const validRoles: UserRole[] = ["SUPER_ADMIN", "KAPRODI", "DOSEN", "VIEWER"]
  const role = validRoles.find((item) => item === searchParams.role)
  const status = searchParams.status && searchParams.status !== "ALL" ? searchParams.status : undefined

  const conditions = []
  if (role) conditions.push(eq(users.role, role))
  if (status) conditions.push(eq(users.is_active, status === "true"))

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  const allUsers = await db.query.users.findMany({
    where: whereClause,
    orderBy: [asc(users.nama_lengkap)],
    columns: {
      id: true,
      email: true,
      nama_lengkap: true,
      nidn: true,
      role: true,
      is_active: true,
      created_at: true,
      updated_at: true,
    },
  })

  return (
    <UserClientPage users={allUsers} />
  )
}
