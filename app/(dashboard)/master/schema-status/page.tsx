import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { getSchemaStatus } from "@/lib/schema-status"
import { repairProductionSchemaAction } from "./actions"

export const dynamic = "force-dynamic"

export default async function SchemaStatusPage() {
  const session = await auth()
  if (session?.user?.role !== "SUPER_ADMIN") redirect("/dashboard")

  const status = await getSchemaStatus()

  return (
    <main className="p-8">
      <h1 className="mb-4 text-xl font-bold">Schema Status</h1>
      <pre id="schema-status" className="whitespace-pre-wrap text-sm">
        {JSON.stringify(status, null, 2)}
      </pre>
      <form action={repairProductionSchemaAction} className="mt-6">
        <button
          type="submit"
          className="rounded bg-blue-700 px-4 py-2 font-semibold text-white"
        >
          Terapkan Perbaikan Skema
        </button>
      </form>
    </main>
  )
}
