import { auth } from "@/lib/auth"
import { db } from "@/db"
import { dosirMk, mataKuliah, users, tahunAkademik } from "@/db/schema"
import { redirect } from "next/navigation"
import { DosirClientPage } from "./dosir-client-page"
import { eq, and, asc, desc } from "drizzle-orm"

export default async function DosirMkPage(props: {
  searchParams: Promise<{ ta?: string; mk?: string; dosen?: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")
  
  if (session.user.role !== "SUPER_ADMIN" && session.user.role !== "KAPRODI") {
    redirect("/dashboard")
  }

  const searchParams = await props.searchParams

  // Fetch reference data for selects/comboboxes
  const allTas = await db.query.tahunAkademik.findMany({
    orderBy: [desc(tahunAkademik.tahun_mulai), desc(tahunAkademik.semester)],
  })
  
  const activeTa = allTas.find(t => t.is_active === "true")

  const allMks = await db.query.mataKuliah.findMany({
    where: eq(mataKuliah.is_active, "true"),
    orderBy: [asc(mataKuliah.kode)],
  })

  const allDosens = await db.query.users.findMany({
    where: eq(users.role, "DOSEN"),
    orderBy: [asc(users.nama_lengkap)],
  })

  // Build filter
  const taFilter = searchParams.ta && searchParams.ta !== "ALL" ? searchParams.ta : (activeTa?.id || undefined)
  const mkFilter = searchParams.mk && searchParams.mk !== "ALL" ? searchParams.mk : undefined
  const dosenFilter = searchParams.dosen && searchParams.dosen !== "ALL" ? searchParams.dosen : undefined

  const conditions = []
  if (taFilter) conditions.push(eq(dosirMk.tahun_akademik_id, taFilter))
  if (mkFilter) conditions.push(eq(dosirMk.mk_id, mkFilter))
  if (dosenFilter) conditions.push(eq(dosirMk.dosen_id, dosenFilter))

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  // Fetch dosir data
  const dosirData = await db.query.dosirMk.findMany({
    where: whereClause,
    with: {
      mk: true,
      dosen: true,
      tahunAkademik: true,
    },
    orderBy: [asc(dosirMk.kelas)],
  })

  // Format labels for client component
  const mksFormatted = allMks.map(m => ({ id: m.id, label: `${m.kode} - ${m.nama_id}` }))
  const dosensFormatted = allDosens.map(d => ({ id: d.id, label: d.nama_lengkap }))
  const tasFormatted = allTas.map(t => ({ id: t.id, label: t.kode }))

  return (
    <DosirClientPage 
      dosirs={dosirData} 
      mks={mksFormatted}
      dosens={dosensFormatted}
      tas={tasFormatted}
      activeTaId={activeTa?.id}
    />
  )
}
