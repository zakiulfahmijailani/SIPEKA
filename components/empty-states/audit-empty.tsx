"use client"

import { EmptyState, EmptySearchState } from "@/components/ui/empty-state"
import { ShieldCheck } from "lucide-react"

export function AuditEmpty() {
  return (
    <EmptyState
      icon={ShieldCheck}
      title="Belum ada aktivitas"
      description="Log aktivitas sistem akan muncul di sini setelah ada perubahan data oleh pengguna."
    />
  )
}

export function AuditSearchEmpty({ query, onClear }: { query: string; onClear: () => void }) {
  return <EmptySearchState query={query} onClear={onClear} />
}
