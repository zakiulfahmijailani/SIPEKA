"use client"

import { EmptyState } from "@/components/ui/empty-state"
import { BookMarked, Layers } from "lucide-react"

export function KurikulumEmpty({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon={BookMarked}
      title="Belum ada kurikulum"
      description="Kurikulum program studi belum dikonfigurasi. Tambahkan kurikulum untuk mulai menyusun mata kuliah dan CPL."
      action={onAdd ? { label: "Tambah Kurikulum", onClick: onAdd } : undefined}
    />
  )
}

export function MataKuliahEmpty({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon={Layers}
      title="Belum ada mata kuliah"
      description="Tambahkan mata kuliah ke kurikulum ini untuk mulai memetakan CPL dan CPMK."
      action={onAdd ? { label: "Tambah Mata Kuliah", onClick: onAdd } : undefined}
    />
  )
}
