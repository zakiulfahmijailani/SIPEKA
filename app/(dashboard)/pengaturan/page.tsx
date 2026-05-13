import { auth } from "@/lib/auth"
import { db } from "@/db"
import { programSettings } from "@/db/schema"
import { redirect } from "next/navigation"
import PengaturanClient from "./pengaturan-client"

export default async function PengaturanPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (session.user.role !== "SUPER_ADMIN" && session.user.role !== "KAPRODI") {
    redirect("/dashboard")
  }

  let settings = []
  try {
    settings = await db.query.programSettings.findMany()
  } catch (e) {
    console.error("Failed to fetch settings, table might be missing:", e)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-blue-900">Pengaturan Program Studi</h1>
        <p className="text-muted-foreground">Konfigurasi identitas prodi dan standar ketercapaian OBE</p>
      </div>
      <PengaturanClient initialSettings={settings} />
    </div>
  )
}
