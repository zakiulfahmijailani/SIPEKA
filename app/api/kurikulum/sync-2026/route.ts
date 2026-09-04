import { NextResponse } from "next/server"
import { sql } from "drizzle-orm"

import { db } from "@/db"
import { syncCurriculum2026 } from "@/db/sync-curriculum-2026"
import { syncCpmkTemplates } from "@/db/sync-cpmk-templates"
import { MOCK_SESSION } from "@/lib/mock-session"

export const maxDuration = 60

export async function POST() {
  const session = MOCK_SESSION
  if (!session || !["SUPER_ADMIN", "KAPRODI"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await db.execute(sql`ALTER TABLE "cpmk_template" ADD COLUMN IF NOT EXISTS "metode_pencapaian" text`)
    const resultCurriculum = await syncCurriculum2026()
    const resultTemplates = await syncCpmkTemplates()
    return NextResponse.json({ success: true, curriculum: resultCurriculum, templates: resultTemplates })
  } catch (error) {
    console.error("Gagal menyinkronkan kurikulum 2026:", error)
    return NextResponse.json(
      { success: false, error: "Sinkronisasi kurikulum gagal", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
