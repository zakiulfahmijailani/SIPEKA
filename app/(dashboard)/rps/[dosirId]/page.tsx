import { getCurrentSession } from "@/lib/current-session"
import { db } from "@/db"
import { rps, petaKurikulum } from "@/db/schema"
import { redirect, notFound } from "next/navigation"
import { RpsEditor } from "./rps-editor"
import { eq, desc } from "drizzle-orm"
import { initializeRpsForDosir } from "../actions"
import { resolveCanonicalRpsAssignment } from "@/lib/rps-assignment-server"

export const dynamic = "force-dynamic"

export default async function RpsEditorPage(props: {
  params: Promise<{ dosirId: string }>
}) {
  const session = await getCurrentSession()
  if (!session?.user) redirect("/login")

  const params = await props.params
  const dosirId = params.dosirId

  // Satu RPS dipakai bersama untuk seluruh kelas MK yang diampu dosen pada semester ini.
  const resolved = await resolveCanonicalRpsAssignment(dosirId)
  if (!resolved) notFound()

  // Authorization check
  if (session.user.role === "DOSEN" && resolved.requested.dosen_id !== session.user.id) {
    redirect("/rps")
  }

  if (resolved.canonical.id !== dosirId) {
    redirect(`/rps/${resolved.canonical.id}`)
  }

  const dosir = resolved.canonical

  // 2. Fetch lightweight RPS header (no heavy joins)
  let rpsData = await db.query.rps.findFirst({
    where: eq(rps.dosir_mk_id, dosir.id),
    orderBy: [desc(rps.version)],
  })
  let initializationError: string | null = null

  // Inisialisasi cepat jika penugasan lama belum memiliki baris RPS
  if (!rpsData) {
    const initResult = await initializeRpsForDosir(dosir.id)
    if (initResult.success && initResult.data) {
      rpsData = initResult.data as any
    } else {
      initializationError = initResult.error || "Gagal menginisialisasi RPS"
    }
  }

  // 3. Fetch CPL mapped to this MK
  const mappedCpls = await db.query.petaKurikulum.findMany({
    where: eq(petaKurikulum.mk_id, dosir.mk_id),
    with: {
      cpl: true
    }
  })

  return (
    <RpsEditor 
      dosir={dosir} 
      initialRps={rpsData} 
      mappedCpls={mappedCpls.map(m => m.cpl)}
      currentUser={session.user}
      initialInitializationError={initializationError}
    />
  )
}
