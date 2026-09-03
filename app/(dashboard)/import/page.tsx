import { redirect } from "next/navigation"

import { OperationalWorkbookImport } from "./operational-workbook-import"
import { getCurrentSession } from "@/lib/current-session"

export const dynamic = "force-dynamic"

export default async function ImportPage() {
  const session = await getCurrentSession()
  if (!session?.user) redirect("/login")
  if (!["SUPER_ADMIN", "KAPRODI"].includes(session.user.role)) redirect("/dashboard")

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <p className="text-sm font-medium text-emerald-700">Sinkronisasi kurikulum</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gray-950">
          Impor workbook operasional
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
          SIPEKA membaca struktur T2, T9, T12b, T14, T15, T17 PenilaianCPMK, dan T18a. Metode penilaian CPMK dari T17 ikut disimpan sebagai template RPS.
          otomatis menjadi titik awal dokumen dosen tanpa mengubah RPS yang sudah dikerjakan.
        </p>
      </div>

      <OperationalWorkbookImport />
    </div>
  )
}
