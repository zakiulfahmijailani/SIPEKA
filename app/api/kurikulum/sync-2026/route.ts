import { NextResponse } from "next/server"

import { syncCurriculum2026 } from "@/db/sync-curriculum-2026"
import { MOCK_SESSION } from "@/lib/mock-session"

export const maxDuration = 60

export async function POST() {
  const session = MOCK_SESSION
  if (!session || !["SUPER_ADMIN", "KAPRODI"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await syncCurriculum2026()
    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    console.error("Gagal menyinkronkan kurikulum 2026:", error)
    return NextResponse.json(
      { success: false, error: "Sinkronisasi kurikulum gagal" },
      { status: 500 }
    )
  }
}
