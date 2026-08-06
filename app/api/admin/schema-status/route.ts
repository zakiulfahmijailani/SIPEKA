import { NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import { getSchemaStatus } from "@/lib/schema-status"

export const dynamic = "force-dynamic"

export async function GET() {
  const session = await auth()
  if (session?.user?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  return NextResponse.json(await getSchemaStatus())
}
