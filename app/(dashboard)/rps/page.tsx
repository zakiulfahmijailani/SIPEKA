import { auth } from "@/lib/auth"
import { db } from "@/db"
import { dosirMk, rps, tahunAkademik } from "@/db/schema"
import { redirect } from "next/navigation"
import { RpsClientPage } from "./rps-client-page"
import { eq, and, like, or, desc } from "drizzle-orm"

export default async function RpsPage(props: {
  searchParams: Promise<{ q?: string; status?: string; ta?: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const searchParams = await props.searchParams
  const q = searchParams.q
  const status = searchParams.status && searchParams.status !== "ALL" ? searchParams.status : undefined
  
  // Get active TA if not filtered
  const activeTa = await db.query.tahunAkademik.findFirst({
    where: eq(tahunAkademik.is_active, true)
  })
  const taId = searchParams.ta || activeTa?.id

  const conditions = []
  if (taId) conditions.push(eq(dosirMk.tahun_akademik_id, taId))
  
  // Filter by user role (Dosen only sees their own)
  if (session.user.role === "DOSEN") {
    conditions.push(eq(dosirMk.dosen_id, session.user.id))
  }

  // Handle RPS status filtering via a subquery or join if needed
  // For now, let's fetch all and filter in memory if simple, or use where sql
  
  const allDosirs = await db.query.dosirMk.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    with: {
      mk: true,
      dosen: true,
      tahunAkademik: true,
      rps: {
        orderBy: [desc(rps.version)],
        limit: 1
      }
    }
  }).catch((e) => {
    console.error("Failed to fetch dosirs for RPS:", e)
    return []
  })

  // In-memory filtering for status and search term (q)
  let filtered = allDosirs
  if (status) {
    filtered = filtered.filter(d => (d.rps?.[0]?.status || "DRAFT") === status)
  }
  if (q) {
    const term = q.toLowerCase()
    filtered = filtered.filter(d => 
      d.mk.nama_id.toLowerCase().includes(term) || 
      d.mk.kode.toLowerCase().includes(term)
    )
  }

  return (
    <RpsClientPage dosirs={filtered} />
  )
}
