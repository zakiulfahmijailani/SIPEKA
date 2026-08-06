"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { repairProductionSchema } from "@/lib/production-schema-repair"

export async function repairProductionSchemaAction() {
  const session = await auth()
  if (session?.user?.role !== "SUPER_ADMIN") throw new Error("Forbidden")

  await repairProductionSchema()
  revalidatePath("/master/schema-status")
  redirect("/master/schema-status?repaired=1")
}
