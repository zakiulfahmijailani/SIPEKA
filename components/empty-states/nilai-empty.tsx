"use client"

import { EmptyState, EmptySearchState } from "@/components/ui/empty-state"
import { ClipboardList, BookOpen } from "lucide-react"

export function NilaiMataKuliahEmpty({
  onSelectMK,
}: {
  onSelectMK?: () => void
}) {
  return (
    <EmptyState
      icon={ClipboardList}
      title="Pilih mata kuliah terlebih dahulu"
      description="Pilih mata kuliah dan kelas untuk melihat daftar mahasiswa dan mulai memasukkan nilai."
      action={onSelectMK ? { label: "Pilih Mata Kuliah", onClick: onSelectMK } : undefined}
    />
  )
}

export function NilaiMahasiswaEmpty({
  mataKuliah,
  onInput,
}: {
  mataKuliah?: string
  onInput?: () => void
}) {
  return (
    <EmptyState
      icon={BookOpen}
      title={mataKuliah ? `Belum ada nilai untuk ${mataKuliah}` : "Belum ada nilai"}
      description="Mahasiswa terdaftar di mata kuliah ini belum memiliki nilai. Mulai input nilai sekarang."
      action={onInput ? { label: "Input Nilai", onClick: onInput } : undefined}
    />
  )
}

export function NilaiSearchEmpty({ query, onClear }: { query: string; onClear: () => void }) {
  return <EmptySearchState query={query} onClear={onClear} />
}
