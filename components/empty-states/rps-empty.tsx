"use client"

import { EmptyState, EmptySearchState } from "@/components/ui/empty-state"
import { FileText, PlusCircle } from "lucide-react"

export function RpsEmpty({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon={FileText}
      title="Belum ada RPS"
      description="Rencana Pembelajaran Semester (RPS) belum dibuat untuk program studi ini. Buat RPS pertama sekarang."
      action={onAdd ? { label: "Buat RPS Baru", onClick: onAdd } : undefined}
    />
  )
}

export function RpsSearchEmpty({ query, onClear }: { query: string; onClear: () => void }) {
  return <EmptySearchState query={query} onClear={onClear} />
}

export function RpsDosenEmpty() {
  return (
    <EmptyState
      icon={FileText}
      title="Belum ada RPS yang ditugaskan"
      description="Anda belum memiliki mata kuliah yang diampu semester ini. Hubungi Kaprodi jika ada kekeliruan penugasan."
    />
  )
}
