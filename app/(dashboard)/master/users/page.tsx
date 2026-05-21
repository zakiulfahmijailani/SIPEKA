import { db } from "@/db"
import { users } from "@/db/schema"
import { UserClientPage } from "./user-client-page"
import { eq, and, asc } from "drizzle-orm"

const MOCK_SESSION = { user: { id: "guest", name: "Guest", email: "guest@sipeka.local", role: "SUPER_ADMIN" as const } }

export default async function UsersPage(props: {
  searchParams: Promise<{ role?: string; status?: string }>
}) {
  const session = MOCK_SESSION

  const searchParams = await props.searchParams
  const role = searchParams.role && searchParams.role !== "ALL" ? searchParams.role as any : undefined
  const status = searchParams.status && searchParams.status !== "ALL" ? searchParams.status : undefined

  const conditions = []
  if (role) conditions.push(eq(users.role, role))
  if (status) conditions.push(eq(users.is_active, status === "true"))

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  const allUsers = await db.query.users.findMany({
    where: whereClause,
    orderBy: [asc(users.nama_lengkap)],
  })

  return (
    <UserClientPage users={allUsers} />
  )
}
