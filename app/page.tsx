import { redirect } from "next/navigation"

// ---------------------------------------------------------------------------
// Auth check DISABLED — always redirect to dashboard without session check
// ---------------------------------------------------------------------------
export default async function HomePage() {
  redirect("/dashboard")
}
