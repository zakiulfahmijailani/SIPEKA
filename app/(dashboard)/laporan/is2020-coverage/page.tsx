import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Is2020CoverageClient from "../is2020-coverage-client"

export default async function Is2020ReportPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  
  // Admin/Kaprodi only for this management report
  if (session.user.role === "DOSEN" || session.user.role === "VIEWER") {
    // redirect("/dashboard")
  }

  return (
    <Is2020CoverageClient />
  )
}
