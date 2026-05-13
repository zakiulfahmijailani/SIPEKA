import { db } from "@/db"
import { notifications } from "@/db/schema"
import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params
  const id = params.id

  try {
    await db.update(notifications)
      .set({ is_read: true })
      .where(eq(notifications.id, id))
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Database error" })
  }
}
