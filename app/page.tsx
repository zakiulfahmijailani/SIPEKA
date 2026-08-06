import { redirect } from "next/navigation"
import { getCurrentSession } from "@/lib/current-session"

// ---------------------------------------------------------------------------
// Auth check DISABLED — always redirect to dashboard without session check
// ---------------------------------------------------------------------------
export default async function HomePage() {
  const session = await getCurrentSession()
  redirect(session?.user ? "/dashboard" : "/login")
}
