import { db } from "@/db"
import { notifications } from "@/db/schema"

export async function createNotification(data: {
  user_id: string;
  message: string;
  link?: string;
}) {
  try {
    await db.insert(notifications).values({
      user_id: data.user_id,
      message: data.message,
      link: data.link,
      is_read: false,
    })
    return { success: true }
  } catch (error) {
    console.error("Failed to create notification:", error)
    return { success: false, error }
  }
}
