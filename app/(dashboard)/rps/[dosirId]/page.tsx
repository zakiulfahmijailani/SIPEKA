import { getCurrentSession } from "@/lib/current-session"
import { db } from "@/db"
import { dosirMk, rps, petaKurikulum, rpsStatusLog } from "@/db/schema"
import { redirect, notFound } from "next/navigation"
import { RpsEditor } from "./rps-editor"
import { eq, and, desc } from "drizzle-orm"
import { hydrateBlankRpsFromTemplate } from "../actions"


export const dynamic = "force-dynamic"
export default async function RpsEditorPage(props: {
  params: Promise<{ dosirId: string }>
}) {
  const session = await getCurrentSession()
  if (!session?.user) redirect("/login")

  const params = await props.params
  const dosirId = params.dosirId

  // Fetch dosir details
  const dosir = await db.query.dosirMk.findFirst({
    where: eq(dosirMk.id, dosirId),
    with: {
      mk: true,
      dosen: true,
      tahunAkademik: true,
    }
  })

  if (!dosir) notFound()

  // Authorization check
  if (session.user.role === "DOSEN" && dosir.dosen_id !== session.user.id) {
    redirect("/rps")
  }

  // Fetch existing RPS
  let rpsData = await db.query.rps.findFirst({
    where: eq(rps.dosir_mk_id, dosirId),
    orderBy: [desc(rps.version)],
    with: {
      cpmks: {
        with: {
          cplMappings: {
            with: {
              cpl: true
            }
          },
          subCpmks: true
        }
      },
      komponens: {
        with: {
          cpmkMappings: true,
          subCpmkMappings: true,
          rubrikKriterias: true,
        }
      },
      pertemuans: {
        with: {
          subCpmkMappings: true,
        }
      },
      referensis: true,
      statusLogs: {
        with: {
          changedBy: true
        },
        orderBy: [desc(rpsStatusLog.created_at)]
      }
    }
  })

  const hasOnlyBlankCpmks = rpsData && (rpsData.cpmks.length === 0 || rpsData.cpmks.every((item) => !item.deskripsi.trim()))
  if (hasOnlyBlankCpmks) {
    const hydration = await hydrateBlankRpsFromTemplate(dosirId)
    if (hydration.success && hydration.hydrated) {
      rpsData = await db.query.rps.findFirst({
        where: eq(rps.dosir_mk_id, dosirId),
        orderBy: [desc(rps.version)],
        with: {
          cpmks: { with: { cplMappings: { with: { cpl: true } }, subCpmks: true } },
          komponens: { with: { cpmkMappings: true, subCpmkMappings: true, rubrikKriterias: true } },
          pertemuans: { with: { subCpmkMappings: true } },
          referensis: true,
          statusLogs: { with: { changedBy: true }, orderBy: [desc(rpsStatusLog.created_at)] },
        },
      })
    }
  }

  // Fetch CPL mapped to this MK
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
    />
  )
}
