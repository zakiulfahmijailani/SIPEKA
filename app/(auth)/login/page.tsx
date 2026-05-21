import { redirect } from "next/navigation"

// ---------------------------------------------------------------------------
// Login page DISABLED — redirect straight to dashboard
// To restore, revert this file to original login form
// ---------------------------------------------------------------------------
export default function LoginPage() {
  redirect("/dashboard")
}
