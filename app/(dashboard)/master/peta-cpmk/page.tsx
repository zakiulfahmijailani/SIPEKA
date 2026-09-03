import { MOCK_SESSION } from "@/lib/mock-session"
import { CURRICULUM_2026_MATA_KULIAH } from "@/db/curriculum-2026"
import { CURRICULUM_2026_CPL } from "@/db/curriculum-2026-reference"
import {
  CURRICULUM_2026_CPMK,
  CURRICULUM_2026_SUB_CPMK,
  CURRICULUM_2026_MK_CPMK_MAPPINGS,
} from "@/db/cpmk-2026-reference"
import { CpmkMatrixClient } from "./cpmk-matrix-client"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Peta CPMK Kurikulum 2026 | SIPEKA",
  description: "Matriks integrasi CPL, CPMK, dan Sub-CPMK Mata Kuliah Program Studi S1 Sistem Informasi",
}

export default async function PetaCpmkPage() {
  // Session authentication check
  const session = MOCK_SESSION

  return (
    <div className="space-y-6">
      <CpmkMatrixClient
        courses={CURRICULUM_2026_MATA_KULIAH}
        cpls={CURRICULUM_2026_CPL}
        cpmks={CURRICULUM_2026_CPMK}
        subCpmks={CURRICULUM_2026_SUB_CPMK}
        mappings={CURRICULUM_2026_MK_CPMK_MAPPINGS}
      />
    </div>
  )
}
