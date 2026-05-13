import { db } from "@/db"
import { notifications } from "@/db/schema"
import { eq, desc } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId")
  if (!userId) return NextResponse.json({ success: false, error: "Missing userId" })

  try {
    const data = await db.query.notifications.findMany({
      where: eq(notifications.user_id, userId),
      orderBy: [desc(notifications.created_at)],
      limit: 20
    })
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Database error" })
  }
}
