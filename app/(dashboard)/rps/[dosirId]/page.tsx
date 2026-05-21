import { MOCK_SESSION } from "@/lib/mock-session"
import { db } from "@/db"
import { dosirMk, rps, petaKurikulum, cpl } from "@/db/schema"
import { redirect, notFound } from "next/navigation"
import { RpsEditor } from "./rps-editor"
import { eq, and, desc } from "drizzle-orm"


export const dynamic = "force-dynamic"
export default async function RpsEditorPage(props: {
  params: Promise<{ dosirId: string }>
}) {
  const session = MOCK_SESSION

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
  const rpsData = await db.query.rps.findFirst({
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
          cpmkMappings: true
        }
      },
      pertemuans: true,
      referensis: true,
      statusLogs: {
        with: {
          changedBy: true
        },
        orderBy: [desc(rpsStatusLog.created_at)]
      }
    }
  })

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

import { rpsStatusLog } from "@/db/schema"
