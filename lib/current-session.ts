import type { Session } from "next-auth"

import { auth } from "@/lib/auth"
import { MOCK_SESSION } from "@/lib/mock-session"

export async function getCurrentSession(): Promise<Session | null> {
  const session = await auth()
  if (session?.user) return session

  if (process.env.ALLOW_DEMO_MODE === "true") {
    return MOCK_SESSION as Session
  }

  return null
}
