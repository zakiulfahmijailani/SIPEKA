import { NextResponse } from "next/server"
import { backfillAllMissingRps } from "@/app/(dashboard)/rps/actions"
import { getCurrentSession } from "@/lib/current-session"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await getCurrentSession()
    if (!session?.user || !["SUPER_ADMIN", "KAPRODI"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await backfillAllMissingRps()
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

export async function POST() {
  try {
    const session = await getCurrentSession()
    if (!session?.user || !["SUPER_ADMIN", "KAPRODI"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await backfillAllMissingRps()
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
