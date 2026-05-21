import { asc, count, eq } from "drizzle-orm"

import { db } from "@/db"
import { cpl, mataKuliah, petaKurikulum } from "@/db/schema"
import { SebaranCplClient } from "./sebaran-client"

export const dynamic = "force-dynamic"

export default async function SebaranCplPage() {
  // Query 1: Semua CPL diurutkan berdasarkan urutan
  const allCpl = await db
    .select()
    .from(cpl)
    .where(eq(cpl.is_active, true))
    .orderBy(asc(cpl.urutan))

  // Query 2: Semua MK aktif diurutkan semester -> kode
  const allMK = await db
    .select()
    .from(mataKuliah)
    .where(eq(mataKuliah.is_active, true))
    .orderBy(asc(mataKuliah.semester_rekomendasi), asc(mataKuliah.kode))

  // Query 3: Semua mapping peta_kurikulum
  const allMapping = await db
    .select({
      mk_id: petaKurikulum.mk_id,
      cpl_id: petaKurikulum.cpl_id,
      bobot: petaKurikulum.bobot,
    })
    .from(petaKurikulum)

  // Query 4: Jumlah MK per CPL (untuk summary card)
  const cplSummary = await db
    .select({
      cpl_id: petaKurikulum.cpl_id,
      jumlahMK: count(petaKurikulum.mk_id),
    })
    .from(petaKurikulum)
    .groupBy(petaKurikulum.cpl_id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-blue-900 dark:text-blue-100">
          Sebaran CPL
        </h1>
        <p className="text-muted-foreground">
          Visualisasi matriks dan ringkasan penyebaran CPL ke Mata Kuliah (Semester 1-8)
        </p>
      </div>

      <SebaranCplClient 
        cpls={allCpl} 
        mks={allMK} 
        mappings={allMapping} 
        summaries={cplSummary} 
      />
    </div>
  )
}
